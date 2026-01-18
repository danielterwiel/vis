import { describe, it, expect } from "vitest";
import { linkedListTests } from "./linkedListTests";

describe("linkedListTests", () => {
  describe("Test Suite Structure", () => {
    it("should export an array of test cases", () => {
      expect(Array.isArray(linkedListTests)).toBe(true);
      expect(linkedListTests.length).toBe(3);
    });

    it("should have unique IDs for all test cases", () => {
      const ids = linkedListTests.map((t) => t.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have all required TestCase properties", () => {
      for (const test of linkedListTests) {
        expect(test).toHaveProperty("id");
        expect(test).toHaveProperty("name");
        expect(test).toHaveProperty("difficulty");
        expect(test).toHaveProperty("description");
        expect(test).toHaveProperty("initialData");
        expect(test).toHaveProperty("expectedOutput");
        expect(test).toHaveProperty("assertions");
        expect(test).toHaveProperty("referenceSolution");
        expect(test).toHaveProperty("skeletonCode");
        expect(test).toHaveProperty("hints");
        expect(test).toHaveProperty("acceptanceCriteria");
      }
    });
  });

  describe("Difficulty Levels", () => {
    it("should have one easy test case", () => {
      const easyTests = linkedListTests.filter((t) => t.difficulty === "easy");
      expect(easyTests.length).toBe(1);
    });

    it("should have one medium test case", () => {
      const mediumTests = linkedListTests.filter((t) => t.difficulty === "medium");
      expect(mediumTests.length).toBe(1);
    });

    it("should have one hard test case", () => {
      const hardTests = linkedListTests.filter((t) => t.difficulty === "hard");
      expect(hardTests.length).toBe(1);
    });
  });

  describe("Test Data Validity", () => {
    it("should have valid initial data arrays", () => {
      for (const test of linkedListTests) {
        expect(Array.isArray(test.initialData)).toBe(true);
        expect((test.initialData as unknown[]).length).toBeGreaterThan(0);
      }
    });

    it("should have expected output matching test descriptions", () => {
      const [easy, medium, hard] = linkedListTests;

      // Easy: Find returns a value
      expect(typeof easy?.expectedOutput === "number").toBe(true);

      // Medium: Reverse returns reversed array
      expect(Array.isArray(medium?.expectedOutput)).toBe(true);

      // Hard: Cycle detection returns boolean
      expect(typeof hard?.expectedOutput === "boolean").toBe(true);
    });
  });

  describe("Assertions", () => {
    it("should have non-empty assertions for all tests", () => {
      for (const test of linkedListTests) {
        expect(test.assertions.trim().length).toBeGreaterThan(0);
      }
    });

    it("should use expect syntax in assertions", () => {
      for (const test of linkedListTests) {
        expect(test.assertions).toContain("expect(");
      }
    });

  });

  describe("Reference Solutions", () => {
    it("should have non-empty reference solutions", () => {
      for (const test of linkedListTests) {
        expect(test.referenceSolution.trim().length).toBeGreaterThan(0);
      }
    });

    it("should define functions in reference solutions", () => {
      for (const test of linkedListTests) {
        expect(test.referenceSolution).toContain("function");
      }
    });

    it("should use getHead() to access list nodes", () => {
      const [easy, medium, hard] = linkedListTests;

      // All solutions should use getHead() to start traversal
      expect(easy?.referenceSolution).toContain("getHead()");
      expect(medium?.referenceSolution).toContain("getHead()");
      expect(hard?.referenceSolution).toContain("getHead()");
    });
  });

  describe("Skeleton Code", () => {
    it("should have non-empty skeleton code", () => {
      for (const test of linkedListTests) {
        expect(test.skeletonCode.trim().length).toBeGreaterThan(0);
      }
    });

    it("should include TODO markers", () => {
      for (const test of linkedListTests) {
        expect(test.skeletonCode).toContain("TODO");
      }
    });

    it("should define function signatures", () => {
      for (const test of linkedListTests) {
        expect(test.skeletonCode).toContain("function");
      }
    });

    it("should include getHead() for accessing list nodes", () => {
      for (const test of linkedListTests) {
        expect(test.skeletonCode).toContain("getHead()");
      }
    });
  });

  describe("Hints", () => {
    it("should have at least 3 hints per test", () => {
      for (const test of linkedListTests) {
        expect(test.hints.length).toBeGreaterThanOrEqual(3);
      }
    });

    it("should have non-empty hint strings", () => {
      for (const test of linkedListTests) {
        for (const hint of test.hints) {
          expect(hint.trim().length).toBeGreaterThan(0);
        }
      }
    });

    it("should provide progressive guidance", () => {
      for (const test of linkedListTests) {
        // First hint should mention the general approach
        expect(test.hints[0]?.length).toBeGreaterThan(10);

        // Later hints should provide more specific details
        expect(test.hints[test.hints.length - 1]?.length).toBeGreaterThan(10);
      }
    });
  });

  describe("Acceptance Criteria", () => {
    it("should have at least 2 acceptance criteria per test", () => {
      for (const test of linkedListTests) {
        expect(test.acceptanceCriteria.length).toBeGreaterThanOrEqual(2);
      }
    });

    it("should have non-empty criteria strings", () => {
      for (const test of linkedListTests) {
        for (const criterion of test.acceptanceCriteria) {
          expect(criterion.trim().length).toBeGreaterThan(0);
        }
      }
    });
  });

  describe("Test-Specific Validations", () => {
    it("Easy: Find Element - should search for value in list", () => {
      const test = linkedListTests[0];
      expect(test?.id).toBe("linkedlist-find-easy");
      expect(test?.name).toContain("Find");
      expect(test?.initialData).toEqual([10, 20, 30, 40, 50]);
      expect(test?.expectedOutput).toBe(30);
    });

    it("Medium: Reverse List - should reverse array output", () => {
      const test = linkedListTests[1];
      expect(test?.id).toBe("linkedlist-reverse-medium");
      expect(test?.name).toContain("Reverse");
      expect(test?.initialData).toEqual([10, 20, 30, 40, 50]);
      expect(test?.expectedOutput).toEqual([50, 40, 30, 20, 10]);
    });

    it("Hard: Detect Cycle - should return boolean", () => {
      const test = linkedListTests[2];
      expect(test?.id).toBe("linkedlist-cycle-hard");
      expect(test?.name).toContain("Cycle");
      expect(test?.initialData).toEqual([10, 20, 30, 40, 50]);
      expect(test?.expectedOutput).toBe(false);
    });

    it("should use the same dataset across all difficulty levels", () => {
      const [easy, medium, hard] = linkedListTests;
      expect(easy?.initialData).toEqual([10, 20, 30, 40, 50]);
      expect(medium?.initialData).toEqual([10, 20, 30, 40, 50]);
      expect(hard?.initialData).toEqual([10, 20, 30, 40, 50]);
    });
  });

  describe("Naming Conventions", () => {
    it("should follow ID naming pattern: linkedlist-{operation}-{difficulty}", () => {
      for (const test of linkedListTests) {
        expect(test.id).toMatch(/^linkedlist-[a-z]+-(?:easy|medium|hard)$/);
      }
    });

    it("should have descriptive test names", () => {
      for (const test of linkedListTests) {
        expect(test.name.length).toBeGreaterThan(5);
        expect(test.name).not.toContain("TODO");
      }
    });
  });

  describe("Difficulty Progression", () => {
    it("should increase in complexity from easy to hard", () => {
      const [, , hard] = linkedListTests;

      // Hard should mention two pointers technique
      expect(hard?.hints.some((h) => h.toLowerCase().includes("pointer"))).toBe(true);

      // Hard should mention slow and fast
      expect(hard?.hints.some((h) => h.toLowerCase().includes("slow") || h.toLowerCase().includes("fast"))).toBe(true);
    });
  });
});
