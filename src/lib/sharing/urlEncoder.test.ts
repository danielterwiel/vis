import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  encodeStateToUrl,
  decodeStateFromUrl,
  generateShareUrl,
  extractSharedState,
  copyToClipboard,
  type ShareableState,
} from "./urlEncoder";
import type { DataStructureType } from "../../store/useAppStore";

describe("urlEncoder", () => {
  describe("encodeStateToUrl", () => {
    it("should encode a simple state to URL-safe string", () => {
      const state: ShareableState = {
        code: "const x = 5;",
        dataStructure: "array",
        difficulty: "easy",
      };

      const encoded = encodeStateToUrl(state);
      expect(encoded).toBeTruthy();
      expect(typeof encoded).toBe("string");
      // URL-safe means no +, /, or = characters
      expect(encoded).not.toMatch(/[+/=]/);
    });

    it("should encode state with special characters", () => {
      const state: ShareableState = {
        code: "function test() {\n  return 'hello & goodbye';\n}",
        dataStructure: "linkedList",
        difficulty: "medium",
      };

      const encoded = encodeStateToUrl(state);
      expect(encoded).toBeTruthy();
      expect(encoded).not.toMatch(/[+/=]/);
    });

    it("should encode state with unicode characters", () => {
      const state: ShareableState = {
        code: "const emoji = '🚀';",
        dataStructure: "tree",
        difficulty: "hard",
      };

      const encoded = encodeStateToUrl(state);
      expect(encoded).toBeTruthy();
    });

    it("should throw error on invalid input", () => {
      expect(() => {
        // @ts-expect-error - testing invalid input
        encodeStateToUrl(null);
      }).toThrow("Failed to encode state for sharing");
    });
  });

  describe("decodeStateFromUrl", () => {
    it("should decode encoded state correctly", () => {
      const original: ShareableState = {
        code: "const x = 5;",
        dataStructure: "array",
        difficulty: "easy",
      };

      const encoded = encodeStateToUrl(original);
      const decoded = decodeStateFromUrl(encoded);

      expect(decoded).toEqual(original);
    });

    it("should decode state with special characters", () => {
      const original: ShareableState = {
        code: "function test() {\n  return 'hello & goodbye';\n}",
        dataStructure: "linkedList",
        difficulty: "medium",
      };

      const encoded = encodeStateToUrl(original);
      const decoded = decodeStateFromUrl(encoded);

      expect(decoded).toEqual(original);
    });

    it("should decode state with unicode", () => {
      const original: ShareableState = {
        code: "const emoji = '🚀';",
        dataStructure: "tree",
        difficulty: "hard",
      };

      const encoded = encodeStateToUrl(original);
      const decoded = decodeStateFromUrl(encoded);

      expect(decoded).toEqual(original);
    });

    it("should throw error on invalid base64", () => {
      expect(() => {
        decodeStateFromUrl("invalid!!!base64");
      }).toThrow("Invalid or corrupted share URL");
    });

    it("should throw error on invalid JSON", () => {
      // Create a valid base64 string that decodes to invalid JSON
      const invalidJson = btoa("{invalid json}");
      const urlSafe = invalidJson.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");

      expect(() => {
        decodeStateFromUrl(urlSafe);
      }).toThrow("Invalid or corrupted share URL");
    });

    it("should throw error on missing code field", () => {
      const invalidState = {
        dataStructure: "array",
        difficulty: "easy",
      };
      const json = JSON.stringify(invalidState);
      const utf8Bytes = new TextEncoder().encode(json);
      const base64 = btoa(String.fromCharCode(...utf8Bytes));
      const urlSafe = base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");

      expect(() => {
        decodeStateFromUrl(urlSafe);
      }).toThrow("Invalid code in shared state");
    });

    it("should throw error on missing dataStructure field", () => {
      const invalidState = {
        code: "const x = 5;",
        difficulty: "easy",
      };
      const json = JSON.stringify(invalidState);
      const utf8Bytes = new TextEncoder().encode(json);
      const base64 = btoa(String.fromCharCode(...utf8Bytes));
      const urlSafe = base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");

      expect(() => {
        decodeStateFromUrl(urlSafe);
      }).toThrow("Invalid data structure in shared state");
    });

    it("should throw error on invalid difficulty", () => {
      const invalidState = {
        code: "const x = 5;",
        dataStructure: "array",
        difficulty: "invalid",
      };
      const json = JSON.stringify(invalidState);
      const utf8Bytes = new TextEncoder().encode(json);
      const base64 = btoa(String.fromCharCode(...utf8Bytes));
      const urlSafe = base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");

      expect(() => {
        decodeStateFromUrl(urlSafe);
      }).toThrow("Invalid difficulty in shared state");
    });
  });

  describe("generateShareUrl", () => {
    it("should generate a valid URL with share parameter", () => {
      const state: ShareableState = {
        code: "const x = 5;",
        dataStructure: "array",
        difficulty: "easy",
      };

      const shareUrl = generateShareUrl(state);
      const url = new URL(shareUrl);

      expect(url.searchParams.has("share")).toBe(true);
      expect(url.searchParams.get("share")).toBeTruthy();
    });

    it("should generate URL that can be decoded back", () => {
      const state: ShareableState = {
        code: "function test() { return 42; }",
        dataStructure: "linkedList",
        difficulty: "medium",
      };

      const shareUrl = generateShareUrl(state);
      const url = new URL(shareUrl);
      const shareParam = url.searchParams.get("share");

      expect(shareParam).toBeTruthy();
      if (shareParam) {
        const decoded = decodeStateFromUrl(shareParam);
        expect(decoded).toEqual(state);
      }
    });
  });

  describe("extractSharedState", () => {
    let originalLocation: Location;

    beforeEach(() => {
      originalLocation = window.location;
    });

    afterEach(() => {
      // Restore original location
      Object.defineProperty(window, "location", {
        value: originalLocation,
        writable: true,
      });
    });

    it("should return null when no share parameter exists", () => {
      Object.defineProperty(window, "location", {
        value: { search: "" },
        writable: true,
      });

      const result = extractSharedState();
      expect(result).toBeNull();
    });

    it("should extract and decode shared state from URL", () => {
      const state: ShareableState = {
        code: "const x = 5;",
        dataStructure: "array",
        difficulty: "easy",
      };

      const encoded = encodeStateToUrl(state);
      Object.defineProperty(window, "location", {
        value: { search: `?share=${encoded}` },
        writable: true,
      });

      const result = extractSharedState();
      expect(result).toEqual(state);
    });

    it("should return null on invalid share parameter", () => {
      Object.defineProperty(window, "location", {
        value: { search: "?share=invalid" },
        writable: true,
      });

      const result = extractSharedState();
      expect(result).toBeNull();
    });

    it("should handle URL with multiple parameters", () => {
      const state: ShareableState = {
        code: "const x = 5;",
        dataStructure: "array",
        difficulty: "easy",
      };

      const encoded = encodeStateToUrl(state);
      Object.defineProperty(window, "location", {
        value: { search: `?foo=bar&share=${encoded}&baz=qux` },
        writable: true,
      });

      const result = extractSharedState();
      expect(result).toEqual(state);
    });
  });

  describe("copyToClipboard", () => {
    it("should copy text to clipboard", async () => {
      const mockWriteText = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, "clipboard", {
        value: { writeText: mockWriteText },
        writable: true,
      });

      const text = "https://example.com/share?code=abc";
      const result = await copyToClipboard(text);

      expect(result).toBe(true);
      expect(mockWriteText).toHaveBeenCalledWith(text);
    });

    it("should return false on clipboard API failure", async () => {
      const mockWriteText = vi.fn().mockRejectedValue(new Error("Permission denied"));
      Object.defineProperty(navigator, "clipboard", {
        value: { writeText: mockWriteText },
        writable: true,
      });

      // Mock document.execCommand to fail
      document.execCommand = vi.fn().mockReturnValue(false);

      const result = await copyToClipboard("test");

      expect(result).toBe(false);
    });

    it("should use fallback when clipboard API is not available", async () => {
      // Remove clipboard API
      Object.defineProperty(navigator, "clipboard", {
        value: undefined,
        writable: true,
      });

      // Mock successful execCommand
      document.execCommand = vi.fn().mockReturnValue(true);
      document.body.appendChild = vi.fn();
      document.body.removeChild = vi.fn();

      const result = await copyToClipboard("test");

      expect(result).toBe(true);
    });
  });

  describe("roundtrip encoding/decoding", () => {
    it("should preserve all difficulty levels", () => {
      const difficulties: Array<"easy" | "medium" | "hard"> = ["easy", "medium", "hard"];

      difficulties.forEach((difficulty) => {
        const state: ShareableState = {
          code: `const test = "${difficulty}";`,
          dataStructure: "array",
          difficulty,
        };

        const encoded = encodeStateToUrl(state);
        const decoded = decodeStateFromUrl(encoded);

        expect(decoded).toEqual(state);
      });
    });

    it("should preserve all data structures", () => {
      const dataStructures: DataStructureType[] = [
        "array",
        "linkedList",
        "stack",
        "queue",
        "tree",
        "graph",
        "hashMap",
      ];

      dataStructures.forEach((dataStructure) => {
        const state: ShareableState = {
          code: `const test = "${dataStructure}";`,
          dataStructure,
          difficulty: "easy",
        };

        const encoded = encodeStateToUrl(state);
        const decoded = decodeStateFromUrl(encoded);

        expect(decoded).toEqual(state);
      });
    });

    it("should preserve complex code with edge cases", () => {
      const state: ShareableState = {
        code: `function complex() {
  const str = "quotes: ' and \\"";
  const num = 123.456;
  const arr = [1, 2, 3];
  const obj = { key: "value" };
  return true && false || null;
}`,
        dataStructure: "array",
        difficulty: "hard",
      };

      const encoded = encodeStateToUrl(state);
      const decoded = decodeStateFromUrl(encoded);

      expect(decoded).toEqual(state);
    });
  });
});
