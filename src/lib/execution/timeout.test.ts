import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  TimeoutError,
  createExternalTimeout,
  validateTimeoutConfig,
  isTimeoutError,
  isInfiniteLoopError,
  formatTimeoutError,
  createTimeoutConfig,
  DEFAULT_TIMEOUT_CONFIG,
} from "./timeout";

describe("timeout", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("TimeoutError", () => {
    it("should create error with correct type and message", () => {
      const error = new TimeoutError("Test timeout", "external", { elapsedMs: 5000 });

      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe("TimeoutError");
      expect(error.message).toBe("Test timeout");
      expect(error.timeoutType).toBe("external");
      expect(error.elapsedMs).toBe(5000);
    });

    it("should create loop timeout error with iterations", () => {
      const error = new TimeoutError("Loop timeout", "loop", { iterations: 100000 });

      expect(error.timeoutType).toBe("loop");
      expect(error.iterations).toBe(100000);
      expect(error.elapsedMs).toBeUndefined();
    });

    it("should create recursion timeout error with depth", () => {
      const error = new TimeoutError("Recursion timeout", "recursion", { depth: 1000 });

      expect(error.timeoutType).toBe("recursion");
      expect(error.depth).toBe(1000);
    });
  });

  describe("createExternalTimeout", () => {
    it("should call onTimeout after specified time", () => {
      const onTimeout = vi.fn();

      createExternalTimeout(5000, onTimeout);

      expect(onTimeout).not.toHaveBeenCalled();

      vi.advanceTimersByTime(5000);

      expect(onTimeout).toHaveBeenCalledTimes(1);
      expect(onTimeout).toHaveBeenCalledWith(expect.any(TimeoutError));
    });

    it("should pass TimeoutError with correct metadata", () => {
      const onTimeout = vi.fn();

      createExternalTimeout(3000, onTimeout);
      vi.advanceTimersByTime(3000);

      const error = onTimeout.mock.calls[0]?.[0];
      expect(error).toBeDefined();
      expect(error?.timeoutType).toBe("external");
      expect(error?.elapsedMs).toBe(3000);
    });

    it("should not call onTimeout if cancelled", () => {
      const onTimeout = vi.fn();

      const timeout = createExternalTimeout(5000, onTimeout);

      vi.advanceTimersByTime(2000);
      timeout.cancel();

      vi.advanceTimersByTime(5000); // Advance past original timeout

      expect(onTimeout).not.toHaveBeenCalled();
    });

    it("should return timeout ID", () => {
      const onTimeout = vi.fn();

      const timeout = createExternalTimeout(1000, onTimeout);

      // In Vitest fake timers, timeout IDs may be objects or numbers
      expect(timeout.id).toBeDefined();
      expect(timeout.cancel).toBeInstanceOf(Function);
    });
  });

  describe("validateTimeoutConfig", () => {
    it("should return default config when given empty object", () => {
      const config = validateTimeoutConfig({});

      expect(config).toEqual(DEFAULT_TIMEOUT_CONFIG);
    });

    it("should merge partial config with defaults", () => {
      const config = validateTimeoutConfig({
        maxLoopIterations: 50000,
      });

      expect(config.maxLoopIterations).toBe(50000);
      expect(config.maxRecursionDepth).toBe(DEFAULT_TIMEOUT_CONFIG.maxRecursionDepth);
      expect(config.externalTimeoutMs).toBe(DEFAULT_TIMEOUT_CONFIG.externalTimeoutMs);
    });

    it("should accept all valid custom values", () => {
      const config = validateTimeoutConfig({
        maxLoopIterations: 200000,
        maxRecursionDepth: 500,
        externalTimeoutMs: 10000,
        enableLoopInjection: false,
        enableRecursionTracking: false,
      });

      expect(config.maxLoopIterations).toBe(200000);
      expect(config.maxRecursionDepth).toBe(500);
      expect(config.externalTimeoutMs).toBe(10000);
      expect(config.enableLoopInjection).toBe(false);
      expect(config.enableRecursionTracking).toBe(false);
    });

    it("should throw if maxLoopIterations is too low", () => {
      expect(() => validateTimeoutConfig({ maxLoopIterations: 0 })).toThrow(
        "maxLoopIterations must be between 1 and 10,000,000",
      );
    });

    it("should throw if maxLoopIterations is too high", () => {
      expect(() => validateTimeoutConfig({ maxLoopIterations: 20_000_000 })).toThrow(
        "maxLoopIterations must be between 1 and 10,000,000",
      );
    });

    it("should throw if maxRecursionDepth is too low", () => {
      expect(() => validateTimeoutConfig({ maxRecursionDepth: 0 })).toThrow(
        "maxRecursionDepth must be between 1 and 10,000",
      );
    });

    it("should throw if maxRecursionDepth is too high", () => {
      expect(() => validateTimeoutConfig({ maxRecursionDepth: 20_000 })).toThrow(
        "maxRecursionDepth must be between 1 and 10,000",
      );
    });

    it("should throw if externalTimeoutMs is too low", () => {
      expect(() => validateTimeoutConfig({ externalTimeoutMs: 50 })).toThrow(
        "externalTimeoutMs must be between 100ms and 60,000ms",
      );
    });

    it("should throw if externalTimeoutMs is too high", () => {
      expect(() => validateTimeoutConfig({ externalTimeoutMs: 90_000 })).toThrow(
        "externalTimeoutMs must be between 100ms and 60,000ms",
      );
    });
  });

  describe("isTimeoutError", () => {
    it("should return true for TimeoutError instances", () => {
      const error = new TimeoutError("Test", "external");

      expect(isTimeoutError(error)).toBe(true);
    });

    it("should return false for regular Error", () => {
      const error = new Error("Test");

      expect(isTimeoutError(error)).toBe(false);
    });

    it("should return false for non-error values", () => {
      expect(isTimeoutError("error")).toBe(false);
      expect(isTimeoutError(null)).toBe(false);
      expect(isTimeoutError(undefined)).toBe(false);
      expect(isTimeoutError(42)).toBe(false);
    });
  });

  describe("isInfiniteLoopError", () => {
    it("should return true for loop TimeoutError", () => {
      const error = new TimeoutError("Test", "loop");

      expect(isInfiniteLoopError(error)).toBe(true);
    });

    it("should return true for external TimeoutError", () => {
      const error = new TimeoutError("Test", "external");

      expect(isInfiniteLoopError(error)).toBe(true);
    });

    it("should return false for recursion TimeoutError", () => {
      const error = new TimeoutError("Test", "recursion");

      expect(isInfiniteLoopError(error)).toBe(false);
    });

    it("should return true for Error with infinite loop message", () => {
      const error = new Error("Infinite loop detected");

      expect(isInfiniteLoopError(error)).toBe(true);
    });

    it("should return true for Error with timeout message", () => {
      const error = new Error("Execution timeout");

      expect(isInfiniteLoopError(error)).toBe(true);
    });

    it("should return true for Error with call stack message", () => {
      const error = new Error("Maximum call stack size exceeded");

      expect(isInfiniteLoopError(error)).toBe(true);
    });

    it("should return false for regular errors", () => {
      const error = new Error("Regular error");

      expect(isInfiniteLoopError(error)).toBe(false);
    });
  });

  describe("formatTimeoutError", () => {
    it("should format loop timeout error", () => {
      const error = new TimeoutError("Test", "loop", { iterations: 100000 });

      const formatted = formatTimeoutError(error);

      expect(formatted).toContain("Infinite loop detected");
      expect(formatted).toContain("100,000");
      expect(formatted).toContain("Check your loop conditions");
    });

    it("should format loop timeout without iterations", () => {
      const error = new TimeoutError("Test", "loop");

      const formatted = formatTimeoutError(error);

      expect(formatted).toContain("Infinite loop detected");
      expect(formatted).toContain("many");
    });

    it("should format recursion timeout error", () => {
      const error = new TimeoutError("Test", "recursion", { depth: 1000 });

      const formatted = formatTimeoutError(error);

      expect(formatted).toContain("Maximum recursion depth");
      expect(formatted).toContain("1,000");
      expect(formatted).toContain("infinite recursion");
    });

    it("should format external timeout error", () => {
      const error = new TimeoutError("Test", "external", { elapsedMs: 5000 });

      const formatted = formatTimeoutError(error);

      expect(formatted).toContain("Execution timed out");
      expect(formatted).toContain("5000ms");
      expect(formatted).toContain("infinite loop or be too slow");
    });
  });

  describe("createTimeoutConfig", () => {
    it("should create config with default values", () => {
      const config = createTimeoutConfig();

      expect(config.instrumenterOptions.maxLoopIterations).toBe(100_000);
      expect(config.instrumenterOptions.maxRecursionDepth).toBe(1_000);
      expect(config.instrumenterOptions.captureOperations).toBe(true);
      expect(config.instrumenterOptions.addErrorBoundaries).toBe(true);
      expect(config.sandboxTimeout).toBe(5_000);
    });

    it("should create config with custom values", () => {
      const config = createTimeoutConfig({
        maxLoopIterations: 50000,
        maxRecursionDepth: 500,
        externalTimeoutMs: 3000,
      });

      expect(config.instrumenterOptions.maxLoopIterations).toBe(50000);
      expect(config.instrumenterOptions.maxRecursionDepth).toBe(500);
      expect(config.sandboxTimeout).toBe(3000);
    });

    it("should always enable capture and error boundaries", () => {
      const config = createTimeoutConfig({
        enableLoopInjection: false,
        enableRecursionTracking: false,
      });

      expect(config.instrumenterOptions.captureOperations).toBe(true);
      expect(config.instrumenterOptions.addErrorBoundaries).toBe(true);
    });
  });
});
