/**
 * Client-side test runner
 *
 * Executes test cases in a sandboxed iframe using instrumented user code
 * and Vitest expect assertions. Captures steps, console logs, and test results.
 */

import { captureSteps } from "../execution/stepCapture";
import { bundleExpect } from "./expectBundle";
import { bundleTrackedArray } from "./trackedArrayBundle";
import { bundleTrackedLinkedList } from "./trackedLinkedListBundle";
import { bundleTrackedStack } from "./trackedStackBundle";
import { bundleTrackedQueue } from "./trackedQueueBundle";
import { bundleTrackedBinaryTree } from "./trackedBinaryTreeBundle";
import { bundleTrackedGraph } from "./trackedGraphBundle";
import { bundleTrackedHashMap } from "./trackedHashMapBundle";
import type { TestCase, TestResult, TestRunOptions } from "./types";
import type { VisualizationStep } from "../../store/useAppStore";

/**
 * Default test run options
 */
const DEFAULT_OPTIONS: Required<TestRunOptions> = {
  timeout: 5000,
  maxLoopIterations: 100000,
  maxRecursionDepth: 1000,
  captureSteps: true,
  captureLogs: true,
};

/**
 * Extracts the main function name from user code
 * Used to determine what function to call with test data
 *
 * @param code - User code to analyze
 * @returns Function name or null if not found
 */
function extractMainFunction(code: string): string | null {
  // Look for function declarations
  const funcMatch = code.match(/function\s+(\w+)\s*\(/);
  if (funcMatch && funcMatch[1]) return funcMatch[1];

  // Look for arrow function assignments
  const arrowMatch = code.match(/const\s+(\w+)\s*=\s*\([^)]*\)\s*=>/);
  if (arrowMatch && arrowMatch[1]) return arrowMatch[1];

  // Look for function expression assignments
  const exprMatch = code.match(/const\s+(\w+)\s*=\s*function/);
  if (exprMatch && exprMatch[1]) return exprMatch[1];

  return null;
}

/**
 * Gets the appropriate data structure bundle code based on test case ID
 * Test IDs follow pattern: {dataStructure}-{operation}-{difficulty}
 *
 * @param testId - Test case identifier
 * @returns Object with bundle code and data structure info
 */
function getDataStructureBundle(testId: string): {
  bundleCode: string;
  className: string;
  createFunction: string;
} {
  // Extract data structure type from test ID
  if (testId.startsWith("array-")) {
    return {
      bundleCode: bundleTrackedArray(),
      className: "TrackedArray",
      createFunction: "createTrackedArray",
    };
  } else if (testId.startsWith("linkedlist-")) {
    return {
      bundleCode: bundleTrackedLinkedList(),
      className: "TrackedLinkedList",
      createFunction: "createTrackedLinkedList",
    };
  } else if (testId.startsWith("stack-")) {
    // Include both Stack and Queue bundles since Stack tests may use queues (e.g., queue-using-stacks)
    return {
      bundleCode: bundleTrackedStack() + "\n" + bundleTrackedQueue(),
      className: "TrackedStack",
      createFunction: "createTrackedStack",
    };
  } else if (testId.startsWith("queue-")) {
    // Include both Stack and Queue bundles since Queue tests may use stacks (e.g., reverse-first-k)
    return {
      bundleCode: bundleTrackedQueue() + "\n" + bundleTrackedStack(),
      className: "TrackedQueue",
      createFunction: "createTrackedQueue",
    };
  } else if (testId.startsWith("tree-") || testId.startsWith("binarytree-")) {
    return {
      bundleCode: bundleTrackedBinaryTree(),
      className: "TrackedBinaryTree",
      createFunction: "createTrackedBinaryTree",
    };
  } else if (testId.startsWith("graph-")) {
    return {
      bundleCode: bundleTrackedGraph(),
      className: "TrackedGraph",
      createFunction: "createTrackedGraph",
    };
  } else if (testId.startsWith("hashmap-")) {
    return {
      bundleCode: bundleTrackedHashMap(),
      className: "TrackedHashMap",
      createFunction: "createTrackedHashMap",
    };
  }

  // Default to TrackedArray for backward compatibility
  return {
    bundleCode: bundleTrackedArray(),
    className: "TrackedArray",
    createFunction: "createTrackedArray",
  };
}

/**
 * Runs a single test case against user code
 *
 * @param userCode - User's implementation code
 * @param testCase - Test case to run
 * @param options - Test run options
 * @returns Test result with pass/fail status and captured data
 */
