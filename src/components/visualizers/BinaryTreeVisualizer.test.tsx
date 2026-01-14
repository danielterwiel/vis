import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { BinaryTreeVisualizer } from "./BinaryTreeVisualizer";
import type { BinaryTreeNode } from "../../lib/dataStructures/TrackedBinaryTree";
import type { VisualizationStep } from "../../store/useAppStore";

describe("BinaryTreeVisualizer", () => {
  beforeEach(() => {
    // Clear any previous renders
    document.body.innerHTML = "";
  });

  describe("Rendering", () => {
    it("should render SVG element", () => {
      const tree: BinaryTreeNode<number> = { value: 10, left: null, right: null };
      render(<BinaryTreeVisualizer data={tree} />);
      const svg = document.querySelector("svg");
      expect(svg).toBeTruthy();
    });

    it("should render empty message when data is null", () => {
      render(<BinaryTreeVisualizer data={null} />);
      const emptyMessage = document.querySelector(".empty-message");
      expect(emptyMessage).toBeTruthy();
      expect(emptyMessage?.textContent).toBe("Empty tree");
    });

    it("should render single node tree", () => {
      const tree: BinaryTreeNode<number> = { value: 10, left: null, right: null };
      render(<BinaryTreeVisualizer data={tree} />);
      const nodes = document.querySelectorAll(".node");
      expect(nodes.length).toBe(1);
    });

    it("should render tree with left and right children", () => {
      const tree: BinaryTreeNode<number> = {
        value: 10,
        left: { value: 5, left: null, right: null },
        right: { value: 15, left: null, right: null },
      };
      render(<BinaryTreeVisualizer data={tree} />);
      const nodes = document.querySelectorAll(".node");
      expect(nodes.length).toBe(3);
      const labels = document.querySelectorAll(".node-label");
      expect(labels.length).toBe(3);
    });

    it("should render tree with multiple levels", () => {
      const tree: BinaryTreeNode<number> = {
        value: 10,
        left: {
          value: 5,
          left: { value: 3, left: null, right: null },
          right: { value: 7, left: null, right: null },
        },
        right: {
          value: 15,
          left: { value: 12, left: null, right: null },
          right: { value: 20, left: null, right: null },
        },
      };
      render(<BinaryTreeVisualizer data={tree} />);
      const nodes = document.querySelectorAll(".node");
      expect(nodes.length).toBe(7);
    });

    it("should render links between nodes", () => {
      const tree: BinaryTreeNode<number> = {
        value: 10,
        left: { value: 5, left: null, right: null },
        right: { value: 15, left: null, right: null },
      };
      render(<BinaryTreeVisualizer data={tree} />);
      const links = document.querySelectorAll(".link");
      expect(links.length).toBe(2);
    });
  });

  describe("Step Handling", () => {
    const tree: BinaryTreeNode<number> = {
      value: 10,
      left: { value: 5, left: null, right: null },
      right: { value: 15, left: null, right: null },
    };

    it("should display step indicator for insert operation", () => {
      const steps: VisualizationStep[] = [
        {
          type: "insert",
          target: "binaryTree",
          args: [7],
          result: tree,
          timestamp: Date.now(),
          metadata: { value: 7, inserted: true, path: [10, 5] },
        },
      ];
      render(<BinaryTreeVisualizer data={tree} steps={steps} currentStepIndex={0} />);
      expect(screen.getByText(/Inserted 7/)).toBeTruthy();
    });

    it("should display step indicator for search operation (found)", () => {
      const steps: VisualizationStep[] = [
        {
          type: "search",
          target: "binaryTree",
          args: [5],
          result: true,
          timestamp: Date.now(),
          metadata: { value: 5, found: true, path: [10, 5] },
        },
      ];
      render(<BinaryTreeVisualizer data={tree} steps={steps} currentStepIndex={0} />);
      expect(screen.getByText(/Found 5/)).toBeTruthy();
    });

    it("should display step indicator for delete operation", () => {
      const steps: VisualizationStep[] = [
        {
          type: "delete",
          target: "binaryTree",
          args: [5],
          result: tree,
          timestamp: Date.now(),
          metadata: { value: 5, deleted: true, case: "leaf" },
        },
      ];
      render(<BinaryTreeVisualizer data={tree} steps={steps} currentStepIndex={0} />);
      expect(screen.getByText(/Deleted 5.*leaf/)).toBeTruthy();
    });

    it("should display step indicator for inorder traversal", () => {
      const steps: VisualizationStep[] = [
        {
          type: "inorderTraversal",
          target: "binaryTree",
          args: [],
          result: [5, 10, 15],
          timestamp: Date.now(),
          metadata: { traversalType: "inorder", result: [5, 10, 15] },
        },
      ];
      render(<BinaryTreeVisualizer data={tree} steps={steps} currentStepIndex={0} />);
      expect(screen.getByText(/In-order traversal.*5, 10, 15/)).toBeTruthy();
    });

    it("should display step indicator for preorder traversal", () => {
      const steps: VisualizationStep[] = [
        {
          type: "preorderTraversal",
          target: "binaryTree",
          args: [],
          result: [10, 5, 15],
          timestamp: Date.now(),
          metadata: { traversalType: "preorder", result: [10, 5, 15] },
        },
      ];
      render(<BinaryTreeVisualizer data={tree} steps={steps} currentStepIndex={0} />);
      expect(screen.getByText(/Pre-order traversal.*10, 5, 15/)).toBeTruthy();
    });

    it("should display step indicator for postorder traversal", () => {
      const steps: VisualizationStep[] = [
        {
          type: "postorderTraversal",
          target: "binaryTree",
          args: [],
          result: [5, 15, 10],
          timestamp: Date.now(),
          metadata: { traversalType: "postorder", result: [5, 15, 10] },
        },
      ];
      render(<BinaryTreeVisualizer data={tree} steps={steps} currentStepIndex={0} />);
      expect(screen.getByText(/Post-order traversal.*5, 15, 10/)).toBeTruthy();
    });

    it("should display step indicator for BST validation", () => {
      const steps: VisualizationStep[] = [
        {
          type: "isValidBST",
          target: "binaryTree",
          args: [],
          result: true,
          timestamp: Date.now(),
          metadata: { isValid: true },
        },
      ];
      render(<BinaryTreeVisualizer data={tree} steps={steps} currentStepIndex={0} />);
      expect(screen.getByText(/BST validation.*Valid/)).toBeTruthy();
    });

    it("should display step indicator for height calculation", () => {
      const steps: VisualizationStep[] = [
        {
          type: "getHeight",
          target: "binaryTree",
          args: [],
          result: 2,
          timestamp: Date.now(),
          metadata: { height: 2 },
        },
      ];
      render(<BinaryTreeVisualizer data={tree} steps={steps} currentStepIndex={0} />);
      expect(screen.getByText(/Tree height.*2/)).toBeTruthy();
    });

    it("should display step indicator for clear operation", () => {
      const steps: VisualizationStep[] = [
        {
          type: "clear",
          target: "binaryTree",
          args: [],
          result: null,
          timestamp: Date.now(),
          metadata: { cleared: true },
        },
      ];
      render(<BinaryTreeVisualizer data={tree} steps={steps} currentStepIndex={0} />);
      expect(screen.getByText("Tree cleared")).toBeTruthy();
    });

    it("should not display step indicator when currentStepIndex is -1", () => {
      const steps: VisualizationStep[] = [
        {
          type: "insert",
          target: "binaryTree",
          args: [7],
          result: tree,
          timestamp: Date.now(),
          metadata: { value: 7, inserted: true },
        },
      ];
      render(<BinaryTreeVisualizer data={tree} steps={steps} currentStepIndex={-1} />);
      const stepIndicator = document.querySelector(".step-indicator");
      expect(stepIndicator).toBeFalsy();
    });

    it("should not display step indicator when steps array is empty", () => {
      render(<BinaryTreeVisualizer data={tree} steps={[]} currentStepIndex={0} />);
      const stepIndicator = document.querySelector(".step-indicator");
      expect(stepIndicator).toBeFalsy();
    });
  });

  describe("Animation", () => {
    it("should accept isAnimating prop", () => {
      const tree: BinaryTreeNode<number> = { value: 10, left: null, right: null };
      const { rerender } = render(<BinaryTreeVisualizer data={tree} isAnimating={false} />);
      expect(document.querySelector(".node")).toBeTruthy();

      rerender(<BinaryTreeVisualizer data={tree} isAnimating={true} />);
      expect(document.querySelector(".node")).toBeTruthy();
    });
  });

  describe("Edge Cases", () => {
    it("should handle undefined steps array", () => {
      const tree: BinaryTreeNode<number> = { value: 10, left: null, right: null };
      render(<BinaryTreeVisualizer data={tree} steps={undefined} />);
      expect(document.querySelector(".node")).toBeTruthy();
    });

    it("should handle out-of-bounds currentStepIndex", () => {
      const tree: BinaryTreeNode<number> = { value: 10, left: null, right: null };
      const steps: VisualizationStep[] = [
        {
          type: "insert",
          target: "binaryTree",
          args: [10],
          result: tree,
          timestamp: Date.now(),
          metadata: { value: 10, inserted: true },
        },
      ];
      render(<BinaryTreeVisualizer data={tree} steps={steps} currentStepIndex={5} />);
      const stepIndicator = document.querySelector(".step-indicator");
      expect(stepIndicator).toBeFalsy();
    });

    it("should re-render when data changes", () => {
      const tree1: BinaryTreeNode<number> = { value: 10, left: null, right: null };
      const tree2: BinaryTreeNode<number> = {
        value: 10,
        left: { value: 5, left: null, right: null },
        right: null,
      };

      const { rerender } = render(<BinaryTreeVisualizer data={tree1} />);
      expect(document.querySelectorAll(".node").length).toBe(1);

      rerender(<BinaryTreeVisualizer data={tree2} />);
      expect(document.querySelectorAll(".node").length).toBe(2);
    });

    it("should handle only left child", () => {
      const tree: BinaryTreeNode<number> = {
        value: 10,
        left: { value: 5, left: null, right: null },
        right: null,
      };
      render(<BinaryTreeVisualizer data={tree} />);
      expect(document.querySelectorAll(".node").length).toBe(2);
      expect(document.querySelectorAll(".link").length).toBe(1);
    });

    it("should handle only right child", () => {
      const tree: BinaryTreeNode<number> = {
        value: 10,
        left: null,
        right: { value: 15, left: null, right: null },
      };
      render(<BinaryTreeVisualizer data={tree} />);
      expect(document.querySelectorAll(".node").length).toBe(2);
      expect(document.querySelectorAll(".link").length).toBe(1);
    });
  });

  describe("Cleanup", () => {
    it("should clean up on unmount", () => {
      const tree: BinaryTreeNode<number> = { value: 10, left: null, right: null };
      const { unmount } = render(<BinaryTreeVisualizer data={tree} />);
      unmount();
      // No error should be thrown during unmount
      expect(true).toBe(true);
    });
  });
});
