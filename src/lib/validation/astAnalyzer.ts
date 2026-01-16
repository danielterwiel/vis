/**
 * AST-based code analyzer for pattern detection.
 * Uses SWC to parse code and detect algorithmic patterns.
 */

import type {
  Module,
  Script,
  Statement,
  Expression,
  ForStatement,
  WhileStatement,
  DoWhileStatement,
} from "@swc/wasm-web";
import { parseSync } from "../execution/swcInitializer";
import type { PatternRequirement, ValidationResult } from "./types";

type Program = Module | Script;
type LoopStatement = ForStatement | WhileStatement | DoWhileStatement;

/**
 * Parse code string into an AST using SWC.
 * Returns null if parsing fails.
 */
export function parseCode(code: string): Program | null {
  try {
    return parseSync(code, {
      syntax: "ecmascript",
      target: "es2022",
    });
  } catch {
    return null;
  }
}

/**
 * Check if a statement is a loop (for, while, do-while).
 */
function isLoop(stmt: Statement): stmt is LoopStatement {
  return (
    stmt.type === "ForStatement" ||
    stmt.type === "WhileStatement" ||
    stmt.type === "DoWhileStatement" ||
    stmt.type === "ForInStatement" ||
    stmt.type === "ForOfStatement"
  );
}

/**
 * Recursively check if a statement contains a loop.
 */
function containsLoop(stmt: Statement): boolean {
  if (isLoop(stmt)) {
    return true;
  }

  if (stmt.type === "BlockStatement") {
    return stmt.stmts.some(containsLoop);
  }

  if (stmt.type === "IfStatement") {
    if (containsLoop(stmt.consequent)) return true;
    if (stmt.alternate && containsLoop(stmt.alternate)) return true;
  }

  if (stmt.type === "LabeledStatement") {
    return containsLoop(stmt.body);
  }

  if (stmt.type === "TryStatement") {
    if (containsLoop(stmt.block)) return true;
    if (stmt.handler && containsLoop(stmt.handler.body)) return true;
    if (stmt.finalizer && containsLoop(stmt.finalizer)) return true;
  }

  if (stmt.type === "SwitchStatement") {
    return stmt.cases.some((c) => c.consequent.some(containsLoop));
  }

  return false;
}

/**
 * Get the body of a loop statement.
 */
function getLoopBody(loop: LoopStatement): Statement {
  return loop.body;
}

/**
 * Detect nested loops (for/while inside for/while).
 */
export function hasNestedLoops(ast: Program): boolean {
  const body = ast.type === "Module" ? ast.body : ast.body;

  function checkStatements(stmts: Statement[]): boolean {
    for (const stmt of stmts) {
      if (isLoop(stmt)) {
        const loopBody = getLoopBody(stmt);
        if (containsLoop(loopBody)) {
          return true;
        }
      }

      // Recurse into blocks
      if (stmt.type === "BlockStatement") {
        if (checkStatements(stmt.stmts)) return true;
      }

      // Check function declarations
      if (stmt.type === "FunctionDeclaration" && stmt.body) {
        if (checkStatements(stmt.body.stmts)) return true;
      }

      // Check variable declarations with arrow functions or function expressions
      if (stmt.type === "VariableDeclaration") {
        for (const decl of stmt.declarations) {
          if (decl.init) {
            if (checkExpression(decl.init)) return true;
          }
        }
      }

      // Check expression statements (for IIFEs, etc.)
      if (stmt.type === "ExpressionStatement") {
        if (checkExpression(stmt.expression)) return true;
      }
    }
    return false;
  }

  function checkExpression(expr: Expression): boolean {
    if (expr.type === "ArrowFunctionExpression") {
      if (expr.body.type === "BlockStatement") {
        return checkStatements(expr.body.stmts);
      }
    }
    if (expr.type === "FunctionExpression" && expr.body) {
      return checkStatements(expr.body.stmts);
    }
    return false;
  }

  // Filter to only statements (Module can have ModuleItems which include declarations)
  const statements = body.filter(
    (item): item is Statement => !("source" in item && item.type.includes("Export")),
  ) as Statement[];

  return checkStatements(statements);
}

/**
 * Detect .swap() method calls.
 */
export function hasSwapCalls(ast: Program): boolean {
  const body = ast.type === "Module" ? ast.body : ast.body;

  function checkExpression(expr: Expression): boolean {
    if (expr.type === "CallExpression") {
      const callee = expr.callee;
      if (
        callee.type === "MemberExpression" &&
        callee.property.type === "Identifier" &&
        callee.property.value === "swap"
      ) {
        return true;
      }
      // Check arguments
      for (const arg of expr.arguments) {
        if (checkExpression(arg.expression)) return true;
      }
    }

    if (expr.type === "MemberExpression") {
      if (checkExpression(expr.object)) return true;
    }

    if (expr.type === "ArrowFunctionExpression") {
      if (expr.body.type === "BlockStatement") {
        return checkStatements(expr.body.stmts);
      } else {
        return checkExpression(expr.body);
      }
    }

    if (expr.type === "FunctionExpression" && expr.body) {
      return checkStatements(expr.body.stmts);
    }

    if (expr.type === "BinaryExpression") {
      return checkExpression(expr.left) || checkExpression(expr.right);
    }

    if (expr.type === "ConditionalExpression") {
      return (
        checkExpression(expr.test) ||
        checkExpression(expr.consequent) ||
        checkExpression(expr.alternate)
      );
    }

    if (expr.type === "SequenceExpression") {
      return expr.expressions.some(checkExpression);
    }

    if (expr.type === "AssignmentExpression") {
      return checkExpression(expr.right);
    }

    return false;
  }

  function checkStatements(stmts: Statement[]): boolean {
    for (const stmt of stmts) {
      if (stmt.type === "ExpressionStatement") {
        if (checkExpression(stmt.expression)) return true;
      }

      if (stmt.type === "VariableDeclaration") {
        for (const decl of stmt.declarations) {
          if (decl.init && checkExpression(decl.init)) return true;
        }
      }

      if (stmt.type === "ReturnStatement" && stmt.argument) {
        if (checkExpression(stmt.argument)) return true;
      }

      if (stmt.type === "BlockStatement") {
        if (checkStatements(stmt.stmts)) return true;
      }

      if (stmt.type === "IfStatement") {
        if (checkExpression(stmt.test)) return true;
        if (checkStatements([stmt.consequent])) return true;
        if (stmt.alternate && checkStatements([stmt.alternate])) return true;
      }

      if (stmt.type === "ForStatement") {
        if (stmt.init && stmt.init.type !== "VariableDeclaration" && checkExpression(stmt.init))
          return true;
        if (stmt.test && checkExpression(stmt.test)) return true;
        if (stmt.update && checkExpression(stmt.update)) return true;
        if (checkStatements([stmt.body])) return true;
      }

      if (stmt.type === "WhileStatement" || stmt.type === "DoWhileStatement") {
        if (checkExpression(stmt.test)) return true;
        if (checkStatements([stmt.body])) return true;
      }

      if (stmt.type === "FunctionDeclaration" && stmt.body) {
        if (checkStatements(stmt.body.stmts)) return true;
      }

      if (stmt.type === "TryStatement") {
        if (checkStatements(stmt.block.stmts)) return true;
        if (stmt.handler && checkStatements(stmt.handler.body.stmts)) return true;
        if (stmt.finalizer && checkStatements(stmt.finalizer.stmts)) return true;
      }
    }
    return false;
  }

  const statements = body.filter(
    (item): item is Statement => !("source" in item && item.type.includes("Export")),
  ) as Statement[];

  return checkStatements(statements);
}

