/**
 * Test suite for test runner
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { runTest, runTests, runTestsByDifficulty, validateUserCode } from "./testRunner";
import type { TestCase } from "./types";

// Mock the execution modules
vi.mock("../execution/stepCapture", () => ({
  captureSteps: vi.fn(),
}));

vi.mock("./expectBundle", () => ({
  bundleExpect: vi.fn(() => "// expect mock"),
}));

// Import mocked modules
import { captureSteps } from "../execution/stepCapture";

const mockCaptureSteps = captureSteps as ReturnType<typeof vi.fn>;

describe("testRunner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("validateUserCode", () => {
    it("should reject empty code", () => {
      const result = validateUserCode("");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("empty");
    });

    it("should reject code with only whitespace", () => {
      const result = validateUserCode("   \n  \t  ");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("empty");
    });

    it("should reject code without function definition", () => {
      const result = validateUserCode("const x = 5;");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("No function found");
    });

    it("should accept code with function declaration", () => {
      const result = validateUserCode("function test() { return 1; }");
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should accept code with arrow function", () => {
      const result = validateUserCode("const test = () => 1;");
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should accept code with function expression", () => {
      const result = validateUserCode("const test = function() { return 1; };");
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should reject code with unbalanced braces", () => {
      const result = validateUserCode("function test() { return 1; ");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Unbalanced braces");
    });

    it("should reject code with unbalanced parentheses", () => {
      const result = validateUserCode("function test( { return 1; }");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Unbalanced parentheses");
    });
  });

  describe("runTest", () => {
    const mockTestCase: TestCase = {
      id: "test-1",
      name: "Test Case 1",
      difficulty: "easy",
      description: "Test description",
      initialData: [1, 2, 3],
      expectedOutput: [3, 2, 1],
      assertions: "expect(result).toEqual([3, 2, 1]);",
      referenceSolution: "function reverse(arr) { return arr.reverse(); }",
      skeletonCode: "function reverse(arr) { /* TODO */ }",
      hints: ["Try using the reverse method"],
      acceptanceCriteria: ["Returns reversed array"],
    };

    it("should run a test successfully when code passes", async () => {
      const userCode = "function reverse(arr) { return arr.reverse(); }";

      mockCaptureSteps.mockResolvedValue({
        success: true,
        steps: [],
        executionTime: 100,
        consoleLogs: [],
      });

      const result = await runTest(userCode, mockTestCase);

      expect(result.testId).toBe("test-1");
      expect(result.passed).toBe(true);
      expect(result.error).toBeUndefined();
      expect(result.executionTime).toBeGreaterThan(0);
    });

    it("should fail test when execution has error", async () => {
      const userCode = "function reverse(arr) { return arr.reverse(); }";

      mockCaptureSteps.mockResolvedValue({
        success: false,
        error: "Test failed: expected [1,2,3] to equal [3,2,1]",
        steps: [],
        executionTime: 50,
        consoleLogs: [],
      });

      const result = await runTest(userCode, mockTestCase);

      expect(result.passed).toBe(false);
      expect(result.error).toContain("Test failed");
    });

    it("should fail test when no function found", async () => {
      const userCode = "const x = 5;";

      const result = await runTest(userCode, mockTestCase);

      expect(result.passed).toBe(false);
      expect(result.error).toContain("Could not find a function");
    });

    it("should handle infinite loop errors (while loop)", async () => {
      const userCode = "function reverse(arr) { while(true) {} return arr; }";

      mockCaptureSteps.mockResolvedValue({
        success: false,
        error: "Infinite loop detected (while loop)",
        steps: [],
        executionTime: 50,
        consoleLogs: [],
      });

      const result = await runTest(userCode, mockTestCase);

      expect(result.passed).toBe(false);
      expect(result.error).toContain("Infinite loop detected");
    });

    it("should handle infinite loop errors (for loop)", async () => {
      const userCode = "function reverse(arr) { for(;;) {} return arr; }";

      mockCaptureSteps.mockResolvedValue({
        success: false,
        error: "Infinite loop detected (for loop)",
        steps: [],
        executionTime: 50,
        consoleLogs: [],
      });

      const result = await runTest(userCode, mockTestCase);

      expect(result.passed).toBe(false);
      expect(result.error).toContain("Infinite loop detected");
    });

    it("should handle infinite loop errors (do-while loop)", async () => {
      const userCode = "function reverse(arr) { do {} while(true); return arr; }";

      mockCaptureSteps.mockResolvedValue({
        success: false,
        error: "Infinite loop detected (do-while loop)",
        steps: [],
        executionTime: 50,
        consoleLogs: [],
      });

      const result = await runTest(userCode, mockTestCase);

      expect(result.passed).toBe(false);
      expect(result.error).toContain("Infinite loop detected");
    });

    it("should capture steps when captureSteps is true", async () => {
      const userCode = "function reverse(arr) { return arr.reverse(); }";
      const mockStep = {
        type: "push",
        target: "arr",
        args: [5],
        result: undefined,
        timestamp: Date.now(),
      };

      mockCaptureSteps.mockResolvedValue({
        success: true,
        steps: [mockStep],
        executionTime: 100,
        consoleLogs: [],
      });

      const result = await runTest(userCode, mockTestCase, {
        captureSteps: true,
      });

      expect(result.steps).toHaveLength(1);
      expect(result.steps[0]).toEqual(mockStep);
    });

    it("should capture console logs when captureLogs is true", async () => {
      const userCode = "function reverse(arr) { console.log('test'); return arr.reverse(); }";

      mockCaptureSteps.mockResolvedValue({
        success: true,
        steps: [],
        executionTime: 100,
        consoleLogs: [{ level: "log", args: ["test"], timestamp: Date.now() }],
      });

      const result = await runTest(userCode, mockTestCase, {
        captureLogs: true,
      });

      expect(result.consoleLogs).toHaveLength(1);
      expect(result.consoleLogs[0]?.level).toBe("log");
      expect(result.consoleLogs[0]?.args).toEqual(["test"]);
    });

    it("should handle exceptions during execution", async () => {
      const userCode = "function reverse(arr) { return arr.reverse(); }";

      mockCaptureSteps.mockRejectedValue(new Error("Sandbox crashed"));

      const result = await runTest(userCode, mockTestCase);

      expect(result.passed).toBe(false);
      expect(result.error).toContain("Sandbox crashed");
    });

    it("should pass timeout option to captureSteps", async () => {
      const userCode = "function reverse(arr) { return arr.reverse(); }";

      mockCaptureSteps.mockResolvedValue({
        success: true,
        steps: [],
        executionTime: 100,
        consoleLogs: [],
      });

      await runTest(userCode, mockTestCase, { timeout: 10000 });

      expect(mockCaptureSteps).toHaveBeenCalledWith(expect.objectContaining({ timeout: 10000 }));
    });
  });

  describe("runTests", () => {
    const mockTestCases: TestCase[] = [
      {
        id: "test-1",
        name: "Test 1",
        difficulty: "easy",
        description: "Test 1",
        initialData: [1, 2, 3],
        expectedOutput: [3, 2, 1],
        assertions: "expect(result).toEqual([3, 2, 1]);",
        referenceSolution: "function reverse(arr) { return arr.reverse(); }",
        skeletonCode: "function reverse(arr) { /* TODO */ }",
        hints: [],
        acceptanceCriteria: [],
      },
      {
        id: "test-2",
        name: "Test 2",
        difficulty: "medium",
        description: "Test 2",
        initialData: [4, 5, 6],
        expectedOutput: [6, 5, 4],
        assertions: "expect(result).toEqual([6, 5, 4]);",
        referenceSolution: "function reverse(arr) { return arr.reverse(); }",
        skeletonCode: "function reverse(arr) { /* TODO */ }",
        hints: [],
        acceptanceCriteria: [],
      },
    ];

    it("should run all test cases in sequence", async () => {
      const userCode = "function reverse(arr) { return arr.reverse(); }";

      mockCaptureSteps.mockResolvedValue({
        success: true,
        steps: [],
        executionTime: 100,
        consoleLogs: [],
      });

      const results = await runTests(userCode, mockTestCases);

      expect(results).toHaveLength(2);
      expect(results[0]?.testId).toBe("test-1");
      expect(results[1]?.testId).toBe("test-2");
    });

    it("should continue running tests even if one fails", async () => {
      const userCode = "function reverse(arr) { return arr.reverse(); }";

      mockCaptureSteps
        .mockResolvedValueOnce({
          success: false,
          error: "Test 1 failed",
          steps: [],
          executionTime: 50,
          consoleLogs: [],
        })
        .mockResolvedValueOnce({
          success: true,
          steps: [],
          executionTime: 100,
          consoleLogs: [],
        });

      const results = await runTests(userCode, mockTestCases);

      expect(results).toHaveLength(2);
      expect(results[0]?.passed).toBe(false);
      expect(results[1]?.passed).toBe(true);
    });
  });

  describe("runTestsByDifficulty", () => {
    const mockTestCases: TestCase[] = [
      {
        id: "easy-1",
        name: "Easy Test",
        difficulty: "easy",
        description: "Easy test",
        initialData: [],
        expectedOutput: [],
        assertions: "",
        referenceSolution: "",
        skeletonCode: "",
        hints: [],
        acceptanceCriteria: [],
      },
      {
        id: "medium-1",
        name: "Medium Test",
        difficulty: "medium",
        description: "Medium test",
        initialData: [],
        expectedOutput: [],
        assertions: "",
        referenceSolution: "",
        skeletonCode: "",
        hints: [],
        acceptanceCriteria: [],
      },
      {
        id: "hard-1",
        name: "Hard Test",
        difficulty: "hard",
        description: "Hard test",
        initialData: [],
        expectedOutput: [],
        assertions: "",
        referenceSolution: "",
        skeletonCode: "",
        hints: [],
        acceptanceCriteria: [],
      },
    ];

    it("should run only easy tests", async () => {
      const userCode = "function test() {}";

      mockCaptureSteps.mockResolvedValue({
        success: true,
        steps: [],
        executionTime: 100,
        consoleLogs: [],
      });

      const results = await runTestsByDifficulty(userCode, mockTestCases, "easy");

      expect(results).toHaveLength(1);
      expect(results[0]?.testId).toBe("easy-1");
    });

    it("should run only medium tests", async () => {
      const userCode = "function test() {}";

      mockCaptureSteps.mockResolvedValue({
        success: true,
        steps: [],
        executionTime: 100,
        consoleLogs: [],
      });

      const results = await runTestsByDifficulty(userCode, mockTestCases, "medium");

      expect(results).toHaveLength(1);
      expect(results[0]?.testId).toBe("medium-1");
    });

    it("should run only hard tests", async () => {
      const userCode = "function test() {}";

      mockCaptureSteps.mockResolvedValue({
        success: true,
        steps: [],
        executionTime: 100,
        consoleLogs: [],
      });

      const results = await runTestsByDifficulty(userCode, mockTestCases, "hard");

      expect(results).toHaveLength(1);
      expect(results[0]?.testId).toBe("hard-1");
    });
  });
});
