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

// Queue-specific tests (id prefix: "queue-")
export const queueTests: TestCase[] = [
  {
    id: "queue-process-easy",
    name: "Queue Elements (Easy)",
    difficulty: "easy",
    description:
      "Process elements using a queue and return them in FIFO order.",
    initialData: STACKQUEUE_INPUT_DATA,
    expectedOutput: STACKQUEUE_OUTPUT_DATA,
    assertions: `
      expect(result).toEqual([1, 2, 3, 4, 5, 6]);
      expect(result.length).toBe(6);
    `,
    referenceSolution: `function processElements(arr) {
  const queue = createTrackedQueue();

  // Enqueue all elements
  for (let i = 0; i < arr.length; i++) {
    queue.enqueue(arr[i]);
  }

  // Dequeue all elements (FIFO order)
  const result = [];
  while (!queue.isEmpty()) {
    result.push(queue.dequeue());
  }

  return result;
}`,
    skeletonCode: `function processElements(arr) {
  // TODO: Use a queue to process elements in FIFO order
  // Queue operations: enqueue(), dequeue(), isEmpty(), peek()

  const queue = createTrackedQueue();
  const result = [];

  // TODO: Enqueue all elements

  // TODO: Dequeue all elements to result

  return result;
}`,
    hints: [
      "A queue is FIFO - First-In-First-Out",
      "Use enqueue() to add elements to the back",
      "Use dequeue() to remove elements from the front",
    ],
    acceptanceCriteria: [
      "Function uses queue operations",
      "Returns elements in original order (FIFO)",
      "All elements are included in result",
    ],
  },
  {
    id: "queue-process-medium",
    name: "Queue Elements (Medium)",
    difficulty: "medium",
    description:
      "Process elements using queue operations with multiple passes.",
    initialData: STACKQUEUE_INPUT_DATA,
    expectedOutput: STACKQUEUE_OUTPUT_DATA,
    assertions: `
      expect(result).toEqual([1, 2, 3, 4, 5, 6]);
      expect(result.length).toBe(6);
      // Must have more enqueue operations than input length (rotation requires re-enqueueing)
      const enqueueCount = steps.filter(s => s.type === 'enqueue').length;
      expect(enqueueCount).toBeGreaterThan(arr.length);
    `,
    referenceSolution: `function processElements(arr) {
  const queue = createTrackedQueue();

  // Enqueue all elements
  for (let i = 0; i < arr.length; i++) {
    queue.enqueue(arr[i]);
  }

  // Rotate queue once (dequeue and re-enqueue all)
  const size = arr.length;
  for (let i = 0; i < size; i++) {
    queue.enqueue(queue.dequeue());
  }

  // Dequeue all to result
  const result = [];
  while (!queue.isEmpty()) {
    result.push(queue.dequeue());
  }

  return result;
}`,
    skeletonCode: `function processElements(arr) {
  // TODO: Use queue operations with rotation
  // Goal: Return elements in FIFO order
  //
  // Hint: You can rotate a queue by dequeuing and re-enqueuing
  // This demonstrates understanding of queue behavior

  const queue = createTrackedQueue();

  // TODO: Enqueue all elements

  // TODO: Optionally rotate the queue (dequeue and re-enqueue)

  const result = [];

  // TODO: Dequeue all to result

  return result;
}`,
    hints: [
      "Use createTrackedQueue() for tracked operations",
      "Queue rotation: dequeue from front, enqueue to back",
      "A full rotation returns to original order",
    ],
    acceptanceCriteria: [
      "Function returns elements in FIFO order",
      "Uses queue operations (enqueue/dequeue)",
      "All operations are captured for visualization",
    ],
    patternRequirement: {
      anyOf: ["queueUsage"],
      errorMessage:
        "Medium difficulty requires using queue operations. Use createTrackedQueue().",
    } satisfies PatternRequirement,
  },
  {
    id: "queue-process-hard",
    name: "Queue Elements (Hard)",
    difficulty: "hard",
    description:
      "Implement a priority-based processing using queue operations.",
    initialData: STACKQUEUE_INPUT_DATA,
    expectedOutput: STACKQUEUE_OUTPUT_DATA,
    assertions: `
      expect(result).toEqual([1, 2, 3, 4, 5, 6]);
      expect(result.length).toBe(6);
      expect(steps.filter(s => s.type === 'enqueue').length).toBeGreaterThan(0);
      expect(steps.filter(s => s.type === 'dequeue').length).toBeGreaterThan(0);
    `,
    referenceSolution: `function processElements(arr) {
  const queue1 = createTrackedQueue();
  const queue2 = createTrackedQueue();

  // Enqueue all to queue1
  for (let i = 0; i < arr.length; i++) {
    queue1.enqueue(arr[i]);
  }

  // Transfer to queue2 (keeping FIFO order)
  while (!queue1.isEmpty()) {
    queue2.enqueue(queue1.dequeue());
  }

  // Transfer back to queue1
  while (!queue2.isEmpty()) {
    queue1.enqueue(queue2.dequeue());
  }

  // Dequeue all to result
  const result = [];
  while (!queue1.isEmpty()) {
    result.push(queue1.dequeue());
  }

  return result;
}`,
    skeletonCode: `function processElements(arr) {
  // TODO: Use two queues to process elements
  // This demonstrates queue-to-queue transfers
  //
  // Algorithm:
  // 1. Enqueue all elements to queue1
  // 2. Transfer all from queue1 to queue2
  // 3. Transfer all from queue2 back to queue1
  // 4. Dequeue all to result

  const queue1 = createTrackedQueue();
  const queue2 = createTrackedQueue();
  const result = [];

  // TODO: Enqueue all elements to queue1

  // TODO: Transfer from queue1 to queue2

  // TODO: Transfer from queue2 to queue1

  // TODO: Dequeue all to result

  return result;
}`,
    hints: [
      "Use two queues for the transfer pattern",
      "Each transfer maintains FIFO order (unlike stacks)",
      "This demonstrates queue-to-queue processing",
    ],
    acceptanceCriteria: [
      "Function returns elements in FIFO order",
      "Uses two queues",
      "Demonstrates queue-to-queue transfers",
    ],
    patternRequirement: {
      anyOf: ["twoQueues"],
      errorMessage:
        "Hard difficulty requires using two queues. Use createTrackedQueue() twice.",
    } satisfies PatternRequirement,
  },
];