/**
 * Detect recursion (function calling itself).
 */
export function hasRecursion(ast: Program): boolean {
  const body = ast.type === "Module" ? ast.body : ast.body;

  function checkForRecursion(functionName: string, bodyStmts: Statement[]): boolean {
    function checkExpr(expr: Expression): boolean {
      if (expr.type === "CallExpression") {
        const callee = expr.callee;
        if (callee.type === "Identifier" && callee.value === functionName) {
          return true;
        }
        // Check nested calls
        for (const arg of expr.arguments) {
          if (checkExpr(arg.expression)) return true;
        }
      }

      if (expr.type === "ConditionalExpression") {
        return checkExpr(expr.test) || checkExpr(expr.consequent) || checkExpr(expr.alternate);
      }

      if (expr.type === "BinaryExpression") {
        return checkExpr(expr.left) || checkExpr(expr.right);
      }

      if (expr.type === "AssignmentExpression") {
        return checkExpr(expr.right);
      }

      if (expr.type === "MemberExpression") {
        return checkExpr(expr.object);
      }

      if (expr.type === "ArrayExpression") {
        return expr.elements.some((el) => el !== undefined && checkExpr(el.expression));
      }

      return false;
    }

    function checkStmts(stmts: Statement[]): boolean {
      for (const stmt of stmts) {
        if (stmt.type === "ExpressionStatement") {
          if (checkExpr(stmt.expression)) return true;
        }

        if (stmt.type === "ReturnStatement" && stmt.argument) {
          if (checkExpr(stmt.argument)) return true;
        }

        if (stmt.type === "VariableDeclaration") {
          for (const decl of stmt.declarations) {
            if (decl.init && checkExpr(decl.init)) return true;
          }
        }

        if (stmt.type === "BlockStatement") {
          if (checkStmts(stmt.stmts)) return true;
        }

        if (stmt.type === "IfStatement") {
          if (checkExpr(stmt.test)) return true;
          if (checkStmts([stmt.consequent])) return true;
          if (stmt.alternate && checkStmts([stmt.alternate])) return true;
        }

        if (stmt.type === "ForStatement") {
          if (stmt.test && checkExpr(stmt.test)) return true;
          if (stmt.update && checkExpr(stmt.update)) return true;
          if (checkStmts([stmt.body])) return true;
        }

        if (stmt.type === "WhileStatement" || stmt.type === "DoWhileStatement") {
          if (checkExpr(stmt.test)) return true;
          if (checkStmts([stmt.body])) return true;
        }

        if (stmt.type === "TryStatement") {
          if (checkStmts(stmt.block.stmts)) return true;
          if (stmt.handler && checkStmts(stmt.handler.body.stmts)) return true;
          if (stmt.finalizer && checkStmts(stmt.finalizer.stmts)) return true;
        }
      }
      return false;
    }

    return checkStmts(bodyStmts);
  }

  for (const item of body) {
    // Check function declarations
    if (item.type === "FunctionDeclaration" && item.body) {
      const funcName = item.identifier.value;
      if (checkForRecursion(funcName, item.body.stmts)) {
        return true;
      }
    }

    // Check variable declarations with named function expressions or arrow functions
    if (item.type === "VariableDeclaration") {
      for (const decl of item.declarations) {
        if (decl.id.type === "Identifier" && decl.init) {
          const varName = decl.id.value;

          if (decl.init.type === "ArrowFunctionExpression") {
            const arrow = decl.init;
            if (arrow.body.type === "BlockStatement") {
              if (checkForRecursion(varName, arrow.body.stmts)) {
                return true;
              }
            }
          }

          if (decl.init.type === "FunctionExpression" && decl.init.body) {
            if (checkForRecursion(varName, decl.init.body.stmts)) {
              return true;
            }
          }
        }
      }
    }
  }

  return false;
}

/**
 * Detect .partition() method calls.
 */
export function hasPartitionCalls(ast: Program): boolean {
  const body = ast.type === "Module" ? ast.body : ast.body;

  function checkExpression(expr: Expression): boolean {
    if (expr.type === "CallExpression") {
      const callee = expr.callee;
      if (
        callee.type === "MemberExpression" &&
        callee.property.type === "Identifier" &&
        callee.property.value === "partition"
      ) {
        return true;
      }
      // Check arguments
      for (const arg of expr.arguments) {
        if (checkExpression(arg.expression)) return true;
      }
    }

    if (expr.type === "MemberExpression") {
      if (checkExpression(expr.object)) return true;
    }

    if (expr.type === "ArrowFunctionExpression") {
      if (expr.body.type === "BlockStatement") {
        return checkStatements(expr.body.stmts);
      } else {
        return checkExpression(expr.body);
      }
    }

    if (expr.type === "FunctionExpression" && expr.body) {
      return checkStatements(expr.body.stmts);
    }

    if (expr.type === "BinaryExpression") {
      return checkExpression(expr.left) || checkExpression(expr.right);
    }

    if (expr.type === "ConditionalExpression") {
      return (
        checkExpression(expr.test) ||
        checkExpression(expr.consequent) ||
        checkExpression(expr.alternate)
      );
    }

    if (expr.type === "AssignmentExpression") {
      return checkExpression(expr.right);
    }

    return false;
  }

  function checkStatements(stmts: Statement[]): boolean {
    for (const stmt of stmts) {
      if (stmt.type === "ExpressionStatement") {
        if (checkExpression(stmt.expression)) return true;
      }

      if (stmt.type === "VariableDeclaration") {
        for (const decl of stmt.declarations) {
          if (decl.init && checkExpression(decl.init)) return true;
        }
      }

      if (stmt.type === "ReturnStatement" && stmt.argument) {
        if (checkExpression(stmt.argument)) return true;
      }

      if (stmt.type === "BlockStatement") {
        if (checkStatements(stmt.stmts)) return true;
      }

      if (stmt.type === "IfStatement") {
        if (checkExpression(stmt.test)) return true;
        if (checkStatements([stmt.consequent])) return true;
        if (stmt.alternate && checkStatements([stmt.alternate])) return true;
      }

      if (stmt.type === "ForStatement") {
        if (stmt.test && checkExpression(stmt.test)) return true;
        if (stmt.update && checkExpression(stmt.update)) return true;
        if (checkStatements([stmt.body])) return true;
      }

      if (stmt.type === "WhileStatement" || stmt.type === "DoWhileStatement") {
        if (checkExpression(stmt.test)) return true;
        if (checkStatements([stmt.body])) return true;
      }

      if (stmt.type === "FunctionDeclaration" && stmt.body) {
        if (checkStatements(stmt.body.stmts)) return true;
      }

      if (stmt.type === "TryStatement") {
        if (checkStatements(stmt.block.stmts)) return true;
        if (stmt.handler && checkStatements(stmt.handler.body.stmts)) return true;
        if (stmt.finalizer && checkStatements(stmt.finalizer.stmts)) return true;
      }
    }
    return false;
  }

  const statements = body.filter(
    (item): item is Statement => !("source" in item && item.type.includes("Export")),
  ) as Statement[];

  return checkStatements(statements);
}

