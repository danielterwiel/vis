/**
 * Hash Map skeleton code templates
 *
 * These templates match the test cases defined in hashMapTests.ts
 * All levels use the same function name 'countFrequency' with different approaches
 */

import { skeletonCodeSystem } from "../skeletonCodeSystem";

/**
 * Easy: Count Frequency (any method)
 * Uses plain object for counting
 */
const easySkeleton = `// Example usage: Count character frequencies and find the most frequent

function countFrequency(str) {
  // TODO: Count character frequencies and find the most frequent
  // You can use any method - plain object, Map, etc.
  //
  // Steps:
  // 1. Count occurrences of each character (skip spaces)
  // 2. Find the character with highest count
  // 3. Return { char, count }

  const counts = {};

  // TODO: Count each character

  // TODO: Find the most frequent character

  return { char: '', count: 0 };
}
`;

/**
 * Medium: Count Frequency (hash map required)
 * Uses TrackedHashMap for visualization
 */
const mediumSkeleton = `// Example usage: Count character frequencies using TrackedHashMap

function countFrequency(str) {
  // TODO: Use TrackedHashMap to count character frequencies
  // This allows visualization of hash map operations
  //
  // Steps:
  // 1. Create a TrackedHashMap with createTrackedHashMap()
  // 2. Count each character using map.get() and map.set()
  // 3. Find max using map.entries()

  const map = createTrackedHashMap();

  // TODO: Count each character (skip spaces)
  // Use map.get(char) || 0 to get current count
  // Use map.set(char, newCount) to update

  // TODO: Find the most frequent character
  // Use map.entries() to get all [char, count] pairs

  return { char: '', count: 0 };
}
`;

/**
 * Hard: Count Frequency (hash map + iteration required)
 * Uses TrackedHashMap with explicit iteration patterns
 */
const hardSkeleton = `// Example usage: Count character frequencies with explicit iteration

function countFrequency(str) {
  // TODO: Use TrackedHashMap with explicit iteration patterns
  // This demonstrates both hash map usage AND iteration patterns
  //
  // Requirements:
  // 1. Use createTrackedHashMap() for the hash map
  // 2. Use explicit for loops for iteration
  // 3. Process entries individually to find maximum

  const map = createTrackedHashMap();

  // TODO: Count characters with explicit for loop
  for (let i = 0; i < str.length; i++) {
    // Get character, skip spaces
    // Update count in map
  }

  // TODO: Find max with explicit iteration
  let maxChar = '';
  let maxCount = 0;

  const entries = map.entries();
  for (let i = 0; i < entries.length; i++) {
    // Access entry[0] for char, entry[1] for count
    // Update maxChar and maxCount if this count is higher
  }

  return { char: maxChar, count: maxCount };
}
`;

/**
 * Register all hash map templates
 */
export function registerHashMapTemplates(): void {
  skeletonCodeSystem.registerTemplate("hashmap", "easy", easySkeleton);
  skeletonCodeSystem.registerTemplate("hashmap", "medium", mediumSkeleton);
  skeletonCodeSystem.registerTemplate("hashmap", "hard", hardSkeleton);
}

/**
 * Export individual templates for testing
 */
export { easySkeleton, mediumSkeleton, hardSkeleton };
