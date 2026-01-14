import { describe, it, expect, beforeAll } from "vitest";
import { registerArrayTemplates, easySkeleton, mediumSkeleton, hardSkeleton } from "./index";
import { skeletonCodeSystem } from "../skeletonCodeSystem";

describe("Array Templates", () => {
  beforeAll(() => {
    // Register templates before tests
    registerArrayTemplates();
  });

  describe("registerArrayTemplates", () => {
    it("should register all three difficulty levels", () => {
      const templates = skeletonCodeSystem.getRegisteredTemplates();
      expect(templates).toContain("array-easy");
      expect(templates).toContain("array-medium");
      expect(templates).toContain("array-hard");
    });

    it("should retrieve easy template", () => {
      const template = skeletonCodeSystem.getSkeletonCode("array", "easy");
      expect(template).toBe(easySkeleton);
    });

    it("should retrieve medium template", () => {
      const template = skeletonCodeSystem.getSkeletonCode("array", "medium");
      expect(template).toBe(mediumSkeleton);
    });

    it("should retrieve hard template", () => {
      const template = skeletonCodeSystem.getSkeletonCode("array", "hard");
      expect(template).toBe(hardSkeleton);
    });
  });

  describe("easySkeleton", () => {
    it("should contain function signature", () => {
      expect(easySkeleton).toContain("function sort(arr)");
    });

    it("should contain TODO marker", () => {
      const todos = skeletonCodeSystem.extractTodos(easySkeleton);
      expect(todos.length).toBeGreaterThan(0);
      expect(todos[0]).toContain("Implement sorting algorithm");
    });

    it("should contain hint", () => {
      const hints = skeletonCodeSystem.getInlineHints(easySkeleton);
      expect(hints.length).toBeGreaterThan(0);
      expect(hints[0]).toContain("sort()");
    });

    it("should not contain placeholder", () => {
      expect(easySkeleton).not.toContain("/* your code here */");
    });

    it("should contain example usage", () => {
      expect(easySkeleton).toContain("// Example usage:");
      expect(easySkeleton).toContain("sort([5, 2, 8, 1, 9])");
    });
  });

  describe("mediumSkeleton", () => {
    it("should contain function signature with parameter", () => {
      expect(mediumSkeleton).toContain("function bubbleSort(arr)");
    });

    it("should contain variable initialization", () => {
      expect(mediumSkeleton).toContain("const n = arr.length");
    });

    it("should contain multiple TODO markers", () => {
      const todos = skeletonCodeSystem.extractTodos(mediumSkeleton);
      expect(todos.length).toBeGreaterThanOrEqual(3);
    });

    it("should contain nested loop hints", () => {
      expect(mediumSkeleton).toContain("Outer loop");
      expect(mediumSkeleton).toContain("Inner loop");
    });

    it("should contain swap hint", () => {
      const hints = skeletonCodeSystem.getInlineHints(mediumSkeleton);
      const swapHint = hints.find((h) => h.includes("destructuring"));
      expect(swapHint).toBeDefined();
    });

    it("should contain return statement", () => {
      expect(mediumSkeleton).toContain("return arr");
    });

    it("should contain example usage", () => {
      expect(mediumSkeleton).toContain("bubbleSort([64, 34, 25, 12, 22, 11, 90])");
    });
  });

  describe("hardSkeleton", () => {
    it("should contain quickSort function with default parameters", () => {
      expect(hardSkeleton).toContain("function quickSort(arr, low = 0, high = arr.length - 1)");
    });

    it("should contain partition function signature", () => {
      expect(hardSkeleton).toContain("function partition(arr, low, high)");
    });

    it("should contain multiple TODO markers in quickSort", () => {
      const parts = hardSkeleton.split("function partition");
      const quickSortSection = parts[0] || "";
      const todos = skeletonCodeSystem.extractTodos(quickSortSection);
      expect(todos.length).toBeGreaterThanOrEqual(2);
    });

    it("should contain multiple TODO markers in partition", () => {
      const parts = hardSkeleton.split("function partition");
      const partitionSection = parts[1] || "";
      const todos = skeletonCodeSystem.extractTodos(partitionSection);
      expect(todos.length).toBeGreaterThanOrEqual(3);
    });

    it("should contain recursion hints", () => {
      expect(hardSkeleton).toContain("Recursively sort");
    });

    it("should contain partition implementation hints", () => {
      expect(hardSkeleton).toContain("Choose pivot");
      expect(hardSkeleton).toContain("smaller elements");
    });

    it("should contain example usage", () => {
      expect(hardSkeleton).toContain("quickSort([10, 80, 30, 90, 40, 50, 70])");
    });

    it("should contain base case hint", () => {
      expect(hardSkeleton).toContain("Base case");
    });
  });

  describe("Template consistency", () => {
    it("all templates should have function signatures", () => {
      expect(easySkeleton).toMatch(/function \w+\(/);
      expect(mediumSkeleton).toMatch(/function \w+\(/);
      expect(hardSkeleton).toMatch(/function \w+\(/);
    });

    it("all templates should have at least one TODO", () => {
      expect(skeletonCodeSystem.extractTodos(easySkeleton).length).toBeGreaterThan(0);
      expect(skeletonCodeSystem.extractTodos(mediumSkeleton).length).toBeGreaterThan(0);
      expect(skeletonCodeSystem.extractTodos(hardSkeleton).length).toBeGreaterThan(0);
    });

    it("all templates should not contain placeholders", () => {
      expect(easySkeleton).not.toContain("/* your code here */");
      expect(mediumSkeleton).not.toContain("/* your code here */");
      expect(hardSkeleton).not.toContain("/* your code here */");
    });

    it("all templates should have example usage", () => {
      expect(easySkeleton).toContain("// Example usage:");
      expect(mediumSkeleton).toContain("// Example usage:");
      expect(hardSkeleton).toContain("// Example usage:");
    });

    it("difficulty should increase in TODO complexity", () => {
      const easyTodos = skeletonCodeSystem.extractTodos(easySkeleton).length;
      const mediumTodos = skeletonCodeSystem.extractTodos(mediumSkeleton).length;
      const hardTodos = skeletonCodeSystem.extractTodos(hardSkeleton).length;

      expect(mediumTodos).toBeGreaterThanOrEqual(easyTodos);
      expect(hardTodos).toBeGreaterThanOrEqual(mediumTodos);
    });
  });
});
