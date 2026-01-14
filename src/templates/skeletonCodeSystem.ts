/**
 * Skeleton Code System
 *
 * Manages skeleton code templates with TODO markers and inline hints.
 * Provides utilities for extracting TODOs, checking modifications, and
 * managing the transition from skeleton to solution.
 */

import type { SkeletonCodeSystem } from "./types";

/**
 * Regular expressions for parsing skeleton code
 */
const TODO_PATTERN = /\/\/\s*TODO:?\s*(.+)/gi;
const HINT_PATTERN = /\/\/\s*Hint:?\s*(.+)/gi;
const PLACEHOLDER_PATTERN = /\/\*\s*your\s+(?:code|condition|implementation)\s+here\s*\*\//gi;

/**
 * Implementation of the skeleton code system
 */
class SkeletonCodeSystemImpl implements SkeletonCodeSystem {
  /**
   * Storage for skeleton templates keyed by "dataStructure-difficulty"
   */
  private templates = new Map<string, string>();

  /**
   * Register a skeleton template
   */
  registerTemplate(dataStructure: string, difficulty: string, code: string): void {
    const key = this.getKey(dataStructure, difficulty);
    this.templates.set(key, code);
  }

  /**
   * Get skeleton code for a specific test case
   */
  getSkeletonCode(dataStructure: string, difficulty: string): string {
    const key = this.getKey(dataStructure, difficulty);
    const template = this.templates.get(key);

    if (!template) {
      throw new Error(`No skeleton template found for ${dataStructure} (${difficulty})`);
    }

    return template;
  }

  /**
   * Extract TODO markers from code
   */
  extractTodos(code: string): string[] {
    const todos: string[] = [];
    let match: RegExpExecArray | null;

    // Reset regex lastIndex
    TODO_PATTERN.lastIndex = 0;

    while ((match = TODO_PATTERN.exec(code)) !== null) {
      if (match[1]) {
        todos.push(match[1].trim());
      }
    }

    return todos;
  }

  /**
   * Check if code has been modified from skeleton
   *
   * A modification is detected if:
   * - TODOs have been removed
   * - Placeholders have been replaced
   * - Code length differs significantly (>10%)
   */
  isModified(currentCode: string, skeletonCode: string): boolean {
    // Check if TODOs have been removed (do this BEFORE normalization)
    const skeletonTodos = this.extractTodos(skeletonCode);
    const currentTodos = this.extractTodos(currentCode);

    if (currentTodos.length < skeletonTodos.length) {
      return true;
    }

    // Check if placeholders have been replaced (do this BEFORE normalization)
    const skeletonPlaceholders = this.countPlaceholders(skeletonCode);
    const currentPlaceholders = this.countPlaceholders(currentCode);

    if (currentPlaceholders < skeletonPlaceholders) {
      return true;
    }

    // Normalize whitespace for comparison
    const normalizedCurrent = this.normalizeCode(currentCode);
    const normalizedSkeleton = this.normalizeCode(skeletonCode);

    // Check if codes are identical after normalization
    if (normalizedCurrent === normalizedSkeleton) {
      return false;
    }

    // Check if code length differs significantly (>10%)
    const lengthDiff = Math.abs(normalizedCurrent.length - normalizedSkeleton.length);
    const lengthThreshold = normalizedSkeleton.length * 0.1;

    return lengthDiff > lengthThreshold;
  }

  /**
   * Get inline hints from skeleton code
   */
  getInlineHints(code: string): string[] {
    const hints: string[] = [];
    let match: RegExpExecArray | null;

    // Reset regex lastIndex
    HINT_PATTERN.lastIndex = 0;

    while ((match = HINT_PATTERN.exec(code)) !== null) {
      if (match[1]) {
        hints.push(match[1].trim());
      }
    }

    return hints;
  }

  /**
   * Replace skeleton with reference solution
   *
   * Preserves any comments or setup code before the main function
   */
  replaceWithSolution(skeletonCode: string, referenceSolution: string): string {
    // Extract any leading comments or setup from skeleton
    const lines = skeletonCode.split("\n");
    const leadingComments: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("//") || trimmed.startsWith("/*") || trimmed === "") {
        leadingComments.push(line);
      } else {
        break;
      }
    }

    // Combine leading comments with reference solution
    const result = [...leadingComments, "", referenceSolution].join("\n");

    return result;
  }

  /**
   * Normalize code for comparison (remove extra whitespace, comments)
   */
  private normalizeCode(code: string): string {
    return (
      code
        // Remove single-line comments
        .replace(/\/\/.*$/gm, "")
        // Remove multi-line comments
        .replace(/\/\*[\s\S]*?\*\//g, "")
        // Remove extra whitespace
        .replace(/\s+/g, " ")
        .trim()
    );
  }

  /**
   * Count placeholder comments in code
   */
  private countPlaceholders(code: string): number {
    const matches = code.match(PLACEHOLDER_PATTERN);
    return matches ? matches.length : 0;
  }

  /**
   * Generate storage key for template
   */
  private getKey(dataStructure: string, difficulty: string): string {
    return `${dataStructure.toLowerCase()}-${difficulty.toLowerCase()}`;
  }

  /**
   * Clear all registered templates (useful for testing)
   */
  clearTemplates(): void {
    this.templates.clear();
  }

  /**
   * Get all registered template keys
   */
  getRegisteredTemplates(): string[] {
    return Array.from(this.templates.keys());
  }
}

/**
 * Singleton instance of the skeleton code system
 */
export const skeletonCodeSystem = new SkeletonCodeSystemImpl();

/**
 * Utility function to create skeleton code with proper formatting
 */
export function createSkeletonCode(options: {
  functionName: string;
  parameters: string;
  returnType: string;
  todos: string[];
  hints?: string[];
  exampleUsage?: string;
  imports?: string[];
}): string {
  const { functionName, parameters, todos, hints, exampleUsage, imports } = options;

  const parts: string[] = [];

  // Add imports if provided
  if (imports && imports.length > 0) {
    parts.push(...imports, "");
  }

  // Add function signature with TODO markers
  parts.push(`function ${functionName}(${parameters}) {`);

  // Add TODOs with optional hints
  for (let i = 0; i < todos.length; i++) {
    const todo = todos[i];
    const hint = hints?.[i];

    parts.push(`  // TODO: ${todo}`);
    if (hint) {
      parts.push(`  // Hint: ${hint}`);
    }
    parts.push("  /* your code here */");
    parts.push("");
  }

  parts.push("}");

  // Add example usage if provided
  if (exampleUsage) {
    parts.push("");
    parts.push("// Example usage:");
    parts.push(`// ${exampleUsage}`);
  }

  return parts.join("\n");
}

/**
 * Utility function to format reference solution with comments
 */
export function formatReferenceSolution(options: {
  functionCode: string;
  explanation?: string;
  complexity?: { time: string; space: string };
}): string {
  const { functionCode, explanation, complexity } = options;

  const parts: string[] = [];

  // Add explanation if provided
  if (explanation) {
    parts.push("/**");
    parts.push(` * ${explanation}`);
    if (complexity) {
      parts.push(" *");
      parts.push(` * Time Complexity: ${complexity.time}`);
      parts.push(` * Space Complexity: ${complexity.space}`);
    }
    parts.push(" */");
  }

  parts.push(functionCode);

  return parts.join("\n");
}
