import type { TestCase } from "../types";
import type { PatternRequirement } from "../../validation/types";

/**
 * Binary Tree test cases with 3 difficulty levels (Easy, Medium, Hard)
 *
 * All test cases use a single function name 'traverseTree' that returns
 * the values in sorted order. The difficulty levels require different
 * algorithmic approaches validated via AST analysis.
 *
 * All test cases use the same input dataset [50, 30, 70, 20, 40, 60, 80] which creates
 * a balanced BST. This provides consistency and allows users to see how different
 * tree traversal algorithms work on the same data.
 */

// Single dataset used across all Binary Tree test cases
// When inserted in order, creates a balanced BST:
//          50
//        /    \
//       30     70
//      /  \   /  \
//     20  40 60  80
const BINARYTREE_INPUT_DATA = [50, 30, 70, 20, 40, 60, 80];
const BINARYTREE_SORTED_OUTPUT = [20, 30, 40, 50, 60, 70, 80];

export const binaryTreeTests: TestCase[] = [
  {
    id: "binarytree-traverse-easy",
    name: "Traverse Tree (Easy)",
    difficulty: "easy",
    description:
      "Traverse a binary search tree and return values in sorted order. You can use any method, including built-in traversal.",
    initialData: BINARYTREE_INPUT_DATA,
    expectedOutput: BINARYTREE_SORTED_OUTPUT,
    assertions: `
      expect(result).toEqual([20, 30, 40, 50, 60, 70, 80]);
      expect(result.length).toBe(7);
    `,
    referenceSolution: `function traverseTree(tree) {
  // Easy approach: use built-in inorder traversal method
  return tree.inorderTraversal();
}`,
    skeletonCode: `function traverseTree(tree) {
  // TODO: Return all values from the tree in sorted order
  // The tree parameter is a TrackedBinaryTree
  // Hint: The tree has a built-in inorderTraversal() method

  return tree.inorderTraversal();
}`,
    hints: [
      "TrackedBinaryTree has a built-in inorderTraversal() method",
      "In-order traversal of a BST returns values in sorted order",
      "The method returns an array of all node values",
    ],
    acceptanceCriteria: [
      "Function returns array in ascending sorted order",
      "All tree values are included in the result",
      "Result length matches number of nodes in tree",
    ],
  },
  {
    id: "binarytree-traverse-medium",
    name: "Traverse Tree (Medium)",
    difficulty: "medium",
    description:
      "Traverse a binary search tree and return values in sorted order. Implement a recursive in-order traversal.",
    initialData: BINARYTREE_INPUT_DATA,
    expectedOutput: BINARYTREE_SORTED_OUTPUT,
    assertions: `
      expect(result).toEqual([20, 30, 40, 50, 60, 70, 80]);
      expect(result.length).toBe(7);
    `,
    referenceSolution: `function traverseTree(tree) {
  // Medium approach: recursive in-order traversal
  const result = [];

  function traverse(node) {
    if (node === null) return;
    traverse(node.left);     // Visit left subtree first
    result.push(node.value); // Then visit root
    traverse(node.right);    // Finally visit right subtree
  }

  traverse(tree.getRoot());
  return result;
}`,
    skeletonCode: `function traverseTree(tree) {
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
}`,
    hints: [
      "In-order traversal visits nodes in order: left subtree → root → right subtree",
      "Use tree.getRoot() to get the root node, then traverse recursively",
      "Each node has .value (the data), .left (left child), .right (right child)",
    ],
    acceptanceCriteria: [
      "Function returns array in ascending sorted order",
      "Implements recursive traversal pattern",
      "All tree values are included in the result",
    ],
    patternRequirement: {
      anyOf: ["recursion"],
      errorMessage:
        "Medium difficulty requires recursive traversal. Implement a recursive function that visits each node in the tree.",
    } satisfies PatternRequirement,
  },
  {
    id: "binarytree-traverse-hard",
    name: "Traverse Tree (Hard)",
    difficulty: "hard",
    description:
      "Traverse a binary search tree and return values in sorted order. Use a divide-and-conquer approach with mid-point calculation.",
    initialData: BINARYTREE_INPUT_DATA,
    expectedOutput: BINARYTREE_SORTED_OUTPUT,
    assertions: `
      expect(result).toEqual([20, 30, 40, 50, 60, 70, 80]);
      expect(result.length).toBe(7);
    `,
    referenceSolution: `function traverseTree(tree) {
  // Hard approach: divide-and-conquer traversal
  // Collect all nodes, then process with mid-point selection
  const allValues = [];

  function collectValues(node) {
    if (node === null) return;
    collectValues(node.left);
    allValues.push(node.value);
    collectValues(node.right);
  }

  collectValues(tree.getRoot());

  // Process using divide-and-conquer pattern
  const result = [];

  function processRange(arr, start, end) {
    if (start > end) return;
    const mid = Math.floor((start + end) / 2);
    processRange(arr, start, mid - 1);
    result.push(arr[mid]);
    processRange(arr, mid + 1, end);
  }

  processRange(allValues, 0, allValues.length - 1);
  return result;
}`,
    skeletonCode: `function traverseTree(tree) {
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
}`,
    hints: [
      "First collect all values using in-order traversal",
      "Then process using divide-and-conquer with Math.floor((start + end) / 2)",
      "Process left half, then middle element, then right half",
    ],
    acceptanceCriteria: [
      "Function returns array in ascending sorted order",
      "Uses divide-and-conquer pattern with mid-point calculation",
      "All tree values are included in the result",
    ],
    patternRequirement: {
      anyOf: ["recursion", "divideAndConquer"],
      errorMessage:
        "Hard difficulty requires divide-and-conquer approach. Use recursion with mid-point calculation: Math.floor((start + end) / 2).",
    } satisfies PatternRequirement,
  },
];
