/**
 * Preset algorithm examples for Binary Trees
 */

import type { PresetExample } from "./types";

export const treePresets: PresetExample[] = [
  {
    id: "tree-inorder-traversal",
    name: "In-Order Traversal",
    description: "Visit nodes in left-root-right order (produces sorted sequence for BST)",
    category: "traversal",
    dataStructure: "tree",
    timeComplexity: "O(n)",
    spaceComplexity: "O(h)",
    tags: ["traversal", "recursive", "dfs"],
    code: `function inorderTraversal(tree) {
  // In-order: Left -> Root -> Right
  // For BST, this visits nodes in ascending order
  const result = [];

  function traverse(node) {
    if (node === null) return;

    // Visit left subtree first
    traverse(node.left);

    // Visit current node
    result.push(node.value);

    // Visit right subtree last
    traverse(node.right);
  }

  traverse(tree.root);
  return result;
}

// Test it:
const tree = createBST([5, 3, 7, 1, 4, 6, 9]);
console.log(inorderTraversal(tree));  // [1, 3, 4, 5, 6, 7, 9]`,
  },
  {
    id: "tree-preorder-traversal",
    name: "Pre-Order Traversal",
    description: "Visit nodes in root-left-right order (useful for copying trees)",
    category: "traversal",
    dataStructure: "tree",
    timeComplexity: "O(n)",
    spaceComplexity: "O(h)",
    tags: ["traversal", "recursive", "dfs"],
    code: `function preorderTraversal(tree) {
  // Pre-order: Root -> Left -> Right
  // Useful for creating a copy of the tree
  const result = [];

  function traverse(node) {
    if (node === null) return;

    // Visit current node first
    result.push(node.value);

    // Then visit left subtree
    traverse(node.left);

    // Finally visit right subtree
    traverse(node.right);
  }

  traverse(tree.root);
  return result;
}

// Test it:
const tree = createBST([5, 3, 7, 1, 4, 6, 9]);
console.log(preorderTraversal(tree));  // [5, 3, 1, 4, 7, 6, 9]`,
  },
  {
    id: "tree-postorder-traversal",
    name: "Post-Order Traversal",
    description: "Visit nodes in left-right-root order (useful for deleting trees)",
    category: "traversal",
    dataStructure: "tree",
    timeComplexity: "O(n)",
    spaceComplexity: "O(h)",
    tags: ["traversal", "recursive", "dfs"],
    code: `function postorderTraversal(tree) {
  // Post-order: Left -> Right -> Root
  // Useful for deleting tree (delete children before parent)
  const result = [];

  function traverse(node) {
    if (node === null) return;

    // Visit left subtree first
    traverse(node.left);

    // Then visit right subtree
    traverse(node.right);

    // Visit current node last
    result.push(node.value);
  }

  traverse(tree.root);
  return result;
}

// Test it:
const tree = createBST([5, 3, 7, 1, 4, 6, 9]);
console.log(postorderTraversal(tree));  // [1, 4, 3, 6, 9, 7, 5]`,
  },
  {
    id: "tree-level-order-traversal",
    name: "Level-Order Traversal (BFS)",
    description: "Visit nodes level by level using a queue",
    category: "traversal",
    dataStructure: "tree",
    timeComplexity: "O(n)",
    spaceComplexity: "O(w)",
    tags: ["traversal", "bfs", "queue"],
    code: `function levelOrderTraversal(tree) {
  // Level-order (BFS): Visit nodes level by level
  // Use a queue to track nodes to visit

  if (!tree.root) return [];

  const result = [];
  const queue = [tree.root];

  while (queue.length > 0) {
    // Process current level
    const levelSize = queue.length;
    const currentLevel = [];

    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift();
      currentLevel.push(node.value);

      // Add children to queue for next level
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }

    result.push(currentLevel);
  }

  return result;
}

// Test it:
const tree = createBST([5, 3, 7, 1, 4, 6, 9]);
console.log(levelOrderTraversal(tree));  // [[5], [3, 7], [1, 4, 6, 9]]`,
  },
  {
    id: "tree-max-depth",
    name: "Maximum Depth",
    description: "Find the height of the tree (longest path from root to leaf)",
    category: "measurement",
    dataStructure: "tree",
    timeComplexity: "O(n)",
    spaceComplexity: "O(h)",
    tags: ["recursive", "depth"],
    code: `function maxDepth(tree) {
  // Recursively find the maximum depth
  // Depth of a node = 1 + max depth of its subtrees

  function depth(node) {
    // Base case: null node has depth 0
    if (node === null) return 0;

    // Recursively get depth of left and right subtrees
    const leftDepth = depth(node.left);
    const rightDepth = depth(node.right);

    // Current depth is 1 + max of subtree depths
    return 1 + Math.max(leftDepth, rightDepth);
  }

  return depth(tree.root);
}

// Test it:
const tree = createBST([5, 3, 7, 1, 4, 6, 9]);
console.log(\`Tree height: \${maxDepth(tree)}\`);`,
  },
  {
    id: "tree-validate-bst",
    name: "Validate Binary Search Tree",
    description: "Check if a tree satisfies BST property (left < root < right)",
    category: "validation",
    dataStructure: "tree",
    timeComplexity: "O(n)",
    spaceComplexity: "O(h)",
    tags: ["recursive", "bst"],
    code: `function isValidBST(tree) {
  // Check if tree satisfies BST property at every node
  // For each node: all left values < node < all right values

  function validate(node, min, max) {
    // Empty tree is valid
    if (node === null) return true;

    // Check if current node violates BST property
    if (node.value <= min || node.value >= max) {
      return false;
    }

    // Recursively validate subtrees with updated bounds
    // Left subtree: all values must be < current value
    // Right subtree: all values must be > current value
    return (
      validate(node.left, min, node.value) &&
      validate(node.right, node.value, max)
    );
  }

  // Start with infinite bounds
  return validate(tree.root, -Infinity, Infinity);
}

// Test it:
const tree = createBST([5, 3, 7, 1, 4, 6, 9]);
console.log(\`Is valid BST: \${isValidBST(tree)}\`);`,
  },
  {
    id: "tree-lowest-common-ancestor",
    name: "Lowest Common Ancestor (BST)",
    description: "Find the lowest common ancestor of two nodes in a BST",
    category: "searching",
    dataStructure: "tree",
    timeComplexity: "O(h)",
    spaceComplexity: "O(1)",
    tags: ["bst", "searching"],
    code: `function lowestCommonAncestor(tree, p, q) {
  // For BST, we can use value comparisons
  // LCA is the split point where p and q go different directions

  let node = tree.root;

  while (node !== null) {
    // If both values are less, LCA is in left subtree
    if (p < node.value && q < node.value) {
      node = node.left;
    }
    // If both values are greater, LCA is in right subtree
    else if (p > node.value && q > node.value) {
      node = node.right;
    }
    // Found the split point - this is the LCA
    else {
      return node;
    }
  }

  return null;
}

// Test it:
const tree = createBST([6, 2, 8, 0, 4, 7, 9, 3, 5]);
const lca = lowestCommonAncestor(tree, 2, 8);
console.log(\`LCA value: \${lca?.value}\`);  // 6`,
  },
];
