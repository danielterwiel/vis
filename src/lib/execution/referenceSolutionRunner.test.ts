import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  runReferenceSolution,
  validateReferenceSolution,
  getExpectedOutputDescription,
  getReferenceSolutionDescription,
} from "./referenceSolutionRunner";
import type { TestCase } from "../testing/types";

// Mock the stepCapture module
vi.mock("./stepCapture", () => ({
  captureSteps: vi.fn(),
}));

import { captureSteps } from "./stepCapture";

describe("referenceSolutionRunner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createMockTestCase = (overrides?: Partial<TestCase>): TestCase => ({
    id: "test-1",
    name: "Test Case",
    difficulty: "easy",
    description: "Test description",
    initialData: [1, 2, 3],
    expectedOutput: [1, 2, 3],
    assertions: "expect(result).toEqual([1, 2, 3]);",
    referenceSolution: "function sort(arr) { return arr; }",
    skeletonCode: "function sort(arr) { /* TODO */ }",
    hints: ["Hint 1"],
    acceptanceCriteria: ["Criteria 1"],
    ...overrides,
  });

  describe("runReferenceSolution", () => {
    it("should execute reference solution and return steps on success", async () => {
      const testCase = createMockTestCase();
      const mockSteps = [
        {
          type: "push",
          target: "array",
          args: [5],
          result: [1, 2, 3, 5],
          timestamp: Date.now(),
        },
      ];

      vi.mocked(captureSteps).mockResolvedValue({
        success: true,
        steps: mockSteps,
        consoleLogs: [],
        executionTime: 100,
      });

      const result = await runReferenceSolution(testCase);

      expect(result.success).toBe(true);
      expect(result.steps).toEqual(mockSteps);
      expect(result.error).toBeUndefined();
      expect(result.executionTime).toBeGreaterThanOrEqual(0);
    });

    it("should return error when execution fails", async () => {
      const testCase = createMockTestCase();

      vi.mocked(captureSteps).mockResolvedValue({
        success: false,
        steps: [],
        consoleLogs: [],
        executionTime: 50,
        error: "Execution failed",
      });

      const result = await runReferenceSolution(testCase);

      expect(result.success).toBe(false);
      expect(result.steps).toEqual([]);
      expect(result.error).toBe("Execution failed");
    });

    it("should handle exceptions during execution", async () => {
      const testCase = createMockTestCase();

      vi.mocked(captureSteps).mockRejectedValue(new Error("Crash!"));

      const result = await runReferenceSolution(testCase);

      expect(result.success).toBe(false);
      expect(result.steps).toEqual([]);
      expect(result.error).toBe("Crash!");
    });

    it("should pass options to captureSteps", async () => {
      const testCase = createMockTestCase();

      vi.mocked(captureSteps).mockResolvedValue({
        success: true,
        steps: [],
        consoleLogs: [],
        executionTime: 100,
      });

      await runReferenceSolution(testCase, {
        timeout: 3000,
      });

      // Check that captureSteps was called with custom timeout
      expect(captureSteps).toHaveBeenCalledWith(
        expect.objectContaining({
          timeout: 3000,
        }),
      );
      // Check that the code includes the reference solution
      const calledCode = vi.mocked(captureSteps).mock.calls[0]?.[0]?.code;
      expect(calledCode).toContain("function sort(arr) { return arr; }");
    });

    it("should use default options when not provided", async () => {
      const testCase = createMockTestCase();

      vi.mocked(captureSteps).mockResolvedValue({
        success: true,
        steps: [],
        consoleLogs: [],
        executionTime: 100,
      });

      await runReferenceSolution(testCase);

      // Check that captureSteps was called with default timeout
      expect(captureSteps).toHaveBeenCalledWith(
        expect.objectContaining({
          timeout: 5000,
        }),
      );
      // Check that the code includes the reference solution and initialData
      const calledCode = vi.mocked(captureSteps).mock.calls[0]?.[0]?.code;
      expect(calledCode).toContain("function sort(arr) { return arr; }");
      expect(calledCode).toContain("initialData");
      expect(calledCode).toContain("TrackedArray");
    });

    it("should capture console logs", async () => {
      const testCase = createMockTestCase();
      const mockLogs = [
        { level: "log", args: ["test"], timestamp: Date.now() },
        { level: "warn", args: ["warning"], timestamp: Date.now() },
      ];

      vi.mocked(captureSteps).mockResolvedValue({
        success: true,
        steps: [],
        consoleLogs: mockLogs,
        executionTime: 100,
      });

      const result = await runReferenceSolution(testCase);

      expect(result.consoleLogs).toEqual(mockLogs);
    });

    it("should measure execution time", async () => {
      const testCase = createMockTestCase();

      vi.mocked(captureSteps).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                success: true,
                steps: [],
                consoleLogs: [],
                executionTime: 100,
              });
            }, 50);
          }),
      );

      const result = await runReferenceSolution(testCase);

      expect(result.executionTime).toBeGreaterThanOrEqual(50);
    });

    it("should handle unknown errors", async () => {
      const testCase = createMockTestCase();

      vi.mocked(captureSteps).mockRejectedValue("String error");

      const result = await runReferenceSolution(testCase);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Unknown error");
    });
  });

  describe("validateReferenceSolution", () => {
    it("should return true for valid reference solution", () => {
      const testCase = createMockTestCase();
      expect(validateReferenceSolution(testCase)).toBe(true);
    });

    it("should return false if referenceSolution is missing", () => {
      const testCase = createMockTestCase({
        referenceSolution: undefined as unknown as string,
      });
      expect(validateReferenceSolution(testCase)).toBe(false);
    });

    it("should return false if referenceSolution is not a string", () => {
      const testCase = createMockTestCase({
        referenceSolution: 123 as unknown as string,
      });
      expect(validateReferenceSolution(testCase)).toBe(false);
    });

    it("should return false if referenceSolution is empty", () => {
      const testCase = createMockTestCase({
        referenceSolution: "",
      });
      expect(validateReferenceSolution(testCase)).toBe(false);
    });

    it("should return false if referenceSolution is only whitespace", () => {
      const testCase = createMockTestCase({
        referenceSolution: "   \n\t  ",
      });
      expect(validateReferenceSolution(testCase)).toBe(false);
    });
  });

  describe("getExpectedOutputDescription", () => {
    it("should return description for easy test", () => {
      const testCase = createMockTestCase({ difficulty: "easy" });
      const description = getExpectedOutputDescription(testCase);

      expect(description).toContain("easy");
      expect(description).toContain("SHOULD behave");
      expect(description).toContain("hidden");
    });

    it("should return description for medium test", () => {
      const testCase = createMockTestCase({ difficulty: "medium" });
      const description = getExpectedOutputDescription(testCase);

      expect(description).toContain("medium");
    });

    it("should return description for hard test", () => {
      const testCase = createMockTestCase({ difficulty: "hard" });
      const description = getExpectedOutputDescription(testCase);

      expect(description).toContain("hard");
    });
  });

  describe("getReferenceSolutionDescription", () => {
    it("should return description for easy test", () => {
      const testCase = createMockTestCase({ difficulty: "easy" });
      const description = getReferenceSolutionDescription(testCase);

      expect(description).toContain("easy");
      expect(description).toContain("reference solution");
      expect(description).toContain("answer");
    });

    it("should return description for medium test", () => {
      const testCase = createMockTestCase({ difficulty: "medium" });
      const description = getReferenceSolutionDescription(testCase);

      expect(description).toContain("medium");
    });

    it("should return description for hard test", () => {
      const testCase = createMockTestCase({ difficulty: "hard" });
      const description = getReferenceSolutionDescription(testCase);

      expect(description).toContain("hard");
    });
  });
});
