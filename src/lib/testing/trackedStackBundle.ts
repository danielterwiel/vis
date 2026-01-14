/**
 * TrackedStack bundler for sandbox execution
 *
 * Serializes the TrackedStack class as a string so it can be injected
 * into the sandboxed iframe for user code execution with step capture.
 */

/**
 * Bundles TrackedStack class as executable JavaScript string
 * This is injected into the sandbox before user code runs
 *
 * @returns JavaScript code string defining TrackedStack
 */
export function bundleTrackedStack(): string {
  return `
// TrackedStack - Stack implementation that captures operations for visualization
class TrackedStack {
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

  push(value) {
    this.data.push(value);
    this.emitStep({
      type: "push",
      target: "stack",
      args: [value],
      result: this.getData(),
      timestamp: Date.now(),
      metadata: { index: this.data.length - 1, value },
    });
    return this;
  }

  pop() {
    if (this.isEmpty()) {
      throw new Error("Stack underflow: cannot pop from empty stack");
    }
    const value = this.data.pop();
    this.emitStep({
      type: "pop",
      target: "stack",
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
    const value = this.data[this.data.length - 1];
    this.emitStep({
      type: "peek",
      target: "stack",
      args: [],
      result: this.getData(),
      timestamp: Date.now(),
      metadata: { value, index: this.data.length - 1 },
    });
    return value;
  }

  clear() {
    const previousSize = this.data.length;
    this.data = [];
    this.emitStep({
      type: "clear",
      target: "stack",
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
    const stack = new TrackedStack(onOperation);
    for (const item of data) {
      stack.data.push(item);
    }
    return stack;
  }
}

// Helper function to create TrackedStack
function createTrackedStack(onOperation) {
  return new TrackedStack(onOperation);
}
`;
}
