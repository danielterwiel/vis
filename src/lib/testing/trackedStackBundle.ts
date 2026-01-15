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
      // Capture line number from call stack for code highlighting
      let lineNumber = null;
      try {
        const stack = new Error().stack;
        if (stack) {
          const lines = stack.split('\\n');
          for (let i = 2; i < lines.length; i++) {
            const match = lines[i].match(/:(\\d+):\\d+/);
            if (match && match[1]) {
              const rawLine = parseInt(match[1], 10);
              const offset = typeof window !== 'undefined' && window.__userCodeLineOffset ? window.__userCodeLineOffset : 0;
              lineNumber = rawLine - offset;
              if (lineNumber < 1) lineNumber = null;
              break;
            }
          }
        }
      } catch (e) {}
      // __capture expects (operation, target, args, result, metadata) as separate arguments
      this.onOperation(step.type, step.target, step.args, step.result, { ...step.metadata, lineNumber });
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
// Automatically uses window.__capture if available and no callback is provided
function createTrackedStack(onOperation) {
  const callback = onOperation !== undefined ? onOperation : (typeof window !== 'undefined' && typeof window.__capture === 'function' ? window.__capture : undefined);
  return new TrackedStack(callback);
}
`;
}
