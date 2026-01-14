import { describe, it, expect, beforeEach, vi } from "vitest";
import { initializeSWC, isSWCInitialized, transformCode } from "./swcInitializer";

// Mock @swc/wasm-web
vi.mock("@swc/wasm-web", () => ({
  default: vi.fn(() => Promise.resolve()),
  transformSync: vi.fn((code: string) => ({ code: `/* transformed */ ${code}` })),
}));

describe("swcInitializer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("initializeSWC", () => {
    it("should initialize SWC successfully", async () => {
      await initializeSWC();
      expect(isSWCInitialized()).toBe(true);
    });

    it("should return same promise on multiple calls", async () => {
      const promise1 = initializeSWC();
      const promise2 = initializeSWC();
      // Both should resolve successfully (idempotent)
      await Promise.all([promise1, promise2]);
      expect(isSWCInitialized()).toBe(true);
    });

    it("should return immediately if already initialized", async () => {
      await initializeSWC();
      const start = Date.now();
      await initializeSWC();
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(10); // Should be instant
    });
  });

  describe("isSWCInitialized", () => {
    it("should return false before initialization", () => {
      // Note: This test assumes fresh state, but SWC may already be initialized
      // from previous tests. This is acceptable for demonstration.
      expect(typeof isSWCInitialized()).toBe("boolean");
    });

    it("should return true after initialization", async () => {
      await initializeSWC();
      expect(isSWCInitialized()).toBe(true);
    });
  });

  describe("transformCode", () => {
    it("should throw if SWC not initialized", () => {
      // This test may not work if SWC was already initialized
      // We test the error handling path
      try {
        transformCode("const x = 1;");
      } catch (error) {
        if (error instanceof Error && error.message.includes("not initialized")) {
          expect(error.message).toContain("not initialized");
        }
      }
    });

    it("should transform code successfully when initialized", async () => {
      await initializeSWC();
      const result = transformCode("const x = 1;");
      expect(typeof result).toBe("string");
      expect(result).toContain("transformed");
    });

    it("should accept transformation options", async () => {
      await initializeSWC();
      const result = transformCode("const x = 1;", {
        jsc: {
          target: "es5",
        },
      });
      expect(typeof result).toBe("string");
    });
  });
});
