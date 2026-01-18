/**
 * Array skeleton code templates
 *
 * These templates match the test cases defined in arrayTests.ts.
 * All templates use a single function name 'sortArray' that users implement.
 * The difficulty levels suggest different approaches but users can implement
 * the function however they want.
 */

import { skeletonCodeSystem } from "../skeletonCodeSystem";

/**
 * Easy: Sort Array using any method
 * Suggests using built-in Array.sort() method
 */
const easySkeleton = `// Sort an array of numbers in ascending order
// You can use any sorting method, including built-in sort()

function sortArray(arr) {
  // TODO: Implement sorting algorithm. Return arr sorted

  return arr;
}
`;

/**
 * Medium: Sort Array with bubble sort approach
 * Suggests using nested loops and element swapping for visualization
 */
const mediumSkeleton = `// Sort an array of numbers in ascending order
// Implement bubble sort to see swap operations visualized

function sortArray(arr) {
  const n = arr.length;

  // TODO: Implement bubble sort with nested loops
  // Outer loop: iterate n-1 times
  // Inner loop: compare adjacent elements and swap if out of order

  // Use standard JavaScript array syntax: arr[i], arr[i] = value, arr.length

  return arr;
}
`;

/**
 * Hard: Sort Array with quick sort approach
 * Suggests using recursion and partitioning for visualization
 */
const hardSkeleton = `// Sort an array of numbers in ascending order
// Implement quick sort with recursion and partitioning

function sortArray(arr, low = 0, high = arr.length - 1) {
  // TODO: Implement recursive quick sort
  // Base case: if low >= high, return arr

  // TODO: 1. Call partition to get pivot index

  // TODO: 2. Recursively sort left and right subarrays

  return arr;
}

function partition(arr, low, high) {
  // TODO: Implement Lomuto partition scheme
  // 1. Choose pivot (e.g., element at high index)
  // 2. Partition array so elements < pivot are on left
  // 3. Return final pivot position

  // Use standard JavaScript: arr[i], arr[i] = value

}
`;

/**
 * Register all array templates
 */
export function registerArrayTemplates(): void {
  skeletonCodeSystem.registerTemplate("array", "easy", easySkeleton);
  skeletonCodeSystem.registerTemplate("array", "medium", mediumSkeleton);
  skeletonCodeSystem.registerTemplate("array", "hard", hardSkeleton);
}

/**
 * Export individual templates for testing
 */
export { easySkeleton, mediumSkeleton, hardSkeleton };
