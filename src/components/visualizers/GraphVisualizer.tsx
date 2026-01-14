import { useEffect, useRef } from "react";
import * as d3 from "d3";
import type { VisualizationStep } from "../../store/useAppStore";
import "./GraphVisualizer.css";

interface VisualGraphNode {
  id: string | number;
  label?: string;
  edges?: Array<{
    from: string | number;
    to: string | number;
    weight?: number;
    directed?: boolean;
  }>;
}

interface GraphVisualizerProps {
  data: VisualGraphNode[] | null;
  steps?: VisualizationStep[];
  currentStepIndex?: number;
  isAnimating?: boolean;
}

interface D3Node extends d3.SimulationNodeDatum {
  id: string;
  label: string;
}

interface D3Link extends d3.SimulationLinkDatum<D3Node> {
  source: string | D3Node;
  target: string | D3Node;
  weight?: number;
}

function GraphVisualizer({
  data,
  steps = [],
  currentStepIndex = -1,
  isAnimating = false,
}: GraphVisualizerProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<D3Node, D3Link> | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = 800;
    const height = 600;

    // Clear previous content
    svg.selectAll("*").remove();

    if (!data || data.length === 0) {
      svg
        .append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .attr("class", "empty-message")
        .text("No graph data");
      return;
    }

    // Create main group
    const mainGroup = svg.append("g").attr("class", "main-group");

    // Convert graph data to D3 nodes and links
    const nodes: D3Node[] = data.map((node) => ({
      id: String(node.id),
      label: String(node.label || node.id),
    }));

    const links: D3Link[] = [];
    for (const node of data) {
      if (node.edges) {
        for (const edge of node.edges) {
          links.push({
            source: String(edge.from),
            target: String(edge.to),
            weight: edge.weight,
          });
        }
      }
    }

    // Create force simulation
    const simulation = d3
      .forceSimulation<D3Node>(nodes)
      .force(
        "link",
        d3
          .forceLink<D3Node, D3Link>(links)
          .id((d) => d.id)
          .distance(100),
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(40));

    simulationRef.current = simulation;

    // Define arrow marker for directed edges
    const defs = mainGroup.append("defs");
    defs
      .append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 25)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#999");

    // Get current step metadata for highlighting
    const currentStep = steps[currentStepIndex];
    const metadata = currentStep?.metadata as
      | {
          vertex?: string | number;
          from?: string | number;
          to?: string | number;
          visited?: Set<string | number>;
          current?: string | number;
        }
      | undefined;

    const visitedSet =
      metadata?.visited instanceof Set
        ? new Set(Array.from(metadata.visited).map(String))
        : new Set<string>();
    const currentVertex = metadata?.current ? String(metadata.current) : null;
    const activeVertex = metadata?.vertex ? String(metadata.vertex) : null;
    const activeEdgeFrom = metadata?.from ? String(metadata.from) : null;
    const activeEdgeTo = metadata?.to ? String(metadata.to) : null;

    // Create links
    const link = mainGroup
      .append("g")
      .attr("class", "links")
      .selectAll<SVGLineElement, D3Link>("line")
      .data(links)
      .join("line")
      .attr("class", "link")
      .attr("marker-end", "url(#arrowhead)")
      .attr("stroke", (d) => {
        const source = typeof d.source === "object" ? d.source.id : String(d.source);
        const target = typeof d.target === "object" ? d.target.id : String(d.target);
        if (activeEdgeFrom === source && activeEdgeTo === target && currentStepIndex >= 0) {
          return "#10b981"; // green for active edge
        }
        return "#999";
      })
      .attr("stroke-width", 2);

    // Create nodes
    const node = mainGroup
      .append("g")
      .attr("class", "nodes")
      .selectAll<SVGGElement, D3Node>("g")
      .data(nodes)
      .join("g")
      .attr("class", "node");

    // Add circles
    node
      .append("circle")
      .attr("r", 20)
      .attr("class", (d) => {
        if (currentStepIndex < 0) return "node-circle";
        if (currentVertex === d.id) return "node-circle current";
        if (activeVertex === d.id) return "node-circle active";
        if (visitedSet.has(d.id)) return "node-circle visited";
        return "node-circle";
      });

    // Add labels
    node
      .append("text")
      .attr("class", "node-label")
      .attr("text-anchor", "middle")
      .attr("dy", "0.3em")
      .text((d) => d.label);

    // Update positions on tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (typeof d.source === "object" ? d.source.x || 0 : 0))
        .attr("y1", (d) => (typeof d.source === "object" ? d.source.y || 0 : 0))
        .attr("x2", (d) => (typeof d.target === "object" ? d.target.x || 0 : 0))
        .attr("y2", (d) => (typeof d.target === "object" ? d.target.y || 0 : 0));

      node.attr("transform", (d) => `translate(${d.x || 0},${d.y || 0})`);
    });

    // Stop simulation after a while to save CPU
    simulation.alpha(1).restart();
    setTimeout(() => {
      simulation.stop();
    }, 3000);

    return () => {
      if (simulationRef.current) {
        simulationRef.current.stop();
      }
      svg.selectAll("*").remove();
    };
  }, [data, steps, currentStepIndex, isAnimating]);

  // Format step description
  const getStepDescription = (): string => {
    if (currentStepIndex < 0 || !steps[currentStepIndex]) {
      return "No operation";
    }

    const step = steps[currentStepIndex];
    const metadata = step.metadata as Record<string, unknown> | undefined;

    switch (step.type) {
      case "addVertex":
        return `Add vertex: ${metadata?.vertex}`;
      case "addEdge":
        return `Add edge: ${metadata?.from} → ${metadata?.to}${metadata?.weight ? ` (weight: ${metadata.weight})` : ""}`;
      case "removeVertex":
        return `Remove vertex: ${metadata?.vertex}`;
      case "removeEdge":
        return `Remove edge: ${metadata?.from} → ${metadata?.to}`;
      case "bfs":
        return metadata?.current ? `BFS: Visiting ${metadata.current}` : "BFS: Starting traversal";
      case "dfs":
        return metadata?.current ? `DFS: Visiting ${metadata.current}` : "DFS: Starting traversal";
      case "hasCycle":
        return `Cycle detection: ${metadata?.hasCycle ? "Cycle found!" : "No cycle"}`;
      case "shortestPath":
        return metadata?.path
          ? `Shortest path: ${Array.isArray(metadata.path) ? metadata.path.join(" → ") : metadata.path}`
          : "Shortest path: No path found";
      case "clear":
        return "Clear graph";
      default:
        return step.type;
    }
  };

  return (
    <div className="graph-visualizer">
      <svg ref={svgRef} viewBox="0 0 800 600" preserveAspectRatio="xMidYMid meet" />
      <div className="step-indicator">{getStepDescription()}</div>
    </div>
  );
}

export default GraphVisualizer;
