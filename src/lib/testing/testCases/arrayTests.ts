import type { TestCase } from "../types";

/**
 * Array test cases with 3 difficulty levels (Easy, Medium, Hard)
 * All test cases use a single function name 'sortArray' that can be implemented
 * using any sorting algorithm. The difficulty levels suggest different approaches
 * but users are free to implement the function however they want.
 */
export const arrayTests: TestCase[] = [
  {
    id: "array-sort-easy",
    name: "Sort Array (Easy)",
    difficulty: "easy",
    description:
      "Sort an array of numbers in ascending order. You can use any sorting method, including built-in sort().",
    initialData: [5, 2, 8, 1, 9],
    expectedOutput: [1, 2, 5, 8, 9],
    assertions: `
      expect(result).toEqual([1, 2, 5, 8, 9]);
      expect(result.length).toBe(5);
    `,
    referenceSolution: `function sortArray(arr) {
  // Easy approach: use built-in sort method
  arr.sort((a, b) => a - b);
  return arr;
}`,
    skeletonCode: `function sortArray(arr) {
  // TODO: Implement sorting algorithm
  // Hint: You can use arr.sort() with a compare function
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
    initialData: [64, 34, 25, 12, 22, 11, 90],
    expectedOutput: [11, 12, 22, 25, 34, 64, 90],
    assertions: `
      expect(result).toEqual([11, 12, 22, 25, 34, 64, 90]);
    `,
    referenceSolution: `function sortArray(arr) {
  // Medium approach: bubble sort implementation
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      // Use TrackedArray's at() for reading and swap() for swapping
      if (arr.at(j) > arr.at(j + 1)) {
        arr.swap(j, j + 1);
      }
    }
  }
  return arr;
}`,
    skeletonCode: `function sortArray(arr) {
  // TODO: Implement bubble sort
  // Bubble sort compares adjacent elements and swaps if out of order
  // Use arr.at(index) to read values
  // Use arr.swap(i, j) to swap elements (this will be visualized!)
  const n = arr.length;

  // TODO: Implement nested loops
  // Outer loop: iterate n-1 times
  // Inner loop: compare adjacent elements and swap if needed

  return arr;
}`,
    hints: [
      "Bubble sort compares adjacent elements and swaps them if out of order",
      "You need two nested loops: outer loop runs n-1 times, inner loop compares pairs",
      "Use arr.swap(j, j+1) to swap adjacent elements when they're out of order",
    ],
    acceptanceCriteria: [
      "Function returns array sorted in ascending order",
      "Consider using bubble sort to see swap visualizations",
    ],
  },
  {
    id: "array-sort-hard",
    name: "Sort Array (Hard)",
    difficulty: "hard",
    description:
      "Sort an array of numbers in ascending order. Try implementing quick sort to see partition operations visualized.",
    initialData: [10, 80, 30, 90, 40, 50, 70],
    expectedOutput: [10, 30, 40, 50, 70, 80, 90],
    assertions: `
      expect(result).toEqual([10, 30, 40, 50, 70, 80, 90]);
    `,
    referenceSolution: `function sortArray(arr, low = 0, high = arr.length - 1) {
  // Hard approach: quick sort implementation
  if (low < high) {
    const pi = partition(arr, low, high);
    sortArray(arr, low, pi - 1);
    sortArray(arr, pi + 1, high);
  }
  return arr;
}

function partition(arr, low, high) {
  // Use TrackedArray's partition method for visualization
  return arr.partition(low, high);
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
  // TODO: Use arr.partition(low, high) for visualization
  // This method handles the partitioning and captures the operation

}`,
    hints: [
      "Quick sort uses divide-and-conquer with a pivot element",
      "The partition function rearranges elements around the pivot",
      "Use arr.partition(low, high) to partition and capture the operation for visualization",
    ],
    acceptanceCriteria: [
      "Function returns array sorted in ascending order",
      "Consider using quick sort to see partition visualizations",
    ],
  },
];
