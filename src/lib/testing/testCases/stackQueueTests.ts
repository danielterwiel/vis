import type { TestCase } from "../types";
import type { PatternRequirement } from "../../validation/types";

/**
 * Stack and Queue test cases with 3 difficulty levels (Easy, Medium, Hard)
 *
 * All test cases use a single function name 'processElements' that processes
 * elements through data structures and returns them in FIFO order.
 * The difficulty levels require different algorithmic approaches validated via AST.
 *
 * All test cases use the same input dataset [1, 2, 3, 4, 5, 6] for consistency.
 */

// Single dataset used across all Stack/Queue test cases
const STACKQUEUE_INPUT_DATA = [1, 2, 3, 4, 5, 6];
const STACKQUEUE_OUTPUT_DATA = [1, 2, 3, 4, 5, 6]; // FIFO order

export const stackQueueTests: TestCase[] = [
  {
    id: "stackqueue-process-easy",
    name: "Process Elements (Easy)",
    difficulty: "easy",
    description:
      "Process elements and return them in FIFO order. You can use any method.",
    initialData: STACKQUEUE_INPUT_DATA,
    expectedOutput: STACKQUEUE_OUTPUT_DATA,
    assertions: `
      expect(result).toEqual([1, 2, 3, 4, 5, 6]);
      expect(result.length).toBe(6);
    `,
    referenceSolution: `function processElements(arr) {
  // Easy approach: simple iteration
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    result.push(arr[i]);
  }
  return result;
}`,
    skeletonCode: `function processElements(arr) {
  // TODO: Process elements and return them in FIFO order
  // You can use any method to accomplish this
  // The simplest approach is to iterate and collect elements

  const result = [];

  // TODO: Add elements to result in order

  return result;
}`,
    hints: [
      "FIFO means First-In-First-Out - return elements in their original order",
      "You can use a simple loop to iterate through the array",
      "Push each element to the result array as you iterate",
    ],
    acceptanceCriteria: [
      "Function returns elements in original order",
      "Result array has same length as input",
      "All elements are included in result",
    ],
  },
  {
    id: "stackqueue-process-medium",
    name: "Process Elements (Medium)",
    difficulty: "medium",
    description:
      "Process elements using stack and queue operations to return them in FIFO order.",
    initialData: STACKQUEUE_INPUT_DATA,
    expectedOutput: STACKQUEUE_OUTPUT_DATA,
    assertions: `
      expect(result).toEqual([1, 2, 3, 4, 5, 6]);
      expect(result.length).toBe(6);
      expect(steps.filter(s => s.type === 'push' || s.type === 'enqueue').length).toBeGreaterThan(0);
    `,
    referenceSolution: `function processElements(arr) {
  // Medium approach: use stack and queue to process elements
  const stack = createTrackedStack();
  const queue = createTrackedQueue();

  // Push all to stack
  for (let i = 0; i < arr.length; i++) {
    stack.push(arr[i]);
  }

  // Pop from stack to queue (reverses order)
  while (!stack.isEmpty()) {
    queue.enqueue(stack.pop());
  }

  // Pop all back to stack (reverses again = original order)
  while (!queue.isEmpty()) {
    stack.push(queue.dequeue());
  }

  // Pop from stack to queue one more time
  while (!stack.isEmpty()) {
    queue.enqueue(stack.pop());
  }

  // Dequeue all to result
  const result = [];
  while (!queue.isEmpty()) {
    result.push(queue.dequeue());
  }

  return result;
}`,
    skeletonCode: `function processElements(arr) {
  // TODO: Use stack and/or queue to process elements
  // Goal: Return elements in FIFO order using data structure operations
  //
  // Hint: You can use both createTrackedStack() and createTrackedQueue()
  // Stack operations: push(), pop(), isEmpty(), peek()
  // Queue operations: enqueue(), dequeue(), isEmpty(), peek()

  const stack = createTrackedStack();
  const queue = createTrackedQueue();

  // TODO: Process elements through stack and/or queue
  // Remember: stack is LIFO, queue is FIFO
  // To maintain FIFO order with a stack, you may need multiple passes

  const result = [];

  // TODO: Collect final results

  return result;
}`,
    hints: [
      "Use createTrackedStack() and/or createTrackedQueue() for tracked operations",
      "Stack is LIFO (Last-In-First-Out), Queue is FIFO (First-In-First-Out)",
      "To convert LIFO to FIFO, you can use double-reversal with a stack",
      "Or simply use a queue for direct FIFO processing",
    ],
    acceptanceCriteria: [
      "Function returns elements in FIFO order",
      "Uses stack and/or queue operations",
      "All operations are captured for visualization",
    ],
    patternRequirement: {
      anyOf: ["stackUsage", "queueUsage"],
      errorMessage:
        "Medium difficulty requires using stack or queue operations. Use createTrackedStack() and/or createTrackedQueue().",
    } satisfies PatternRequirement,
  },
  {
    id: "stackqueue-process-hard",
    name: "Process Elements (Hard)",
    difficulty: "hard",
    description:
      "Implement queue behavior using two stacks to return elements in FIFO order.",
    initialData: STACKQUEUE_INPUT_DATA,
    expectedOutput: STACKQUEUE_OUTPUT_DATA,
    assertions: `
      expect(result).toEqual([1, 2, 3, 4, 5, 6]);
      expect(result.length).toBe(6);
      expect(steps.filter(s => s.type === 'push').length).toBeGreaterThan(0);
      expect(steps.filter(s => s.type === 'pop').length).toBeGreaterThan(0);
    `,
    referenceSolution: `function processElements(arr) {
  // Hard approach: implement FIFO queue using two stacks
  const stack1 = createTrackedStack();
  const stack2 = createTrackedStack();
  const result = [];

  // "Enqueue" all elements (push to stack1)
  for (let i = 0; i < arr.length; i++) {
    stack1.push(arr[i]);
  }

  // "Dequeue" all elements:
  // Transfer from stack1 to stack2 (reverses order)
  while (!stack1.isEmpty()) {
    stack2.push(stack1.pop());
  }

  // Pop from stack2 gives FIFO order
  while (!stack2.isEmpty()) {
    result.push(stack2.pop());
  }

  return result;
}`,
    skeletonCode: `function processElements(arr) {
  // TODO: Implement FIFO behavior using only two stacks
  // This demonstrates the classic "Queue using Two Stacks" pattern
  //
  // Algorithm:
  // 1. "Enqueue" by pushing to stack1
  // 2. "Dequeue" by:
  //    - If stack2 is empty, transfer all from stack1 to stack2
  //    - Pop from stack2 (this gives FIFO order)
  //
  // The key insight: transferring reverses order (LIFO→FIFO)

  const stack1 = createTrackedStack();
  const stack2 = createTrackedStack();
  const result = [];

  // TODO: Push all elements to stack1 (enqueue)

  // TODO: Transfer all elements from stack1 to stack2
  // This reverses the order

  // TODO: Pop all elements from stack2 to result
  // Elements now come out in FIFO order

  return result;
}`,
    hints: [
      "This is the classic 'Queue using Two Stacks' problem",
      "stack1 is for 'enqueue' operations - just push elements",
      "To 'dequeue', transfer all from stack1 to stack2, then pop from stack2",
      "The double reversal (LIFO → LIFO) gives FIFO behavior",
    ],
    acceptanceCriteria: [
      "Function returns elements in FIFO order",
      "Uses exactly two stacks (no queue)",
      "Demonstrates queue-using-stacks pattern",
    ],
    patternRequirement: {
      anyOf: ["twoStacks"],
      errorMessage:
        "Hard difficulty requires implementing queue behavior using two stacks. Use createTrackedStack() twice.",
    } satisfies PatternRequirement,
  },
];
