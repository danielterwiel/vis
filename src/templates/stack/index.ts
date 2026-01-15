/**
 * Stack skeleton code templates
 *
 * These templates match the test cases defined in stackQueueTests.ts
 */

import { skeletonCodeSystem } from "../skeletonCodeSystem";

/**
 * Easy: Balanced Parentheses Checker
 * Uses stack to track opening parentheses
 */
const easySkeleton = `// Example usage: Check if a string has balanced parentheses using a stack

function isBalanced(str) {
  // TODO: Create a stack using createTrackedStack()
  const stack = createTrackedStack();

  // TODO: Iterate through each character
  // For '(' push to stack
  // For ')' pop from stack (check if empty first)
  // Use stack.push(value), stack.pop(), stack.isEmpty()

  // TODO: Return true if stack is empty at the end

}
`;

/**
 * Medium: Implement Queue Using Two Stacks
 * Requires understanding of how to reverse LIFO to FIFO
 */
const mediumSkeleton = `// Example usage: Implement a queue using two stacks with enqueue and dequeue operations

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
 * Hard: Min Stack with O(1) getMin
 * Requires auxiliary stack to track minimum values
 */
const hardSkeleton = `// Example usage: Implement a stack that supports push, pop, and getMin in O(1) time

function minStack(arr) {
  const stack = createTrackedStack();
  const minStack = createTrackedStack();

  // TODO: Push elements to main stack
  // TODO: Keep track of minimum in minStack
  // If new element <= current min, push to minStack
  // Use stack.push(val), minStack.peek(), minStack.isEmpty()

  // TODO: Return the minimum element (peek from minStack)

}
`;

/**
 * Register all stack templates
 */
export function registerStackTemplates(): void {
  skeletonCodeSystem.registerTemplate("stack", "easy", easySkeleton);
  skeletonCodeSystem.registerTemplate("stack", "medium", mediumSkeleton);
  skeletonCodeSystem.registerTemplate("stack", "hard", hardSkeleton);
}

/**
 * Export individual templates for testing
 */
export { easySkeleton, mediumSkeleton, hardSkeleton };
