/**
 * Type definitions for preset algorithm examples
 */

import type { DataStructureType } from "../../store/useAppStore";

export interface PresetExample {
  /**
   * Unique identifier for the preset
   */
  id: string;

  /**
   * Display name shown in UI
   */
  name: string;

  /**
   * Brief description of what the algorithm does
   */
  description: string;

  /**
   * Category/type of algorithm (e.g., "sorting", "searching", "traversal")
   */
  category: string;

  /**
   * Data structure this preset is for
   */
  dataStructure: DataStructureType;

  /**
   * Complete, well-commented code example
   */
  code: string;

  /**
   * Optional time complexity (e.g., "O(n²)")
   */
  timeComplexity?: string;

  /**
   * Optional space complexity (e.g., "O(1)")
   */
  spaceComplexity?: string;

  /**
   * Tags for filtering/searching (e.g., ["recursive", "in-place"])
   */
  tags?: string[];
}

export interface PresetCategory {
  /**
   * Category identifier
   */
  id: string;

  /**
   * Display name
   */
  name: string;

  /**
   * Category description
   */
  description: string;
}
