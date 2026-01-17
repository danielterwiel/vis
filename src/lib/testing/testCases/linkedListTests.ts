import type { TestCase } from "../types";
import type { PatternRequirement } from "../../validation/types";

/**
 * LinkedList test cases with 3 difficulty levels (Easy, Medium, Hard)
 * Based on PRD.md lines 509-516
 *
 * All test cases use the same input dataset [10, 20, 30, 40, 50] for consistency.
 * This allows users to see how different linked list operations work on the same data.
 */

// Single dataset used across all LinkedList test cases
const LINKEDLIST_INPUT_DATA = [10, 20, 30, 40, 50];

export const linkedListTests: TestCase[] = [
  {
    id: "linkedlist-find-easy",
    name: "Find Element in List",
    difficulty: "easy",
    description: "Traverse the list and find a specific element",
    initialData: LINKEDLIST_INPUT_DATA,
    additionalArgs: [30], // target value to search for
    expectedOutput: 30,
    assertions: `
      expect(result).toBe(30);
    `,
    referenceSolution: `function findElement(list, target) {
  // Traverse the list manually to find the target
  let current = list.getHead();

  while (current !== null) {
    if (current.value === target) {
      return current.value;
    }
    current = current.next;
  }

  return null;
}`,
    skeletonCode: `function findElement(list, target) {
  // TODO: Traverse the list and find the target value
  // Use list.getHead() to get the first node
  // Each node has: node.value (the data) and node.next (pointer to next node)

  let current = list.getHead();

  // TODO: Loop through the list
  // Check if current node's value equals target
  // If found, return the value
  // Otherwise, move to the next node

  return null;
}`,
    hints: [
      "Use list.getHead() to get the first node",
      "Each node has .value and .next properties",
      "Loop while current !== null, checking each value",
    ],
    acceptanceCriteria: [
      "Function returns the correct value when element exists",
      "Function returns null when element doesn't exist",
    ],
  },
  {
    id: "linkedlist-reverse-medium",
    name: "Reverse Linked List",
    difficulty: "medium",
    description: "Reverse a linked list in place",
    initialData: LINKEDLIST_INPUT_DATA,
    expectedOutput: [50, 40, 30, 20, 10],
    assertions: `
      expect(result).toEqual([50, 40, 30, 20, 10]);
    `,
    referenceSolution: `function reverseList(list) {
  // Reverse by manipulating node pointers
  let prev = null;
  let current = list.getHead();

  while (current !== null) {
    const next = current.next;  // Save next
    current.next = prev;        // Reverse pointer
    prev = current;             // Move prev forward
    current = next;             // Move current forward
  }

  return list.toArray();
}`,
    skeletonCode: `function reverseList(list) {
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
}`,
    hints: [
      "Use three pointers: prev (starts null), current (starts at head), next (temp)",
      "In each iteration: save next, reverse current's pointer, advance prev and current",
      "After the loop, prev points to the new head",
    ],
    acceptanceCriteria: [
      "Function returns reversed array",
      "List is reversed using pointer manipulation",
    ],
    patternRequirement: {
      anyOf: ["pointerManipulation", "recursion"],
      errorMessage:
        "Medium difficulty requires implementing pointer manipulation (e.g., reassigning .next pointers) or using recursion to reverse the list.",
    } satisfies PatternRequirement,
  },
  {
    id: "linkedlist-cycle-hard",
    name: "Detect and Handle Cycle",
    difficulty: "hard",
    description: "Detect if the linked list has a cycle",
    initialData: LINKEDLIST_INPUT_DATA,
    expectedOutput: false,
    assertions: `
      expect(result).toBe(false);
    `,
    referenceSolution: `function detectCycle(list) {
  // Floyd's cycle detection algorithm (tortoise and hare)
  let slow = list.getHead();
  let fast = list.getHead();

  while (fast !== null && fast.next !== null) {
    slow = slow.next;           // Move slow 1 step
    fast = fast.next.next;      // Move fast 2 steps

    if (slow === fast) {
      return true;              // Cycle detected
    }
  }

  return false;                 // No cycle
}`,
    skeletonCode: `function detectCycle(list) {
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
}`,
    hints: [
      "Use two pointers: slow moves 1 step, fast moves 2 steps per iteration",
      "Check that fast and fast.next exist before moving fast",
      "If there's a cycle, fast will eventually catch up to slow",
    ],
    acceptanceCriteria: [
      "Function returns true when a cycle exists",
      "Function returns false when no cycle exists",
    ],
    patternRequirement: {
      anyOf: ["twoPointers", "recursion"],
      errorMessage:
        "Hard difficulty requires implementing Floyd's cycle detection with two pointers (slow/fast) or using recursion to detect cycles.",
    } satisfies PatternRequirement,
  },
];
