import type { VisualizationStep } from "../../store/useAppStore";

export interface BinaryTreeNode<T> {
  value: T;
  left: BinaryTreeNode<T> | null;
  right: BinaryTreeNode<T> | null;
}

type OperationCallback = (step: VisualizationStep) => void;

/**
 * TrackedBinaryTree - Binary Search Tree with operation capture for visualization
 *
 * All operations emit VisualizationStep with metadata for animation.
 * Supports: insert, delete, search, traverse (in/pre/post-order), validate, balance
 */
export class TrackedBinaryTree<T = number> {
  private root: BinaryTreeNode<T> | null = null;
  private onOperation?: OperationCallback;
  private nodeCount = 0;

  constructor(initialData?: T[], onOperation?: OperationCallback) {
    this.onOperation = onOperation;
    if (initialData && initialData.length > 0) {
      for (const value of initialData) {
        this.insert(value);
      }
    }
  }

  /**
   * Get the root node (read-only)
   */
  getRoot(): BinaryTreeNode<T> | null {
    return this.root;
  }

  /**
   * Get the number of nodes in the tree
   */
  getSize(): number {
    return this.nodeCount;
  }

  /**
   * Insert a value into the BST
   */
  insert(value: T): this {
    const newNode: BinaryTreeNode<T> = { value, left: null, right: null };

    if (this.root === null) {
      this.root = newNode;
      this.nodeCount++;
      this.emitStep("insert", [value], this.toArray(), {
        value,
        inserted: true,
        isRoot: true,
      });
      return this;
    }

    let current = this.root;
    const path: T[] = [];

    while (true) {
      path.push(current.value);

      if (value < current.value) {
        if (current.left === null) {
          current.left = newNode;
          this.nodeCount++;
          this.emitStep("insert", [value], this.toArray(), {
            value,
            inserted: true,
            parent: current.value,
            direction: "left",
            path,
          });
          break;
        }
        current = current.left;
      } else if (value > current.value) {
        if (current.right === null) {
          current.right = newNode;
          this.nodeCount++;
          this.emitStep("insert", [value], this.toArray(), {
            value,
            inserted: true,
            parent: current.value,
            direction: "right",
            path,
          });
          break;
        }
        current = current.right;
      } else {
        // Value already exists, don't insert duplicate
        this.emitStep("insert", [value], this.toArray(), {
          value,
          inserted: false,
          duplicate: true,
        });
        break;
      }
    }

    return this;
  }

  /**
   * Search for a value in the BST
   */
  search(value: T): BinaryTreeNode<T> | null {
    let current = this.root;
    const path: T[] = [];

    while (current !== null) {
      path.push(current.value);

      if (value === current.value) {
        this.emitStep("search", [value], this.toArray(), {
          value,
          found: true,
          path,
        });
        return current;
      }

      if (value < current.value) {
        current = current.left;
      } else {
        current = current.right;
      }
    }

    this.emitStep("search", [value], this.toArray(), {
      value,
      found: false,
      path,
    });
    return null;
  }

  /**
   * Delete a value from the BST
   */
  delete(value: T): boolean {
    const result = this.deleteNode(this.root, value);
    if (result.deleted) {
      this.root = result.node;
      this.nodeCount--;
    }
    return result.deleted;
  }

