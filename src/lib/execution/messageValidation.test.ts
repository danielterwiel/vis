import { describe, it, expect } from "vitest";
import {
  validateSandboxMessage,
  generateCorrelationId,
  type ExecutionCompleteMessage,
  type ExecutionErrorMessage,
  type TestResultMessage,
} from "./messageValidation";

describe("messageValidation", () => {
  describe("validateSandboxMessage", () => {
    it("should reject null data", () => {
      const event = new MessageEvent("message", { data: null });
      expect(validateSandboxMessage(event)).toBeNull();
    });

    it("should reject non-object data", () => {
      const event = new MessageEvent("message", { data: "string" });
      expect(validateSandboxMessage(event)).toBeNull();
    });

    it("should reject missing type field", () => {
      const event = new MessageEvent("message", { data: { foo: "bar" } });
      expect(validateSandboxMessage(event)).toBeNull();
    });

    it("should reject invalid message type", () => {
      const event = new MessageEvent("message", { data: { type: "invalid-type" } });
      expect(validateSandboxMessage(event)).toBeNull();
    });

    it("should validate execution-complete message", () => {
      const data: ExecutionCompleteMessage = {
        type: "execution-complete",
        result: 42,
        steps: [],
        executionTime: 100,
      };
      const event = new MessageEvent("message", { data });
      const validated = validateSandboxMessage(event);
      expect(validated).toEqual(data);
      expect(validated?.type).toBe("execution-complete");
    });

    it("should reject execution-complete with missing fields", () => {
      const data = {
        type: "execution-complete",
        result: 42,
        // missing steps and executionTime
      };
      const event = new MessageEvent("message", { data });
      expect(validateSandboxMessage(event)).toBeNull();
    });

    it("should validate execution-error message", () => {
      const data: ExecutionErrorMessage = {
        type: "execution-error",
        error: "Something went wrong",
        stack: "Error stack trace",
      };
      const event = new MessageEvent("message", { data });
      const validated = validateSandboxMessage(event);
      expect(validated).toEqual(data);
    });

    it("should reject execution-error with non-string error", () => {
      const data = {
        type: "execution-error",
        error: 123, // should be string
      };
      const event = new MessageEvent("message", { data });
      expect(validateSandboxMessage(event)).toBeNull();
    });

    it("should validate test-result message", () => {
      const data: TestResultMessage = {
        type: "test-result",
        testId: "test-1",
        passed: true,
        executionTime: 50,
        steps: [],
      };
      const event = new MessageEvent("message", { data });
      const validated = validateSandboxMessage(event);
      expect(validated).toEqual(data);
    });

    it("should reject test-result with missing required fields", () => {
      const data = {
        type: "test-result",
        testId: "test-1",
        // missing passed, executionTime, steps
      };
      const event = new MessageEvent("message", { data });
      expect(validateSandboxMessage(event)).toBeNull();
    });

    it("should validate capture-step message", () => {
      const data = {
        type: "capture-step",
        step: {
          operation: "push",
          target: "array",
          args: [5],
          result: undefined,
          timestamp: Date.now(),
        },
      };
      const event = new MessageEvent("message", { data });
      const validated = validateSandboxMessage(event);
      expect(validated).toEqual(data);
    });

    it("should validate console-log message", () => {
      const data = {
        type: "console-log",
        level: "log",
        args: ["Hello", "world"],
      };
      const event = new MessageEvent("message", { data });
      const validated = validateSandboxMessage(event);
      expect(validated).toEqual(data);
    });

    it("should check source when expectedSource provided", () => {
      const mockWindow = {} as Window;
      const data: ExecutionCompleteMessage = {
        type: "execution-complete",
        result: 42,
        steps: [],
        executionTime: 100,
      };

      // Message from different source
      const event = new MessageEvent("message", {
        data,
        source: {} as Window,
      });

      expect(validateSandboxMessage(event, mockWindow)).toBeNull();
    });

    it("should accept message from correct source", () => {
      const mockWindow = {} as Window;
      const data: ExecutionCompleteMessage = {
        type: "execution-complete",
        result: 42,
        steps: [],
        executionTime: 100,
      };

      const event = new MessageEvent("message", {
        data,
        source: mockWindow,
      });

      const validated = validateSandboxMessage(event, mockWindow);
      expect(validated).toEqual(data);
    });
  });

  describe("generateCorrelationId", () => {
    it("should generate unique IDs", () => {
      const id1 = generateCorrelationId();
      const id2 = generateCorrelationId();
      expect(id1).not.toBe(id2);
    });

    it("should generate string IDs", () => {
      const id = generateCorrelationId();
      expect(typeof id).toBe("string");
      expect(id.length).toBeGreaterThan(0);
    });

    it("should include timestamp", () => {
      const before = Date.now();
      const id = generateCorrelationId();
      const after = Date.now();

      const parts = id.split("-");
      const timestamp = parseInt(parts[0] || "0", 10);
      expect(timestamp).toBeGreaterThanOrEqual(before);
      expect(timestamp).toBeLessThanOrEqual(after);
    });
  });
});
