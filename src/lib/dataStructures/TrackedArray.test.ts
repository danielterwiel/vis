import { describe, it, expect, vi } from "vitest";
import { TrackedArray, createTrackedArray } from "./TrackedArray";
import type { VisualizationStep } from "../../store/useAppStore";

describe("TrackedArray", () => {
  describe("constructor and initialization", () => {
    it("should create empty array by default", () => {
      const arr = new TrackedArray();
      expect(arr.getData()).toEqual([]);
      expect(arr.length).toBe(0);
    });

    it("should initialize with data", () => {
      const arr = new TrackedArray([1, 2, 3]);
      expect(arr.getData()).toEqual([1, 2, 3]);
      expect(arr.length).toBe(3);
    });

    it("should accept operation callback", () => {
      const callback = vi.fn();
      const arr = new TrackedArray([1, 2], callback);
      arr.push(3);
      expect(callback).toHaveBeenCalledOnce();
    });

    it("should create copy of initial data", () => {
      const data = [1, 2, 3];
      const arr = new TrackedArray(data);
      data[0] = 999;
      expect(arr.getData()).toEqual([1, 2, 3]);
    });
  });

  describe("getData", () => {
    it("should return copy of data", () => {
      const arr = new TrackedArray([1, 2, 3]);
      const data = arr.getData();
      data[0] = 999;
      expect(arr.getData()).toEqual([1, 2, 3]);
    });
  });

  describe("at", () => {
    it("should get element at index", () => {
      const arr = new TrackedArray([10, 20, 30]);
      expect(arr.at(0)).toBe(10);
      expect(arr.at(1)).toBe(20);
      expect(arr.at(2)).toBe(30);
    });

    it("should return undefined for out of bounds", () => {
      const arr = new TrackedArray([1, 2]);
      expect(arr.at(5)).toBeUndefined();
      expect(arr.at(-1)).toBeUndefined();
    });
  });

  describe("set", () => {
    it("should set element at index", () => {
      const arr = new TrackedArray([1, 2, 3]);
      arr.set(1, 99);
      expect(arr.getData()).toEqual([1, 99, 3]);
    });

    it("should emit set step", () => {
      const callback = vi.fn();
      const arr = new TrackedArray([1, 2, 3], callback);
      arr.set(1, 99);

      expect(callback).toHaveBeenCalledOnce();
      const step: VisualizationStep = callback.mock.calls[0]![0]!;
      expect(step.type).toBe("set");
      expect(step.args).toEqual([1, 99]);
      expect(step.metadata?.index).toBe(1);
      expect(step.metadata?.value).toBe(99);
      expect(step.metadata?.oldValue).toBe(2);
    });
  });

  describe("push", () => {
    it("should push element to end", () => {
      const arr = new TrackedArray([1, 2]);
      const result = arr.push(3);
      expect(result).toBe(3);
      expect(arr.getData()).toEqual([1, 2, 3]);
    });

    it("should emit push step", () => {
      const callback = vi.fn();
      const arr = new TrackedArray([1, 2], callback);
      arr.push(3);

      expect(callback).toHaveBeenCalledOnce();
      const step: VisualizationStep = callback.mock.calls[0]![0]!;
      expect(step.type).toBe("push");
      expect(step.args).toEqual([3]);
      expect(step.metadata?.index).toBe(2);
      expect(step.metadata?.value).toBe(3);
    });
  });

  describe("pop", () => {
    it("should pop element from end", () => {
      const arr = new TrackedArray([1, 2, 3]);
      const value = arr.pop();
      expect(value).toBe(3);
      expect(arr.getData()).toEqual([1, 2]);
    });

    it("should return undefined for empty array", () => {
      const arr = new TrackedArray<number>();
      expect(arr.pop()).toBeUndefined();
    });

    it("should emit pop step", () => {
      const callback = vi.fn();
      const arr = new TrackedArray([1, 2, 3], callback);
      arr.pop();

      expect(callback).toHaveBeenCalledOnce();
      const step: VisualizationStep = callback.mock.calls[0]![0]!;
      expect(step.type).toBe("pop");
      expect(step.metadata?.value).toBe(3);
    });
  });

  describe("shift", () => {
    it("should shift element from start", () => {
      const arr = new TrackedArray([1, 2, 3]);
      const value = arr.shift();
      expect(value).toBe(1);
      expect(arr.getData()).toEqual([2, 3]);
    });

    it("should emit shift step", () => {
      const callback = vi.fn();
      const arr = new TrackedArray([1, 2, 3], callback);
      arr.shift();

      expect(callback).toHaveBeenCalledOnce();
      const step: VisualizationStep = callback.mock.calls[0]![0]!;
      expect(step.type).toBe("shift");
      expect(step.metadata?.value).toBe(1);
      expect(step.metadata?.index).toBe(0);
    });
  });

  describe("unshift", () => {
    it("should unshift element to start", () => {
      const arr = new TrackedArray([2, 3]);
      const result = arr.unshift(1);
      expect(result).toBe(3);
      expect(arr.getData()).toEqual([1, 2, 3]);
    });

    it("should emit unshift step", () => {
      const callback = vi.fn();
      const arr = new TrackedArray([2, 3], callback);
      arr.unshift(1);

      expect(callback).toHaveBeenCalledOnce();
      const step: VisualizationStep = callback.mock.calls[0]![0]!;
      expect(step.type).toBe("unshift");
      expect(step.args).toEqual([1]);
      expect(step.metadata?.value).toBe(1);
      expect(step.metadata?.index).toBe(0);
    });
  });

  describe("swap", () => {
    it("should swap two elements", () => {
      const arr = new TrackedArray([1, 2, 3]);
      arr.swap(0, 2);
      expect(arr.getData()).toEqual([3, 2, 1]);
    });

    it("should throw for invalid indices", () => {
      const arr = new TrackedArray([1, 2, 3]);
      expect(() => arr.swap(-1, 0)).toThrow("Invalid indices");
      expect(() => arr.swap(0, 5)).toThrow("Invalid indices");
    });

    it("should emit swap step", () => {
      const callback = vi.fn();
      const arr = new TrackedArray([1, 2, 3], callback);
      arr.swap(0, 2);

      expect(callback).toHaveBeenCalledOnce();
      const step: VisualizationStep = callback.mock.calls[0]![0]!;
      expect(step.type).toBe("swap");
      expect(step.args).toEqual([0, 2]);
      expect(step.metadata?.indices).toEqual([0, 2]);
      expect(step.metadata?.values).toEqual([3, 1]);
    });
  });

  describe("compare", () => {
    it("should compare two elements and return comparison result", () => {
      const arr = new TrackedArray([3, 1, 2]);
      expect(arr.compare(0, 1)).toBe(1); // 3 > 1
      expect(arr.compare(1, 2)).toBe(-1); // 1 < 2
      expect(arr.compare(0, 0)).toBe(0); // 3 === 3
    });

    it("should emit compare step", () => {
      const callback = vi.fn();
      const arr = new TrackedArray([3, 1, 2], callback);
      arr.compare(0, 1);

      expect(callback).toHaveBeenCalledOnce();
      const step: VisualizationStep = callback.mock.calls[0]![0]!;
      expect(step.type).toBe("compare");
      expect(step.args).toEqual([0, 1]);
      expect(step.metadata?.indices).toEqual([0, 1]);
      expect(step.metadata?.values).toEqual([3, 1]);
      expect(step.metadata?.comparison).toBe(1);
    });
  });

  describe("reverse", () => {
    it("should reverse the array", () => {
      const arr = new TrackedArray([1, 2, 3, 4]);
      arr.reverse();
      expect(arr.getData()).toEqual([4, 3, 2, 1]);
    });

    it("should emit reverse step", () => {
      const callback = vi.fn();
      const arr = new TrackedArray([1, 2, 3], callback);
      arr.reverse();

      expect(callback).toHaveBeenCalledOnce();
      const step: VisualizationStep = callback.mock.calls[0]![0]!;
      expect(step.type).toBe("reverse");
    });
  });

  describe("sort", () => {
    it("should sort the array with default comparison", () => {
      const arr = new TrackedArray([3, 1, 4, 1, 5]);
      arr.sort((a, b) => a - b);
      expect(arr.getData()).toEqual([1, 1, 3, 4, 5]);
    });

    it("should sort with custom compareFn", () => {
      const arr = new TrackedArray([3, 1, 4, 1, 5]);
      arr.sort((a, b) => b - a); // descending
      expect(arr.getData()).toEqual([5, 4, 3, 1, 1]);
    });

    it("should emit sort step", () => {
      const callback = vi.fn();
      const arr = new TrackedArray([3, 1, 2], callback);
      arr.sort((a, b) => a - b);

      expect(callback).toHaveBeenCalledOnce();
      const step: VisualizationStep = callback.mock.calls[0]![0]!;
      expect(step.type).toBe("sort");
      expect(step.metadata?.sorted).toBe(true);
    });
  });

  describe("splice", () => {
    it("should remove elements", () => {
      const arr = new TrackedArray([1, 2, 3, 4]);
      const deleted = arr.splice(1, 2);
      expect(deleted).toEqual([2, 3]);
      expect(arr.getData()).toEqual([1, 4]);
    });

    it("should insert elements", () => {
      const arr = new TrackedArray([1, 4]);
      arr.splice(1, 0, 2, 3);
      expect(arr.getData()).toEqual([1, 2, 3, 4]);
    });

    it("should replace elements", () => {
      const arr = new TrackedArray([1, 2, 3, 4]);
      const deleted = arr.splice(1, 2, 99, 88);
      expect(deleted).toEqual([2, 3]);
      expect(arr.getData()).toEqual([1, 99, 88, 4]);
    });

    it("should emit splice step", () => {
      const callback = vi.fn();
      const arr = new TrackedArray([1, 2, 3], callback);
      arr.splice(1, 1, 99);

      expect(callback).toHaveBeenCalledOnce();
      const step: VisualizationStep = callback.mock.calls[0]![0]!;
      expect(step.type).toBe("splice");
      expect(step.metadata?.start).toBe(1);
      expect(step.metadata?.deleteCount).toBe(1);
      expect(step.metadata?.deleted).toEqual([2]);
    });
  });

  describe("partition", () => {
    it("should emit partition step with metadata", () => {
      const callback = vi.fn();
      const arr = new TrackedArray([3, 1, 4, 1, 5], callback);
      arr.partition(2, [0, 1, 3], [4]);

      expect(callback).toHaveBeenCalledOnce();
      const step: VisualizationStep = callback.mock.calls[0]![0]!;
      expect(step.type).toBe("partition");
      expect(step.args).toEqual([2]);
      expect(step.metadata?.pivotIndex).toBe(2);
      expect(step.metadata?.leftIndices).toEqual([0, 1, 3]);
      expect(step.metadata?.rightIndices).toEqual([4]);
    });
  });

  describe("reset", () => {
    it("should reset array to new data", () => {
      const arr = new TrackedArray([1, 2, 3]);
      arr.reset([10, 20]);
      expect(arr.getData()).toEqual([10, 20]);
      expect(arr.length).toBe(2);
    });

    it("should emit reset step", () => {
      const callback = vi.fn();
      const arr = new TrackedArray([1, 2, 3], callback);
      arr.reset([10, 20]);

      expect(callback).toHaveBeenCalledOnce();
      const step: VisualizationStep = callback.mock.calls[0]![0]!;
      expect(step.type).toBe("reset");
    });
  });

  describe("toArray", () => {
    it("should convert to standard array", () => {
      const arr = new TrackedArray([1, 2, 3]);
      const standard = arr.toArray();
      expect(standard).toEqual([1, 2, 3]);
      expect(Array.isArray(standard)).toBe(true);
    });
  });

  describe("static from", () => {
    it("should create TrackedArray from data", () => {
      const arr = TrackedArray.from([1, 2, 3]);
      expect(arr.getData()).toEqual([1, 2, 3]);
    });

    it("should accept callback", () => {
      const callback = vi.fn();
      const arr = TrackedArray.from([1, 2], callback);
      arr.push(3);
      expect(callback).toHaveBeenCalledOnce();
    });
  });

  describe("createTrackedArray", () => {
    it("should create TrackedArray", () => {
      const arr = createTrackedArray([1, 2, 3]);
      expect(arr.getData()).toEqual([1, 2, 3]);
    });

    it("should accept callback", () => {
      const callback = vi.fn();
      const arr = createTrackedArray([1, 2], callback);
      arr.push(3);
      expect(callback).toHaveBeenCalledOnce();
    });
  });

  describe("operation callback integration", () => {
    it("should not call callback if not provided", () => {
      const arr = new TrackedArray([1, 2]);
      // Should not throw
      arr.push(3);
      arr.pop();
      arr.swap(0, 1);
    });

    it("should call callback for all operations", () => {
      const callback = vi.fn();
      const arr = new TrackedArray([1, 2, 3], callback);

      arr.push(4);
      arr.pop();
      arr.shift();
      arr.unshift(0);
      arr.set(0, 99);
      arr.swap(0, 1);
      arr.compare(0, 1);
      arr.reverse();
      arr.sort((a, b) => a - b);
      arr.splice(0, 1);
      arr.partition(0, [], [1]);
      arr.reset([1, 2]);

      expect(callback).toHaveBeenCalledTimes(12);
    });

    it("should pass correct step structure", () => {
      const callback = vi.fn();
      const arr = new TrackedArray([1, 2, 3], callback);
      arr.push(4);

      const step: VisualizationStep = callback.mock.calls[0]![0]!;
      expect(step).toHaveProperty("type");
      expect(step).toHaveProperty("target");
      expect(step).toHaveProperty("args");
      expect(step).toHaveProperty("result");
      expect(step).toHaveProperty("timestamp");
      expect(step).toHaveProperty("metadata");
      expect(typeof step.timestamp).toBe("number");
    });
  });

  describe("type safety", () => {
    it("should work with number arrays", () => {
      const arr = new TrackedArray<number>([1, 2, 3]);
      arr.push(4);
      expect(arr.getData()).toEqual([1, 2, 3, 4]);
    });

    it("should work with string arrays", () => {
      const arr = new TrackedArray<string>(["a", "b", "c"]);
      arr.push("d");
      expect(arr.getData()).toEqual(["a", "b", "c", "d"]);
    });

    it("should work with object arrays", () => {
      type Item = { id: number; name: string };
      const arr = new TrackedArray<Item>([
        { id: 1, name: "Alice" },
        { id: 2, name: "Bob" },
      ]);
      arr.push({ id: 3, name: "Charlie" });
      expect(arr.length).toBe(3);
    });
  });
});
