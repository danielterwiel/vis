/**
 * Defense-in-depth postMessage validation
 *
 * CRITICAL: Sandboxed iframes have null origin, so origin checks alone are insufficient.
 * We use a multi-layer validation approach:
 * 1. Structure validation (object with type field)
 * 2. Type whitelist (only allowed message types)
 * 3. Schema validation (correct structure for each type)
 * 4. Source check (message from expected iframe)
 */

export type SandboxMessageType =
  | "execution-complete"
  | "execution-error"
  | "test-result"
  | "capture-step"
  | "console-log";

export interface BaseSandboxMessage {
  type: SandboxMessageType;
  correlationId?: string; // For matching request/response pairs
}

export interface ExecutionCompleteMessage extends BaseSandboxMessage {
  type: "execution-complete";
  result: any;
  steps: any[];
  executionTime: number;
}

export interface ExecutionErrorMessage extends BaseSandboxMessage {
  type: "execution-error";
  error: string;
  stack?: string;
}

export interface TestResultMessage extends BaseSandboxMessage {
  type: "test-result";
  testId: string;
  passed: boolean;
  error?: string;
  executionTime: number;
  steps: any[];
}

export interface CaptureStepMessage extends BaseSandboxMessage {
  type: "capture-step";
  step: {
    operation: string;
    target: string;
    args: any[];
    result: any;
    timestamp: number;
    metadata?: Record<string, any>;
  };
}

export interface ConsoleLogMessage extends BaseSandboxMessage {
  type: "console-log";
  level: "log" | "warn" | "error" | "info";
  args: any[];
}

export type SandboxMessage =
  | ExecutionCompleteMessage
  | ExecutionErrorMessage
  | TestResultMessage
  | CaptureStepMessage
  | ConsoleLogMessage;

const ALLOWED_MESSAGE_TYPES = new Set<SandboxMessageType>([
  "execution-complete",
  "execution-error",
  "test-result",
  "capture-step",
  "console-log",
]);

/**
 * Validate message structure (Layer 1 & 2)
 */
function isValidMessageStructure(data: any): data is BaseSandboxMessage {
  return (
    data !== null &&
    typeof data === "object" &&
    typeof data.type === "string" &&
    ALLOWED_MESSAGE_TYPES.has(data.type)
  );
}

/**
 * Validate schema for each message type (Layer 3)
 */
function validateMessageSchema(message: BaseSandboxMessage): message is SandboxMessage {
  switch (message.type) {
    case "execution-complete":
      return (
        "result" in message &&
        Array.isArray((message as any).steps) &&
        typeof (message as any).executionTime === "number"
      );

    case "execution-error":
      return typeof (message as any).error === "string";

    case "test-result":
      return (
        typeof (message as any).testId === "string" &&
        typeof (message as any).passed === "boolean" &&
        typeof (message as any).executionTime === "number" &&
        Array.isArray((message as any).steps)
      );

    case "capture-step":
      return (
        "step" in message &&
        typeof (message as any).step === "object" &&
        typeof (message as any).step.operation === "string"
      );

    case "console-log":
      return typeof (message as any).level === "string" && Array.isArray((message as any).args);

    default:
      return false;
  }
}

/**
 * Validate incoming postMessage (all layers)
 * Returns validated message or null if invalid
 */
export function validateSandboxMessage(
  event: MessageEvent,
  expectedSource?: Window | null,
): SandboxMessage | null {
  // Layer 1 & 2: Structure validation + type whitelist
  if (!isValidMessageStructure(event.data)) {
    return null;
  }

  // Layer 3: Schema validation
  if (!validateMessageSchema(event.data)) {
    return null;
  }

  // Layer 4: Source check (if expected source provided)
  if (expectedSource && event.source !== expectedSource) {
    return null;
  }

  return event.data as SandboxMessage;
}

/**
 * Generate unique correlation ID for request/response matching
 */
export function generateCorrelationId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
