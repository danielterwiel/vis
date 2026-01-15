/**
 * Queue skeleton code templates
 *
 * These templates match the test cases defined in stackQueueTests.ts
 */

import { skeletonCodeSystem } from "../skeletonCodeSystem";

/**
 * Easy: Basic Queue Operations
 * Uses TrackedQueue for FIFO operations
 */
const easySkeleton = `// Example usage: Implement basic queue operations (enqueue and dequeue)

function basicQueue(arr) {
  // TODO: Create a queue using createTrackedQueue()
  const queue = createTrackedQueue();

  // TODO: Enqueue all elements from the array
  // Use queue.enqueue(value) to add elements

  // TODO: Dequeue elements to verify FIFO order
  // Use queue.dequeue() to remove and return elements
  // Use queue.isEmpty() to check if queue is empty

}
`;

/**
 * Medium: Queue Using Two Stacks
 * Implements queue behavior using stack operations
 */
const mediumSkeleton = `// Example usage: Implement a queue using two stacks

function queueUsingStacks(arr) {
  const stack1 = createTrackedStack();
  const stack2 = createTrackedStack();
  const result = [];

  // TODO: Enqueue - push all elements to stack1

  // TODO: Dequeue - transfer from stack1 to stack2 (reverses order)
  // Then pop from stack2 to get FIFO order
  // Use stack.push(), stack.pop(), stack.isEmpty()

  return result;
}
`;

/**
 * Hard: Circular Queue Implementation
 * Implements circular queue with fixed capacity
 */
const hardSkeleton = `// Example usage: Implement a circular queue with fixed capacity

function circularQueue(arr, capacity) {
  const queue = createTrackedQueue();
  const result = [];

  // TODO: Enqueue elements, respecting capacity limit
  // If queue reaches capacity, dequeue before enqueuing
  // Use queue.enqueue(value), queue.dequeue(), queue.size()

  // TODO: Dequeue all remaining elements
  // Use queue.dequeue() and queue.isEmpty()

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
