/**
 * Client-side test runner
 *
 * Executes test cases in a sandboxed iframe using instrumented user code
 * and Vitest expect assertions. Captures steps, console logs, and test results.
 */

import { captureSteps } from "../execution/stepCapture";
import { bundleExpect } from "./expectBundle";
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
    // Step 1: Extract the main function name to call
    const functionName = extractMainFunction(userCode);
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

    // Step 2: Build the complete sandbox code
    const expectCode = bundleExpect();
    const sandboxCode = `
      ${expectCode}

      // User's code
      ${userCode}

      // Initialize with test data
      const input = ${JSON.stringify(testCase.initialData)};

      // Execute user's function
      const result = ${functionName}(input);

      // Run test assertions
      ${testCase.assertions}
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
