/**
 * Preset algorithm examples for Hash Maps
 */

import type { PresetExample } from "./types";

export const hashMapPresets: PresetExample[] = [
  {
    id: "hashmap-two-sum",
    name: "Two Sum",
    description: "Find two numbers that add up to target using a hash map",
    category: "searching",
    dataStructure: "hashMap",
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    tags: ["hash-table", "array"],
    code: `function twoSum(nums, target) {
  // Use hash map to store complements
  // For each number, check if its complement exists

  const map = new Map();

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];

    // Check if complement was seen before
    if (map.has(complement)) {
      return [map.get(complement), i];
    }

    // Store current number and its index
    map.set(nums[i], i);
  }

  return null;
}

// Test it:
console.log(twoSum([2, 7, 11, 15], 9));  // [0, 1]
console.log(twoSum([3, 2, 4], 6));       // [1, 2]`,
  },
  {
    id: "hashmap-group-anagrams",
    name: "Group Anagrams",
    description: "Group words that are anagrams of each other",
    category: "grouping",
    dataStructure: "hashMap",
    timeComplexity: "O(n * k log k)",
    spaceComplexity: "O(n * k)",
    tags: ["hash-table", "string"],
    code: `function groupAnagrams(words) {
  // Use sorted string as key in hash map
  // All anagrams will have the same sorted key

  const map = new Map();

  for (const word of words) {
    // Sort characters to create key
    const key = word.split('').sort().join('');

    // Add word to corresponding group
    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key).push(word);
  }

  // Return all groups as array
  return Array.from(map.values());
}

// Test it:
const words = ["eat", "tea", "tan", "ate", "nat", "bat"];
console.log(groupAnagrams(words));
// [["eat", "tea", "ate"], ["tan", "nat"], ["bat"]]`,
  },
  {
    id: "hashmap-first-unique-char",
    name: "First Unique Character",
    description: "Find the first non-repeating character in a string",
    category: "searching",
    dataStructure: "hashMap",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    tags: ["hash-table", "string"],
    code: `function firstUniqChar(s) {
  // Two passes: count frequencies, then find first with count 1

  const counts = new Map();

  // First pass: count character frequencies
  for (const char of s) {
    counts.set(char, (counts.get(char) || 0) + 1);
  }

  // Second pass: find first character with count 1
  for (let i = 0; i < s.length; i++) {
    if (counts.get(s[i]) === 1) {
      return i;
    }
  }

  return -1;  // No unique character found
}

// Test it:
console.log(firstUniqChar("leetcode"));     // 0 ('l')
console.log(firstUniqChar("loveleetcode")); // 2 ('v')
console.log(firstUniqChar("aabb"));         // -1`,
  },
  {
    id: "hashmap-lru-cache",
    name: "LRU Cache",
    description: "Implement Least Recently Used cache with O(1) operations",
    category: "design",
    dataStructure: "hashMap",
    timeComplexity: "O(1)",
    spaceComplexity: "O(capacity)",
    tags: ["hash-table", "linked-list", "design"],
    code: `class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) return -1;

    // Move to end (most recently used)
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  put(key, value) {
    // Remove if exists (to update position)
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    // Add to end (most recently used)
    this.cache.set(key, value);

    // Evict least recently used if over capacity
    if (this.cache.size > this.capacity) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }
}

// Test it:
const cache = new LRUCache(2);
cache.put(1, 1);
cache.put(2, 2);
console.log(cache.get(1));  // 1
cache.put(3, 3);            // evicts key 2
console.log(cache.get(2));  // -1 (not found)`,
  },
  {
    id: "hashmap-subarray-sum",
    name: "Subarray Sum Equals K",
    description: "Count subarrays with sum equal to k using prefix sums",
    category: "counting",
    dataStructure: "hashMap",
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    tags: ["hash-table", "prefix-sum"],
    code: `function subarraySum(nums, k) {
  // Use hash map to store prefix sum frequencies
  // If (currentSum - k) exists, we found a subarray

  const map = new Map();
  map.set(0, 1);  // Base case: empty subarray

  let sum = 0;
  let count = 0;

  for (const num of nums) {
    sum += num;

    // Check if (sum - k) exists in map
    // This means there's a subarray with sum k
    if (map.has(sum - k)) {
      count += map.get(sum - k);
    }

    // Add current sum to map
    map.set(sum, (map.get(sum) || 0) + 1);
  }

  return count;
}

// Test it:
console.log(subarraySum([1, 1, 1], 2));        // 2
console.log(subarraySum([1, 2, 3], 3));        // 2
console.log(subarraySum([1, -1, 1, -1], 0));   // 4`,
  },
];
