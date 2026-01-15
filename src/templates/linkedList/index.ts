/**
 * Linked List skeleton code templates
 *
 * These templates match the test cases defined in linkedListTests.ts
 */

import { skeletonCodeSystem } from "../skeletonCodeSystem";

/**
 * Easy: Find Element in List
 * Traverse the list and find a specific element
 */
const easySkeleton = `function findElement(list, target) {
  // TODO: Implement find operation
  // Hint: Use list.find(target) to search for the value
  // The list parameter is a TrackedLinkedList that records operations

  return null;
}`;

/**
 * Medium: Reverse Linked List
 * Reverse a linked list in place
 */
const mediumSkeleton = `function reverseList(list) {
  // TODO: Implement list reversal
  // Hint: Use list.reverse() to reverse the list in place
  // The list parameter is a TrackedLinkedList that records operations
  // Use list.toArray() to get the final array for verification

  return [];
}`;

/**
 * Hard: Detect and Handle Cycle
 * Detect if the linked list has a cycle
 */
const hardSkeleton = `function detectCycle(list) {
  // TODO: Implement cycle detection
  // Hint: Use list.hasCycle() to detect cycles using Floyd's algorithm
  // The list parameter is a TrackedLinkedList that records operations
  // Floyd's algorithm uses two pointers (slow and fast)

  return false;
}`;

/**
 * Register all linked list templates
 */
export function registerLinkedListTemplates(): void {
  skeletonCodeSystem.registerTemplate("linkedList", "easy", easySkeleton);
  skeletonCodeSystem.registerTemplate("linkedList", "medium", mediumSkeleton);
  skeletonCodeSystem.registerTemplate("linkedList", "hard", hardSkeleton);
}

/**
 * Export individual templates for testing
 */
export { easySkeleton, mediumSkeleton, hardSkeleton };
