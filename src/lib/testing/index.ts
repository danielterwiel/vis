/**
 * Client-side testing module
 *
 * Exports test runner, types, and utilities for running tests
 * in a sandboxed environment with Vitest expect assertions.
 */

export { runTest, runTests, runTestsByDifficulty, validateUserCode } from "./testRunner";

export { bundleExpect, expect } from "./expectBundle";

export { bundleTrackedArray } from "./trackedArrayBundle";

export { bundleTrackedLinkedList } from "./trackedLinkedListBundle";

export { bundleTrackedStack } from "./trackedStackBundle";

export { bundleTrackedQueue } from "./trackedQueueBundle";

export { bundleTrackedBinaryTree } from "./trackedBinaryTreeBundle";

export { bundleTrackedGraph } from "./trackedGraphBundle";

export type { TestCase, TestResult, TestRunOptions, DifficultyLevel } from "./types";
