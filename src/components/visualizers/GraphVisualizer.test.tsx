import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import GraphVisualizer from "./GraphVisualizer";
import type { VisualizationStep } from "../../store/useAppStore";

interface TestGraphNode {
  id: string | number;
  label?: string;
  edges: Array<{
    from: string | number;
    to: string | number;
    weight?: number;
    directed?: boolean;
  }>;
}

describe("GraphVisualizer", () => {
  afterEach(() => {
    cleanup();
  });

  describe("Rendering", () => {
    it("should render empty message when data is null", () => {
      render(<GraphVisualizer data={null} />);
      expect(screen.getByText("No graph data")).toBeInTheDocument();
    });

    it("should render empty message when data is empty array", () => {
      render(<GraphVisualizer data={[]} />);
      expect(screen.getByText("No graph data")).toBeInTheDocument();
    });

    it("should render SVG container", () => {
      const nodes: TestGraphNode[] = [
        { id: "A", label: "A", edges: [] },
        { id: "B", label: "B", edges: [] },
      ];
      const { container } = render(<GraphVisualizer data={nodes} />);
      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute("viewBox", "0 0 800 600");
    });

    it("should render single node", () => {
      const nodes: TestGraphNode[] = [{ id: "A", label: "A", edges: [] }];
      const { container } = render(<GraphVisualizer data={nodes} />);
      const circles = container.querySelectorAll(".node-circle");
      expect(circles.length).toBe(1);
    });

    it("should render multiple nodes", () => {
      const nodes: TestGraphNode[] = [
        { id: "A", label: "A", edges: [] },
        { id: "B", label: "B", edges: [] },
        { id: "C", label: "C", edges: [] },
      ];
      const { container } = render(<GraphVisualizer data={nodes} />);
      const circles = container.querySelectorAll(".node-circle");
      expect(circles.length).toBe(3);
    });

    it("should render node labels", () => {
      const nodes: TestGraphNode[] = [
        { id: "A", label: "Node A", edges: [] },
        { id: "B", label: "Node B", edges: [] },
      ];
      const { container } = render(<GraphVisualizer data={nodes} />);
      const labels = container.querySelectorAll(".node-label");
      expect(labels.length).toBe(2);
      expect(labels[0]?.textContent).toBe("Node A");
      expect(labels[1]?.textContent).toBe("Node B");
    });

    it("should render edges between nodes", () => {
      const nodes: TestGraphNode[] = [
        {
          id: "A",
          label: "A",
          edges: [{ from: "A", to: "B", weight: 1, directed: true }],
        },
        { id: "B", label: "B", edges: [] },
      ];
      const { container } = render(<GraphVisualizer data={nodes} />);
      const links = container.querySelectorAll(".link");
      expect(links.length).toBe(1);
    });
  });

  describe("Step Operations", () => {
    it("should display addVertex step", () => {
      const nodes: TestGraphNode[] = [{ id: "A", label: "A", edges: [] }];
      const steps: VisualizationStep[] = [
        {
          type: "addVertex",
          target: "graph",
          args: ["A"],
          result: nodes,
          timestamp: Date.now(),
          metadata: { vertex: "A" },
        },
      ];
      render(<GraphVisualizer data={nodes} steps={steps} currentStepIndex={0} />);
      expect(screen.getByText("Add vertex: A")).toBeInTheDocument();
    });

    it("should display addEdge step", () => {
      const nodes: TestGraphNode[] = [
        {
          id: "A",
          label: "A",
          edges: [{ from: "A", to: "B", weight: 5, directed: true }],
        },
        { id: "B", label: "B", edges: [] },
      ];
      const steps: VisualizationStep[] = [
        {
          type: "addEdge",
          target: "graph",
          args: ["A", "B", 5],
          result: nodes,
          timestamp: Date.now(),
          metadata: { from: "A", to: "B", weight: 5 },
        },
      ];
      render(<GraphVisualizer data={nodes} steps={steps} currentStepIndex={0} />);
      expect(screen.getByText("Add edge: A → B (weight: 5)")).toBeInTheDocument();
    });

    it("should display addEdge step without weight", () => {
      const nodes: TestGraphNode[] = [
        {
          id: "A",
          label: "A",
          edges: [{ from: "A", to: "B", directed: true }],
        },
        { id: "B", label: "B", edges: [] },
      ];
      const steps: VisualizationStep[] = [
        {
          type: "addEdge",
          target: "graph",
          args: ["A", "B"],
          result: nodes,
          timestamp: Date.now(),
          metadata: { from: "A", to: "B" },
        },
      ];
      render(<GraphVisualizer data={nodes} steps={steps} currentStepIndex={0} />);
      expect(screen.getByText("Add edge: A → B")).toBeInTheDocument();
    });

    it("should display removeVertex step", () => {
      const nodes: TestGraphNode[] = [{ id: "A", label: "A", edges: [] }];
      const steps: VisualizationStep[] = [
        {
          type: "removeVertex",
          target: "graph",
          args: ["B"],
          result: nodes,
          timestamp: Date.now(),
          metadata: { vertex: "B" },
        },
      ];
      render(<GraphVisualizer data={nodes} steps={steps} currentStepIndex={0} />);
      expect(screen.getByText("Remove vertex: B")).toBeInTheDocument();
    });

    it("should display removeEdge step", () => {
      const nodes: TestGraphNode[] = [
        { id: "A", label: "A", edges: [] },
        { id: "B", label: "B", edges: [] },
      ];
      const steps: VisualizationStep[] = [
        {
          type: "removeEdge",
          target: "graph",
          args: ["A", "B"],
          result: nodes,
          timestamp: Date.now(),
          metadata: { from: "A", to: "B" },
        },
      ];
      render(<GraphVisualizer data={nodes} steps={steps} currentStepIndex={0} />);
      expect(screen.getByText("Remove edge: A → B")).toBeInTheDocument();
    });

    it("should display BFS step with current vertex", () => {
      const nodes: TestGraphNode[] = [
        { id: "A", label: "A", edges: [] },
        { id: "B", label: "B", edges: [] },
      ];
      const steps: VisualizationStep[] = [
        {
          type: "bfs",
          target: "graph",
          args: ["A"],
          result: ["A", "B"],
          timestamp: Date.now(),
          metadata: { current: "B", visited: new Set(["A", "B"]) },
        },
      ];
      render(<GraphVisualizer data={nodes} steps={steps} currentStepIndex={0} />);
      expect(screen.getByText("BFS: Visiting B")).toBeInTheDocument();
    });

    it("should display BFS step without current vertex", () => {
      const nodes: TestGraphNode[] = [
        { id: "A", label: "A", edges: [] },
        { id: "B", label: "B", edges: [] },
      ];
      const steps: VisualizationStep[] = [
        {
          type: "bfs",
          target: "graph",
          args: ["A"],
          result: [],
          timestamp: Date.now(),
          metadata: {},
        },
      ];
      render(<GraphVisualizer data={nodes} steps={steps} currentStepIndex={0} />);
      expect(screen.getByText("BFS: Starting traversal")).toBeInTheDocument();
    });

    it("should display DFS step with current vertex", () => {
      const nodes: TestGraphNode[] = [
        { id: "A", label: "A", edges: [] },
        { id: "B", label: "B", edges: [] },
      ];
      const steps: VisualizationStep[] = [
        {
          type: "dfs",
          target: "graph",
          args: ["A"],
          result: ["A", "B"],
          timestamp: Date.now(),
          metadata: { current: "B", visited: new Set(["A", "B"]) },
        },
      ];
      render(<GraphVisualizer data={nodes} steps={steps} currentStepIndex={0} />);
      expect(screen.getByText("DFS: Visiting B")).toBeInTheDocument();
    });

    it("should display hasCycle step with cycle found", () => {
      const nodes: TestGraphNode[] = [
        {
          id: "A",
          label: "A",
          edges: [{ from: "A", to: "B", directed: true }],
        },
        {
          id: "B",
          label: "B",
          edges: [{ from: "B", to: "A", directed: true }],
        },
      ];
      const steps: VisualizationStep[] = [
        {
          type: "hasCycle",
          target: "graph",
          args: [],
          result: true,
          timestamp: Date.now(),
          metadata: { hasCycle: true },
        },
      ];
      render(<GraphVisualizer data={nodes} steps={steps} currentStepIndex={0} />);
      expect(screen.getByText("Cycle detection: Cycle found!")).toBeInTheDocument();
    });

    it("should display hasCycle step with no cycle", () => {
      const nodes: TestGraphNode[] = [
        {
          id: "A",
          label: "A",
          edges: [{ from: "A", to: "B", directed: true }],
        },
        { id: "B", label: "B", edges: [] },
      ];
      const steps: VisualizationStep[] = [
        {
          type: "hasCycle",
          target: "graph",
          args: [],
          result: false,
          timestamp: Date.now(),
          metadata: { hasCycle: false },
        },
      ];
      render(<GraphVisualizer data={nodes} steps={steps} currentStepIndex={0} />);
      expect(screen.getByText("Cycle detection: No cycle")).toBeInTheDocument();
    });

    it("should display shortestPath step with path found", () => {
      const nodes: TestGraphNode[] = [
        {
          id: "A",
          label: "A",
          edges: [{ from: "A", to: "B", directed: true }],
        },
        {
          id: "B",
          label: "B",
          edges: [{ from: "B", to: "C", directed: true }],
        },
        { id: "C", label: "C", edges: [] },
      ];
      const steps: VisualizationStep[] = [
        {
          type: "shortestPath",
          target: "graph",
          args: ["A", "C"],
          result: ["A", "B", "C"],
          timestamp: Date.now(),
          metadata: { path: ["A", "B", "C"] },
        },
      ];
      render(<GraphVisualizer data={nodes} steps={steps} currentStepIndex={0} />);
      expect(screen.getByText("Shortest path: A → B → C")).toBeInTheDocument();
    });

    it("should display shortestPath step with no path", () => {
      const nodes: TestGraphNode[] = [
        { id: "A", label: "A", edges: [] },
        { id: "B", label: "B", edges: [] },
      ];
      const steps: VisualizationStep[] = [
        {
          type: "shortestPath",
          target: "graph",
          args: ["A", "B"],
          result: [],
          timestamp: Date.now(),
          metadata: {},
        },
      ];
      render(<GraphVisualizer data={nodes} steps={steps} currentStepIndex={0} />);
      expect(screen.getByText("Shortest path: No path found")).toBeInTheDocument();
    });

    it("should display clear step", () => {
      const nodes: TestGraphNode[] = [];
      const steps: VisualizationStep[] = [
        {
          type: "clear",
          target: "graph",
          args: [],
          result: [],
          timestamp: Date.now(),
          metadata: { cleared: true },
        },
      ];
      render(<GraphVisualizer data={nodes} steps={steps} currentStepIndex={0} />);
      expect(screen.getByText("Clear graph")).toBeInTheDocument();
    });

    it("should display No operation when step index is -1", () => {
      const nodes: TestGraphNode[] = [{ id: "A", label: "A", edges: [] }];
      render(<GraphVisualizer data={nodes} currentStepIndex={-1} />);
      expect(screen.getByText("No operation")).toBeInTheDocument();
    });
  });

  describe("Highlighting", () => {
    it("should highlight active vertex during addVertex", () => {
      const nodes: TestGraphNode[] = [{ id: "A", label: "A", edges: [] }];
      const steps: VisualizationStep[] = [
        {
          type: "addVertex",
          target: "graph",
          args: ["A"],
          result: nodes,
          timestamp: Date.now(),
          metadata: { vertex: "A" },
        },
      ];
      const { container } = render(
        <GraphVisualizer data={nodes} steps={steps} currentStepIndex={0} />,
      );
      const activeCircles = container.querySelectorAll(".node-circle.active");
      expect(activeCircles.length).toBe(1);
    });

    it("should highlight current vertex during BFS traversal", () => {
      const nodes: TestGraphNode[] = [
        { id: "A", label: "A", edges: [] },
        { id: "B", label: "B", edges: [] },
      ];
      const steps: VisualizationStep[] = [
        {
          type: "bfs",
          target: "graph",
          args: ["A"],
          result: ["A", "B"],
          timestamp: Date.now(),
          metadata: { current: "B", visited: new Set(["A", "B"]) },
        },
      ];
      const { container } = render(
        <GraphVisualizer data={nodes} steps={steps} currentStepIndex={0} />,
      );
      const currentCircles = container.querySelectorAll(".node-circle.current");
      expect(currentCircles.length).toBe(1);
    });

    it("should highlight visited vertices during traversal", () => {
      const nodes: TestGraphNode[] = [
        { id: "A", label: "A", edges: [] },
        { id: "B", label: "B", edges: [] },
        { id: "C", label: "C", edges: [] },
      ];
      const steps: VisualizationStep[] = [
        {
          type: "bfs",
          target: "graph",
          args: ["A"],
          result: ["A", "B", "C"],
          timestamp: Date.now(),
          metadata: { current: "C", visited: new Set(["A", "B"]) },
        },
      ];
      const { container } = render(
        <GraphVisualizer data={nodes} steps={steps} currentStepIndex={0} />,
      );
      const visitedCircles = container.querySelectorAll(".node-circle.visited");
      expect(visitedCircles.length).toBe(2); // A and B are visited
    });
  });

  describe("Edge Cases", () => {
    it("should handle undefined steps", () => {
      const nodes: TestGraphNode[] = [{ id: "A", label: "A", edges: [] }];
      render(<GraphVisualizer data={nodes} steps={undefined} />);
      expect(screen.getByText("No operation")).toBeInTheDocument();
    });

    it("should handle out-of-bounds step index", () => {
      const nodes: TestGraphNode[] = [{ id: "A", label: "A", edges: [] }];
      const steps: VisualizationStep[] = [
        {
          type: "addVertex",
          target: "graph",
          args: ["A"],
          result: nodes,
          timestamp: Date.now(),
          metadata: { vertex: "A" },
        },
      ];
      render(<GraphVisualizer data={nodes} steps={steps} currentStepIndex={10} />);
      expect(screen.getByText("No operation")).toBeInTheDocument();
    });

    it("should handle graph with numeric IDs", () => {
      const nodes: TestGraphNode[] = [
        { id: 1, label: "Node 1", edges: [] },
        { id: 2, label: "Node 2", edges: [] },
      ];
      const { container } = render(<GraphVisualizer data={nodes} />);
      const circles = container.querySelectorAll(".node-circle");
      expect(circles.length).toBe(2);
    });

    it("should handle nodes without labels", () => {
      const nodes: TestGraphNode[] = [
        { id: "A", edges: [] },
        { id: "B", edges: [] },
      ];
      const { container } = render(<GraphVisualizer data={nodes} />);
      const labels = container.querySelectorAll(".node-label");
      expect(labels[0]?.textContent).toBe("A"); // Falls back to ID
      expect(labels[1]?.textContent).toBe("B");
    });

    it("should re-render when data changes", () => {
      const nodes1: TestGraphNode[] = [{ id: "A", label: "A", edges: [] }];
      const { container, rerender } = render(<GraphVisualizer data={nodes1} />);
      let circles = container.querySelectorAll(".node-circle");
      expect(circles.length).toBe(1);

      const nodes2: TestGraphNode[] = [
        { id: "A", label: "A", edges: [] },
        { id: "B", label: "B", edges: [] },
      ];
      rerender(<GraphVisualizer data={nodes2} />);
      circles = container.querySelectorAll(".node-circle");
      expect(circles.length).toBe(2);
    });
  });

  describe("Cleanup", () => {
    it("should cleanup simulation on unmount", () => {
      const nodes: TestGraphNode[] = [
        { id: "A", label: "A", edges: [] },
        { id: "B", label: "B", edges: [] },
      ];
      const { unmount } = render(<GraphVisualizer data={nodes} />);
      unmount();
      // Should not throw errors
    });
  });
});
