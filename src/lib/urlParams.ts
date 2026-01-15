import type { DataStructureType, DifficultyLevel } from "../store/useAppStore";

/**
 * URL parameter keys
 */
const PARAM_DATA_STRUCTURE = "ds";
const PARAM_DIFFICULTY = "difficulty";

/**
 * Valid data structure types as Set for O(1) lookup
 */
const VALID_DATA_STRUCTURES: Set<string> = new Set([
  "array",
  "linkedList",
  "stack",
  "queue",
  "tree",
  "graph",
  "hashMap",
]);

/**
 * Valid difficulty levels as Set for O(1) lookup
 */
const VALID_DIFFICULTIES: Set<string> = new Set(["easy", "medium", "hard"]);

/**
 * Get URL parameters
 */
export function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    dataStructure: (params.get(PARAM_DATA_STRUCTURE) as DataStructureType) || null,
    difficulty: (params.get(PARAM_DIFFICULTY) as DifficultyLevel) || null,
  };
}

/**
 * Update URL parameters without page reload
 */
export function updateUrlParams(dataStructure: DataStructureType, difficulty: DifficultyLevel) {
  const params = new URLSearchParams(window.location.search);
  params.set(PARAM_DATA_STRUCTURE, dataStructure);
  params.set(PARAM_DIFFICULTY, difficulty);

  const newUrl = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState(null, "", newUrl);
}

/**
 * Validate that a string is a valid data structure type
 */
export function isValidDataStructure(value: string | null): value is DataStructureType {
  if (!value) return false;
  return VALID_DATA_STRUCTURES.has(value);
}

/**
 * Validate that a string is a valid difficulty level
 */
export function isValidDifficulty(value: string | null): value is DifficultyLevel {
  if (!value) return false;
  return VALID_DIFFICULTIES.has(value);
}
