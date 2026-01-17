/**
 * Binary Tree skeleton code templates
 *
 * These templates match the test cases defined in binaryTreeTests.ts
 * All levels use the same function name 'traverseTree' with different approaches
 */

import { skeletonCodeSystem } from "../skeletonCodeSystem";

/**
 * Easy: Traverse Tree (any method)
 * Returns values in sorted order using built-in method
 */
const easySkeleton = `// Example usage: Traverse a binary search tree and return values in sorted order

function traverseTree(tree) {
  // TODO: Return all values from the tree in sorted order
  // The tree parameter is a TrackedBinaryTree
  // Hint: The tree has a built-in inorderTraversal() method

  return tree.inorderTraversal();
}
`;

/**
 * Medium: Traverse Tree (recursion required)
 * Implements recursive in-order traversal
 */
const mediumSkeleton = `// Example usage: Traverse a binary search tree using recursive in-order traversal

function traverseTree(tree) {
  // TODO: Implement recursive in-order traversal
  // In-order means: visit left subtree -> visit root -> visit right subtree
  // For a BST, this returns values in sorted (ascending) order
  //
  // Steps:
  // 1. Create a result array to collect values
  // 2. Create a recursive helper function that takes a node
  // 3. In the helper: if node is null, return (base case)
  // 4. Recursively traverse left subtree
  // 5. Push current node's value to result
  // 6. Recursively traverse right subtree
  // 7. Start traversal from tree.getRoot()

  const result = [];

  function traverse(node) {
    // TODO: Implement recursive traversal
  }

  traverse(tree.getRoot());
  return result;
}
`;

/**
 * Hard: Traverse Tree (divide-and-conquer required)
 * Uses divide-and-conquer with mid-point calculation
 */
const hardSkeleton = `// Example usage: Traverse a binary search tree using divide-and-conquer approach

function traverseTree(tree) {
  // TODO: Implement divide-and-conquer traversal
  // This approach:
  // 1. Collect all node values via in-order traversal
  // 2. Process using divide-and-conquer with mid-point selection
  //
  // The divide-and-conquer pattern uses:
  // - Math.floor((start + end) / 2) to find mid-point
  // - Recursively process left half (start to mid-1)
  // - Process middle element
  // - Recursively process right half (mid+1 to end)

  const allValues = [];

  function collectValues(node) {
    // TODO: Collect all values in sorted order
  }

  collectValues(tree.getRoot());

  const result = [];

  function processRange(arr, start, end) {
    // TODO: Process array range using divide-and-conquer
    // Base case: if start > end, return
    // Find mid: Math.floor((start + end) / 2)
    // Process left half, then mid, then right half
  }

  processRange(allValues, 0, allValues.length - 1);
  return result;
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
