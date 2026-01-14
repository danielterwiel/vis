/**
 * TrackedArray - Array wrapper that captures operations for visualization
 *
 * Wraps standard JavaScript array methods to emit VisualizationStep objects
 * whenever the array is modified. This enables real-time animation of array
 * operations like push, pop, swap, sort, etc.
 */

import type { VisualizationStep } from "../../store/useAppStore";

export type OperationCallback = (step: VisualizationStep) => void;

/**
 * TrackedArray wraps a standard JavaScript array and captures all operations
 * that modify the array for visualization purposes.
 */
export class TrackedArray<T = number> {
  private data: T[];
  private onOperation?: OperationCallback;

  constructor(initialData: T[] = [], onOperation?: OperationCallback) {
    this.data = [...initialData];
    this.onOperation = onOperation;
  }

  /**
   * Get the current array data (read-only copy)
   */
  getData(): T[] {
    return [...this.data];
  }

  /**
   * Get the current length of the array
   */
  get length(): number {
    return this.data.length;
  }

  /**
   * Get element at index (read-only)
   */
  at(index: number): T | undefined {
    return this.data[index];
  }

  /**
   * Set element at index
   */
  set(index: number, value: T): void {
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

  /**
   * Push element to end of array
   */
  push(value: T): number {
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

  /**
   * Pop element from end of array
   */
  pop(): T | undefined {
    const value = this.data.pop();
    this.emitStep({
      type: "pop",
      target: "array",
      args: [],
      result: this.getData(),
      timestamp: Date.now(),
      metadata: { index: this.data.length, value },
    });
    return value;
  }

  /**
   * Shift element from start of array
   */
  shift(): T | undefined {
    const value = this.data.shift();
    this.emitStep({
      type: "shift",
      target: "array",
      args: [],
      result: this.getData(),
      timestamp: Date.now(),
      metadata: { index: 0, value },
    });
    return value;
  }

  /**
   * Unshift element to start of array
   */
  unshift(value: T): number {
    const result = this.data.unshift(value);
    this.emitStep({
      type: "unshift",
      target: "array",
      args: [value],
      result: this.getData(),
      timestamp: Date.now(),
      metadata: { index: 0, value },
    });
    return result;
  }

  /**
   * Swap two elements in the array
   */
  swap(i: number, j: number): void {
    if (i < 0 || i >= this.data.length || j < 0 || j >= this.data.length) {
      throw new Error(`Invalid indices: i=${i}, j=${j}, length=${this.data.length}`);
    }

    const temp = this.data[i]!;
    this.data[i] = this.data[j]!;
    this.data[j] = temp;

    this.emitStep({
      type: "swap",
      target: "array",
      args: [i, j],
      result: this.getData(),
      timestamp: Date.now(),
      metadata: { indices: [i, j], values: [this.data[i], this.data[j]] },
    });
  }

  /**
   * Compare two elements (for visualization of comparison operations)
   */
  compare(i: number, j: number): number {
    const a = this.data[i]!;
    const b = this.data[j]!;
    const result = a < b ? -1 : a > b ? 1 : 0;

    this.emitStep({
      type: "compare",
      target: "array",
      args: [i, j],
      result: this.getData(),
      timestamp: Date.now(),
      metadata: { indices: [i, j], values: [a, b], comparison: result },
    });

    return result;
  }

  /**
   * Reverse the array
   */
  reverse(): void {
    this.data.reverse();
    this.emitStep({
      type: "reverse",
      target: "array",
      args: [],
      result: this.getData(),
      timestamp: Date.now(),
      metadata: {},
    });
  }

  /**
   * Sort the array with optional compareFn
   */
  sort(compareFn?: (a: T, b: T) => number): void {
    this.data.sort(compareFn);
    this.emitStep({
      type: "sort",
      target: "array",
      args: [compareFn],
      result: this.getData(),
      timestamp: Date.now(),
      metadata: { sorted: true },
    });
  }

  /**
   * Splice array (remove and/or insert elements)
   */
  splice(start: number, deleteCount?: number, ...items: T[]): T[] {
    const deleted = this.data.splice(start, deleteCount ?? 0, ...items);
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

  /**
   * Mark a partition point (for quick sort visualization)
   */
  partition(pivotIndex: number, leftIndices: number[], rightIndices: number[]): void {
    this.emitStep({
      type: "partition",
      target: "array",
      args: [pivotIndex],
      result: this.getData(),
      timestamp: Date.now(),
      metadata: { pivotIndex, leftIndices, rightIndices },
    });
  }

  /**
   * Reset the array to new data
   */
  reset(newData: T[]): void {
    this.data = [...newData];
    this.emitStep({
      type: "reset",
      target: "array",
      args: [newData],
      result: this.getData(),
      timestamp: Date.now(),
      metadata: {},
    });
  }

  /**
   * Convert to standard array (for interop)
   */
  toArray(): T[] {
    return this.getData();
  }

  /**
   * Create TrackedArray from standard array
   */
  static from<T>(data: T[], onOperation?: OperationCallback): TrackedArray<T> {
    return new TrackedArray(data, onOperation);
  }

  /**
   * Emit a visualization step
   */
  private emitStep(step: VisualizationStep): void {
    if (this.onOperation) {
      this.onOperation(step);
    }
  }
}

/**
 * Create a TrackedArray with operation callback
 */
export function createTrackedArray<T = number>(
  initialData: T[] = [],
  onOperation?: OperationCallback,
): TrackedArray<T> {
  return new TrackedArray(initialData, onOperation);
}
