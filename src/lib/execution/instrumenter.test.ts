import { describe, it, expect } from "vitest";
import {
  instrumentCode,
  extractFunctionName,
  isFunction,
  validateSyntax,
  type InstrumentationOptions,
} from "./instrumenter";

describe("instrumentCode", () => {
  it("should instrument while loops with counters", () => {
    const code = `
      let i = 0;
      while (i < 10) {
        i++;
      }
    `;

    const result = instrumentCode(code);

    expect(result.code).toContain("__loopCount_");
    expect(result.code).toContain("Infinite loop detected");
    expect(result.error).toBeUndefined();
  });

  it("should instrument for loops with counters", () => {
    const code = `
      for (let i = 0; i < 10; i++) {
        console.log(i);
      }
    `;

    const result = instrumentCode(code);

    expect(result.code).toContain("__loopCount_");
    expect(result.code).toContain("Infinite loop detected");
    expect(result.error).toBeUndefined();
  });

  it("should instrument do-while loops with counters", () => {
    const code = `
      let i = 0;
      do {
        i++;
      } while (i < 10);
    `;

    const result = instrumentCode(code);

    expect(result.code).toContain("__loopCount_");
    expect(result.code).toContain("Infinite loop detected");
    expect(result.error).toBeUndefined();
  });

  it("should add recursion depth tracking", () => {
    const code = `
      function factorial(n) {
        if (n <= 1) return 1;
        return n * factorial(n - 1);
      }
    `;

    const result = instrumentCode(code);

    expect(result.code).toContain("__recursionDepth");
    expect(result.code).toContain("Maximum recursion depth exceeded");
    expect(result.error).toBeUndefined();
  });

  it("should wrap code with error boundary by default", () => {
    const code = "const x = 42;";

    const result = instrumentCode(code);

    expect(result.code).toContain("try {");
    expect(result.code).toContain("} catch (error) {");
    expect(result.code).toContain("__reportError");
    expect(result.error).toBeUndefined();
  });

  it("should respect custom max loop iterations", () => {
    const code = `
      while (true) {
        break;
      }
    `;

    const options: InstrumentationOptions = {
      maxLoopIterations: 50000,
    };

    const result = instrumentCode(code, options);

    expect(result.code).toContain("50000");
    expect(result.error).toBeUndefined();
  });

  it("should respect custom max recursion depth", () => {
    const code = "function test() {}";

    const options: InstrumentationOptions = {
      maxRecursionDepth: 500,
    };

    const result = instrumentCode(code, options);

    expect(result.code).toContain("500");
    expect(result.error).toBeUndefined();
  });

  it("should skip operation capture when disabled", () => {
    const code = "const arr = [1, 2, 3]; arr.push(4);";

    const options: InstrumentationOptions = {
      captureOperations: false,
    };

    const result = instrumentCode(code, options);

    // Should not add extra capture logic (though basic instrumentation still occurs)
    expect(result.error).toBeUndefined();
  });

  it("should skip error boundary when disabled", () => {
    const code = "const x = 42;";

    const options: InstrumentationOptions = {
      addErrorBoundaries: false,
    };

    const result = instrumentCode(code, options);

    // Shouldn't wrap in try-catch at the top level
    expect(result.code).not.toMatch(/^try \{/);
    expect(result.error).toBeUndefined();
  });

  it("should handle multiple loops with unique counters", () => {
    const code = `
      while (a < 10) { a++; }
      for (let i = 0; i < 5; i++) {}
      while (b < 20) { b++; }
    `;

    const result = instrumentCode(code);

    expect(result.code).toContain("__loopCount_0");
    expect(result.code).toContain("__loopCount_1");
    expect(result.code).toContain("__loopCount_2");
    expect(result.error).toBeUndefined();
  });

  it("should handle nested loops", () => {
    const code = `
      for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
          console.log(i, j);
        }
      }
    `;

    const result = instrumentCode(code);

    expect(result.code).toContain("__loopCount_0");
    expect(result.code).toContain("__loopCount_1");
    expect(result.error).toBeUndefined();
  });

  it("should handle code with no loops", () => {
    const code = `
      function add(a, b) {
        return a + b;
      }
    `;

    const result = instrumentCode(code);

    // Should still add recursion tracking and error boundary
    expect(result.code).toContain("__recursionDepth");
    expect(result.code).toContain("try {");
    expect(result.error).toBeUndefined();
  });

  it("should return error for invalid syntax", () => {
    const code = "function broken(( {";

    const result = instrumentCode(code);

    expect(result.code).toBe("");
    expect(result.error).toBeDefined();
    expect(typeof result.error).toBe("string");
  });

  it("should handle arrow functions", () => {
    const code = "const double = (x) => x * 2;";

    const result = instrumentCode(code);

    expect(result.code).toContain("__recursionDepth");
    expect(result.error).toBeUndefined();
  });

  it("should handle class methods", () => {
    const code = `
      class Counter {
        increment() {
          this.value++;
        }
      }
    `;

    const result = instrumentCode(code);

    expect(result.code).toContain("__recursionDepth");
    expect(result.error).toBeUndefined();
  });
});

describe("extractFunctionName", () => {
  it("should extract function declaration name", () => {
    const code = "function myFunction() { return 42; }";
    expect(extractFunctionName(code)).toBe("myFunction");
  });

  it("should extract const arrow function name", () => {
    const code = "const myFunc = () => 42;";
    expect(extractFunctionName(code)).toBe("myFunc");
  });

  it("should extract let arrow function name", () => {
    const code = "let myFunc = (x) => x * 2;";
    expect(extractFunctionName(code)).toBe("myFunc");
  });

  it("should extract var function name", () => {
    const code = "var myFunc = function() { return 1; };";
    expect(extractFunctionName(code)).toBe("myFunc");
  });

  it("should extract class method name", () => {
    const code = "myMethod() { return this.value; }";
    expect(extractFunctionName(code)).toBe("myMethod");
  });

  it("should return null for non-function code", () => {
    const code = "const x = 42;";
    expect(extractFunctionName(code)).toBeNull();
  });

  it("should return null for empty string", () => {
    expect(extractFunctionName("")).toBeNull();
  });
});

describe("isFunction", () => {
  it("should detect function declarations", () => {
    expect(isFunction("function test() {}")).toBe(true);
  });

  it("should detect const arrow functions", () => {
    expect(isFunction("const test = () => {}")).toBe(true);
  });

  it("should detect let arrow functions", () => {
    expect(isFunction("let test = () => {}")).toBe(true);
  });

  it("should detect var functions", () => {
    expect(isFunction("var test = function() {}")).toBe(true);
  });

  it("should detect shorthand arrow functions", () => {
    expect(isFunction("const test = (x) => x * 2")).toBe(true);
  });

  it("should detect method shorthand", () => {
    expect(isFunction("myMethod() { return 42; }")).toBe(true);
  });

  it("should return false for non-function code", () => {
    expect(isFunction("const x = 42;")).toBe(false);
  });

  it("should return false for empty string", () => {
    expect(isFunction("")).toBe(false);
  });
});

describe("validateSyntax", () => {
  it("should validate correct syntax", () => {
    const code = "const x = 42; console.log(x);";
    const result = validateSyntax(code);

    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("should detect syntax errors", () => {
    const code = "const x = ;";
    const result = validateSyntax(code);

    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("should validate complex code", () => {
    const code = `
      class MyClass {
        constructor(value) {
          this.value = value;
        }

        getValue() {
          return this.value;
        }
      }

      const instance = new MyClass(42);
    `;
    const result = validateSyntax(code);

    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("should detect unclosed braces", () => {
    const code = 'function test() { console.log("test");';
    const result = validateSyntax(code);

    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("should validate empty code", () => {
    const code = "";
    const result = validateSyntax(code);

    expect(result.valid).toBe(true);
  });
});
