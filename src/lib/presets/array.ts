/**
 * Preset algorithm examples for Arrays
 */

import type { PresetExample } from "./types";

export const arrayPresets: PresetExample[] = [
  {
    id: "array-bubble-sort",
    name: "Bubble Sort",
    description:
      "Classic comparison-based sorting algorithm that repeatedly swaps adjacent elements",
    category: "sorting",
    dataStructure: "array",
    timeComplexity: "O(n²)",
    spaceComplexity: "O(1)",
    tags: ["sorting", "comparison", "in-place"],
    code: `function bubbleSort(arr) {
  // Bubble sort: Compare adjacent elements and swap if out of order
  // After each pass, the largest unsorted element "bubbles" to the end
  const n = arr.length;

  // Outer loop: number of passes (n-1 passes needed)
  for (let i = 0; i < n - 1; i++) {
    // Inner loop: compare adjacent pairs
    // Optimization: last i elements are already sorted
    for (let j = 0; j < n - i - 1; j++) {
      // Compare adjacent elements using TrackedArray's at() method
      if (arr.at(j) > arr.at(j + 1)) {
        // Swap if they're in wrong order (visualized in animation!)
        arr.swap(j, j + 1);
      }
    }
  }

  return arr;
}

// Test it:
const data = [64, 34, 25, 12, 22, 11, 90];
bubbleSort(data);`,
  },
  {
    id: "array-quick-sort",
    name: "Quick Sort",
    description: "Efficient divide-and-conquer sorting using a pivot element",
    category: "sorting",
    dataStructure: "array",
    timeComplexity: "O(n log n) average",
    spaceComplexity: "O(log n)",
    tags: ["sorting", "divide-and-conquer", "recursive"],
    code: `function quickSort(arr, low = 0, high = arr.length - 1) {
  // Quick sort: Divide-and-conquer algorithm using a pivot
  // Elements < pivot go left, elements > pivot go right

  if (low < high) {
    // Partition the array and get pivot's final position
    const pivotIndex = partition(arr, low, high);

    // Recursively sort left and right subarrays
    quickSort(arr, low, pivotIndex - 1);
    quickSort(arr, pivotIndex + 1, high);
  }

  return arr;
}

function partition(arr, low, high) {
  // Choose last element as pivot
  const pivot = arr.at(high);

  // Index of smaller element (elements < pivot go before this)
  let i = low - 1;

  // Compare each element with pivot
  for (let j = low; j < high; j++) {
    if (arr.at(j) < pivot) {
      i++;
      arr.swap(i, j);  // Move smaller element to left side
    }
  }

  // Place pivot in its final position
  arr.swap(i + 1, high);
  return i + 1;
}

// Test it:
const data = [10, 80, 30, 90, 40, 50, 70];
quickSort(data);`,
  },
  {
    id: "array-merge-sort",
    name: "Merge Sort",
    description: "Stable divide-and-conquer sorting by merging sorted subarrays",
    category: "sorting",
    dataStructure: "array",
    timeComplexity: "O(n log n)",
    spaceComplexity: "O(n)",
    tags: ["sorting", "divide-and-conquer", "stable", "recursive"],
    code: `function mergeSort(arr, left = 0, right = arr.length - 1) {
  // Merge sort: Divide array in half, sort each half, then merge
  // Guaranteed O(n log n) time, but requires O(n) extra space

  if (left < right) {
    // Find the middle point
    const mid = Math.floor((left + right) / 2);

    // Sort first and second halves
    mergeSort(arr, left, mid);
    mergeSort(arr, mid + 1, right);

    // Merge the sorted halves
    merge(arr, left, mid, right);
  }

  return arr;
}

function merge(arr, left, mid, right) {
  // Merge two sorted subarrays: [left...mid] and [mid+1...right]

  // Create temp arrays
  const leftArr = [];
  const rightArr = [];

  // Copy data to temp arrays
  for (let i = left; i <= mid; i++) {
    leftArr.push(arr.at(i));
  }
  for (let i = mid + 1; i <= right; i++) {
    rightArr.push(arr.at(i));
  }

  // Merge temp arrays back into arr[left...right]
  let i = 0, j = 0, k = left;

  while (i < leftArr.length && j < rightArr.length) {
    if (leftArr[i] <= rightArr[j]) {
      arr.set(k, leftArr[i]);
      i++;
    } else {
      arr.set(k, rightArr[j]);
      j++;
    }
    k++;
  }

  // Copy remaining elements
  while (i < leftArr.length) {
    arr.set(k, leftArr[i]);
    i++;
    k++;
  }

  while (j < rightArr.length) {
    arr.set(k, rightArr[j]);
    j++;
    k++;
  }
}

// Test it:
const data = [12, 11, 13, 5, 6, 7];
mergeSort(data);`,
  },
  {
    id: "array-binary-search",
    name: "Binary Search",
    description:
      "Efficiently find an element in a sorted array by repeatedly dividing search space",
    category: "searching",
    dataStructure: "array",
    timeComplexity: "O(log n)",
    spaceComplexity: "O(1)",
    tags: ["searching", "divide-and-conquer"],
    code: `function binarySearch(arr, target) {
  // Binary search: Only works on SORTED arrays
  // Repeatedly divide search space in half

  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    // Find middle element
    const mid = Math.floor((left + right) / 2);
    const midValue = arr.at(mid);

    if (midValue === target) {
      // Found it!
      return mid;
    } else if (midValue < target) {
      // Target is in right half
      left = mid + 1;
    } else {
      // Target is in left half
      right = mid - 1;
    }
  }

  // Target not found
  return -1;
}

// Test it:
const sortedData = [1, 3, 5, 7, 9, 11, 13, 15];
const index = binarySearch(sortedData, 7);
console.log(\`Found at index: \${index}\`);`,
  },
  {
    id: "array-two-pointers",
    name: "Two Pointers (Find Pair Sum)",
    description: "Use two pointers from opposite ends to find a pair that sums to target",
    category: "searching",
    dataStructure: "array",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    tags: ["two-pointers", "searching"],
    code: `function findPairWithSum(arr, targetSum) {
  // Two-pointer technique: Start from both ends of SORTED array
  // Move pointers based on current sum vs target

  let left = 0;
  let right = arr.length - 1;

  while (left < right) {
    const sum = arr.at(left) + arr.at(right);

    if (sum === targetSum) {
      // Found a pair!
      return [left, right];
    } else if (sum < targetSum) {
      // Need a larger sum, move left pointer right
      left++;
    } else {
      // Sum too large, move right pointer left
      right--;
    }
  }

  // No pair found
  return null;
}

// Test it:
const sortedData = [1, 2, 3, 4, 6, 8, 9];
const result = findPairWithSum(sortedData, 10);
if (result) {
  console.log(\`Pair found at indices: \${result}\`);
}`,
  },
  {
    id: "array-reverse",
    name: "Reverse Array In-Place",
    description: "Reverse an array using two pointers without extra space",
    category: "manipulation",
    dataStructure: "array",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    tags: ["two-pointers", "in-place"],
    code: `function reverseArray(arr) {
  // Reverse in-place using two pointers
  // Swap elements from both ends moving inward

  let left = 0;
  let right = arr.length - 1;

  while (left < right) {
    // Swap elements at left and right positions
    arr.swap(left, right);

    // Move pointers toward center
    left++;
    right--;
  }

  return arr;
}

// Test it:
const data = [1, 2, 3, 4, 5];
reverseArray(data);`,
  },
];
