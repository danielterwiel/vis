import type { TestCase } from "../types";

/**
 * Array test cases with 3 difficulty levels (Easy, Medium, Hard)
 * Based on PRD.md lines 116-248
 */
export const arrayTests: TestCase[] = [
  {
    id: "array-sort-easy",
    name: "Sort Small Array",
    difficulty: "easy",
    description: "Sort an array of 5 numbers in ascending order",
    initialData: [5, 2, 8, 1, 9],
    expectedOutput: [1, 2, 5, 8, 9],
    assertions: `
      expect(result).toEqual([1, 2, 5, 8, 9]);
      expect(result.length).toBe(5);
    `,
    referenceSolution: `function sort(arr) {
  return arr.slice().sort((a, b) => a - b);
}`,
    skeletonCode: `function sort(arr) {
  // TODO: Implement sorting algorithm
  // Hint: You can use arr.sort() with a compare function

}`,
    hints: [
      "JavaScript arrays have a built-in sort() method",
      "sort() needs a compare function for numbers: (a, b) => a - b",
      "Consider using slice() first to avoid mutating the original array",
    ],
    acceptanceCriteria: [
      "Function returns array sorted in ascending order",
      "Original array is not mutated",
      "Result has same length as input",
    ],
  },
  {
    id: "array-sort-medium",
    name: "Bubble Sort Implementation",
    difficulty: "medium",
    description: "Implement bubble sort without using built-in sort()",
    initialData: [64, 34, 25, 12, 22, 11, 90],
    expectedOutput: [11, 12, 22, 25, 34, 64, 90],
    assertions: `
      expect(result).toEqual([11, 12, 22, 25, 34, 64, 90]);
      expect(steps.filter(s => s.type === 'swap').length).toBeGreaterThan(0);
    `,
    referenceSolution: `function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}`,
    skeletonCode: `function bubbleSort(arr) {
  const n = arr.length;
  // TODO: Implement nested loops
  // Outer loop: iterate n-1 times
  // Inner loop: compare adjacent elements and swap if needed

  return arr;
}`,
    hints: [
      "Bubble sort compares adjacent elements and swaps them if out of order",
      "You need two nested loops",
      "Use destructuring to swap: [arr[j], arr[j+1]] = [arr[j+1], arr[j]]",
    ],
    acceptanceCriteria: [
      "Function returns array sorted in ascending order",
      "Implementation uses nested loops (no built-in sort)",
      "At least one swap operation is captured",
    ],
  },
  {
    id: "array-sort-hard",
    name: "Quick Sort Implementation",
    difficulty: "hard",
    description: "Implement quick sort with partition visualization",
    initialData: [10, 80, 30, 90, 40, 50, 70],
    expectedOutput: [10, 30, 40, 50, 70, 80, 90],
    assertions: `
      expect(result).toEqual([10, 30, 40, 50, 70, 80, 90]);
      expect(steps.filter(s => s.type === 'partition').length).toBeGreaterThan(0);
    `,
    referenceSolution: `function quickSort(arr, low = 0, high = arr.length - 1) {
  if (low < high) {
    const pi = partition(arr, low, high);
    quickSort(arr, low, pi - 1);
    quickSort(arr, pi + 1, high);
  }
  return arr;
}

function partition(arr, low, high) {
  const pivot = arr[high];
  let i = low - 1;
  for (let j = low; j < high; j++) {
    if (arr[j] < pivot) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
  return i + 1;
}`,
    skeletonCode: `function quickSort(arr, low = 0, high = arr.length - 1) {
  // TODO: Implement recursive quick sort
  // Base case: if low >= high, return
  // 1. Call partition to get pivot index
  // 2. Recursively sort left and right subarrays

  return arr;
}

function partition(arr, low, high) {
  // TODO: Implement partition
  // 1. Choose pivot (last element)
  // 2. Move smaller elements to left of pivot
  // 3. Return final pivot position

}`,
    hints: [
      "Quick sort uses divide-and-conquer with a pivot element",
      "The partition function rearranges elements around the pivot",
      "Elements smaller than pivot go left, larger go right",
    ],
    acceptanceCriteria: [
      "Function returns array sorted in ascending order",
      "Implementation uses recursion and partitioning",
      "At least one partition operation is captured",
    ],
  },
];
