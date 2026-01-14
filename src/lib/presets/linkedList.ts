/**
 * Preset algorithm examples for Linked Lists
 */

import type { PresetExample } from "./types";

export const linkedListPresets: PresetExample[] = [
  {
    id: "linkedlist-reverse",
    name: "Reverse Linked List",
    description: "Reverse a singly linked list by adjusting pointers",
    category: "manipulation",
    dataStructure: "linkedList",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    tags: ["pointers", "in-place"],
    code: `function reverseLinkedList(list) {
  // Reverse by changing next pointers
  // Keep track of previous, current, and next nodes

  let prev = null;
  let current = list.head;

  while (current !== null) {
    // Save next node before we change the pointer
    const nextNode = current.next;

    // Reverse the pointer
    current.next = prev;

    // Move prev and current one step forward
    prev = current;
    current = nextNode;
  }

  // prev is now the new head
  list.head = prev;
  return list;
}

// Test it:
const list = createLinkedList([1, 2, 3, 4, 5]);
reverseLinkedList(list);`,
  },
  {
    id: "linkedlist-detect-cycle",
    name: "Detect Cycle (Floyd's Algorithm)",
    description: "Detect if a linked list has a cycle using fast and slow pointers",
    category: "traversal",
    dataStructure: "linkedList",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    tags: ["two-pointers", "cycle-detection"],
    code: `function hasCycle(list) {
  // Floyd's Cycle Detection (Tortoise and Hare)
  // Use two pointers moving at different speeds

  if (!list.head) return false;

  let slow = list.head;
  let fast = list.head;

  while (fast !== null && fast.next !== null) {
    // Slow moves one step
    slow = slow.next;

    // Fast moves two steps
    fast = fast.next.next;

    // If they meet, there's a cycle
    if (slow === fast) {
      return true;
    }
  }

  // Fast reached the end, no cycle
  return false;
}

// Test it:
const list = createLinkedList([1, 2, 3, 4, 5]);
const cycleExists = hasCycle(list);
console.log(\`Cycle detected: \${cycleExists}\`);`,
  },
  {
    id: "linkedlist-find-middle",
    name: "Find Middle Node",
    description: "Find the middle node using fast and slow pointers",
    category: "traversal",
    dataStructure: "linkedList",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    tags: ["two-pointers"],
    code: `function findMiddle(list) {
  // Use two pointers: slow (1 step) and fast (2 steps)
  // When fast reaches end, slow is at middle

  if (!list.head) return null;

  let slow = list.head;
  let fast = list.head;

  // Move fast twice as fast as slow
  while (fast !== null && fast.next !== null) {
    slow = slow.next;
    fast = fast.next.next;
  }

  // Slow is now at the middle
  return slow;
}

// Test it:
const list = createLinkedList([1, 2, 3, 4, 5]);
const middle = findMiddle(list);
console.log(\`Middle value: \${middle?.value}\`);`,
  },
  {
    id: "linkedlist-remove-nth-from-end",
    name: "Remove Nth Node From End",
    description: "Remove the nth node from the end using two-pointer technique",
    category: "manipulation",
    dataStructure: "linkedList",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    tags: ["two-pointers", "deletion"],
    code: `function removeNthFromEnd(list, n) {
  // Use two pointers with n-node gap between them
  // When fast reaches end, slow is at (n-1)th from end

  // Create dummy node to handle edge cases
  const dummy = { next: list.head };
  let fast = dummy;
  let slow = dummy;

  // Move fast n+1 steps ahead
  for (let i = 0; i <= n; i++) {
    if (!fast) return list;  // n is larger than list length
    fast = fast.next;
  }

  // Move both until fast reaches end
  while (fast !== null) {
    fast = fast.next;
    slow = slow.next;
  }

  // Remove the node (slow.next is the target)
  slow.next = slow.next?.next || null;

  list.head = dummy.next;
  return list;
}

// Test it:
const list = createLinkedList([1, 2, 3, 4, 5]);
removeNthFromEnd(list, 2);  // Remove 4`,
  },
  {
    id: "linkedlist-merge-sorted",
    name: "Merge Two Sorted Lists",
    description: "Merge two sorted linked lists into one sorted list",
    category: "manipulation",
    dataStructure: "linkedList",
    timeComplexity: "O(n + m)",
    spaceComplexity: "O(1)",
    tags: ["merging", "sorting"],
    code: `function mergeSortedLists(list1, list2) {
  // Create dummy head to simplify edge cases
  const dummy = { next: null };
  let current = dummy;

  let p1 = list1.head;
  let p2 = list2.head;

  // Compare and merge while both lists have nodes
  while (p1 !== null && p2 !== null) {
    if (p1.value <= p2.value) {
      current.next = p1;
      p1 = p1.next;
    } else {
      current.next = p2;
      p2 = p2.next;
    }
    current = current.next;
  }

  // Attach remaining nodes from either list
  current.next = p1 !== null ? p1 : p2;

  // Create result list with merged nodes
  const result = { head: dummy.next };
  return result;
}

// Test it:
const list1 = createLinkedList([1, 3, 5]);
const list2 = createLinkedList([2, 4, 6]);
const merged = mergeSortedLists(list1, list2);`,
  },
];
