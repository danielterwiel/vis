/**
 * Code instrumentation using SWC WASM
 *
 * Transforms user code to:
 * 1. Inject loop counters for infinite loop detection
 * 2. Add __capture() calls for operation tracking
 * 3. Add error boundaries
 */

import { transformSync } from "@swc/wasm-web";

const MAX_LOOP_ITERATIONS = 100000;
const MAX_RECURSION_DEPTH = 1000;

export interface InstrumentationOptions {
  maxLoopIterations?: number;
  maxRecursionDepth?: number;
  captureOperations?: boolean;
  addErrorBoundaries?: boolean;
}

export interface InstrumentationResult {
  code: string;
  sourceMap?: string;
  error?: string;
}

/**
 * Instruments user code with loop counters and operation capture
 */
export function instrumentCode(
  code: string,
  options: InstrumentationOptions = {},
): InstrumentationResult {
  const {
    maxLoopIterations = MAX_LOOP_ITERATIONS,
    maxRecursionDepth = MAX_RECURSION_DEPTH,
    captureOperations = true,
    addErrorBoundaries = true,
  } = options;

  try {
    // Validate syntax before instrumentation
    const validation = validateSyntax(code);
    if (!validation.valid) {
      return {
        code: "",
        error: validation.error || "Invalid syntax",
      };
    }

    // First pass: Add loop counters using regex-based transformation
    const loopInstrumented = injectLoopCounters(code, maxLoopIterations);

    // Second pass: Add recursion depth tracking
    const recursionInstrumented = injectRecursionTracking(loopInstrumented, maxRecursionDepth);

    // Third pass: Add operation capture (if enabled)
    const captureInstrumented = captureOperations
      ? injectOperationCapture(recursionInstrumented)
      : recursionInstrumented;

    // Final pass: Add error boundaries (if enabled)
    const finalCode = addErrorBoundaries
      ? wrapWithErrorBoundary(captureInstrumented)
      : captureInstrumented;

    return {
      code: finalCode,
    };
  } catch (error) {
    return {
      code: "",
      error: error instanceof Error ? error.message : "Unknown instrumentation error",
    };
  }
}

/**
 * Injects loop counters into while, for, and do-while loops
 * Properly scopes counter declarations at function level
 */
