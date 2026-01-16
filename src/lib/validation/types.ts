/**
 * Pattern identifiers for AST-based code validation.
 * Used to verify that user code implements specific algorithmic patterns.
 */
export type PatternId =
  | "nestedLoops"
  | "swapCalls"
  | "recursion"
  | "partitionCalls";

/**
 * Defines a pattern requirement for a test case.
 * The user's code must match at least one of the patterns in `anyOf`.
 */
export interface PatternRequirement {
  /** List of acceptable patterns - code must match at least one */
  anyOf: PatternId[];
  /** Error message shown when validation fails */
  errorMessage: string;
}

/**
 * Result of validating code against pattern requirements.
 */
export interface ValidationResult {
  /** Whether the code passed validation */
  valid: boolean;
  /** Error message if validation failed */
  error?: string;
}
