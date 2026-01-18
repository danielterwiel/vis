import { describe, it, expect } from "vitest";
import { stackQueueTests } from "./stackQueueTests";

describe("stackQueueTests", () => {
  describe("structure", () => {
    it("should export 6 test cases (3 stack + 3 queue)", () => {
      expect(stackQueueTests).toHaveLength(6);
    });

    it("should have unique IDs", () => {
      const ids = stackQueueTests.map((test) => test.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have tests for each difficulty level", () => {
      const difficulties = stackQueueTests.map((test) => test.difficulty);
      expect(difficulties.filter((d) => d === "easy").length).toBeGreaterThan(0);
      expect(difficulties.filter((d) => d === "medium").length).toBeGreaterThan(0);
      expect(difficulties.filter((d) => d === "hard").length).toBeGreaterThan(0);
    });

    it("should follow naming convention: stack-* or queue-* or min-stack-*", () => {
      const ids = stackQueueTests.map((test) => test.id);
      ids.forEach((id) => {
        expect(id).toMatch(/^(stack|queue|min-stack)-[a-z-]+$/);
      });
    });

    it("should have queue tests with queue- prefix", () => {
      const queueTests = stackQueueTests.filter((test) => test.id.startsWith("queue-"));
      expect(queueTests.length).toBeGreaterThanOrEqual(3);
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

    it("should have at least 3 hints per test", () => {
      stackQueueTests.forEach((test) => {
        expect(test.hints.length).toBeGreaterThanOrEqual(3);
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
    describe("Stack: Easy (LIFO)", () => {
      const test = stackQueueTests.find((t) => t.id === "stack-process-easy");

      it("should have array as input", () => {
        expect(Array.isArray(test?.initialData)).toBe(true);
        expect(test?.initialData).toEqual([1, 2, 3, 4, 5, 6]);
      });

      it("should expect LIFO order as output (reversed)", () => {
        expect(test?.expectedOutput).toEqual([6, 5, 4, 3, 2, 1]);
      });

      it("should use stack data structure", () => {
        expect(test?.referenceSolution).toContain("createTrackedStack");
        expect(test?.referenceSolution).toContain("push");
        expect(test?.referenceSolution).toContain("pop");
        expect(test?.referenceSolution).toContain("isEmpty");
      });
    });

    describe("Stack: Medium (Double Reversal)", () => {
      const test = stackQueueTests.find((t) => t.id === "stack-process-medium");

      it("should have array as input", () => {
        expect(Array.isArray(test?.initialData)).toBe(true);
        expect(test?.initialData).toEqual([1, 2, 3, 4, 5, 6]);
      });

      it("should expect FIFO order as output (double reversal)", () => {
        expect(test?.expectedOutput).toEqual([1, 2, 3, 4, 5, 6]);
      });

      it("should use two stacks", () => {
        expect(test?.referenceSolution).toContain("createTrackedStack");
        const stackMatches = test?.referenceSolution.match(/createTrackedStack/g);
        expect(stackMatches?.length).toBe(2);
      });

      it("should verify push operations", () => {
        expect(test?.assertions).toContain("push");
      });
    });

    describe("Stack: Hard (Queue using Two Stacks)", () => {
      const test = stackQueueTests.find((t) => t.id === "stack-process-hard");

      it("should have array as input", () => {
        expect(Array.isArray(test?.initialData)).toBe(true);
        expect(test?.initialData).toEqual([1, 2, 3, 4, 5, 6]);
      });

      it("should expect FIFO order as output", () => {
        expect(test?.expectedOutput).toEqual([1, 2, 3, 4, 5, 6]);
      });

      it("should use two stacks", () => {
        expect(test?.referenceSolution).toContain("createTrackedStack");
        const stackMatches = test?.referenceSolution.match(/createTrackedStack/g);
        expect(stackMatches?.length).toBe(2);
      });

      it("should verify push and pop operations", () => {
        expect(test?.assertions).toContain("push");
        expect(test?.assertions).toContain("pop");
      });
    });

    describe("Queue: Easy (Basic FIFO)", () => {
      const test = stackQueueTests.find((t) => t.id === "queue-process-easy");

      it("should have array as input", () => {
        expect(Array.isArray(test?.initialData)).toBe(true);
        expect(test?.initialData).toEqual([1, 2, 3, 4, 5, 6]);
      });

      it("should expect FIFO order as output", () => {
        expect(test?.expectedOutput).toEqual([1, 2, 3, 4, 5, 6]);
      });

      it("should use queue data structure", () => {
        expect(test?.referenceSolution).toContain("createTrackedQueue");
        expect(test?.referenceSolution).toContain("enqueue");
        expect(test?.referenceSolution).toContain("dequeue");
        expect(test?.referenceSolution).toContain("isEmpty");
      });
    });

    describe("Queue: Medium (Rotation)", () => {
      const test = stackQueueTests.find((t) => t.id === "queue-process-medium");

      it("should have array as input", () => {
        expect(Array.isArray(test?.initialData)).toBe(true);
        expect(test?.initialData).toEqual([1, 2, 3, 4, 5, 6]);
      });

      it("should expect FIFO order as output", () => {
        expect(test?.expectedOutput).toEqual([1, 2, 3, 4, 5, 6]);
      });

      it("should use queue operations", () => {
        expect(test?.referenceSolution).toContain("createTrackedQueue");
        expect(test?.referenceSolution).toContain("enqueue");
        expect(test?.referenceSolution).toContain("dequeue");
      });

      it("should verify enqueue operations", () => {
        expect(test?.assertions).toContain("enqueue");
      });
    });

    describe("Queue: Hard (Two Queues)", () => {
      const test = stackQueueTests.find((t) => t.id === "queue-process-hard");

      it("should have array as input", () => {
        expect(Array.isArray(test?.initialData)).toBe(true);
        expect(test?.initialData).toEqual([1, 2, 3, 4, 5, 6]);
      });

      it("should expect FIFO order as output", () => {
        expect(test?.expectedOutput).toEqual([1, 2, 3, 4, 5, 6]);
      });

      it("should use two queues", () => {
        expect(test?.referenceSolution).toContain("createTrackedQueue");
        const queueMatches = test?.referenceSolution.match(/createTrackedQueue/g);
        expect(queueMatches?.length).toBe(2);
      });

      it("should verify enqueue and dequeue operations", () => {
        expect(test?.assertions).toContain("enqueue");
        expect(test?.assertions).toContain("dequeue");
      });
    });
  });

  describe("Dataset Consistency", () => {
    it("should use the same dataset for all stack tests", () => {
      const stackEasy = stackQueueTests.find((t) => t.id === "stack-process-easy");
      const stackMedium = stackQueueTests.find((t) => t.id === "stack-process-medium");
      const stackHard = stackQueueTests.find((t) => t.id === "stack-process-hard");
      expect(stackEasy?.initialData).toEqual([1, 2, 3, 4, 5, 6]);
      expect(stackMedium?.initialData).toEqual([1, 2, 3, 4, 5, 6]);
      expect(stackHard?.initialData).toEqual([1, 2, 3, 4, 5, 6]);
    });

    it("should use the same dataset for all queue tests", () => {
      const queueEasy = stackQueueTests.find((t) => t.id === "queue-process-easy");
      const queueMedium = stackQueueTests.find((t) => t.id === "queue-process-medium");
      const queueHard = stackQueueTests.find((t) => t.id === "queue-process-hard");
      expect(queueEasy?.initialData).toEqual([1, 2, 3, 4, 5, 6]);
      expect(queueMedium?.initialData).toEqual([1, 2, 3, 4, 5, 6]);
      expect(queueHard?.initialData).toEqual([1, 2, 3, 4, 5, 6]);
    });
  });
});