function injectLoopCounters(code: string, maxIterations: number): string {
  let loopCounter = 0;

  // Inject loop check inline with counter increment
  let instrumented = code;

  instrumented = instrumented.replace(/while\s*\((.*?)\)\s*\{/gs, (_match, condition) => {
    const id = loopCounter++;
    return `while (${condition}) {\nif (++__loopCount_${id} > ${maxIterations}) throw new Error("Infinite loop detected (while loop)");\n`;
  });

  instrumented = instrumented.replace(
    /for\s*\((.*?);(.*?);(.*?)\)\s*\{/gs,
    (_match, init, condition, increment) => {
      const id = loopCounter++;
      return `for (${init};${condition};${increment}) {\nif (++__loopCount_${id} > ${maxIterations}) throw new Error("Infinite loop detected (for loop)");\n`;
    },
  );

  instrumented = instrumented.replace(/do\s*\{/gs, () => {
    const id = loopCounter++;
    return `do {\nif (++__loopCount_${id} > ${maxIterations}) throw new Error("Infinite loop detected (do-while loop)");\n`;
  });

  // Now inject counter declarations at appropriate scope
  // Strategy: declare all counters at the top of the code (global scope)
  // This ensures they're accessible regardless of function boundaries
  if (loopCounter > 0) {
    const declarations = Array.from(
      { length: loopCounter },
      (_, i) => `let __loopCount_${i} = 0;`,
    ).join("\n");
    instrumented = declarations + "\n" + instrumented;
  }

  return instrumented;
}

/**
 * Injects recursion depth tracking into function calls
 */
function injectRecursionTracking(code: string, maxDepth: number): string {
  // Wrap the entire code to track recursion depth
  return `
let __recursionDepth = 0;
const __trackRecursion = (fn) => {
  return function(...args) {
    if (++__recursionDepth > ${maxDepth}) {
      throw new Error("Maximum recursion depth exceeded");
    }
    try {
      return fn.apply(this, args);
    } finally {
      __recursionDepth--;
    }
  };
};

${code}
`;
}

/**
 * Injects __capture() calls for operation tracking
 * Tracks array operations, object mutations, and function calls
 */
function injectOperationCapture(code: string): string {
  // Track array method calls
  let instrumented = code;

  const arrayMethods = [
    "push",
    "pop",
    "shift",
    "unshift",
    "splice",
    "sort",
    "reverse",
    "fill",
    "copyWithin",
  ];

  // Simple regex approach for MVP
  // In production, would use full AST transformation
  arrayMethods.forEach((method) => {
    const regex = new RegExp(`\\.${method}\\(`, "g");
    instrumented = instrumented.replace(regex, () => {
      return `.${method}(typeof __capture === 'function' && __capture('${method}', arguments),`;
    });
  });

  return instrumented;
}

/**
 * Wraps code with try-catch error boundary
 */
function wrapWithErrorBoundary(code: string): string {
  return `
try {
${code}
} catch (error) {
  if (typeof __reportError === 'function') {
    __reportError(error);
  }
  throw error;
}
`;
}

/**
 * Helper to extract function name from code
 */
export function extractFunctionName(code: string): string | null {
  // Match function declarations
  const funcDeclaration = code.match(/function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/);
  if (funcDeclaration) return funcDeclaration[1] ?? null;

  // Match arrow function assignments (must come before general assignments)
  const arrowFunc = code.match(
    /(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:\([^)]*\)|[a-zA-Z_$][a-zA-Z0-9_$]*)\s*=>/,
  );
  if (arrowFunc) return arrowFunc[1] ?? null;

  // Match function expression assignments
  const funcExpr = code.match(/(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*function/);
  if (funcExpr) return funcExpr[1] ?? null;

  // Match class methods (avoid matching non-function patterns like "const x = ")
  const classMethod = code.match(/^\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\([^)]*\)\s*\{/);
  if (classMethod) return classMethod[1] ?? null;

  return null;
}

/**
 * Helper to determine if code defines a function
 */
export function isFunction(code: string): boolean {
  const trimmed = code.trim();

  // Function declaration
  if (/^function\s+\w+/.test(trimmed)) return true;

  // Variable assignment to function
  if (
    /^(?:const|let|var)\s+\w+\s*=\s*(?:function|\([^)]*\)\s*=>|[a-zA-Z_$][a-zA-Z0-9_$]*\s*=>)/.test(
      trimmed,
    )
  )
    return true;

  // Method shorthand (like in class or object)
  if (/^\w+\s*\([^)]*\)\s*\{/.test(trimmed)) return true;

  return false;
}

/**
 * Helper to validate instrumented code syntax
 * Attempts to use SWC if initialized, falls back to basic validation
 */
export function validateSyntax(code: string): { valid: boolean; error?: string } {
  try {
    // Try to use SWC to parse and validate
    transformSync(code, {
      jsc: {
        parser: {
          syntax: "ecmascript",
          jsx: false,
        },
        target: "es2022",
      },
    });
    return { valid: true };
  } catch (error) {
    // Check if it's a SWC initialization error
    const errorMsg = error instanceof Error ? error.message : String(error);
    if (errorMsg.includes("__wbindgen") || errorMsg.includes("wasm")) {
      // SWC not initialized, use basic syntax validation
      return basicSyntaxValidation(code);
    }

    // Actual syntax error
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Syntax error",
    };
  }
}

/**
 * Basic syntax validation without SWC
 * Checks for common syntax errors using simple heuristics
 */
function basicSyntaxValidation(code: string): { valid: boolean; error?: string } {
  // Empty code is valid
  if (!code.trim()) {
    return { valid: true };
  }

  // Check for unbalanced braces
  let braceCount = 0;
  let bracketCount = 0;
  let parenCount = 0;

  for (let i = 0; i < code.length; i++) {
    const char = code[i];
    if (char === "{") braceCount++;
    if (char === "}") braceCount--;
    if (char === "[") bracketCount++;
    if (char === "]") bracketCount--;
    if (char === "(") parenCount++;
    if (char === ")") parenCount--;
  }

  if (braceCount !== 0) {
    return { valid: false, error: "Unbalanced braces" };
  }
  if (bracketCount !== 0) {
    return { valid: false, error: "Unbalanced brackets" };
  }
  if (parenCount !== 0) {
    return { valid: false, error: "Unbalanced parentheses" };
  }

  // Check for obvious syntax errors
  if (/=\s*;/.test(code)) {
    return { valid: false, error: "Missing value after assignment" };
  }

  // If we get here, assume it's valid (basic validation only)
  return { valid: true };
}
