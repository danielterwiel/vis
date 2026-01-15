import { describe, it, expect } from "vitest";
import { bundleTrackedHashMap } from "./trackedHashMapBundle";

describe("trackedHashMapBundle", () => {
  describe("bundleTrackedHashMap", () => {
    it("should return a non-empty string", () => {
      const code = bundleTrackedHashMap();
      expect(code).toBeTruthy();
      expect(typeof code).toBe("string");
      expect(code.length).toBeGreaterThan(100);
    });

    it("should contain TrackedHashMap class definition", () => {
      const code = bundleTrackedHashMap();
      expect(code).toContain("class TrackedHashMap");
      expect(code).toContain("constructor(");
    });

    it("should contain all core methods", () => {
      const code = bundleTrackedHashMap();
      const methods = [
        "set",
        "get",
        "delete",
        "has",
        "clear",
        "resize",
        "keys",
        "values",
        "entries",
        "getSize",
        "isEmpty",
        "getCapacity",
        "getLoadFactor",
        "getBuckets",
        "toArray",
        "emitStep",
      ];

      for (const method of methods) {
        expect(code).toContain(method);
      }
    });

    it("should contain helper factory function", () => {
      const code = bundleTrackedHashMap();
      expect(code).toContain("function createTrackedHashMap");
    });

    it("should contain static from method", () => {
      const code = bundleTrackedHashMap();
      expect(code).toContain("static from");
    });

    it("should contain hash function", () => {
      const code = bundleTrackedHashMap();
      expect(code).toContain("hash(key");
    });

    it("should be valid JavaScript", () => {
      const code = bundleTrackedHashMap();
      // Should not throw when evaluated
      expect(() => {
        new Function(code);
      }).not.toThrow();
    });

    it("should create functional TrackedHashMap when evaluated", () => {
      const code = bundleTrackedHashMap();
      const context = {} as {
        TrackedHashMap: new () => {
          set: (key: string, value: number) => void;
          get: (key: string) => number | undefined;
          has: (key: string) => boolean;
          getSize: () => number;
        };
      };

      // Execute the bundle code in context
      new Function("context", `${code}\ncontext.TrackedHashMap = TrackedHashMap;`)(context);

      // Test the class
      expect(context.TrackedHashMap).toBeDefined();
      const map = new context.TrackedHashMap();
      map.set("apple", 3);
      map.set("banana", 7);
      expect(map.get("apple")).toBe(3);
      expect(map.get("banana")).toBe(7);
      expect(map.has("apple")).toBe(true);
      expect(map.has("cherry")).toBe(false);
      expect(map.getSize()).toBe(2);
    });

    it("should emit steps when onOperation callback provided", () => {
      const code = bundleTrackedHashMap();
      const context = {} as {
        TrackedHashMap: new (
          capacity: number,
          loadFactorThreshold: number,
          callback: (step: {
            type: string;
            target: string;
            args: unknown[];
            result: unknown;
            metadata?: Record<string, unknown>;
          }) => void,
        ) => {
          set: (key: string, value: number) => void;
        };
        steps: Array<{
          type: string;
          target: string;
          args: unknown[];
          result: unknown;
          metadata?: Record<string, unknown>;
        }>;
      };

      // Execute the bundle code
      new Function(
        "context",
        `
        ${code}
        context.TrackedHashMap = TrackedHashMap;
        context.steps = [];
      `,
      )(context);

      // Create hash map with callback that receives VisualizationStep
      const map = new context.TrackedHashMap(16, 0.75, (step) => context.steps.push(step));
      map.set("apple", 3);

      expect(context.steps.length).toBe(1);
      const step = context.steps[0];
      expect(step).toBeDefined();
      expect(step).toHaveProperty("type", "set");
      expect(step).toHaveProperty("target", "hashMap");
      expect(step?.metadata).toBeDefined();
      expect(step?.metadata).toHaveProperty("key", "apple");
      expect(step?.metadata).toHaveProperty("value", 3);
    });

    it("should handle collisions with separate chaining", () => {
      const code = bundleTrackedHashMap();
      const context = {} as {
        createTrackedHashMap: (
          capacity?: number,
          loadFactorThreshold?: number,
        ) => {
          set: (key: string, value: number) => void;
          get: (key: string) => number | undefined;
          getSize: () => number;
        };
      };

      // Execute the bundle code
      new Function("context", `${code}\ncontext.createTrackedHashMap = createTrackedHashMap;`)(
        context,
      );

      // Create small capacity map to force collisions
      const map = context.createTrackedHashMap(4, 0.99);
      map.set("a", 1);
      map.set("b", 2);
      map.set("c", 3);
      map.set("d", 4);
      map.set("e", 5);

      // All entries should be retrievable despite collisions
      expect(map.get("a")).toBe(1);
      expect(map.get("b")).toBe(2);
      expect(map.get("c")).toBe(3);
      expect(map.get("d")).toBe(4);
      expect(map.get("e")).toBe(5);
      expect(map.getSize()).toBe(5);
    });

    it("should support updates to existing keys", () => {
      const code = bundleTrackedHashMap();
      const context = {} as {
        createTrackedHashMap: () => {
          set: (key: string, value: number) => void;
          get: (key: string) => number | undefined;
          getSize: () => number;
        };
      };

      // Execute the bundle code
      new Function("context", `${code}\ncontext.createTrackedHashMap = createTrackedHashMap;`)(
        context,
      );

      const map = context.createTrackedHashMap();
      map.set("apple", 3);
      expect(map.get("apple")).toBe(3);
      expect(map.getSize()).toBe(1);

      // Update the same key
      map.set("apple", 5);
      expect(map.get("apple")).toBe(5);
      expect(map.getSize()).toBe(1); // Size should not change
    });

    it("should support deletion", () => {
      const code = bundleTrackedHashMap();
      const context = {} as {
        createTrackedHashMap: () => {
          set: (key: string, value: number) => void;
          get: (key: string) => number | undefined;
          delete: (key: string) => boolean;
          has: (key: string) => boolean;
          getSize: () => number;
        };
      };

      // Execute the bundle code
      new Function("context", `${code}\ncontext.createTrackedHashMap = createTrackedHashMap;`)(
        context,
      );

      const map = context.createTrackedHashMap();
      map.set("apple", 3);
      map.set("banana", 7);
      expect(map.getSize()).toBe(2);

      const deleted = map.delete("apple");
      expect(deleted).toBe(true);
      expect(map.has("apple")).toBe(false);
      expect(map.get("apple")).toBeUndefined();
      expect(map.getSize()).toBe(1);
    });

    it("should support clear operation", () => {
      const code = bundleTrackedHashMap();
      const context = {} as {
        createTrackedHashMap: () => {
          set: (key: string, value: number) => void;
          clear: () => void;
          getSize: () => number;
          isEmpty: () => boolean;
        };
      };

      // Execute the bundle code
      new Function("context", `${code}\ncontext.createTrackedHashMap = createTrackedHashMap;`)(
        context,
      );

      const map = context.createTrackedHashMap();
      map.set("apple", 3);
      map.set("banana", 7);
      map.set("cherry", 11);
      expect(map.getSize()).toBe(3);

      map.clear();
      expect(map.getSize()).toBe(0);
      expect(map.isEmpty()).toBe(true);
    });

    it("should support keys, values, and entries methods", () => {
      const code = bundleTrackedHashMap();
      const context = {} as {
        createTrackedHashMap: () => {
          set: (key: string, value: number) => void;
          keys: () => string[];
          values: () => number[];
          entries: () => Array<[string, number]>;
        };
      };

      // Execute the bundle code
      new Function("context", `${code}\ncontext.createTrackedHashMap = createTrackedHashMap;`)(
        context,
      );

      const map = context.createTrackedHashMap();
      map.set("apple", 3);
      map.set("banana", 7);

      const keys = map.keys();
      const values = map.values();
      const entries = map.entries();

      expect(keys).toContain("apple");
      expect(keys).toContain("banana");
      expect(values).toContain(3);
      expect(values).toContain(7);
      expect(entries.length).toBe(2);
      expect(entries.some(([k, v]) => k === "apple" && v === 3)).toBe(true);
      expect(entries.some(([k, v]) => k === "banana" && v === 7)).toBe(true);
    });
  });
});
