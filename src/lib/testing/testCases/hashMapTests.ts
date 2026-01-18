import type { TestCase } from "../types";
import type { PatternRequirement } from "../../validation/types";

/**
 * HashMap test cases with 3 difficulty levels (Easy, Medium, Hard)
 *
 * All test cases use a single function name 'countFrequency' that counts
 * character frequencies in a string and returns the most frequent character.
 * The difficulty levels require different algorithmic approaches validated via AST.
 *
 * All test cases use the same input string "hello world" for consistency.
 */

// Single dataset used across all HashMap test cases
const HASHMAP_INPUT_DATA = "hello world";
const HASHMAP_EXPECTED_OUTPUT = { char: "l", count: 3 };

export const hashMapTests: TestCase[] = [
  {
    id: "hashmap-frequency-easy",
    name: "Count Frequency (Easy)",
    difficulty: "easy",
    description:
      "Count character frequencies in a string and return the most frequent character. You can use any method.",
    initialData: HASHMAP_INPUT_DATA,
    expectedOutput: HASHMAP_EXPECTED_OUTPUT,
    assertions: `
      expect(result.char).toBe("l");
      expect(result.count).toBe(3);
    `,
    referenceSolution: `function countFrequency(str) {
  // Easy approach: use plain object for counting
  const counts = {};

  // Count each character (excluding spaces)
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (char !== ' ') {
      counts[char] = (counts[char] || 0) + 1;
    }
  }

  // Find max
  let maxChar = '';
  let maxCount = 0;
  for (const char in counts) {
    if (counts[char] > maxCount) {
      maxChar = char;
      maxCount = counts[char];
    }
  }

  return { char: maxChar, count: maxCount };
}`,
    skeletonCode: `function countFrequency(str) {
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
}`,
    hints: [
      "Use an object or Map to track character counts",
      "Skip space characters when counting",
      "In 'hello world', 'l' appears 3 times",
    ],
    acceptanceCriteria: [
      "Function correctly counts character frequencies",
      "Returns the most frequent non-space character",
      "Returns object with char and count properties",
    ],
  },
  {
    id: "hashmap-frequency-medium",
    name: "Count Frequency (Medium)",
    difficulty: "medium",
    description:
      "Count character frequencies using a TrackedHashMap to visualize hash operations.",
    initialData: HASHMAP_INPUT_DATA,
    expectedOutput: HASHMAP_EXPECTED_OUTPUT,
    assertions: `
      expect(result.char).toBe("l");
      expect(result.count).toBe(3);
    `,
    referenceSolution: `function countFrequency(str) {
  // Medium approach: use TrackedHashMap for visualization
  const map = createTrackedHashMap();

  // Count each character (excluding spaces)
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (char !== ' ') {
      const currentCount = map.get(char) || 0;
      map.set(char, currentCount + 1);
    }
  }

  // Find max using entries
  let maxChar = '';
  let maxCount = 0;
  const entries = map.entries();
  for (let i = 0; i < entries.length; i++) {
    const [char, count] = entries[i];
    if (count > maxCount) {
      maxChar = char;
      maxCount = count;
    }
  }

  return { char: maxChar, count: maxCount };
}`,
    skeletonCode: `function countFrequency(str) {
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
}`,
    hints: [
      "Use createTrackedHashMap() to create a tracked hash map",
      "map.get(key) returns the value or undefined",
      "map.set(key, value) adds or updates a key-value pair",
      "map.entries() returns all [key, value] pairs",
    ],
    acceptanceCriteria: [
      "Uses TrackedHashMap for counting",
      "Hash map operations are captured for visualization",
      "Returns correct most frequent character",
    ],
    patternRequirement: {
      anyOf: ["hashMapUsage"],
      errorMessage:
        "Medium difficulty requires using a TrackedHashMap. Use createTrackedHashMap() to create a hash map instance.",
    } satisfies PatternRequirement,
  },
  {
    id: "hashmap-frequency-hard",
    name: "Count Frequency (Hard)",
    difficulty: "hard",
    description:
      "Count character frequencies using a TrackedHashMap with explicit iteration to find the maximum.",
    initialData: HASHMAP_INPUT_DATA,
    expectedOutput: HASHMAP_EXPECTED_OUTPUT,
    assertions: `
      expect(result.char).toBe("l");
      expect(result.count).toBe(3);
    `,
    referenceSolution: `function countFrequency(str) {
  // Hard approach: TrackedHashMap with explicit iteration
  const map = createTrackedHashMap();

  // Count each character using explicit for loop
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (char !== ' ') {
      const currentCount = map.get(char) || 0;
      map.set(char, currentCount + 1);
    }
  }

  // Find max using explicit iteration over entries
  let maxChar = '';
  let maxCount = 0;

  const entries = map.entries();
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const char = entry[0];
    const count = entry[1];
    if (count > maxCount) {
      maxChar = char;
      maxCount = count;
    }
  }

  return { char: maxChar, count: maxCount };
}`,
    skeletonCode: `function countFrequency(str) {
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
}`,
    hints: [
      "Use createTrackedHashMap() and explicit for loops",
      "Access string characters with str[i]",
      "The entries() method returns array of [key, value] pairs",
      "Use explicit indexing: entry[0] for key, entry[1] for value",
    ],
    acceptanceCriteria: [
      "Uses TrackedHashMap for counting",
      "Uses explicit iteration patterns (for loops)",
      "Hash map and iteration operations are captured",
    ],
    patternRequirement: {
      anyOf: ["hashMapUsage", "iteration"],
      errorMessage:
        "Hard difficulty requires using TrackedHashMap with explicit iteration. Use createTrackedHashMap() and for loops.",
    } satisfies PatternRequirement,
  },
];
