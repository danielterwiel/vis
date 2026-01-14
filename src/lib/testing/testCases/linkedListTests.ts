import type { TestCase } from "../types";

/**
 * LinkedList test cases with 3 difficulty levels (Easy, Medium, Hard)
 * Based on PRD.md lines 509-516
 */
export const linkedListTests: TestCase[] = [
  {
    id: "linkedlist-find-easy",
    name: "Find Element in List",
    difficulty: "easy",
    description: "Traverse the list and find a specific element",
    initialData: [10, 20, 30, 40, 50],
    expectedOutput: 30,
    assertions: `
      expect(result).toBe(30);
      expect(steps.filter(s => s.type === 'find').length).toBeGreaterThan(0);
    `,
    referenceSolution: `function findElement(list, target) {
  // Use TrackedLinkedList's find method to search for the value
  const node = list.find(target);
  return node ? node.value : null;
}`,
    skeletonCode: `function findElement(list, target) {
  // TODO: Implement find operation
  // Hint: Use list.find(target) to search for the value
  // The list parameter is a TrackedLinkedList that records operations

  return null;
}`,
    hints: [
      "TrackedLinkedList has a built-in find() method",
      "The find() method returns a node or null if not found",
      "Access the node's value property to get the actual value",
    ],
    acceptanceCriteria: [
      "Function returns the correct value when element exists",
      "Function returns null when element doesn't exist",
      "At least one find operation is captured for visualization",
    ],
  },
  {
    id: "linkedlist-reverse-medium",
    name: "Reverse Linked List",
    difficulty: "medium",
    description: "Reverse a linked list in place",
    initialData: [1, 2, 3, 4, 5],
    expectedOutput: [5, 4, 3, 2, 1],
    assertions: `
      expect(result).toEqual([5, 4, 3, 2, 1]);
      expect(steps.filter(s => s.type === 'reverse').length).toBeGreaterThan(0);
    `,
    referenceSolution: `function reverseList(list) {
  // Use TrackedLinkedList's reverse method for in-place reversal
  list.reverse();
  return list.toArray();
}`,
    skeletonCode: `function reverseList(list) {
  // TODO: Implement list reversal
  // Hint: Use list.reverse() to reverse the list in place
  // The list parameter is a TrackedLinkedList that records operations
  // Use list.toArray() to get the final array for verification

  return [];
}`,
    hints: [
      "TrackedLinkedList has a built-in reverse() method that reverses in place",
      "The reverse() method captures each pointer swap for visualization",
      "After reversing, use toArray() to convert the list to an array for comparison",
    ],
    acceptanceCriteria: [
      "Function returns reversed array",
      "List is reversed in place (head becomes tail)",
      "At least one reverse operation is captured for visualization",
    ],
  },
  {
    id: "linkedlist-cycle-hard",
    name: "Detect and Handle Cycle",
    difficulty: "hard",
    description: "Detect if the linked list has a cycle",
    initialData: [1, 2, 3, 4, 5],
    expectedOutput: false,
    assertions: `
      expect(result).toBe(false);
      expect(steps.filter(s => s.type === 'hasCycle').length).toBeGreaterThan(0);
    `,
    referenceSolution: `function detectCycle(list) {
  // Use TrackedLinkedList's hasCycle method (Floyd's algorithm)
  return list.hasCycle();
}`,
    skeletonCode: `function detectCycle(list) {
  // TODO: Implement cycle detection
  // Hint: Use list.hasCycle() to detect cycles using Floyd's algorithm
  // The list parameter is a TrackedLinkedList that records operations
  // Floyd's algorithm uses two pointers (slow and fast)

  return false;
}`,
    hints: [
      "TrackedLinkedList has a built-in hasCycle() method",
      "Floyd's cycle detection uses two pointers: slow moves 1 step, fast moves 2 steps",
      "If there's a cycle, the fast pointer will eventually catch up to the slow pointer",
    ],
    acceptanceCriteria: [
      "Function returns true when a cycle exists",
      "Function returns false when no cycle exists",
      "At least one hasCycle operation is captured for visualization",
    ],
  },
];
