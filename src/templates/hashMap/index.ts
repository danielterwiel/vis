/**
 * Hash Map skeleton code templates
 *
 * These templates match the test cases defined in hashMapTests.ts
 */

import { skeletonCodeSystem } from "../skeletonCodeSystem";

/**
 * Easy: Basic Get/Set Operations
 * Simple key-value storage and retrieval
 */
const easySkeleton = `// Example usage: Implement basic get and set operations for a hash map

function basicHashMap(entries) {
  // TODO: Create a new TrackedHashMap
  const map = createTrackedHashMap();

  // TODO: Set key-value pairs
  // Use map.set(key, value) to add entries
  // Example: map.set("apple", 3);


  // TODO: Get values back
  // Use map.get(key) to retrieve values
  // Return array of values in order: ["apple", "banana", "cherry"]

}
`;

/**
 * Medium: Collision Handling with Chaining
 * Demonstrates separate chaining for hash collisions
 */
const mediumSkeleton = `// Example usage: Handle hash collisions by adding multiple entries

function handleCollisions(entries) {
  // TODO: Create a small-capacity hash map to force collisions
  // Use createTrackedHashMap(capacity, loadFactorThreshold)
  // Hint: Use capacity=4 and threshold=0.99 to prevent resize


  // TODO: Add multiple key-value pairs
  // map.set("a", 1), map.set("b", 2), etc.
  // Add at least 5 entries to ensure collisions


  // TODO: Verify all entries exist using map.has(key)
  // Check that all keys are present


  // TODO: Verify all values are correct using map.get(key)
  // Check that each key returns the correct value


  // TODO: Return object with size, hasAll, and correctValues

}
`;

/**
 * Hard: Character Frequency Counter
 * Practical application of hash map for counting
 */
const hardSkeleton = `// Example usage: Use a hash map to count character frequencies and find the most frequent

function characterFrequency(str) {
  // TODO: Create a TrackedHashMap to store character counts
  const map = createTrackedHashMap();

  // TODO: Iterate through the string
  // For each character (excluding spaces):
  // - Get current count using map.get(char) || 0
  // - Increment count
  // - Set new count using map.set(char, newCount)


  // TODO: Find the character with maximum frequency
  // Use map.entries() to get all [char, count] pairs
  // Track maxChar and maxCount while iterating


  // TODO: Return object with char and count

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
