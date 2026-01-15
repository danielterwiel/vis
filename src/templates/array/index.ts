/**
 * Array skeleton code templates
 *
 * These templates match the test cases defined in arrayTests.ts
 */

import { skeletonCodeSystem } from "../skeletonCodeSystem";

/**
 * Easy: Sort Small Array
 * Uses built-in Array.sort() method
 */
const easySkeleton = `// Example usage: Sort an array of numbers

function sort(arr) {
  // TODO: Implement sorting algorithm
  // Hint: You can use arr.sort() with a compare function

}
`;

/**
 * Medium: Bubble Sort Implementation
 * Requires nested loops and element swapping
 */
const mediumSkeleton = `// Example usage: Implement bubble sort algorithm

function bubbleSort(arr) {
  const n = arr.length;

  // TODO: Implement nested loops
  // Outer loop: iterate n-1 times

    // TODO: Inner loop: compare adjacent elements and swap if needed

      // TODO: Compare and swap adjacent elements
      // Hint: Use destructuring to swap: [arr[j], arr[j+1]] = [arr[j+1], arr[j]]

  return arr;
}
`;

/**
 * Hard: Quick Sort Implementation
 * Requires recursion and partitioning
 */
const hardSkeleton = `// Example usage: Implement quick sort with partition

function quickSort(arr, low = 0, high = arr.length - 1) {
  // TODO: Implement recursive quick sort
  // Base case: if low >= high, return

  // TODO: 1. Call partition to get pivot index

  // TODO: 2. Recursively sort left and right subarrays

  return arr;
}

function partition(arr, low, high) {
  // TODO: Implement partition
  // 1. Choose pivot (last element)

  // TODO: 2. Move smaller elements to left of pivot

  // TODO: 3. Return final pivot position

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