/**
 * Detect two-pointer pattern (slow/fast or similar variable pairs).
 * Common in linked list algorithms like cycle detection, finding middle element.
 * Detects patterns like: let slow = head; let fast = head;
 */
export function hasTwoPointers(ast: Program): boolean {
  const body = ast.type === "Module" ? ast.body : ast.body;

  // Track declared variable names that could be pointers
  const pointerPairs = [
    ["slow", "fast"],
    ["p1", "p2"],
    ["left", "right"],
    ["first", "second"],
    ["prev", "curr"],
    ["current", "next"],
  ];

  function findDeclaredVariables(inputStmts: Statement[]): Set<string> {
    const vars = new Set<string>();

    function checkStmts(statements: Statement[]) {
      for (const stmt of statements) {
        if (stmt.type === "VariableDeclaration") {
          for (const decl of stmt.declarations) {
            if (decl.id.type === "Identifier") {
              vars.add(decl.id.value);
            }
          }
        }

        if (stmt.type === "BlockStatement") {
          checkStmts(stmt.stmts);
        }

        if (stmt.type === "IfStatement") {
          checkStmts([stmt.consequent]);
          if (stmt.alternate) checkStmts([stmt.alternate]);
        }

        if (
          stmt.type === "ForStatement" ||
          stmt.type === "WhileStatement" ||
          stmt.type === "DoWhileStatement"
        ) {
          checkStmts([stmt.body]);
        }

        if (stmt.type === "FunctionDeclaration" && stmt.body) {
          checkStmts(stmt.body.stmts);
        }
      }
    }

    checkStmts(inputStmts);
    return vars;
  }

  function checkFunction(stmts: Statement[]): boolean {
    const declaredVars = findDeclaredVariables(stmts);

    // Check if any pointer pair is declared
    for (const pair of pointerPairs) {
      const p1 = pair[0];
      const p2 = pair[1];
      if (p1 && p2 && declaredVars.has(p1) && declaredVars.has(p2)) {
        return true;
      }
    }
    return false;
  }

  for (const item of body) {
    if (item.type === "FunctionDeclaration" && item.body) {
      if (checkFunction(item.body.stmts)) return true;
    }

    if (item.type === "VariableDeclaration") {
      for (const decl of item.declarations) {
        if (
          decl.init?.type === "ArrowFunctionExpression" &&
          decl.init.body.type === "BlockStatement"
        ) {
          if (checkFunction(decl.init.body.stmts)) return true;
        }
        if (decl.init?.type === "FunctionExpression" && decl.init.body) {
          if (checkFunction(decl.init.body.stmts)) return true;
        }
      }
    }
  }

  return false;
}

/**
 * Detect pointer manipulation pattern (.next assignment).
 * Common in linked list operations like reversing, inserting, deleting.
 * Detects patterns like: node.next = something; prev.next = curr.next;
 */
export function hasPointerManipulation(ast: Program): boolean {
  const body = ast.type === "Module" ? ast.body : ast.body;

  function checkExpression(expr: Expression): boolean {
    // Check for assignment to .next property
    if (expr.type === "AssignmentExpression") {
      const left = expr.left;
      if (
        left.type === "MemberExpression" &&
        left.property.type === "Identifier" &&
        left.property.value === "next"
      ) {
        return true;
      }
      // Also check the right side for nested assignments
      return checkExpression(expr.right);
    }

    if (expr.type === "CallExpression") {
      for (const arg of expr.arguments) {
        if (checkExpression(arg.expression)) return true;
      }
    }

    if (expr.type === "ConditionalExpression") {
      return (
        checkExpression(expr.test) ||
        checkExpression(expr.consequent) ||
        checkExpression(expr.alternate)
      );
    }

    if (expr.type === "BinaryExpression") {
      return checkExpression(expr.left) || checkExpression(expr.right);
    }

    if (expr.type === "SequenceExpression") {
      return expr.expressions.some(checkExpression);
    }

    if (expr.type === "ArrowFunctionExpression") {
      if (expr.body.type === "BlockStatement") {
        return checkStatements(expr.body.stmts);
      } else {
        return checkExpression(expr.body);
      }
    }

    if (expr.type === "FunctionExpression" && expr.body) {
      return checkStatements(expr.body.stmts);
    }

    return false;
  }

  function checkStatements(stmts: Statement[]): boolean {
    for (const stmt of stmts) {
      if (stmt.type === "ExpressionStatement") {
        if (checkExpression(stmt.expression)) return true;
      }

      if (stmt.type === "VariableDeclaration") {
        for (const decl of stmt.declarations) {
          if (decl.init && checkExpression(decl.init)) return true;
        }
      }

      if (stmt.type === "ReturnStatement" && stmt.argument) {
        if (checkExpression(stmt.argument)) return true;
      }

      if (stmt.type === "BlockStatement") {
        if (checkStatements(stmt.stmts)) return true;
      }

      if (stmt.type === "IfStatement") {
        if (checkExpression(stmt.test)) return true;
        if (checkStatements([stmt.consequent])) return true;
        if (stmt.alternate && checkStatements([stmt.alternate])) return true;
      }

      if (stmt.type === "ForStatement") {
        if (stmt.init && stmt.init.type !== "VariableDeclaration" && checkExpression(stmt.init))
          return true;
        if (stmt.test && checkExpression(stmt.test)) return true;
        if (stmt.update && checkExpression(stmt.update)) return true;
        if (checkStatements([stmt.body])) return true;
      }

      if (stmt.type === "WhileStatement" || stmt.type === "DoWhileStatement") {
        if (checkExpression(stmt.test)) return true;
        if (checkStatements([stmt.body])) return true;
      }

      if (stmt.type === "FunctionDeclaration" && stmt.body) {
        if (checkStatements(stmt.body.stmts)) return true;
      }

      if (stmt.type === "TryStatement") {
        if (checkStatements(stmt.block.stmts)) return true;
        if (stmt.handler && checkStatements(stmt.handler.body.stmts)) return true;
        if (stmt.finalizer && checkStatements(stmt.finalizer.stmts)) return true;
      }
    }
    return false;
  }

  const statements = body.filter(
    (item): item is Statement => !("source" in item && item.type.includes("Export")),
  ) as Statement[];

  return checkStatements(statements);
}

