import type { VisualizationStep } from "../../store/useAppStore";

/**
 * TrackedStack class that captures all stack operations for visualization.
 * Implements a Last-In-First-Out (LIFO) data structure.
 *
 * @template T - The type of elements stored in the stack
 */
export class TrackedStack<T> {
  private items: T[] = [];
  private onOperation?: (step: VisualizationStep) => void;

  constructor(onOperation?: (step: VisualizationStep) => void) {
    this.onOperation = onOperation;
  }

  /**
   * Get a read-only copy of the stack data
   */
  getData(): readonly T[] {
    return [...this.items];
  }

  /**
   * Get the number of elements in the stack
   */
  getSize(): number {
    return this.items.length;
  }

  /**
   * Check if the stack is empty
   */
  isEmpty(): boolean {
    return this.items.length === 0;
  }

  /**
   * View the top element without removing it
   * @returns The top element or undefined if stack is empty
   */
  peek(): T | undefined {
    const result = this.items[this.items.length - 1];
    this.emitStep("peek", [], result, {
      index: this.items.length - 1,
      value: result,
    });
    return result;
  }

  /**
   * Push an element onto the top of the stack
   * @param value - The element to push
   * @returns The stack instance for chaining
   */
  push(value: T): TrackedStack<T> {
    this.items.push(value);
    this.emitStep("push", [value], this.items, {
      index: this.items.length - 1,
      value,
    });
    return this;
  }

  /**
   * Remove and return the top element from the stack
   * @returns The removed element or undefined if stack is empty
   */
  pop(): T | undefined {
    if (this.isEmpty()) {
      this.emitStep("pop", [], undefined, {
        empty: true,
      });
      return undefined;
    }

    const value = this.items.pop()!;
    this.emitStep("pop", [], this.items, {
      index: this.items.length,
      value,
    });
    return value;
  }

  /**
   * Remove all elements from the stack
   * @returns The stack instance for chaining
   */
  clear(): TrackedStack<T> {
    const previousSize = this.items.length;
    this.items = [];
    this.emitStep("clear", [], this.items, {
      previousSize,
    });
    return this;
  }

  /**
   * Convert stack to array (top at end)
   * @returns Array representation of the stack
   */
  toArray(): T[] {
    return [...this.items];
  }

  /**
   * Create a TrackedStack from an array of values
   * @param values - Array of values to initialize the stack
   * @param onOperation - Optional callback for operation capture
   * @returns A new TrackedStack instance
   */
  static from<T>(values: T[], onOperation?: (step: VisualizationStep) => void): TrackedStack<T> {
    const stack = new TrackedStack<T>(onOperation);
    for (const value of values) {
      stack.items.push(value);
    }
    return stack;
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
        target: "stack",
        args,
        result: Array.isArray(result) ? [...result] : result,
        timestamp: Date.now(),
        metadata,
      });
    }
  }
}

/**
 * Helper function to create a TrackedStack instance
 * @param onOperation - Optional callback for operation capture
 * @returns A new TrackedStack instance
 */
export function createTrackedStack<T>(
  onOperation?: (step: VisualizationStep) => void,
): TrackedStack<T> {
  return new TrackedStack<T>(onOperation);
}
