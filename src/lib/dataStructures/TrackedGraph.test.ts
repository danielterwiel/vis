import { describe, it, expect, vi } from "vitest";
import { TrackedGraph, createTrackedGraph } from "./TrackedGraph";
import type { VisualizationStep } from "../../store/useAppStore";

describe("TrackedGraph", () => {
  describe("Constructor and Factory", () => {
    it("should create an undirected graph by default", () => {
      const graph = new TrackedGraph<number>();
      expect(graph.isDirected()).toBe(false);
      expect(graph.isEmpty()).toBe(true);
      expect(graph.getSize()).toBe(0);
    });

    it("should create a directed graph when specified", () => {
      const graph = new TrackedGraph<number>(true);
      expect(graph.isDirected()).toBe(true);
    });

    it("should create graph via createTrackedGraph helper", () => {
      const graph = createTrackedGraph<number>(false);
      expect(graph.isDirected()).toBe(false);
    });

    it("should create graph with vertices and edges via from()", () => {
      const graph = TrackedGraph.from(
        [1, 2, 3],
        [
          { from: 1, to: 2 },
          { from: 2, to: 3 },
        ],
        false,
      );
      expect(graph.getSize()).toBe(3);
      expect(graph.getEdges()).toHaveLength(2);
    });
  });

  describe("Vertex Operations", () => {
    it("should add a vertex", () => {
      const callback = vi.fn();
      const graph = new TrackedGraph<number>(false, callback);

      graph.addVertex(1);

      expect(graph.getSize()).toBe(1);
      expect(graph.getVertices()).toEqual([1]);
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "addVertex",
          target: "graph",
          metadata: expect.objectContaining({
            vertex: 1,
            added: true,
          }),
        }),
      );
    });

    it("should not add duplicate vertex", () => {
      const callback = vi.fn();
      const graph = new TrackedGraph<number>(false, callback);

      graph.addVertex(1);
      graph.addVertex(1);

      expect(graph.getSize()).toBe(1);
      expect(callback).toHaveBeenCalledTimes(2);
      expect(callback).toHaveBeenLastCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            vertex: 1,
            added: false,
            message: "Vertex already exists",
          }),
        }),
      );
    });

    it("should remove a vertex and its edges", () => {
      const callback = vi.fn();
      const graph = new TrackedGraph<number>(false, callback);

      graph.addVertex(1).addVertex(2).addEdge(1, 2);
      const removed = graph.removeVertex(1);

      expect(removed).toBe(true);
      expect(graph.getSize()).toBe(1);
      expect(graph.getVertices()).toEqual([2]);
      expect(graph.getNeighbors(2)).toEqual([]);
    });

    it("should return false when removing non-existent vertex", () => {
      const callback = vi.fn();
      const graph = new TrackedGraph<number>(false, callback);

      const removed = graph.removeVertex(99);

      expect(removed).toBe(false);
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            vertex: 99,
            removed: false,
            message: "Vertex not found",
          }),
        }),
      );
    });

    it("should support chaining for addVertex", () => {
      const graph = new TrackedGraph<number>();
      const result = graph.addVertex(1).addVertex(2).addVertex(3);
      expect(result).toBe(graph);
      expect(graph.getSize()).toBe(3);
    });
  });

  describe("Edge Operations", () => {
    it("should add an edge in undirected graph", () => {
      const callback = vi.fn();
      const graph = new TrackedGraph<number>(false, callback);

      graph.addEdge(1, 2);

      expect(graph.getNeighbors(1)).toEqual([2]);
      expect(graph.getNeighbors(2)).toEqual([1]); // Undirected
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "addEdge",
          metadata: expect.objectContaining({
            from: 1,
            to: 2,
            directed: false,
          }),
        }),
      );
    });

    it("should add an edge in directed graph", () => {
      const graph = new TrackedGraph<number>(true);

      graph.addEdge(1, 2);

      expect(graph.getNeighbors(1)).toEqual([2]);
      expect(graph.getNeighbors(2)).toEqual([]); // Directed - no reverse edge
    });

    it("should add edge with weight", () => {
      const callback = vi.fn();
      const graph = new TrackedGraph<number>(true, callback);

      graph.addEdge(1, 2, 5);

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            from: 1,
            to: 2,
            weight: 5,
          }),
        }),
      );
    });

    it("should auto-create vertices when adding edge", () => {
      const graph = new TrackedGraph<number>();
      graph.addEdge(1, 2);
      expect(graph.getSize()).toBe(2);
    });

    it("should remove an edge", () => {
      const callback = vi.fn();
      const graph = new TrackedGraph<number>(false, callback);

      graph.addEdge(1, 2);
      const removed = graph.removeEdge(1, 2);

      expect(removed).toBe(true);
      expect(graph.getNeighbors(1)).toEqual([]);
      expect(graph.getNeighbors(2)).toEqual([]);
    });

    it("should return false when removing non-existent edge", () => {
      const callback = vi.fn();
      const graph = new TrackedGraph<number>(false, callback);

      graph.addVertex(1);
      const removed = graph.removeEdge(1, 99);

      expect(removed).toBe(false);
    });

    it("should return false when removing edge from non-existent vertex", () => {
      const callback = vi.fn();
      const graph = new TrackedGraph<number>(false, callback);

      const removed = graph.removeEdge(99, 1);

      expect(removed).toBe(false);
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            removed: false,
            message: "Source vertex not found",
          }),
        }),
      );
    });

    it("should get all edges", () => {
      const graph = new TrackedGraph<number>(false);
      graph.addEdge(1, 2).addEdge(2, 3).addEdge(1, 3);

      const edges = graph.getEdges();
      expect(edges).toHaveLength(3);
      expect(edges).toEqual(
        expect.arrayContaining([
          { from: 1, to: 2 },
          { from: 2, to: 3 },
          { from: 1, to: 3 },
        ]),
      );
    });
  });

  describe("BFS Traversal", () => {
    it("should perform BFS traversal", () => {
      const callback = vi.fn();
      const graph = new TrackedGraph<number>(false, callback);

      graph.addEdge(1, 2).addEdge(1, 3).addEdge(2, 4);

      const result = graph.bfs(1);

      expect(result).toEqual([1, 2, 3, 4]);
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "bfs",
          metadata: expect.objectContaining({
            start: 1,
            completed: true,
          }),
        }),
      );
    });

    it("should handle BFS from non-existent vertex", () => {
      const callback = vi.fn();
      const graph = new TrackedGraph<number>(false, callback);

      const result = graph.bfs(99);

      expect(result).toEqual([]);
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            message: "Start vertex not found",
          }),
        }),
      );
    });

    it("should emit steps during BFS traversal", () => {
      const callback = vi.fn();
      const graph = new TrackedGraph<number>(false, callback);

      graph.addEdge(1, 2);
      callback.mockClear();

      graph.bfs(1);

      // Should emit steps for each visited vertex + final completion step
      const bfsSteps = callback.mock.calls.filter((call) => call[0].type === "bfs");
      expect(bfsSteps.length).toBeGreaterThan(1);
    });
  });

  describe("DFS Traversal", () => {
    it("should perform DFS traversal", () => {
      const callback = vi.fn();
      const graph = new TrackedGraph<number>(false, callback);

      graph.addEdge(1, 2).addEdge(1, 3).addEdge(2, 4);

      const result = graph.dfs(1);

      expect(result).toHaveLength(4);
      expect(result).toContain(1);
      expect(result).toContain(2);
      expect(result).toContain(3);
      expect(result).toContain(4);
    });

    it("should handle DFS from non-existent vertex", () => {
      const callback = vi.fn();
      const graph = new TrackedGraph<number>(false, callback);

      const result = graph.dfs(99);

      expect(result).toEqual([]);
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            message: "Start vertex not found",
          }),
        }),
      );
    });
  });

  describe("Cycle Detection", () => {
    it("should detect cycle in undirected graph", () => {
      const callback = vi.fn();
      const graph = new TrackedGraph<number>(false, callback);

      graph.addEdge(1, 2).addEdge(2, 3).addEdge(3, 1); // Triangle

      const hasCycle = graph.hasCycle();

      expect(hasCycle).toBe(true);
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "hasCycle",
          metadata: expect.objectContaining({
            hasCycle: true,
          }),
        }),
      );
    });

    it("should detect no cycle in tree", () => {
      const callback = vi.fn();
      const graph = new TrackedGraph<number>(false, callback);

      graph.addEdge(1, 2).addEdge(1, 3).addEdge(2, 4);

      const hasCycle = graph.hasCycle();

      expect(hasCycle).toBe(false);
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            hasCycle: false,
          }),
        }),
      );
    });

    it("should detect cycle in directed graph", () => {
      const graph = new TrackedGraph<number>(true);

      graph.addEdge(1, 2).addEdge(2, 3).addEdge(3, 1); // Cycle

      const hasCycle = graph.hasCycle();

      expect(hasCycle).toBe(true);
    });
  });

  describe("Shortest Path", () => {
    it("should find shortest path", () => {
      const callback = vi.fn();
      const graph = new TrackedGraph<number>(false, callback);

      graph.addEdge(1, 2).addEdge(2, 3).addEdge(1, 4).addEdge(4, 3);

      const path = graph.shortestPath(1, 3);

      expect(path).not.toBeNull();
      expect(path).toHaveLength(3); // Path length 2 (3 vertices)
      expect(path?.[0]).toBe(1);
      expect(path?.[path.length - 1]).toBe(3);
    });

    it("should return null when no path exists", () => {
      const callback = vi.fn();
      const graph = new TrackedGraph<number>(false, callback);

      graph.addVertex(1).addVertex(2); // Disconnected

      const path = graph.shortestPath(1, 2);

      expect(path).toBeNull();
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            found: false,
            message: "No path found",
          }),
        }),
      );
    });

    it("should return null when vertices don't exist", () => {
      const callback = vi.fn();
      const graph = new TrackedGraph<number>(false, callback);

      const path = graph.shortestPath(99, 100);

      expect(path).toBeNull();
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            message: "Start or end vertex not found",
          }),
        }),
      );
    });
  });

  describe("Utility Methods", () => {
    it("should get all vertices", () => {
      const graph = new TrackedGraph<number>();
      graph.addVertex(1).addVertex(2).addVertex(3);
      expect(graph.getVertices()).toEqual([1, 2, 3]);
    });

    it("should get neighbors of a vertex", () => {
      const graph = new TrackedGraph<number>();
      graph.addEdge(1, 2).addEdge(1, 3);
      expect(graph.getNeighbors(1)).toEqual(expect.arrayContaining([2, 3]));
    });

    it("should return empty array for non-existent vertex neighbors", () => {
      const graph = new TrackedGraph<number>();
      expect(graph.getNeighbors(99)).toEqual([]);
    });

    it("should get size", () => {
      const graph = new TrackedGraph<number>();
      graph.addVertex(1).addVertex(2);
      expect(graph.getSize()).toBe(2);
    });

    it("should check if empty", () => {
      const graph = new TrackedGraph<number>();
      expect(graph.isEmpty()).toBe(true);
      graph.addVertex(1);
      expect(graph.isEmpty()).toBe(false);
    });

    it("should clear the graph", () => {
      const callback = vi.fn();
      const graph = new TrackedGraph<number>(false, callback);

      graph.addEdge(1, 2).addEdge(2, 3);
      graph.clear();

      expect(graph.isEmpty()).toBe(true);
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "clear",
          metadata: expect.objectContaining({
            cleared: true,
          }),
        }),
      );
    });

    it("should convert to array representation", () => {
      const graph = new TrackedGraph<number>();
      graph.addEdge(1, 2).addEdge(2, 3);

      const arr = graph.toArray();

      expect(arr).toEqual(
        expect.arrayContaining([
          { vertex: 1, neighbors: expect.arrayContaining([2]) },
          { vertex: 2, neighbors: expect.arrayContaining([1, 3]) },
          { vertex: 3, neighbors: expect.arrayContaining([2]) },
        ]),
      );
    });

    it("should get data as Map", () => {
      const graph = new TrackedGraph<number>();
      graph.addEdge(1, 2);

      const data = graph.getData();

      expect(data instanceof Map).toBe(true);
      expect(data.get(1)).toEqual([2]);
    });
  });

  describe("Generic Type Support", () => {
    it("should work with string vertices", () => {
      const graph = new TrackedGraph<string>();
      graph.addEdge("A", "B").addEdge("B", "C");

      expect(graph.getSize()).toBe(3);
      expect(graph.getNeighbors("A")).toEqual(["B"]);
    });

    it("should work with object vertices", () => {
      const graph = new TrackedGraph<{ id: number; name: string }>();
      const v1 = { id: 1, name: "A" };
      const v2 = { id: 2, name: "B" };

      graph.addEdge(v1, v2);

      expect(graph.getSize()).toBe(2);
    });
  });

  describe("Callback Integration", () => {
    it("should emit visualization steps", () => {
      const callback = vi.fn();
      const graph = new TrackedGraph<number>(false, callback);

      graph.addVertex(1);

      expect(callback).toHaveBeenCalledTimes(1);
      const step: VisualizationStep | undefined = callback.mock.calls[0]?.[0];
      expect(step).toMatchObject({
        type: "addVertex",
        target: "graph",
        args: [1],
        timestamp: expect.any(Number),
      });
    });

    it("should work without callback", () => {
      const graph = new TrackedGraph<number>();
      expect(() => graph.addVertex(1)).not.toThrow();
    });
  });
});
