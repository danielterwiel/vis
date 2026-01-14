/**
 * Tests for preset examples system
 */

import { describe, it, expect } from "vitest";
import {
  allPresets,
  getPresetsForDataStructure,
  getPresetsByCategory,
  getPresetById,
  searchPresets,
  getCategoriesForDataStructure,
  presetCategories,
} from "./index";

describe("Preset Examples System", () => {
  describe("allPresets", () => {
    it("should contain presets from all data structures", () => {
      expect(allPresets.length).toBeGreaterThan(0);

      const dataStructures = new Set(allPresets.map((p) => p.dataStructure));
      expect(dataStructures.has("array")).toBe(true);
      expect(dataStructures.has("linkedList")).toBe(true);
      expect(dataStructures.has("tree")).toBe(true);
      expect(dataStructures.has("graph")).toBe(true);
      expect(dataStructures.has("stack")).toBe(true);
      expect(dataStructures.has("hashMap")).toBe(true);
    });

    it("should have unique IDs for all presets", () => {
      const ids = allPresets.map((p) => p.id);
      const uniqueIds = new Set(ids);
      expect(ids.length).toBe(uniqueIds.size);
    });

    it("should have valid structure for all presets", () => {
      allPresets.forEach((preset) => {
        expect(preset.id).toBeTruthy();
        expect(preset.name).toBeTruthy();
        expect(preset.description).toBeTruthy();
        expect(preset.category).toBeTruthy();
        expect(preset.dataStructure).toBeTruthy();
        expect(preset.code).toBeTruthy();
        expect(preset.code.length).toBeGreaterThan(50); // Should have meaningful code
      });
    });

    it("should have complexity information for most presets", () => {
      const presetsWithComplexity = allPresets.filter((p) => p.timeComplexity || p.spaceComplexity);
      expect(presetsWithComplexity.length).toBeGreaterThan(allPresets.length * 0.8); // At least 80%
    });
  });

  describe("getPresetsForDataStructure", () => {
    it("should return presets for array data structure", () => {
      const arrayPresets = getPresetsForDataStructure("array");
      expect(arrayPresets.length).toBeGreaterThan(0);
      arrayPresets.forEach((preset) => {
        expect(preset.dataStructure).toBe("array");
      });
    });

    it("should return presets for linked list data structure", () => {
      const linkedListPresets = getPresetsForDataStructure("linkedList");
      expect(linkedListPresets.length).toBeGreaterThan(0);
      linkedListPresets.forEach((preset) => {
        expect(preset.dataStructure).toBe("linkedList");
      });
    });

    it("should return presets for tree data structure", () => {
      const treePresets = getPresetsForDataStructure("tree");
      expect(treePresets.length).toBeGreaterThan(0);
      treePresets.forEach((preset) => {
        expect(preset.dataStructure).toBe("tree");
      });
    });

    it("should return empty array for unsupported data structure", () => {
      const presets = getPresetsForDataStructure("unknown" as any);
      expect(presets).toEqual([]);
    });
  });

  describe("getPresetsByCategory", () => {
    it("should return all sorting presets", () => {
      const sortingPresets = getPresetsByCategory("sorting");
      expect(sortingPresets.length).toBeGreaterThan(0);
      sortingPresets.forEach((preset) => {
        expect(preset.category).toBe("sorting");
      });
    });

    it("should return all traversal presets", () => {
      const traversalPresets = getPresetsByCategory("traversal");
      expect(traversalPresets.length).toBeGreaterThan(0);
      traversalPresets.forEach((preset) => {
        expect(preset.category).toBe("traversal");
      });
    });

    it("should return empty array for non-existent category", () => {
      const presets = getPresetsByCategory("non-existent-category");
      expect(presets).toEqual([]);
    });
  });

  describe("getPresetById", () => {
    it("should return specific preset by ID", () => {
      const preset = getPresetById("array-bubble-sort");
      expect(preset).toBeDefined();
      expect(preset?.id).toBe("array-bubble-sort");
      expect(preset?.name).toBe("Bubble Sort");
      expect(preset?.dataStructure).toBe("array");
    });

    it("should return undefined for non-existent ID", () => {
      const preset = getPresetById("non-existent-id");
      expect(preset).toBeUndefined();
    });
  });

  describe("searchPresets", () => {
    it("should find presets by name", () => {
      const results = searchPresets("bubble");
      expect(results.length).toBeGreaterThan(0);
      expect(results.some((p) => p.name.toLowerCase().includes("bubble"))).toBe(true);
    });

    it("should find presets by description", () => {
      const results = searchPresets("divide-and-conquer");
      expect(results.length).toBeGreaterThan(0);
    });

    it("should find presets by tags", () => {
      const results = searchPresets("recursive");
      expect(results.length).toBeGreaterThan(0);
      expect(results.some((p) => p.tags?.includes("recursive"))).toBe(true);
    });

    it("should be case insensitive", () => {
      const lowerResults = searchPresets("binary");
      const upperResults = searchPresets("BINARY");
      expect(lowerResults.length).toBe(upperResults.length);
    });

    it("should return empty array when no matches", () => {
      const results = searchPresets("zzzznonexistentzzzz");
      expect(results).toEqual([]);
    });
  });

  describe("getCategoriesForDataStructure", () => {
    it("should return categories for array data structure", () => {
      const categories = getCategoriesForDataStructure("array");
      expect(categories.length).toBeGreaterThan(0);
      expect(categories.some((c) => c.id === "sorting")).toBe(true);
      expect(categories.some((c) => c.id === "searching")).toBe(true);
    });

    it("should return categories for tree data structure", () => {
      const categories = getCategoriesForDataStructure("tree");
      expect(categories.length).toBeGreaterThan(0);
      expect(categories.some((c) => c.id === "traversal")).toBe(true);
    });

    it("should return empty array for data structure with no presets", () => {
      const categories = getCategoriesForDataStructure("unknown" as any);
      expect(categories).toEqual([]);
    });
  });

  describe("presetCategories", () => {
    it("should have all expected categories", () => {
      const categoryIds = presetCategories.map((c) => c.id);
      expect(categoryIds).toContain("sorting");
      expect(categoryIds).toContain("searching");
      expect(categoryIds).toContain("traversal");
      expect(categoryIds).toContain("manipulation");
    });

    it("should have valid structure for all categories", () => {
      presetCategories.forEach((category) => {
        expect(category.id).toBeTruthy();
        expect(category.name).toBeTruthy();
        expect(category.description).toBeTruthy();
      });
    });
  });

  describe("Preset Code Quality", () => {
    it("should have well-commented code in all presets", () => {
      allPresets.forEach((preset) => {
        const commentCount = (preset.code.match(/\/\//g) || []).length;
        expect(commentCount).toBeGreaterThan(2); // At least 3 comment lines
      });
    });

    it("should have example usage in all presets", () => {
      allPresets.forEach((preset) => {
        const hasTestUsage = preset.code.includes("Test it:") || preset.code.includes("// Test");
        expect(hasTestUsage).toBe(true);
      });
    });

    it("should not have TODO markers in preset code", () => {
      allPresets.forEach((preset) => {
        expect(preset.code).not.toContain("TODO");
      });
    });
  });

  describe("Specific Preset Examples", () => {
    it("should have bubble sort preset", () => {
      const preset = getPresetById("array-bubble-sort");
      expect(preset).toBeDefined();
      expect(preset?.code).toContain("for");
      expect(preset?.timeComplexity).toContain("O(n²)");
    });

    it("should have binary search preset", () => {
      const preset = getPresetById("array-binary-search");
      expect(preset).toBeDefined();
      expect(preset?.code).toContain("while");
      expect(preset?.timeComplexity).toContain("O(log n)");
    });

    it("should have BFS tree traversal preset", () => {
      const preset = getPresetById("tree-level-order-traversal");
      expect(preset).toBeDefined();
      expect(preset?.category).toBe("traversal");
      expect(preset?.tags).toContain("bfs");
    });

    it("should have DFS graph traversal preset", () => {
      const preset = getPresetById("graph-dfs");
      expect(preset).toBeDefined();
      expect(preset?.category).toBe("traversal");
      expect(preset?.tags).toContain("dfs");
    });
  });
});
