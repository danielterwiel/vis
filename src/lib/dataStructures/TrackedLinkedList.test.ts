import { describe, it, expect, vi } from "vitest";
import { TrackedLinkedList, createTrackedLinkedList } from "./TrackedLinkedList";

describe("TrackedLinkedList", () => {
  describe("constructor", () => {
    it("creates empty list", () => {
      const list = new TrackedLinkedList<number>();
      expect(list.getSize()).toBe(0);
      expect(list.getHead()).toBeNull();
      expect(list.getTail()).toBeNull();
      expect(list.toArray()).toEqual([]);
    });

    it("creates list from initial values", () => {
      const list = new TrackedLinkedList([1, 2, 3]);
      expect(list.getSize()).toBe(3);
      expect(list.toArray()).toEqual([1, 2, 3]);
      expect(list.getHead()?.value).toBe(1);
      expect(list.getTail()?.value).toBe(3);
    });

    it("accepts onOperation callback", () => {
      const callback = vi.fn();
      new TrackedLinkedList([1], callback);
      expect(callback).toHaveBeenCalled();
    });
  });

  describe("append", () => {
    it("appends to empty list", () => {
      const list = new TrackedLinkedList<number>();
      list.append(1);
      expect(list.toArray()).toEqual([1]);
      expect(list.getSize()).toBe(1);
      expect(list.getHead()?.value).toBe(1);
      expect(list.getTail()?.value).toBe(1);
    });

    it("appends to non-empty list", () => {
      const list = new TrackedLinkedList([1, 2]);
      list.append(3);
      expect(list.toArray()).toEqual([1, 2, 3]);
      expect(list.getSize()).toBe(3);
      expect(list.getTail()?.value).toBe(3);
    });

    it("emits step with metadata", () => {
      const callback = vi.fn();
      const list = new TrackedLinkedList<number>(undefined, callback);
      list.append(5);

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "append",
          target: "linkedList",
          args: [5],
          result: [5],
          metadata: { index: 0, value: 5 },
        }),
      );
    });

    it("supports chaining", () => {
      const list = new TrackedLinkedList<number>();
      const result = list.append(1).append(2).append(3);
      expect(result).toBe(list);
      expect(list.toArray()).toEqual([1, 2, 3]);
    });
  });

  describe("prepend", () => {
    it("prepends to empty list", () => {
      const list = new TrackedLinkedList<number>();
      list.prepend(1);
      expect(list.toArray()).toEqual([1]);
      expect(list.getHead()?.value).toBe(1);
      expect(list.getTail()?.value).toBe(1);
    });

    it("prepends to non-empty list", () => {
      const list = new TrackedLinkedList([2, 3]);
      list.prepend(1);
      expect(list.toArray()).toEqual([1, 2, 3]);
      expect(list.getHead()?.value).toBe(1);
    });

    it("emits step with metadata", () => {
      const callback = vi.fn();
      const list = new TrackedLinkedList<number>(undefined, callback);
      list.prepend(5);

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "prepend",
          metadata: { index: 0, value: 5 },
        }),
      );
    });
  });

  describe("insertAt", () => {
    it("inserts at beginning (index 0)", () => {
      const list = new TrackedLinkedList([2, 3]);
      list.insertAt(0, 1);
      expect(list.toArray()).toEqual([1, 2, 3]);
    });

    it("inserts at end (index = size)", () => {
      const list = new TrackedLinkedList([1, 2]);
      list.insertAt(2, 3);
      expect(list.toArray()).toEqual([1, 2, 3]);
    });

    it("inserts in middle", () => {
      const list = new TrackedLinkedList([1, 3]);
      list.insertAt(1, 2);
      expect(list.toArray()).toEqual([1, 2, 3]);
    });

    it("throws on negative index", () => {
      const list = new TrackedLinkedList([1]);
      expect(() => list.insertAt(-1, 0)).toThrow("Index out of bounds");
    });

    it("throws on index > size", () => {
      const list = new TrackedLinkedList([1]);
      expect(() => list.insertAt(5, 0)).toThrow("Index out of bounds");
    });

    it("emits step with metadata", () => {
      const callback = vi.fn();
      const list = new TrackedLinkedList([1, 3], callback);
      callback.mockClear();
      list.insertAt(1, 2);

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "insertAt",
          metadata: { index: 1, value: 2 },
        }),
      );
    });
  });

  describe("delete", () => {
    it("deletes head node", () => {
      const list = new TrackedLinkedList([1, 2, 3]);
      const result = list.delete(1);
      expect(result).toBe(true);
      expect(list.toArray()).toEqual([2, 3]);
      expect(list.getHead()?.value).toBe(2);
    });

    it("deletes middle node", () => {
      const list = new TrackedLinkedList([1, 2, 3]);
      const result = list.delete(2);
      expect(result).toBe(true);
      expect(list.toArray()).toEqual([1, 3]);
    });

    it("deletes tail node", () => {
      const list = new TrackedLinkedList([1, 2, 3]);
      const result = list.delete(3);
      expect(result).toBe(true);
      expect(list.toArray()).toEqual([1, 2]);
      expect(list.getTail()?.value).toBe(2);
    });

    it("returns false when value not found", () => {
      const list = new TrackedLinkedList([1, 2, 3]);
      const result = list.delete(5);
      expect(result).toBe(false);
      expect(list.toArray()).toEqual([1, 2, 3]);
    });

    it("handles empty list", () => {
      const list = new TrackedLinkedList<number>();
      const result = list.delete(1);
      expect(result).toBe(false);
    });

    it("updates tail when deleting last node", () => {
      const list = new TrackedLinkedList([1]);
      list.delete(1);
      expect(list.getTail()).toBeNull();
    });

    it("emits step with deleted=true when found", () => {
      const callback = vi.fn();
      const list = new TrackedLinkedList([1, 2], callback);
      callback.mockClear();
      list.delete(2);

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "delete",
          metadata: expect.objectContaining({ deleted: true }),
        }),
      );
    });

    it("emits step with deleted=false when not found", () => {
      const callback = vi.fn();
      const list = new TrackedLinkedList([1, 2], callback);
      callback.mockClear();
      list.delete(5);

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "delete",
          metadata: expect.objectContaining({ deleted: false }),
        }),
      );
    });
  });

  describe("deleteAt", () => {
    it("deletes at index 0", () => {
      const list = new TrackedLinkedList([1, 2, 3]);
      const value = list.deleteAt(0);
      expect(value).toBe(1);
      expect(list.toArray()).toEqual([2, 3]);
    });

    it("deletes at middle index", () => {
      const list = new TrackedLinkedList([1, 2, 3]);
      const value = list.deleteAt(1);
      expect(value).toBe(2);
      expect(list.toArray()).toEqual([1, 3]);
    });

    it("deletes at last index", () => {
      const list = new TrackedLinkedList([1, 2, 3]);
      const value = list.deleteAt(2);
      expect(value).toBe(3);
      expect(list.toArray()).toEqual([1, 2]);
      expect(list.getTail()?.value).toBe(2);
    });

    it("returns null for negative index", () => {
      const list = new TrackedLinkedList([1]);
      const value = list.deleteAt(-1);
      expect(value).toBeNull();
    });

    it("returns null for index >= size", () => {
      const list = new TrackedLinkedList([1]);
      const value = list.deleteAt(5);
      expect(value).toBeNull();
    });

    it("emits step with metadata", () => {
      const callback = vi.fn();
      const list = new TrackedLinkedList([1, 2], callback);
      callback.mockClear();
      list.deleteAt(1);

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "deleteAt",
          metadata: { index: 1, value: 2 },
        }),
      );
    });
  });

  describe("find", () => {
    it("finds existing value", () => {
      const list = new TrackedLinkedList([1, 2, 3]);
      const node = list.find(2);
      expect(node?.value).toBe(2);
    });

    it("returns null when value not found", () => {
      const list = new TrackedLinkedList([1, 2, 3]);
      const node = list.find(5);
      expect(node).toBeNull();
    });

    it("returns null for empty list", () => {
      const list = new TrackedLinkedList<number>();
      const node = list.find(1);
      expect(node).toBeNull();
    });

    it("emits steps for each comparison", () => {
      const callback = vi.fn();
      const list = new TrackedLinkedList([1, 2, 3], callback);
      callback.mockClear();
      list.find(3);

      // Should emit 3 steps (comparing 1, 2, 3)
      expect(callback).toHaveBeenCalledTimes(3);
      expect(callback).toHaveBeenLastCalledWith(
        expect.objectContaining({
          type: "find",
          metadata: expect.objectContaining({ found: true }),
        }),
      );
    });
  });

  describe("reverse", () => {
    it("reverses non-empty list", () => {
      const list = new TrackedLinkedList([1, 2, 3]);
      list.reverse();
      expect(list.toArray()).toEqual([3, 2, 1]);
      expect(list.getHead()?.value).toBe(3);
      expect(list.getTail()?.value).toBe(1);
    });

    it("handles single-element list", () => {
      const list = new TrackedLinkedList([1]);
      list.reverse();
      expect(list.toArray()).toEqual([1]);
    });

    it("handles empty list", () => {
      const list = new TrackedLinkedList<number>();
      list.reverse();
      expect(list.toArray()).toEqual([]);
    });

    it("emits steps during reversal", () => {
      const callback = vi.fn();
      const list = new TrackedLinkedList([1, 2, 3], callback);
      callback.mockClear();
      list.reverse();

      // Should emit steps for each reversal + final completion step
      expect(callback).toHaveBeenCalled();
      expect(callback).toHaveBeenLastCalledWith(
        expect.objectContaining({
          type: "reverse",
          metadata: expect.objectContaining({ completed: true }),
        }),
      );
    });

    it("supports chaining", () => {
      const list = new TrackedLinkedList([1, 2, 3]);
      const result = list.reverse();
      expect(result).toBe(list);
    });
  });

  describe("hasCycle", () => {
    it("returns false for empty list", () => {
      const list = new TrackedLinkedList<number>();
      expect(list.hasCycle()).toBe(false);
    });

    it("returns false for list without cycle", () => {
      const list = new TrackedLinkedList([1, 2, 3]);
      expect(list.hasCycle()).toBe(false);
    });

    it("emits steps during cycle detection", () => {
      const callback = vi.fn();
      const list = new TrackedLinkedList([1, 2, 3], callback);
      callback.mockClear();
      list.hasCycle();

      expect(callback).toHaveBeenCalled();
      expect(callback).toHaveBeenLastCalledWith(
        expect.objectContaining({
          type: "hasCycle",
          metadata: expect.objectContaining({ hasCycle: false }),
        }),
      );
    });
  });

  describe("clear", () => {
    it("clears non-empty list", () => {
      const list = new TrackedLinkedList([1, 2, 3]);
      list.clear();
      expect(list.toArray()).toEqual([]);
      expect(list.getSize()).toBe(0);
      expect(list.getHead()).toBeNull();
      expect(list.getTail()).toBeNull();
    });

    it("clears empty list", () => {
      const list = new TrackedLinkedList<number>();
      list.clear();
      expect(list.toArray()).toEqual([]);
      expect(list.getSize()).toBe(0);
    });

    it("emits step with metadata", () => {
      const callback = vi.fn();
      const list = new TrackedLinkedList([1, 2], callback);
      callback.mockClear();
      list.clear();

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "clear",
          metadata: { cleared: true },
        }),
      );
    });

    it("supports chaining", () => {
      const list = new TrackedLinkedList([1, 2, 3]);
      const result = list.clear();
      expect(result).toBe(list);
    });
  });

  describe("static from", () => {
    it("creates list from values", () => {
      const list = TrackedLinkedList.from([1, 2, 3]);
      expect(list.toArray()).toEqual([1, 2, 3]);
    });

    it("accepts callback", () => {
      const callback = vi.fn();
      TrackedLinkedList.from([1], callback);
      expect(callback).toHaveBeenCalled();
    });
  });

  describe("createTrackedLinkedList helper", () => {
    it("creates list", () => {
      const list = createTrackedLinkedList([1, 2, 3]);
      expect(list.toArray()).toEqual([1, 2, 3]);
    });

    it("accepts callback", () => {
      const callback = vi.fn();
      createTrackedLinkedList([1], callback);
      expect(callback).toHaveBeenCalled();
    });
  });

  describe("type safety", () => {
    it("works with numbers", () => {
      const list = new TrackedLinkedList<number>([1, 2, 3]);
      expect(list.toArray()).toEqual([1, 2, 3]);
    });

    it("works with strings", () => {
      const list = new TrackedLinkedList<string>(["a", "b", "c"]);
      expect(list.toArray()).toEqual(["a", "b", "c"]);
    });

    it("works with objects", () => {
      const list = new TrackedLinkedList<{ id: number }>([{ id: 1 }, { id: 2 }]);
      expect(list.toArray()).toEqual([{ id: 1 }, { id: 2 }]);
    });
  });

  describe("callback integration", () => {
    it("calls callback for all operations", () => {
      const callback = vi.fn();
      const list = new TrackedLinkedList<number>(undefined, callback);

      list.append(1);
      list.prepend(0);
      list.insertAt(1, 0.5);

      expect(callback).toHaveBeenCalledTimes(3);
    });

    it("includes timestamp in steps", () => {
      const callback = vi.fn();
      const list = new TrackedLinkedList<number>(undefined, callback);

      list.append(1);

      const step = callback.mock.calls[0]?.[0];
      expect(typeof step?.timestamp).toBe("number");
      expect(step?.timestamp).toBeGreaterThan(0);
    });

    it("includes result snapshot in steps", () => {
      const callback = vi.fn();
      const list = new TrackedLinkedList<number>(undefined, callback);

      list.append(1);
      list.append(2);

      const step = callback.mock.calls[1]?.[0];
      expect(step?.result).toEqual([1, 2]);
    });
  });
});
