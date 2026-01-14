import { describe, it, expect } from "vitest";
import { bundleTrackedGraph } from "./trackedGraphBundle";

describe("bundleTrackedGraph", () => {
  describe("Bundle Structure", () => {
    it("should return a string", () => {
      const bundle = bundleTrackedGraph();
      expect(typeof bundle).toBe("string");
    });

    it("should contain TrackedGraph class definition", () => {
      const bundle = bundleTrackedGraph();
      expect(bundle).toContain("class TrackedGraph");
    });

    it("should contain constructor", () => {
      const bundle = bundleTrackedGraph();
      expect(bundle).toContain("constructor");
    });
  });

  describe("Method Presence", () => {
    it("should contain all 15 methods", () => {
      const bundle = bundleTrackedGraph();
      const methods = [
        "addVertex",
        "addEdge",
        "removeVertex",
        "removeEdge",
        "bfs",
        "dfs",
        "hasCycle",
        "shortestPath",
        "getVertices",
        "getEdges",
        "getNeighbors",
        "isDirected",
        "getSize",
        "isEmpty",
        "clear",
      ];

      for (const method of methods) {
        expect(bundle).toContain(method);
      }
    });

    it("should contain utility methods", () => {
      const bundle = bundleTrackedGraph();
      expect(bundle).toContain("toArray");
      expect(bundle).toContain("getData");
      expect(bundle).toContain("emitStep");
    });

    it("should contain static from method", () => {
      const bundle = bundleTrackedGraph();
      expect(bundle).toContain("static from");
    });

    it("should contain createTrackedGraph helper", () => {
      const bundle = bundleTrackedGraph();
      expect(bundle).toContain("function createTrackedGraph");
    });
  });

  describe("JavaScript Validity", () => {
    it("should be valid JavaScript code", () => {
      const bundle = bundleTrackedGraph();
      expect(() => {
        new Function(bundle);
      }).not.toThrow();
    });

    it("should create a functional TrackedGraph class", () => {
      const bundle = bundleTrackedGraph();
      const fn = new Function(bundle + "; return TrackedGraph;");
      const TrackedGraph = fn();
      expect(typeof TrackedGraph).toBe("function");
    });
  });

  describe("Functional Tests", () => {
    it("should create TrackedGraph instance via constructor", () => {
      const bundle = bundleTrackedGraph();
      const fn = new Function(bundle + "; return new TrackedGraph(false);");
      const graph = fn();
      expect(graph).toBeDefined();
    });

    it("should create TrackedGraph instance via static from method", () => {
      const bundle = bundleTrackedGraph();
      const fn = new Function(
        bundle + "; return TrackedGraph.from(['A', 'B'], [{ from: 'A', to: 'B' }], false);",
      );
      const graph = fn();
      expect(graph).toBeDefined();
    });

    it("should create TrackedGraph instance via createTrackedGraph helper", () => {
      const bundle = bundleTrackedGraph();
      const fn = new Function(
        bundle + "; return createTrackedGraph(['A', 'B'], [{ from: 'A', to: 'B' }], false);",
      );
      const graph = fn();
      expect(graph).toBeDefined();
    });

    it("should add vertices", () => {
      const bundle = bundleTrackedGraph();
      const fn = new Function(
        bundle +
          `
        const graph = new TrackedGraph(false);
        graph.addVertex('A');
        graph.addVertex('B');
        return graph.getSize();
      `,
      );
      const size = fn();
      expect(size).toBe(2);
    });

    it("should add edges", () => {
      const bundle = bundleTrackedGraph();
      const fn = new Function(
        bundle +
          `
        const graph = new TrackedGraph(false);
        graph.addVertex('A');
        graph.addVertex('B');
        graph.addEdge('A', 'B');
        return graph.getEdges().length;
      `,
      );
      const edgeCount = fn();
      expect(edgeCount).toBeGreaterThan(0);
    });

    it("should perform BFS traversal", () => {
      const bundle = bundleTrackedGraph();
      const fn = new Function(
        bundle +
          `
        const graph = new TrackedGraph(false);
        graph.addVertex('A');
        graph.addVertex('B');
        graph.addVertex('C');
        graph.addEdge('A', 'B');
        graph.addEdge('B', 'C');
        return graph.bfs('A');
      `,
      );
      const result = fn();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(3);
      expect(result[0]).toBe("A");
    });

    it("should perform DFS traversal", () => {
      const bundle = bundleTrackedGraph();
      const fn = new Function(
        bundle +
          `
        const graph = new TrackedGraph(false);
        graph.addVertex('A');
        graph.addVertex('B');
        graph.addVertex('C');
        graph.addEdge('A', 'B');
        graph.addEdge('B', 'C');
        return graph.dfs('A');
      `,
      );
      const result = fn();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(3);
      expect(result[0]).toBe("A");
    });

    it("should detect cycles in directed graph", () => {
      const bundle = bundleTrackedGraph();
      const fn = new Function(
        bundle +
          `
        const graph = new TrackedGraph(true);
        graph.addEdge('A', 'B', undefined, true);
        graph.addEdge('B', 'C', undefined, true);
        graph.addEdge('C', 'A', undefined, true);
        return graph.hasCycle();
      `,
      );
      const hasCycle = fn();
      expect(hasCycle).toBe(true);
    });

    it("should find shortest path", () => {
      const bundle = bundleTrackedGraph();
      const fn = new Function(
        bundle +
          `
        const graph = new TrackedGraph(false);
        graph.addEdge('A', 'B');
        graph.addEdge('B', 'C');
        return graph.shortestPath('A', 'C');
      `,
      );
      const path = fn();
      expect(Array.isArray(path)).toBe(true);
      expect(path.length).toBe(3);
      expect(path).toEqual(["A", "B", "C"]);
    });

    it("should return empty array for no path", () => {
      const bundle = bundleTrackedGraph();
      const fn = new Function(
        bundle +
          `
        const graph = new TrackedGraph(false);
        graph.addVertex('A');
        graph.addVertex('B');
        return graph.shortestPath('A', 'B');
      `,
      );
      const path = fn();
      expect(Array.isArray(path)).toBe(true);
      expect(path.length).toBe(0);
    });

    it("should get vertices", () => {
      const bundle = bundleTrackedGraph();
      const fn = new Function(
        bundle +
          `
        const graph = new TrackedGraph(false);
        graph.addVertex('A');
        graph.addVertex('B');
        graph.addVertex('C');
        return graph.getVertices();
      `,
      );
      const vertices = fn();
      expect(Array.isArray(vertices)).toBe(true);
      expect(vertices.length).toBe(3);
      expect(vertices).toContain("A");
      expect(vertices).toContain("B");
      expect(vertices).toContain("C");
    });

    it("should get neighbors", () => {
      const bundle = bundleTrackedGraph();
      const fn = new Function(
        bundle +
          `
        const graph = new TrackedGraph(false);
        graph.addEdge('A', 'B');
        graph.addEdge('A', 'C');
        return graph.getNeighbors('A');
      `,
      );
      const neighbors = fn();
      expect(Array.isArray(neighbors)).toBe(true);
      expect(neighbors.length).toBe(2);
    });

    it("should clear graph", () => {
      const bundle = bundleTrackedGraph();
      const fn = new Function(
        bundle +
          `
        const graph = new TrackedGraph(false);
        graph.addVertex('A');
        graph.addVertex('B');
        graph.clear();
        return graph.isEmpty();
      `,
      );
      const isEmpty = fn();
      expect(isEmpty).toBe(true);
    });

    it("should convert to array", () => {
      const bundle = bundleTrackedGraph();
      const fn = new Function(
        bundle +
          `
        const graph = new TrackedGraph(false);
        graph.addEdge('A', 'B');
        return graph.toArray();
      `,
      );
      const arr = fn();
      expect(Array.isArray(arr)).toBe(true);
      expect(arr.length).toBeGreaterThan(0);
      expect(arr[0]).toHaveProperty("id");
      expect(arr[0]).toHaveProperty("label");
      expect(arr[0]).toHaveProperty("edges");
    });
  });

  describe("Step Emission", () => {
    it("should emit steps when onOperation callback provided", () => {
      const bundle = bundleTrackedGraph();
      const fn = new Function(
        bundle +
          `
        const steps = [];
        const graph = new TrackedGraph(false, (step) => steps.push(step));
        graph.addVertex('A');
        return steps;
      `,
      );
      const steps = fn();
      expect(Array.isArray(steps)).toBe(true);
      expect(steps.length).toBeGreaterThan(0);
      expect(steps[0]).toHaveProperty("type");
      expect(steps[0]).toHaveProperty("target");
      expect(steps[0]?.type).toBe("addVertex");
    });

    it("should emit steps for addEdge", () => {
      const bundle = bundleTrackedGraph();
      const fn = new Function(
        bundle +
          `
        const steps = [];
        const graph = new TrackedGraph(false, (step) => steps.push(step));
        graph.addEdge('A', 'B');
        return steps.filter(s => s.type === 'addEdge');
      `,
      );
      const steps = fn();
      expect(steps.length).toBeGreaterThan(0);
    });

    it("should emit steps for BFS", () => {
      const bundle = bundleTrackedGraph();
      const fn = new Function(
        bundle +
          `
        const steps = [];
        const graph = new TrackedGraph(false, (step) => steps.push(step));
        graph.addEdge('A', 'B');
        graph.addEdge('B', 'C');
        graph.bfs('A');
        return steps.filter(s => s.type === 'bfs');
      `,
      );
      const steps = fn();
      expect(steps.length).toBeGreaterThan(0);
    });

    it("should emit steps for DFS", () => {
      const bundle = bundleTrackedGraph();
      const fn = new Function(
        bundle +
          `
        const steps = [];
        const graph = new TrackedGraph(false, (step) => steps.push(step));
        graph.addEdge('A', 'B');
        graph.addEdge('B', 'C');
        graph.dfs('A');
        return steps.filter(s => s.type === 'dfs');
      `,
      );
      const steps = fn();
      expect(steps.length).toBeGreaterThan(0);
    });

    it("should include metadata in emitted steps", () => {
      const bundle = bundleTrackedGraph();
      const fn = new Function(
        bundle +
          `
        const steps = [];
        const graph = new TrackedGraph(false, (step) => steps.push(step));
        graph.addVertex('A');
        return steps[0]?.metadata;
      `,
      );
      const metadata = fn();
      expect(metadata).toBeDefined();
      expect(metadata).toHaveProperty("vertex");
      expect(metadata.vertex).toBe("A");
    });
  });

  describe("Edge Cases", () => {
    it("should handle directed graphs", () => {
      const bundle = bundleTrackedGraph();
      const fn = new Function(
        bundle +
          `
        const graph = new TrackedGraph(true);
        graph.addEdge('A', 'B', undefined, true);
        return graph.isDirected();
      `,
      );
      const isDirected = fn();
      expect(isDirected).toBe(true);
    });

    it("should handle undirected graphs", () => {
      const bundle = bundleTrackedGraph();
      const fn = new Function(
        bundle +
          `
        const graph = new TrackedGraph(false);
        graph.addEdge('A', 'B');
        return graph.isDirected();
      `,
      );
      const isDirected = fn();
      expect(isDirected).toBe(false);
    });

    it("should handle weighted edges", () => {
      const bundle = bundleTrackedGraph();
      const fn = new Function(
        bundle +
          `
        const graph = new TrackedGraph(false);
        graph.addEdge('A', 'B', 5);
        const edges = graph.getEdges();
        return edges[0]?.weight;
      `,
      );
      const weight = fn();
      expect(weight).toBe(5);
    });

    it("should handle removing vertices", () => {
      const bundle = bundleTrackedGraph();
      const fn = new Function(
        bundle +
          `
        const graph = new TrackedGraph(false);
        graph.addVertex('A');
        graph.addVertex('B');
        graph.removeVertex('A');
        return graph.getSize();
      `,
      );
      const size = fn();
      expect(size).toBe(1);
    });

    it("should handle removing edges", () => {
      const bundle = bundleTrackedGraph();
      const fn = new Function(
        bundle +
          `
        const graph = new TrackedGraph(false);
        graph.addEdge('A', 'B');
        const beforeCount = graph.getEdges().length;
        graph.removeEdge('A', 'B');
        const afterCount = graph.getEdges().length;
        return { beforeCount, afterCount };
      `,
      );
      const result = fn();
      expect(result.afterCount).toBeLessThan(result.beforeCount);
    });
  });
});
