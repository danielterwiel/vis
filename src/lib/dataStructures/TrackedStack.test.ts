import { describe, it, expect, vi } from "vitest";
import { TrackedStack, createTrackedStack } from "./TrackedStack";
import type { VisualizationStep } from "../../store/useAppStore";

describe("TrackedStack", () => {
  describe("constructor and initialization", () => {
    it("should create an empty stack", () => {
      const stack = new TrackedStack<number>();
      expect(stack.getSize()).toBe(0);
      expect(stack.isEmpty()).toBe(true);
      expect(stack.getData()).toEqual([]);
    });

    it("should accept operation callback", () => {
      const callback = vi.fn();
      const stack = new TrackedStack<number>(callback);
      stack.push(1);
      expect(callback).toHaveBeenCalled();
    });

    it("should work with createTrackedStack helper", () => {
      const stack = createTrackedStack<number>();
      expect(stack.getSize()).toBe(0);
      expect(stack.isEmpty()).toBe(true);
    });
  });

  describe("push operation", () => {
    it("should add element to top of stack", () => {
      const stack = new TrackedStack<number>();
      stack.push(1);
      expect(stack.getSize()).toBe(1);
      expect(stack.getData()).toEqual([1]);
    });

    it("should add multiple elements", () => {
      const stack = new TrackedStack<number>();
      stack.push(1).push(2).push(3);
      expect(stack.getSize()).toBe(3);
      expect(stack.getData()).toEqual([1, 2, 3]);
    });

    it("should emit push step", () => {
      const callback = vi.fn();
      const stack = new TrackedStack<number>(callback);
      stack.push(42);

      expect(callback).toHaveBeenCalledWith({
        type: "push",
        target: "stack",
        args: [42],
        result: [42],
        timestamp: expect.any(Number),
        metadata: {
          index: 0,
          value: 42,
        },
      });
    });

    it("should return stack for chaining", () => {
      const stack = new TrackedStack<number>();
      const result = stack.push(1);
      expect(result).toBe(stack);
    });

    it("should work with different types", () => {
      const stringStack = new TrackedStack<string>();
      stringStack.push("hello");
      expect(stringStack.getData()).toEqual(["hello"]);

      const objectStack = new TrackedStack<{ id: number }>();
      objectStack.push({ id: 1 });
      expect(objectStack.getData()).toEqual([{ id: 1 }]);
    });
  });

  describe("pop operation", () => {
    it("should remove and return top element", () => {
      const stack = new TrackedStack<number>();
      stack.push(1).push(2).push(3);
      const value = stack.pop();
      expect(value).toBe(3);
      expect(stack.getData()).toEqual([1, 2]);
    });

    it("should return undefined for empty stack", () => {
      const stack = new TrackedStack<number>();
      const value = stack.pop();
      expect(value).toBeUndefined();
      expect(stack.isEmpty()).toBe(true);
    });

    it("should emit pop step with value", () => {
      const callback = vi.fn();
      const stack = new TrackedStack<number>(callback);
      stack.push(1).push(2);
      callback.mockClear();

      stack.pop();

      expect(callback).toHaveBeenCalledWith({
        type: "pop",
        target: "stack",
        args: [],
        result: [1],
        timestamp: expect.any(Number),
        metadata: {
          index: 1,
          value: 2,
        },
      });
    });

    it("should emit pop step for empty stack", () => {
      const callback = vi.fn();
      const stack = new TrackedStack<number>(callback);
      stack.pop();

      expect(callback).toHaveBeenCalledWith({
        type: "pop",
        target: "stack",
        args: [],
        result: undefined,
        timestamp: expect.any(Number),
        metadata: {
          empty: true,
        },
      });
    });

    it("should handle multiple pops", () => {
      const stack = new TrackedStack<number>();
      stack.push(1).push(2).push(3);
      expect(stack.pop()).toBe(3);
      expect(stack.pop()).toBe(2);
      expect(stack.pop()).toBe(1);
      expect(stack.pop()).toBeUndefined();
    });
  });

  describe("peek operation", () => {
    it("should return top element without removing it", () => {
      const stack = new TrackedStack<number>();
      stack.push(1).push(2).push(3);
      const value = stack.peek();
      expect(value).toBe(3);
      expect(stack.getSize()).toBe(3);
      expect(stack.getData()).toEqual([1, 2, 3]);
    });

    it("should return undefined for empty stack", () => {
      const stack = new TrackedStack<number>();
      expect(stack.peek()).toBeUndefined();
    });

    it("should emit peek step", () => {
      const callback = vi.fn();
      const stack = new TrackedStack<number>(callback);
      stack.push(1).push(2);
      callback.mockClear();

      stack.peek();

      expect(callback).toHaveBeenCalledWith({
        type: "peek",
        target: "stack",
        args: [],
        result: 2,
        timestamp: expect.any(Number),
        metadata: {
          index: 1,
          value: 2,
        },
      });
    });
  });

  describe("clear operation", () => {
    it("should remove all elements", () => {
      const stack = new TrackedStack<number>();
      stack.push(1).push(2).push(3);
      stack.clear();
      expect(stack.isEmpty()).toBe(true);
      expect(stack.getSize()).toBe(0);
      expect(stack.getData()).toEqual([]);
    });

    it("should emit clear step", () => {
      const callback = vi.fn();
      const stack = new TrackedStack<number>(callback);
      stack.push(1).push(2).push(3);
      callback.mockClear();

      stack.clear();

      expect(callback).toHaveBeenCalledWith({
        type: "clear",
        target: "stack",
        args: [],
        result: [],
        timestamp: expect.any(Number),
        metadata: {
          previousSize: 3,
        },
      });
    });

    it("should return stack for chaining", () => {
      const stack = new TrackedStack<number>();
      stack.push(1);
      const result = stack.clear();
      expect(result).toBe(stack);
    });
  });

  describe("isEmpty", () => {
    it("should return true for empty stack", () => {
      const stack = new TrackedStack<number>();
      expect(stack.isEmpty()).toBe(true);
    });

    it("should return false for non-empty stack", () => {
      const stack = new TrackedStack<number>();
      stack.push(1);
      expect(stack.isEmpty()).toBe(false);
    });

    it("should return true after popping all elements", () => {
      const stack = new TrackedStack<number>();
      stack.push(1);
      stack.pop();
      expect(stack.isEmpty()).toBe(true);
    });
  });

  describe("getSize", () => {
    it("should return 0 for empty stack", () => {
      const stack = new TrackedStack<number>();
      expect(stack.getSize()).toBe(0);
    });

    it("should return correct size after pushes", () => {
      const stack = new TrackedStack<number>();
      stack.push(1);
      expect(stack.getSize()).toBe(1);
      stack.push(2);
      expect(stack.getSize()).toBe(2);
    });

    it("should return correct size after pops", () => {
      const stack = new TrackedStack<number>();
      stack.push(1).push(2).push(3);
      stack.pop();
      expect(stack.getSize()).toBe(2);
    });
  });

  describe("getData", () => {
    it("should return read-only copy", () => {
      const stack = new TrackedStack<number>();
      stack.push(1).push(2);
      const data = stack.getData();
      expect(data).toEqual([1, 2]);

      // Modifying returned array shouldn't affect stack
      (data as number[]).push(3);
      expect(stack.getData()).toEqual([1, 2]);
    });
  });

  describe("toArray", () => {
    it("should convert stack to array", () => {
      const stack = new TrackedStack<number>();
      stack.push(1).push(2).push(3);
      expect(stack.toArray()).toEqual([1, 2, 3]);
    });

    it("should return empty array for empty stack", () => {
      const stack = new TrackedStack<number>();
      expect(stack.toArray()).toEqual([]);
    });

    it("should return copy not reference", () => {
      const stack = new TrackedStack<number>();
      stack.push(1);
      const array = stack.toArray();
      array.push(2);
      expect(stack.toArray()).toEqual([1]);
    });
  });

  describe("static from method", () => {
    it("should create stack from array", () => {
      const stack = TrackedStack.from([1, 2, 3]);
      expect(stack.getSize()).toBe(3);
      expect(stack.getData()).toEqual([1, 2, 3]);
    });

    it("should create empty stack from empty array", () => {
      const stack = TrackedStack.from<number>([]);
      expect(stack.isEmpty()).toBe(true);
    });

    it("should accept operation callback", () => {
      const callback = vi.fn();
      const stack = TrackedStack.from([1, 2], callback);
      stack.push(3);
      expect(callback).toHaveBeenCalled();
    });

    it("should work with different types", () => {
      const stringStack = TrackedStack.from(["a", "b", "c"]);
      expect(stringStack.getData()).toEqual(["a", "b", "c"]);
    });
  });

  describe("callback integration", () => {
    it("should emit step for each operation", () => {
      const callback = vi.fn();
      const stack = new TrackedStack<number>(callback);

      stack.push(1);
      stack.push(2);
      stack.peek();
      stack.pop();
      stack.clear();

      expect(callback).toHaveBeenCalledTimes(5);
    });

    it("should not call callback if not provided", () => {
      const stack = new TrackedStack<number>();
      // Should not throw
      stack.push(1);
      stack.pop();
      expect(stack.getSize()).toBe(0);
    });

    it("should emit correct step structure", () => {
      const steps: VisualizationStep[] = [];
      const stack = new TrackedStack<number>((step) => steps.push(step));

      stack.push(1);

      expect(steps[0]).toEqual({
        type: "push",
        target: "stack",
        args: [1],
        result: [1],
        timestamp: expect.any(Number),
        metadata: expect.any(Object),
      });
    });
  });

  describe("LIFO behavior", () => {
    it("should follow Last-In-First-Out order", () => {
      const stack = new TrackedStack<number>();
      stack.push(1).push(2).push(3);

      expect(stack.pop()).toBe(3);
      expect(stack.pop()).toBe(2);
      expect(stack.pop()).toBe(1);
    });

    it("should maintain order with mixed operations", () => {
      const stack = new TrackedStack<string>();
      stack.push("first");
      stack.push("second");
      stack.pop(); // remove "second"
      stack.push("third");

      expect(stack.peek()).toBe("third");
      expect(stack.pop()).toBe("third");
      expect(stack.pop()).toBe("first");
    });
  });

  describe("edge cases", () => {
    it("should handle single element", () => {
      const stack = new TrackedStack<number>();
      stack.push(42);
      expect(stack.peek()).toBe(42);
      expect(stack.pop()).toBe(42);
      expect(stack.isEmpty()).toBe(true);
    });

    it("should handle large number of elements", () => {
      const stack = new TrackedStack<number>();
      for (let i = 0; i < 1000; i++) {
        stack.push(i);
      }
      expect(stack.getSize()).toBe(1000);
      expect(stack.peek()).toBe(999);
    });

    it("should handle complex objects", () => {
      interface Task {
        id: number;
        name: string;
      }
      const stack = new TrackedStack<Task>();
      stack.push({ id: 1, name: "Task 1" });
      stack.push({ id: 2, name: "Task 2" });

      const task = stack.pop();
      expect(task).toEqual({ id: 2, name: "Task 2" });
    });
  });
});
