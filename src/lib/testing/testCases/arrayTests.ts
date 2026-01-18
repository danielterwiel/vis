import type { TestCase } from "../types";
import type { PatternRequirement } from "../../validation/types";

/**
 * Array test cases with 3 difficulty levels (Easy, Medium, Hard)
 * All test cases use a single function name 'sortArray' that can be implemented
 * using any sorting algorithm. The difficulty levels suggest different approaches
 * but users are free to implement the function however they want.
 *
 * All test cases use the same input dataset [64, 34, 25, 12, 22, 11, 90]
 * which sorts to [11, 12, 22, 25, 34, 64, 90]. This provides consistency
 * and allows users to see how different algorithms perform on the same data.
 */

// Single dataset used across all Array test cases
const ARRAY_INPUT_DATA = [64, 34, 25, 12, 22, 11, 90];
const ARRAY_EXPECTED_OUTPUT = [11, 12, 22, 25, 34, 64, 90];

export const arrayTests: TestCase[] = [
  {
    id: "array-sort-easy",
    name: "Sort Array (Easy)",
    difficulty: "easy",
    description:
      "Sort an array of numbers in ascending order. You can use any sorting method, including built-in sort().",
    initialData: ARRAY_INPUT_DATA,
    expectedOutput: ARRAY_EXPECTED_OUTPUT,
    assertions: `
      expect(result).toEqual([11, 12, 22, 25, 34, 64, 90]);
      expect(result.length).toBe(7);
    `,
    referenceSolution: `function sortArray(arr) {
  // Easy approach: use built-in sort method
  arr.sort((a, b) => a - b);
  return arr;
}`,
    skeletonCode: `function sortArray(arr) {
  // TODO: Implement sorting algorithm. Return arr sorted
  // The arr parameter is a TrackedArray that records operations

  return arr;
}`,
    hints: [
      "JavaScript arrays have a built-in sort() method",
      "sort() needs a compare function for numbers: (a, b) => a - b",
      "The TrackedArray works just like a regular array",
    ],
    acceptanceCriteria: [
      "Function returns array sorted in ascending order",
      "Result has same length as input",
    ],
  },
  {
    id: "array-sort-medium",
    name: "Sort Array (Medium)",
    difficulty: "medium",
    description:
      "Sort an array of numbers in ascending order. Try implementing bubble sort to see swap operations visualized.",
    initialData: ARRAY_INPUT_DATA,
    expectedOutput: ARRAY_EXPECTED_OUTPUT,
    assertions: `
      expect(result).toEqual([11, 12, 22, 25, 34, 64, 90]);
    `,
    referenceSolution: `function sortArray(arr) {
  // Bubble sort implementation using pure JavaScript
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        // Swap using temp variable
        const temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
      }
    }
  }
  return arr;
}`,
    skeletonCode: `function sortArray(arr) {
  // TODO: Implement bubble sort
  // Bubble sort compares adjacent elements and swaps if out of order
  const n = arr.length;

  // TODO: Implement nested loops
  // Outer loop: iterate n-1 times
  // Inner loop: compare adjacent elements and swap if needed

  return arr;
}`,
    hints: [
      "Bubble sort compares adjacent elements and swaps them if out of order",
      "You need two nested loops: outer loop runs n-1 times, inner loop compares pairs",
      "Swap using: temp = arr[j]; arr[j] = arr[j+1]; arr[j+1] = temp;",
    ],
    acceptanceCriteria: [
      "Function returns array sorted in ascending order",
      "Consider using bubble sort to see swap visualizations",
    ],
    patternRequirement: {
      anyOf: ["nestedLoops", "swapCalls"],
      errorMessage:
        "Medium difficulty requires implementing a comparison-based sort with nested loops or swap operations (e.g., bubble sort, selection sort).",
    } satisfies PatternRequirement,
  },
  {
    id: "array-sort-hard",
    name: "Sort Array (Hard)",
    difficulty: "hard",
    description:
      "Sort an array of numbers in ascending order. Try implementing quick sort to see partition operations visualized.",
    initialData: ARRAY_INPUT_DATA,
    expectedOutput: ARRAY_EXPECTED_OUTPUT,
    assertions: `
      expect(result).toEqual([11, 12, 22, 25, 34, 64, 90]);
    `,
    referenceSolution: `function sortArray(arr, low = 0, high = arr.length - 1) {
  // Quick sort implementation using pure JavaScript
  if (low < high) {
    const pi = partition(arr, low, high);
    sortArray(arr, low, pi - 1);
    sortArray(arr, pi + 1, high);
  }
  return arr;
}

function partition(arr, low, high) {
  // Lomuto partition scheme
  const pivot = arr[high];
  let i = low - 1;

  for (let j = low; j < high; j++) {
    if (arr[j] <= pivot) {
      i++;
      // Swap arr[i] and arr[j]
      const temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
    }
  }
  // Place pivot in correct position
  const temp = arr[i + 1];
  arr[i + 1] = arr[high];
  arr[high] = temp;
  return i + 1;
}`,
    skeletonCode: `function sortArray(arr, low = 0, high = arr.length - 1) {
  // TODO: Implement quick sort
  // Quick sort uses divide-and-conquer with a pivot element
  // Base case: if low >= high, return arr

  // TODO: 1. Call partition to get pivot index

  // TODO: 2. Recursively sort left and right subarrays

  return arr;
}

function partition(arr, low, high) {
  // TODO: Implement Lomuto partition scheme
  // 1. Choose arr[high] as pivot
  // 2. Move elements smaller than pivot to the left
  // 3. Place pivot in its correct position

}`,
    hints: [
      "Quick sort uses divide-and-conquer with a pivot element",
      "The partition function rearranges elements around the pivot",
      "Use Lomuto scheme: pick last element as pivot, maintain index i for smaller elements",
    ],
    acceptanceCriteria: [
      "Function returns array sorted in ascending order",
      "Consider using quick sort to see partition visualizations",
    ],
    patternRequirement: {
      anyOf: ["recursion", "partitionCalls"],
      errorMessage:
        "Hard difficulty requires implementing a divide-and-conquer sort with recursion or partition operations (e.g., quick sort, merge sort).",
    } satisfies PatternRequirement,
  },
];
