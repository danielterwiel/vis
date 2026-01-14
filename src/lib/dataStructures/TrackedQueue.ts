import type { VisualizationStep } from "../../store/useAppStore";

/**
 * TrackedQueue class that captures all queue operations for visualization.
 * Implements a First-In-First-Out (FIFO) data structure.
 *
 * @template T - The type of elements stored in the queue
 */
export class TrackedQueue<T> {
  private items: T[] = [];
  private onOperation?: (step: VisualizationStep) => void;

  constructor(onOperation?: (step: VisualizationStep) => void) {
    this.onOperation = onOperation;
  }

  /**
   * Get a read-only copy of the queue data
   */
  getData(): readonly T[] {
    return [...this.items];
  }

  /**
   * Get the number of elements in the queue
   */
  getSize(): number {
    return this.items.length;
  }

  /**
   * Check if the queue is empty
   */
  isEmpty(): boolean {
    return this.items.length === 0;
  }

  /**
   * View the front element without removing it
   * @returns The front element or undefined if queue is empty
   */
  peek(): T | undefined {
    const result = this.items[0];
    this.emitStep("peek", [], result, {
      index: 0,
      value: result,
    });
    return result;
  }

  /**
   * Add an element to the back of the queue
   * @param value - The element to enqueue
   * @returns The queue instance for chaining
   */
  enqueue(value: T): TrackedQueue<T> {
    this.items.push(value);
    this.emitStep("enqueue", [value], this.items, {
      index: this.items.length - 1,
      value,
    });
    return this;
  }

  /**
   * Remove and return the front element from the queue
   * @returns The removed element or undefined if queue is empty
   */
  dequeue(): T | undefined {
    if (this.isEmpty()) {
      this.emitStep("dequeue", [], undefined, {
        empty: true,
      });
      return undefined;
    }

    const value = this.items.shift()!;
    this.emitStep("dequeue", [], this.items, {
      value,
    });
    return value;
  }

  /**
   * Remove all elements from the queue
   * @returns The queue instance for chaining
   */
  clear(): TrackedQueue<T> {
    const previousSize = this.items.length;
    this.items = [];
    this.emitStep("clear", [], this.items, {
      previousSize,
    });
    return this;
  }

  /**
   * Convert queue to array (front at start)
   * @returns Array representation of the queue
   */
  toArray(): T[] {
    return [...this.items];
  }

  /**
   * Create a TrackedQueue from an array of values
   * @param values - Array of values to initialize the queue
   * @param onOperation - Optional callback for operation capture
   * @returns A new TrackedQueue instance
   */
  static from<T>(values: T[], onOperation?: (step: VisualizationStep) => void): TrackedQueue<T> {
    const queue = new TrackedQueue<T>(onOperation);
    for (const value of values) {
      queue.items.push(value);
    }
    return queue;
  }

  /**
   * Emit a visualization step
   */
  private emitStep(
    type: string,
    args: unknown[],
    result: unknown,
    metadata?: Record<string, unknown>,
  ): void {
    if (this.onOperation) {
      this.onOperation({
        type,
        target: "queue",
        args,
        result: Array.isArray(result) ? [...result] : result,
        timestamp: Date.now(),
        metadata,
      });
    }
  }
}

/**
 * Helper function to create a TrackedQueue instance
 * @param onOperation - Optional callback for operation capture
 * @returns A new TrackedQueue instance
 */
export function createTrackedQueue<T>(
  onOperation?: (step: VisualizationStep) => void,
): TrackedQueue<T> {
  return new TrackedQueue<T>(onOperation);
}
