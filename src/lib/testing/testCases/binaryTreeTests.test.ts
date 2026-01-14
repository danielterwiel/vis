import { describe, it, expect } from "vitest";
import { binaryTreeTests } from "./binaryTreeTests";

describe("binaryTreeTests", () => {
  describe("Test Case Structure", () => {
    it("should export an array of test cases", () => {
      expect(Array.isArray(binaryTreeTests)).toBe(true);
      expect(binaryTreeTests.length).toBe(3);
    });

    it("should have unique IDs following naming convention", () => {
      const ids = binaryTreeTests.map((t) => t.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);

      // All IDs should follow pattern: binarytree-{operation}-{difficulty}
      for (const id of ids) {
        expect(id).toMatch(/^binarytree-[a-z]+-(?:easy|medium|hard)$/);
      }
    });

    it("should have all required fields", () => {
      for (const testCase of binaryTreeTests) {
        expect(testCase).toHaveProperty("id");
        expect(testCase).toHaveProperty("name");
        expect(testCase).toHaveProperty("difficulty");
        expect(testCase).toHaveProperty("description");
        expect(testCase).toHaveProperty("initialData");
        expect(testCase).toHaveProperty("expectedOutput");
        expect(testCase).toHaveProperty("assertions");
        expect(testCase).toHaveProperty("referenceSolution");
        expect(testCase).toHaveProperty("skeletonCode");
        expect(testCase).toHaveProperty("hints");
        expect(testCase).toHaveProperty("acceptanceCriteria");
      }
    });

    it("should have valid difficulty levels", () => {
      const validDifficulties = new Set(["easy", "medium", "hard"]);
      for (const testCase of binaryTreeTests) {
        expect(validDifficulties.has(testCase.difficulty)).toBe(true);
      }
    });
  });

  describe("Data Validity", () => {
    it("should have valid initial data (arrays of numbers)", () => {
      for (const testCase of binaryTreeTests) {
        expect(Array.isArray(testCase.initialData)).toBe(true);
        if (Array.isArray(testCase.initialData)) {
          expect(testCase.initialData.length).toBeGreaterThan(0);
          for (const value of testCase.initialData) {
            expect(typeof value).toBe("number");
          }
        }
      }
    });

    it("should have valid expected output", () => {
      for (const testCase of binaryTreeTests) {
        expect(testCase.expectedOutput).toBeDefined();
        // Easy and Hard return arrays, Medium returns boolean
        if (testCase.difficulty === "medium") {
          expect(typeof testCase.expectedOutput).toBe("boolean");
        } else {
          expect(Array.isArray(testCase.expectedOutput)).toBe(true);
        }
      }
    });
  });

  describe("Assertions", () => {
    it("should have non-empty assertion strings", () => {
      for (const testCase of binaryTreeTests) {
        expect(typeof testCase.assertions).toBe("string");
        expect(testCase.assertions.trim().length).toBeGreaterThan(0);
      }
    });

    it("should use expect syntax in assertions", () => {
      for (const testCase of binaryTreeTests) {
        expect(testCase.assertions).toContain("expect(");
      }
    });
  });

  describe("Reference Solutions", () => {
    it("should have non-empty reference solutions", () => {
      for (const testCase of binaryTreeTests) {
        expect(typeof testCase.referenceSolution).toBe("string");
        expect(testCase.referenceSolution.trim().length).toBeGreaterThan(0);
      }
    });

    it("should define functions in reference solutions", () => {
      for (const testCase of binaryTreeTests) {
        expect(testCase.referenceSolution).toMatch(/function\s+\w+/);
      }
    });

    it("should use TrackedBinaryTree methods", () => {
      // At least one test should use TrackedBinaryTree methods
      const allSolutions = binaryTreeTests.map((t) => t.referenceSolution).join("\n");
      expect(allSolutions).toContain("inorderTraversal");
      expect(allSolutions).toContain("isValidBST");
    });
  });

  describe("Skeleton Code", () => {
    it("should have non-empty skeleton code", () => {
      for (const testCase of binaryTreeTests) {
        expect(typeof testCase.skeletonCode).toBe("string");
        expect(testCase.skeletonCode.trim().length).toBeGreaterThan(0);
      }
    });

    it("should contain TODO markers", () => {
      for (const testCase of binaryTreeTests) {
        expect(testCase.skeletonCode).toMatch(/TODO:/i);
      }
    });

    it("should mention TrackedBinaryTree in hints", () => {
      for (const testCase of binaryTreeTests) {
        expect(testCase.skeletonCode).toContain("TrackedBinaryTree");
      }
    });
  });

  describe("Hints", () => {
    it("should have exactly 3 hints per test case", () => {
      for (const testCase of binaryTreeTests) {
        expect(Array.isArray(testCase.hints)).toBe(true);
        expect(testCase.hints.length).toBe(3);
      }
    });

    it("should have non-empty hint strings", () => {
      for (const testCase of binaryTreeTests) {
        for (const hint of testCase.hints) {
          expect(typeof hint).toBe("string");
          expect(hint.trim().length).toBeGreaterThan(0);
        }
      }
    });
  });

  describe("Acceptance Criteria", () => {
    it("should have acceptance criteria", () => {
      for (const testCase of binaryTreeTests) {
        expect(Array.isArray(testCase.acceptanceCriteria)).toBe(true);
        expect(testCase.acceptanceCriteria.length).toBeGreaterThan(0);
      }
    });

    it("should have non-empty criteria strings", () => {
      for (const testCase of binaryTreeTests) {
        for (const criteria of testCase.acceptanceCriteria) {
          expect(typeof criteria).toBe("string");
          expect(criteria.trim().length).toBeGreaterThan(0);
        }
      }
    });
  });

  describe("Specific Test Cases", () => {
    it("should have Easy test for in-order traversal", () => {
      const easyTest = binaryTreeTests.find((t) => t.difficulty === "easy");
      expect(easyTest).toBeDefined();
      expect(easyTest?.id).toBe("binarytree-traversal-easy");
      expect(easyTest?.name).toBe("In-Order Traversal");
      expect(Array.isArray(easyTest?.expectedOutput)).toBe(true);
    });

    it("should have Medium test for BST validation", () => {
      const mediumTest = binaryTreeTests.find((t) => t.difficulty === "medium");
      expect(mediumTest).toBeDefined();
      expect(mediumTest?.id).toBe("binarytree-validate-medium");
      expect(mediumTest?.name).toBe("Validate BST Property");
      expect(typeof mediumTest?.expectedOutput).toBe("boolean");
    });

    it("should have Hard test for balancing BST", () => {
      const hardTest = binaryTreeTests.find((t) => t.difficulty === "hard");
      expect(hardTest).toBeDefined();
      expect(hardTest?.id).toBe("binarytree-balance-hard");
      expect(hardTest?.name).toBe("Balance an Unbalanced BST");
      expect(Array.isArray(hardTest?.expectedOutput)).toBe(true);
    });
  });

  describe("Difficulty Progression", () => {
    it("should progress from simple traversal to complex balancing", () => {
      const [easy, medium, hard] = binaryTreeTests;

      // Easy: Just traversal (simple read operation)
      expect(easy).toBeDefined();
      expect(easy?.referenceSolution).toContain("inorderTraversal");

      // Medium: Validation (requires understanding BST property)
      expect(medium).toBeDefined();
      expect(medium?.referenceSolution).toContain("isValidBST");

      // Hard: Balancing (requires building new tree)
      expect(hard).toBeDefined();
      expect(hard?.referenceSolution).toContain("buildBalanced");
      expect(hard?.referenceSolution.length).toBeGreaterThan(easy?.referenceSolution.length ?? 0);
      expect(hard?.referenceSolution.length).toBeGreaterThan(medium?.referenceSolution.length ?? 0);
    });
  });
});
