import { describe, it, expect } from "vitest";
import { bundleTrackedStack } from "./trackedStackBundle";

describe("bundleTrackedStack", () => {
  it("should return a non-empty string", () => {
    const bundle = bundleTrackedStack();
    expect(typeof bundle).toBe("string");
    expect(bundle.length).toBeGreaterThan(0);
  });

  it("should define TrackedStack class", () => {
    const bundle = bundleTrackedStack();
    expect(bundle).toContain("class TrackedStack");
  });

  it("should include constructor", () => {
    const bundle = bundleTrackedStack();
    expect(bundle).toContain("constructor(onOperation)");
  });

  it("should include all core methods", () => {
    const bundle = bundleTrackedStack();
    const methods = ["push", "pop", "peek", "clear", "isEmpty", "getSize", "getData", "toArray"];
    methods.forEach((method) => {
      expect(bundle).toContain(method);
    });
  });

  it("should include emitStep method", () => {
    const bundle = bundleTrackedStack();
    expect(bundle).toContain("emitStep");
  });

  it("should include static from method", () => {
    const bundle = bundleTrackedStack();
    expect(bundle).toContain("static from");
  });

  it("should include createTrackedStack helper function", () => {
    const bundle = bundleTrackedStack();
    expect(bundle).toContain("function createTrackedStack");
  });

  it("should be valid JavaScript (no syntax errors)", () => {
    const bundle = bundleTrackedStack();
    expect(() => {
      new Function(bundle);
    }).not.toThrow();
  });

  it("should create functional TrackedStack when executed", () => {
    const bundle = bundleTrackedStack();
    const context = {
      steps: [] as Array<{
        type: string;
        target: string;
        args: unknown[];
        result: unknown;
      }>,
    };

    // Execute bundle and create stack
    const code = `
      ${bundle}
      const stack = createTrackedStack((type, target, args, result) => {
        steps.push({ type, target, args, result });
      });
      stack.push(1);
      stack.push(2);
      stack.push(3);
      const popped = stack.pop();
      return { stack, popped };
    `;

    const fn = new Function("steps", code);
    const result = fn(context.steps) as {
      stack: { getData: () => number[]; getSize: () => number };
      popped: number;
    };

    expect(result.stack.getData()).toEqual([1, 2]);
    expect(result.stack.getSize()).toBe(2);
    expect(result.popped).toBe(3);
    expect(context.steps.length).toBe(4); // 3 pushes + 1 pop
  });

  it("should emit steps with correct structure", () => {
    const bundle = bundleTrackedStack();
    const steps: Array<{
      type: string;
      target: string;
      args: unknown[];
      result: unknown;
    }> = [];

    const code = `
      ${bundle}
      const stack = createTrackedStack((type, target, args, result) => {
        steps.push({ type, target, args, result });
      });
      stack.push(42);
    `;

    const fn = new Function("steps", code);
    fn(steps);

    expect(steps).toHaveLength(1);
    expect(steps[0]).toMatchObject({
      type: "push",
      target: "stack",
      args: [42],
      result: [42],
    });
  });

  it("should support LIFO behavior", () => {
    const bundle = bundleTrackedStack();

    const code = `
      ${bundle}
      const stack = createTrackedStack();
      stack.push(1);
      stack.push(2);
      stack.push(3);
      const first = stack.pop();
      const second = stack.pop();
      return { first, second };
    `;

    const fn = new Function(code);
    const result = fn() as { first: number; second: number };

    expect(result.first).toBe(3); // Last in
    expect(result.second).toBe(2); // Second to last in
  });

  it("should support isEmpty method", () => {
    const bundle = bundleTrackedStack();

    const code = `
      ${bundle}
      const stack = createTrackedStack();
      const emptyBefore = stack.isEmpty();
      stack.push(1);
      const emptyAfter = stack.isEmpty();
      return { emptyBefore, emptyAfter };
    `;

    const fn = new Function(code);
    const result = fn() as { emptyBefore: boolean; emptyAfter: boolean };

    expect(result.emptyBefore).toBe(true);
    expect(result.emptyAfter).toBe(false);
  });

  it("should support peek method", () => {
    const bundle = bundleTrackedStack();

    const code = `
      ${bundle}
      const stack = createTrackedStack();
      stack.push(10);
      stack.push(20);
      const peeked = stack.peek();
      const size = stack.getSize();
      return { peeked, size };
    `;

    const fn = new Function(code);
    const result = fn() as { peeked: number; size: number };

    expect(result.peeked).toBe(20); // Top element
    expect(result.size).toBe(2); // Size unchanged by peek
  });

  it("should support clear method", () => {
    const bundle = bundleTrackedStack();

    const code = `
      ${bundle}
      const stack = createTrackedStack();
      stack.push(1);
      stack.push(2);
      stack.push(3);
      stack.clear();
      return { data: stack.getData(), size: stack.getSize() };
    `;

    const fn = new Function(code);
    const result = fn() as { data: number[]; size: number };

    expect(result.data).toEqual([]);
    expect(result.size).toBe(0);
  });

  it("should support static from method", () => {
    const bundle = bundleTrackedStack();

    const code = `
      ${bundle}
      const stack = TrackedStack.from([1, 2, 3]);
      return stack.getData();
    `;

    const fn = new Function(code);
    const result = fn() as number[];

    expect(result).toEqual([1, 2, 3]);
  });

  it("should throw error on pop from empty stack", () => {
    const bundle = bundleTrackedStack();

    const code = `
      ${bundle}
      const stack = createTrackedStack();
      stack.pop();
    `;

    const fn = new Function(code);
    expect(() => fn()).toThrow("Stack underflow");
  });
});
