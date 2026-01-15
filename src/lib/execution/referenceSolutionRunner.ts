/**
 * Reference Solution Runner
 *
 * Executes reference solutions from test cases to generate expected output steps.
 * Used for "Expected Output" and "Reference Solution" visualization modes.
 */

import type { TestCase } from "../testing/types";
import type { VisualizationStep } from "../../store/useAppStore";
import { captureSteps } from "./stepCapture";
import { bundleExpect } from "../testing/expectBundle";
import { bundleTrackedArray } from "../testing/trackedArrayBundle";
import { bundleTrackedLinkedList } from "../testing/trackedLinkedListBundle";
import { bundleTrackedStack } from "../testing/trackedStackBundle";
import { bundleTrackedQueue } from "../testing/trackedQueueBundle";
import { bundleTrackedBinaryTree } from "../testing/trackedBinaryTreeBundle";
import { bundleTrackedGraph } from "../testing/trackedGraphBundle";
import { bundleTrackedHashMap } from "../testing/trackedHashMapBundle";

export interface ReferenceSolutionResult {
  success: boolean;
  steps: VisualizationStep[];
  error?: string;
  executionTime: number;
  consoleLogs: Array<{ level: string; args: unknown[] }>;
}

/**
 * Extracts the main function name from code
 */
function extractMainFunction(code: string): string | null {
  const funcMatch = code.match(/function\s+(\w+)\s*\(/);
  if (funcMatch && funcMatch[1]) return funcMatch[1];

  const arrowMatch = code.match(/const\s+(\w+)\s*=\s*\([^)]*\)\s*=>/);
  if (arrowMatch && arrowMatch[1]) return arrowMatch[1];

  const exprMatch = code.match(/const\s+(\w+)\s*=\s*function/);
  if (exprMatch && exprMatch[1]) return exprMatch[1];

  return null;
}

/**
 * Gets the appropriate data structure bundle code based on test case ID
 */
function getDataStructureBundle(testId: string): {
  bundleCode: string;
  className: string;
} {
  if (testId.startsWith("array-")) {
    return {
      bundleCode: bundleTrackedArray(),
      className: "TrackedArray",
    };
  } else if (testId.startsWith("linkedlist-")) {
    return {
      bundleCode: bundleTrackedLinkedList(),
      className: "TrackedLinkedList",
    };
  } else if (testId.startsWith("stack-")) {
    return {
      bundleCode: bundleTrackedStack() + "\n" + bundleTrackedQueue(),
      className: "TrackedStack",
    };
  } else if (testId.startsWith("queue-")) {
    return {
      bundleCode: bundleTrackedQueue() + "\n" + bundleTrackedStack(),
      className: "TrackedQueue",
    };
  } else if (testId.startsWith("tree-") || testId.startsWith("binarytree-")) {
    return {
      bundleCode: bundleTrackedBinaryTree(),
      className: "TrackedBinaryTree",
    };
  } else if (testId.startsWith("graph-")) {
    return {
      bundleCode: bundleTrackedGraph(),
      className: "TrackedGraph",
    };
  } else if (testId.startsWith("hashmap-")) {
    return {
      bundleCode: bundleTrackedHashMap(),
      className: "TrackedHashMap",
    };
  }

  return {
    bundleCode: bundleTrackedArray(),
    className: "TrackedArray",
  };
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
    // Extract function name from reference solution
    const functionName = extractMainFunction(testCase.referenceSolution);
    if (!functionName) {
      return {
        success: false,
        steps: [],
        error: "Could not find function in reference solution",
        executionTime: Date.now() - startTime,
        consoleLogs: [],
      };
    }

    // Get appropriate data structure bundle
    const expectCode = bundleExpect();
    const dsBundle = getDataStructureBundle(testCase.id);

    // Determine input initialization based on data structure type
    const isStackOrQueue = testCase.id.startsWith("stack-") || testCase.id.startsWith("queue-");
    const isGraph = testCase.id.startsWith("graph-");
    const isHashMap = testCase.id.startsWith("hashmap-");

    let inputInitCode: string;
    if (isStackOrQueue || isHashMap) {
      inputInitCode = `const input = initialData;`;
    } else if (isGraph) {
      inputInitCode = `const input = TrackedGraph.from(
        initialData.vertices || [],
        initialData.edges || [],
        initialData.directed || false,
        typeof __capture === 'function' ? __capture : undefined
      );`;
    } else {
      inputInitCode = `const input = Array.isArray(initialData)
        ? new ${dsBundle.className}(initialData, typeof __capture === 'function' ? __capture : undefined)
        : initialData;`;
    }

    // Build complete sandbox code
    const sandboxCode = `
      ${expectCode}
      ${dsBundle.bundleCode}

      // Reference solution code
      ${testCase.referenceSolution}

      // Initialize with test data
      const initialData = ${JSON.stringify(testCase.initialData)};
      const additionalArgs = ${JSON.stringify(testCase.additionalArgs || [])};

      // Prepare input based on data structure type
      ${inputInitCode}

      // Execute reference solution with input and any additional arguments
      const result = ${functionName}(input, ...additionalArgs);
    `;

    // Execute reference solution with step capture
    const result = await captureSteps({
      code: sandboxCode,
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
