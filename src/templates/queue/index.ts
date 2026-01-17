/**
 * Queue skeleton code templates
 *
 * These templates match the test cases defined in stackQueueTests.ts
 * All levels use the same function name 'processElements' with different approaches
 */

import { skeletonCodeSystem } from "../skeletonCodeSystem";

/**
 * Easy: Process Elements (any method)
 * Simple iteration to return elements in FIFO order
 */
const easySkeleton = `// Example usage: Process elements and return them in FIFO order

function processElements(arr) {
  // TODO: Process elements and return them in FIFO order
  // You can use any method to accomplish this
  // The simplest approach is to iterate and collect elements

  const result = [];

  // TODO: Add elements to result in order

  return result;
}
`;

/**
 * Medium: Process Elements (stack/queue required)
 * Uses stack and/or queue operations
 */
const mediumSkeleton = `// Example usage: Process elements using stack and queue operations

function processElements(arr) {
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
}
`;

/**
 * Hard: Process Elements (two stacks required)
 * Implements queue behavior using only two stacks
 */
const hardSkeleton = `// Example usage: Implement FIFO behavior using only two stacks

function processElements(arr) {
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
}
`;

/**
 * Register all queue templates
 */
export function registerQueueTemplates(): void {
  skeletonCodeSystem.registerTemplate("queue", "easy", easySkeleton);
  skeletonCodeSystem.registerTemplate("queue", "medium", mediumSkeleton);
  skeletonCodeSystem.registerTemplate("queue", "hard", hardSkeleton);
}

/**
 * Export individual templates for testing
 */
export { easySkeleton, mediumSkeleton, hardSkeleton };
