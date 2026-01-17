import type { TestCase } from "../types";
import type { PatternRequirement } from "../../validation/types";

/**
 * Graph test cases with 3 difficulty levels (Easy, Medium, Hard)
 *
 * All test cases use a single function name 'findPath' that finds a path
 * between two vertices. The difficulty levels require different algorithmic
 * approaches validated via AST analysis.
 *
 * All test cases use the same graph structure for consistency.
 */

// Single graph dataset used across all Graph test cases
// Weighted directed graph that supports BFS, DFS, and Dijkstra
const GRAPH_VERTICES = ["A", "B", "C", "D", "E"];
const GRAPH_EDGES = [
  { from: "A", to: "B", weight: 4 },
  { from: "A", to: "C", weight: 2 },
  { from: "B", to: "D", weight: 5 },
  { from: "C", to: "B", weight: 1 },
  { from: "C", to: "D", weight: 8 },
  { from: "C", to: "E", weight: 10 },
  { from: "D", to: "E", weight: 2 },
];

// For easy/medium, any valid path works. For hard, shortest path is required.
// Shortest path A→E is: A→C→B→D→E (weight: 2+1+5+2=10)
const GRAPH_SHORTEST_PATH = ["A", "C", "B", "D", "E"];

export const graphTests: TestCase[] = [
  {
    id: "graph-path-easy",
    name: "Find Path (Easy)",
    difficulty: "easy",
    description:
      "Find a path between two vertices in a graph. You can use any method, including built-in traversal.",
    initialData: {
      vertices: GRAPH_VERTICES,
      edges: GRAPH_EDGES,
      directed: true,
    },
    expectedOutput: GRAPH_SHORTEST_PATH,
    additionalArgs: ["A", "E"],
    assertions: `
      // Any valid path from A to E is acceptable
      expect(finalResult[0]).toBe("A");
      expect(finalResult[finalResult.length - 1]).toBe("E");
      expect(finalResult.length).toBeGreaterThanOrEqual(2);
    `,
    referenceSolution: `function findPath(graph, start, end) {
  // Easy approach: use built-in BFS to find path
  return graph.bfs(start, end);
}`,
    skeletonCode: `function findPath(graph, start, end) {
  // TODO: Find a path from start to end vertex
  // The graph parameter is a TrackedGraph
  // Hint: Use graph.bfs(start, end) for built-in BFS pathfinding

  return graph.bfs(start, end);
}`,
    hints: [
      "TrackedGraph has a built-in bfs() method that can find paths",
      "Call graph.bfs(start, end) to find a path between two vertices",
      "BFS finds the path with fewest edges (not necessarily shortest by weight)",
    ],
    acceptanceCriteria: [
      "Function returns array starting with start vertex",
      "Function returns array ending with end vertex",
      "All vertices in path are connected by edges",
    ],
  },
  {
    id: "graph-path-medium",
    name: "Find Path (Medium)",
    difficulty: "medium",
    description:
      "Find a path between two vertices in a graph. Implement DFS-based pathfinding.",
    initialData: {
      vertices: GRAPH_VERTICES,
      edges: GRAPH_EDGES,
      directed: true,
    },
    expectedOutput: GRAPH_SHORTEST_PATH,
    additionalArgs: ["A", "E"],
    assertions: `
      // Any valid path from A to E is acceptable
      expect(finalResult[0]).toBe("A");
      expect(finalResult[finalResult.length - 1]).toBe("E");
      expect(finalResult.length).toBeGreaterThanOrEqual(2);
    `,
    referenceSolution: `function findPath(graph, start, end) {
  // Medium approach: DFS-based pathfinding
  const visited = new Set();
  const path = [];

  function dfs(vertex) {
    if (vertex === end) {
      path.push(vertex);
      return true;
    }

    visited.add(vertex);
    path.push(vertex);

    const neighbors = graph.getNeighbors(vertex);
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor)) {
          return true;
        }
      }
    }

    path.pop();
    return false;
  }

  dfs(start);
  return path;
}`,
    skeletonCode: `function findPath(graph, start, end) {
  // TODO: Implement DFS-based pathfinding
  // DFS explores as far as possible along each branch before backtracking
  //
  // Steps:
  // 1. Create a visited set and path array
  // 2. Create recursive DFS function that:
  //    - Returns true if current vertex is end
  //    - Marks vertex as visited, adds to path
  //    - For each unvisited neighbor, recursively search
  //    - If found, return true; otherwise backtrack (pop from path)
  // 3. Start DFS from start vertex

  const visited = new Set();
  const path = [];

  function dfs(vertex) {
    // TODO: Implement recursive DFS
  }

  dfs(start);
  return path;
}`,
    hints: [
      "DFS uses recursion to explore paths deeply before backtracking",
      "Use graph.getNeighbors(vertex) to get adjacent vertices",
      "Track visited vertices to avoid cycles",
      "Backtrack by removing vertices from path when a branch fails",
    ],
    acceptanceCriteria: [
      "Function returns array starting with start vertex",
      "Function returns array ending with end vertex",
      "Uses DFS pattern with recursion",
    ],
    patternRequirement: {
      anyOf: ["recursion", "dfs"],
      errorMessage:
        "Medium difficulty requires DFS-based pathfinding using recursion.",
    } satisfies PatternRequirement,
  },
  {
    id: "graph-path-hard",
    name: "Find Path (Hard)",
    difficulty: "hard",
    description:
      "Find the shortest path between two vertices using Dijkstra's algorithm.",
    initialData: {
      vertices: GRAPH_VERTICES,
      edges: GRAPH_EDGES,
      directed: true,
    },
    expectedOutput: GRAPH_SHORTEST_PATH,
    additionalArgs: ["A", "E"],
    assertions: `
      expect(finalResult).toEqual(["A", "C", "B", "D", "E"]);
    `,
    referenceSolution: `function findPath(graph, start, end) {
  // Hard approach: Dijkstra's shortest path algorithm
  const distances = new Map();
  const previous = new Map();
  const unvisited = new Set();

  // Initialize distances
  for (const vertex of graph.getVertices()) {
    distances.set(vertex, vertex === start ? 0 : Infinity);
    unvisited.add(vertex);
  }

  while (unvisited.size > 0) {
    // Find unvisited vertex with minimum distance
    let current = null;
    let minDist = Infinity;
    for (const vertex of unvisited) {
      const dist = distances.get(vertex);
      if (dist < minDist) {
        minDist = dist;
        current = vertex;
      }
    }

    if (current === null || current === end) break;

    unvisited.delete(current);

    // Update distances to neighbors
    const neighbors = graph.getNeighbors(current);
    for (const neighbor of neighbors) {
      if (!unvisited.has(neighbor)) continue;

      // Get edge weight
      const edges = graph.getEdges();
      let weight = 1;
      for (const edge of edges) {
        if (edge.from === current && edge.to === neighbor) {
          weight = edge.weight || 1;
          break;
        }
      }

      const altDist = distances.get(current) + weight;
      if (altDist < distances.get(neighbor)) {
        distances.set(neighbor, altDist);
        previous.set(neighbor, current);
      }
    }
  }

  // Reconstruct path
  const path = [];
  let current = end;
  while (current !== undefined) {
    path.unshift(current);
    current = previous.get(current);
  }

  return path[0] === start ? path : [];
}`,
    skeletonCode: `function findPath(graph, start, end) {
  // TODO: Implement Dijkstra's shortest path algorithm
  //
  // Algorithm:
  // 1. Initialize distances map (start=0, others=Infinity)
  // 2. Create previous map for path reconstruction
  // 3. Create set of unvisited vertices
  // 4. While unvisited set is not empty:
  //    - Find unvisited vertex with minimum distance (nested loop)
  //    - For each neighbor, calculate tentative distance
  //    - Update if shorter path found
  // 5. Reconstruct path from end to start using previous map

  const distances = new Map();
  const previous = new Map();
  const unvisited = new Set();

  // TODO: Initialize distances and unvisited set

  // TODO: Main loop - visit vertices in order of distance
  // Use nested loops: outer while for vertices, inner for neighbors

  // TODO: Reconstruct path from end to start

  return [];
}`,
    hints: [
      "Dijkstra's algorithm uses greedy approach: always visit minimum-distance vertex",
      "Use nested loops: outer while loop for vertices, inner for loop for neighbors",
      "Use graph.getEdges() to get edge weights for distance calculation",
      "Reconstruct path by following previous pointers from end to start",
    ],
    acceptanceCriteria: [
      "Function returns shortest path as array of vertices",
      "Path has minimum total edge weight",
      "Uses Dijkstra's algorithm with nested loops",
    ],
    patternRequirement: {
      anyOf: ["nestedLoops"],
      errorMessage:
        "Hard difficulty requires Dijkstra's algorithm with nested loops (outer while loop for vertices, inner for loop for updating neighbor distances).",
    } satisfies PatternRequirement,
  },
];
