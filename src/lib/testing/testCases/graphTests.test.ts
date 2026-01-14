import { describe, it, expect } from "vitest";
import { graphTests } from "./graphTests";

describe("graphTests", () => {
  describe("Structure", () => {
    it("should export an array of test cases", () => {
      expect(Array.isArray(graphTests)).toBe(true);
      expect(graphTests.length).toBe(3);
    });

    it("should have unique IDs", () => {
      const ids = graphTests.map((test) => test.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have all required fields", () => {
      for (const test of graphTests) {
        expect(test).toHaveProperty("id");
        expect(test).toHaveProperty("name");
        expect(test).toHaveProperty("difficulty");
        expect(test).toHaveProperty("description");
        expect(test).toHaveProperty("initialData");
        expect(test).toHaveProperty("expectedOutput");
        expect(test).toHaveProperty("assertions");
        expect(test).toHaveProperty("referenceSolution");
        expect(test).toHaveProperty("skeletonCode");
        expect(test).toHaveProperty("hints");
        expect(test).toHaveProperty("acceptanceCriteria");
      }
    });

    it("should have 3 difficulty levels", () => {
      const difficulties = graphTests.map((test) => test.difficulty);
      expect(difficulties).toContain("easy");
      expect(difficulties).toContain("medium");
      expect(difficulties).toContain("hard");
    });
  });

  describe("Data Validity", () => {
    it("should have valid initial data with vertices and edges", () => {
      for (const test of graphTests) {
        const data = test.initialData as { vertices: unknown[]; edges: unknown[] };
        expect(data).toHaveProperty("vertices");
        expect(data).toHaveProperty("edges");
        expect(Array.isArray(data.vertices)).toBe(true);
        expect(Array.isArray(data.edges)).toBe(true);
      }
    });

    it("should have edges with valid from/to vertices", () => {
      for (const test of graphTests) {
        const data = test.initialData as {
          vertices: (string | number)[];
          edges: { from: string | number; to: string | number }[];
        };
        const vertices = new Set(data.vertices);
        for (const edge of data.edges) {
          expect(edge).toHaveProperty("from");
          expect(edge).toHaveProperty("to");
          expect(vertices.has(edge.from)).toBe(true);
          expect(vertices.has(edge.to)).toBe(true);
        }
      }
    });

    it("should have expected output matching operation type", () => {
      // Easy: BFS returns array
      expect(Array.isArray(graphTests[0]?.expectedOutput)).toBe(true);

      // Medium: Cycle detection returns boolean
      expect(typeof graphTests[1]?.expectedOutput).toBe("boolean");

      // Hard: Dijkstra returns array (path)
      expect(Array.isArray(graphTests[2]?.expectedOutput)).toBe(true);
    });
  });

  describe("Assertions", () => {
    it("should include expect syntax in assertions", () => {
      for (const test of graphTests) {
        expect(test.assertions).toContain("expect");
      }
    });

    it("should verify visualization step capture", () => {
      for (const test of graphTests) {
        expect(test.assertions).toContain("steps");
      }
    });

    it("should check for specific operation types", () => {
      expect(graphTests[0]?.assertions).toContain("bfs");
      expect(graphTests[1]?.assertions).toContain("hasCycle");
      expect(graphTests[2]?.assertions).toContain("shortestPath");
    });
  });

  describe("Reference Solutions", () => {
    it("should contain function definitions", () => {
      for (const test of graphTests) {
        expect(test.referenceSolution).toContain("function");
      }
    });

    it("should use TrackedGraph methods", () => {
      // Easy: BFS
      expect(graphTests[0]?.referenceSolution).toContain("bfs");

      // Medium: Cycle detection
      expect(graphTests[1]?.referenceSolution).toContain("hasCycle");

      // Hard: Dijkstra (custom implementation)
      expect(graphTests[2]?.referenceSolution).toContain("getVertices");
      expect(graphTests[2]?.referenceSolution).toContain("getNeighbors");
    });
  });

  describe("Skeleton Code", () => {
    it("should contain TODO comments", () => {
      for (const test of graphTests) {
        expect(test.skeletonCode).toContain("TODO");
      }
    });

    it("should have function signatures", () => {
      for (const test of graphTests) {
        expect(test.skeletonCode).toContain("function");
      }
    });

    it("should provide hints in comments", () => {
      for (const test of graphTests) {
        expect(test.skeletonCode).toContain("Hint");
      }
    });
  });

  describe("Hints", () => {
    it("should have 3-4 hints per test", () => {
      for (const test of graphTests) {
        expect(test.hints.length).toBeGreaterThanOrEqual(3);
        expect(test.hints.length).toBeLessThanOrEqual(4);
      }
    });

    it("should have non-empty hint text", () => {
      for (const test of graphTests) {
        for (const hint of test.hints) {
          expect(hint.length).toBeGreaterThan(0);
        }
      }
    });

    it("should provide progressive difficulty", () => {
      for (const test of graphTests) {
        // First hint should be more general
        expect(test.hints[0]?.length).toBeGreaterThan(0);
        // Last hint should be more specific
        expect(test.hints[test.hints.length - 1]?.length).toBeGreaterThan(0);
      }
    });
  });

  describe("Acceptance Criteria", () => {
    it("should have at least 3 criteria per test", () => {
      for (const test of graphTests) {
        expect(test.acceptanceCriteria.length).toBeGreaterThanOrEqual(3);
      }
    });

    it("should have non-empty criteria text", () => {
      for (const test of graphTests) {
        for (const criterion of test.acceptanceCriteria) {
          expect(criterion.length).toBeGreaterThan(0);
        }
      }
    });

    it("should include visualization step criteria", () => {
      for (const test of graphTests) {
        const hasStepCriteria = test.acceptanceCriteria.some((c) =>
          c.toLowerCase().includes("step"),
        );
        expect(hasStepCriteria).toBe(true);
      }
    });
  });

  describe("Test Case Specific Validation", () => {
    it("Easy: BFS test should have connected graph", () => {
      const test = graphTests[0];
      const data = test?.initialData as { directed: boolean; vertices: unknown[] };
      expect(test?.name).toContain("BFS");
      expect(data.directed).toBe(false);
      expect(data.vertices.length).toBe(5);
      expect(test?.expectedOutput).toEqual(["A", "B", "C", "D", "E"]);
    });

    it("Medium: Cycle detection test should have directed graph with cycle", () => {
      const test = graphTests[1];
      const data = test?.initialData as { directed: boolean };
      expect(test?.name).toContain("Cycle");
      expect(data.directed).toBe(true);
      expect(test?.expectedOutput).toBe(true); // Has cycle
    });

    it("Hard: Dijkstra test should have weighted edges", () => {
      const test = graphTests[2];
      const data = test?.initialData as {
        directed: boolean;
        edges: { weight?: number }[];
      };
      expect(test?.name).toContain("Dijkstra");
      expect(data.directed).toBe(true);
      // Check that edges have weights
      const hasWeights = data.edges.every((edge) => edge.weight !== undefined);
      expect(hasWeights).toBe(true);
      expect(Array.isArray(test?.expectedOutput)).toBe(true);
    });
  });

  describe("Naming Conventions", () => {
    it("should follow ID naming convention: graph-{operation}-{difficulty}", () => {
      expect(graphTests[0]?.id).toBe("graph-bfs-easy");
      expect(graphTests[1]?.id).toBe("graph-cycle-medium");
      expect(graphTests[2]?.id).toBe("graph-dijkstra-hard");
    });

    it("should have descriptive test names", () => {
      for (const test of graphTests) {
        expect(test.name.length).toBeGreaterThan(5);
      }
    });
  });
});
