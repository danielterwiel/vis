/**
 * TrackedBinaryTree bundler for sandbox execution
 *
 * Serializes the TrackedBinaryTree class as a string so it can be injected
 * into the sandboxed iframe for user code execution with step capture.
 */

/**
 * Bundles TrackedBinaryTree class as executable JavaScript string
 * This is injected into the sandbox before user code runs
 *
 * @returns JavaScript code string defining TrackedBinaryTree
 */
export function bundleTrackedBinaryTree(): string {
  return `
// TrackedBinaryTree - Binary Search Tree with operation capture for visualization
class TrackedBinaryTree {
  constructor(initialData = [], onOperation) {
    this.root = null;
    this.onOperation = onOperation;
    this.nodeCount = 0;
    if (initialData && initialData.length > 0) {
      for (const value of initialData) {
        this.insert(value);
      }
    }
  }

  getRoot() {
    return this.root;
  }

  getSize() {
    return this.nodeCount;
  }

  isEmpty() {
    return this.nodeCount === 0;
  }

  insert(value) {
    const newNode = { value, left: null, right: null };

    if (this.root === null) {
      this.root = newNode;
      this.nodeCount++;
      this.emitStep({
        type: "insert",
        target: "binaryTree",
        args: [value],
        result: this.toArray(),
        timestamp: Date.now(),
        metadata: { value, inserted: true, isRoot: true },
      });
      return this;
    }

    let current = this.root;
    const path = [];

    while (true) {
      path.push(current.value);

      if (value < current.value) {
        if (current.left === null) {
          current.left = newNode;
          this.nodeCount++;
          this.emitStep({
            type: "insert",
            target: "binaryTree",
            args: [value],
            result: this.toArray(),
            timestamp: Date.now(),
            metadata: { value, inserted: true, parent: current.value, direction: "left", path },
          });
          break;
        }
        current = current.left;
      } else if (value > current.value) {
        if (current.right === null) {
          current.right = newNode;
          this.nodeCount++;
          this.emitStep({
            type: "insert",
            target: "binaryTree",
            args: [value],
            result: this.toArray(),
            timestamp: Date.now(),
            metadata: { value, inserted: true, parent: current.value, direction: "right", path },
          });
          break;
        }
        current = current.right;
      } else {
        this.emitStep({
          type: "insert",
          target: "binaryTree",
          args: [value],
          result: this.toArray(),
          timestamp: Date.now(),
          metadata: { value, inserted: false, duplicate: true },
        });
        break;
      }
    }

    return this;
  }

  search(value) {
    const result = this.searchHelper(this.root, value, []);
    this.emitStep({
      type: "search",
      target: "binaryTree",
      args: [value],
      result: this.toArray(),
      timestamp: Date.now(),
      metadata: { value, found: result.found, path: result.path },
    });
    return result.found;
  }

  searchHelper(node, value, path) {
    if (node === null) {
      return { found: false, path };
    }

    path.push(node.value);

    if (value === node.value) {
      return { found: true, path };
    }

    if (value < node.value) {
      return this.searchHelper(node.left, value, path);
    }

    return this.searchHelper(node.right, value, path);
  }

  delete(value) {
    const result = this.deleteNode(this.root, value);
    this.root = result.node;
    if (result.deleted) {
      this.nodeCount--;
    }
    return this;
  }

  deleteNode(node, value) {
    if (node === null) {
      this.emitStep({
        type: "delete",
        target: "binaryTree",
        args: [value],
        result: this.toArray(),
        timestamp: Date.now(),
        metadata: { value, deleted: false, notFound: true },
      });
      return { node: null, deleted: false };
    }

    if (value < node.value) {
      const result = this.deleteNode(node.left, value);
      node.left = result.node;
      return { node, deleted: result.deleted };
    }

    if (value > node.value) {
      const result = this.deleteNode(node.right, value);
      node.right = result.node;
      return { node, deleted: result.deleted };
    }

    if (node.left === null && node.right === null) {
      this.emitStep({
        type: "delete",
        target: "binaryTree",
        args: [value],
        result: this.toArray(),
        timestamp: Date.now(),
        metadata: { value, deleted: true, case: "leaf" },
      });
      return { node: null, deleted: true };
    }

    if (node.left === null) {
      this.emitStep({
        type: "delete",
        target: "binaryTree",
        args: [value],
        result: this.toArray(),
        timestamp: Date.now(),
        metadata: { value, deleted: true, case: "one-child", child: "right" },
      });
      return { node: node.right, deleted: true };
    }

    if (node.right === null) {
      this.emitStep({
        type: "delete",
        target: "binaryTree",
        args: [value],
        result: this.toArray(),
        timestamp: Date.now(),
        metadata: { value, deleted: true, case: "one-child", child: "left" },
      });
      return { node: node.left, deleted: true };
    }

    const successor = this.findMin(node.right);
    node.value = successor.value;
    const result = this.deleteNode(node.right, successor.value);
    node.right = result.node;

    this.emitStep({
      type: "delete",
      target: "binaryTree",
      args: [value],
      result: this.toArray(),
      timestamp: Date.now(),
      metadata: { value, deleted: true, case: "two-children", successor: successor.value },
    });

    return { node, deleted: true };
  }

  findMin(node) {
    while (node.left !== null) {
      node = node.left;
    }
    return node;
  }

  inorderTraversal() {
    const result = [];
    this.inorderHelper(this.root, result);
    this.emitStep({
      type: "inorder",
      target: "binaryTree",
      args: [],
      result,
      timestamp: Date.now(),
      metadata: { traversalType: "inorder", result },
    });
    return result;
  }

  inorderHelper(node, result) {
    if (node === null) return;
    this.inorderHelper(node.left, result);
    result.push(node.value);
    this.inorderHelper(node.right, result);
  }

  preorderTraversal() {
    const result = [];
    this.preorderHelper(this.root, result);
    this.emitStep({
      type: "preorder",
      target: "binaryTree",
      args: [],
      result,
      timestamp: Date.now(),
      metadata: { traversalType: "preorder", result },
    });
    return result;
  }

  preorderHelper(node, result) {
    if (node === null) return;
    result.push(node.value);
    this.preorderHelper(node.left, result);
    this.preorderHelper(node.right, result);
  }

  postorderTraversal() {
    const result = [];
    this.postorderHelper(this.root, result);
    this.emitStep({
      type: "postorder",
      target: "binaryTree",
      args: [],
      result,
      timestamp: Date.now(),
      metadata: { traversalType: "postorder", result },
    });
    return result;
  }

  postorderHelper(node, result) {
    if (node === null) return;
    this.postorderHelper(node.left, result);
    this.postorderHelper(node.right, result);
    result.push(node.value);
  }

  isValidBST() {
    const isValid = this.validateBSTHelper(this.root, -Infinity, Infinity);
    this.emitStep({
      type: "isValidBST",
      target: "binaryTree",
      args: [],
      result: this.toArray(),
      timestamp: Date.now(),
      metadata: { isValid },
    });
    return isValid;
  }

  validateBSTHelper(node, min, max) {
    if (node === null) return true;
    if (node.value <= min || node.value >= max) return false;
    return (
      this.validateBSTHelper(node.left, min, node.value) &&
      this.validateBSTHelper(node.right, node.value, max)
    );
  }

  getHeight() {
    const height = this.getHeightHelper(this.root);
    this.emitStep({
      type: "getHeight",
      target: "binaryTree",
      args: [],
      result: this.toArray(),
      timestamp: Date.now(),
      metadata: { height },
    });
    return height;
  }

  getHeightHelper(node) {
    if (node === null) return 0;
    return 1 + Math.max(this.getHeightHelper(node.left), this.getHeightHelper(node.right));
  }

  clear() {
    this.root = null;
    this.nodeCount = 0;
    this.emitStep({
      type: "clear",
      target: "binaryTree",
      args: [],
      result: [],
      timestamp: Date.now(),
      metadata: { cleared: true },
    });
    return this;
  }

  toArray() {
    const result = [];
    this.inorderHelper(this.root, result);
    return result;
  }

  toHierarchy() {
    return this.cloneNode(this.root);
  }

  cloneNode(node) {
    if (node === null) return null;
    return {
      value: node.value,
      left: this.cloneNode(node.left),
      right: this.cloneNode(node.right),
    };
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
      this.onOperation(step.type, step.target, step.args, step.result, { ...step.metadata, lineNumber });
    }
  }

  static from(data, onOperation) {
    return new TrackedBinaryTree(data, onOperation);
  }
}

// Helper function to create TrackedBinaryTree
function createTrackedBinaryTree(data, onOperation) {
  return new TrackedBinaryTree(data, onOperation);
}
`;
}