/**
 * Detect depth-first search/traversal pattern.
 * Common in tree and graph algorithms. Detects:
 * - Recursive function calls with node.left/node.right traversal
 * - Stack-based iteration with push/pop operations
 * - Method calls like .dfs(), .depthFirst(), or variable names containing 'dfs'
 */
export function hasDFS(ast: Program): boolean {
  const body = ast.type === "Module" ? ast.body : ast.body;

  // Check for recursive traversal pattern (tree DFS)
  function hasRecursiveTraversal(stmts: Statement[], funcName: string): boolean {
    function checkExpr(expr: Expression): boolean {
      // Check for recursive call with .left or .right access
      if (expr.type === "CallExpression") {
        const callee = expr.callee;
        if (callee.type === "Identifier" && callee.value === funcName) {
          // Check if any argument accesses .left or .right
          for (const arg of expr.arguments) {
            if (arg.expression.type === "MemberExpression") {
              const prop = arg.expression.property;
              if (prop.type === "Identifier" && (prop.value === "left" || prop.value === "right")) {
                return true;
              }
            }
          }
        }
        // Check arguments recursively
        for (const arg of expr.arguments) {
          if (checkExpr(arg.expression)) return true;
        }
      }

      if (expr.type === "ConditionalExpression") {
        return checkExpr(expr.test) || checkExpr(expr.consequent) || checkExpr(expr.alternate);
      }

      if (expr.type === "BinaryExpression") {
        return checkExpr(expr.left) || checkExpr(expr.right);
      }

      if (expr.type === "AssignmentExpression") {
        return checkExpr(expr.right);
      }

      if (expr.type === "ArrayExpression") {
        return expr.elements.some((el) => el !== undefined && checkExpr(el.expression));
      }

      return false;
    }

    function checkStmts(statements: Statement[]): boolean {
      for (const stmt of statements) {
        if (stmt.type === "ExpressionStatement") {
          if (checkExpr(stmt.expression)) return true;
        }

        if (stmt.type === "ReturnStatement" && stmt.argument) {
          if (checkExpr(stmt.argument)) return true;
        }

        if (stmt.type === "VariableDeclaration") {
          for (const decl of stmt.declarations) {
            if (decl.init && checkExpr(decl.init)) return true;
          }
        }

        if (stmt.type === "BlockStatement") {
          if (checkStmts(stmt.stmts)) return true;
        }

        if (stmt.type === "IfStatement") {
          if (checkStmts([stmt.consequent])) return true;
          if (stmt.alternate && checkStmts([stmt.alternate])) return true;
        }

        if (
          stmt.type === "ForStatement" ||
          stmt.type === "WhileStatement" ||
          stmt.type === "DoWhileStatement"
        ) {
          if (checkStmts([stmt.body])) return true;
        }
      }
      return false;
    }

    return checkStmts(stmts);
  }

  // Check for stack-based DFS pattern (push/pop with visited set)
  function hasStackBasedDFS(stmts: Statement[]): boolean {
    let hasStack = false;
    let hasPush = false;
    let hasPop = false;

    function checkExpr(expr: Expression): void {
      if (expr.type === "CallExpression") {
        const callee = expr.callee;
        if (callee.type === "MemberExpression" && callee.property.type === "Identifier") {
          const method = callee.property.value;
          if (method === "push") hasPush = true;
          if (method === "pop") hasPop = true;
        }
        // Check arguments
        for (const arg of expr.arguments) {
          checkExpr(arg.expression);
        }
      }

      if (expr.type === "ArrayExpression") {
        expr.elements.forEach((el) => el && checkExpr(el.expression));
      }

      if (expr.type === "AssignmentExpression") {
        checkExpr(expr.right);
      }
    }

    function checkStmts(statements: Statement[]): void {
      for (const stmt of statements) {
        // Check for stack variable declaration
        if (stmt.type === "VariableDeclaration") {
          for (const decl of stmt.declarations) {
            if (decl.id.type === "Identifier") {
              const name = decl.id.value.toLowerCase();
              if (name === "stack" || name.includes("stack")) {
                hasStack = true;
              }
            }
            if (decl.init) checkExpr(decl.init);
          }
        }

        if (stmt.type === "ExpressionStatement") {
          checkExpr(stmt.expression);
        }

        if (stmt.type === "BlockStatement") {
          checkStmts(stmt.stmts);
        }

        if (stmt.type === "IfStatement") {
          checkStmts([stmt.consequent]);
          if (stmt.alternate) checkStmts([stmt.alternate]);
        }

        if (
          stmt.type === "ForStatement" ||
          stmt.type === "WhileStatement" ||
          stmt.type === "DoWhileStatement"
        ) {
          checkStmts([stmt.body]);
        }

        if (stmt.type === "FunctionDeclaration" && stmt.body) {
          checkStmts(stmt.body.stmts);
        }
      }
    }

    checkStmts(stmts);
    return hasStack && hasPush && hasPop;
  }

  // Check for DFS method calls or variable names
  function hasDFSMethodOrVariable(stmts: Statement[]): boolean {
    function checkExpr(expr: Expression): boolean {
      if (expr.type === "CallExpression") {
        const callee = expr.callee;
        // Check for .dfs() or .depthFirst() method calls
        if (callee.type === "MemberExpression" && callee.property.type === "Identifier") {
          const method = callee.property.value.toLowerCase();
          if (method === "dfs" || method === "depthfirst" || method === "depthfirstsearch") {
            return true;
          }
        }
        // Check for dfs() function call
        if (callee.type === "Identifier") {
          const name = callee.value.toLowerCase();
          if (name === "dfs" || name === "depthfirst" || name === "depthfirstsearch") {
            return true;
          }
        }
      }

      if (expr.type === "ArrowFunctionExpression" && expr.body.type === "BlockStatement") {
        return checkStmts(expr.body.stmts);
      }

      if (expr.type === "FunctionExpression" && expr.body) {
        return checkStmts(expr.body.stmts);
      }

      return false;
    }

    function checkStmts(statements: Statement[]): boolean {
      for (const stmt of statements) {
        if (stmt.type === "ExpressionStatement") {
          if (checkExpr(stmt.expression)) return true;
        }

        if (stmt.type === "ReturnStatement" && stmt.argument) {
          if (checkExpr(stmt.argument)) return true;
        }

        if (stmt.type === "VariableDeclaration") {
          for (const decl of stmt.declarations) {
            if (decl.init && checkExpr(decl.init)) return true;
          }
        }

        if (stmt.type === "BlockStatement") {
          if (checkStmts(stmt.stmts)) return true;
        }

        if (stmt.type === "IfStatement") {
          if (checkStmts([stmt.consequent])) return true;
          if (stmt.alternate && checkStmts([stmt.alternate])) return true;
        }

        if (
          stmt.type === "ForStatement" ||
          stmt.type === "WhileStatement" ||
          stmt.type === "DoWhileStatement"
        ) {
          if (checkStmts([stmt.body])) return true;
        }

        if (stmt.type === "FunctionDeclaration" && stmt.body) {
          if (checkStmts(stmt.body.stmts)) return true;
        }
      }
      return false;
    }

    return checkStmts(stmts);
  }

  const statements = body.filter(
    (item): item is Statement => !("source" in item && item.type.includes("Export")),
  ) as Statement[];

  // Check for DFS method calls
  if (hasDFSMethodOrVariable(statements)) return true;

  // Check for stack-based DFS
  if (hasStackBasedDFS(statements)) return true;

  // Check function declarations for recursive tree traversal
  for (const item of body) {
    if (item.type === "FunctionDeclaration" && item.body) {
      const funcName = item.identifier.value;
      if (hasRecursiveTraversal(item.body.stmts, funcName)) return true;
    }

    if (item.type === "VariableDeclaration") {
      for (const decl of item.declarations) {
        if (decl.id.type === "Identifier" && decl.init) {
          const varName = decl.id.value;
          if (
            decl.init.type === "ArrowFunctionExpression" &&
            decl.init.body.type === "BlockStatement"
          ) {
            if (hasRecursiveTraversal(decl.init.body.stmts, varName)) return true;
          }
          if (decl.init.type === "FunctionExpression" && decl.init.body) {
            if (hasRecursiveTraversal(decl.init.body.stmts, varName)) return true;
          }
        }
      }
    }
  }

  return false;
}

