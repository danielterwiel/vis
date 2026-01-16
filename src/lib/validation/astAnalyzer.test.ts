import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Module, ParseOptions } from "@swc/wasm-web";
import type { PatternRequirement } from "./types";

// Helper to create a minimal span
const span = { start: 0, end: 0, ctxt: 0 };

// Helper to create an identifier
function id(name: string) {
  return { type: "Identifier" as const, value: name, optional: false, span };
}

// Helper to create a block statement
function block(stmts: unknown[]) {
  return { type: "BlockStatement" as const, stmts, span };
}

// Helper to create a for loop
function forLoop(body: unknown) {
  return {
    type: "ForStatement" as const,
    init: undefined,
    test: undefined,
    update: undefined,
    body,
    span,
  };
}

// Helper to create a while loop
function whileLoop(body: unknown) {
  return {
    type: "WhileStatement" as const,
    test: { type: "BooleanLiteral" as const, value: true, span },
    body,
    span,
  };
}

// Helper to create a do-while loop
function doWhileLoop(body: unknown) {
  return {
    type: "DoWhileStatement" as const,
    test: { type: "BooleanLiteral" as const, value: true, span },
    body,
    span,
  };
}

// Helper to create a function declaration
function funcDecl(name: string, body: unknown) {
  return {
    type: "FunctionDeclaration" as const,
    identifier: id(name),
    params: [],
    body,
    generator: false,
    async: false,
    declare: false,
    span,
  };
}

// Helper to create a variable declaration with arrow function
function varDeclArrow(name: string, body: unknown) {
  return {
    type: "VariableDeclaration" as const,
    kind: "const" as const,
    declarations: [
      {
        type: "VariableDeclarator" as const,
        id: id(name),
        init: {
          type: "ArrowFunctionExpression" as const,
          params: [],
          body,
          async: false,
          generator: false,
          span,
        },
        definite: false,
        span,
      },
    ],
    declare: false,
    span,
  };
}

// Helper to create a variable declaration with function expression
function varDeclFuncExpr(name: string, body: unknown) {
  return {
    type: "VariableDeclaration" as const,
    kind: "const" as const,
    declarations: [
      {
        type: "VariableDeclarator" as const,
        id: id(name),
        init: {
          type: "FunctionExpression" as const,
          params: [],
          body,
          generator: false,
          async: false,
          span,
        },
        definite: false,
        span,
      },
    ],
    declare: false,
    span,
  };
}

// Helper to create a call expression
function call(callee: unknown, args: unknown[] = []) {
  return {
    type: "CallExpression" as const,
    callee,
    arguments: args.map((a) => ({ expression: a })),
    span,
  };
}

// Helper to create a member expression (obj.prop)
function member(obj: unknown, prop: string) {
  return {
    type: "MemberExpression" as const,
    object: obj,
    property: id(prop),
    span,
  };
}

// Helper to create an expression statement
function exprStmt(expr: unknown) {
  return { type: "ExpressionStatement" as const, expression: expr, span };
}

// Helper to create a return statement
function returnStmt(argument: unknown) {
  return { type: "ReturnStatement" as const, argument, span };
}

// Helper to create a variable declaration
function varDecl(name: string, init?: unknown) {
  return {
    type: "VariableDeclaration" as const,
    kind: "const" as const,
    declarations: [
      {
        type: "VariableDeclarator" as const,
        id: id(name),
        init,
        definite: false,
        span,
      },
    ],
    declare: false,
    span,
  };
}

// Helper to create a module AST
function module(body: unknown[]): Module {
  return {
    type: "Module",
    body: body as Module["body"],
    interpreter: "",
    span,
  };
}

// Store for parseSync mock return values
let mockParseResult: Module | null = null;

// Mock parseSync from swcInitializer
vi.mock("../execution/swcInitializer", () => ({
  parseSync: vi.fn((_code: string, _options?: ParseOptions) => {
    return mockParseResult;
  }),
}));

// Import after mocking
import {
  parseCode,
  hasNestedLoops,
  hasSwapCalls,
  hasRecursion,
  hasPartitionCalls,
  validatePatterns,
} from "./astAnalyzer";

