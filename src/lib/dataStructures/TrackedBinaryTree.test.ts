import { describe, it, expect, vi } from "vitest";
import { TrackedBinaryTree, createTrackedBinaryTree } from "./TrackedBinaryTree";
import type { VisualizationStep } from "../../store/useAppStore";

describe("TrackedBinaryTree", () => {
  describe("Constructor", () => {
    it("should create an empty tree", () => {
      const tree = new TrackedBinaryTree<number>();
      expect(tree.getRoot()).toBeNull();
      expect(tree.getSize()).toBe(0);
      expect(tree.isEmpty()).toBe(true);
    });

    it("should create a tree with initial data", () => {
      const tree = new TrackedBinaryTree([10, 5, 15, 3, 7]);
      expect(tree.getSize()).toBe(5);
      expect(tree.isEmpty()).toBe(false);
      expect(tree.toArray()).toEqual([3, 5, 7, 10, 15]);
    });

    it("should call onOperation callback during initialization", () => {
      const callback = vi.fn();
      new TrackedBinaryTree([10, 5], callback);
      expect(callback).toHaveBeenCalledTimes(2);
    });
  });

  describe("insert", () => {
    it("should insert value into empty tree as root", () => {
      const callback = vi.fn();
      const tree = new TrackedBinaryTree<number>([], callback);
      tree.insert(10);

      expect(tree.getSize()).toBe(1);
      expect(tree.getRoot()?.value).toBe(10);
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "insert",
          target: "binaryTree",
          args: [10],
          metadata: expect.objectContaining({
            value: 10,
            inserted: true,
            isRoot: true,
          }),
        }),
      );
    });

    it("should insert values in BST order", () => {
      const tree = new TrackedBinaryTree<number>();
      tree.insert(10).insert(5).insert(15).insert(3).insert(7);

      const root = tree.getRoot();
      expect(root?.value).toBe(10);
      expect(root?.left?.value).toBe(5);
      expect(root?.right?.value).toBe(15);
      expect(root?.left?.left?.value).toBe(3);
      expect(root?.left?.right?.value).toBe(7);
    });

    it("should not insert duplicate values", () => {
      const callback = vi.fn();
      const tree = new TrackedBinaryTree([10], callback);
      callback.mockClear();

      tree.insert(10);

      expect(tree.getSize()).toBe(1);
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            value: 10,
            inserted: false,
            duplicate: true,
          }),
        }),
      );
    });

    it("should capture path during insertion", () => {
      const callback = vi.fn();
      const tree = new TrackedBinaryTree([10, 5, 15], callback);
      callback.mockClear();

      tree.insert(12);

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            path: [10, 15],
            parent: 15,
            direction: "left",
          }),
        }),
      );
    });

    it("should support method chaining", () => {
      const tree = new TrackedBinaryTree<number>();
      const result = tree.insert(10).insert(5).insert(15);
      expect(result).toBe(tree);
      expect(tree.getSize()).toBe(3);
    });
  });

  describe("search", () => {
    it("should find existing value", () => {
      const callback = vi.fn();
      const tree = new TrackedBinaryTree([10, 5, 15, 3, 7], callback);
      callback.mockClear();

      const node = tree.search(7);

      expect(node?.value).toBe(7);
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "search",
          metadata: expect.objectContaining({
            value: 7,
            found: true,
            path: [10, 5, 7],
          }),
        }),
      );
    });

    it("should return null for non-existent value", () => {
      const callback = vi.fn();
      const tree = new TrackedBinaryTree([10, 5, 15], callback);
      callback.mockClear();

      const node = tree.search(20);

      expect(node).toBeNull();
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            value: 20,
            found: false,
          }),
        }),
      );
    });

    it("should find root value", () => {
      const tree = new TrackedBinaryTree([10, 5, 15]);
      const node = tree.search(10);
      expect(node?.value).toBe(10);
    });
  });

  describe("delete", () => {
    it("should delete leaf node", () => {
      const callback = vi.fn();
      const tree = new TrackedBinaryTree([10, 5, 15, 3, 7], callback);
      callback.mockClear();

      const deleted = tree.delete(3);

      expect(deleted).toBe(true);
      expect(tree.getSize()).toBe(4);
      expect(tree.toArray()).toEqual([5, 7, 10, 15]);
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "delete",
          metadata: expect.objectContaining({
            value: 3,
            deleted: true,
            case: "leaf",
          }),
        }),
      );
    });

    it("should delete node with one child (left)", () => {
      const callback = vi.fn();
      const tree = new TrackedBinaryTree([10, 5, 3], callback);
      callback.mockClear();

      const deleted = tree.delete(5);

      expect(deleted).toBe(true);
      expect(tree.getSize()).toBe(2);
      expect(tree.toArray()).toEqual([3, 10]);
    });

    it("should delete node with one child (right)", () => {
      const callback = vi.fn();
      const tree = new TrackedBinaryTree([10, 5, 7], callback);
      callback.mockClear();

      const deleted = tree.delete(5);

      expect(deleted).toBe(true);
      expect(tree.getSize()).toBe(2);
      expect(tree.toArray()).toEqual([7, 10]);
    });

    it("should delete node with two children", () => {
      const callback = vi.fn();
      const tree = new TrackedBinaryTree([10, 5, 15, 3, 7, 12, 20], callback);
      callback.mockClear();

      const deleted = tree.delete(15);

      expect(deleted).toBe(true);
      expect(tree.getSize()).toBe(6);
      expect(tree.toArray()).toEqual([3, 5, 7, 10, 12, 20]);
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            case: "two-children",
            successor: 20,
          }),
        }),
      );
    });

    it("should return false for non-existent value", () => {
      const tree = new TrackedBinaryTree([10, 5, 15]);
      const deleted = tree.delete(20);
      expect(deleted).toBe(false);
      expect(tree.getSize()).toBe(3);
    });

    it("should delete root node", () => {
      const tree = new TrackedBinaryTree([10]);
      const deleted = tree.delete(10);
      expect(deleted).toBe(true);
      expect(tree.isEmpty()).toBe(true);
    });
  });

  describe("Traversals", () => {
    it("should perform in-order traversal", () => {
      const callback = vi.fn();
      const tree = new TrackedBinaryTree([10, 5, 15, 3, 7, 12, 20], callback);
      callback.mockClear();

      const result = tree.inorderTraversal();

      expect(result).toEqual([3, 5, 7, 10, 12, 15, 20]);
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "inorder",
          metadata: expect.objectContaining({
            traversalType: "inorder",
            result: [3, 5, 7, 10, 12, 15, 20],
          }),
        }),
      );
    });

    it("should perform pre-order traversal", () => {
      const callback = vi.fn();
      const tree = new TrackedBinaryTree([10, 5, 15, 3, 7, 12, 20], callback);
      callback.mockClear();

      const result = tree.preorderTraversal();

      expect(result).toEqual([10, 5, 3, 7, 15, 12, 20]);
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "preorder",
          metadata: expect.objectContaining({
            traversalType: "preorder",
          }),
        }),
      );
    });

    it("should perform post-order traversal", () => {
      const callback = vi.fn();
      const tree = new TrackedBinaryTree([10, 5, 15, 3, 7, 12, 20], callback);
      callback.mockClear();

      const result = tree.postorderTraversal();

      expect(result).toEqual([3, 7, 5, 12, 20, 15, 10]);
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "postorder",
          metadata: expect.objectContaining({
            traversalType: "postorder",
          }),
        }),
      );
    });

    it("should handle empty tree traversals", () => {
      const tree = new TrackedBinaryTree<number>();
      expect(tree.inorderTraversal()).toEqual([]);
      expect(tree.preorderTraversal()).toEqual([]);
      expect(tree.postorderTraversal()).toEqual([]);
    });
  });

  describe("isValidBST", () => {
    it("should validate a valid BST", () => {
      const callback = vi.fn();
      const tree = new TrackedBinaryTree([10, 5, 15, 3, 7], callback);
      callback.mockClear();

      const isValid = tree.isValidBST();

      expect(isValid).toBe(true);
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "validate",
          metadata: expect.objectContaining({
            isValid: true,
          }),
        }),
      );
    });

    it("should handle empty tree as valid", () => {
      const tree = new TrackedBinaryTree<number>();
      expect(tree.isValidBST()).toBe(true);
    });
  });

  describe("getHeight", () => {
    it("should return height of tree", () => {
      const callback = vi.fn();
      const tree = new TrackedBinaryTree([10, 5, 15, 3, 7], callback);
      callback.mockClear();

      const height = tree.getHeight();

      expect(height).toBe(2);
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "height",
          metadata: expect.objectContaining({
            height: 2,
          }),
        }),
      );
    });

    it("should return -1 for empty tree", () => {
      const tree = new TrackedBinaryTree<number>();
      expect(tree.getHeight()).toBe(-1);
    });

    it("should return 0 for single node", () => {
      const tree = new TrackedBinaryTree([10]);
      expect(tree.getHeight()).toBe(0);
    });
  });

  describe("clear", () => {
    it("should clear all nodes", () => {
      const callback = vi.fn();
      const tree = new TrackedBinaryTree([10, 5, 15], callback);
      callback.mockClear();

      tree.clear();

      expect(tree.isEmpty()).toBe(true);
      expect(tree.getSize()).toBe(0);
      expect(tree.toArray()).toEqual([]);
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "clear",
          metadata: expect.objectContaining({
            cleared: true,
          }),
        }),
      );
    });

    it("should support method chaining", () => {
      const tree = new TrackedBinaryTree([10, 5, 15]);
      const result = tree.clear();
      expect(result).toBe(tree);
    });
  });

  describe("toArray", () => {
    it("should convert tree to sorted array", () => {
      const tree = new TrackedBinaryTree([10, 5, 15, 3, 7]);
      expect(tree.toArray()).toEqual([3, 5, 7, 10, 15]);
    });

    it("should return empty array for empty tree", () => {
      const tree = new TrackedBinaryTree<number>();
      expect(tree.toArray()).toEqual([]);
    });
  });

  describe("toHierarchy", () => {
    it("should return hierarchical structure", () => {
      const tree = new TrackedBinaryTree([10, 5, 15]);
      const hierarchy = tree.toHierarchy();

      expect(hierarchy?.value).toBe(10);
      expect(hierarchy?.left?.value).toBe(5);
      expect(hierarchy?.right?.value).toBe(15);
    });

    it("should return null for empty tree", () => {
      const tree = new TrackedBinaryTree<number>();
      expect(tree.toHierarchy()).toBeNull();
    });

    it("should return a copy, not the original", () => {
      const tree = new TrackedBinaryTree([10, 5, 15]);
      const hierarchy = tree.toHierarchy();

      // Modify hierarchy
      if (hierarchy) hierarchy.value = 999 as number;

      // Original should be unchanged
      expect(tree.getRoot()?.value).toBe(10);
    });
  });

  describe("Static factory method", () => {
    it("should create tree from static method", () => {
      const callback = vi.fn();
      const tree = TrackedBinaryTree.from([10, 5, 15], callback);

      expect(tree).toBeInstanceOf(TrackedBinaryTree);
      expect(tree.getSize()).toBe(3);
      expect(callback).toHaveBeenCalledTimes(3);
    });
  });

  describe("createTrackedBinaryTree helper", () => {
    it("should create tree with helper function", () => {
      const callback = vi.fn();
      const tree = createTrackedBinaryTree([10, 5, 15], callback);

      expect(tree).toBeInstanceOf(TrackedBinaryTree);
      expect(tree.getSize()).toBe(3);
      expect(callback).toHaveBeenCalledTimes(3);
    });

    it("should create empty tree with no arguments", () => {
      const tree = createTrackedBinaryTree();
      expect(tree.isEmpty()).toBe(true);
    });
  });

  describe("Generic type support", () => {
    it("should work with string values", () => {
      const tree = new TrackedBinaryTree<string>(["m", "d", "x", "a", "p"]);
      expect(tree.toArray()).toEqual(["a", "d", "m", "p", "x"]);
    });

    it("should work with number values in different order", () => {
      const tree = new TrackedBinaryTree<number>([50, 30, 70, 20, 40, 60, 80]);
      expect(tree.getSize()).toBe(7);
      expect(tree.toArray()).toEqual([20, 30, 40, 50, 60, 70, 80]);
    });
  });

  describe("Operation capture", () => {
    it("should capture all steps with proper structure", () => {
      const steps: VisualizationStep[] = [];
      const tree = new TrackedBinaryTree<number>([], (step) => steps.push(step));

      tree.insert(10);
      tree.search(10);
      tree.inorderTraversal();
      tree.clear();

      expect(steps).toHaveLength(4);
      expect(steps[0]?.type).toBe("insert");
      expect(steps[1]?.type).toBe("search");
      expect(steps[2]?.type).toBe("inorder");
      expect(steps[3]?.type).toBe("clear");

      for (const step of steps) {
        expect(step.target).toBe("binaryTree");
        expect(step).toHaveProperty("timestamp");
        expect(step).toHaveProperty("metadata");
      }
    });
  });
});