/**
 * Detect breadth-first search/traversal pattern.
 * Common in tree and graph algorithms. Detects:
 * - Queue-based iteration with push/shift or enqueue/dequeue operations
 * - Method calls like .bfs(), .breadthFirst(), or variable names containing 'bfs'
 * - Level-order traversal pattern
 */
export function hasBFS(ast: Program): boolean {
  const body = ast.type === "Module" ? ast.body : ast.body;

  // Check for queue-based BFS pattern (push/shift with queue variable)
  function hasQueueBasedBFS(stmts: Statement[]): boolean {
    let hasQueue = false;
    let hasPush = false;
    let hasShift = false;

    function checkExpr(expr: Expression): void {
      if (expr.type === "CallExpression") {
        const callee = expr.callee;
        if (callee.type === "MemberExpression" && callee.property.type === "Identifier") {
          const method = callee.property.value;
          if (method === "push" || method === "enqueue") hasPush = true;
          if (method === "shift" || method === "dequeue") hasShift = true;
        }
        // Check arguments
        for (const arg of expr.arguments) {
          checkExpr(arg.expression);
        }
      }

      if (expr.type === "ArrayExpression") {
        expr.elements.forEach((el) => el && checkExpr(el.expression));
      }

      if (expr.type === "AssignmentExpression") {
        checkExpr(expr.right);
      }
    }

    function checkStmts(statements: Statement[]): void {
      for (const stmt of statements) {
        // Check for queue variable declaration
        if (stmt.type === "VariableDeclaration") {
          for (const decl of stmt.declarations) {
            if (decl.id.type === "Identifier") {
              const name = decl.id.value.toLowerCase();
              if (name === "queue" || name.includes("queue")) {
                hasQueue = true;
              }
            }
            if (decl.init) checkExpr(decl.init);
          }
        }

        if (stmt.type === "ExpressionStatement") {
          checkExpr(stmt.expression);
        }

        if (stmt.type === "BlockStatement") {
          checkStmts(stmt.stmts);
        }

        if (stmt.type === "IfStatement") {
          checkStmts([stmt.consequent]);
          if (stmt.alternate) checkStmts([stmt.alternate]);
        }

        if (
          stmt.type === "ForStatement" ||
          stmt.type === "WhileStatement" ||
          stmt.type === "DoWhileStatement"
        ) {
          checkStmts([stmt.body]);
        }

        if (stmt.type === "FunctionDeclaration" && stmt.body) {
          checkStmts(stmt.body.stmts);
        }
      }
    }

    checkStmts(stmts);
    return hasQueue && hasPush && hasShift;
  }

  // Check for BFS method calls or variable names
  function hasBFSMethodOrVariable(stmts: Statement[]): boolean {
    function checkExpr(expr: Expression): boolean {
      if (expr.type === "CallExpression") {
        const callee = expr.callee;
        // Check for .bfs() or .breadthFirst() method calls
        if (callee.type === "MemberExpression" && callee.property.type === "Identifier") {
          const method = callee.property.value.toLowerCase();
          if (method === "bfs" || method === "breadthfirst" || method === "breadthfirstsearch") {
            return true;
          }
        }
        // Check for bfs() function call
        if (callee.type === "Identifier") {
          const name = callee.value.toLowerCase();
          if (name === "bfs" || name === "breadthfirst" || name === "breadthfirstsearch") {
            return true;
          }
        }
      }

      if (expr.type === "ArrowFunctionExpression" && expr.body.type === "BlockStatement") {
        return checkStmts(expr.body.stmts);
      }

      if (expr.type === "FunctionExpression" && expr.body) {
        return checkStmts(expr.body.stmts);
      }

      return false;
    }

    function checkStmts(statements: Statement[]): boolean {
      for (const stmt of statements) {
        if (stmt.type === "ExpressionStatement") {
          if (checkExpr(stmt.expression)) return true;
        }

        if (stmt.type === "ReturnStatement" && stmt.argument) {
          if (checkExpr(stmt.argument)) return true;
        }

        if (stmt.type === "VariableDeclaration") {
          for (const decl of stmt.declarations) {
            if (decl.init && checkExpr(decl.init)) return true;
          }
        }

        if (stmt.type === "BlockStatement") {
          if (checkStmts(stmt.stmts)) return true;
        }

        if (stmt.type === "IfStatement") {
          if (checkStmts([stmt.consequent])) return true;
          if (stmt.alternate && checkStmts([stmt.alternate])) return true;
        }

        if (
          stmt.type === "ForStatement" ||
          stmt.type === "WhileStatement" ||
          stmt.type === "DoWhileStatement"
        ) {
          if (checkStmts([stmt.body])) return true;
        }

        if (stmt.type === "FunctionDeclaration" && stmt.body) {
          if (checkStmts(stmt.body.stmts)) return true;
        }
      }
      return false;
    }

    return checkStmts(stmts);
  }

  const statements = body.filter(
    (item): item is Statement => !("source" in item && item.type.includes("Export")),
  ) as Statement[];

  // Check for BFS method calls
  if (hasBFSMethodOrVariable(statements)) return true;

  // Check for queue-based BFS
  if (hasQueueBasedBFS(statements)) return true;

  return false;
}

