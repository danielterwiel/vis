import { describe, it, expect, beforeEach } from "vitest";
import {
  skeletonCodeSystem,
  createSkeletonCode,
  formatReferenceSolution,
} from "./skeletonCodeSystem";

describe("SkeletonCodeSystem", () => {
  beforeEach(() => {
    // Clear any registered templates before each test
    skeletonCodeSystem.clearTemplates();
  });

  describe("registerTemplate and getSkeletonCode", () => {
    it("should register and retrieve a template", () => {
      const code = "function test() { /* TODO */ }";
      skeletonCodeSystem.registerTemplate("array", "easy", code);

      const retrieved = skeletonCodeSystem.getSkeletonCode("array", "easy");
      expect(retrieved).toBe(code);
    });

    it("should throw error for non-existent template", () => {
      expect(() => skeletonCodeSystem.getSkeletonCode("array", "easy")).toThrow(
        "No skeleton template found for array (easy)",
      );
    });

    it("should handle case-insensitive lookups", () => {
      const code = "function test() {}";
      skeletonCodeSystem.registerTemplate("Array", "Easy", code);

      const retrieved = skeletonCodeSystem.getSkeletonCode("array", "easy");
      expect(retrieved).toBe(code);
    });

    it("should store multiple templates independently", () => {
      skeletonCodeSystem.registerTemplate("array", "easy", "code1");
      skeletonCodeSystem.registerTemplate("array", "medium", "code2");
      skeletonCodeSystem.registerTemplate("tree", "easy", "code3");

      expect(skeletonCodeSystem.getSkeletonCode("array", "easy")).toBe("code1");
      expect(skeletonCodeSystem.getSkeletonCode("array", "medium")).toBe("code2");
      expect(skeletonCodeSystem.getSkeletonCode("tree", "easy")).toBe("code3");
    });
  });

  describe("extractTodos", () => {
    it("should extract TODO markers from code", () => {
      const code = `
        // TODO: Implement this function
        function test() {
          // TODO: Add validation
          // TODO: Return result
        }
      `;

      const todos = skeletonCodeSystem.extractTodos(code);
      expect(todos).toHaveLength(3);
      expect(todos[0]).toBe("Implement this function");
      expect(todos[1]).toBe("Add validation");
      expect(todos[2]).toBe("Return result");
    });

    it("should handle TODO without colon", () => {
      const code = "// TODO Implement function";
      const todos = skeletonCodeSystem.extractTodos(code);
      expect(todos).toHaveLength(1);
      expect(todos[0]).toBe("Implement function");
    });

    it("should return empty array when no TODOs present", () => {
      const code = "function test() { return 42; }";
      const todos = skeletonCodeSystem.extractTodos(code);
      expect(todos).toHaveLength(0);
    });

    it("should handle mixed case TODO", () => {
      const code = `
        // todo: lowercase
        // TODO: uppercase
        // Todo: titlecase
      `;
      const todos = skeletonCodeSystem.extractTodos(code);
      expect(todos).toHaveLength(3);
    });
  });

  describe("isModified", () => {
    const skeleton = `
      function test(arr) {
        // TODO: Implement sorting
        /* your code here */
        return arr;
      }
    `;

    it("should return false for identical code", () => {
      expect(skeletonCodeSystem.isModified(skeleton, skeleton)).toBe(false);
    });

    it("should return false for whitespace-only changes", () => {
      const modified = skeleton.replace(/\n/g, "\n\n"); // Add extra newlines
      expect(skeletonCodeSystem.isModified(modified, skeleton)).toBe(false);
    });

    it("should return true when TODO is removed", () => {
      const modified = skeleton.replace("// TODO: Implement sorting", "");
      expect(skeletonCodeSystem.isModified(modified, skeleton)).toBe(true);
    });

    it("should return true when placeholder is replaced", () => {
      const modified = skeleton.replace("/* your code here */", "arr.sort((a, b) => a - b);");
      expect(skeletonCodeSystem.isModified(modified, skeleton)).toBe(true);
    });

    it("should return true when code length differs significantly", () => {
      const modified =
        skeleton + "\n".repeat(50) + "// Added significant content\nfunction extra() {}";
      expect(skeletonCodeSystem.isModified(modified, skeleton)).toBe(true);
    });

    it("should return false for minor additions within threshold", () => {
      const modified = skeleton + "\n// Small comment";
      expect(skeletonCodeSystem.isModified(modified, skeleton)).toBe(false);
    });
  });

  describe("getInlineHints", () => {
    it("should extract hint comments from code", () => {
      const code = `
        // TODO: Sort the array
        // Hint: Use Array.sort() method
        function sort(arr) {
          // Hint: Pass a compare function
          return arr;
        }
      `;

      const hints = skeletonCodeSystem.getInlineHints(code);
      expect(hints).toHaveLength(2);
      expect(hints[0]).toBe("Use Array.sort() method");
      expect(hints[1]).toBe("Pass a compare function");
    });

    it("should handle hint without colon", () => {
      const code = "// Hint This is a hint";
      const hints = skeletonCodeSystem.getInlineHints(code);
      expect(hints).toHaveLength(1);
      expect(hints[0]).toBe("This is a hint");
    });

    it("should return empty array when no hints present", () => {
      const code = "function test() { return 42; }";
      const hints = skeletonCodeSystem.getInlineHints(code);
      expect(hints).toHaveLength(0);
    });
  });

  describe("replaceWithSolution", () => {
    it("should replace skeleton with reference solution", () => {
      const skeleton = `
        // Array sorting skeleton
        function sort(arr) {
          // TODO: Implement
        }
      `;

      const solution = `function sort(arr) {
  return arr.slice().sort((a, b) => a - b);
}`;

      const result = skeletonCodeSystem.replaceWithSolution(skeleton, solution);
      expect(result).toContain("// Array sorting skeleton");
      expect(result).toContain(solution);
      expect(result).not.toContain("TODO");
    });

    it("should preserve leading comments", () => {
      const skeleton = `
        // Copyright 2026
        // Licensed under MIT
        function test() {}
      `;

      const solution = "function test() { return 42; }";
      const result = skeletonCodeSystem.replaceWithSolution(skeleton, solution);

      expect(result).toContain("// Copyright 2026");
      expect(result).toContain("// Licensed under MIT");
      expect(result).toContain(solution);
    });

    it("should handle skeleton with no leading comments", () => {
      const skeleton = "function test() { /* TODO */ }";
      const solution = "function test() { return 42; }";

      const result = skeletonCodeSystem.replaceWithSolution(skeleton, solution);
      expect(result).toBe("\n" + solution);
    });
  });

  describe("getRegisteredTemplates", () => {
    it("should return list of registered template keys", () => {
      skeletonCodeSystem.registerTemplate("array", "easy", "code1");
      skeletonCodeSystem.registerTemplate("tree", "medium", "code2");

      const keys = skeletonCodeSystem.getRegisteredTemplates();
      expect(keys).toHaveLength(2);
      expect(keys).toContain("array-easy");
      expect(keys).toContain("tree-medium");
    });

    it("should return empty array when no templates registered", () => {
      const keys = skeletonCodeSystem.getRegisteredTemplates();
      expect(keys).toHaveLength(0);
    });
  });
});

