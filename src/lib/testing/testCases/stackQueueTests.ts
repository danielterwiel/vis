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
    id: "queue-basic-operations-easy",
    name: "Basic Queue Operations",
    difficulty: "easy",
    description: "Process a series of enqueue and dequeue operations on a queue",
    initialData: [1, 2, 3, 4, 5],
    expectedOutput: [1, 2, 3, 4, 5],
    assertions: `
      expect(result).toEqual([1, 2, 3, 4, 5]);
      expect(steps.filter(s => s.type === 'enqueue').length).toBe(5);
      expect(steps.filter(s => s.type === 'dequeue').length).toBe(5);
    `,
    referenceSolution: `function processQueue(arr) {
  const queue = createTrackedQueue();
  const result = [];

  // Enqueue all elements
  for (let i = 0; i < arr.length; i++) {
    queue.enqueue(arr[i]);
  }

  // Dequeue all elements (FIFO order)
  while (!queue.isEmpty()) {
    result.push(queue.dequeue());
  }

  return result;
}`,
    skeletonCode: `function processQueue(arr) {
  // TODO: Create a queue using createTrackedQueue()
  const queue = createTrackedQueue();
  const result = [];

  // TODO: Enqueue all elements from the array
  // Use queue.enqueue(value)

  // TODO: Dequeue all elements and add to result
  // Use queue.dequeue() and queue.isEmpty()

  return result;
}`,
    hints: [
      "Create a queue using createTrackedQueue()",
      "Use enqueue() to add elements to the rear",
      "Use dequeue() to remove elements from the front (FIFO)",
    ],
    acceptanceCriteria: [
      "Function returns elements in FIFO order (same as input)",
      "All enqueue and dequeue operations are captured",
      "Result array matches expected output",
    ],
  },
  {
    id: "queue-reverse-first-k-medium",
    name: "Reverse First K Elements",
    difficulty: "medium",
    description:
      "Reverse the first K elements of a queue while maintaining the order of remaining elements",
    initialData: [1, 2, 3, 4, 5],
    expectedOutput: [3, 2, 1, 4, 5],
    assertions: `
      expect(result).toEqual([3, 2, 1, 4, 5]);
      expect(steps.filter(s => s.type === 'enqueue').length).toBeGreaterThan(0);
      expect(steps.filter(s => s.type === 'dequeue').length).toBeGreaterThan(0);
    `,
    referenceSolution: `function reverseFirstK(arr) {
  const queue = createTrackedQueue();
  const stack = createTrackedStack();
  const k = 3;

  // Enqueue all elements
  for (let i = 0; i < arr.length; i++) {
    queue.enqueue(arr[i]);
  }

  // Dequeue first k elements and push to stack
  for (let i = 0; i < k; i++) {
    stack.push(queue.dequeue());
  }

  // Pop from stack and enqueue back (reverses first k)
  while (!stack.isEmpty()) {
    queue.enqueue(stack.pop());
  }

  // Move remaining elements to the end
  for (let i = 0; i < arr.length - k; i++) {
    queue.enqueue(queue.dequeue());
  }

  // Collect result
  const result = [];
  while (!queue.isEmpty()) {
    result.push(queue.dequeue());
  }

  return result;
}`,
    skeletonCode: `function reverseFirstK(arr) {
  const queue = createTrackedQueue();
  const stack = createTrackedStack();
  const k = 3;

  // TODO: Enqueue all elements to the queue

  // TODO: Dequeue first k elements and push to stack
  // This reverses their order

  // TODO: Pop from stack and enqueue back to queue

  // TODO: Move remaining elements to the back of queue

  // TODO: Collect all elements from queue into result array

  return result;
}`,
    hints: [
      "Use a stack to reverse the first K elements",
      "Dequeue K elements, push to stack, then pop back to queue",
      "Move the remaining (n-k) elements to maintain their order",
    ],
    acceptanceCriteria: [
      "Function returns [3, 2, 1, 4, 5] for input [1, 2, 3, 4, 5] with k=3",
      "Both enqueue and dequeue operations are captured",
      "Result array matches expected output",
    ],
  },
  {
    id: "queue-interleave-halves-hard",
    name: "Interleave Two Halves of Queue",
    difficulty: "hard",
    description:
      "Interleave the first and second halves of a queue (e.g., [1,2,3,4,5,6] becomes [1,4,2,5,3,6])",
    initialData: [1, 2, 3, 4, 5, 6],
    expectedOutput: [1, 4, 2, 5, 3, 6],
    assertions: `
      expect(result).toEqual([1, 4, 2, 5, 3, 6]);
      expect(steps.filter(s => s.type === 'enqueue').length).toBeGreaterThan(0);
      expect(steps.filter(s => s.type === 'dequeue').length).toBeGreaterThan(0);
    `,
    referenceSolution: `function interleaveQueue(arr) {
  const queue = createTrackedQueue();
  const tempQueue = createTrackedQueue();
  const n = arr.length;
  const half = n / 2;

  // Enqueue all elements
  for (let i = 0; i < n; i++) {
    queue.enqueue(arr[i]);
  }

  // Move first half to temp queue
  for (let i = 0; i < half; i++) {
    tempQueue.enqueue(queue.dequeue());
  }

  // Interleave: dequeue from temp and main queue alternately
  const result = [];
  for (let i = 0; i < half; i++) {
    result.push(tempQueue.dequeue());
    result.push(queue.dequeue());
  }

  return result;
}`,
    skeletonCode: `function interleaveQueue(arr) {
  const queue = createTrackedQueue();
  const tempQueue = createTrackedQueue();
  const n = arr.length;
  const half = n / 2;

  // TODO: Enqueue all elements to main queue

  // TODO: Move first half of elements to temp queue

  // TODO: Interleave elements from temp and main queue
  // Alternate between dequeuing from temp and main

  return result;
}`,
    hints: [
      "Use a temporary queue to hold the first half of elements",
      "Move first n/2 elements to the temp queue",
      "Alternately dequeue from temp and main queue to interleave",
    ],
    acceptanceCriteria: [
      "Function returns [1, 4, 2, 5, 3, 6] for input [1, 2, 3, 4, 5, 6]",
      "Both enqueue and dequeue operations are captured",
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