/**
 * Detect divide-and-conquer pattern.
 * Common in tree balancing, merge sort, quick sort. Detects:
 * - Mid-point calculation: Math.floor((left + right) / 2) or similar
 * - Recursive calls with divided ranges (low, mid) and (mid, high)
 * - Array slicing with mid-point: arr.slice(0, mid), arr.slice(mid)
 */
export function hasDivideAndConquer(ast: Program): boolean {
  const body = ast.type === "Module" ? ast.body : ast.body;

  // Check for mid-point calculation pattern
  function hasMidPointCalculation(stmts: Statement[]): boolean {
    function checkExpr(expr: Expression): boolean {
      // Check for Math.floor(... / 2)
      if (expr.type === "CallExpression") {
        const callee = expr.callee;
        if (
          callee.type === "MemberExpression" &&
          callee.object.type === "Identifier" &&
          callee.object.value === "Math" &&
          callee.property.type === "Identifier" &&
          callee.property.value === "floor"
        ) {
          // Check if argument contains division by 2
          if (expr.arguments.length > 0) {
            const arg = expr.arguments[0]?.expression;
            if (arg && hasDivisionByTwo(arg)) {
              return true;
            }
          }
        }
      }

      // Check for bitwise right shift >> 1 (equivalent to divide by 2)
      if (expr.type === "BinaryExpression" && expr.operator === ">>") {
        if (expr.right.type === "NumericLiteral" && expr.right.value === 1) {
          return true;
        }
      }

      // Check for direct division by 2
      if (expr.type === "BinaryExpression" && expr.operator === "/") {
        if (expr.right.type === "NumericLiteral" && expr.right.value === 2) {
          return true;
        }
      }

      // Check for variable named 'mid', 'middle', or similar
      if (expr.type === "Identifier") {
        const name = expr.value.toLowerCase();
        if (name === "mid" || name === "middle" || name === "midpoint") {
          return true;
        }
      }

      return false;
    }

    function hasDivisionByTwo(expr: Expression): boolean {
      if (expr.type === "BinaryExpression" && expr.operator === "/") {
        if (expr.right.type === "NumericLiteral" && expr.right.value === 2) {
          return true;
        }
      }
      if (expr.type === "ParenthesisExpression") {
        return hasDivisionByTwo(expr.expression);
      }
      return false;
    }

    function checkStmts(statements: Statement[]): boolean {
      for (const stmt of statements) {
        if (stmt.type === "VariableDeclaration") {
          for (const decl of stmt.declarations) {
            // Check for mid variable assignment
            if (decl.id.type === "Identifier") {
              const name = decl.id.value.toLowerCase();
              if (name === "mid" || name === "middle" || name === "midpoint") {
                return true;
              }
            }
            if (decl.init && checkExpr(decl.init)) return true;
          }
        }

        if (stmt.type === "ExpressionStatement") {
          if (checkExpr(stmt.expression)) return true;
        }

        if (stmt.type === "ReturnStatement" && stmt.argument) {
          if (checkExpr(stmt.argument)) return true;
        }

        if (stmt.type === "BlockStatement") {
          if (checkStmts(stmt.stmts)) return true;
        }

        if (stmt.type === "IfStatement") {
          if (checkStmts([stmt.consequent])) return true;
          if (stmt.alternate && checkStmts([stmt.alternate])) return true;
        }

        if (
          stmt.type === "ForStatement" ||
          stmt.type === "WhileStatement" ||
          stmt.type === "DoWhileStatement"
        ) {
          if (checkStmts([stmt.body])) return true;
        }

        if (stmt.type === "FunctionDeclaration" && stmt.body) {
          if (checkStmts(stmt.body.stmts)) return true;
        }
      }
      return false;
    }

    return checkStmts(stmts);
  }

  // Check for array slicing with mid-point
  function hasArraySlicing(stmts: Statement[]): boolean {
    let hasSlice = false;

    function checkExpr(expr: Expression): void {
      if (expr.type === "CallExpression") {
        const callee = expr.callee;
        if (
          callee.type === "MemberExpression" &&
          callee.property.type === "Identifier" &&
          callee.property.value === "slice"
        ) {
          hasSlice = true;
        }
        // Check arguments
        for (const arg of expr.arguments) {
          checkExpr(arg.expression);
        }
      }

      if (expr.type === "AssignmentExpression") {
        checkExpr(expr.right);
      }

      if (expr.type === "ArrayExpression") {
        expr.elements.forEach((el) => el && checkExpr(el.expression));
      }
    }

    function checkStmts(statements: Statement[]): void {
      for (const stmt of statements) {
        if (stmt.type === "ExpressionStatement") {
          checkExpr(stmt.expression);
        }

        if (stmt.type === "VariableDeclaration") {
          for (const decl of stmt.declarations) {
            if (decl.init) checkExpr(decl.init);
          }
        }

        if (stmt.type === "ReturnStatement" && stmt.argument) {
          checkExpr(stmt.argument);
        }

        if (stmt.type === "BlockStatement") {
          checkStmts(stmt.stmts);
        }

        if (stmt.type === "IfStatement") {
          checkStmts([stmt.consequent]);
          if (stmt.alternate) checkStmts([stmt.alternate]);
        }

        if (
          stmt.type === "ForStatement" ||
          stmt.type === "WhileStatement" ||
          stmt.type === "DoWhileStatement"
        ) {
          checkStmts([stmt.body]);
        }

        if (stmt.type === "FunctionDeclaration" && stmt.body) {
          checkStmts(stmt.body.stmts);
        }
      }
    }

    checkStmts(stmts);
    return hasSlice;
  }

  const statements = body.filter(
    (item): item is Statement => !("source" in item && item.type.includes("Export")),
  ) as Statement[];

  // Check for mid-point calculation (strongest indicator)
  if (hasMidPointCalculation(statements)) return true;

  // Check function declarations for divide-and-conquer patterns
  for (const item of body) {
    if (item.type === "FunctionDeclaration" && item.body) {
      if (hasMidPointCalculation(item.body.stmts)) return true;
      // Array slicing combined with recursion indicates divide-and-conquer
      if (hasArraySlicing(item.body.stmts) && hasRecursion(ast)) return true;
    }

    if (item.type === "VariableDeclaration") {
      for (const decl of item.declarations) {
        if (
          decl.init?.type === "ArrowFunctionExpression" &&
          decl.init.body.type === "BlockStatement"
        ) {
          if (hasMidPointCalculation(decl.init.body.stmts)) return true;
          if (hasArraySlicing(decl.init.body.stmts) && hasRecursion(ast)) return true;
        }
        if (decl.init?.type === "FunctionExpression" && decl.init.body) {
          if (hasMidPointCalculation(decl.init.body.stmts)) return true;
          if (hasArraySlicing(decl.init.body.stmts) && hasRecursion(ast)) return true;
        }
      }
    }
  }

  return false;
}