describe("createSkeletonCode", () => {
  it("should create skeleton with basic structure", () => {
    const result = createSkeletonCode({
      functionName: "sort",
      parameters: "arr",
      returnType: "Array",
      todos: ["Implement sorting algorithm"],
    });

    expect(result).toContain("function sort(arr)");
    expect(result).toContain("// TODO: Implement sorting algorithm");
    expect(result).not.toContain("/* your code here */");
  });

  it("should include hints when provided", () => {
    const result = createSkeletonCode({
      functionName: "sort",
      parameters: "arr",
      returnType: "Array",
      todos: ["Sort the array"],
      hints: ["Use Array.sort() method"],
    });

    expect(result).toContain("// TODO: Sort the array");
    expect(result).toContain("// Hint: Use Array.sort() method");
  });

  it("should include example usage when provided", () => {
    const result = createSkeletonCode({
      functionName: "sort",
      parameters: "arr",
      returnType: "Array",
      todos: ["Sort the array"],
      exampleUsage: "sort([3, 1, 2]) // [1, 2, 3]",
    });

    expect(result).toContain("// Example usage:");
    expect(result).toContain("// sort([3, 1, 2]) // [1, 2, 3]");
  });

  it("should include imports when provided", () => {
    const result = createSkeletonCode({
      functionName: "process",
      parameters: "data",
      returnType: "Result",
      todos: ["Process data"],
      imports: ["import { helper } from './utils';", "import type { Data } from './types';"],
    });

    expect(result).toContain("import { helper } from './utils';");
    expect(result).toContain("import type { Data } from './types';");
  });

  it("should handle multiple TODOs with matching hints", () => {
    const result = createSkeletonCode({
      functionName: "calculate",
      parameters: "a, b",
      returnType: "number",
      todos: ["Validate inputs", "Perform calculation", "Return result"],
      hints: ["Check for null/undefined", "Use Math operations", "Format output"],
    });

    expect(result).toContain("// TODO: Validate inputs");
    expect(result).toContain("// Hint: Check for null/undefined");
    expect(result).toContain("// TODO: Perform calculation");
    expect(result).toContain("// Hint: Use Math operations");
    expect(result).toContain("// TODO: Return result");
    expect(result).toContain("// Hint: Format output");
  });
});

describe("formatReferenceSolution", () => {
  it("should format solution with basic function code", () => {
    const result = formatReferenceSolution({
      functionCode: "function sort(arr) { return arr.sort(); }",
    });

    expect(result).toBe("function sort(arr) { return arr.sort(); }");
  });

  it("should include explanation in JSDoc comment", () => {
    const result = formatReferenceSolution({
      functionCode: "function test() {}",
      explanation: "This function does something important",
    });

    expect(result).toContain("/**");
    expect(result).toContain(" * This function does something important");
    expect(result).toContain(" */");
  });

  it("should include complexity analysis when provided", () => {
    const result = formatReferenceSolution({
      functionCode: "function sort(arr) {}",
      explanation: "Sorts an array using quicksort",
      complexity: {
        time: "O(n log n)",
        space: "O(log n)",
      },
    });

    expect(result).toContain(" * Sorts an array using quicksort");
    expect(result).toContain(" * Time Complexity: O(n log n)");
    expect(result).toContain(" * Space Complexity: O(log n)");
  });

  it("should format multiline function code correctly", () => {
    const functionCode = `function quickSort(arr) {
  if (arr.length <= 1) return arr;
  const pivot = arr[0];
  return [...quickSort(left), pivot, ...quickSort(right)];
}`;

    const result = formatReferenceSolution({
      functionCode,
      explanation: "Quick sort implementation",
    });

    expect(result).toContain(functionCode);
    expect(result).toContain("/**");
  });
});
