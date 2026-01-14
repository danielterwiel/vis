/**
 * Test suite for expect bundler
 */

import { describe, it, expect } from "vitest";
import { bundleExpect } from "./expectBundle";

describe("expectBundle", () => {
  describe("bundleExpect", () => {
    it("should return a string of expect implementation", () => {
      const result = bundleExpect();
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });

    it("should include expect function definition", () => {
      const result = bundleExpect();
      expect(result).toContain("function expect");
    });

    it("should include toBe matcher", () => {
      const result = bundleExpect();
      expect(result).toContain("toBe");
    });

    it("should include toEqual matcher", () => {
      const result = bundleExpect();
      expect(result).toContain("toEqual");
    });

    it("should include toBeGreaterThan matcher", () => {
      const result = bundleExpect();
      expect(result).toContain("toBeGreaterThan");
    });

    it("should include toBeLessThan matcher", () => {
      const result = bundleExpect();
      expect(result).toContain("toBeLessThan");
    });

    it("should include toContain matcher", () => {
      const result = bundleExpect();
      expect(result).toContain("toContain");
    });

    it("should include toHaveLength matcher", () => {
      const result = bundleExpect();
      expect(result).toContain("toHaveLength");
    });

    it("should include toBeTruthy matcher", () => {
      const result = bundleExpect();
      expect(result).toContain("toBeTruthy");
    });

    it("should include toBeFalsy matcher", () => {
      const result = bundleExpect();
      expect(result).toContain("toBeFalsy");
    });

    it("should include toBeNull matcher", () => {
      const result = bundleExpect();
      expect(result).toContain("toBeNull");
    });

    it("should include toBeUndefined matcher", () => {
      const result = bundleExpect();
      expect(result).toContain("toBeUndefined");
    });

    it("should include toBeDefined matcher", () => {
      const result = bundleExpect();
      expect(result).toContain("toBeDefined");
    });

    it("should include toBeInstanceOf matcher", () => {
      const result = bundleExpect();
      expect(result).toContain("toBeInstanceOf");
    });

    it("should include toThrow matcher", () => {
      const result = bundleExpect();
      expect(result).toContain("toThrow");
    });

    it("should include not modifiers", () => {
      const result = bundleExpect();
      expect(result).toContain("not:");
    });

    it("should be valid JavaScript that can be parsed", () => {
      const result = bundleExpect();
      // Should not throw when parsed
      expect(() => new Function(result)).not.toThrow();
    });

    it("should create a working expect function when evaluated", () => {
      const expectCode = bundleExpect();
      const expectFn = new Function(`${expectCode}; return expect;`)();

      // Test toBe matcher
      expect(() => expectFn(5).toBe(5)).not.toThrow();
      expect(() => expectFn(5).toBe(10)).toThrow();

      // Test toEqual matcher
      expect(() => expectFn([1, 2]).toEqual([1, 2])).not.toThrow();
      expect(() => expectFn([1, 2]).toEqual([3, 4])).toThrow();
    });
  });
});
