/**
 * Sandboxed iframe execution system
 *
 * Executes user code in isolated iframe with:
 * - sandbox="allow-scripts" (no same-origin, forms, popups, navigation)
 * - srcdoc for inline code execution
 * - postMessage for secure communication
 * - Timeout protection (5s default)
 */

import {
  validateSandboxMessage,
  generateCorrelationId,
  type SandboxMessage,
} from "./messageValidation";

export interface SandboxExecutionOptions {
  code: string;
  timeout?: number; // milliseconds, default 5000
  onMessage?: (message: SandboxMessage) => void;
}

export interface SandboxExecutionResult {
  success: boolean;
  result?: any;
  error?: string;
  steps?: any[];
  executionTime: number;
}

/**
 * Execute user code in sandboxed iframe
 * Returns promise that resolves with execution result or rejects on timeout/error
 */
export async function executeSandboxedCode(
  options: SandboxExecutionOptions,
): Promise<SandboxExecutionResult> {
  const { code, timeout = 5000, onMessage } = options;
  const correlationId = generateCorrelationId();

  return new Promise((resolve, reject) => {
    const iframe = document.createElement("iframe");
    iframe.setAttribute("sandbox", "allow-scripts");
    iframe.style.display = "none";

    const startTime = Date.now();
    let timeoutId: number | undefined;
    let resolved = false;

    // Cleanup function
    const cleanup = () => {
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
      window.removeEventListener("message", messageHandler);
      iframe.remove();
    };

    // Message handler
    const messageHandler = (event: MessageEvent) => {
      // Validate message (defense-in-depth)
      const message = validateSandboxMessage(event, iframe.contentWindow);
      if (!message) {
        return; // Invalid message, ignore
      }

      // Check correlation ID if present
      if (message.correlationId && message.correlationId !== correlationId) {
        return; // Message from different execution
      }

      // Call optional message callback
      if (onMessage) {
        onMessage(message);
      }

      // Handle terminal messages
      if (message.type === "execution-complete") {
        if (!resolved) {
          resolved = true;
          cleanup();
          resolve({
            success: true,
            result: message.result,
            steps: message.steps,
            executionTime: Date.now() - startTime,
          });
        }
      } else if (message.type === "execution-error") {
        if (!resolved) {
          resolved = true;
          cleanup();
          resolve({
            success: false,
            error: message.error,
            executionTime: Date.now() - startTime,
          });
        }
      }
    };

    // Set up message listener
    window.addEventListener("message", messageHandler);

    // Set up timeout
    timeoutId = window.setTimeout(() => {
      if (!resolved) {
        resolved = true;
        cleanup();
        reject(new Error("Execution timeout - possible infinite loop"));
      }
    }, timeout);

    // Build sandbox HTML
    const sandboxCode = buildSandboxHTML(code, correlationId);
    iframe.srcdoc = sandboxCode;

    // Append to DOM (starts execution)
    document.body.appendChild(iframe);
  });
}

/**
 * Build HTML for sandboxed iframe
 */
function buildSandboxHTML(code: string, correlationId: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'">
</head>
<body>
<script>
(function() {
  'use strict';

  const correlationId = ${JSON.stringify(correlationId)};
  const steps = [];

  // Capture function for operation tracking
  // Can receive either individual args (operation, target, args, result, metadata)
  // or a single step object {type, target, args, result, metadata}
  window.__capture = function(operationOrStep, target, args, result, metadata) {
    let step;
    if (typeof operationOrStep === 'object' && operationOrStep !== null && 'type' in operationOrStep) {
      // Single object format (used by graph, hashmap bundles)
      step = {
        type: operationOrStep.type,
        operation: operationOrStep.type,
        target: String(operationOrStep.target),
        args: Array.from(operationOrStep.args || []),
        result: operationOrStep.result,
        timestamp: operationOrStep.timestamp || Date.now(),
        metadata: operationOrStep.metadata || {}
      };
    } else {
      // Individual args format (used by array, linkedlist, stack, queue, tree bundles)
      step = {
        type: operationOrStep,
        operation: operationOrStep,
        target: String(target),
        args: Array.from(args || []),
        result,
        timestamp: Date.now(),
        metadata: metadata || {}
      };
    }
    steps.push(step);

    // Send capture step message
    parent.postMessage({
      type: 'capture-step',
      correlationId,
      step
    }, '*');
  };

  // Intercept console methods
  ['log', 'warn', 'error', 'info'].forEach(function(level) {
    const original = console[level];
    console[level] = function(...args) {
      original.apply(console, args);
      parent.postMessage({
        type: 'console-log',
        correlationId,
        level: level,
        args: args.map(function(arg) {
          try {
            return JSON.parse(JSON.stringify(arg));
          } catch (e) {
            return String(arg);
          }
        })
      }, '*');
    };
  });

  // Execute user code
  try {
    const startTime = Date.now();

    // User code goes here
    ${code}

    const executionTime = Date.now() - startTime;

    // Send success message
    parent.postMessage({
      type: 'execution-complete',
      correlationId,
      result: typeof result !== 'undefined' ? result : null,
      steps,
      executionTime
    }, '*');

  } catch (error) {
    // Send error message
    parent.postMessage({
      type: 'execution-error',
      correlationId,
      error: error.message || String(error),
      stack: error.stack
    }, '*');
  }
})();
</script>
</body>
</html>
  `.trim();
}

/**
 * Execute multiple code samples in parallel
 * Useful for running test suites
 */
export async function executeSandboxedCodeBatch(
  codeSamples: string[],
  options?: { timeout?: number; onMessage?: (index: number, message: SandboxMessage) => void },
): Promise<SandboxExecutionResult[]> {
  const promises = codeSamples.map((code, index) =>
    executeSandboxedCode({
      code,
      timeout: options?.timeout,
      onMessage: options?.onMessage ? (message) => options.onMessage!(index, message) : undefined,
    }),
  );

  return Promise.all(promises);
}
