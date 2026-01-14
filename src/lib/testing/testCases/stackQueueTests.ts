import type { TestCase } from "../types";

/**
 * Stack and Queue test cases with 3 difficulty levels (Easy, Medium, Hard)
 * Based on PRD.md lines 519-526
 */
export const stackQueueTests: TestCase[] = [
  {
    id: "stack-balanced-parentheses-easy",
    name: "Balanced Parentheses Checker",
    difficulty: "easy",
    description: "Check if a string has balanced parentheses using a stack",
    initialData: "(()())",
    expectedOutput: true,
    assertions: `
      expect(result).toBe(true);
    `,
    referenceSolution: `function isBalanced(str) {
  const stack = createTrackedStack();

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (char === '(') {
      stack.push(char);
    } else if (char === ')') {
      if (stack.isEmpty()) {
        return false;
      }
      stack.pop();
    }
  }

  return stack.isEmpty();
}`,
    skeletonCode: `function isBalanced(str) {
  // TODO: Create a stack using createTrackedStack()
  const stack = createTrackedStack();

  // TODO: Iterate through each character
  // For '(' push to stack
  // For ')' pop from stack (check if empty first)
  // Use stack.push(value), stack.pop(), stack.isEmpty()

  // TODO: Return true if stack is empty at the end

}`,
    hints: [
      "Use a stack to keep track of opening parentheses",
      "Push '(' onto the stack, pop when you see ')'",
      "The string is balanced if the stack is empty at the end",
    ],
    acceptanceCriteria: [
      "Function returns true for balanced strings like '(()())'",
      "Function returns false for unbalanced strings",
      "Stack operations are captured for visualization",
    ],
  },
  {
    id: "queue-using-stacks-medium",
    name: "Implement Queue Using Two Stacks",
    difficulty: "medium",
    description: "Implement a queue using two stacks with enqueue and dequeue operations",
    initialData: [1, 2, 3, 4, 5],
    expectedOutput: [1, 2, 3, 4, 5],
    assertions: `
      expect(result).toEqual([1, 2, 3, 4, 5]);
      expect(steps.filter(s => s.type === 'push').length).toBeGreaterThan(0);
      expect(steps.filter(s => s.type === 'pop').length).toBeGreaterThan(0);
    `,
    referenceSolution: `function queueUsingStacks(arr) {
  const stack1 = createTrackedStack();
  const stack2 = createTrackedStack();
  const result = [];

  // Enqueue: push to stack1
  for (let i = 0; i < arr.length; i++) {
    stack1.push(arr[i]);
  }

  // Dequeue: transfer to stack2 if needed, then pop
  for (let i = 0; i < arr.length; i++) {
    if (stack2.isEmpty()) {
      while (!stack1.isEmpty()) {
        stack2.push(stack1.pop());
      }
    }
    result.push(stack2.pop());
  }

  return result;
}`,
    skeletonCode: `function queueUsingStacks(arr) {
  const stack1 = createTrackedStack();
  const stack2 = createTrackedStack();
  const result = [];

  // TODO: Enqueue - push all elements to stack1

  // TODO: Dequeue - transfer from stack1 to stack2 (reverses order)
  // Then pop from stack2 to get FIFO order
  // Use stack.push(), stack.pop(), stack.isEmpty()

  return result;
}`,
    hints: [
      "Use stack1 for enqueue (push), stack2 for dequeue (pop)",
      "Transfer elements from stack1 to stack2 to reverse the order",
      "When stack2 is empty, move all elements from stack1 to stack2",
    ],
    acceptanceCriteria: [
      "Function returns elements in FIFO order (same as input)",
      "Both push and pop operations are captured",
      "Result array matches expected output",
    ],
  },
  {
    id: "min-stack-hard",
    name: "Min Stack with O(1) getMin",
    difficulty: "hard",
    description: "Implement a stack that supports push, pop, and getMin in O(1) time",
    initialData: [5, 2, 8, 1, 9],
    expectedOutput: 1,
    assertions: `
      expect(result).toBe(1);
      expect(steps.filter(s => s.type === 'push').length).toBe(5);
    `,
    referenceSolution: `function minStack(arr) {
  const stack = createTrackedStack();
  const minStack = createTrackedStack();

  // Push all elements, tracking minimum
  for (let i = 0; i < arr.length; i++) {
    const val = arr[i];
    stack.push(val);

    if (minStack.isEmpty() || val <= minStack.peek()) {
      minStack.push(val);
    }
  }

  // Return the minimum element
  return minStack.peek();
}`,
    skeletonCode: `function minStack(arr) {
  const stack = createTrackedStack();
  const minStack = createTrackedStack();

  // TODO: Push elements to main stack
  // TODO: Keep track of minimum in minStack
  // If new element <= current min, push to minStack
  // Use stack.push(val), minStack.peek(), minStack.isEmpty()

  // TODO: Return the minimum element (peek from minStack)

}`,
    hints: [
      "Use a second stack to track the minimum values",
      "When pushing, if the new value is <= current min, push to minStack",
      "The top of minStack always contains the current minimum",
    ],
    acceptanceCriteria: [
      "Function returns the minimum element (1) from the input array",
      "All push operations are captured",
      "getMin operation runs in O(1) time",
    ],
  },
];
