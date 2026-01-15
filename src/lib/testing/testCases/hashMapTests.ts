import type { TestCase } from "../types";

/**
 * HashMap Test Cases
 * Based on PRD specifications (lines 548-556)
 */

export const hashMapTests: TestCase[] = [
  // Easy: Implement basic get/set
  {
    id: "hashmap-getset-easy",
    name: "Basic Get/Set Operations",
    difficulty: "easy",
    description:
      "Implement basic get and set operations for a hash map with string keys and number values",
    initialData: [] as Array<[string, number]>,
    expectedOutput: [3, 7, 11] as number[],
    assertions: `
      expect(result).toEqual([3, 7, 11]);
      expect(result.length).toBe(3);
    `,
    referenceSolution: `
      function basicHashMap(entries) {
        const map = createTrackedHashMap();

        // Set entries
        map.set("apple", 3);
        map.set("banana", 7);
        map.set("cherry", 11);

        // Get all values
        const values = [
          map.get("apple"),
          map.get("banana"),
          map.get("cherry")
        ];

        return values;
      }
    `,
    skeletonCode: `
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
    `,
    hints: [
      "Use createTrackedHashMap() to create a new hash map instance",
      "The set() method adds or updates a key-value pair: map.set(key, value)",
      "The get() method retrieves a value by key: map.get(key) returns the value or undefined",
    ],
    acceptanceCriteria: [
      "Creates a TrackedHashMap instance",
      "Sets three key-value pairs: apple=3, banana=7, cherry=11",
      "Gets all three values in correct order",
      "Returns array [3, 7, 11]",
    ],
  },

  // Medium: Handle collisions with chaining
  {
    id: "hashmap-collision-medium",
    name: "Collision Handling with Chaining",
    difficulty: "medium",
    description:
      "Handle hash collisions by adding multiple entries and verifying separate chaining works correctly",
    initialData: [] as Array<[string, number]>,
    expectedOutput: { size: 5, hasAll: true, correctValues: true },
    assertions: `
      expect(result.size).toBe(5);
      expect(result.hasAll).toBe(true);
      expect(result.correctValues).toBe(true);
    `,
    referenceSolution: `
      function handleCollisions(entries) {
        // Create map with small capacity to force collisions
        const map = createTrackedHashMap(4, 0.99);

        // Add entries that will likely collide
        map.set("a", 1);
        map.set("b", 2);
        map.set("c", 3);
        map.set("d", 4);
        map.set("e", 5);

        // Verify all entries exist
        const hasAll =
          map.has("a") &&
          map.has("b") &&
          map.has("c") &&
          map.has("d") &&
          map.has("e");

        // Verify values are correct
        const correctValues =
          map.get("a") === 1 &&
          map.get("b") === 2 &&
          map.get("c") === 3 &&
          map.get("d") === 4 &&
          map.get("e") === 5;

        return {
          size: map.getSize(),
          hasAll,
          correctValues
        };
      }
    `,
    skeletonCode: `
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
    `,
    hints: [
      "Use createTrackedHashMap(4, 0.99) to create a map with small capacity that won't resize",
      "With 5 entries and 4 buckets, at least one bucket will have multiple entries (collision)",
      "Use has(key) to check if a key exists, and get(key) to retrieve values",
      "Separate chaining allows multiple entries in the same bucket without losing data",
    ],
    acceptanceCriteria: [
      "Creates a TrackedHashMap with capacity 4 and high load factor threshold",
      "Adds 5 key-value pairs (forcing collisions)",
      "All 5 keys exist in the map (has() returns true)",
      "All 5 values are retrievable and correct",
      "Returns object with size=5, hasAll=true, correctValues=true",
    ],
  },

  // Hard: Implement frequency counter with hash map
  {
    id: "hashmap-frequency-hard",
    name: "Character Frequency Counter",
    difficulty: "hard",
    description:
      "Use a hash map to count character frequencies in a string and return the most frequent character",
    initialData: "hello world" as string,
    expectedOutput: { char: "l", count: 3 },
    assertions: `
      expect(result.char).toBe("l");
      expect(result.count).toBe(3);
    `,
    referenceSolution: `
      function characterFrequency(str) {
        const map = createTrackedHashMap();

        // Count frequency of each character (excluding spaces)
        for (let i = 0; i < str.length; i++) {
          const char = str[i];
          if (char !== ' ') {
            const currentCount = map.get(char) || 0;
            map.set(char, currentCount + 1);
          }
        }

        // Find character with highest frequency
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

        return {
          char: maxChar,
          count: maxCount
        };
      }
    `,
    skeletonCode: `
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
    `,
    hints: [
      "Use map.get(char) || 0 to get the current frequency count (defaults to 0 if not found)",
      "Increment the count and use map.set(char, newCount) to update the frequency",
      "Use map.entries() to get all [char, count] pairs for finding the maximum frequency",
      "In 'hello world', 'l' appears 3 times with the highest frequency",
    ],
    acceptanceCriteria: [
      "Creates a TrackedHashMap for counting characters",
      "Iterates through string and counts each character (excluding spaces)",
      "Updates counts correctly using get() and set()",
      "Finds character with maximum frequency",
      "Returns {char: 'l', count: 3} for input 'hello world'",
    ],
  },
];
