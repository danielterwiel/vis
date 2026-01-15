import { describe, expect, it } from "vitest";
import { arrayTests } from "./arrayTests";

describe("arrayTests", () => {
  it("should export an array of test cases", () => {
    expect(Array.isArray(arrayTests)).toBe(true);
    expect(arrayTests.length).toBe(3);
  });

  it("should have one test case per difficulty level", () => {
    const difficulties = arrayTests.map((test) => test.difficulty);
    expect(difficulties).toContain("easy");
    expect(difficulties).toContain("medium");
    expect(difficulties).toContain("hard");
  });

  describe("Easy test case", () => {
    const easyTest = arrayTests.find((t) => t.difficulty === "easy");

    it("should have valid structure", () => {
      expect(easyTest).toBeDefined();
      expect(easyTest?.id).toBe("array-sort-easy");
      expect(easyTest?.name).toBe("Sort Array (Easy)");
      expect(easyTest?.description).toBeTruthy();
    });

    it("should have valid data (same as all difficulty levels)", () => {
      expect(easyTest?.initialData).toEqual([64, 34, 25, 12, 22, 11, 90]);
      expect(easyTest?.expectedOutput).toEqual([11, 12, 22, 25, 34, 64, 90]);
    });

    it("should have assertions", () => {
      expect(easyTest?.assertions).toBeTruthy();
      expect(easyTest?.assertions).toContain("expect");
    });

    it("should have reference solution using sortArray function", () => {
      expect(easyTest?.referenceSolution).toBeTruthy();
      expect(easyTest?.referenceSolution).toContain("function sortArray");
    });

    it("should have skeleton code with sortArray function", () => {
      expect(easyTest?.skeletonCode).toBeTruthy();
      expect(easyTest?.skeletonCode).toContain("function sortArray");
      expect(easyTest?.skeletonCode).toContain("TODO");
    });

    it("should have hints", () => {
      expect(easyTest?.hints).toBeDefined();
      expect(easyTest?.hints.length).toBeGreaterThan(0);
    });

    it("should have acceptance criteria", () => {
      expect(easyTest?.acceptanceCriteria).toBeDefined();
      expect(easyTest?.acceptanceCriteria.length).toBeGreaterThan(0);
    });
  });

  describe("Medium test case", () => {
    const mediumTest = arrayTests.find((t) => t.difficulty === "medium");

    it("should have valid structure", () => {
      expect(mediumTest).toBeDefined();
      expect(mediumTest?.id).toBe("array-sort-medium");
      expect(mediumTest?.name).toBe("Sort Array (Medium)");
      expect(mediumTest?.description).toBeTruthy();
    });

    it("should have valid data", () => {
      expect(mediumTest?.initialData).toEqual([64, 34, 25, 12, 22, 11, 90]);
      expect(mediumTest?.expectedOutput).toEqual([11, 12, 22, 25, 34, 64, 90]);
    });

    it("should have assertions", () => {
      expect(mediumTest?.assertions).toBeTruthy();
      expect(mediumTest?.assertions).toContain("expect");
    });

    it("should have reference solution using sortArray function", () => {
      expect(mediumTest?.referenceSolution).toBeTruthy();
      expect(mediumTest?.referenceSolution).toContain("function sortArray");
    });

    it("should have skeleton code with sortArray and nested loop guidance", () => {
      expect(mediumTest?.skeletonCode).toBeTruthy();
      expect(mediumTest?.skeletonCode).toContain("function sortArray");
      expect(mediumTest?.skeletonCode).toContain("nested loops");
    });

    it("should have hints about bubble sort algorithm", () => {
      expect(mediumTest?.hints).toBeDefined();
      expect(mediumTest?.hints.some((h) => h.toLowerCase().includes("bubble"))).toBe(true);
    });
  });

  describe("Hard test case", () => {
    const hardTest = arrayTests.find((t) => t.difficulty === "hard");

    it("should have valid structure", () => {
      expect(hardTest).toBeDefined();
      expect(hardTest?.id).toBe("array-sort-hard");
      expect(hardTest?.name).toBe("Sort Array (Hard)");
      expect(hardTest?.description).toBeTruthy();
    });

    it("should have valid data (same as all difficulty levels)", () => {
      expect(hardTest?.initialData).toEqual([64, 34, 25, 12, 22, 11, 90]);
      expect(hardTest?.expectedOutput).toEqual([11, 12, 22, 25, 34, 64, 90]);
    });

    it("should have assertions", () => {
      expect(hardTest?.assertions).toBeTruthy();
      expect(hardTest?.assertions).toContain("expect");
    });

    it("should have reference solution using sortArray function with partition", () => {
      expect(hardTest?.referenceSolution).toBeTruthy();
      expect(hardTest?.referenceSolution).toContain("function sortArray");
      expect(hardTest?.referenceSolution).toContain("partition");
    });

    it("should have skeleton code with sortArray and recursion guidance", () => {
      expect(hardTest?.skeletonCode).toBeTruthy();
      expect(hardTest?.skeletonCode).toContain("function sortArray");
      expect(hardTest?.skeletonCode?.toLowerCase()).toContain("recursively");
    });

    it("should have hints about quick sort algorithm", () => {
      expect(hardTest?.hints).toBeDefined();
      expect(hardTest?.hints.some((h) => h.toLowerCase().includes("quick"))).toBe(true);
    });
  });

  describe("Test case IDs", () => {
    it("should have unique IDs", () => {
      const ids = arrayTests.map((test) => test.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should follow naming convention", () => {
      arrayTests.forEach((test) => {
        expect(test.id).toMatch(/^array-sort-(easy|medium|hard)$/);
      });
    });
  });

  describe("Difficulty progression", () => {
    it("should use the same dataset across all difficulty levels", () => {
      const easy = arrayTests.find((t) => t.difficulty === "easy");
      const medium = arrayTests.find((t) => t.difficulty === "medium");
      const hard = arrayTests.find((t) => t.difficulty === "hard");

      // All difficulty levels use the same input dataset
      expect(easy?.initialData).toEqual(medium?.initialData);
      expect(medium?.initialData).toEqual(hard?.initialData);
      expect(easy?.expectedOutput).toEqual(medium?.expectedOutput);
      expect(medium?.expectedOutput).toEqual(hard?.expectedOutput);
    });

    it("should have increasing complexity in acceptance criteria", () => {
      const hard = arrayTests.find((t) => t.difficulty === "hard");

      // Hard test should mention recursion or partitioning
      const hardCriteria = hard?.acceptanceCriteria.join(" ").toLowerCase() ?? "";
      expect(hardCriteria).toMatch(/recursion|partition/);
    });
  });
});
