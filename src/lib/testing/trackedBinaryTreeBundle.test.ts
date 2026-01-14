import { describe, it, expect, beforeAll } from "vitest";
import { bundleTrackedBinaryTree } from "./trackedBinaryTreeBundle";

describe("bundleTrackedBinaryTree", () => {
  const bundleCode = bundleTrackedBinaryTree();

  describe("Bundle Structure", () => {
    it("should return a non-empty string", () => {
      expect(typeof bundleCode).toBe("string");
      expect(bundleCode.length).toBeGreaterThan(0);
    });

    it("should be valid JavaScript", () => {
      expect(() => {
        // biome-ignore lint: testing eval for bundle validation
        new Function(bundleCode);
      }).not.toThrow();
    });

    it("should define TrackedBinaryTree class", () => {
      expect(bundleCode).toContain("class TrackedBinaryTree");
    });

    it("should define createTrackedBinaryTree helper function", () => {
      expect(bundleCode).toContain("function createTrackedBinaryTree");
    });
  });

  describe("TrackedBinaryTree Methods", () => {
    it("should include getRoot method", () => {
      expect(bundleCode).toContain("getRoot()");
    });

    it("should include getSize method", () => {
      expect(bundleCode).toContain("getSize()");
    });

    it("should include isEmpty method", () => {
      expect(bundleCode).toContain("isEmpty()");
    });

    it("should include insert method", () => {
      expect(bundleCode).toContain("insert(value)");
    });

    it("should include search method", () => {
      expect(bundleCode).toContain("search(value)");
    });

    it("should include delete method", () => {
      expect(bundleCode).toContain("delete(value)");
    });

    it("should include inorderTraversal method", () => {
      expect(bundleCode).toContain("inorderTraversal()");
    });

    it("should include preorderTraversal method", () => {
      expect(bundleCode).toContain("preorderTraversal()");
    });

    it("should include postorderTraversal method", () => {
      expect(bundleCode).toContain("postorderTraversal()");
    });

    it("should include isValidBST method", () => {
      expect(bundleCode).toContain("isValidBST()");
    });

    it("should include getHeight method", () => {
      expect(bundleCode).toContain("getHeight()");
    });

    it("should include clear method", () => {
      expect(bundleCode).toContain("clear()");
    });

    it("should include toArray method", () => {
      expect(bundleCode).toContain("toArray()");
    });

    it("should include toHierarchy method", () => {
      expect(bundleCode).toContain("toHierarchy()");
    });

    it("should include emitStep method", () => {
      expect(bundleCode).toContain("emitStep(step)");
    });

    it("should include static from method", () => {
      expect(bundleCode).toContain("static from(data, onOperation)");
    });
  });

  describe("Functional TrackedBinaryTree", () => {
    // Create a sandboxed environment to test the bundled code
    let TrackedBinaryTree: any;
    let createTrackedBinaryTree: any;

    beforeAll(() => {
      // biome-ignore lint: testing eval for bundle validation
      const sandbox = new Function(`
        ${bundleCode}
        return { TrackedBinaryTree, createTrackedBinaryTree };
      `);
      const result = sandbox();
      TrackedBinaryTree = result.TrackedBinaryTree;
      createTrackedBinaryTree = result.createTrackedBinaryTree;
    });

    it("should create TrackedBinaryTree instance with constructor", () => {
      const tree = new TrackedBinaryTree();
      expect(tree).toBeDefined();
      expect(tree.getSize()).toBe(0);
      expect(tree.isEmpty()).toBe(true);
    });

    it("should create TrackedBinaryTree instance with helper function", () => {
      const tree = createTrackedBinaryTree([10, 5, 15]);
      expect(tree).toBeDefined();
      expect(tree.getSize()).toBe(3);
      expect(tree.isEmpty()).toBe(false);
    });

    it("should insert values and maintain BST property", () => {
      const tree = new TrackedBinaryTree();
      tree.insert(50);
      tree.insert(30);
      tree.insert(70);
      tree.insert(20);
      tree.insert(40);

      const result = tree.inorderTraversal();
      expect(result).toEqual([20, 30, 40, 50, 70]);
      expect(tree.getSize()).toBe(5);
    });

    it("should search for values correctly", () => {
      const tree = createTrackedBinaryTree([50, 30, 70, 20, 40]);
      expect(tree.search(30)).toBe(true);
      expect(tree.search(20)).toBe(true);
      expect(tree.search(100)).toBe(false);
    });

    it("should validate BST property", () => {
      const tree = createTrackedBinaryTree([50, 30, 70, 20, 40, 60, 80]);
      expect(tree.isValidBST()).toBe(true);
    });

    it("should perform all three traversals", () => {
      const tree = createTrackedBinaryTree([50, 30, 70]);

      const inorder = tree.inorderTraversal();
      expect(inorder).toEqual([30, 50, 70]);

      const preorder = tree.preorderTraversal();
      expect(preorder).toEqual([50, 30, 70]);

      const postorder = tree.postorderTraversal();
      expect(postorder).toEqual([30, 70, 50]);
    });

    it("should calculate tree height", () => {
      const tree = createTrackedBinaryTree([50, 30, 70, 20, 40]);
      const height = tree.getHeight();
      expect(height).toBeGreaterThan(0);
      expect(height).toBeLessThanOrEqual(5);
    });

    it("should clear the tree", () => {
      const tree = createTrackedBinaryTree([50, 30, 70]);
      expect(tree.getSize()).toBe(3);
      tree.clear();
      expect(tree.getSize()).toBe(0);
      expect(tree.isEmpty()).toBe(true);
    });

    it("should emit steps via onOperation callback", () => {
      const steps: any[] = [];
      const onOperation = (type: string, target: string, args: any[], result: any) => {
        steps.push({ type, target, args, result });
      };

      const tree = createTrackedBinaryTree([], onOperation);
      tree.insert(50);
      tree.insert(30);
      tree.insert(70);

      expect(steps.length).toBeGreaterThan(0);
      expect(steps[0].type).toBe("insert");
      expect(steps[0].target).toBe("binaryTree");
      expect(steps[0].args).toEqual([50]);
    });
  });

  describe("Code Quality", () => {
    it("should not contain TypeScript syntax", () => {
      expect(bundleCode).not.toContain(": number");
      expect(bundleCode).not.toContain(": string");
      expect(bundleCode).not.toContain(": boolean");
      expect(bundleCode).not.toContain("interface ");
      expect(bundleCode).not.toContain("type ");
    });

    it("should use proper JavaScript class syntax", () => {
      expect(bundleCode).toContain("constructor(");
      expect(bundleCode).toContain("this.");
    });

    it("should handle edge cases", () => {
      expect(bundleCode).toContain("if (node === null)");
      expect(bundleCode).toContain("if (this.root === null)");
    });
  });
});
