/**
 * Timeout and infinite loop protection system
 *
 * Provides two-layer protection:
 * 1. Loop injection - throws error inside sandbox after N iterations (primary defense)
 * 2. External timeout - kills execution from outside after T milliseconds (failsafe)
 *
 * Loop injection is critical because if JavaScript thread is blocked,
 * setTimeout won't fire. We inject counter checks directly into loops.
 */

export interface TimeoutConfig {
  /** Maximum iterations before loop throws error (default: 100,000) */
  maxLoopIterations: number;

  /** Maximum recursion depth (default: 1,000) */
  maxRecursionDepth: number;

  /** External timeout in milliseconds (default: 5,000ms) */
  externalTimeoutMs: number;

  /** Enable loop injection (default: true) */
  enableLoopInjection: boolean;

  /** Enable recursion tracking (default: true) */
  enableRecursionTracking: boolean;
}

export const DEFAULT_TIMEOUT_CONFIG: TimeoutConfig = {
  maxLoopIterations: 100_000,
  maxRecursionDepth: 1_000,
  externalTimeoutMs: 5_000,
  enableLoopInjection: true,
  enableRecursionTracking: true,
};

/**
 * Creates a timeout error with context
 */
export class TimeoutError extends Error {
  public readonly timeoutType: "external" | "loop" | "recursion";
  public readonly elapsedMs?: number;
  public readonly iterations?: number;
  public readonly depth?: number;

  constructor(
    message: string,
    type: "external" | "loop" | "recursion",
    metadata?: { elapsedMs?: number; iterations?: number; depth?: number },
  ) {
    super(message);
    this.name = "TimeoutError";
    this.timeoutType = type;
    this.elapsedMs = metadata?.elapsedMs;
    this.iterations = metadata?.iterations;
    this.depth = metadata?.depth;
  }
}

/**
 * Creates an external timeout that can be cancelled
 */
export function createExternalTimeout(
  timeoutMs: number,
  onTimeout: (error: TimeoutError) => void,
): { cancel: () => void; id: number } {
  const id = window.setTimeout(() => {
    onTimeout(
      new TimeoutError(
        `Execution timeout after ${timeoutMs}ms - possible infinite loop or heavy computation`,
        "external",
        { elapsedMs: timeoutMs },
      ),
    );
  }, timeoutMs);

  return {
    id,
    cancel: () => clearTimeout(id),
  };
}

/**
 * Validates timeout configuration
 */
export function validateTimeoutConfig(config: Partial<TimeoutConfig>): TimeoutConfig {
  const validated: TimeoutConfig = {
    maxLoopIterations: config.maxLoopIterations ?? DEFAULT_TIMEOUT_CONFIG.maxLoopIterations,
    maxRecursionDepth: config.maxRecursionDepth ?? DEFAULT_TIMEOUT_CONFIG.maxRecursionDepth,
    externalTimeoutMs: config.externalTimeoutMs ?? DEFAULT_TIMEOUT_CONFIG.externalTimeoutMs,
    enableLoopInjection: config.enableLoopInjection ?? DEFAULT_TIMEOUT_CONFIG.enableLoopInjection,
    enableRecursionTracking:
      config.enableRecursionTracking ?? DEFAULT_TIMEOUT_CONFIG.enableRecursionTracking,
  };

  // Validate ranges
  if (validated.maxLoopIterations < 1 || validated.maxLoopIterations > 10_000_000) {
    throw new Error("maxLoopIterations must be between 1 and 10,000,000");
  }

  if (validated.maxRecursionDepth < 1 || validated.maxRecursionDepth > 10_000) {
    throw new Error("maxRecursionDepth must be between 1 and 10,000");
  }

  if (validated.externalTimeoutMs < 100 || validated.externalTimeoutMs > 60_000) {
    throw new Error("externalTimeoutMs must be between 100ms and 60,000ms (1 minute)");
  }

  return validated;
}

/**
 * Checks if an error is a timeout-related error
 */
export function isTimeoutError(error: unknown): error is TimeoutError {
  return error instanceof TimeoutError;
}

/**
 * Checks if an error message indicates an infinite loop
 */
export function isInfiniteLoopError(error: unknown): boolean {
  if (error instanceof TimeoutError) {
    return error.timeoutType === "loop" || error.timeoutType === "external";
  }

  if (error instanceof Error) {
    return (
      error.message.includes("Infinite loop detected") ||
      error.message.includes("Execution timeout") ||
      error.message.includes("Maximum call stack size exceeded")
    );
  }

  return false;
}

/**
 * Formats a timeout error for user display
 */
export function formatTimeoutError(error: TimeoutError): string {
  switch (error.timeoutType) {
    case "loop":
      return `Infinite loop detected after ${error.iterations?.toLocaleString() || "many"} iterations. Check your loop conditions.`;

    case "recursion":
      return `Maximum recursion depth (${error.depth?.toLocaleString()}) exceeded. Check for infinite recursion.`;

    case "external":
      return `Execution timed out after ${error.elapsedMs}ms. Your code may have an infinite loop or be too slow.`;

    default:
      return error.message;
  }
}

/**
 * Creates timeout configuration from options
 * Useful for components that need to pass config to instrumenter and sandbox
 */
export function createTimeoutConfig(overrides?: Partial<TimeoutConfig>): {
  instrumenterOptions: any;
  sandboxTimeout: number;
} {
  const config = validateTimeoutConfig(overrides || {});

  return {
    instrumenterOptions: {
      maxLoopIterations: config.maxLoopIterations,
      maxRecursionDepth: config.maxRecursionDepth,
      captureOperations: true,
      addErrorBoundaries: true,
    },
    sandboxTimeout: config.externalTimeoutMs,
  };
}
