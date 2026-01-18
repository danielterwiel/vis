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
  // TODO: Traverse the list and find the target value
  // Use list.getHead() to get the first node
  // Each node has: node.value (the data) and node.next (pointer to next node)

  let current = list.getHead();

  // TODO: Loop through the list
  // Check if current node's value equals target
  // If found, return the value
  // Otherwise, move to the next node

  return null;
}`;

/**
 * Medium: Reverse Linked List
 * Reverse a linked list in place
 */
const mediumSkeleton = `function reverseList(list) {
  // TODO: Reverse the linked list by manipulating node pointers
  // Use three pointers: prev, current, next
  //
  // Algorithm:
  // 1. Initialize prev = null, current = list.getHead()
  // 2. While current is not null:
  //    - Save next = current.next
  //    - Reverse pointer: current.next = prev
  //    - Move prev and current forward
  // 3. Return the reversed list as array using list.toArray()

  let prev = null;
  let current = list.getHead();

  // TODO: Implement the reversal loop

  return list.toArray();
}`;

/**
 * Hard: Detect and Handle Cycle
 * Detect if the linked list has a cycle
 */
const hardSkeleton = `function detectCycle(list) {
  // TODO: Implement Floyd's cycle detection algorithm
  // Use two pointers: slow (moves 1 step) and fast (moves 2 steps)
  //
  // Algorithm:
  // 1. Initialize both pointers to list.getHead()
  // 2. While fast and fast.next exist:
  //    - Move slow one step: slow = slow.next
  //    - Move fast two steps: fast = fast.next.next
  //    - If slow === fast, cycle detected!
  // 3. If loop exits normally, no cycle

  let slow = list.getHead();
  let fast = list.getHead();

  // TODO: Implement the detection loop

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
