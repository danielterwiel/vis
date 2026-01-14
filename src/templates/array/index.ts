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
const easySkeleton = `function sort(arr) {
  // TODO: Implement sorting algorithm
  // Hint: You can use arr.sort() with a compare function
  /* your code here */

}

// Example usage:
// const result = sort([5, 2, 8, 1, 9]);
// console.log(result); // [1, 2, 5, 8, 9]
`;

/**
 * Medium: Bubble Sort Implementation
 * Requires nested loops and element swapping
 */
const mediumSkeleton = `function bubbleSort(arr) {
  const n = arr.length;

  // TODO: Implement nested loops
  // Outer loop: iterate n-1 times
  /* your code here */

    // TODO: Inner loop: compare adjacent elements and swap if needed
    /* your code here */

      // TODO: Compare and swap adjacent elements
      // Hint: Use destructuring to swap: [arr[j], arr[j+1]] = [arr[j+1], arr[j]]
      /* your code here */

  return arr;
}

// Example usage:
// const result = bubbleSort([64, 34, 25, 12, 22, 11, 90]);
// console.log(result); // [11, 12, 22, 25, 34, 64, 90]
`;

/**
 * Hard: Quick Sort Implementation
 * Requires recursion and partitioning
 */
const hardSkeleton = `function quickSort(arr, low = 0, high = arr.length - 1) {
  // TODO: Implement recursive quick sort
  // Base case: if low >= high, return
  /* your code here */

  // TODO: 1. Call partition to get pivot index
  /* your code here */

  // TODO: 2. Recursively sort left and right subarrays
  /* your code here */

  return arr;
}

function partition(arr, low, high) {
  // TODO: Implement partition
  // 1. Choose pivot (last element)
  /* your code here */

  // TODO: 2. Move smaller elements to left of pivot
  /* your code here */

  // TODO: 3. Return final pivot position
  /* your code here */

}

// Example usage:
// const result = quickSort([10, 80, 30, 90, 40, 50, 70]);
// console.log(result); // [10, 30, 40, 50, 70, 80, 90]
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
