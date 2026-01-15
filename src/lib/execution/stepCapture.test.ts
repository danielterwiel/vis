import { describe, it, expect, vi, beforeEach } from "vitest";
import { captureSteps, captureStepsBatch, validateCodeForCapture } from "./stepCapture";
import * as instrumenter from "./instrumenter";
import * as sandbox from "./sandbox";

// Mock the dependencies
vi.mock("./instrumenter");
vi.mock("./sandbox");

describe("stepCapture", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("validateCodeForCapture", () => {
    it("should return valid for correct code", () => {
      vi.mocked(instrumenter.instrumentCode).mockReturnValue({
        code: "instrumented code",
      });

      const result = validateCodeForCapture("const x = 1;");

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
      expect(instrumenter.instrumentCode).toHaveBeenCalledWith("const x = 1;", {
        captureOperations: false, // Disabled - tracked data structures handle their own capture
        addErrorBoundaries: false,
      });
    });

    it("should return invalid for code with syntax errors", () => {
      vi.mocked(instrumenter.instrumentCode).mockReturnValue({
        code: "",
        error: "Unexpected token",
      });

      const result = validateCodeForCapture("const x = ;");

      expect(result.valid).toBe(false);
      expect(result.error).toBe("Unexpected token");
    });
  });

  describe("captureSteps", () => {
    it("should instrument code and execute in sandbox", async () => {
      vi.mocked(instrumenter.instrumentCode).mockReturnValue({
        code: "instrumented code",
      });

      vi.mocked(sandbox.executeSandboxedCode).mockResolvedValue({
        success: true,
        result: 42,
        steps: [],
        executionTime: 100,
      });

      const result = await captureSteps({
        code: "const x = 1;",
      });

      expect(result.success).toBe(true);
      expect(result.result).toBe(42);
      expect(result.executionTime).toBe(100);
      expect(instrumenter.instrumentCode).toHaveBeenCalledWith("const x = 1;", {
        captureOperations: false, // Disabled - tracked data structures handle their own capture
        addErrorBoundaries: true,
      });
      expect(sandbox.executeSandboxedCode).toHaveBeenCalled();
    });

    it("should return error if instrumentation fails", async () => {
      vi.mocked(instrumenter.instrumentCode).mockReturnValue({
        code: "",
        error: "Syntax error",
      });

      const result = await captureSteps({
        code: "invalid code",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Syntax error");
      expect(result.steps).toEqual([]);
      expect(sandbox.executeSandboxedCode).not.toHaveBeenCalled();
    });

    it("should collect capture-step messages", async () => {
      vi.mocked(instrumenter.instrumentCode).mockReturnValue({
        code: "instrumented code",
      });

      let capturedMessageHandler: ((msg: any) => void) | undefined;
      vi.mocked(sandbox.executeSandboxedCode).mockImplementation(async (options) => {
        capturedMessageHandler = options.onMessage;

        // Simulate capture-step messages
        if (capturedMessageHandler) {
          capturedMessageHandler({
            type: "capture-step",
            step: {
              operation: "push",
              target: "arr",
              args: [1],
              result: 1,
              timestamp: 1000,
            },
          });

          capturedMessageHandler({
            type: "capture-step",
            step: {
              operation: "push",
              target: "arr",
              args: [2],
              result: 2,
              timestamp: 1001,
            },
          });
        }

        return {
          success: true,
          result: [1, 2],
          steps: [],
          executionTime: 50,
        };
      });

      const result = await captureSteps({
        code: "arr.push(1); arr.push(2);",
      });

      expect(result.success).toBe(true);
      expect(result.steps).toHaveLength(2);
      expect(result.steps[0]).toEqual({
        type: "push",
        target: "arr",
        args: [1],
        result: 1,
        timestamp: 1000,
      });
      expect(result.steps[1]).toEqual({
        type: "push",
        target: "arr",
        args: [2],
        result: 2,
        timestamp: 1001,
      });
    });

    it("should collect console-log messages", async () => {
      vi.mocked(instrumenter.instrumentCode).mockReturnValue({
        code: "instrumented code",
      });

      let capturedMessageHandler: ((msg: any) => void) | undefined;
      vi.mocked(sandbox.executeSandboxedCode).mockImplementation(async (options) => {
        capturedMessageHandler = options.onMessage;

        // Simulate console-log messages
        if (capturedMessageHandler) {
          capturedMessageHandler({
            type: "console-log",
            level: "log",
            args: ["Hello", "World"],
          });

          capturedMessageHandler({
            type: "console-log",
            level: "error",
            args: ["Error message"],
          });
        }

        return {
          success: true,
          result: undefined,
          steps: [],
          executionTime: 30,
        };
      });

      const result = await captureSteps({
        code: 'console.log("Hello", "World");',
      });

      expect(result.success).toBe(true);
      expect(result.consoleLogs).toHaveLength(2);
      expect(result.consoleLogs[0]!.level).toBe("log");
      expect(result.consoleLogs[0]!.args).toEqual(["Hello", "World"]);
      expect(result.consoleLogs[1]!.level).toBe("error");
      expect(result.consoleLogs[1]!.args).toEqual(["Error message"]);
    });

    it("should call onStepCaptured callback", async () => {
      vi.mocked(instrumenter.instrumentCode).mockReturnValue({
        code: "instrumented code",
      });

      let capturedMessageHandler: ((msg: any) => void) | undefined;
      vi.mocked(sandbox.executeSandboxedCode).mockImplementation(async (options) => {
        capturedMessageHandler = options.onMessage;

        if (capturedMessageHandler) {
          capturedMessageHandler({
            type: "capture-step",
            step: {
              operation: "push",
              target: "arr",
              args: [1],
              result: 1,
              timestamp: 1000,
            },
          });
        }

        return {
          success: true,
          result: [1],
          steps: [],
          executionTime: 20,
        };
      });

      const onStepCaptured = vi.fn();
      await captureSteps({
        code: "arr.push(1);",
        onStepCaptured,
      });

      expect(onStepCaptured).toHaveBeenCalledTimes(1);
      const firstCall = onStepCaptured.mock.calls[0];
      expect(firstCall).toBeDefined();
      expect(firstCall![0]).toEqual({
        type: "push",
        target: "arr",
        args: [1],
        result: 1,
        timestamp: 1000,
      });
    });

    it("should call onConsoleLog callback", async () => {
      vi.mocked(instrumenter.instrumentCode).mockReturnValue({
        code: "instrumented code",
      });

      let capturedMessageHandler: ((msg: any) => void) | undefined;
      vi.mocked(sandbox.executeSandboxedCode).mockImplementation(async (options) => {
        capturedMessageHandler = options.onMessage;

        if (capturedMessageHandler) {
          capturedMessageHandler({
            type: "console-log",
            level: "log",
            args: ["Test"],
          });
        }

        return {
          success: true,
          result: undefined,
          steps: [],
          executionTime: 15,
        };
      });

      const onConsoleLog = vi.fn();
      await captureSteps({
        code: 'console.log("Test");',
        onConsoleLog,
      });

      expect(onConsoleLog).toHaveBeenCalledTimes(1);
      const firstCall = onConsoleLog.mock.calls[0];
      expect(firstCall).toBeDefined();
      expect(firstCall![0]).toBe("log");
      expect(firstCall![1]).toEqual(["Test"]);
    });

    it("should handle execution errors gracefully", async () => {
      vi.mocked(instrumenter.instrumentCode).mockReturnValue({
        code: "instrumented code",
      });

      vi.mocked(sandbox.executeSandboxedCode).mockRejectedValue(new Error("Execution timeout"));

      const result = await captureSteps({
        code: "while(true) {}",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Execution timeout");
      expect(result.steps).toEqual([]);
    });

    it("should pass timeout option to sandbox", async () => {
      vi.mocked(instrumenter.instrumentCode).mockReturnValue({
        code: "instrumented code",
      });

      vi.mocked(sandbox.executeSandboxedCode).mockResolvedValue({
        success: true,
        result: undefined,
        steps: [],
        executionTime: 100,
      });

      await captureSteps({
        code: "const x = 1;",
        timeout: 10000,
      });

      expect(sandbox.executeSandboxedCode).toHaveBeenCalledWith({
        code: "instrumented code",
        timeout: 10000,
        onMessage: expect.any(Function),
      });
    });
  });

  describe("captureStepsBatch", () => {
    it("should execute multiple code samples in parallel", async () => {
      vi.mocked(instrumenter.instrumentCode).mockReturnValue({
        code: "instrumented code",
      });

      vi.mocked(sandbox.executeSandboxedCode).mockResolvedValue({
        success: true,
        result: undefined,
        steps: [],
        executionTime: 50,
      });

      const results = await captureStepsBatch(["code1", "code2", "code3"]);

      expect(results).toHaveLength(3);
      expect(results.every((r) => r.success)).toBe(true);
      expect(instrumenter.instrumentCode).toHaveBeenCalledTimes(3);
      expect(sandbox.executeSandboxedCode).toHaveBeenCalledTimes(3);
    });

    it("should call indexed callbacks", async () => {
      vi.mocked(instrumenter.instrumentCode).mockReturnValue({
        code: "instrumented code",
      });

      let capturedMessageHandler: ((msg: any) => void) | undefined;
      vi.mocked(sandbox.executeSandboxedCode).mockImplementation(async (options) => {
        capturedMessageHandler = options.onMessage;

        if (capturedMessageHandler) {
          capturedMessageHandler({
            type: "capture-step",
            step: {
              operation: "push",
              target: "arr",
              args: [1],
              result: 1,
              timestamp: 1000,
            },
          });

          capturedMessageHandler({
            type: "console-log",
            level: "log",
            args: ["test"],
          });
        }

        return {
          success: true,
          result: undefined,
          steps: [],
          executionTime: 50,
        };
      });

      const onStepCaptured = vi.fn();
      const onConsoleLog = vi.fn();

      await captureStepsBatch(["code1", "code2"], {
        onStepCaptured,
        onConsoleLog,
      });

      // Each code sample triggers callbacks with its index
      expect(onStepCaptured).toHaveBeenCalledTimes(2);
      const stepCall0 = onStepCaptured.mock.calls[0];
      const stepCall1 = onStepCaptured.mock.calls[1];
      expect(stepCall0).toBeDefined();
      expect(stepCall1).toBeDefined();
      expect(stepCall0![0]).toBe(0);
      expect(stepCall0![1]).toMatchObject({ type: "push" });
      expect(stepCall1![0]).toBe(1);
      expect(stepCall1![1]).toMatchObject({ type: "push" });

      expect(onConsoleLog).toHaveBeenCalledTimes(2);
      const logCall0 = onConsoleLog.mock.calls[0];
      const logCall1 = onConsoleLog.mock.calls[1];
      expect(logCall0).toBeDefined();
      expect(logCall1).toBeDefined();
      expect(logCall0![0]).toBe(0);
      expect(logCall0![1]).toBe("log");
      expect(logCall0![2]).toEqual(["test"]);
      expect(logCall1![0]).toBe(1);
      expect(logCall1![1]).toBe("log");
      expect(logCall1![2]).toEqual(["test"]);
    });

    it("should handle mixed success and failure", async () => {
      vi.mocked(instrumenter.instrumentCode).mockReturnValue({
        code: "instrumented code",
      });

      vi.mocked(sandbox.executeSandboxedCode)
        .mockResolvedValueOnce({
          success: true,
          result: 1,
          steps: [],
          executionTime: 50,
        })
        .mockResolvedValueOnce({
          success: false,
          error: "Runtime error",
          steps: [],
          executionTime: 30,
        });

      const results = await captureStepsBatch(["code1", "code2"]);

      expect(results).toHaveLength(2);
      expect(results[0]!.success).toBe(true);
      expect(results[0]!.result).toBe(1);
      expect(results[1]!.success).toBe(false);
      expect(results[1]!.error).toBe("Runtime error");
    });
  });
});
