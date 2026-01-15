/**
 * Binary Tree skeleton code templates
 *
 * These templates match the test cases defined in binaryTreeTests.ts
 */

import { skeletonCodeSystem } from "../skeletonCodeSystem";

/**
 * Easy: In-Order Traversal
 * Returns values in sorted order for BST
 */
const easySkeleton = `// Example usage: Traverse a binary search tree in sorted order (in-order)

function inorderTraversal(tree) {
  // TODO: Implement in-order traversal
  // Hint: The tree parameter is a TrackedBinaryTree
  // Hint: Use tree.inorderTraversal() method
  // In-order means: visit left subtree, visit root, visit right subtree

  return tree.inorderTraversal();
}
`;

/**
 * Medium: Validate BST Property
 * Checks if tree satisfies BST invariant
 */
const mediumSkeleton = `// Example usage: Validate whether a binary tree satisfies the BST property

function validateBST(tree) {
  // TODO: Validate if the tree is a valid BST
  // Hint: The tree parameter is a TrackedBinaryTree
  // Hint: Use tree.isValidBST() method
  // BST property: for every node, left subtree < node < right subtree

  return tree.isValidBST();
}
`;

/**
 * Hard: Balance an Unbalanced BST
 * Creates balanced tree from unbalanced tree
 */
const hardSkeleton = `// Example usage: Given an unbalanced BST, create a balanced BST with the same values

function balanceBST(tree) {
  // TODO: Balance the BST
  // Algorithm:
  // 1. Get sorted values via in-order traversal
  // 2. Create new TrackedBinaryTree
  // 3. Build balanced tree by inserting middle element first
  // 4. Recursively build left and right halves

  const sortedValues = tree.inorderTraversal();
  const balancedTree = createTrackedBinaryTree([], __capture);

  function buildBalanced(values, start, end) {
    // TODO: Implement recursive balanced tree building
    // Base case: if start > end, return
    // Find middle index: Math.floor((start + end) / 2)
    // Insert middle value into balancedTree
    // Recursively build left subtree (start to mid-1)
    // Recursively build right subtree (mid+1 to end)

  }

  buildBalanced(sortedValues, 0, sortedValues.length - 1);

  return balancedTree.inorderTraversal();
}
`;

/**
 * Register all binary tree templates
 */
export function registerBinaryTreeTemplates(): void {
  skeletonCodeSystem.registerTemplate("tree", "easy", easySkeleton);
  skeletonCodeSystem.registerTemplate("tree", "medium", mediumSkeleton);
  skeletonCodeSystem.registerTemplate("tree", "hard", hardSkeleton);
}

/**
 * Export individual templates for testing
 */
export { easySkeleton, mediumSkeleton, hardSkeleton };
