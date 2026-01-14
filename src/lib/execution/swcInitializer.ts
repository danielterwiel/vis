/**
 * SWC WASM initialization module
 * Must be called once before code transformation
 */

import initSwc, { transformSync } from "@swc/wasm-web";

let swcInitialized = false;
let initPromise: Promise<void> | null = null;

/**
 * Initialize SWC WASM module
 * Call once on app mount before any code transformation
 * Subsequent calls return the same promise
 */
export async function initializeSWC(): Promise<void> {
  if (swcInitialized) {
    return;
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    try {
      await initSwc();
      swcInitialized = true;
    } catch (error) {
      initPromise = null; // Allow retry on failure
      throw new Error(
        `Failed to initialize SWC: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  })();

  return initPromise;
}

/**
 * Check if SWC has been initialized
 */
export function isSWCInitialized(): boolean {
  return swcInitialized;
}

/**
 * Transform JavaScript code using SWC
 * Throws if SWC not initialized - call initializeSWC() first
 */
export function transformCode(code: string, options?: any): string {
  if (!swcInitialized) {
    throw new Error("SWC not initialized. Call initializeSWC() first.");
  }

  const result = transformSync(code, {
    jsc: {
      parser: {
        syntax: "ecmascript",
        jsx: false,
      },
      target: "es2022",
      ...options?.jsc,
    },
    ...options,
  });

  return result.code;
}