/**
 * Detect stack usage pattern.
 * Detects createTrackedStack() calls or stack-like operations (push/pop on a stack variable).
 */
export function hasStackUsage(ast: Program): boolean {
  const body = ast.type === "Module" ? ast.body : ast.body;

  function checkExpr(expr: Expression): boolean {
    if (expr.type === "CallExpression") {
      const callee = expr.callee;
      // Check for createTrackedStack() call
      if (callee.type === "Identifier" && callee.value === "createTrackedStack") {
        return true;
      }
      // Check arguments
      for (const arg of expr.arguments) {
        if (checkExpr(arg.expression)) return true;
      }
    }

    if (expr.type === "AssignmentExpression") {
      return checkExpr(expr.right);
    }

    if (expr.type === "ArrowFunctionExpression" && expr.body.type === "BlockStatement") {
      return checkStmts(expr.body.stmts);
    }

    if (expr.type === "FunctionExpression" && expr.body) {
      return checkStmts(expr.body.stmts);
    }

    return false;
  }

  function checkStmts(stmts: Statement[]): boolean {
    for (const stmt of stmts) {
      if (stmt.type === "VariableDeclaration") {
        for (const decl of stmt.declarations) {
          // Check for stack variable with createTrackedStack
          if (decl.init && checkExpr(decl.init)) return true;
        }
      }

      if (stmt.type === "ExpressionStatement") {
        if (checkExpr(stmt.expression)) return true;
      }

      if (stmt.type === "ReturnStatement" && stmt.argument) {
        if (checkExpr(stmt.argument)) return true;
      }

      if (stmt.type === "BlockStatement") {
        if (checkStmts(stmt.stmts)) return true;
      }

      if (stmt.type === "IfStatement") {
        if (checkStmts([stmt.consequent])) return true;
        if (stmt.alternate && checkStmts([stmt.alternate])) return true;
      }

      if (
        stmt.type === "ForStatement" ||
        stmt.type === "WhileStatement" ||
        stmt.type === "DoWhileStatement"
      ) {
        if (checkStmts([stmt.body])) return true;
      }

      if (stmt.type === "FunctionDeclaration" && stmt.body) {
        if (checkStmts(stmt.body.stmts)) return true;
      }
    }
    return false;
  }

  const statements = body.filter(
    (item): item is Statement => !("source" in item && item.type.includes("Export")),
  ) as Statement[];

  return checkStmts(statements);
}

/**
 * Detect queue usage pattern.
 * Detects createTrackedQueue() calls or queue-like operations (enqueue/dequeue on a queue variable).
 */
export function hasQueueUsage(ast: Program): boolean {
  const body = ast.type === "Module" ? ast.body : ast.body;

  function checkExpr(expr: Expression): boolean {
    if (expr.type === "CallExpression") {
      const callee = expr.callee;
      // Check for createTrackedQueue() call
      if (callee.type === "Identifier" && callee.value === "createTrackedQueue") {
        return true;
      }
      // Check arguments
      for (const arg of expr.arguments) {
        if (checkExpr(arg.expression)) return true;
      }
    }

    if (expr.type === "AssignmentExpression") {
      return checkExpr(expr.right);
    }

    if (expr.type === "ArrowFunctionExpression" && expr.body.type === "BlockStatement") {
      return checkStmts(expr.body.stmts);
    }

    if (expr.type === "FunctionExpression" && expr.body) {
      return checkStmts(expr.body.stmts);
    }

    return false;
  }

  function checkStmts(stmts: Statement[]): boolean {
    for (const stmt of stmts) {
      if (stmt.type === "VariableDeclaration") {
        for (const decl of stmt.declarations) {
          if (decl.init && checkExpr(decl.init)) return true;
        }
      }

      if (stmt.type === "ExpressionStatement") {
        if (checkExpr(stmt.expression)) return true;
      }

      if (stmt.type === "ReturnStatement" && stmt.argument) {
        if (checkExpr(stmt.argument)) return true;
      }

      if (stmt.type === "BlockStatement") {
        if (checkStmts(stmt.stmts)) return true;
      }

      if (stmt.type === "IfStatement") {
        if (checkStmts([stmt.consequent])) return true;
        if (stmt.alternate && checkStmts([stmt.alternate])) return true;
      }

      if (
        stmt.type === "ForStatement" ||
        stmt.type === "WhileStatement" ||
        stmt.type === "DoWhileStatement"
      ) {
        if (checkStmts([stmt.body])) return true;
      }

      if (stmt.type === "FunctionDeclaration" && stmt.body) {
        if (checkStmts(stmt.body.stmts)) return true;
      }
    }
    return false;
  }

  const statements = body.filter(
    (item): item is Statement => !("source" in item && item.type.includes("Export")),
  ) as Statement[];

  return checkStmts(statements);
}

/**
 * Detect two stacks usage pattern.
 * Detects when code uses two separate stack instances (e.g., stack1 and stack2, or stack and minStack).
 */
export function hasTwoStacks(ast: Program): boolean {
  const body = ast.type === "Module" ? ast.body : ast.body;

  function countStackCreations(stmts: Statement[]): number {
    let count = 0;

    function checkExpr(expr: Expression): number {
      let localCount = 0;
      if (expr.type === "CallExpression") {
        const callee = expr.callee;
        if (callee.type === "Identifier" && callee.value === "createTrackedStack") {
          localCount++;
        }
        for (const arg of expr.arguments) {
          localCount += checkExpr(arg.expression);
        }
      }

      if (expr.type === "AssignmentExpression") {
        localCount += checkExpr(expr.right);
      }

      if (expr.type === "ArrowFunctionExpression" && expr.body.type === "BlockStatement") {
        localCount += countInStmts(expr.body.stmts);
      }

      if (expr.type === "FunctionExpression" && expr.body) {
        localCount += countInStmts(expr.body.stmts);
      }

      return localCount;
    }

    function countInStmts(statements: Statement[]): number {
      let localCount = 0;
      for (const stmt of statements) {
        if (stmt.type === "VariableDeclaration") {
          for (const decl of stmt.declarations) {
            if (decl.init) localCount += checkExpr(decl.init);
          }
        }

        if (stmt.type === "ExpressionStatement") {
          localCount += checkExpr(stmt.expression);
        }

        if (stmt.type === "BlockStatement") {
          localCount += countInStmts(stmt.stmts);
        }

        if (stmt.type === "IfStatement") {
          localCount += countInStmts([stmt.consequent]);
          if (stmt.alternate) localCount += countInStmts([stmt.alternate]);
        }

        if (
          stmt.type === "ForStatement" ||
          stmt.type === "WhileStatement" ||
          stmt.type === "DoWhileStatement"
        ) {
          localCount += countInStmts([stmt.body]);
        }

        if (stmt.type === "FunctionDeclaration" && stmt.body) {
          localCount += countInStmts(stmt.body.stmts);
        }
      }
      return localCount;
    }

    count = countInStmts(stmts);
    return count;
  }

  const statements = body.filter(
    (item): item is Statement => !("source" in item && item.type.includes("Export")),
  ) as Statement[];

  return countStackCreations(statements) >= 2;
}