export async function runTest(
  userCode: string,
  testCase: TestCase,
  options: TestRunOptions = {},
): Promise<TestResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const startTime = Date.now();

  try {
    // Step 1: Determine the function name to call
    // First, try to get the expected function name from the test case's reference solution
    // This ensures we call the correct function when multiple functions are defined
    const expectedFunctionName = testCase.referenceSolution
      ? extractMainFunction(testCase.referenceSolution)
      : null;

    // Check if the user code contains the expected function
    const userFunctionName = extractMainFunction(userCode);

    // Use the expected function name if it exists in user code, otherwise use the first function found
    const functionName =
      expectedFunctionName && userCode.includes(`function ${expectedFunctionName}`)
        ? expectedFunctionName
        : userFunctionName;

    if (!functionName) {
      return {
        testId: testCase.id,
        passed: false,
        error: "Could not find a function to test. Please define a function in your code.",
        executionTime: Date.now() - startTime,
        steps: [],
        consoleLogs: [],
      };
    }

    // Step 2: Build the complete sandbox code with appropriate data structure bundle
    const expectCode = bundleExpect();
    const dsBundle = getDataStructureBundle(testCase.id);

    // Determine how input should be prepared based on data structure type
    const isStackOrQueue = testCase.id.startsWith("stack-") || testCase.id.startsWith("queue-");
    const isGraph = testCase.id.startsWith("graph-");

    // Build the input initialization code based on data structure type
    let inputInitCode: string;
    if (isStackOrQueue) {
      // Stack/Queue tests receive raw input - they create their own tracked data structures
      inputInitCode = `const input = initialData;`;
    } else if (isGraph) {
      // Graph tests need special handling - construct graph from vertices/edges/directed
      inputInitCode = `const input = TrackedGraph.from(
        initialData.vertices || [],
        initialData.edges || [],
        initialData.directed || false,
        typeof __capture === 'function' ? __capture : undefined
      );`;
    } else {
      // Other data structures (array, linkedlist, tree, hashmap) - wrap in tracked class
      inputInitCode = `const input = Array.isArray(initialData)
        ? new ${dsBundle.className}(initialData, typeof __capture === 'function' ? __capture : undefined)
        : initialData;`;
    }

    const sandboxCode = `
      ${expectCode}
      ${dsBundle.bundleCode}

      // User's code
      ${userCode}

      // Initialize with test data
      const initialData = ${JSON.stringify(testCase.initialData)};
      const additionalArgs = ${JSON.stringify(testCase.additionalArgs || [])};
      // Prepare input based on data structure type
      ${inputInitCode}

      // Execute user's function with input and any additional arguments
      const result = ${functionName}(input, ...additionalArgs);

      // Extract final data if tracked data structure
      const finalResult = result instanceof ${dsBundle.className} ? result.getData?.() || result.toArray?.() || result :
                          (Array.isArray(result) ? result : result);

      // Run test assertions (use finalResult for comparisons)
      ${testCase.assertions.replace(/\bresult\b/g, "finalResult")}
    `;

    // Step 3: Execute in sandbox with step capture
    const steps: VisualizationStep[] = [];
    const consoleLogs: Array<{ level: string; args: unknown[] }> = [];

    const captureResult = await captureSteps({
      code: sandboxCode,
      timeout: opts.timeout,
      onStepCaptured: opts.captureSteps
        ? (step: VisualizationStep) => {
            steps.push(step);
          }
        : undefined,
      onConsoleLog: opts.captureLogs
        ? (level: string, args: unknown[]) => {
            consoleLogs.push({ level, args });
          }
        : undefined,
    });

    // Step 4: Check execution result
    if (!captureResult.success) {
      return {
        testId: testCase.id,
        passed: false,
        error: captureResult.error,
        executionTime: captureResult.executionTime,
        steps: captureResult.steps,
        consoleLogs: captureResult.consoleLogs.map((log) => ({
          level: log.level,
          args: log.args,
        })),
      };
    }

    // Test passed!
    return {
      testId: testCase.id,
      passed: true,
      executionTime: captureResult.executionTime,
      steps: captureResult.steps,
      consoleLogs: captureResult.consoleLogs.map((log) => ({
        level: log.level,
        args: log.args,
      })),
    };
  } catch (error) {
    return {
      testId: testCase.id,
      passed: false,
      error: error instanceof Error ? error.message : String(error),
      executionTime: Date.now() - startTime,
      steps: [],
      consoleLogs: [],
    };
  }
}

/**
 * Runs multiple test cases in sequence
 *
 * @param userCode - User's implementation code
 * @param testCases - Array of test cases to run
 * @param options - Test run options
 * @returns Array of test results
 */
export async function runTests(
  userCode: string,
  testCases: TestCase[],
  options: TestRunOptions = {},
): Promise<TestResult[]> {
  const results: TestResult[] = [];

  for (const testCase of testCases) {
    const result = await runTest(userCode, testCase, options);
    results.push(result);
  }

  return results;
}

/**
 * Runs all test cases for a specific difficulty level
 *
 * @param userCode - User's implementation code
 * @param testCases - All available test cases
 * @param difficulty - Difficulty level to run
 * @param options - Test run options
 * @returns Array of test results
 */
export async function runTestsByDifficulty(
  userCode: string,
  testCases: TestCase[],
  difficulty: "easy" | "medium" | "hard",
  options: TestRunOptions = {},
): Promise<TestResult[]> {
  const filtered = testCases.filter((tc) => tc.difficulty === difficulty);
  return runTests(userCode, filtered, options);
}

/**
 * Validates user code against a test case without running it
 * Useful for checking if code is complete enough to run
 *
 * @param userCode - User's implementation code
 * @returns Validation result
 */
export function validateUserCode(userCode: string): {
  valid: boolean;
  error?: string;
} {
  // Check if code is not empty
  if (!userCode.trim()) {
    return {
      valid: false,
      error: "Code is empty. Please write some code to test.",
    };
  }

  // Check if there's a function definition
  const functionName = extractMainFunction(userCode);
  if (!functionName) {
    return {
      valid: false,
      error: "No function found. Please define a function to test.",
    };
  }

  // Basic syntax validation (will be caught by instrumenter anyway)
  const openBraces = (userCode.match(/{/g) || []).length;
  const closeBraces = (userCode.match(/}/g) || []).length;
  if (openBraces !== closeBraces) {
    return {
      valid: false,
      error: "Syntax error: Unbalanced braces { }",
    };
  }

  const openParens = (userCode.match(/\(/g) || []).length;
  const closeParens = (userCode.match(/\)/g) || []).length;
  if (openParens !== closeParens) {
    return {
      valid: false,
      error: "Syntax error: Unbalanced parentheses ( )",
    };
  }

  return { valid: true };
}
