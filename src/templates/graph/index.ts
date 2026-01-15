/**
 * Graph skeleton code templates
 *
 * These templates match the test cases defined in graphTests.ts
 */

import { skeletonCodeSystem } from "../skeletonCodeSystem";

/**
 * Easy: BFS Traversal
 * Breadth-first search from starting vertex
 */
const easySkeleton = `// Example usage: Traverse a graph using Breadth-First Search from a starting vertex

function bfsTraversal(graph, start) {
  // TODO: Perform BFS traversal starting from 'start' vertex
  // Hint: Use graph.bfs(start) to traverse the graph


}
`;

/**
 * Medium: Detect Cycle in Directed Graph
 * Uses DFS with recursion stack
 */
const mediumSkeleton = `// Example usage: Detect if a directed graph contains a cycle

function detectCycle(graph) {
  // TODO: Check if the graph contains a cycle
  // Hint: Use graph.hasCycle() to detect cycles


}
`;

/**
 * Hard: Dijkstra's Shortest Path
 * Finds shortest path in weighted graph
 */
const hardSkeleton = `// Example usage: Find the shortest path between two vertices using Dijkstra's algorithm

function dijkstra(graph, start, end) {
  // TODO: Implement Dijkstra's shortest path algorithm
  // Hint: Use graph.getVertices() to get all vertices
  // Hint: Use graph.getNeighbors(vertex) to get adjacent vertices
  // 1. Initialize distances map (start=0, others=Infinity)
  // 2. Create a set of unvisited vertices
  // 3. While unvisited set is not empty:
  //    - Find unvisited vertex with minimum distance
  //    - For each neighbor, calculate tentative distance
  //    - Update distance if shorter path found
  // 4. Reconstruct path from start to end using previous vertices

  const distances = new Map();
  const previous = new Map();
  const unvisited = new Set();

  // TODO: Initialize distances and unvisited set


  // TODO: Main loop - visit vertices in order of distance


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
