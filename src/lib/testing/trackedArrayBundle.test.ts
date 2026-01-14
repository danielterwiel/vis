import { describe, it, expect } from "vitest";
import { bundleTrackedArray } from "./trackedArrayBundle";

describe("trackedArrayBundle", () => {
  describe("bundleTrackedArray", () => {
    it("should return a non-empty string", () => {
      const code = bundleTrackedArray();
      expect(code).toBeTruthy();
      expect(typeof code).toBe("string");
      expect(code.length).toBeGreaterThan(100);
    });

    it("should contain TrackedArray class definition", () => {
      const code = bundleTrackedArray();
      expect(code).toContain("class TrackedArray");
      expect(code).toContain("constructor(initialData");
    });

    it("should contain all core methods", () => {
      const code = bundleTrackedArray();
      const methods = [
        "getData",
        "at",
        "set",
        "push",
        "pop",
        "shift",
        "unshift",
        "swap",
        "compare",
        "reverse",
        "sort",
        "splice",
        "partition",
        "reset",
        "toArray",
        "emitStep",
      ];

      for (const method of methods) {
        expect(code).toContain(method);
      }
    });

    it("should contain helper factory function", () => {
      const code = bundleTrackedArray();
      expect(code).toContain("function createTrackedArray");
    });

    it("should contain static from method", () => {
      const code = bundleTrackedArray();
      expect(code).toContain("static from");
    });

    it("should be valid JavaScript", () => {
      const code = bundleTrackedArray();
      // Should not throw when evaluated
      expect(() => {
        new Function(code);
      }).not.toThrow();
    });

    it("should create functional TrackedArray when evaluated", () => {
      const code = bundleTrackedArray();
      const context = {} as {
        TrackedArray: new (data: number[]) => {
          getData: () => number[];
          length: number;
          push: (value: number) => number;
        };
      };

      // Execute the bundle code in context
      new Function("context", `${code}\ncontext.TrackedArray = TrackedArray;`)(context);

      // Test the class
      expect(context.TrackedArray).toBeDefined();
      const arr = new context.TrackedArray([1, 2, 3]);
      expect(arr.getData()).toEqual([1, 2, 3]);
      expect(arr.length).toBe(3);
      arr.push(4);
      expect(arr.getData()).toEqual([1, 2, 3, 4]);
    });

    it("should emit steps when onOperation callback provided", () => {
      const code = bundleTrackedArray();
      const context = {} as {
        TrackedArray: new (
          data: number[],
          callback: (step: unknown) => void,
        ) => {
          push: (value: number) => number;
        };
        steps: unknown[];
      };

      // Execute the bundle code
      new Function(
        "context",
        `
        ${code}
        context.TrackedArray = TrackedArray;
        context.steps = [];
      `,
      )(context);

      // Create array with callback
      const arr = new context.TrackedArray([1, 2], (step) => context.steps.push(step));
      arr.push(3);

      expect(context.steps.length).toBe(1);
      expect(context.steps[0]).toHaveProperty("type", "push");
    });
  });
});
