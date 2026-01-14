/**
 * Preset algorithm examples for Graphs
 */

import type { PresetExample } from "./types";

export const graphPresets: PresetExample[] = [
  {
    id: "graph-bfs",
    name: "Breadth-First Search (BFS)",
    description: "Explore graph level by level using a queue",
    category: "traversal",
    dataStructure: "graph",
    timeComplexity: "O(V + E)",
    spaceComplexity: "O(V)",
    tags: ["traversal", "bfs", "queue"],
    code: `function bfs(graph, startVertex) {
  // BFS: Explore all neighbors before going deeper
  // Use a queue to track vertices to visit

  const visited = new Set();
  const queue = [startVertex];
  const result = [];

  visited.add(startVertex);

  while (queue.length > 0) {
    const vertex = queue.shift();
    result.push(vertex);

    // Visit all unvisited neighbors
    const neighbors = graph.getNeighbors(vertex);
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }

  return result;
}

// Test it:
const graph = createGraph();
graph.addEdge('A', 'B');
graph.addEdge('A', 'C');
graph.addEdge('B', 'D');
console.log(bfs(graph, 'A'));`,
  },
  {
    id: "graph-dfs",
    name: "Depth-First Search (DFS)",
    description: "Explore as far as possible before backtracking",
    category: "traversal",
    dataStructure: "graph",
    timeComplexity: "O(V + E)",
    spaceComplexity: "O(V)",
    tags: ["traversal", "dfs", "recursive"],
    code: `function dfs(graph, startVertex) {
  // DFS: Go as deep as possible before backtracking
  // Can be implemented recursively or with a stack

  const visited = new Set();
  const result = [];

  function visit(vertex) {
    // Mark as visited
    visited.add(vertex);
    result.push(vertex);

    // Recursively visit all unvisited neighbors
    const neighbors = graph.getNeighbors(vertex);
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visit(neighbor);
      }
    }
  }

  visit(startVertex);
  return result;
}

// Test it:
const graph = createGraph();
graph.addEdge('A', 'B');
graph.addEdge('A', 'C');
graph.addEdge('B', 'D');
console.log(dfs(graph, 'A'));`,
  },
  {
    id: "graph-detect-cycle",
    name: "Detect Cycle (Directed Graph)",
    description: "Check if a directed graph contains a cycle using DFS",
    category: "detection",
    dataStructure: "graph",
    timeComplexity: "O(V + E)",
    spaceComplexity: "O(V)",
    tags: ["dfs", "cycle-detection"],
    code: `function hasCycle(graph) {
  // Use DFS with three states:
  // - white (unvisited): not yet explored
  // - gray (visiting): currently in DFS stack
  // - black (visited): completely processed

  const white = new Set(graph.getVertices());
  const gray = new Set();
  const black = new Set();

  function dfs(vertex) {
    // Move from white to gray
    white.delete(vertex);
    gray.add(vertex);

    // Check all neighbors
    const neighbors = graph.getNeighbors(vertex);
    for (const neighbor of neighbors) {
      // If neighbor is gray, we found a back edge (cycle!)
      if (gray.has(neighbor)) {
        return true;
      }

      // If neighbor is white, visit it
      if (white.has(neighbor)) {
        if (dfs(neighbor)) return true;
      }
    }

    // Done with this vertex, move to black
    gray.delete(vertex);
    black.add(vertex);
    return false;
  }

  // Try DFS from each unvisited vertex
  for (const vertex of [...white]) {
    if (dfs(vertex)) return true;
  }

  return false;
}

// Test it:
const graph = createGraph(true);  // directed
graph.addEdge('A', 'B');
graph.addEdge('B', 'C');
graph.addEdge('C', 'A');  // creates cycle
console.log(\`Has cycle: \${hasCycle(graph)}\`);`,
  },
  {
    id: "graph-dijkstra",
    name: "Dijkstra's Shortest Path",
    description: "Find shortest path from source to all vertices (non-negative weights)",
    category: "shortest-path",
    dataStructure: "graph",
    timeComplexity: "O((V + E) log V)",
    spaceComplexity: "O(V)",
    tags: ["shortest-path", "greedy"],
    code: `function dijkstra(graph, source) {
  // Find shortest paths using greedy approach
  // Always expand the closest unvisited vertex

  const distances = {};
  const visited = new Set();
  const vertices = graph.getVertices();

  // Initialize distances to infinity
  for (const vertex of vertices) {
    distances[vertex] = Infinity;
  }
  distances[source] = 0;

  // Process vertices in order of distance
  while (visited.size < vertices.length) {
    // Find unvisited vertex with minimum distance
    let minVertex = null;
    let minDistance = Infinity;

    for (const vertex of vertices) {
      if (!visited.has(vertex) && distances[vertex] < minDistance) {
        minVertex = vertex;
        minDistance = distances[vertex];
      }
    }

    if (minVertex === null) break;

    visited.add(minVertex);

    // Update distances to neighbors
    const neighbors = graph.getNeighbors(minVertex);
    for (const neighbor of neighbors) {
      const weight = graph.getWeight(minVertex, neighbor) || 1;
      const newDistance = distances[minVertex] + weight;

      if (newDistance < distances[neighbor]) {
        distances[neighbor] = newDistance;
      }
    }
  }

  return distances;
}

// Test it:
const graph = createWeightedGraph();
graph.addEdge('A', 'B', 4);
graph.addEdge('A', 'C', 2);
graph.addEdge('C', 'B', 1);
console.log(dijkstra(graph, 'A'));`,
  },
  {
    id: "graph-topological-sort",
    name: "Topological Sort",
    description: "Linear ordering of vertices in a directed acyclic graph (DAG)",
    category: "ordering",
    dataStructure: "graph",
    timeComplexity: "O(V + E)",
    spaceComplexity: "O(V)",
    tags: ["dfs", "dag"],
    code: `function topologicalSort(graph) {
  // Topological sort using DFS
  // Vertices are added to result in reverse finishing order

  const visited = new Set();
  const result = [];

  function dfs(vertex) {
    visited.add(vertex);

    // Visit all unvisited neighbors first
    const neighbors = graph.getNeighbors(vertex);
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        dfs(neighbor);
      }
    }

    // Add to result after visiting all descendants
    result.unshift(vertex);  // Add to front
  }

  // Visit all vertices
  const vertices = graph.getVertices();
  for (const vertex of vertices) {
    if (!visited.has(vertex)) {
      dfs(vertex);
    }
  }

  return result;
}

// Test it (requires DAG):
const graph = createGraph(true);
graph.addEdge('A', 'C');
graph.addEdge('B', 'C');
graph.addEdge('C', 'D');
console.log(topologicalSort(graph));  // [B, A, C, D] or [A, B, C, D]`,
  },
];
