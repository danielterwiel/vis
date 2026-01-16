/**
 * TrackedArray bundler for sandbox execution
 *
 * Serializes the TrackedArray class as a string so it can be injected
 * into the sandboxed iframe for user code execution with step capture.
 */

/**
 * Bundles TrackedArray class as executable JavaScript string
 * This is injected into the sandbox before user code runs
 *
 * @returns JavaScript code string defining TrackedArray
 */
export function bundleTrackedArray(): string {
  return `
// TrackedArray - Array wrapper that captures operations for visualization
class TrackedArray {
  constructor(initialData = [], onOperation) {
    this.data = [...initialData];
    this.onOperation = onOperation;
  }

  getData() {
    return [...this.data];
  }

  get length() {
    return this.data.length;
  }

  at(index) {
    return this.data[index];
  }

  set(index, value) {
    const oldValue = this.data[index];
    this.data[index] = value;
    this.emitStep({
      type: "set",
      target: "array",
      args: [index, value],
      result: this.getData(),
      timestamp: Date.now(),
      metadata: { index, value, oldValue },
    });
  }

  push(value) {
    const result = this.data.push(value);
    this.emitStep({
      type: "push",
      target: "array",
      args: [value],
      result: this.getData(),
      timestamp: Date.now(),
      metadata: { index: this.data.length - 1, value },
    });
    return result;
  }

  pop() {
    const value = this.data.pop();
    this.emitStep({
      type: "pop",
      target: "array",
      args: [],
      result: this.getData(),
      timestamp: Date.now(),
      metadata: { value },
    });
    return value;
  }

  shift() {
    const value = this.data.shift();
    this.emitStep({
      type: "shift",
      target: "array",
      args: [],
      result: this.getData(),
      timestamp: Date.now(),
      metadata: { value },
    });
    return value;
  }

  unshift(value) {
    const result = this.data.unshift(value);
    this.emitStep({
      type: "unshift",
      target: "array",
      args: [value],
      result: this.getData(),
      timestamp: Date.now(),
      metadata: { value },
    });
    return result;
  }

  swap(i, j) {
    if (i < 0 || i >= this.data.length || j < 0 || j >= this.data.length) {
      throw new Error(\`Index out of bounds: swap(\${i}, \${j})\`);
    }
    const temp = this.data[i];
    this.data[i] = this.data[j];
    this.data[j] = temp;
    this.emitStep({
      type: "swap",
      target: "array",
      args: [i, j],
      result: this.getData(),
      timestamp: Date.now(),
      metadata: { i, j, values: [this.data[i], this.data[j]] },
    });
  }

  compare(i, j) {
    if (i < 0 || i >= this.data.length || j < 0 || j >= this.data.length) {
      throw new Error(\`Index out of bounds: compare(\${i}, \${j})\`);
    }
    const result = this.data[i] > this.data[j] ? 1 : this.data[i] < this.data[j] ? -1 : 0;
    this.emitStep({
      type: "compare",
      target: "array",
      args: [i, j],
      result: this.getData(),
      timestamp: Date.now(),
      metadata: { i, j, values: [this.data[i], this.data[j]], comparison: result },
    });
    return result;
  }

  reverse() {
    this.data.reverse();
    this.emitStep({
      type: "reverse",
      target: "array",
      args: [],
      result: this.getData(),
      timestamp: Date.now(),
    });
    return this;
  }

  sort(compareFn) {
    this.data.sort(compareFn);
    this.emitStep({
      type: "sort",
      target: "array",
      args: compareFn ? [compareFn.toString()] : [],
      result: this.getData(),
      timestamp: Date.now(),
    });
    return this;
  }

  splice(start, deleteCount, ...items) {
    const deleted = this.data.splice(start, deleteCount, ...items);
    this.emitStep({
      type: "splice",
      target: "array",
      args: [start, deleteCount, ...items],
      result: this.getData(),
      timestamp: Date.now(),
      metadata: { start, deleteCount, items, deleted },
    });
    return deleted;
  }

  partition(low, high) {
    if (low < 0 || high >= this.data.length || low > high) {
      throw new Error(\`Invalid partition range: partition(\${low}, \${high})\`);
    }
    const pivot = this.data[high];
    let i = low - 1;
    for (let j = low; j < high; j++) {
      if (this.data[j] < pivot) {
        i++;
        this.swap(i, j);
      }
    }
    this.swap(i + 1, high);
    this.emitStep({
      type: "partition",
      target: "array",
      args: [low, high],
      result: this.getData(),
      timestamp: Date.now(),
      metadata: { low, high, pivot, pivotIndex: i + 1 },
    });
    return i + 1;
  }

  reset(newData) {
    this.data = [...newData];
    this.emitStep({
      type: "reset",
      target: "array",
      args: [newData],
      result: this.getData(),
      timestamp: Date.now(),
    });
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
          // Parse stack to find caller line number
          // Stack format: "at method (file:line:col)" or "method@file:line:col"
          const lines = stack.split('\\n');
          const offset = typeof window !== 'undefined' && window.__userCodeLineOffset ? window.__userCodeLineOffset : 0;
          // Skip internal TrackedArray frames - find user code frame
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            // Skip internal TrackedArray methods
            if (line.includes('TrackedArray')) continue;
            // Skip Error line
            if (line.trim() === 'Error') continue;

            const match = line.match(/:(\\d+):\\d+/);
            if (match && match[1]) {
              const rawLine = parseInt(match[1], 10);
              // Calculate line in user code
              const userLine = rawLine - offset;
              // Only use if it's a valid user code line (positive and reasonable)
              if (userLine >= 1 && userLine <= 1000) {
                lineNumber = userLine;
                break;
              }
            }
          }
        }
      } catch (e) {
        // Ignore errors in line number capture
      }
      // __capture expects (operation, target, args, result, metadata) as separate arguments
      this.onOperation(step.type, step.target, step.args, step.result, { ...step.metadata, lineNumber });
    }
  }

  static from(data, onOperation) {
    return new TrackedArray(data, onOperation);
  }
}

// Helper function to create TrackedArray
function createTrackedArray(data, onOperation) {
  return new TrackedArray(data, onOperation);
}
`;
}
