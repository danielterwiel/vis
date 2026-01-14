import { describe, it, expect, vi, beforeEach } from "vitest";
import { executeSandboxedCode, executeSandboxedCodeBatch } from "./sandbox";

/**
 * Note: These tests require a real browser environment with iframe support.
 * happy-dom and jsdom do not fully support iframe srcdoc execution.
 * These tests are skipped by default and should be run in a browser test environment (e.g., Playwright).
 */

describe("sandbox", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("executeSandboxedCode", () => {
    it.skip("should execute simple code successfully", async () => {
      const code = "const result = 2 + 2;";

      const result = await executeSandboxedCode({ code });

      expect(result.success).toBe(true);
      expect(result.executionTime).toBeGreaterThan(0);
      expect(Array.isArray(result.steps)).toBe(true);
    });

    it.skip("should capture execution errors", async () => {
      const code = 'throw new Error("Test error");';

      const result = await executeSandboxedCode({ code });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Test error");
      expect(result.executionTime).toBeGreaterThan(0);
    });

    it.skip("should capture console logs via onMessage", async () => {
      const code = 'console.log("Hello", "World");';
      const messages: any[] = [];

      await executeSandboxedCode({
        code,
        onMessage: (msg) => messages.push(msg),
      });

      const consoleMessages = messages.filter((m) => m.type === "console-log");
      expect(consoleMessages.length).toBeGreaterThan(0);
    });

    it("should timeout on long-running code", async () => {
      // This test is challenging because we need actual infinite loop
      // We'll use a very short timeout instead
      const code = `
        let i = 0;
        while (i < 1000000) {
          i++;
        }
      `;

      await expect(executeSandboxedCode({ code, timeout: 10 })).rejects.toThrow("timeout");
    }, 10000); // Longer test timeout

    it.skip("should capture operations via __capture", async () => {
      const code = `
        window.__capture('push', 'array', [5], undefined);
        window.__capture('pop', 'array', [], 5);
        const result = 'done';
      `;

      const messages: any[] = [];

      await executeSandboxedCode({
        code,
        onMessage: (msg) => messages.push(msg),
      });

      const captureMessages = messages.filter((m) => m.type === "capture-step");
      expect(captureMessages.length).toBe(2);
      expect(captureMessages[0].step.operation).toBe("push");
      expect(captureMessages[1].step.operation).toBe("pop");
    });

    it.skip("should include result in execution-complete", async () => {
      const code = "const result = 42;";

      const result = await executeSandboxedCode({ code });

      expect(result.success).toBe(true);
      // Note: result variable needs to be exposed for this to work
      // In actual implementation, we may need to adjust this
    });

    it.skip("should handle syntax errors", async () => {
      const code = "const x = ;"; // Invalid syntax

      const result = await executeSandboxedCode({ code });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("executeSandboxedCodeBatch", () => {
    it.skip("should execute multiple code samples in parallel", async () => {
      const codeSamples = [
        "const result = 1 + 1;",
        "const result = 2 + 2;",
        "const result = 3 + 3;",
      ];

      const results = await executeSandboxedCodeBatch(codeSamples);

      expect(results).toHaveLength(3);
      results.forEach((result) => {
        expect(result.success).toBe(true);
      });
    });

    it.skip("should handle mixed success and failure", async () => {
      const codeSamples = [
        "const result = 1 + 1;",
        'throw new Error("Test error");',
        "const result = 3 + 3;",
      ];

      const results = await executeSandboxedCodeBatch(codeSamples);

      expect(results).toHaveLength(3);
      expect(results[0]?.success).toBe(true);
      expect(results[1]?.success).toBe(false);
      expect(results[2]?.success).toBe(true);
    });

    it.skip("should call onMessage with index", async () => {
      const codeSamples = ['console.log("A");', 'console.log("B");'];

      const messagesByIndex: Record<number, any[]> = {};

      await executeSandboxedCodeBatch(codeSamples, {
        onMessage: (index, message) => {
          if (!messagesByIndex[index]) {
            messagesByIndex[index] = [];
          }
          messagesByIndex[index].push(message);
        },
      });

      expect(Object.keys(messagesByIndex)).toHaveLength(2);
    });

    it("should respect timeout option", async () => {
      const codeSamples = ["let i = 0; while(i < 1000000) i++;", "const result = 1;"];

      await expect(executeSandboxedCodeBatch(codeSamples, { timeout: 10 })).rejects.toThrow();
    }, 10000);
  });
});
