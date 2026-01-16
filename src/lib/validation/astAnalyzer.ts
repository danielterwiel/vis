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
 * Mapping of pattern IDs to their detection functions.
 */
const patternDetectors: Record<string, (ast: Program) => boolean> = {
  nestedLoops: hasNestedLoops,
  swapCalls: hasSwapCalls,
  recursion: hasRecursion,
  partitionCalls: hasPartitionCalls,
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