/**
 * Detect hash map usage pattern.
 * Detects createTrackedHashMap() calls.
 */
export function hasHashMapUsage(ast: Program): boolean {
  const body = ast.type === "Module" ? ast.body : ast.body;

  function checkExpr(expr: Expression): boolean {
    if (expr.type === "CallExpression") {
      const callee = expr.callee;
      // Check for createTrackedHashMap() call
      if (callee.type === "Identifier" && callee.value === "createTrackedHashMap") {
        return true;
      }
      // Check arguments
      for (const arg of expr.arguments) {
        if (checkExpr(arg.expression)) return true;
      }
    }

    if (expr.type === "AssignmentExpression") {
      return checkExpr(expr.right);
    }

    if (expr.type === "ArrowFunctionExpression" && expr.body.type === "BlockStatement") {
      return checkStmts(expr.body.stmts);
    }

    if (expr.type === "FunctionExpression" && expr.body) {
      return checkStmts(expr.body.stmts);
    }

    return false;
  }

  function checkStmts(stmts: Statement[]): boolean {
    for (const stmt of stmts) {
      if (stmt.type === "VariableDeclaration") {
        for (const decl of stmt.declarations) {
          if (decl.init && checkExpr(decl.init)) return true;
        }
      }

      if (stmt.type === "ExpressionStatement") {
        if (checkExpr(stmt.expression)) return true;
      }

      if (stmt.type === "ReturnStatement" && stmt.argument) {
        if (checkExpr(stmt.argument)) return true;
      }

      if (stmt.type === "BlockStatement") {
        if (checkStmts(stmt.stmts)) return true;
      }

      if (stmt.type === "IfStatement") {
        if (checkStmts([stmt.consequent])) return true;
        if (stmt.alternate && checkStmts([stmt.alternate])) return true;
      }

      if (
        stmt.type === "ForStatement" ||
        stmt.type === "WhileStatement" ||
        stmt.type === "DoWhileStatement"
      ) {
        if (checkStmts([stmt.body])) return true;
      }

      if (stmt.type === "FunctionDeclaration" && stmt.body) {
        if (checkStmts(stmt.body.stmts)) return true;
      }
    }
    return false;
  }

  const statements = body.filter(
    (item): item is Statement => !("source" in item && item.type.includes("Export")),
  ) as Statement[];

  return checkStmts(statements);
}

/**
 * Detect iteration pattern.
 * Detects for loops, for-of loops, or forEach calls used for iterating over data.
 */
export function hasIteration(ast: Program): boolean {
  const body = ast.type === "Module" ? ast.body : ast.body;

  function checkExpr(expr: Expression): boolean {
    // Check for .forEach() call
    if (expr.type === "CallExpression") {
      const callee = expr.callee;
      if (
        callee.type === "MemberExpression" &&
        callee.property.type === "Identifier" &&
        callee.property.value === "forEach"
      ) {
        return true;
      }
      // Check for .entries() or .keys() or .values() iteration
      if (
        callee.type === "MemberExpression" &&
        callee.property.type === "Identifier" &&
        (callee.property.value === "entries" ||
          callee.property.value === "keys" ||
          callee.property.value === "values")
      ) {
        return true;
      }
    }

    if (expr.type === "ArrowFunctionExpression" && expr.body.type === "BlockStatement") {
      return checkStmts(expr.body.stmts);
    }

    if (expr.type === "FunctionExpression" && expr.body) {
      return checkStmts(expr.body.stmts);
    }

    return false;
  }

  function checkStmts(stmts: Statement[]): boolean {
    for (const stmt of stmts) {
      // Check for for loop
      if (stmt.type === "ForStatement") {
        return true;
      }

      // Check for for-of loop
      if (stmt.type === "ForOfStatement") {
        return true;
      }

      // Check for for-in loop
      if (stmt.type === "ForInStatement") {
        return true;
      }

      // Check for while loop used as iteration
      if (stmt.type === "WhileStatement" || stmt.type === "DoWhileStatement") {
        return true;
      }

      if (stmt.type === "ExpressionStatement") {
        if (checkExpr(stmt.expression)) return true;
      }

      if (stmt.type === "VariableDeclaration") {
        for (const decl of stmt.declarations) {
          if (decl.init && checkExpr(decl.init)) return true;
        }
      }

      if (stmt.type === "BlockStatement") {
        if (checkStmts(stmt.stmts)) return true;
      }

      if (stmt.type === "IfStatement") {
        if (checkStmts([stmt.consequent])) return true;
        if (stmt.alternate && checkStmts([stmt.alternate])) return true;
      }

      if (stmt.type === "FunctionDeclaration" && stmt.body) {
        if (checkStmts(stmt.body.stmts)) return true;
      }
    }
    return false;
  }

  const statements = body.filter(
    (item): item is Statement => !("source" in item && item.type.includes("Export")),
  ) as Statement[];

  return checkStmts(statements);
}

/**
 * Mapping of pattern IDs to their detection functions.
 */
const patternDetectors: Record<string, (ast: Program) => boolean> = {
  nestedLoops: hasNestedLoops,
  swapCalls: hasSwapCalls,
  recursion: hasRecursion,
  partitionCalls: hasPartitionCalls,
  twoPointers: hasTwoPointers,
  pointerManipulation: hasPointerManipulation,
  dfs: hasDFS,
  bfs: hasBFS,
  divideAndConquer: hasDivideAndConquer,
  stackUsage: hasStackUsage,
  queueUsage: hasQueueUsage,
  twoStacks: hasTwoStacks,
  hashMapUsage: hasHashMapUsage,
  iteration: hasIteration,
};

/**
 * Validate code against pattern requirements.
 * Returns a ValidationResult indicating if the code matches any required pattern.
 */
export function validatePatterns(code: string, requirement: PatternRequirement): ValidationResult {
  const ast = parseCode(code);

  if (!ast) {
    return {
      valid: false,
      error: "Failed to parse code",
    };
  }

  for (const patternId of requirement.anyOf) {
    const detector = patternDetectors[patternId];
    if (detector && detector(ast)) {
      return { valid: true };
    }
  }

  return {
    valid: false,
    error: requirement.errorMessage,
  };
}
