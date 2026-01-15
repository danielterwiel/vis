import { describe, expect, it } from "vitest";
import { hashMapTests } from "./hashMapTests";

describe("hashMapTests", () => {
  it("should export an array of test cases", () => {
    expect(Array.isArray(hashMapTests)).toBe(true);
    expect(hashMapTests.length).toBe(3);
  });

  it("should have one test case per difficulty level", () => {
    const difficulties = hashMapTests.map((test) => test.difficulty);
    expect(difficulties).toContain("easy");
    expect(difficulties).toContain("medium");
    expect(difficulties).toContain("hard");
  });

  describe("Easy test case", () => {
    const easyTest = hashMapTests.find((t) => t.difficulty === "easy");

    it("should have valid structure", () => {
      expect(easyTest).toBeDefined();
      expect(easyTest?.id).toBe("hashmap-getset-easy");
      expect(easyTest?.name).toBe("Basic Get/Set Operations");
      expect(easyTest?.description).toBeTruthy();
    });

    it("should have valid data", () => {
      expect(easyTest?.initialData).toEqual([]);
      expect(easyTest?.expectedOutput).toEqual([3, 7, 11]);
    });

    it("should have assertions", () => {
      expect(easyTest?.assertions).toBeTruthy();
      expect(easyTest?.assertions).toContain("expect");
    });

    it("should have reference solution", () => {
      expect(easyTest?.referenceSolution).toBeTruthy();
      expect(easyTest?.referenceSolution).toContain("function");
      expect(easyTest?.referenceSolution).toContain("createTrackedHashMap");
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
    const mediumTest = hashMapTests.find((t) => t.difficulty === "medium");

    it("should have valid structure", () => {
      expect(mediumTest).toBeDefined();
      expect(mediumTest?.id).toBe("hashmap-collision-medium");
      expect(mediumTest?.name).toBe("Collision Handling with Chaining");
      expect(mediumTest?.description).toBeTruthy();
    });

    it("should have valid data", () => {
      expect(mediumTest?.initialData).toEqual([]);
      expect(mediumTest?.expectedOutput).toEqual({
        size: 5,
        hasAll: true,
        correctValues: true,
      });
    });

    it("should have assertions checking for collision handling", () => {
      expect(mediumTest?.assertions).toBeTruthy();
      expect(mediumTest?.assertions).toContain("hasAll");
      expect(mediumTest?.assertions).toContain("correctValues");
    });

    it("should have reference solution with collision handling", () => {
      expect(mediumTest?.referenceSolution).toBeTruthy();
      expect(mediumTest?.referenceSolution).toContain("handleCollisions");
    });

    it("should have skeleton code with collision guidance", () => {
      expect(mediumTest?.skeletonCode).toBeTruthy();
      expect(mediumTest?.skeletonCode).toContain("collision");
    });

    it("should have hints about collision handling", () => {
      expect(mediumTest?.hints).toBeDefined();
      expect(mediumTest?.hints.some((h) => h.toLowerCase().includes("collision"))).toBe(true);
    });
  });

  describe("Hard test case", () => {
    const hardTest = hashMapTests.find((t) => t.difficulty === "hard");

    it("should have valid structure", () => {
      expect(hardTest).toBeDefined();
      expect(hardTest?.id).toBe("hashmap-frequency-hard");
      expect(hardTest?.name).toBe("Character Frequency Counter");
      expect(hardTest?.description).toBeTruthy();
    });

    it("should have valid data", () => {
      expect(hardTest?.initialData).toBe("hello world");
      expect(hardTest?.expectedOutput).toEqual({ char: "l", count: 3 });
    });

    it("should have assertions checking for frequency count", () => {
      expect(hardTest?.assertions).toBeTruthy();
      expect(hardTest?.assertions).toContain("char");
      expect(hardTest?.assertions).toContain("count");
    });

    it("should have reference solution with frequency counting", () => {
      expect(hardTest?.referenceSolution).toBeTruthy();
      expect(hardTest?.referenceSolution).toContain("characterFrequency");
      expect(hardTest?.referenceSolution).toContain("entries");
    });

    it("should have skeleton code with iteration guidance", () => {
      expect(hardTest?.skeletonCode).toBeTruthy();
      expect(hardTest?.skeletonCode).toContain("TODO");
    });

    it("should have hints about frequency counting", () => {
      expect(hardTest?.hints).toBeDefined();
      expect(hardTest?.hints.some((h) => h.toLowerCase().includes("frequency"))).toBe(true);
    });
  });

  describe("Test case IDs", () => {
    it("should have unique IDs", () => {
      const ids = hashMapTests.map((test) => test.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should follow naming convention", () => {
      hashMapTests.forEach((test) => {
        expect(test.id).toMatch(/^hashmap-\w+-(easy|medium|hard)$/);
      });
    });
  });

  describe("Difficulty progression", () => {
    it("should have increasing complexity in operations", () => {
      const easy = hashMapTests.find((t) => t.difficulty === "easy");
      const medium = hashMapTests.find((t) => t.difficulty === "medium");
      const hard = hashMapTests.find((t) => t.difficulty === "hard");

      // Easy: basic get/set
      expect(easy?.name).toContain("Basic");

      // Medium: collision handling
      expect(medium?.name).toContain("Collision");

      // Hard: frequency counter (practical application)
      expect(hard?.name).toContain("Frequency");
    });

    it("should have increasing complexity in acceptance criteria", () => {
      const easy = hashMapTests.find((t) => t.difficulty === "easy");
      const hard = hashMapTests.find((t) => t.difficulty === "hard");

      const easyCriteriaLength = easy?.acceptanceCriteria.length ?? 0;
      const hardCriteriaLength = hard?.acceptanceCriteria.length ?? 0;

      expect(hardCriteriaLength).toBeGreaterThanOrEqual(easyCriteriaLength);
    });
  });
});
