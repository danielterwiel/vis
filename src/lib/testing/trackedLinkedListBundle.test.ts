import { describe, it, expect } from "vitest";
import { bundleTrackedLinkedList } from "./trackedLinkedListBundle";

describe("trackedLinkedListBundle", () => {
  describe("Bundle Structure", () => {
    it("should return a non-empty string", () => {
      const bundle = bundleTrackedLinkedList();
      expect(typeof bundle).toBe("string");
      expect(bundle.length).toBeGreaterThan(0);
    });

    it("should define TrackedLinkedList class", () => {
      const bundle = bundleTrackedLinkedList();
      expect(bundle).toContain("class TrackedLinkedList");
    });

    it("should define createTrackedLinkedList helper function", () => {
      const bundle = bundleTrackedLinkedList();
      expect(bundle).toContain("function createTrackedLinkedList");
    });

    it("should be valid JavaScript code", () => {
      const bundle = bundleTrackedLinkedList();
      // Should not throw when creating Function
      expect(() => new Function(bundle)).not.toThrow();
    });
  });

  describe("Required Methods", () => {
    it("should include constructor", () => {
      const bundle = bundleTrackedLinkedList();
      expect(bundle).toContain("constructor(");
    });

    it("should include all accessor methods", () => {
      const bundle = bundleTrackedLinkedList();
      expect(bundle).toContain("getHead()");
      expect(bundle).toContain("getTail()");
      expect(bundle).toContain("getSize()");
      expect(bundle).toContain("toArray()");
    });

    it("should include insertion methods", () => {
      const bundle = bundleTrackedLinkedList();
      expect(bundle).toContain("append(");
      expect(bundle).toContain("prepend(");
      expect(bundle).toContain("insertAt(");
    });

    it("should include deletion methods", () => {
      const bundle = bundleTrackedLinkedList();
      expect(bundle).toContain("delete(");
      expect(bundle).toContain("deleteAt(");
    });

    it("should include search methods", () => {
      const bundle = bundleTrackedLinkedList();
      expect(bundle).toContain("find(");
    });

    it("should include manipulation methods", () => {
      const bundle = bundleTrackedLinkedList();
      expect(bundle).toContain("reverse()");
      expect(bundle).toContain("hasCycle()");
      expect(bundle).toContain("clear()");
    });

    it("should include emitStep method", () => {
      const bundle = bundleTrackedLinkedList();
      expect(bundle).toContain("emitStep(");
    });

    it("should include static from method", () => {
      const bundle = bundleTrackedLinkedList();
      expect(bundle).toContain("static from(");
    });
  });

  describe("Functional TrackedLinkedList", () => {
    it("should create a working TrackedLinkedList instance", () => {
      const bundle = bundleTrackedLinkedList();
      const createInstance = new Function(`
        ${bundle}
        return new TrackedLinkedList([1, 2, 3]);
      `);

      const list = createInstance();
      expect(list).toBeDefined();
      expect(list.getSize()).toBe(3);
    });

    it("should capture operations via callback", () => {
      const bundle = bundleTrackedLinkedList();
      const capturedSteps: unknown[] = [];

      const testCode = new Function(
        "capturedSteps",
        `
        ${bundle}
        const list = new TrackedLinkedList([], (type, target, args, result) => {
          capturedSteps.push({ type, target, args, result });
        });
        list.append(10);
        list.append(20);
      `,
      );

      testCode(capturedSteps);
      expect(capturedSteps.length).toBe(2);
      expect(capturedSteps[0]).toHaveProperty("type", "append");
      expect(capturedSteps[1]).toHaveProperty("type", "append");
    });

    it("should support find operation with step emission", () => {
      const bundle = bundleTrackedLinkedList();
      const capturedSteps: unknown[] = [];

      const testCode = new Function(
        "capturedSteps",
        `
        ${bundle}
        const list = new TrackedLinkedList([10, 20, 30], (type, target, args, result) => {
          capturedSteps.push({ type, target, args, result });
        });
        const node = list.find(20);
        return node ? node.value : null;
      `,
      );

      const result = testCode(capturedSteps);
      expect(result).toBe(20);
      expect(capturedSteps.some((s: any) => s.type === "find")).toBe(true);
    });

    it("should support reverse operation", () => {
      const bundle = bundleTrackedLinkedList();
      const testCode = new Function(`
        ${bundle}
        const list = new TrackedLinkedList([1, 2, 3]);
        list.reverse();
        return list.toArray();
      `);

      const result = testCode();
      expect(result).toEqual([3, 2, 1]);
    });

    it("should support hasCycle operation", () => {
      const bundle = bundleTrackedLinkedList();
      const testCode = new Function(`
        ${bundle}
        const list = new TrackedLinkedList([1, 2, 3]);
        return list.hasCycle();
      `);

      const result = testCode();
      expect(result).toBe(false);
    });

    it("should support toArray conversion", () => {
      const bundle = bundleTrackedLinkedList();
      const testCode = new Function(`
        ${bundle}
        const list = new TrackedLinkedList([5, 10, 15]);
        return list.toArray();
      `);

      const result = testCode();
      expect(result).toEqual([5, 10, 15]);
    });

    it("should support createTrackedLinkedList helper", () => {
      const bundle = bundleTrackedLinkedList();
      const testCode = new Function(`
        ${bundle}
        const list = createTrackedLinkedList([7, 8, 9]);
        return list.toArray();
      `);

      const result = testCode();
      expect(result).toEqual([7, 8, 9]);
    });

    it("should emit steps with correct target type", () => {
      const bundle = bundleTrackedLinkedList();
      const capturedSteps: unknown[] = [];

      const testCode = new Function(
        "capturedSteps",
        `
        ${bundle}
        const list = new TrackedLinkedList([], (type, target, args, result) => {
          capturedSteps.push({ type, target, args, result });
        });
        list.append(100);
      `,
      );

      testCode(capturedSteps);
      expect(capturedSteps[0]).toHaveProperty("target", "linkedList");
    });
  });
});
