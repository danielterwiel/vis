/**
 * Reference Solution Runner
 *
 * Executes reference solutions from test cases to generate expected output steps.
 * Used for "Expected Output" and "Reference Solution" visualization modes.
 */

import type { TestCase } from "../testing/types";
import type { VisualizationStep } from "../../store/useAppStore";
import { captureSteps } from "./stepCapture";

export interface ReferenceSolutionResult {
  success: boolean;
  steps: VisualizationStep[];
  error?: string;
  executionTime: number;
  consoleLogs: Array<{ level: string; args: unknown[] }>;
}

/**
 * Run a reference solution to capture expected output steps.
 *
 * @param testCase - The test case containing the reference solution
 * @param options - Optional configuration for execution
 * @returns Result containing captured steps or error
 */
export async function runReferenceSolution(
  testCase: TestCase,
  options: {
    timeout?: number;
    maxLoopIterations?: number;
    maxRecursionDepth?: number;
  } = {},
): Promise<ReferenceSolutionResult> {
  const startTime = Date.now();

  try {
    // Execute reference solution with step capture
    const result = await captureSteps({
      code: testCase.referenceSolution,
      timeout: options.timeout || 5000,
    });

    if (!result.success) {
      return {
        success: false,
        steps: [],
        error: result.error || "Reference solution execution failed",
        executionTime: Date.now() - startTime,
        consoleLogs: result.consoleLogs,
      };
    }

    return {
      success: true,
      steps: result.steps,
      executionTime: Date.now() - startTime,
      consoleLogs: result.consoleLogs,
    };
  } catch (error) {
    return {
      success: false,
      steps: [],
      error: error instanceof Error ? error.message : "Unknown error",
      executionTime: Date.now() - startTime,
      consoleLogs: [],
    };
  }
}

/**
 * Validate that a reference solution can be executed.
 *
 * @param testCase - The test case to validate
 * @returns True if reference solution is valid
 */
export function validateReferenceSolution(testCase: TestCase): boolean {
  if (!testCase.referenceSolution) {
    return false;
  }

  if (typeof testCase.referenceSolution !== "string") {
    return false;
  }

  if (testCase.referenceSolution.trim().length === 0) {
    return false;
  }

  return true;
}

/**
 * Get a human-readable description of the expected output mode.
 *
 * @param testCase - The test case to describe
 * @returns Description string
 */
export function getExpectedOutputDescription(testCase: TestCase): string {
  return `Watch how the algorithm SHOULD behave for this ${testCase.difficulty} problem. Implementation details are hidden.`;
}

/**
 * Get a human-readable description of the reference solution mode.
 *
 * @param testCase - The test case to describe
 * @returns Description string
 */
export function getReferenceSolutionDescription(testCase: TestCase): string {
  return `See the complete reference solution for this ${testCase.difficulty} problem. This reveals the answer.`;
}
