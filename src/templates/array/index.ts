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
  // TODO: Implement sorting algorithm
  // Hint: You can use arr.sort() with a compare function

  return arr;
}
`;

/**
 * Medium: Sort Array with bubble sort approach
 * Suggests using nested loops and element swapping for visualization
 */
const mediumSkeleton = `// Sort an array of numbers in ascending order
// Try implementing bubble sort to see swap operations visualized

function sortArray(arr) {
  const n = arr.length;

  // TODO: Implement bubble sort with nested loops
  // Outer loop: iterate n-1 times
  // Inner loop: compare adjacent elements

  // Use arr.at(index) to read values
  // Use arr.swap(i, j) to swap elements (this will be visualized!)

  return arr;
}
`;

/**
 * Hard: Sort Array with quick sort approach
 * Suggests using recursion and partitioning for visualization
 */
const hardSkeleton = `// Sort an array of numbers in ascending order
// Try implementing quick sort to see partition operations visualized

function sortArray(arr, low = 0, high = arr.length - 1) {
  // TODO: Implement recursive quick sort
  // Base case: if low >= high, return arr

  // TODO: 1. Call partition to get pivot index

  // TODO: 2. Recursively sort left and right subarrays

  return arr;
}

function partition(arr, low, high) {
  // TODO: Use arr.partition(low, high) for visualization
  // This method handles the partitioning and captures the operation

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
