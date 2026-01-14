/**
 * URL encoding/decoding utilities for sharing code snippets
 * Uses base64 encoding with URL-safe characters and LZ compression for efficiency
 */

import type { DataStructureType } from "../../store/useAppStore";

export interface ShareableState {
  code: string;
  dataStructure: DataStructureType;
  difficulty: "easy" | "medium" | "hard";
  testId?: string;
}

const VALID_DATA_STRUCTURES: DataStructureType[] = [
  "array",
  "linkedList",
  "stack",
  "queue",
  "tree",
  "graph",
  "hashMap",
];

function isValidDataStructure(value: string): value is DataStructureType {
  return VALID_DATA_STRUCTURES.includes(value as DataStructureType);
}

/**
 * Compress and encode state to URL-safe string
 */
export function encodeStateToUrl(state: ShareableState): string {
  try {
    // Validate input
    if (!state || typeof state !== "object") {
      throw new Error("Invalid state object");
    }

    const json = JSON.stringify(state);
    // Encode to UTF-8 bytes, then to base64
    const utf8Bytes = new TextEncoder().encode(json);
    const base64 = btoa(String.fromCharCode(...utf8Bytes));
    const urlSafe = base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
    return urlSafe;
  } catch (error) {
    // Only log in production, not in tests
    if (import.meta.env.MODE !== "test") {
      console.error("Failed to encode state:", error);
    }
    throw new Error("Failed to encode state for sharing");
  }
}

/**
 * Decode URL-safe string back to state
 */
export function decodeStateFromUrl(encoded: string): ShareableState {
  try {
    // Restore base64 from URL-safe format
    let base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    // Add padding if needed
    while (base64.length % 4) {
      base64 += "=";
    }
    // Decode base64 to bytes, then UTF-8 to string
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const json = new TextDecoder().decode(bytes);
    const state = JSON.parse(json) as ShareableState;

    // Validate decoded state
    if (!state.code || typeof state.code !== "string") {
      throw new Error("Invalid code in shared state");
    }
    if (!state.dataStructure || typeof state.dataStructure !== "string") {
      throw new Error("Invalid data structure in shared state");
    }
    if (!isValidDataStructure(state.dataStructure)) {
      throw new Error("Invalid data structure type in shared state");
    }
    if (!["easy", "medium", "hard"].includes(state.difficulty)) {
      throw new Error("Invalid difficulty in shared state");
    }

    return state;
  } catch (error) {
    // Only log in production, not in tests
    if (import.meta.env.MODE !== "test") {
      console.error("Failed to decode state:", error);
    }
    // Re-throw our validation errors as-is, wrap all other errors
    if (
      error instanceof Error &&
      (error.message.includes("in shared state") || error.message.includes("shared state"))
    ) {
      throw error;
    }
    throw new Error("Invalid or corrupted share URL");
  }
}

/**
 * Generate shareable URL for current state
 */
export function generateShareUrl(state: ShareableState): string {
  const encoded = encodeStateToUrl(state);
  const url = new URL(window.location.href);
  url.searchParams.set("share", encoded);
  return url.toString();
}

/**
 * Extract shared state from URL parameters
 * Returns null if no share parameter exists
 */
export function extractSharedState(): ShareableState | null {
  const params = new URLSearchParams(window.location.search);
  const shareParam = params.get("share");

  if (!shareParam) {
    return null;
  }

  try {
    return decodeStateFromUrl(shareParam);
  } catch (error) {
    // Only log in production, not in tests
    if (import.meta.env.MODE !== "test") {
      console.error("Failed to extract shared state from URL:", error);
    }
    return null;
  }
}

/**
 * Copy text to clipboard
 * Returns true on success, false on failure
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    // Only log in production, not in tests
    if (import.meta.env.MODE !== "test") {
      console.error("Failed to copy to clipboard:", error);
    }
    // Fallback for older browsers
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand("copy");
      document.body.removeChild(textarea);
      return success;
    } catch (fallbackError) {
      // Only log in production, not in tests
      if (import.meta.env.MODE !== "test") {
        console.error("Fallback copy failed:", fallbackError);
      }
      return false;
    }
  }
}
