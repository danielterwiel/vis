import { describe, it, expect } from "vitest";
import { stackQueueTests } from "./stackQueueTests";

describe("stackQueueTests", () => {
  describe("structure", () => {
    it("should export 3 test cases", () => {
      expect(stackQueueTests).toHaveLength(3);
    });

    it("should have unique IDs", () => {
      const ids = stackQueueTests.map((test) => test.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have one test per difficulty level", () => {
      const difficulties = stackQueueTests.map((test) => test.difficulty);
      expect(difficulties).toContain("easy");
      expect(difficulties).toContain("medium");
      expect(difficulties).toContain("hard");
    });

    it("should follow naming convention: stack-*-easy, queue-*-medium, *-hard", () => {
      const ids = stackQueueTests.map((test) => test.id);
      ids.forEach((id) => {
        expect(id).toMatch(/^(stack|queue|min-stack)-[a-z-]+$/);
      });
    });
  });

  describe("test case fields", () => {
    it("should have all required fields", () => {
      stackQueueTests.forEach((test) => {
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
      });
    });

    it("should have non-empty strings for text fields", () => {
      stackQueueTests.forEach((test) => {
        expect(test.name.length).toBeGreaterThan(0);
        expect(test.description.length).toBeGreaterThan(0);
        expect(test.assertions.trim().length).toBeGreaterThan(0);
        expect(test.referenceSolution.trim().length).toBeGreaterThan(0);
        expect(test.skeletonCode.trim().length).toBeGreaterThan(0);
      });
    });

    it("should have 3 hints per test", () => {
      stackQueueTests.forEach((test) => {
        expect(test.hints).toHaveLength(3);
        test.hints.forEach((hint) => {
          expect(hint.length).toBeGreaterThan(0);
        });
      });
    });

    it("should have 3 acceptance criteria per test", () => {
      stackQueueTests.forEach((test) => {
        expect(test.acceptanceCriteria).toHaveLength(3);
        test.acceptanceCriteria.forEach((criterion) => {
          expect(criterion.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe("assertions", () => {
    it("should contain expect statements", () => {
      stackQueueTests.forEach((test) => {
        expect(test.assertions).toContain("expect(");
      });
    });

    it("should check for result correctness", () => {
      stackQueueTests.forEach((test) => {
        expect(test.assertions).toMatch(/expect\(result\)/);
      });
    });

    it("should verify visualization steps for medium and hard tests", () => {
      const mediumHard = stackQueueTests.filter((test) =>
        ["medium", "hard"].includes(test.difficulty),
      );
      mediumHard.forEach((test) => {
        expect(test.assertions).toContain("steps");
      });
    });
  });

  describe("reference solutions", () => {
    it("should contain function definitions", () => {
      stackQueueTests.forEach((test) => {
        expect(test.referenceSolution).toMatch(/function\s+\w+/);
      });
    });

    it("should use TrackedStack or TrackedQueue methods", () => {
      stackQueueTests.forEach((test) => {
        const hasTrackedMethods =
          test.referenceSolution.includes("createTrackedStack") ||
          test.referenceSolution.includes("createTrackedQueue") ||
          test.referenceSolution.includes(".push(") ||
          test.referenceSolution.includes(".pop(") ||
          test.referenceSolution.includes(".enqueue(") ||
          test.referenceSolution.includes(".dequeue(") ||
          test.referenceSolution.includes(".isEmpty()") ||
          test.referenceSolution.includes(".peek()");
        expect(hasTrackedMethods).toBe(true);
      });
    });

    it("should return appropriate values", () => {
      stackQueueTests.forEach((test) => {
        expect(test.referenceSolution).toContain("return");
      });
    });
  });

  describe("skeleton code", () => {
    it("should contain TODO comments", () => {
      stackQueueTests.forEach((test) => {
        expect(test.skeletonCode).toContain("TODO");
      });
    });

    it("should mention TrackedStack or TrackedQueue methods in comments", () => {
      stackQueueTests.forEach((test) => {
        const hasTrackedMethods =
          test.skeletonCode.includes("createTrackedStack") ||
          test.skeletonCode.includes("createTrackedQueue") ||
          test.skeletonCode.includes("stack.push") ||
          test.skeletonCode.includes("stack.pop") ||
          test.skeletonCode.includes("stack.isEmpty") ||
          test.skeletonCode.includes("stack.peek") ||
          test.skeletonCode.includes("queue.enqueue") ||
          test.skeletonCode.includes("queue.dequeue");
        expect(hasTrackedMethods).toBe(true);
      });
    });

    it("should have function structure", () => {
      stackQueueTests.forEach((test) => {
        expect(test.skeletonCode).toMatch(/function\s+\w+/);
      });
    });
  });

  describe("hints", () => {
    it("should provide progressively more detailed guidance", () => {
      stackQueueTests.forEach((test) => {
        // First hint should be general
        expect(test.hints[0]?.length).toBeGreaterThan(10);
        // Last hint should be more specific
        expect(test.hints[2]?.length).toBeGreaterThan(10);
      });
    });

    it("should not give away the complete solution", () => {
      stackQueueTests.forEach((test) => {
        test.hints.forEach((hint) => {
          // Hints should not contain complete function implementations
          expect(hint).not.toMatch(/function\s+\w+\s*\([^)]*\)\s*\{[\s\S]+\}/);
        });
      });
    });
  });

  describe("specific test cases", () => {
    describe("Easy: Balanced Parentheses", () => {
      const easyTest = stackQueueTests.find((test) => test.difficulty === "easy");

      it("should have balanced parentheses as input", () => {
        expect(easyTest?.initialData).toBe("(()())");
      });

      it("should expect true as output", () => {
        expect(easyTest?.expectedOutput).toBe(true);
      });

      it("should use stack data structure", () => {
        expect(easyTest?.referenceSolution).toContain("createTrackedStack");
        expect(easyTest?.referenceSolution).toContain("push");
        expect(easyTest?.referenceSolution).toContain("pop");
        expect(easyTest?.referenceSolution).toContain("isEmpty");
      });
    });

    describe("Medium: Queue Using Two Stacks", () => {
      const mediumTest = stackQueueTests.find((test) => test.difficulty === "medium");

      it("should have array as input", () => {
        expect(Array.isArray(mediumTest?.initialData)).toBe(true);
        expect(mediumTest?.initialData).toEqual([1, 2, 3, 4, 5]);
      });

      it("should expect FIFO order as output", () => {
        expect(mediumTest?.expectedOutput).toEqual([1, 2, 3, 4, 5]);
      });

      it("should use two stacks", () => {
        expect(mediumTest?.referenceSolution).toContain("createTrackedStack");
        const stackMatches = mediumTest?.referenceSolution.match(/createTrackedStack/g);
        expect(stackMatches?.length).toBe(2);
      });

      it("should verify push and pop operations", () => {
        expect(mediumTest?.assertions).toContain("push");
        expect(mediumTest?.assertions).toContain("pop");
      });
    });

    describe("Hard: Min Stack", () => {
      const hardTest = stackQueueTests.find((test) => test.difficulty === "hard");

      it("should have array as input", () => {
        expect(Array.isArray(hardTest?.initialData)).toBe(true);
        expect(hardTest?.initialData).toEqual([5, 2, 8, 1, 9]);
      });

      it("should expect minimum value as output", () => {
        expect(hardTest?.expectedOutput).toBe(1);
      });

      it("should use two stacks (main + min)", () => {
        expect(hardTest?.referenceSolution).toContain("createTrackedStack");
        const stackMatches = hardTest?.referenceSolution.match(/createTrackedStack/g);
        expect(stackMatches?.length).toBe(2);
      });

      it("should verify push operations", () => {
        expect(hardTest?.assertions).toContain("push");
      });
    });
  });
});
