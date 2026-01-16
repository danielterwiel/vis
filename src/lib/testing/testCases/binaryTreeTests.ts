import type { TestCase } from "../types";
import type { PatternRequirement } from "../../validation/types";

/**
 * Binary Tree test cases with 3 difficulty levels (Easy, Medium, Hard)
 * Based on PRD.md lines 528-536
 *
 * All test cases use the same input dataset [50, 30, 70, 20, 40, 60, 80] which creates
 * a balanced BST. This provides consistency and allows users to see how different
 * tree operations work on the same data.
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
    id: "binarytree-traversal-easy",
    name: "In-Order Traversal",
    difficulty: "easy",
    description: "Traverse a binary search tree in sorted order (in-order)",
    initialData: BINARYTREE_INPUT_DATA,
    expectedOutput: BINARYTREE_SORTED_OUTPUT,
    assertions: `
      expect(result).toEqual([20, 30, 40, 50, 60, 70, 80]);
      expect(result.length).toBe(7);
    `,
    referenceSolution: `function inorderTraversal(tree) {
  // In-order traversal: left subtree -> root -> right subtree
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
    skeletonCode: `function inorderTraversal(tree) {
  // TODO: Implement in-order traversal recursively
  // The tree parameter is a TrackedBinaryTree
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
  //
  // Hint: Access root with tree.getRoot()
  // Hint: Each node has .value, .left, .right properties

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
      "All tree values are included in the result",
      "Result length matches number of nodes in tree",
    ],
  },
  {
    id: "binarytree-validate-medium",
    name: "Validate BST Property",
    difficulty: "medium",
    description: "Validate whether a binary tree satisfies the BST property (left < root < right)",
    initialData: BINARYTREE_INPUT_DATA,
    expectedOutput: true,
    patternRequirement: {
      anyOf: ["recursion"],
      errorMessage:
        "Medium difficulty requires recursive validation. Implement a recursive function that checks the BST property at each node.",
    } as PatternRequirement,
    assertions: `
      expect(result).toBe(true);
      expect(typeof result).toBe('boolean');
    `,
    referenceSolution: `function validateBST(tree) {
  // Use the built-in isValidBST method
  return tree.isValidBST();
}`,
    skeletonCode: `function validateBST(tree) {
  // TODO: Validate if the tree is a valid BST
  // Hint: The tree parameter is a TrackedBinaryTree
  // Hint: Use tree.isValidBST() method
  // BST property: for every node, left subtree < node < right subtree

  return tree.isValidBST();
}`,
    hints: [
      "A valid BST has all left descendants < node < all right descendants",
      "This must be true for every node in the tree, not just immediate children",
      "The TrackedBinaryTree has an isValidBST() method that validates this property",
    ],
    acceptanceCriteria: [
      "Function returns true for valid BST",
      "Function returns false for invalid BST",
      "Return type is boolean",
    ],
  },
  {
    id: "binarytree-balance-hard",
    name: "Balance an Unbalanced BST",
    difficulty: "hard",
    description:
      "Given an unbalanced BST (created by inserting values in sorted order), create a balanced BST with the same values",
    initialData: BINARYTREE_SORTED_OUTPUT, // Inserting in sorted order creates a right-skewed tree
    expectedOutput: BINARYTREE_SORTED_OUTPUT, // Balanced tree still contains same values
    patternRequirement: {
      anyOf: ["recursion", "divideAndConquer"],
      errorMessage:
        "Hard difficulty requires divide-and-conquer approach. Use recursion to build a balanced tree by selecting the middle element as root and recursively building left and right subtrees.",
    } as PatternRequirement,
    assertions: `
      expect(result.sort((a, b) => a - b)).toEqual([20, 30, 40, 50, 60, 70, 80]);
      expect(result.length).toBe(7);
      // Check that the height is more balanced (log n)
      // For 7 nodes, balanced height should be 3 (log2(7) ≈ 2.8)
      // Unbalanced would be 7 (linear)
    `,
    referenceSolution: `function balanceBST(tree) {
  // Algorithm: Get sorted array via in-order, build balanced tree from middle
  const sortedValues = tree.inorderTraversal();

  // Create new balanced tree
  const balancedTree = createTrackedBinaryTree([], __capture);

  // Build balanced tree from sorted array
  function buildBalanced(values, start, end) {
    if (start > end) return;

    // Middle element becomes root
    const mid = Math.floor((start + end) / 2);
    balancedTree.insert(values[mid]);

    // Recursively build left and right subtrees
    buildBalanced(values, start, mid - 1);
    buildBalanced(values, mid + 1, end);
  }

  buildBalanced(sortedValues, 0, sortedValues.length - 1);

  return balancedTree.inorderTraversal();
}`,
    skeletonCode: `function balanceBST(tree) {
  // TODO: Balance the BST
  // The input tree is unbalanced (right-skewed from inserting sorted values)
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
}`,
    hints: [
      "First, get sorted values using in-order traversal (tree.inorderTraversal())",
      "To balance: always insert the middle element first, then recursively balance left and right halves",
      "Create a new TrackedBinaryTree and build it from the sorted array using the middle-element strategy",
    ],
    acceptanceCriteria: [
      "Function returns array containing all original values",
      "Resulting tree is balanced (height ≈ log n)",
      "BST property is maintained after balancing",
    ],
  },
];
