/**
 * TrackedQueue bundler for sandbox execution
 *
 * Serializes the TrackedQueue class as a string so it can be injected
 * into the sandboxed iframe for user code execution with step capture.
 */

/**
 * Bundles TrackedQueue class as executable JavaScript string
 * This is injected into the sandbox before user code runs
 *
 * @returns JavaScript code string defining TrackedQueue
 */
export function bundleTrackedQueue(): string {
  return `
// TrackedQueue - Queue implementation that captures operations for visualization
class TrackedQueue {
  constructor(onOperation) {
    this.data = [];
    this.onOperation = onOperation;
  }

  getData() {
    return [...this.data];
  }

  getSize() {
    return this.data.length;
  }

  isEmpty() {
    return this.data.length === 0;
  }

  enqueue(value) {
    this.data.push(value);
    this.emitStep({
      type: "enqueue",
      target: "queue",
      args: [value],
      result: this.getData(),
      timestamp: Date.now(),
      metadata: { index: this.data.length - 1, value },
    });
    return this;
  }

  dequeue() {
    if (this.isEmpty()) {
      throw new Error("Queue underflow: cannot dequeue from empty queue");
    }
    const value = this.data.shift();
    this.emitStep({
      type: "dequeue",
      target: "queue",
      args: [],
      result: this.getData(),
      timestamp: Date.now(),
      metadata: { value, previousSize: this.data.length + 1 },
    });
    return value;
  }

  peek() {
    if (this.isEmpty()) {
      return undefined;
    }
    const value = this.data[0];
    this.emitStep({
      type: "peek",
      target: "queue",
      args: [],
      result: this.getData(),
      timestamp: Date.now(),
      metadata: { value, index: 0 },
    });
    return value;
  }

  clear() {
    const previousSize = this.data.length;
    this.data = [];
    this.emitStep({
      type: "clear",
      target: "queue",
      args: [],
      result: this.getData(),
      timestamp: Date.now(),
      metadata: { previousSize },
    });
    return this;
  }

  toArray() {
    return this.getData();
  }

  emitStep(step) {
    if (this.onOperation) {
      // __capture expects (operation, target, args, result) as separate arguments
      this.onOperation(step.type, step.target, step.args, step.result);
    }
  }

  static from(data, onOperation) {
    const queue = new TrackedQueue(onOperation);
    for (const item of data) {
      queue.data.push(item);
    }
    return queue;
  }
}

// Helper function to create TrackedQueue
function createTrackedQueue(onOperation) {
  return new TrackedQueue(onOperation);
}
`;
}