// Stack-specific tests (id prefix: "stack-")
export const stackTests: TestCase[] = [
  {
    id: "stack-process-easy",
    name: "Stack Elements (Easy)",
    difficulty: "easy",
    description:
      "Process elements using a stack. Return them in reverse (LIFO) order.",
    initialData: STACKQUEUE_INPUT_DATA,
    expectedOutput: [6, 5, 4, 3, 2, 1], // LIFO reverses the order
    assertions: `
      expect(result).toEqual([6, 5, 4, 3, 2, 1]);
      expect(result.length).toBe(6);
    `,
    referenceSolution: `function processElements(arr) {
  const stack = createTrackedStack();

  // Push all elements
  for (let i = 0; i < arr.length; i++) {
    stack.push(arr[i]);
  }

  // Pop all elements (LIFO order = reversed)
  const result = [];
  while (!stack.isEmpty()) {
    result.push(stack.pop());
  }

  return result;
}`,
    skeletonCode: `function processElements(arr) {
  // TODO: Use a stack to process elements
  // Stack is LIFO - Last-In-First-Out
  // Stack operations: push(), pop(), isEmpty(), peek()

  const stack = createTrackedStack();
  const result = [];

  // TODO: Push all elements to stack

  // TODO: Pop all elements to result

  return result;
}`,
    hints: [
      "A stack is LIFO - Last-In-First-Out",
      "Use push() to add elements to the top",
      "Use pop() to remove elements from the top",
    ],
    acceptanceCriteria: [
      "Function uses stack operations",
      "Returns elements in reverse order (LIFO)",
      "All elements are included in result",
    ],
  },
  {
    id: "stack-process-medium",
    name: "Stack Elements (Medium)",
    difficulty: "medium",
    description:
      "Use a stack to reverse elements twice, returning original order.",
    initialData: STACKQUEUE_INPUT_DATA,
    expectedOutput: STACKQUEUE_OUTPUT_DATA, // Double reversal = original
    assertions: `
      expect(result).toEqual([1, 2, 3, 4, 5, 6]);
      expect(result.length).toBe(6);
      expect(steps.filter(s => s.type === 'push').length).toBeGreaterThan(0);
    `,
    referenceSolution: `function processElements(arr) {
  const stack1 = createTrackedStack();
  const stack2 = createTrackedStack();

  // Push all to stack1
  for (let i = 0; i < arr.length; i++) {
    stack1.push(arr[i]);
  }

  // Pop from stack1, push to stack2 (first reversal)
  while (!stack1.isEmpty()) {
    stack2.push(stack1.pop());
  }

  // Pop from stack2 to result (second reversal = original order)
  const result = [];
  while (!stack2.isEmpty()) {
    result.push(stack2.pop());
  }

  return result;
}`,
    skeletonCode: `function processElements(arr) {
  // TODO: Use two stacks to double-reverse elements
  // Goal: Return elements in original FIFO order using only stacks
  //
  // Hint: LIFO + LIFO = FIFO (double reversal)

  const stack1 = createTrackedStack();
  const stack2 = createTrackedStack();

  // TODO: Push all elements to stack1

  // TODO: Pop from stack1, push to stack2 (first reversal)

  const result = [];

  // TODO: Pop from stack2 to result (second reversal)

  return result;
}`,
    hints: [
      "Use two stacks for double reversal",
      "First reversal: stack1 -> stack2",
      "Second reversal: stack2 -> result",
      "Double LIFO gives FIFO order",
    ],
    acceptanceCriteria: [
      "Function returns elements in original order",
      "Uses two stacks",
      "Demonstrates double-reversal pattern",
    ],
    patternRequirement: {
      anyOf: ["stackUsage"],
      errorMessage:
        "Medium difficulty requires using stack operations. Use createTrackedStack().",
    } satisfies PatternRequirement,
  },
  {
    id: "stack-process-hard",
    name: "Stack Elements (Hard)",
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

// Combined export for backward compatibility
export const stackQueueTests: TestCase[] = [...stackTests, ...queueTests];
