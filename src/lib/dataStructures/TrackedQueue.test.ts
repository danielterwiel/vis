import { describe, it, expect, vi } from "vitest";
import { TrackedQueue, createTrackedQueue } from "./TrackedQueue";
import type { VisualizationStep } from "../../store/useAppStore";

describe("TrackedQueue", () => {
  describe("constructor and initialization", () => {
    it("should create an empty queue", () => {
      const queue = new TrackedQueue<number>();
      expect(queue.getSize()).toBe(0);
      expect(queue.isEmpty()).toBe(true);
      expect(queue.getData()).toEqual([]);
    });

    it("should accept operation callback", () => {
      const callback = vi.fn();
      const queue = new TrackedQueue<number>(callback);
      queue.enqueue(1);
      expect(callback).toHaveBeenCalled();
    });

    it("should work with createTrackedQueue helper", () => {
      const queue = createTrackedQueue<number>();
      expect(queue.getSize()).toBe(0);
      expect(queue.isEmpty()).toBe(true);
    });
  });

  describe("enqueue operation", () => {
    it("should add element to back of queue", () => {
      const queue = new TrackedQueue<number>();
      queue.enqueue(1);
      expect(queue.getSize()).toBe(1);
      expect(queue.getData()).toEqual([1]);
    });

    it("should add multiple elements", () => {
      const queue = new TrackedQueue<number>();
      queue.enqueue(1).enqueue(2).enqueue(3);
      expect(queue.getSize()).toBe(3);
      expect(queue.getData()).toEqual([1, 2, 3]);
    });

    it("should emit enqueue step", () => {
      const callback = vi.fn();
      const queue = new TrackedQueue<number>(callback);
      queue.enqueue(42);

      expect(callback).toHaveBeenCalledWith({
        type: "enqueue",
        target: "queue",
        args: [42],
        result: [42],
        timestamp: expect.any(Number),
        metadata: {
          index: 0,
          value: 42,
        },
      });
    });

    it("should return queue for chaining", () => {
      const queue = new TrackedQueue<number>();
      const result = queue.enqueue(1);
      expect(result).toBe(queue);
    });

    it("should work with different types", () => {
      const stringQueue = new TrackedQueue<string>();
      stringQueue.enqueue("hello");
      expect(stringQueue.getData()).toEqual(["hello"]);

      const objectQueue = new TrackedQueue<{ id: number }>();
      objectQueue.enqueue({ id: 1 });
      expect(objectQueue.getData()).toEqual([{ id: 1 }]);
    });
  });

  describe("dequeue operation", () => {
    it("should remove and return front element", () => {
      const queue = new TrackedQueue<number>();
      queue.enqueue(1).enqueue(2).enqueue(3);
      const value = queue.dequeue();
      expect(value).toBe(1);
      expect(queue.getData()).toEqual([2, 3]);
    });

    it("should return undefined for empty queue", () => {
      const queue = new TrackedQueue<number>();
      const value = queue.dequeue();
      expect(value).toBeUndefined();
      expect(queue.isEmpty()).toBe(true);
    });

    it("should emit dequeue step with value", () => {
      const callback = vi.fn();
      const queue = new TrackedQueue<number>(callback);
      queue.enqueue(1).enqueue(2);
      callback.mockClear();

      queue.dequeue();

      expect(callback).toHaveBeenCalledWith({
        type: "dequeue",
        target: "queue",
        args: [],
        result: [2],
        timestamp: expect.any(Number),
        metadata: {
          value: 1,
        },
      });
    });

    it("should emit dequeue step for empty queue", () => {
      const callback = vi.fn();
      const queue = new TrackedQueue<number>(callback);
      queue.dequeue();

      expect(callback).toHaveBeenCalledWith({
        type: "dequeue",
        target: "queue",
        args: [],
        result: undefined,
        timestamp: expect.any(Number),
        metadata: {
          empty: true,
        },
      });
    });

    it("should handle multiple dequeues", () => {
      const queue = new TrackedQueue<number>();
      queue.enqueue(1).enqueue(2).enqueue(3);
      expect(queue.dequeue()).toBe(1);
      expect(queue.dequeue()).toBe(2);
      expect(queue.dequeue()).toBe(3);
      expect(queue.dequeue()).toBeUndefined();
    });
  });

  describe("peek operation", () => {
    it("should return front element without removing it", () => {
      const queue = new TrackedQueue<number>();
      queue.enqueue(1).enqueue(2).enqueue(3);
      const value = queue.peek();
      expect(value).toBe(1);
      expect(queue.getSize()).toBe(3);
      expect(queue.getData()).toEqual([1, 2, 3]);
    });

    it("should return undefined for empty queue", () => {
      const queue = new TrackedQueue<number>();
      expect(queue.peek()).toBeUndefined();
    });

    it("should emit peek step", () => {
      const callback = vi.fn();
      const queue = new TrackedQueue<number>(callback);
      queue.enqueue(1).enqueue(2);
      callback.mockClear();

      queue.peek();

      expect(callback).toHaveBeenCalledWith({
        type: "peek",
        target: "queue",
        args: [],
        result: 1,
        timestamp: expect.any(Number),
        metadata: {
          index: 0,
          value: 1,
        },
      });
    });
  });

  describe("clear operation", () => {
    it("should remove all elements", () => {
      const queue = new TrackedQueue<number>();
      queue.enqueue(1).enqueue(2).enqueue(3);
      queue.clear();
      expect(queue.isEmpty()).toBe(true);
      expect(queue.getSize()).toBe(0);
      expect(queue.getData()).toEqual([]);
    });

    it("should emit clear step", () => {
      const callback = vi.fn();
      const queue = new TrackedQueue<number>(callback);
      queue.enqueue(1).enqueue(2).enqueue(3);
      callback.mockClear();

      queue.clear();

      expect(callback).toHaveBeenCalledWith({
        type: "clear",
        target: "queue",
        args: [],
        result: [],
        timestamp: expect.any(Number),
        metadata: {
          previousSize: 3,
        },
      });
    });

    it("should return queue for chaining", () => {
      const queue = new TrackedQueue<number>();
      queue.enqueue(1);
      const result = queue.clear();
      expect(result).toBe(queue);
    });
  });

  describe("isEmpty", () => {
    it("should return true for empty queue", () => {
      const queue = new TrackedQueue<number>();
      expect(queue.isEmpty()).toBe(true);
    });

    it("should return false for non-empty queue", () => {
      const queue = new TrackedQueue<number>();
      queue.enqueue(1);
      expect(queue.isEmpty()).toBe(false);
    });

    it("should return true after dequeuing all elements", () => {
      const queue = new TrackedQueue<number>();
      queue.enqueue(1);
      queue.dequeue();
      expect(queue.isEmpty()).toBe(true);
    });
  });

  describe("getSize", () => {
    it("should return 0 for empty queue", () => {
      const queue = new TrackedQueue<number>();
      expect(queue.getSize()).toBe(0);
    });

    it("should return correct size after enqueues", () => {
      const queue = new TrackedQueue<number>();
      queue.enqueue(1);
      expect(queue.getSize()).toBe(1);
      queue.enqueue(2);
      expect(queue.getSize()).toBe(2);
    });

    it("should return correct size after dequeues", () => {
      const queue = new TrackedQueue<number>();
      queue.enqueue(1).enqueue(2).enqueue(3);
      queue.dequeue();
      expect(queue.getSize()).toBe(2);
    });
  });

  describe("getData", () => {
    it("should return read-only copy", () => {
      const queue = new TrackedQueue<number>();
      queue.enqueue(1).enqueue(2);
      const data = queue.getData();
      expect(data).toEqual([1, 2]);

      // Modifying returned array shouldn't affect queue
      (data as number[]).push(3);
      expect(queue.getData()).toEqual([1, 2]);
    });
  });

  describe("toArray", () => {
    it("should convert queue to array", () => {
      const queue = new TrackedQueue<number>();
      queue.enqueue(1).enqueue(2).enqueue(3);
      expect(queue.toArray()).toEqual([1, 2, 3]);
    });

    it("should return empty array for empty queue", () => {
      const queue = new TrackedQueue<number>();
      expect(queue.toArray()).toEqual([]);
    });

    it("should return copy not reference", () => {
      const queue = new TrackedQueue<number>();
      queue.enqueue(1);
      const array = queue.toArray();
      array.push(2);
      expect(queue.toArray()).toEqual([1]);
    });
  });

  describe("static from method", () => {
    it("should create queue from array", () => {
      const queue = TrackedQueue.from([1, 2, 3]);
      expect(queue.getSize()).toBe(3);
      expect(queue.getData()).toEqual([1, 2, 3]);
    });

    it("should create empty queue from empty array", () => {
      const queue = TrackedQueue.from<number>([]);
      expect(queue.isEmpty()).toBe(true);
    });

    it("should accept operation callback", () => {
      const callback = vi.fn();
      const queue = TrackedQueue.from([1, 2], callback);
      queue.enqueue(3);
      expect(callback).toHaveBeenCalled();
    });

    it("should work with different types", () => {
      const stringQueue = TrackedQueue.from(["a", "b", "c"]);
      expect(stringQueue.getData()).toEqual(["a", "b", "c"]);
    });
  });

  describe("callback integration", () => {
    it("should emit step for each operation", () => {
      const callback = vi.fn();
      const queue = new TrackedQueue<number>(callback);

      queue.enqueue(1);
      queue.enqueue(2);
      queue.peek();
      queue.dequeue();
      queue.clear();

      expect(callback).toHaveBeenCalledTimes(5);
    });

    it("should not call callback if not provided", () => {
      const queue = new TrackedQueue<number>();
      // Should not throw
      queue.enqueue(1);
      queue.dequeue();
      expect(queue.getSize()).toBe(0);
    });

    it("should emit correct step structure", () => {
      const steps: VisualizationStep[] = [];
      const queue = new TrackedQueue<number>((step) => steps.push(step));

      queue.enqueue(1);

      expect(steps[0]).toEqual({
        type: "enqueue",
        target: "queue",
        args: [1],
        result: [1],
        timestamp: expect.any(Number),
        metadata: expect.any(Object),
      });
    });
  });

  describe("FIFO behavior", () => {
    it("should follow First-In-First-Out order", () => {
      const queue = new TrackedQueue<number>();
      queue.enqueue(1).enqueue(2).enqueue(3);

      expect(queue.dequeue()).toBe(1);
      expect(queue.dequeue()).toBe(2);
      expect(queue.dequeue()).toBe(3);
    });

    it("should maintain order with mixed operations", () => {
      const queue = new TrackedQueue<string>();
      queue.enqueue("first");
      queue.enqueue("second");
      queue.dequeue(); // remove "first"
      queue.enqueue("third");

      expect(queue.peek()).toBe("second");
      expect(queue.dequeue()).toBe("second");
      expect(queue.dequeue()).toBe("third");
    });
  });

  describe("edge cases", () => {
    it("should handle single element", () => {
      const queue = new TrackedQueue<number>();
      queue.enqueue(42);
      expect(queue.peek()).toBe(42);
      expect(queue.dequeue()).toBe(42);
      expect(queue.isEmpty()).toBe(true);
    });

    it("should handle large number of elements", () => {
      const queue = new TrackedQueue<number>();
      for (let i = 0; i < 1000; i++) {
        queue.enqueue(i);
      }
      expect(queue.getSize()).toBe(1000);
      expect(queue.peek()).toBe(0);
    });

    it("should handle complex objects", () => {
      interface Task {
        id: number;
        name: string;
      }
      const queue = new TrackedQueue<Task>();
      queue.enqueue({ id: 1, name: "Task 1" });
      queue.enqueue({ id: 2, name: "Task 2" });

      const task = queue.dequeue();
      expect(task).toEqual({ id: 1, name: "Task 1" });
    });
  });
});
