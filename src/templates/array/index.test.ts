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
    it("should contain sortArray function signature", () => {
      expect(easySkeleton).toContain("function sortArray(arr)");
    });

    it("should contain TODO marker", () => {
      const todos = skeletonCodeSystem.extractTodos(easySkeleton);
      expect(todos.length).toBeGreaterThan(0);
      expect(todos[0]).toContain("Implement sorting algorithm");
    });

    it("should contain comment about built-in sort", () => {
      // The easy skeleton mentions sort() in the description comment, not as a Hint:
      expect(easySkeleton).toContain("sort()");
    });

    it("should not contain placeholder", () => {
      expect(easySkeleton).not.toContain("/* your code here */");
    });

    it("should contain description about sorting", () => {
      expect(easySkeleton).toContain("Sort an array of numbers");
    });
  });

  describe("mediumSkeleton", () => {
    it("should contain sortArray function signature", () => {
      expect(mediumSkeleton).toContain("function sortArray(arr)");
    });

    it("should contain variable initialization", () => {
      expect(mediumSkeleton).toContain("const n = arr.length");
    });

    it("should contain TODO marker", () => {
      const todos = skeletonCodeSystem.extractTodos(mediumSkeleton);
      expect(todos.length).toBeGreaterThan(0);
    });

    it("should contain loop hints", () => {
      expect(mediumSkeleton).toContain("Outer loop");
      expect(mediumSkeleton).toContain("Inner loop");
    });

    it("should contain standard JS array syntax hint", () => {
      expect(mediumSkeleton).toContain("arr[i]");
    });

    it("should contain return statement", () => {
      expect(mediumSkeleton).toContain("return arr");
    });

    it("should mention bubble sort approach", () => {
      expect(mediumSkeleton.toLowerCase()).toContain("bubble sort");
    });
  });

  describe("hardSkeleton", () => {
    it("should contain sortArray function with default parameters", () => {
      expect(hardSkeleton).toContain("function sortArray(arr, low = 0, high = arr.length - 1)");
    });

    it("should contain partition function signature", () => {
      expect(hardSkeleton).toContain("function partition(arr, low, high)");
    });

    it("should contain TODO markers in sortArray", () => {
      const parts = hardSkeleton.split("function partition");
      const sortArraySection = parts[0] || "";
      const todos = skeletonCodeSystem.extractTodos(sortArraySection);
      expect(todos.length).toBeGreaterThanOrEqual(2);
    });

    it("should contain TODO marker in partition", () => {
      const parts = hardSkeleton.split("function partition");
      const partitionSection = parts[1] || "";
      const todos = skeletonCodeSystem.extractTodos(partitionSection);
      expect(todos.length).toBeGreaterThanOrEqual(1);
    });

    it("should contain recursion hints", () => {
      expect(hardSkeleton).toContain("Recursively sort");
    });

    it("should mention Lomuto partition scheme", () => {
      expect(hardSkeleton).toContain("Lomuto partition");
    });

    it("should mention quick sort approach", () => {
      expect(hardSkeleton.toLowerCase()).toContain("quick sort");
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

    it("all templates should have description comments", () => {
      expect(easySkeleton).toContain("// Sort an array");
      expect(mediumSkeleton).toContain("// Sort an array");
      expect(hardSkeleton).toContain("// Sort an array");
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
