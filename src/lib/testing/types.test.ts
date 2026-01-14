/**
 * Test suite for testing types
 */

import { describe, it, expect } from "vitest";
import type { TestCase, TestResult, TestRunOptions, DifficultyLevel } from "./types";

describe("testing types", () => {
  it("should export DifficultyLevel type", () => {
    const easy: DifficultyLevel = "easy";
    const medium: DifficultyLevel = "medium";
    const hard: DifficultyLevel = "hard";

    expect(easy).toBe("easy");
    expect(medium).toBe("medium");
    expect(hard).toBe("hard");
  });

  it("should support TestCase interface", () => {
    const testCase: TestCase = {
      id: "test-1",
      name: "Test Name",
      difficulty: "easy",
      description: "Test description",
      initialData: [1, 2, 3],
      expectedOutput: [3, 2, 1],
      assertions: "expect(result).toEqual([3, 2, 1]);",
      referenceSolution: "function reverse(arr) { return arr.reverse(); }",
      skeletonCode: "function reverse(arr) { /* TODO */ }",
      hints: ["Hint 1", "Hint 2"],
      acceptanceCriteria: ["Criteria 1", "Criteria 2"],
    };

    expect(testCase.id).toBe("test-1");
    expect(testCase.difficulty).toBe("easy");
  });

  it("should support TestResult interface", () => {
    const result: TestResult = {
      testId: "test-1",
      passed: true,
      executionTime: 100,
      steps: [],
      consoleLogs: [],
    };

    expect(result.testId).toBe("test-1");
    expect(result.passed).toBe(true);
  });

  it("should support TestResult with error", () => {
    const result: TestResult = {
      testId: "test-1",
      passed: false,
      error: "Test failed",
      executionTime: 50,
      steps: [],
      consoleLogs: [],
    };

    expect(result.passed).toBe(false);
    expect(result.error).toBe("Test failed");
  });

  it("should support TestRunOptions interface", () => {
    const options: TestRunOptions = {
      timeout: 5000,
      maxLoopIterations: 100000,
      maxRecursionDepth: 1000,
      captureSteps: true,
      captureLogs: true,
    };

    expect(options.timeout).toBe(5000);
    expect(options.captureSteps).toBe(true);
  });

  it("should support partial TestRunOptions", () => {
    const options: TestRunOptions = {
      timeout: 10000,
    };

    expect(options.timeout).toBe(10000);
    expect(options.maxLoopIterations).toBeUndefined();
  });
});
