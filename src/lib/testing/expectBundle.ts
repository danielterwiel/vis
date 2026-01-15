/**
 * Expect bundler for sandbox testing
 *
 * Bundles Vitest's expect function into a string that can be injected
 * into the sandboxed iframe. This allows user code to be tested with
 * the same assertion library used in development.
 */

import { expect } from "vitest";

/**
 * Serializes the expect function and its matchers for sandbox use
 *
 * Note: This is a simplified approach. The expect function is already
 * available globally in Vitest, so we primarily need to inject assertion
 * code into the sandbox.
 *
 * @returns Stringified expect setup code
 */
export function bundleExpect(): string {
  // Since we can't serialize the actual expect function, we'll create
  // a minimal expect-like interface in the sandbox that mimics the API
  // This will be enhanced to support the actual Vitest expect in a future iteration
  return `
    // Minimal expect implementation for sandbox
    // This will be replaced with bundled Vitest expect in production
    function expect(actual) {
      return {
        toBe(expected) {
          if (actual !== expected) {
            throw new Error(\`Expected \${JSON.stringify(actual)} to be \${JSON.stringify(expected)}\`);
          }
        },
        toEqual(expected) {
          const actualStr = JSON.stringify(actual);
          const expectedStr = JSON.stringify(expected);
          if (actualStr !== expectedStr) {
            throw new Error(\`Expected \${actualStr} to equal \${expectedStr}\`);
          }
        },
        toStrictEqual(expected) {
          this.toEqual(expected);
        },
        toBeGreaterThan(expected) {
          if (actual <= expected) {
            throw new Error(\`Expected \${actual} to be greater than \${expected}\`);
          }
        },
        toBeGreaterThanOrEqual(expected) {
          if (actual < expected) {
            throw new Error(\`Expected \${actual} to be greater than or equal to \${expected}\`);
          }
        },
        toBeLessThanOrEqual(expected) {
          if (actual > expected) {
            throw new Error(\`Expected \${actual} to be less than or equal to \${expected}\`);
          }
        },
        toBeLessThan(expected) {
          if (actual >= expected) {
            throw new Error(\`Expected \${actual} to be less than \${expected}\`);
          }
        },
        toContain(item) {
          if (!actual.includes(item)) {
            throw new Error(\`Expected \${JSON.stringify(actual)} to contain \${JSON.stringify(item)}\`);
          }
        },
        toHaveLength(length) {
          if (actual.length !== length) {
            throw new Error(\`Expected length \${actual.length} to be \${length}\`);
          }
        },
        toBeTruthy() {
          if (!actual) {
            throw new Error(\`Expected \${JSON.stringify(actual)} to be truthy\`);
          }
        },
        toBeFalsy() {
          if (actual) {
            throw new Error(\`Expected \${JSON.stringify(actual)} to be falsy\`);
          }
        },
        toBeNull() {
          if (actual !== null) {
            throw new Error(\`Expected \${JSON.stringify(actual)} to be null\`);
          }
        },
        toBeUndefined() {
          if (actual !== undefined) {
            throw new Error(\`Expected \${JSON.stringify(actual)} to be undefined\`);
          }
        },
        toBeDefined() {
          if (actual === undefined) {
            throw new Error(\`Expected value to be defined\`);
          }
        },
        toBeInstanceOf(constructor) {
          if (!(actual instanceof constructor)) {
            throw new Error(\`Expected \${JSON.stringify(actual)} to be instance of \${constructor.name}\`);
          }
        },
        toThrow(errorMessage) {
          try {
            actual();
            throw new Error(\`Expected function to throw\`);
          } catch (error) {
            if (errorMessage && !error.message.includes(errorMessage)) {
              throw new Error(\`Expected error message to include "\${errorMessage}", got "\${error.message}"\`);
            }
          }
        },
        not: {
          toBe(expected) {
            if (actual === expected) {
              throw new Error(\`Expected \${JSON.stringify(actual)} not to be \${JSON.stringify(expected)}\`);
            }
          },
          toEqual(expected) {
            const actualStr = JSON.stringify(actual);
            const expectedStr = JSON.stringify(expected);
            if (actualStr === expectedStr) {
              throw new Error(\`Expected \${actualStr} not to equal \${expectedStr}\`);
            }
          },
          toContain(item) {
            if (actual.includes(item)) {
              throw new Error(\`Expected \${JSON.stringify(actual)} not to contain \${JSON.stringify(item)}\`);
            }
          },
          toBeTruthy() {
            if (actual) {
              throw new Error(\`Expected \${JSON.stringify(actual)} not to be truthy\`);
            }
          },
          toBeNull() {
            if (actual === null) {
              throw new Error(\`Expected \${JSON.stringify(actual)} not to be null\`);
            }
          }
        }
      };
    }
  `;
}

/**
 * Gets the expect function for use in tests
 * Re-exports Vitest's expect for consistency
 */
export { expect };
