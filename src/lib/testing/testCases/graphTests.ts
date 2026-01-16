import type { TestCase } from "../types";
import type { PatternRequirement } from "../../validation/types";

/**
 * Graph test cases following PRD specifications (lines 538-546)
 * - Easy: BFS traversal
 * - Medium: Detect cycle in directed graph
 * - Hard: Dijkstra's shortest path
 *
 * All test cases use the same vertex set ["A", "B", "C", "D", "E"] for consistency.
 * Different edge configurations are used to demonstrate different graph properties:
 * - Easy: Undirected tree structure for BFS
 * - Medium: Directed graph with cycle (B -> C -> D -> B)
 * - Hard: Weighted directed graph for shortest path
 */

// Single vertex set used across all Graph test cases
const GRAPH_VERTICES = ["A", "B", "C", "D", "E"];

export const graphTests: TestCase[] = [
  // ========== EASY: BFS Traversal ==========
  {
    id: "graph-bfs-easy",
    name: "BFS Traversal",
    difficulty: "easy",
    description: "Traverse a graph using Breadth-First Search from a starting vertex",
    initialData: {
      vertices: GRAPH_VERTICES,
      edges: [
        { from: "A", to: "B" },
        { from: "A", to: "C" },
        { from: "B", to: "D" },
        { from: "C", to: "E" },
      ],
      directed: false,
    },
    expectedOutput: ["A", "B", "C", "D", "E"],
    additionalArgs: ["A"], // start vertex
    assertions: `
      expect(finalResult).toEqual(["A", "B", "C", "D", "E"]);
    `,
    referenceSolution: `
      function bfsTraversal(graph, start) {
        return graph.bfs(start);
      }
    `,
    skeletonCode: `
      function bfsTraversal(graph, start) {
        // TODO: Perform BFS traversal starting from 'start' vertex
        // Hint: Use graph.bfs(start) to traverse the graph


      }
    `,
    hints: [
      "BFS uses a queue to visit nodes level by level",
      "TrackedGraph has a built-in bfs() method that takes a starting vertex",
      "The method returns an array of vertices in the order they were visited",
    ],
    acceptanceCriteria: [
      "Function returns array starting with the start vertex",
      "All reachable vertices are included in result",
      "Vertices are visited in level-order (breadth-first)",
      "BFS operation is captured in visualization steps",
    ],
  },

  // ========== MEDIUM: Detect Cycle in Directed Graph ==========
  {
    id: "graph-cycle-medium",
    name: "Detect Cycle in Directed Graph",
    difficulty: "medium",
    description: "Detect if a directed graph contains a cycle",
    initialData: {
      vertices: GRAPH_VERTICES,
      edges: [
        { from: "A", to: "B", directed: true },
        { from: "B", to: "C", directed: true },
        { from: "C", to: "D", directed: true },
        { from: "D", to: "B", directed: true }, // Creates cycle: B -> C -> D -> B
        { from: "D", to: "E", directed: true }, // E is reachable but not in cycle
      ],
      directed: true,
    },
    expectedOutput: true,
    assertions: `
      expect(finalResult).toBe(true);
    `,
    referenceSolution: `
      function detectCycle(graph) {
        return graph.hasCycle();
      }
    `,
    skeletonCode: `
      function detectCycle(graph) {
        // TODO: Check if the graph contains a cycle
        // Hint: Use graph.hasCycle() to detect cycles


      }
    `,
    hints: [
      "A cycle exists when you can start at a vertex and return to it by following edges",
      "TrackedGraph has a built-in hasCycle() method",
      "For directed graphs, cycle detection uses DFS with a recursion stack",
    ],
    acceptanceCriteria: [
      "Function returns true when cycle exists",
      "Function returns false when no cycle exists",
      "Works correctly for directed graphs",
      "Cycle detection operation is captured in visualization steps",
    ],
    patternRequirement: {
      anyOf: ["recursion", "dfs"],
      errorMessage:
        "Medium difficulty requires DFS-based cycle detection using recursion or explicit DFS traversal (e.g., using graph.hasCycle() which uses DFS internally).",
    } as PatternRequirement,
  },

  // ========== HARD: Dijkstra's Shortest Path ==========
  {
    id: "graph-dijkstra-hard",
    name: "Dijkstra's Shortest Path",
    difficulty: "hard",
    description: "Find the shortest path between two vertices using Dijkstra's algorithm",
    initialData: {
      vertices: GRAPH_VERTICES,
      edges: [
        { from: "A", to: "B", weight: 4 },
        { from: "A", to: "C", weight: 2 },
        { from: "B", to: "D", weight: 5 },
        { from: "C", to: "B", weight: 1 },
        { from: "C", to: "D", weight: 8 },
        { from: "C", to: "E", weight: 10 },
        { from: "D", to: "E", weight: 2 },
      ],
      directed: true,
    },
    expectedOutput: ["A", "C", "B", "D", "E"], // Path with minimum total weight
    additionalArgs: ["A", "E"], // start and end vertices
    assertions: `
      expect(finalResult).toEqual(["A", "C", "B", "D", "E"]);
    `,
    referenceSolution: `
      function dijkstra(graph, start, end) {
        // Initialize distances and visited set
        const distances = new Map();
        const previous = new Map();
        const unvisited = new Set();

        // Set all distances to infinity except start
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
      }
    `,
    skeletonCode: `
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
    `,
    hints: [
      "Dijkstra's algorithm finds shortest paths in weighted graphs using a greedy approach",
      "Always visit the unvisited vertex with the smallest known distance",
      "For each visited vertex, update distances to its neighbors if a shorter path is found",
      "Use a 'previous' map to reconstruct the path after finding distances",
    ],
    acceptanceCriteria: [
      "Function returns shortest path as array of vertices from start to end",
      "Path has minimum total edge weight",
      "Works with weighted directed graphs",
      "Returns empty array if no path exists",
      "Shortest path operation is captured in visualization steps",
    ],
    patternRequirement: {
      anyOf: ["nestedLoops"],
      errorMessage:
        "Hard difficulty requires Dijkstra's algorithm which uses nested loops (outer while loop to visit vertices, inner for loop to update neighbor distances).",
    } as PatternRequirement,
  },
];
