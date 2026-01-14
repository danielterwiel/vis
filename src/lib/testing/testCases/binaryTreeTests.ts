import type { TestCase } from "../types";

/**
 * Binary Tree test cases with 3 difficulty levels (Easy, Medium, Hard)
 * Based on PRD.md lines 528-536
 */
export const binaryTreeTests: TestCase[] = [
  {
    id: "binarytree-traversal-easy",
    name: "In-Order Traversal",
    difficulty: "easy",
    description: "Traverse a binary search tree in sorted order (in-order)",
    initialData: [50, 30, 70, 20, 40, 60, 80],
    expectedOutput: [20, 30, 40, 50, 60, 70, 80],
    assertions: `
      expect(result).toEqual([20, 30, 40, 50, 60, 70, 80]);
      expect(result.length).toBe(7);
    `,
    referenceSolution: `function inorderTraversal(tree) {
  // In-order traversal returns sorted order for BST
  return tree.inorderTraversal();
}`,
    skeletonCode: `function inorderTraversal(tree) {
  // TODO: Implement in-order traversal
  // Hint: The tree parameter is a TrackedBinaryTree
  // Hint: Use tree.inorderTraversal() method
  // In-order means: visit left subtree, visit root, visit right subtree

  return tree.inorderTraversal();
}`,
    hints: [
      "In-order traversal visits nodes in order: left subtree → root → right subtree",
      "For a Binary Search Tree, in-order traversal returns values in sorted order",
      "The TrackedBinaryTree has an inorderTraversal() method that does this for you",
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
    initialData: [50, 30, 70, 20, 40, 60, 80],
    expectedOutput: true,
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
    description: "Given an unbalanced BST, create a balanced BST with the same values",
    initialData: [1, 2, 3, 4, 5, 6, 7], // This creates a right-skewed tree
    expectedOutput: [1, 2, 3, 4, 5, 6, 7], // Balanced tree still contains same values
    assertions: `
      expect(result.sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7]);
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
