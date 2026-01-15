/**
 * Test case types for client-side testing
 *
 * Each data structure includes 3 test cases at different difficulty levels.
 * Tests run entirely client-side using Vitest's expect in a sandboxed iframe.
 */

import type { VisualizationStep } from "../../store/useAppStore";

/**
 * Difficulty level for test cases
 */
export type DifficultyLevel = "easy" | "medium" | "hard";

/**
 * Test case definition for a data structure challenge
 */
export interface TestCase {
  /** Unique identifier for this test case */
  id: string;

  /** Human-readable name */
  name: string;

  /** Difficulty level */
  difficulty: DifficultyLevel;

  /** Description of what the user needs to implement */
  description: string;

  /** Initial data structure state (JSON-serializable) */
  initialData: unknown;

  /** Additional arguments to pass to the function after the initial data */
  additionalArgs?: unknown[];

  /** Expected final state after user code runs (JSON-serializable) */
  expectedOutput: unknown;

  /** Vitest expect assertion code (runs in sandbox) */
  assertions: string;

  /** Reference solution (for "Show Solution" feature) */
  referenceSolution: string;

  /** Skeleton code with TODOs for user to fill in */
  skeletonCode: string;

  /** Hints (progressively revealed) */
  hints: string[];

  /** Acceptance criteria for objective pass/fail conditions */
  acceptanceCriteria: string[];
}

/**
 * Result from running a test case
 */
export interface TestResult {
  /** Test case ID that was run */
  testId: string;

  /** Whether the test passed */
  passed: boolean;

  /** Error message if test failed */
  error?: string;

  /** Execution time in milliseconds */
  executionTime: number;

  /** Captured visualization steps */
  steps: VisualizationStep[];

  /** Console output from user code */
  consoleLogs: Array<{ level: string; args: unknown[] }>;
}

/**
 * Options for running tests
 */
export interface TestRunOptions {
  /** Timeout in milliseconds (default: 5000) */
  timeout?: number;

  /** Maximum loop iterations before throwing (default: 100000) */
  maxLoopIterations?: number;

  /** Maximum recursion depth (default: 1000) */
  maxRecursionDepth?: number;

  /** Whether to capture visualization steps (default: true) */
  captureSteps?: boolean;

  /** Whether to capture console logs (default: true) */
  captureLogs?: boolean;
}