describe("astAnalyzer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockParseResult = null;
  });

  describe("parseCode", () => {
    it("should parse valid JavaScript code", () => {
      mockParseResult = module([varDecl("x", { type: "NumericLiteral", value: 1, span })]);
      const ast = parseCode("const x = 1;");
      expect(ast).not.toBeNull();
      expect(ast?.type).toBe("Module");
    });

    it("should return null for invalid code", () => {
      mockParseResult = null; // Simulate parse failure
      const ast = parseCode("const x = {{{");
      expect(ast).toBeNull();
    });

    it("should parse function declarations", () => {
      mockParseResult = module([
        funcDecl("foo", block([returnStmt({ type: "NumericLiteral", value: 1, span })])),
      ]);
      const ast = parseCode("function foo() { return 1; }");
      expect(ast).not.toBeNull();
    });
  });

  describe("hasNestedLoops", () => {
    it("should detect for loop inside for loop", () => {
      // for (...) { for (...) { } }
      const ast = module([forLoop(block([forLoop(block([]))]))]);
      expect(hasNestedLoops(ast)).toBe(true);
    });

    it("should detect while loop inside for loop", () => {
      // for (...) { while (...) { } }
      const ast = module([forLoop(block([whileLoop(block([]))]))]);
      expect(hasNestedLoops(ast)).toBe(true);
    });

    it("should detect for loop inside while loop", () => {
      // while (...) { for (...) { } }
      const ast = module([whileLoop(block([forLoop(block([]))]))]);
      expect(hasNestedLoops(ast)).toBe(true);
    });

    it("should detect do-while inside for loop", () => {
      // for (...) { do { } while (...) }
      const ast = module([forLoop(block([doWhileLoop(block([]))]))]);
      expect(hasNestedLoops(ast)).toBe(true);
    });

    it("should NOT detect single for loop", () => {
      // for (...) { console.log() }
      const ast = module([forLoop(block([exprStmt(call(id("console")))]))]);
      expect(hasNestedLoops(ast)).toBe(false);
    });

    it("should NOT detect single while loop", () => {
      // while (...) { doSomething() }
      const ast = module([whileLoop(block([exprStmt(call(id("doSomething")))]))]);
      expect(hasNestedLoops(ast)).toBe(false);
    });

    it("should NOT detect sequential (non-nested) loops", () => {
      // for (...) { } for (...) { }
      const ast = module([forLoop(block([])), forLoop(block([]))]);
      expect(hasNestedLoops(ast)).toBe(false);
    });

    it("should detect nested loops inside function declaration", () => {
      // function bubbleSort() { for (...) { for (...) { } } }
      const ast = module([funcDecl("bubbleSort", block([forLoop(block([forLoop(block([]))]))]))]);
      expect(hasNestedLoops(ast)).toBe(true);
    });

    it("should detect nested loops inside arrow function", () => {
      // const bubbleSort = () => { for (...) { for (...) { } } }
      const ast = module([
        varDeclArrow("bubbleSort", block([forLoop(block([forLoop(block([]))]))])),
      ]);
      expect(hasNestedLoops(ast)).toBe(true);
    });
  });

  describe("hasRecursion", () => {
    it("should detect direct recursion in function declaration", () => {
      // function factorial(n) { return factorial(n - 1); }
      const ast = module([funcDecl("factorial", block([returnStmt(call(id("factorial")))]))]);
      expect(hasRecursion(ast)).toBe(true);
    });

    it("should detect recursion in arrow function", () => {
      // const factorial = (n) => { return factorial(n - 1); }
      const ast = module([varDeclArrow("factorial", block([returnStmt(call(id("factorial")))]))]);
      expect(hasRecursion(ast)).toBe(true);
    });

    it("should detect recursion in const function expression", () => {
      // const factorial = function(n) { return factorial(n - 1); }
      const ast = module([
        varDeclFuncExpr("factorial", block([returnStmt(call(id("factorial")))])),
      ]);
      expect(hasRecursion(ast)).toBe(true);
    });

    it("should detect recursion in quicksort-like pattern", () => {
      // function quickSort() { quickSort(); quickSort(); }
      const ast = module([
        funcDecl(
          "quickSort",
          block([exprStmt(call(id("quickSort"))), exprStmt(call(id("quickSort")))]),
        ),
      ]);
      expect(hasRecursion(ast)).toBe(true);
    });

    it("should NOT detect non-recursive function", () => {
      // function add(a, b) { return a + b; }
      const ast = module([
        funcDecl(
          "add",
          block([
            returnStmt({
              type: "BinaryExpression",
              operator: "+",
              left: id("a"),
              right: id("b"),
              span,
            }),
          ]),
        ),
      ]);
      expect(hasRecursion(ast)).toBe(false);
    });

    it("should NOT detect calls to different functions", () => {
      // function foo() { bar(); }
      const ast = module([funcDecl("foo", block([exprStmt(call(id("bar")))]))]);
      expect(hasRecursion(ast)).toBe(false);
    });

    it("should detect recursion with conditional expression", () => {
      // function fib(n) { return n <= 1 ? n : fib(n-1) + fib(n-2); }
      const ast = module([
        funcDecl(
          "fib",
          block([
            returnStmt({
              type: "ConditionalExpression",
              test: {
                type: "BinaryExpression",
                operator: "<=",
                left: id("n"),
                right: { type: "NumericLiteral", value: 1, span },
                span,
              },
              consequent: id("n"),
              alternate: {
                type: "BinaryExpression",
                operator: "+",
                left: call(id("fib")),
                right: call(id("fib")),
                span,
              },
              span,
            }),
          ]),
        ),
      ]);
      expect(hasRecursion(ast)).toBe(true);
    });
  });

  describe("hasSwapCalls", () => {
    it("should detect arr.swap() call", () => {
      // arr.swap(i, j);
      const ast = module([exprStmt(call(member(id("arr"), "swap"), [id("i"), id("j")]))]);
      expect(hasSwapCalls(ast)).toBe(true);
    });

    it("should detect swap call inside for loop", () => {
      // for (...) { arr.swap(i, j); }
      const ast = module([forLoop(block([exprStmt(call(member(id("arr"), "swap")))]))]);
      expect(hasSwapCalls(ast)).toBe(true);
    });

    it("should detect swap call inside if statement", () => {
      // if (...) { arr.swap(i, j); }
      const ast = module([
        {
          type: "IfStatement" as const,
          test: { type: "BooleanLiteral", value: true, span },
          consequent: block([exprStmt(call(member(id("arr"), "swap")))]),
          alternate: undefined,
          span,
        },
      ]);
      expect(hasSwapCalls(ast)).toBe(true);
    });

    it("should detect swap call inside function", () => {
      // function bubbleSort() { arr.swap(i, j); }
      const ast = module([
        funcDecl("bubbleSort", block([exprStmt(call(member(id("arr"), "swap")))])),
      ]);
      expect(hasSwapCalls(ast)).toBe(true);
    });

    it("should NOT detect other method calls", () => {
      // arr.push(1); arr.pop(); arr.sort();
      const ast = module([
        exprStmt(call(member(id("arr"), "push"))),
        exprStmt(call(member(id("arr"), "pop"))),
        exprStmt(call(member(id("arr"), "sort"))),
      ]);
      expect(hasSwapCalls(ast)).toBe(false);
    });

    it("should NOT detect swap as variable name", () => {
      // const swap = 1; console.log(swap);
      const ast = module([
        varDecl("swap", { type: "NumericLiteral", value: 1, span }),
        exprStmt(call(member(id("console"), "log"), [id("swap")])),
      ]);
      expect(hasSwapCalls(ast)).toBe(false);
    });
  });

  describe("hasPartitionCalls", () => {
    it("should detect arr.partition() call", () => {
      // const pivotIndex = arr.partition(low, high);
      const ast = module([
        varDecl("pivotIndex", call(member(id("arr"), "partition"), [id("low"), id("high")])),
      ]);
      expect(hasPartitionCalls(ast)).toBe(true);
    });

    it("should detect partition call in quicksort", () => {
      // function quickSort() { arr.partition(); quickSort(); }
      const ast = module([
        funcDecl(
          "quickSort",
          block([exprStmt(call(member(id("arr"), "partition"))), exprStmt(call(id("quickSort")))]),
        ),
      ]);
      expect(hasPartitionCalls(ast)).toBe(true);
    });

    it("should detect partition call inside while loop", () => {
      // while (...) { arr.partition(); }
      const ast = module([whileLoop(block([exprStmt(call(member(id("arr"), "partition")))]))]);
      expect(hasPartitionCalls(ast)).toBe(true);
    });

    it("should NOT detect other method calls", () => {
      // arr.push(1); arr.slice(); arr.splice();
      const ast = module([
        exprStmt(call(member(id("arr"), "push"))),
        exprStmt(call(member(id("arr"), "slice"))),
        exprStmt(call(member(id("arr"), "splice"))),
      ]);
      expect(hasPartitionCalls(ast)).toBe(false);
    });

    it("should NOT detect partition as variable name", () => {
      // const partition = 5; console.log(partition);
      const ast = module([
        varDecl("partition", { type: "NumericLiteral", value: 5, span }),
        exprStmt(call(member(id("console"), "log"), [id("partition")])),
      ]);
      expect(hasPartitionCalls(ast)).toBe(false);
    });
  });

  describe("validatePatterns", () => {
    it("should return valid when code matches required pattern", () => {
      // Nested loops AST
      mockParseResult = module([forLoop(block([forLoop(block([]))]))]);
      const requirement: PatternRequirement = {
        anyOf: ["nestedLoops"],
        errorMessage: "Expected nested loops",
      };
      const result = validatePatterns("// code", requirement);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should return valid when code matches any of multiple patterns", () => {
      // arr.swap() AST
      mockParseResult = module([exprStmt(call(member(id("arr"), "swap")))]);
      const requirement: PatternRequirement = {
        anyOf: ["nestedLoops", "swapCalls"],
        errorMessage: "Expected nested loops or swap calls",
      };
      const result = validatePatterns("// code", requirement);
      expect(result.valid).toBe(true);
    });

    it("should return invalid with error message when no pattern matches", () => {
      // console.log() - no pattern matched
      mockParseResult = module([exprStmt(call(member(id("console"), "log")))]);
      const requirement: PatternRequirement = {
        anyOf: ["nestedLoops", "swapCalls"],
        errorMessage: "Expected bubble sort implementation with nested loops and swap calls",
      };
      const result = validatePatterns("// code", requirement);
      expect(result.valid).toBe(false);
      expect(result.error).toBe(
        "Expected bubble sort implementation with nested loops and swap calls",
      );
    });

    it("should return invalid for parse errors", () => {
      mockParseResult = null; // Simulate parse failure
      const requirement: PatternRequirement = {
        anyOf: ["nestedLoops"],
        errorMessage: "Expected nested loops",
      };
      const result = validatePatterns("const x = {{{", requirement);
      expect(result.valid).toBe(false);
      expect(result.error).toBe("Failed to parse code");
    });

    it("should validate recursion pattern", () => {
      // function factorial() { return factorial(); }
      mockParseResult = module([funcDecl("factorial", block([returnStmt(call(id("factorial")))]))]);
      const requirement: PatternRequirement = {
        anyOf: ["recursion"],
        errorMessage: "Expected recursive implementation",
      };
      const result = validatePatterns("// code", requirement);
      expect(result.valid).toBe(true);
    });

    it("should validate partition pattern for quicksort", () => {
      // function quickSort() { arr.partition(); quickSort(); }
      mockParseResult = module([
        funcDecl(
          "quickSort",
          block([exprStmt(call(member(id("arr"), "partition"))), exprStmt(call(id("quickSort")))]),
        ),
      ]);
      const requirement: PatternRequirement = {
        anyOf: ["recursion", "partitionCalls"],
        errorMessage: "Expected quicksort with recursion and partition",
      };
      const result = validatePatterns("// code", requirement);
      expect(result.valid).toBe(true);
    });

    it("should reject non-recursive sort for hard requirement", () => {
      // function sortArray() { arr.sort(); }
      mockParseResult = module([
        funcDecl("sortArray", block([exprStmt(call(member(id("arr"), "sort")))])),
      ]);
      const requirement: PatternRequirement = {
        anyOf: ["recursion", "partitionCalls"],
        errorMessage: "Expected quicksort with recursion and partition",
      };
      const result = validatePatterns("// code", requirement);
      expect(result.valid).toBe(false);
      expect(result.error).toBe("Expected quicksort with recursion and partition");
    });
  });
});
