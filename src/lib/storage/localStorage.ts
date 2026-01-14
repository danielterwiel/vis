/**
 * Local storage utilities for persisting user progress
 */

import type { DataStructureType, DifficultyLevel } from "../../store/useAppStore";

const STORAGE_VERSION = "1";
const STORAGE_PREFIX = "vis_app_v" + STORAGE_VERSION;

/**
 * Storage keys
 */
const KEYS = {
  USER_CODE: (ds: DataStructureType, diff: DifficultyLevel) =>
    `${STORAGE_PREFIX}_code_${ds}_${diff}`,
  ANIMATION_SPEED: `${STORAGE_PREFIX}_animation_speed`,
  HINTS_REVEALED: (ds: DataStructureType, diff: DifficultyLevel) =>
    `${STORAGE_PREFIX}_hints_${ds}_${diff}`,
} as const;

/**
 * Check if localStorage is available
 */
function isLocalStorageAvailable(): boolean {
  try {
    const test = "__localStorage_test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Save user code for a specific data structure and difficulty
 */
export function saveUserCode(
  dataStructure: DataStructureType,
  difficulty: DifficultyLevel,
  code: string,
): void {
  if (!isLocalStorageAvailable()) return;

  try {
    const key = KEYS.USER_CODE(dataStructure, difficulty);
    localStorage.setItem(key, code);
  } catch (error) {
    // Quota exceeded or other error - fail silently
    if (import.meta.env.MODE !== "test") {
      console.warn("Failed to save user code:", error);
    }
  }
}

/**
 * Load user code for a specific data structure and difficulty
 */
export function loadUserCode(
  dataStructure: DataStructureType,
  difficulty: DifficultyLevel,
): string | null {
  if (!isLocalStorageAvailable()) return null;

  try {
    const key = KEYS.USER_CODE(dataStructure, difficulty);
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * Save animation speed preference
 */
export function saveAnimationSpeed(speed: number): void {
  if (!isLocalStorageAvailable()) return;

  try {
    localStorage.setItem(KEYS.ANIMATION_SPEED, speed.toString());
  } catch (error) {
    if (import.meta.env.MODE !== "test") {
      console.warn("Failed to save animation speed:", error);
    }
  }
}

/**
 * Load animation speed preference
 */
export function loadAnimationSpeed(): number | null {
  if (!isLocalStorageAvailable()) return null;

  try {
    const speed = localStorage.getItem(KEYS.ANIMATION_SPEED);
    if (speed !== null) {
      const parsed = Number.parseFloat(speed);
      if (!Number.isNaN(parsed) && parsed > 0) {
        return parsed;
      }
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Save hints revealed count for a specific test
 */
export function saveHintsRevealed(
  dataStructure: DataStructureType,
  difficulty: DifficultyLevel,
  count: number,
): void {
  if (!isLocalStorageAvailable()) return;

  try {
    const key = KEYS.HINTS_REVEALED(dataStructure, difficulty);
    localStorage.setItem(key, count.toString());
  } catch (error) {
    if (import.meta.env.MODE !== "test") {
      console.warn("Failed to save hints revealed:", error);
    }
  }
}

/**
 * Load hints revealed count for a specific test
 */
export function loadHintsRevealed(
  dataStructure: DataStructureType,
  difficulty: DifficultyLevel,
): number | null {
  if (!isLocalStorageAvailable()) return null;

  try {
    const key = KEYS.HINTS_REVEALED(dataStructure, difficulty);
    const count = localStorage.getItem(key);
    if (count !== null) {
      const parsed = Number.parseInt(count, 10);
      if (!Number.isNaN(parsed) && parsed >= 0) {
        return parsed;
      }
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Clear all stored data for a specific data structure and difficulty
 */
export function clearTestProgress(
  dataStructure: DataStructureType,
  difficulty: DifficultyLevel,
): void {
  if (!isLocalStorageAvailable()) return;

  try {
    localStorage.removeItem(KEYS.USER_CODE(dataStructure, difficulty));
    localStorage.removeItem(KEYS.HINTS_REVEALED(dataStructure, difficulty));
  } catch (error) {
    if (import.meta.env.MODE !== "test") {
      console.warn("Failed to clear test progress:", error);
    }
  }
}

/**
 * Clear all stored application data
 */
export function clearAllProgress(): void {
  if (!isLocalStorageAvailable()) return;

  try {
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    }
  } catch (error) {
    if (import.meta.env.MODE !== "test") {
      console.warn("Failed to clear all progress:", error);
    }
  }
}
