import type { VisualizationStep } from "../../store/useAppStore";

/**
 * Node structure for linked list
 */
export interface LinkedListNode<T> {
  value: T;
  next: LinkedListNode<T> | null;
}

/**
 * TrackedLinkedList - A singly linked list that captures operations for visualization
 *
 * Captures all operations that modify the list for step-by-step animation.
 * Each operation emits a VisualizationStep via the optional callback.
 */
export class TrackedLinkedList<T> {
  private head: LinkedListNode<T> | null = null;
  private tail: LinkedListNode<T> | null = null;
  private size: number = 0;
  private onOperation?: (step: VisualizationStep) => void;

  constructor(initialValues?: T[], onOperation?: (step: VisualizationStep) => void) {
    this.onOperation = onOperation;
    if (initialValues && initialValues.length > 0) {
      for (const value of initialValues) {
        this.append(value);
      }
    }
  }

  /**
   * Get the head node (read-only)
   */
  getHead(): LinkedListNode<T> | null {
    return this.head;
  }

  /**
   * Get the tail node (read-only)
   */
  getTail(): LinkedListNode<T> | null {
    return this.tail;
  }

  /**
   * Get the size of the list
   */
  getSize(): number {
    return this.size;
  }

  /**
   * Get all values as an array (read-only)
   */
  toArray(): T[] {
    const result: T[] = [];
    let current = this.head;
    while (current) {
      result.push(current.value);
      current = current.next;
    }
    return result;
  }

  /**
   * Append a value to the end of the list
   */
  append(value: T): this {
    const newNode: LinkedListNode<T> = { value, next: null };

    if (!this.head) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      this.tail!.next = newNode;
      this.tail = newNode;
    }

    this.size++;
    this.emitStep("append", [value], this.toArray(), {
      index: this.size - 1,
      value,
    });

