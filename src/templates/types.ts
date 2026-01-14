/**
 * Type definitions for skeleton code templates
 */

export interface SkeletonTemplate {
  /**
   * The skeleton code with TODO markers and structure
   */
  code: string;

  /**
   * Inline hints embedded in the code as comments
   */
  inlineHints: string[];

  /**
   * Function signature that the user must implement
   */
  functionSignature: string;

  /**
   * Expected return type (for documentation)
   */
  returnType: string;

  /**
   * Example usage code (commented out by default)
   */
  exampleUsage?: string;
}

export interface SkeletonCodeSystem {
  /**
   * Get skeleton code for a specific test case
   */
  getSkeletonCode(dataStructure: string, difficulty: string): string;

  /**
   * Extract TODO markers from code
   */
  extractTodos(code: string): string[];

  /**
   * Check if code has been modified from skeleton
   */
  isModified(currentCode: string, skeletonCode: string): boolean;

  /**
   * Get inline hints from skeleton code
   */
  getInlineHints(code: string): string[];

  /**
   * Replace skeleton with reference solution
   */
  replaceWithSolution(skeletonCode: string, referenceSolution: string): string;
}
