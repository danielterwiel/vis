/**
 * Graph skeleton code templates
 *
 * These templates match the test cases defined in graphTests.ts
 * All levels use the same function name 'findPath' with different approaches
 */

import { skeletonCodeSystem } from "../skeletonCodeSystem";

/**
 * Easy: Find Path (any method)
 * Uses built-in BFS for path finding
 */
const easySkeleton = `// Example usage: Find a path between two vertices in a graph

function findPath(graph, start, end) {
  // TODO: Find a path from start to end vertex
  // The graph parameter is a TrackedGraph
  // Hint: Use graph.bfs(start, end) for built-in BFS pathfinding

  return graph.bfs(start, end);
}
`;

/**
 * Medium: Find Path (DFS required)
 * Implements DFS-based pathfinding with recursion
 */
const mediumSkeleton = `// Example usage: Find a path between two vertices using DFS

function findPath(graph, start, end) {
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
}
`;

/**
 * Hard: Find Path (Dijkstra's algorithm)
 * Implements shortest path with nested loops
 */
const hardSkeleton = `// Example usage: Find the shortest path between two vertices using Dijkstra's algorithm

function findPath(graph, start, end) {
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
}
`;

/**
 * Register all graph templates
 */
export function registerGraphTemplates(): void {
  skeletonCodeSystem.registerTemplate("graph", "easy", easySkeleton);
  skeletonCodeSystem.registerTemplate("graph", "medium", mediumSkeleton);
  skeletonCodeSystem.registerTemplate("graph", "hard", hardSkeleton);
}

/**
 * Export individual templates for testing
 */
export { easySkeleton, mediumSkeleton, hardSkeleton };
