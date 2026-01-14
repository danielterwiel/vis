/**
 * Preset algorithm examples - comprehensive library of well-documented algorithms
 * for educational purposes
 */

import type { PresetExample, PresetCategory } from "./types";
import type { DataStructureType } from "../../store/useAppStore";
import { arrayPresets } from "./array";
import { linkedListPresets } from "./linkedList";
import { treePresets } from "./tree";
import { graphPresets } from "./graph";
import { stackQueuePresets } from "./stackQueue";
import { hashMapPresets } from "./hashMap";

/**
 * All preset examples organized by data structure
 */
export const allPresets: PresetExample[] = [
  ...arrayPresets,
  ...linkedListPresets,
  ...treePresets,
  ...graphPresets,
  ...stackQueuePresets,
  ...hashMapPresets,
];

/**
 * Available categories for filtering presets
 */
export const presetCategories: PresetCategory[] = [
  {
    id: "sorting",
    name: "Sorting",
    description: "Algorithms that arrange elements in order",
  },
  {
    id: "searching",
    name: "Searching",
    description: "Algorithms that find elements or patterns",
  },
  {
    id: "traversal",
    name: "Traversal",
    description: "Algorithms that visit all elements",
  },
  {
    id: "manipulation",
    name: "Manipulation",
    description: "Algorithms that modify data structures",
  },
  {
    id: "validation",
    name: "Validation",
    description: "Algorithms that check properties or constraints",
  },
  {
    id: "detection",
    name: "Detection",
    description: "Algorithms that detect patterns or anomalies",
  },
  {
    id: "shortest-path",
    name: "Shortest Path",
    description: "Algorithms that find optimal paths in graphs",
  },
  {
    id: "measurement",
    name: "Measurement",
    description: "Algorithms that compute metrics or properties",
  },
  {
    id: "evaluation",
    name: "Evaluation",
    description: "Algorithms that evaluate expressions or conditions",
  },
  {
    id: "optimization",
    name: "Optimization",
    description: "Algorithms that find optimal solutions",
  },
  {
    id: "grouping",
    name: "Grouping",
    description: "Algorithms that organize elements into groups",
  },
  {
    id: "counting",
    name: "Counting",
    description: "Algorithms that count occurrences or patterns",
  },
  {
    id: "ordering",
    name: "Ordering",
    description: "Algorithms that establish ordering constraints",
  },
  {
    id: "design",
    name: "Design",
    description: "Data structure design patterns",
  },
];

/**
 * Get presets for a specific data structure
 */
export function getPresetsForDataStructure(dataStructure: DataStructureType): PresetExample[] {
  return allPresets.filter((preset) => preset.dataStructure === dataStructure);
}

/**
 * Get presets by category
 */
export function getPresetsByCategory(category: string): PresetExample[] {
  return allPresets.filter((preset) => preset.category === category);
}

/**
 * Get a specific preset by ID
 */
export function getPresetById(id: string): PresetExample | undefined {
  return allPresets.find((preset) => preset.id === id);
}

/**
 * Search presets by name or description
 */
export function searchPresets(query: string): PresetExample[] {
  const lowerQuery = query.toLowerCase();
  return allPresets.filter(
    (preset) =>
      preset.name.toLowerCase().includes(lowerQuery) ||
      preset.description.toLowerCase().includes(lowerQuery) ||
      preset.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery)),
  );
}

/**
 * Get preset categories for a specific data structure
 */
export function getCategoriesForDataStructure(dataStructure: DataStructureType): PresetCategory[] {
  const presets = getPresetsForDataStructure(dataStructure);
  const categoryIds = new Set(presets.map((p) => p.category));

  return presetCategories.filter((cat) => categoryIds.has(cat.id));
}

// Re-export types
export type { PresetExample, PresetCategory };