  private deleteNode(
    node: BinaryTreeNode<T> | null,
    value: T,
  ): { node: BinaryTreeNode<T> | null; deleted: boolean } {
    if (node === null) {
      this.emitStep("delete", [value], this.toArray(), {
        value,
        deleted: false,
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

    // Node found - delete it
    // Case 1: Leaf node
    if (node.left === null && node.right === null) {
      this.emitStep("delete", [value], this.toArray(), {
        value,
        deleted: true,
        case: "leaf",
      });
      return { node: null, deleted: true };
    }

    // Case 2: One child
    if (node.left === null) {
      this.emitStep("delete", [value], this.toArray(), {
        value,
        deleted: true,
        case: "one-child",
        child: "right",
      });
      return { node: node.right, deleted: true };
    }

    if (node.right === null) {
      this.emitStep("delete", [value], this.toArray(), {
        value,
        deleted: true,
        case: "one-child",
        child: "left",
      });
      return { node: node.left, deleted: true };
    }

    // Case 3: Two children - find inorder successor (min in right subtree)
    const successor = this.findMin(node.right);
    node.value = successor.value;
    const result = this.deleteNode(node.right, successor.value);
    node.right = result.node;

    this.emitStep("delete", [value], this.toArray(), {
      value,
      deleted: true,
      case: "two-children",
      successor: successor.value,
    });

    return { node, deleted: true };
  }

  private findMin(node: BinaryTreeNode<T>): BinaryTreeNode<T> {
    while (node.left !== null) {
      node = node.left;
    }
    return node;
  }

  /**
   * In-order traversal (left, root, right) - returns sorted array
   */
  inorderTraversal(): T[] {
    const result: T[] = [];
    this.inorderHelper(this.root, result);
    this.emitStep("inorder", [], result, {
      traversalType: "inorder",
      result,
    });
    return result;
  }

  private inorderHelper(node: BinaryTreeNode<T> | null, result: T[]): void {
    if (node === null) return;
    this.inorderHelper(node.left, result);
    result.push(node.value);
    this.inorderHelper(node.right, result);
  }

  /**
   * Pre-order traversal (root, left, right)
   */
  preorderTraversal(): T[] {
    const result: T[] = [];
    this.preorderHelper(this.root, result);
    this.emitStep("preorder", [], result, {
      traversalType: "preorder",
      result,
    });
    return result;
  }

  private preorderHelper(node: BinaryTreeNode<T> | null, result: T[]): void {
    if (node === null) return;
    result.push(node.value);
    this.preorderHelper(node.left, result);
    this.preorderHelper(node.right, result);
  }

  /**
   * Post-order traversal (left, right, root)
   */
  postorderTraversal(): T[] {
    const result: T[] = [];
    this.postorderHelper(this.root, result);
    this.emitStep("postorder", [], result, {
      traversalType: "postorder",
      result,
    });
    return result;
  }

  private postorderHelper(node: BinaryTreeNode<T> | null, result: T[]): void {
    if (node === null) return;
    this.postorderHelper(node.left, result);
    this.postorderHelper(node.right, result);
    result.push(node.value);
  }

  /**
   * Validate if the tree is a valid BST
   */
  isValidBST(): boolean {
    const isValid = this.validateBSTHelper(
      this.root,
      Number.NEGATIVE_INFINITY,
      Number.POSITIVE_INFINITY,
    );
    this.emitStep("validate", [], this.toArray(), {
      isValid,
    });
    return isValid;
  }

  private validateBSTHelper(node: BinaryTreeNode<T> | null, min: number, max: number): boolean {
    if (node === null) return true;

    const nodeValue = Number(node.value);
    if (nodeValue <= min || nodeValue >= max) return false;

    return (
      this.validateBSTHelper(node.left, min, nodeValue) &&
      this.validateBSTHelper(node.right, nodeValue, max)
    );
  }

  /**
   * Get the height of the tree
   */
  getHeight(): number {
    const height = this.getHeightHelper(this.root);
    this.emitStep("height", [], this.toArray(), {
      height,
    });
    return height;
  }

  private getHeightHelper(node: BinaryTreeNode<T> | null): number {
    if (node === null) return -1;
    return 1 + Math.max(this.getHeightHelper(node.left), this.getHeightHelper(node.right));
  }

  /**
   * Clear the tree
   */
  clear(): this {
    this.root = null;
    this.nodeCount = 0;
    this.emitStep("clear", [], [], {
      cleared: true,
    });
    return this;
  }

  /**
   * Check if tree is empty
   */
  isEmpty(): boolean {
    return this.root === null;
  }

  /**
   * Convert tree to array (in-order traversal)
   */
  toArray(): T[] {
    const result: T[] = [];
    this.inorderHelper(this.root, result);
    return result;
  }

  /**
   * Convert tree to hierarchical structure for visualization
   */
  toHierarchy(): BinaryTreeNode<T> | null {
    return this.root ? this.cloneNode(this.root) : null;
  }

  private cloneNode(node: BinaryTreeNode<T>): BinaryTreeNode<T> {
    return {
      value: node.value,
      left: node.left ? this.cloneNode(node.left) : null,
      right: node.right ? this.cloneNode(node.right) : null,
    };
  }

  /**
   * Emit a visualization step
   */
  private emitStep(
    type: string,
    args: unknown[],
    result: T[],
    metadata: Record<string, unknown>,
  ): void {
    if (this.onOperation) {
      this.onOperation({
        type,
        target: "binaryTree",
        args,
        result,
        timestamp: Date.now(),
        metadata: {
          ...metadata,
          treeStructure: this.toHierarchy(), // Include hierarchical structure for visualization
        },
      });
    }
  }

  /**
   * Static factory method
   */
  static from<T>(data: T[], onOperation?: OperationCallback): TrackedBinaryTree<T> {
    return new TrackedBinaryTree(data, onOperation);
  }
}

/**
 * Helper function to create a TrackedBinaryTree instance
 */
export function createTrackedBinaryTree<T = number>(
  initialData?: T[],
  onOperation?: OperationCallback,
): TrackedBinaryTree<T> {
  return new TrackedBinaryTree(initialData, onOperation);
}
