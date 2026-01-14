/**
 * Preset algorithm examples for Stacks and Queues
 */

import type { PresetExample } from "./types";

export const stackQueuePresets: PresetExample[] = [
  {
    id: "stack-balanced-parentheses",
    name: "Balanced Parentheses",
    description: "Check if parentheses are balanced using a stack",
    category: "validation",
    dataStructure: "stack",
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    tags: ["stack", "validation"],
    code: `function isBalanced(str) {
  // Use stack to match opening and closing brackets
  const stack = [];
  const pairs = { '(': ')', '[': ']', '{': '}' };

  for (const char of str) {
    // If opening bracket, push to stack
    if (char in pairs) {
      stack.push(char);
    }
    // If closing bracket, check if it matches top of stack
    else if (Object.values(pairs).includes(char)) {
      if (stack.length === 0) return false;
      const top = stack.pop();
      if (pairs[top] !== char) return false;
    }
  }

  // Stack should be empty if balanced
  return stack.length === 0;
}

// Test it:
console.log(isBalanced("([{}])"));      // true
console.log(isBalanced("([{)]"));       // false
console.log(isBalanced("((())"));       // false`,
  },
  {
    id: "stack-reverse-string",
    name: "Reverse String Using Stack",
    description: "Reverse a string by pushing characters onto stack and popping them",
    category: "manipulation",
    dataStructure: "stack",
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    tags: ["stack", "string"],
    code: `function reverseString(str) {
  // Stack is LIFO: last in, first out
  // Push all characters, then pop them (reversed order)

  const stack = [];

  // Push all characters onto stack
  for (const char of str) {
    stack.push(char);
  }

  // Pop all characters to build reversed string
  let reversed = '';
  while (stack.length > 0) {
    reversed += stack.pop();
  }

  return reversed;
}

// Test it:
console.log(reverseString("hello"));  // "olleh"`,
  },
  {
    id: "stack-evaluate-postfix",
    name: "Evaluate Postfix Expression",
    description: "Calculate the result of a postfix (RPN) expression using a stack",
    category: "evaluation",
    dataStructure: "stack",
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    tags: ["stack", "arithmetic"],
    code: `function evaluatePostfix(tokens) {
  // Postfix notation: operands come before operators
  // Example: "3 4 +" means 3 + 4 = 7

  const stack = [];
  const operators = new Set(['+', '-', '*', '/']);

  for (const token of tokens) {
    if (operators.has(token)) {
      // Pop two operands (note the order!)
      const b = stack.pop();
      const a = stack.pop();

      // Apply operator and push result
      let result;
      switch (token) {
        case '+': result = a + b; break;
        case '-': result = a - b; break;
        case '*': result = a * b; break;
        case '/': result = Math.floor(a / b); break;
      }
      stack.push(result);
    } else {
      // It's a number, push it
      stack.push(parseInt(token));
    }
  }

  return stack.pop();
}

// Test it:
console.log(evaluatePostfix(["2", "1", "+", "3", "*"]));  // (2+1)*3 = 9`,
  },
  {
    id: "queue-bfs-tree",
    name: "Level-Order Tree Traversal",
    description: "Traverse a tree level by level using a queue",
    category: "traversal",
    dataStructure: "queue",
    timeComplexity: "O(n)",
    spaceComplexity: "O(w)",
    tags: ["queue", "bfs", "tree"],
    code: `function levelOrder(root) {
  // Queue is FIFO: first in, first out
  // Process nodes level by level

  if (!root) return [];

  const result = [];
  const queue = [root];

  while (queue.length > 0) {
    const levelSize = queue.length;
    const level = [];

    // Process all nodes at current level
    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift();  // Dequeue from front
      level.push(node.value);

      // Enqueue children for next level
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }

    result.push(level);
  }

  return result;
}

// Test it:
const tree = { value: 1, left: { value: 2 }, right: { value: 3 } };
console.log(levelOrder(tree));  // [[1], [2, 3]]`,
  },
  {
    id: "queue-sliding-window",
    name: "Sliding Window Maximum",
    description: "Find maximum in each window of size k using a deque",
    category: "optimization",
    dataStructure: "queue",
    timeComplexity: "O(n)",
    spaceComplexity: "O(k)",
    tags: ["queue", "sliding-window", "deque"],
    code: `function maxSlidingWindow(nums, k) {
  // Use deque to efficiently track maximum in window
  // Deque stores indices of elements in decreasing order

  const result = [];
  const deque = [];  // stores indices

  for (let i = 0; i < nums.length; i++) {
    // Remove indices outside current window
    while (deque.length > 0 && deque[0] < i - k + 1) {
      deque.shift();
    }

    // Remove smaller elements (they'll never be max)
    while (deque.length > 0 && nums[deque[deque.length - 1]] < nums[i]) {
      deque.pop();
    }

    // Add current element's index
    deque.push(i);

    // Add maximum to result (front of deque)
    if (i >= k - 1) {
      result.push(nums[deque[0]]);
    }
  }

  return result;
}

// Test it:
console.log(maxSlidingWindow([1, 3, -1, -3, 5, 3, 6, 7], 3));
// [3, 3, 5, 5, 6, 7]`,
  },
];
