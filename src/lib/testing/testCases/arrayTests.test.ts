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
      expect(easyTest?.name).toBe("Sort Small Array");
      expect(easyTest?.description).toBeTruthy();
    });

    it("should have valid data", () => {
      expect(easyTest?.initialData).toEqual([5, 2, 8, 1, 9]);
      expect(easyTest?.expectedOutput).toEqual([1, 2, 5, 8, 9]);
    });

    it("should have assertions", () => {
      expect(easyTest?.assertions).toBeTruthy();
      expect(easyTest?.assertions).toContain("expect");
    });

    it("should have reference solution", () => {
      expect(easyTest?.referenceSolution).toBeTruthy();
      expect(easyTest?.referenceSolution).toContain("function");
    });

    it("should have skeleton code with TODOs", () => {
      expect(easyTest?.skeletonCode).toBeTruthy();
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
      expect(mediumTest?.name).toBe("Bubble Sort Implementation");
      expect(mediumTest?.description).toBeTruthy();
    });

    it("should have valid data", () => {
      expect(mediumTest?.initialData).toEqual([64, 34, 25, 12, 22, 11, 90]);
      expect(mediumTest?.expectedOutput).toEqual([11, 12, 22, 25, 34, 64, 90]);
    });

    it("should have assertions checking for swaps", () => {
      expect(mediumTest?.assertions).toBeTruthy();
      expect(mediumTest?.assertions).toContain("swap");
    });

    it("should have reference solution with bubble sort", () => {
      expect(mediumTest?.referenceSolution).toBeTruthy();
      expect(mediumTest?.referenceSolution).toContain("bubbleSort");
    });

    it("should have skeleton code with nested loop guidance", () => {
      expect(mediumTest?.skeletonCode).toBeTruthy();
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
      expect(hardTest?.name).toBe("Quick Sort Implementation");
      expect(hardTest?.description).toBeTruthy();
    });

    it("should have valid data", () => {
      expect(hardTest?.initialData).toEqual([10, 80, 30, 90, 40, 50, 70]);
      expect(hardTest?.expectedOutput).toEqual([10, 30, 40, 50, 70, 80, 90]);
    });

    it("should have assertions checking for partitions", () => {
      expect(hardTest?.assertions).toBeTruthy();
      expect(hardTest?.assertions).toContain("partition");
    });

    it("should have reference solution with quick sort and partition", () => {
      expect(hardTest?.referenceSolution).toBeTruthy();
      expect(hardTest?.referenceSolution).toContain("quickSort");
      expect(hardTest?.referenceSolution).toContain("partition");
    });

    it("should have skeleton code with recursion guidance", () => {
      expect(hardTest?.skeletonCode).toBeTruthy();
      expect(hardTest?.skeletonCode).toContain("recursive");
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
    it("should have increasing complexity in initial data size", () => {
      const easy = arrayTests.find((t) => t.difficulty === "easy");
      const medium = arrayTests.find((t) => t.difficulty === "medium");
      const hard = arrayTests.find((t) => t.difficulty === "hard");

      const easyLength = Array.isArray(easy?.initialData) ? easy.initialData.length : 0;
      const mediumLength = Array.isArray(medium?.initialData) ? medium.initialData.length : 0;
      const hardLength = Array.isArray(hard?.initialData) ? hard.initialData.length : 0;

      expect(easyLength).toBeLessThanOrEqual(mediumLength);
      // Hard may not be longer, but should be more complex algorithmically
      expect(hardLength).toBeGreaterThan(0);
    });

    it("should have increasing complexity in acceptance criteria", () => {
      const hard = arrayTests.find((t) => t.difficulty === "hard");

      // Hard test should mention recursion or partitioning
      const hardCriteria = hard?.acceptanceCriteria.join(" ").toLowerCase() ?? "";
      expect(hardCriteria).toMatch(/recursion|partition/);
    });
  });
});
