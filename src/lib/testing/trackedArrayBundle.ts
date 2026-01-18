/**
 * TrackedArray bundler for sandbox execution
 *
 * Serializes the TrackedArray class as a string so it can be injected
 * into the sandboxed iframe for user code execution with step capture.
 *
 * Uses Proxy to intercept standard array operations like arr[i] = value,
 * allowing users to write pure JavaScript while still capturing operations
 * for visualization.
 */

/**
 * Bundles TrackedArray class as executable JavaScript string
 * This is injected into the sandbox before user code runs
 *
 * @returns JavaScript code string defining TrackedArray
 */
export function bundleTrackedArray(): string {
  return `
// TrackedArray - Proxy-wrapped array that captures operations for visualization

// Check if a property key is a valid array index
function isArrayIndex(prop) {
  if (typeof prop === 'symbol') return false;
  const num = Number(prop);
  return Number.isInteger(num) && num >= 0 && String(num) === prop;
}

// Emit a visualization step
function emitArrayStep(state, type, args, metadata) {
  if (state.onOperation) {
    // Capture line number from call stack for code highlighting
    let lineNumber = null;
    try {
      const stack = new Error().stack;
      if (stack) {
        const lines = stack.split('\\n');
        const offset = typeof window !== 'undefined' && window.__userCodeLineOffset ? window.__userCodeLineOffset : 0;
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (line.includes('TrackedArray') || line.includes('emitArrayStep') || line.includes('Proxy')) continue;
          if (line.trim() === 'Error') continue;
          const match = line.match(/:(\\d+):\\d+/);
          if (match && match[1]) {
            const rawLine = parseInt(match[1], 10);
            const userLine = rawLine - offset;
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
    state.onOperation(type, 'array', args, [...state.data], { ...metadata, lineNumber });
  }
}

// Create a Proxy-wrapped array that tracks operations
function createTrackedArrayProxy(initialData, onOperation) {
  const state = {
    data: [...initialData],
    onOperation: onOperation
  };

  const handler = {
    get(target, prop, receiver) {
      // Handle array index access
      if (isArrayIndex(prop)) {
        return state.data[Number(prop)];
      }

      // Handle special properties
      if (prop === 'length') {
        return state.data.length;
      }

      if (prop === 'toArray' || prop === 'getData') {
        return () => [...state.data];
      }

      // Handle swap method for convenience
      if (prop === 'swap') {
        return function(i, j) {
          if (i < 0 || i >= state.data.length || j < 0 || j >= state.data.length) {
            throw new Error('Index out of bounds: swap(' + i + ', ' + j + ')');
          }
          const temp = state.data[i];
          state.data[i] = state.data[j];
          state.data[j] = temp;
          emitArrayStep(state, 'swap', [i, j], { i, j, values: [state.data[i], state.data[j]] });
        };
      }

      // Handle compare method for convenience
      if (prop === 'compare') {
        return function(i, j) {
          if (i < 0 || i >= state.data.length || j < 0 || j >= state.data.length) {
            throw new Error('Index out of bounds: compare(' + i + ', ' + j + ')');
          }
          const result = state.data[i] > state.data[j] ? 1 : state.data[i] < state.data[j] ? -1 : 0;
          emitArrayStep(state, 'compare', [i, j], { i, j, values: [state.data[i], state.data[j]], comparison: result });
          return result;
        };
      }

      // Handle partition method for convenience
      if (prop === 'partition') {
        return function(low, high) {
          if (low < 0 || high >= state.data.length || low > high) {
            throw new Error('Invalid partition range: partition(' + low + ', ' + high + ')');
          }
          const pivot = state.data[high];
          let i = low - 1;
          for (let j = low; j < high; j++) {
            if (state.data[j] < pivot) {
              i++;
              const temp = state.data[i];
              state.data[i] = state.data[j];
              state.data[j] = temp;
              emitArrayStep(state, 'swap', [i, j], { i, j, values: [state.data[i], state.data[j]] });
            }
          }
          const temp = state.data[i + 1];
          state.data[i + 1] = state.data[high];
          state.data[high] = temp;
          emitArrayStep(state, 'swap', [i + 1, high], { i: i + 1, j: high, values: [state.data[i + 1], state.data[high]] });
          emitArrayStep(state, 'partition', [low, high], { low, high, pivot, pivotIndex: i + 1 });
          return i + 1;
        };
      }

      // Handle reset method
      if (prop === 'reset') {
        return function(newData) {
          state.data = [...newData];
          emitArrayStep(state, 'reset', [newData], {});
        };
      }

      // Handle array methods that mutate
      const value = state.data[prop];
      if (typeof value === 'function') {
        return function(...args) {
          const methodName = String(prop);
          const result = value.apply(state.data, args);

          // Emit visualization step for mutating methods
          switch (methodName) {
            case 'push':
              emitArrayStep(state, 'push', args, { index: state.data.length - 1, value: args[0] });
              break;
            case 'pop':
              emitArrayStep(state, 'pop', [], { index: state.data.length, value: result });
              break;
            case 'shift':
              emitArrayStep(state, 'shift', [], { index: 0, value: result });
              break;
            case 'unshift':
              emitArrayStep(state, 'unshift', args, { index: 0, value: args[0] });
              break;
            case 'splice':
              emitArrayStep(state, 'splice', args, { start: args[0], deleteCount: args[1], items: args.slice(2), deleted: result });
              break;
            case 'sort':
              emitArrayStep(state, 'sort', args.length ? [args[0].toString()] : [], { sorted: true });
              break;
            case 'reverse':
              emitArrayStep(state, 'reverse', [], {});
              break;
            case 'fill':
              emitArrayStep(state, 'fill', args, { value: args[0] });
              break;
            case 'copyWithin':
              emitArrayStep(state, 'copyWithin', args, {});
              break;
          }

          return result;
        };
      }

      return value;
    },

    set(target, prop, value, receiver) {
      // Handle array index assignment: arr[i] = value
      if (isArrayIndex(prop)) {
        const index = Number(prop);
        const oldValue = state.data[index];
        state.data[index] = value;
        emitArrayStep(state, 'set', [index, value], { index, value, oldValue });
        return true;
      }

      // Handle length assignment
      if (prop === 'length') {
        const oldLength = state.data.length;
        state.data.length = value;
        if (value !== oldLength) {
          emitArrayStep(state, 'length', [value], { oldLength, newLength: value });
        }
        return true;
      }

      return false;
    },

    has(target, prop) {
      if (isArrayIndex(prop)) {
        return Number(prop) < state.data.length;
      }
      return prop in state.data;
    },

    ownKeys() {
      return Reflect.ownKeys(state.data);
    },

    getOwnPropertyDescriptor(target, prop) {
      if (isArrayIndex(prop)) {
        const index = Number(prop);
        if (index < state.data.length) {
          return { value: state.data[index], writable: true, enumerable: true, configurable: true };
        }
      }
      return Reflect.getOwnPropertyDescriptor(state.data, prop);
    }
  };

  return new Proxy([], handler);
}

// TrackedArray class - wrapper that uses Proxy internally
class TrackedArray {
  constructor(initialData = [], onOperation) {
    // Store proxy and expose it for native array syntax
    this._proxy = createTrackedArrayProxy(initialData, onOperation);
    this._onOperation = onOperation;

    // Return a Proxy that delegates array access to _proxy
    return new Proxy(this, {
      get(target, prop, receiver) {
        // First check if it's an array index
        if (isArrayIndex(prop)) {
          return target._proxy[Number(prop)];
        }

        // Check for TrackedArray methods
        if (prop === 'getData' || prop === 'toArray') {
          return () => target._proxy.getData();
        }
        if (prop === 'length') {
          return target._proxy.length;
        }

        // Delegate array methods to proxy
        const proxyValue = target._proxy[prop];
        if (typeof proxyValue === 'function') {
          return proxyValue.bind(target._proxy);
        }

        return proxyValue;
      },
      set(target, prop, value, receiver) {
        if (isArrayIndex(prop)) {
          target._proxy[Number(prop)] = value;
          return true;
        }
        return false;
      },
      has(target, prop) {
        if (isArrayIndex(prop)) {
          return Number(prop) < target._proxy.length;
        }
        return prop in target._proxy;
      },
      ownKeys(target) {
        return Reflect.ownKeys(target._proxy);
      },
      getOwnPropertyDescriptor(target, prop) {
        if (isArrayIndex(prop)) {
          const index = Number(prop);
          if (index < target._proxy.length) {
            return { value: target._proxy[index], writable: true, enumerable: true, configurable: true };
          }
        }
        return Reflect.getOwnPropertyDescriptor(target._proxy, prop);
      }
    });
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
