import { describe, it, expect } from "vitest";
import { bundleTrackedQueue } from "./trackedQueueBundle";

describe("bundleTrackedQueue", () => {
  it("should return a non-empty string", () => {
    const bundle = bundleTrackedQueue();
    expect(typeof bundle).toBe("string");
    expect(bundle.length).toBeGreaterThan(0);
  });

  it("should define TrackedQueue class", () => {
    const bundle = bundleTrackedQueue();
    expect(bundle).toContain("class TrackedQueue");
  });

  it("should include constructor", () => {
    const bundle = bundleTrackedQueue();
    expect(bundle).toContain("constructor(onOperation)");
  });

  it("should include all core methods", () => {
    const bundle = bundleTrackedQueue();
    const methods = [
      "enqueue",
      "dequeue",
      "peek",
      "clear",
      "isEmpty",
      "getSize",
      "getData",
      "toArray",
    ];
    methods.forEach((method) => {
      expect(bundle).toContain(method);
    });
  });

  it("should include emitStep method", () => {
    const bundle = bundleTrackedQueue();
    expect(bundle).toContain("emitStep");
  });

  it("should include static from method", () => {
    const bundle = bundleTrackedQueue();
    expect(bundle).toContain("static from");
  });

  it("should include createTrackedQueue helper function", () => {
    const bundle = bundleTrackedQueue();
    expect(bundle).toContain("function createTrackedQueue");
  });

  it("should be valid JavaScript (no syntax errors)", () => {
    const bundle = bundleTrackedQueue();
    expect(() => {
      new Function(bundle);
    }).not.toThrow();
  });

  it("should create functional TrackedQueue when executed", () => {
    const bundle = bundleTrackedQueue();
    const context = {
      steps: [] as Array<{
        type: string;
        target: string;
        args: unknown[];
        result: unknown;
      }>,
    };

    // Execute bundle and create queue
    const code = `
      ${bundle}
      const queue = createTrackedQueue((type, target, args, result) => {
        steps.push({ type, target, args, result });
      });
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      const dequeued = queue.dequeue();
      return { queue, dequeued };
    `;

    const fn = new Function("steps", code);
    const result = fn(context.steps) as {
      queue: { getData: () => number[]; getSize: () => number };
      dequeued: number;
    };

    expect(result.queue.getData()).toEqual([2, 3]);
    expect(result.queue.getSize()).toBe(2);
    expect(result.dequeued).toBe(1);
    expect(context.steps.length).toBe(4); // 3 enqueues + 1 dequeue
  });

  it("should emit steps with correct structure", () => {
    const bundle = bundleTrackedQueue();
    const steps: Array<{
      type: string;
      target: string;
      args: unknown[];
      result: unknown;
    }> = [];

    const code = `
      ${bundle}
      const queue = createTrackedQueue((type, target, args, result) => {
        steps.push({ type, target, args, result });
      });
      queue.enqueue(42);
    `;

    const fn = new Function("steps", code);
    fn(steps);

    expect(steps).toHaveLength(1);
    expect(steps[0]).toMatchObject({
      type: "enqueue",
      target: "queue",
      args: [42],
      result: [42],
    });
  });

  it("should support FIFO behavior", () => {
    const bundle = bundleTrackedQueue();

    const code = `
      ${bundle}
      const queue = createTrackedQueue();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      const first = queue.dequeue();
      const second = queue.dequeue();
      return { first, second };
    `;

    const fn = new Function(code);
    const result = fn() as { first: number; second: number };

    expect(result.first).toBe(1); // First in
    expect(result.second).toBe(2); // Second in
  });

  it("should support isEmpty method", () => {
    const bundle = bundleTrackedQueue();

    const code = `
      ${bundle}
      const queue = createTrackedQueue();
      const emptyBefore = queue.isEmpty();
      queue.enqueue(1);
      const emptyAfter = queue.isEmpty();
      return { emptyBefore, emptyAfter };
    `;

    const fn = new Function(code);
    const result = fn() as { emptyBefore: boolean; emptyAfter: boolean };

    expect(result.emptyBefore).toBe(true);
    expect(result.emptyAfter).toBe(false);
  });

  it("should support peek method", () => {
    const bundle = bundleTrackedQueue();

    const code = `
      ${bundle}
      const queue = createTrackedQueue();
      queue.enqueue(10);
      queue.enqueue(20);
      const peeked = queue.peek();
      const size = queue.getSize();
      return { peeked, size };
    `;

    const fn = new Function(code);
    const result = fn() as { peeked: number; size: number };

    expect(result.peeked).toBe(10); // Front element
    expect(result.size).toBe(2); // Size unchanged by peek
  });

  it("should support clear method", () => {
    const bundle = bundleTrackedQueue();

    const code = `
      ${bundle}
      const queue = createTrackedQueue();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      queue.clear();
      return { data: queue.getData(), size: queue.getSize() };
    `;

    const fn = new Function(code);
    const result = fn() as { data: number[]; size: number };

    expect(result.data).toEqual([]);
    expect(result.size).toBe(0);
  });

  it("should support static from method", () => {
    const bundle = bundleTrackedQueue();

    const code = `
      ${bundle}
      const queue = TrackedQueue.from([1, 2, 3]);
      return queue.getData();
    `;

    const fn = new Function(code);
    const result = fn() as number[];

    expect(result).toEqual([1, 2, 3]);
  });

  it("should throw error on dequeue from empty queue", () => {
    const bundle = bundleTrackedQueue();

    const code = `
      ${bundle}
      const queue = createTrackedQueue();
      queue.dequeue();
    `;

    const fn = new Function(code);
    expect(() => fn()).toThrow("Queue underflow");
  });
});
