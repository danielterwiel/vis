/**
 * Validation module exports.
 * Provides AST-based code validation for pattern detection.
 */

// Types
export type { PatternId, PatternRequirement, ValidationResult } from "./types";

// Functions
export {
  parseCode,
  hasNestedLoops,
  hasSwapCalls,
  hasRecursion,
  hasPartitionCalls,
  hasTwoPointers,
  hasPointerManipulation,
  validatePatterns,
} from "./astAnalyzer";
