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
  hasTwoPointers,
  hasPointerManipulation,
  hasDFS,
  hasBFS,
  hasDivideAndConquer,
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

    it("should detect partition() as regular function call", () => {
      // const pi = partition(arr, low, high);
      const ast = module([
        varDecl("pi", call(id("partition"), [id("arr"), id("low"), id("high")])),
      ]);
      expect(hasPartitionCalls(ast)).toBe(true);
    });
  });

  describe("hasTwoPointers", () => {
    it("should detect slow/fast pointer pattern in function", () => {
      // function detectCycle(head) { let slow = head; let fast = head; }
      const ast = module([
        funcDecl("detectCycle", block([varDecl("slow", id("head")), varDecl("fast", id("head"))])),
      ]);
      expect(hasTwoPointers(ast)).toBe(true);
    });

    it("should detect prev/curr pointer pattern", () => {
      // function reverseList(head) { let prev = null; let curr = head; }
      const ast = module([
        funcDecl(
          "reverseList",
          block([
            varDecl("prev", { type: "NullLiteral" as const, span }),
            varDecl("curr", id("head")),
          ]),
        ),
      ]);
      expect(hasTwoPointers(ast)).toBe(true);
    });

    it("should detect left/right pointer pattern in arrow function", () => {
      // const findMiddle = () => { let left = 0; let right = arr.length; }
      const ast = module([
        varDeclArrow(
          "findMiddle",
          block([
            varDecl("left", { type: "NumericLiteral", value: 0, span }),
            varDecl("right", member(id("arr"), "length")),
          ]),
        ),
      ]);
      expect(hasTwoPointers(ast)).toBe(true);
    });

    it("should detect p1/p2 pointer pattern", () => {
      // function compare() { let p1 = list1; let p2 = list2; }
      const ast = module([
        funcDecl("compare", block([varDecl("p1", id("list1")), varDecl("p2", id("list2"))])),
      ]);
      expect(hasTwoPointers(ast)).toBe(true);
    });

    it("should NOT detect single pointer variable", () => {
      // function traverse(head) { let slow = head; }
      const ast = module([funcDecl("traverse", block([varDecl("slow", id("head"))]))]);
      expect(hasTwoPointers(ast)).toBe(false);
    });

    it("should NOT detect unrelated variable names", () => {
      // function process() { let x = 1; let y = 2; }
      const ast = module([
        funcDecl(
          "process",
          block([
            varDecl("x", { type: "NumericLiteral", value: 1, span }),
            varDecl("y", { type: "NumericLiteral", value: 2, span }),
          ]),
        ),
      ]);
      expect(hasTwoPointers(ast)).toBe(false);
    });
  });

  describe("hasPointerManipulation", () => {
    it("should detect node.next = something assignment", () => {
      // node.next = newNode;
      const ast = module([
        exprStmt({
          type: "AssignmentExpression" as const,
          operator: "=",
          left: member(id("node"), "next"),
          right: id("newNode"),
          span,
        }),
      ]);
      expect(hasPointerManipulation(ast)).toBe(true);
    });

    it("should detect prev.next = curr.next pattern", () => {
      // prev.next = curr.next;
      const ast = module([
        exprStmt({
          type: "AssignmentExpression" as const,
          operator: "=",
          left: member(id("prev"), "next"),
          right: member(id("curr"), "next"),
          span,
        }),
      ]);
      expect(hasPointerManipulation(ast)).toBe(true);
    });

    it("should detect .next assignment inside while loop", () => {
      // while (curr) { curr.next = prev; }
      const ast = module([
        whileLoop(
          block([
            exprStmt({
              type: "AssignmentExpression" as const,
              operator: "=",
              left: member(id("curr"), "next"),
              right: id("prev"),
              span,
            }),
          ]),
        ),
      ]);
      expect(hasPointerManipulation(ast)).toBe(true);
    });

    it("should detect .next assignment inside function", () => {
      // function reverse(head) { node.next = null; }
      const ast = module([
        funcDecl(
          "reverse",
          block([
            exprStmt({
              type: "AssignmentExpression" as const,
              operator: "=",
              left: member(id("node"), "next"),
              right: { type: "NullLiteral" as const, span },
              span,
            }),
          ]),
        ),
      ]);
      expect(hasPointerManipulation(ast)).toBe(true);
    });

    it("should NOT detect reading .next property", () => {
      // const next = node.next;
      const ast = module([varDecl("next", member(id("node"), "next"))]);
      expect(hasPointerManipulation(ast)).toBe(false);
    });

    it("should NOT detect assignment to other properties", () => {
      // node.value = 5;
      const ast = module([
        exprStmt({
          type: "AssignmentExpression" as const,
          operator: "=",
          left: member(id("node"), "value"),
          right: { type: "NumericLiteral", value: 5, span },
          span,
        }),
      ]);
      expect(hasPointerManipulation(ast)).toBe(false);
    });
  });

  describe("hasDFS", () => {
    it("should detect recursive tree traversal with node.left", () => {
      // function traverse(node) { traverse(node.left); }
      const ast = module([
        funcDecl("traverse", block([exprStmt(call(id("traverse"), [member(id("node"), "left")]))])),
      ]);
      expect(hasDFS(ast)).toBe(true);
    });

    it("should detect recursive tree traversal with node.right", () => {
      // function traverse(node) { traverse(node.right); }
      const ast = module([
        funcDecl(
          "traverse",
          block([exprStmt(call(id("traverse"), [member(id("node"), "right")]))]),
        ),
      ]);
      expect(hasDFS(ast)).toBe(true);
    });

    it("should detect stack-based DFS pattern", () => {
      // const stack = []; stack.push(node); stack.pop();
      const ast = module([
        varDecl("stack", { type: "ArrayExpression" as const, elements: [], span }),
        exprStmt(call(member(id("stack"), "push"), [id("node")])),
        exprStmt(call(member(id("stack"), "pop"))),
      ]);
      expect(hasDFS(ast)).toBe(true);
    });

    it("should detect .dfs() method call", () => {
      // graph.dfs(startNode);
      const ast = module([exprStmt(call(member(id("graph"), "dfs"), [id("startNode")]))]);
      expect(hasDFS(ast)).toBe(true);
    });

    it("should detect depthFirstSearch() function call", () => {
      // depthFirstSearch(graph, start);
      const ast = module([exprStmt(call(id("depthFirstSearch"), [id("graph"), id("start")]))]);
      expect(hasDFS(ast)).toBe(true);
    });

    it("should NOT detect simple recursive function without tree traversal", () => {
      // function factorial(n) { return factorial(n - 1); }
      const ast = module([
        funcDecl(
          "factorial",
          block([
            returnStmt(
              call(id("factorial"), [
                {
                  type: "BinaryExpression" as const,
                  operator: "-",
                  left: id("n"),
                  right: { type: "NumericLiteral", value: 1, span },
                  span,
                },
              ]),
            ),
          ]),
        ),
      ]);
      expect(hasDFS(ast)).toBe(false);
    });

    it("should NOT detect queue-based traversal (BFS pattern)", () => {
      // const queue = []; queue.push(node); queue.shift();
      const ast = module([
        varDecl("queue", { type: "ArrayExpression" as const, elements: [], span }),
        exprStmt(call(member(id("queue"), "push"), [id("node")])),
        exprStmt(call(member(id("queue"), "shift"))),
      ]);
      expect(hasDFS(ast)).toBe(false);
    });
  });

  describe("hasBFS", () => {
    it("should detect queue-based BFS pattern with push/shift", () => {
      // const queue = []; queue.push(node); queue.shift();
      const ast = module([
        varDecl("queue", { type: "ArrayExpression" as const, elements: [], span }),
        exprStmt(call(member(id("queue"), "push"), [id("node")])),
        exprStmt(call(member(id("queue"), "shift"))),
      ]);
      expect(hasBFS(ast)).toBe(true);
    });

    it("should detect .bfs() method call", () => {
      // graph.bfs(startNode);
      const ast = module([exprStmt(call(member(id("graph"), "bfs"), [id("startNode")]))]);
      expect(hasBFS(ast)).toBe(true);
    });

    it("should detect breadthFirstSearch() function call", () => {
      // breadthFirstSearch(graph, start);
      const ast = module([exprStmt(call(id("breadthFirstSearch"), [id("graph"), id("start")]))]);
      expect(hasBFS(ast)).toBe(true);
    });

    it("should detect queue variable inside function", () => {
      // function levelOrder() { const queue = [root]; queue.push(node); queue.shift(); }
      const ast = module([
        funcDecl(
          "levelOrder",
          block([
            varDecl("queue", {
              type: "ArrayExpression" as const,
              elements: [{ expression: id("root") }],
              span,
            }),
            exprStmt(call(member(id("queue"), "push"), [id("node")])),
            exprStmt(call(member(id("queue"), "shift"))),
          ]),
        ),
      ]);
      expect(hasBFS(ast)).toBe(true);
    });

    it("should NOT detect stack-based traversal (DFS pattern)", () => {
      // const stack = []; stack.push(node); stack.pop();
      const ast = module([
        varDecl("stack", { type: "ArrayExpression" as const, elements: [], span }),
        exprStmt(call(member(id("stack"), "push"), [id("node")])),
        exprStmt(call(member(id("stack"), "pop"))),
      ]);
      expect(hasBFS(ast)).toBe(false);
    });

    it("should NOT detect array without queue variable name", () => {
      // const arr = []; arr.push(x); arr.shift();
      const ast = module([
        varDecl("arr", { type: "ArrayExpression" as const, elements: [], span }),
        exprStmt(call(member(id("arr"), "push"), [id("x")])),
        exprStmt(call(member(id("arr"), "shift"))),
      ]);
      expect(hasBFS(ast)).toBe(false);
    });
  });

  describe("hasDivideAndConquer", () => {
    it("should detect Math.floor division by 2", () => {
      // const mid = Math.floor((left + right) / 2);
      const ast = module([
        varDecl(
          "mid",
          call(member(id("Math"), "floor"), [
            {
              type: "BinaryExpression" as const,
              operator: "/",
              left: {
                type: "BinaryExpression" as const,
                operator: "+",
                left: id("left"),
                right: id("right"),
                span,
              },
              right: { type: "NumericLiteral", value: 2, span },
              span,
            },
          ]),
        ),
      ]);
      expect(hasDivideAndConquer(ast)).toBe(true);
    });

    it("should detect bitwise right shift by 1", () => {
      // const mid = (left + right) >> 1;
      const ast = module([
        varDecl("x", {
          type: "BinaryExpression" as const,
          operator: ">>",
          left: {
            type: "BinaryExpression" as const,
            operator: "+",
            left: id("left"),
            right: id("right"),
            span,
          },
          right: { type: "NumericLiteral", value: 1, span },
          span,
        }),
      ]);
      expect(hasDivideAndConquer(ast)).toBe(true);
    });

    it("should detect mid variable declaration", () => {
      // const mid = 5;
      const ast = module([varDecl("mid", { type: "NumericLiteral", value: 5, span })]);
      expect(hasDivideAndConquer(ast)).toBe(true);
    });

    it("should detect middle variable declaration", () => {
      // const middle = arr.length / 2;
      const ast = module([
        varDecl("middle", {
          type: "BinaryExpression" as const,
          operator: "/",
          left: member(id("arr"), "length"),
          right: { type: "NumericLiteral", value: 2, span },
          span,
        }),
      ]);
      expect(hasDivideAndConquer(ast)).toBe(true);
    });

    it("should detect divide-and-conquer in function", () => {
      // function binarySearch() { const mid = Math.floor(len / 2); }
      const ast = module([
        funcDecl(
          "binarySearch",
          block([
            varDecl(
              "mid",
              call(member(id("Math"), "floor"), [
                {
                  type: "BinaryExpression" as const,
                  operator: "/",
                  left: id("len"),
                  right: { type: "NumericLiteral", value: 2, span },
                  span,
                },
              ]),
            ),
          ]),
        ),
      ]);
      expect(hasDivideAndConquer(ast)).toBe(true);
    });

    it("should NOT detect simple division not by 2", () => {
      // const x = total / 3;
      const ast = module([
        varDecl("x", {
          type: "BinaryExpression" as const,
          operator: "/",
          left: id("total"),
          right: { type: "NumericLiteral", value: 3, span },
          span,
        }),
      ]);
      expect(hasDivideAndConquer(ast)).toBe(false);
    });

    it("should NOT detect unrelated bitwise operations", () => {
      // const x = y >> 2;
      const ast = module([
        varDecl("x", {
          type: "BinaryExpression" as const,
          operator: ">>",
          left: id("y"),
          right: { type: "NumericLiteral", value: 2, span },
          span,
        }),
      ]);
      expect(hasDivideAndConquer(ast)).toBe(false);
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
