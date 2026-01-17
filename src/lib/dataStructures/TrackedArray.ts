/**
 * TrackedArray - A Proxy-wrapped array that captures operations for visualization
 *
 * Uses JavaScript Proxy to intercept standard array operations like arr[i] = value,
 * arr.push(), etc. This allows users to write pure JavaScript while still capturing
 * operations for visualization.
 */

import type { VisualizationStep } from "../../store/useAppStore";

export type OperationCallback = (step: VisualizationStep) => void;

/**
 * Internal state for a tracked array
 */
interface TrackedArrayState<T> {
  data: T[];
  onOperation?: OperationCallback;
}

/**
 * Emit a visualization step
 */
function emitStep<T>(
  state: TrackedArrayState<T>,
  type: string,
  args: unknown[],
  metadata?: Record<string, unknown>,
): void {
  if (state.onOperation) {
    state.onOperation({
      type,
      target: "array",
      args,
      result: [...state.data],
      timestamp: Date.now(),
      metadata,
    });
  }
}

/**
 * Check if a property key is a valid array index
 */
function isArrayIndex(prop: string | symbol): prop is string {
  if (typeof prop === "symbol") return false;
  const num = Number(prop);
  return Number.isInteger(num) && num >= 0 && String(num) === prop;
}

/**
 * Create a tracked array that captures all operations for visualization.
 * Returns a Proxy that behaves like a standard JavaScript array.
 *
 * @param initialData - Initial array data
 * @param onOperation - Callback for visualization steps
 * @returns A Proxy-wrapped array that tracks operations
 */
export function createTrackedArray<T = number>(
  initialData: T[] = [],
  onOperation?: OperationCallback,
): T[] {
  const state: TrackedArrayState<T> = {
    data: [...initialData],
    onOperation,
  };

  const handler: ProxyHandler<T[]> = {
    get(_target, prop, _receiver) {
      // Handle array index access
      if (isArrayIndex(prop)) {
        return state.data[Number(prop)];
      }

      // Handle special string properties
      if (typeof prop === "string") {
        if (prop === "length") {
          return state.data.length;
        }

        if (prop === "toArray") {
          return () => [...state.data];
        }

        if (prop === "getData") {
          return () => [...state.data];
        }
      }

      // Handle array methods that mutate
      const value = state.data[prop as keyof T[]];
      if (typeof value === "function") {
        return function (this: unknown, ...args: unknown[]) {
          const methodName = String(prop);

          // Capture state before mutation for some operations
          const result = (value as (...args: unknown[]) => unknown).apply(state.data, args);

          // Emit visualization step for mutating methods
          switch (methodName) {
            case "push":
              emitStep(state, "push", args, {
                index: state.data.length - 1,
                value: args[0],
              });
              break;
            case "pop":
              emitStep(state, "pop", [], {
                index: state.data.length,
                value: result,
              });
              break;
            case "shift":
              emitStep(state, "shift", [], {
                index: 0,
                value: result,
              });
              break;
            case "unshift":
              emitStep(state, "unshift", args, {
                index: 0,
                value: args[0],
              });
              break;
            case "splice":
              emitStep(state, "splice", args, {
                start: args[0],
                deleteCount: args[1],
                items: args.slice(2),
                deleted: result,
              });
              break;
            case "sort":
              emitStep(state, "sort", args, { sorted: true });
              break;
            case "reverse":
              emitStep(state, "reverse", [], {});
              break;
            case "fill":
              emitStep(state, "fill", args, { value: args[0] });
              break;
            case "copyWithin":
              emitStep(state, "copyWithin", args, {});
              break;
          }

          return result;
        };
      }

      return value;
    },

    set(_target, prop, value, _receiver) {
      // Handle array index assignment: arr[i] = value
      if (isArrayIndex(prop)) {
        const index = Number(prop);
        const oldValue = state.data[index];
        state.data[index] = value;

        emitStep(state, "set", [index, value], {
          index,
          value,
          oldValue,
        });

        return true;
      }

      // Handle length assignment
      if (typeof prop === "string" && prop === "length") {
        const oldLength = state.data.length;
        state.data.length = value;

        if (value !== oldLength) {
          emitStep(state, "length", [value], {
            oldLength,
            newLength: value,
          });
        }

        return true;
      }

      return false;
    },

    has(_target, prop) {
      if (isArrayIndex(prop)) {
        return Number(prop) < state.data.length;
      }
      return prop in state.data;
    },

    ownKeys() {
      return Reflect.ownKeys(state.data);
    },

    getOwnPropertyDescriptor(_target, prop) {
      if (isArrayIndex(prop)) {
        const index = Number(prop);
        if (index < state.data.length) {
          return {
            value: state.data[index],
            writable: true,
            enumerable: true,
            configurable: true,
          };
        }
      }
      return Reflect.getOwnPropertyDescriptor(state.data, prop);
    },
  };

  // Return proxy that looks like an array
  return new Proxy([] as T[], handler);
}

/**
 * Legacy class interface for backwards compatibility.
 * Wraps the Proxy-based implementation.
 */
export class TrackedArray<T = number> {
  private proxy: T[];

  constructor(initialData: T[] = [], onOperation?: OperationCallback) {
    this.proxy = createTrackedArray(initialData, onOperation);
  }

  get length(): number {
    return this.proxy.length;
  }

  at(index: number): T | undefined {
    return this.proxy[index];
  }

  set(index: number, value: T): void {
    this.proxy[index] = value;
  }

  push(value: T): number {
    return this.proxy.push(value);
  }

  pop(): T | undefined {
    return this.proxy.pop();
  }

  shift(): T | undefined {
    return this.proxy.shift();
  }

  unshift(value: T): number {
    return this.proxy.unshift(value);
  }

  swap(i: number, j: number): void {
    if (i < 0 || i >= this.proxy.length || j < 0 || j >= this.proxy.length) {
      throw new Error(`Invalid indices: i=${i}, j=${j}, length=${this.proxy.length}`);
    }
    const temp = this.proxy[i]!;
    this.proxy[i] = this.proxy[j]!;
    this.proxy[j] = temp;
  }

  compare(i: number, j: number): number {
    const a = this.proxy[i]!;
    const b = this.proxy[j]!;
    return a < b ? -1 : a > b ? 1 : 0;
  }

  reverse(): void {
    this.proxy.reverse();
  }

  sort(compareFn?: (a: T, b: T) => number): void {
    this.proxy.sort(compareFn);
  }

  splice(start: number, deleteCount?: number, ...items: T[]): T[] {
    return this.proxy.splice(start, deleteCount ?? 0, ...items);
  }

  partition(_pivotIndex: number, _leftIndices: number[], _rightIndices: number[]): void {
    // This is a visualization-only method, kept for backwards compatibility
    // Users should implement partition logic themselves
  }

  reset(newData: T[]): void {
    this.proxy.length = 0;
    this.proxy.push(...newData);
  }

  toArray(): T[] {
    return [...this.proxy];
  }

  getData(): T[] {
    return [...this.proxy];
  }

  static from<T>(data: T[], onOperation?: OperationCallback): TrackedArray<T> {
    return new TrackedArray(data, onOperation);
  }
}
