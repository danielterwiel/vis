/**
 * TrackedLinkedList bundler for sandbox execution
 *
 * Serializes the TrackedLinkedList class as a string so it can be injected
 * into the sandboxed iframe for user code execution with step capture.
 */

/**
 * Bundles TrackedLinkedList class as executable JavaScript string
 * This is injected into the sandbox before user code runs
 *
 * @returns JavaScript code string defining TrackedLinkedList
 */
export function bundleTrackedLinkedList(): string {
  return `
// TrackedLinkedList - Singly linked list that captures operations for visualization
class TrackedLinkedList {
  constructor(initialValues = [], onOperation) {
    this.head = null;
    this.tail = null;
    this.size = 0;
    this.onOperation = onOperation;

    if (initialValues && initialValues.length > 0) {
      for (const value of initialValues) {
        this.append(value);
      }
    }
  }

  getHead() {
    return this.head;
  }

  getTail() {
    return this.tail;
  }

  getSize() {
    return this.size;
  }

  toArray() {
    const result = [];
    let current = this.head;
    while (current) {
      result.push(current.value);
      current = current.next;
    }
    return result;
  }

  append(value) {
    const newNode = { value, next: null };

    if (!this.head) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      this.tail.next = newNode;
      this.tail = newNode;
    }

    this.size++;
    this.emitStep("append", [value], this.toArray(), {
      index: this.size - 1,
      value,
    });
    return this;
  }

  prepend(value) {
    const newNode = { value, next: this.head };
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

  insertAt(index, value) {
    if (index < 0 || index > this.size) {
      throw new Error(\`Index out of bounds: insertAt(\${index})\`);
    }

    if (index === 0) {
      return this.prepend(value);
    }

    if (index === this.size) {
      return this.append(value);
    }

    let current = this.head;
    for (let i = 0; i < index - 1; i++) {
      current = current.next;
    }

    const newNode = { value, next: current.next };
    current.next = newNode;
    this.size++;

    this.emitStep("insertAt", [index, value], this.toArray(), {
      index,
      value,
    });
    return this;
  }

  delete(value) {
    if (!this.head) {
      return false;
    }

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

  deleteAt(index) {
    if (index < 0 || index >= this.size) {
      return null;
    }

    let deletedValue;

    if (index === 0) {
      deletedValue = this.head.value;
      this.head = this.head.next;
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

    let current = this.head;
    for (let i = 0; i < index - 1; i++) {
      current = current.next;
    }

    deletedValue = current.next.value;
    current.next = current.next.next;

    if (!current.next) {
      this.tail = current;
    }

    this.size--;
    this.emitStep("deleteAt", [index], this.toArray(), {
      index,
      value: deletedValue,
    });
    return deletedValue;
  }

  find(value) {
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

  reverse() {
    if (!this.head || !this.head.next) {
      return this;
    }

    let prev = null;
    let current = this.head;
    this.tail = this.head;

    while (current) {
      const next = current.next;
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

  hasCycle() {
    if (!this.head) {
      return false;
    }

    let slow = this.head;
    let fast = this.head;

    while (fast && fast.next) {
      slow = slow.next;
      fast = fast.next.next;

      this.emitStep("hasCycle", [], this.toArray(), {
        slow: slow === this.head ? 0 : -1,
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

  clear() {
    this.head = null;
    this.tail = null;
    this.size = 0;
    this.emitStep("clear", [], [], {
      cleared: true,
    });
    return this;
  }

  emitStep(type, args, result, metadata) {
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
      this.onOperation(type, "linkedList", args, result, { ...metadata, lineNumber });
    }
  }

  static from(values, onOperation) {
    return new TrackedLinkedList(values, onOperation);
  }
}

// Helper function to create TrackedLinkedList
function createTrackedLinkedList(values, onOperation) {
  return new TrackedLinkedList(values, onOperation);
}
`;
}
