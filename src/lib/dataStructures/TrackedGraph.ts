/**
 * TrackedGraph - A graph data structure that captures all operations for visualization
 * Supports both directed and undirected graphs with adjacency list representation
 */

import type { VisualizationStep } from "../../store/useAppStore";

export interface GraphNode<T> {
  value: T;
  neighbors: T[];
}

export interface GraphEdge<T> {
  from: T;
  to: T;
  weight?: number;
}

export type GraphData<T> = Map<T, T[]>;

export class TrackedGraph<T = number> {
  private adjacencyList: Map<T, Set<T>>;
  private directed: boolean;
  private onOperation?: (step: VisualizationStep) => void;

  constructor(directed = false, onOperation?: (step: VisualizationStep) => void) {
    this.adjacencyList = new Map();
    this.directed = directed;
    this.onOperation = onOperation;
  }

  /**
   * Add a vertex to the graph
   */
  addVertex(value: T): this {
    if (!this.adjacencyList.has(value)) {
      this.adjacencyList.set(value, new Set());
      this.emitStep("addVertex", [value], this.toArray(), {
        vertex: value,
        added: true,
      });
    } else {
      this.emitStep("addVertex", [value], this.toArray(), {
        vertex: value,
        added: false,
        message: "Vertex already exists",
      });
    }
    return this;
  }

  /**
   * Add an edge between two vertices
   */
  addEdge(from: T, to: T, weight?: number): this {
    // Ensure both vertices exist
    if (!this.adjacencyList.has(from)) {
      this.addVertex(from);
    }
    if (!this.adjacencyList.has(to)) {
      this.addVertex(to);
    }

    // Add edge
    const fromNeighbors = this.adjacencyList.get(from);
    if (fromNeighbors) {
      fromNeighbors.add(to);
    }

    // If undirected, add reverse edge
    if (!this.directed) {
      const toNeighbors = this.adjacencyList.get(to);
      if (toNeighbors) {
        toNeighbors.add(from);
      }
    }

    this.emitStep("addEdge", [from, to, weight], this.toArray(), {
      from,
      to,
      weight,
      directed: this.directed,
    });

    return this;
  }

  /**
   * Remove a vertex and all its edges
   */
  removeVertex(value: T): boolean {
    if (!this.adjacencyList.has(value)) {
      this.emitStep("removeVertex", [value], this.toArray(), {
        vertex: value,
        removed: false,
        message: "Vertex not found",
      });
      return false;
    }

    // Remove all edges to this vertex
    for (const neighbors of this.adjacencyList.values()) {
      neighbors.delete(value);
    }

    // Remove the vertex itself
    this.adjacencyList.delete(value);

    this.emitStep("removeVertex", [value], this.toArray(), {
      vertex: value,
      removed: true,
    });

    return true;
  }

  /**
   * Remove an edge between two vertices
   */
  removeEdge(from: T, to: T): boolean {
    if (!this.adjacencyList.has(from)) {
      this.emitStep("removeEdge", [from, to], this.toArray(), {
        from,
        to,
        removed: false,
        message: "Source vertex not found",
      });
      return false;
    }

    const fromNeighbors = this.adjacencyList.get(from);
    const removed = fromNeighbors?.delete(to) ?? false;

    // If undirected, remove reverse edge
    if (!this.directed && this.adjacencyList.has(to)) {
      const toNeighbors = this.adjacencyList.get(to);
      toNeighbors?.delete(from);
    }

    this.emitStep("removeEdge", [from, to], this.toArray(), {
      from,
      to,
      removed,
    });

    return removed;
  }