    return this;
  }

  /**
   * Prepend a value to the beginning of the list
   */
  prepend(value: T): this {
    const newNode: LinkedListNode<T> = { value, next: this.head };
    this.head = newNode;

    if (!this.tail) {
      this.tail = newNode;
    }

    this.size++;
    this.emitStep("prepend", [value], this.toArray(), {
      index: 0,
      value,
    });

    return this;
  }

  /**
   * Insert a value at a specific index
   */
  insertAt(index: number, value: T): this {
    if (index < 0 || index > this.size) {
      throw new Error(`Index out of bounds: ${index} (size: ${this.size})`);
    }

    if (index === 0) {
      return this.prepend(value);
    }

    if (index === this.size) {
      return this.append(value);
    }

    let current = this.head;
    for (let i = 0; i < index - 1; i++) {
      current = current!.next;
    }

    const newNode: LinkedListNode<T> = { value, next: current!.next };
    current!.next = newNode;
    this.size++;

    this.emitStep("insertAt", [index, value], this.toArray(), {
      index,
      value,
    });

    return this;
  }

  /**
   * Delete the first node with the given value
   */
  delete(value: T): boolean {
    if (!this.head) {
      return false;
    }

    // Delete head
    if (this.head.value === value) {
      this.head = this.head.next;
      if (!this.head) {
        this.tail = null;
      }
      this.size--;
      this.emitStep("delete", [value], this.toArray(), {
        index: 0,
        value,
        deleted: true,
      });
      return true;
    }

    // Delete middle or tail
    let current = this.head;
    let index = 0;
    while (current.next) {
      if (current.next.value === value) {
        current.next = current.next.next;
        if (!current.next) {
          this.tail = current;
        }
        this.size--;
        this.emitStep("delete", [value], this.toArray(), {
          index: index + 1,
          value,
          deleted: true,
        });
        return true;
      }
      current = current.next;
      index++;
    }

    this.emitStep("delete", [value], this.toArray(), {
      value,
      deleted: false,
    });
    return false;
  }

  /**
   * Delete node at a specific index
   */
  deleteAt(index: number): T | null {
    if (index < 0 || index >= this.size) {
      return null;
    }

    let deletedValue: T;

    // Delete head
    if (index === 0) {
      deletedValue = this.head!.value;
      this.head = this.head!.next;
      if (!this.head) {
        this.tail = null;
      }
      this.size--;
      this.emitStep("deleteAt", [index], this.toArray(), {
        index,
        value: deletedValue,
      });
      return deletedValue;
    }

    // Delete middle or tail
    let current = this.head;
    for (let i = 0; i < index - 1; i++) {
      current = current!.next;
    }

    deletedValue = current!.next!.value;
    current!.next = current!.next!.next;

    if (!current!.next) {
      this.tail = current;
    }

    this.size--;
    this.emitStep("deleteAt", [index], this.toArray(), {
      index,
      value: deletedValue,
    });
    return deletedValue;
  }

  /**
   * Find the first node with the given value
   */
  find(value: T): LinkedListNode<T> | null {
    let current = this.head;
    let index = 0;
    while (current) {
      this.emitStep("find", [value], this.toArray(), {
        index,
        value,
        comparing: true,
        found: current.value === value,
      });

      if (current.value === value) {
        return current;
      }
      current = current.next;
      index++;
    }
    return null;
  }

  /**
   * Reverse the linked list in place
   */
  reverse(): this {
    if (!this.head || !this.head.next) {
      return this;
    }

    let prev: LinkedListNode<T> | null = null;
    let current: LinkedListNode<T> | null = this.head;
    this.tail = this.head;

    while (current) {
      const next: LinkedListNode<T> | null = current.next;
      current.next = prev;
      prev = current;
      current = next;

      this.emitStep("reverse", [], this.toArray(), {
        reversing: true,
      });
    }

    this.head = prev;
    this.emitStep("reverse", [], this.toArray(), {
      reversing: false,
      completed: true,
    });

    return this;
  }

  /**
   * Detect if the list has a cycle
   */
  hasCycle(): boolean {
    if (!this.head) {
      return false;
    }

    let slow: LinkedListNode<T> | null = this.head;
    let fast: LinkedListNode<T> | null = this.head;

    while (fast && fast.next) {
      slow = slow!.next;
      fast = fast.next.next;

      this.emitStep("hasCycle", [], this.toArray(), {
        slow: slow === this.head ? 0 : -1, // Can't track index in cycle
        fast: fast === this.head ? 0 : -1,
        checking: true,
      });

      if (slow === fast) {
        this.emitStep("hasCycle", [], this.toArray(), {
          hasCycle: true,
        });
        return true;
      }
    }

    this.emitStep("hasCycle", [], this.toArray(), {
      hasCycle: false,
    });
    return false;
  }

  /**
   * Clear all nodes from the list
   */
  clear(): this {
    this.head = null;
    this.tail = null;
    this.size = 0;
    this.emitStep("clear", [], [], {
      cleared: true,
    });
    return this;
  }

  /**
   * Emit a visualization step
   */
  private emitStep(
    type: string,
    args: unknown[],
    result: T[],
    metadata?: Record<string, unknown>,
  ): void {
    if (this.onOperation) {
      this.onOperation({
        type,
        target: "linkedList",
        args,
        result,
        timestamp: Date.now(),
        metadata,
      });
    }
  }

  /**
   * Static factory method
   */
  static from<T>(
    values: T[],
    onOperation?: (step: VisualizationStep) => void,
  ): TrackedLinkedList<T> {
    return new TrackedLinkedList(values, onOperation);
  }
}

/**
 * Helper function to create a TrackedLinkedList
 */
export function createTrackedLinkedList<T>(
  initialValues?: T[],
  onOperation?: (step: VisualizationStep) => void,
): TrackedLinkedList<T> {
  return new TrackedLinkedList(initialValues, onOperation);
}
