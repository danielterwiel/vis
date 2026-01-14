/**
 * Step capture and visualization pipeline
 *
 * Orchestrates the flow from user code → instrumentation → sandbox execution → step capture → store updates
 */

import { instrumentCode } from "./instrumenter";
import { executeSandboxedCode, type SandboxExecutionResult } from "./sandbox";
import type { VisualizationStep } from "../../store/useAppStore";
import type { SandboxMessage } from "./messageValidation";

export interface StepCaptureOptions {
  code: string;
  timeout?: number;
  onStepCaptured?: (step: VisualizationStep) => void;
  onConsoleLog?: (level: string, args: any[]) => void;
}

export interface StepCaptureResult {
  success: boolean;
  steps: VisualizationStep[];
  result?: any;
  error?: string;
  executionTime: number;
  consoleLogs: Array<{ level: string; args: any[]; timestamp: number }>;
}

/**
 * Execute user code with step capture
 * Returns all captured steps plus execution result
 */
export async function captureSteps(options: StepCaptureOptions): Promise<StepCaptureResult> {
  const { code, timeout, onStepCaptured, onConsoleLog } = options;

  // Step 1: Instrument the code
  const instrumented = instrumentCode(code, {
    captureOperations: true,
    addErrorBoundaries: true,
  });

  if (instrumented.error) {
    return {
      success: false,
      steps: [],
      error: instrumented.error,
      executionTime: 0,
      consoleLogs: [],
    };
  }

  // Step 2: Collect steps and logs during execution
  const capturedSteps: VisualizationStep[] = [];
  const consoleLogs: Array<{ level: string; args: any[]; timestamp: number }> = [];

  const handleMessage = (message: SandboxMessage) => {
    if (message.type === "capture-step") {
      const step: VisualizationStep = {
        type: message.step.operation,
        target: message.step.target,
        args: message.step.args,
        result: message.step.result,
        timestamp: message.step.timestamp,
      };
      capturedSteps.push(step);

      // Call optional callback
      if (onStepCaptured) {
        onStepCaptured(step);
      }
    } else if (message.type === "console-log") {
      const log = {
        level: message.level,
        args: message.args,
        timestamp: Date.now(),
      };
      consoleLogs.push(log);

      // Call optional callback
      if (onConsoleLog) {
        onConsoleLog(message.level, message.args);
      }
    }
  };

  // Step 3: Execute in sandbox
  try {
    const executionResult: SandboxExecutionResult = await executeSandboxedCode({
      code: instrumented.code,
      timeout,
      onMessage: handleMessage,
    });

    // Step 4: Return complete result
    return {
      success: executionResult.success,
      steps: capturedSteps,
      result: executionResult.result,
      error: executionResult.error,
      executionTime: executionResult.executionTime,
      consoleLogs,
    };
  } catch (error) {
    return {
      success: false,
      steps: capturedSteps,
      error: error instanceof Error ? error.message : "Execution failed",
      executionTime: 0,
      consoleLogs,
    };
  }
}

/**
 * Execute multiple code samples with step capture (parallel)
 * Useful for running test suites
 */
export async function captureStepsBatch(
  codeSamples: string[],
  options?: {
    timeout?: number;
    onStepCaptured?: (index: number, step: VisualizationStep) => void;
    onConsoleLog?: (index: number, level: string, args: any[]) => void;
  },
): Promise<StepCaptureResult[]> {
  const promises = codeSamples.map((code, index) =>
    captureSteps({
      code,
      timeout: options?.timeout,
      onStepCaptured: options?.onStepCaptured
        ? (step) => options.onStepCaptured!(index, step)
        : undefined,
      onConsoleLog: options?.onConsoleLog
        ? (level, args) => options.onConsoleLog!(index, level, args)
        : undefined,
    }),
  );

  return Promise.all(promises);
}

/**
 * Validate that code can be instrumented without errors
 * Returns validation result without executing
 */
export function validateCodeForCapture(code: string): { valid: boolean; error?: string } {
  const instrumented = instrumentCode(code, {
    captureOperations: true,
    addErrorBoundaries: false, // Skip error boundaries for validation
  });

  if (instrumented.error) {
    return {
      valid: false,
      error: instrumented.error,
    };
  }

  return {
    valid: true,
  };
}