  /**
   * Breadth-First Search traversal from a starting vertex
   */
  bfs(start: T): T[] {
    if (!this.adjacencyList.has(start)) {
      this.emitStep("bfs", [start], this.toArray(), {
        start,
        result: [],
        message: "Start vertex not found",
      });
      return [];
    }

    const visited = new Set<T>();
    const queue: T[] = [start];
    const result: T[] = [];

    while (queue.length > 0) {
      const vertex = queue.shift()!;

      if (!visited.has(vertex)) {
        visited.add(vertex);
        result.push(vertex);

        this.emitStep("bfs", [start], this.toArray(), {
          start,
          current: vertex,
          visited: Array.from(visited),
          queue: [...queue],
          result: [...result],
        });

        const neighbors = this.adjacencyList.get(vertex);
        if (neighbors) {
          for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
              queue.push(neighbor);
            }
          }
        }
      }
    }

    this.emitStep("bfs", [start], this.toArray(), {
      start,
      result,
      completed: true,
    });

    return result;
  }

  /**
   * Depth-First Search traversal from a starting vertex
   */
  dfs(start: T): T[] {
    if (!this.adjacencyList.has(start)) {
      this.emitStep("dfs", [start], this.toArray(), {
        start,
        result: [],
        message: "Start vertex not found",
      });
      return [];
    }

    const visited = new Set<T>();
    const result: T[] = [];

    const dfsHelper = (vertex: T) => {
      visited.add(vertex);
      result.push(vertex);

      this.emitStep("dfs", [start], this.toArray(), {
        start,
        current: vertex,
        visited: Array.from(visited),
        result: [...result],
      });

      const neighbors = this.adjacencyList.get(vertex);
      if (neighbors) {
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor)) {
            dfsHelper(neighbor);
          }
        }
      }
    };

    dfsHelper(start);

    this.emitStep("dfs", [start], this.toArray(), {
      start,
      result,
      completed: true,
    });

    return result;
  }

  /**
   * Detect if the graph has a cycle
   */
  hasCycle(): boolean {
    const visited = new Set<T>();
    const recStack = new Set<T>();

    const hasCycleHelper = (vertex: T, parent: T | null): boolean => {
      visited.add(vertex);
      recStack.add(vertex);

      const neighbors = this.adjacencyList.get(vertex);
      if (neighbors) {
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor)) {
            if (hasCycleHelper(neighbor, vertex)) {
              return true;
            }
          } else if (this.directed) {
            // For directed graphs, check if in recursion stack
            if (recStack.has(neighbor)) {
              this.emitStep("hasCycle", [], this.toArray(), {
                hasCycle: true,
                cycleVertex: neighbor,
              });
              return true;
            }
          } else {
            // For undirected graphs, check if not parent
            if (neighbor !== parent) {
              this.emitStep("hasCycle", [], this.toArray(), {
                hasCycle: true,
                cycleVertex: neighbor,
              });
              return true;
            }
          }
        }
      }

      recStack.delete(vertex);
      return false;
    };

    for (const vertex of this.adjacencyList.keys()) {
      if (!visited.has(vertex)) {
        if (hasCycleHelper(vertex, null)) {
          return true;
        }
      }
    }

    this.emitStep("hasCycle", [], this.toArray(), {
      hasCycle: false,
    });

    return false;
  }

  /**
   * Find shortest path between two vertices (unweighted BFS)
   */
  shortestPath(start: T, end: T): T[] | null {
    if (!this.adjacencyList.has(start) || !this.adjacencyList.has(end)) {
      this.emitStep("shortestPath", [start, end], this.toArray(), {
        start,
        end,
        path: null,
        message: "Start or end vertex not found",
      });
      return null;
    }

    const visited = new Set<T>();
    const queue: Array<{ vertex: T; path: T[] }> = [{ vertex: start, path: [start] }];

    while (queue.length > 0) {
      const { vertex, path } = queue.shift()!;

      if (vertex === end) {
        this.emitStep("shortestPath", [start, end], this.toArray(), {
          start,
          end,
          path,
          found: true,
        });
        return path;
      }

      if (!visited.has(vertex)) {
        visited.add(vertex);

        this.emitStep("shortestPath", [start, end], this.toArray(), {
          start,
          end,
          current: vertex,
          visited: Array.from(visited),
          currentPath: path,
        });

        const neighbors = this.adjacencyList.get(vertex);
        if (neighbors) {
          for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
              queue.push({ vertex: neighbor, path: [...path, neighbor] });
            }
          }
        }
      }
    }

    this.emitStep("shortestPath", [start, end], this.toArray(), {
      start,
      end,
      path: null,
      found: false,
      message: "No path found",
    });

    return null;
  }

  /**
   * Get all vertices
   */
  getVertices(): T[] {
    return Array.from(this.adjacencyList.keys());
  }

  /**
   * Get all edges
   */
  getEdges(): GraphEdge<T>[] {
    const edges: GraphEdge<T>[] = [];
    const seen = new Set<string>();

    for (const [from, neighbors] of this.adjacencyList.entries()) {
      for (const to of neighbors) {
        const edgeKey = this.directed ? `${from}->${to}` : [from, to].sort().join("-");

        if (!seen.has(edgeKey)) {
          edges.push({ from, to });
          seen.add(edgeKey);
        }
      }
    }

    return edges;
  }

  /**
   * Get neighbors of a vertex
   */
  getNeighbors(vertex: T): T[] {
    const neighbors = this.adjacencyList.get(vertex);
    return neighbors ? Array.from(neighbors) : [];
  }

  /**
   * Check if graph is directed
   */
  isDirected(): boolean {
    return this.directed;
  }

  /**
   * Get number of vertices
   */
  getSize(): number {
    return this.adjacencyList.size;
  }

  /**
   * Check if graph is empty
   */
  isEmpty(): boolean {
    return this.adjacencyList.size === 0;
  }

  /**
   * Clear all vertices and edges
   */
  clear(): this {
    this.adjacencyList.clear();
    this.emitStep("clear", [], this.toArray(), {
      cleared: true,
    });
    return this;
  }

  /**
   * Convert graph to array representation for visualization
   */
  toArray(): Array<{ vertex: T; neighbors: T[] }> {
    const result: Array<{ vertex: T; neighbors: T[] }> = [];
    for (const [vertex, neighbors] of this.adjacencyList.entries()) {
      result.push({ vertex, neighbors: Array.from(neighbors) });
    }
    return result;
  }

  /**
   * Get adjacency list as Map
   */
  getData(): Map<T, T[]> {
    const data = new Map<T, T[]>();
    for (const [vertex, neighbors] of this.adjacencyList.entries()) {
      data.set(vertex, Array.from(neighbors));
    }
    return data;
  }

  /**
   * Emit a visualization step
   */
  private emitStep(
    type: string,
    args: unknown[],
    result: Array<{ vertex: T; neighbors: T[] }>,
    metadata: Record<string, unknown>,
  ): void {
    if (this.onOperation) {
      this.onOperation({
        type,
        target: "graph",
        args,
        result,
        timestamp: Date.now(),
        metadata,
      });
    }
  }

  /**
   * Static factory method
   */
  static from<T>(
    vertices: T[],
    edges: Array<{ from: T; to: T; weight?: number }>,
    directed = false,
    onOperation?: (step: VisualizationStep) => void,
  ): TrackedGraph<T> {
    const graph = new TrackedGraph<T>(directed, onOperation);
    for (const vertex of vertices) {
      graph.addVertex(vertex);
    }
    for (const edge of edges) {
      graph.addEdge(edge.from, edge.to, edge.weight);
    }
    return graph;
  }
}

/**
 * Helper function to create a TrackedGraph
 */
export function createTrackedGraph<T = number>(
  directed = false,
  onOperation?: (step: VisualizationStep) => void,
): TrackedGraph<T> {
  return new TrackedGraph<T>(directed, onOperation);
}
