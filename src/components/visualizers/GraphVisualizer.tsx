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

// Store node positions to persist across renders
const nodePositions = new Map<string, { x: number; y: number }>();

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
    const duration = isAnimating ? 500 : 0;

    // Create or select persistent main group
    let mainGroup = svg.select<SVGGElement>("g.main-group");
    if (mainGroup.empty()) {
      mainGroup = svg.append("g").attr("class", "main-group");
    }

    // Handle empty graph case with data join pattern
    const emptyData = !data || data.length === 0 ? [{ text: "No graph data" }] : [];
    mainGroup
      .selectAll<SVGTextElement, { text: string }>("text.empty-message")
      .data(emptyData, (d) => d.text)
      .join(
        (enter) =>
          enter
            .append("text")
            .attr("x", width / 2)
            .attr("y", height / 2)
            .attr("text-anchor", "middle")
            .attr("class", "empty-message")
            .text((d) => d.text),
        (update) => update,
        (exit) => exit.remove(),
      );

    if (!data || data.length === 0) {
      // Clear nodes and links when graph is empty
      mainGroup.selectAll(".links line").data([]).join("line");
      mainGroup.selectAll(".nodes g.node").data([]).join("g");
      // Stop any existing simulation
      if (simulationRef.current) {
        simulationRef.current.stop();
        simulationRef.current = null;
      }
      return;
    }

    // Create or select defs for arrow marker
    let defs = mainGroup.select<SVGDefsElement>("defs");
    if (defs.empty()) {
      defs = mainGroup.append("defs");
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
    }

    // Create or select links group
    let linksGroup = mainGroup.select<SVGGElement>("g.links");
    if (linksGroup.empty()) {
      linksGroup = mainGroup.append("g").attr("class", "links");
    }

    // Create or select nodes group
    let nodesGroup = mainGroup.select<SVGGElement>("g.nodes");
    if (nodesGroup.empty()) {
      nodesGroup = mainGroup.append("g").attr("class", "nodes");
    }

    // Convert graph data to D3 nodes and links
    const nodes: D3Node[] = data.map((node) => {
      const id = String(node.id);
      // Restore position if previously stored
      const storedPos = nodePositions.get(id);
      return {
        id,
        label: String(node.label || node.id),
        x: storedPos?.x ?? width / 2 + (Math.random() - 0.5) * 100,
        y: storedPos?.y ?? height / 2 + (Math.random() - 0.5) * 100,
      };
    });

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

    // Helper to get link color
    const getLinkColor = (d: D3Link) => {
      const source = typeof d.source === "object" ? d.source.id : String(d.source);
      const target = typeof d.target === "object" ? d.target.id : String(d.target);
      if (activeEdgeFrom === source && activeEdgeTo === target && currentStepIndex >= 0) {
        return "#10b981"; // green for active edge
      }
      return "#999";
    };

    // Helper to get node class
    const getNodeClass = (d: D3Node) => {
      if (currentStepIndex < 0) return "node-circle";
      if (currentVertex === d.id) return "node-circle current";
      if (activeVertex === d.id) return "node-circle active";
      if (visitedSet.has(d.id)) return "node-circle visited";
      return "node-circle";
    };

    // Data join for links
    const link = linksGroup
      .selectAll<SVGLineElement, D3Link>("line")
      .data(links, (d) => {
        const source = typeof d.source === "object" ? d.source.id : String(d.source);
        const target = typeof d.target === "object" ? d.target.id : String(d.target);
        return `${source}-${target}`;
      })
      .join(
        (enter) =>
          enter
            .append("line")
            .attr("class", "link")
            .attr("marker-end", "url(#arrowhead)")
            .attr("stroke", getLinkColor)
            .attr("stroke-width", 2)
            .attr("stroke-opacity", 0)
            .call((enter) => enter.transition().duration(duration).attr("stroke-opacity", 1)),
        (update) =>
          update.call((update) =>
            update.transition().duration(duration).attr("stroke", getLinkColor),
          ),
        (exit) => exit.transition().duration(duration).attr("stroke-opacity", 0).remove(),
      );

    // Data join for nodes
    const node = nodesGroup
      .selectAll<SVGGElement, D3Node>("g.node")
      .data(nodes, (d) => d.id)
      .join(
        (enter) => {
          const g = enter.append("g").attr("class", "node").attr("opacity", 0);

          g.append("circle").attr("r", 20).attr("class", getNodeClass);

          g.append("text")
            .attr("class", "node-label")
            .attr("text-anchor", "middle")
            .attr("dy", "0.3em")
            .text((d) => d.label);

          g.transition().duration(duration).attr("opacity", 1);

          return g;
        },
        (update) => {
          update.select("circle").attr("class", getNodeClass);
          return update;
        },
        (exit) => exit.transition().duration(duration).attr("opacity", 0).remove(),
      );

    // Create or update force simulation
    // Only create new simulation if nodes have changed significantly
    const existingNodeIds = new Set(simulationRef.current?.nodes().map((n) => n.id) ?? []);
    const newNodeIds = new Set(nodes.map((n) => n.id));
    const nodesChanged =
      existingNodeIds.size !== newNodeIds.size ||
      [...newNodeIds].some((id) => !existingNodeIds.has(id));

    if (!simulationRef.current || nodesChanged) {
      // Stop old simulation
      if (simulationRef.current) {
        simulationRef.current.stop();
      }

      // Create new simulation
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

      // Update positions on tick
      simulation.on("tick", () => {
        link
          .attr("x1", (d) => (typeof d.source === "object" ? d.source.x || 0 : 0))
          .attr("y1", (d) => (typeof d.source === "object" ? d.source.y || 0 : 0))
          .attr("x2", (d) => (typeof d.target === "object" ? d.target.x || 0 : 0))
          .attr("y2", (d) => (typeof d.target === "object" ? d.target.y || 0 : 0));

        node.attr("transform", (d) => `translate(${d.x || 0},${d.y || 0})`);

        // Store positions for persistence across renders
        for (const n of nodes) {
          if (n.x !== undefined && n.y !== undefined) {
            nodePositions.set(n.id, { x: n.x, y: n.y });
          }
        }
      });

      // Run simulation
      simulation.alpha(1).restart();
      setTimeout(() => {
        simulation.stop();
      }, 3000);
    } else {
      // Just update highlighting without recreating simulation
      // Update node positions from stored values
      node.attr("transform", (d) => {
        const stored = nodePositions.get(d.id);
        const x = stored?.x ?? d.x ?? 0;
        const y = stored?.y ?? d.y ?? 0;
        return `translate(${x},${y})`;
      });

      // Update link positions
      link
        .attr("x1", (d) => {
          const sourceId = typeof d.source === "object" ? d.source.id : String(d.source);
          return nodePositions.get(sourceId)?.x ?? 0;
        })
        .attr("y1", (d) => {
          const sourceId = typeof d.source === "object" ? d.source.id : String(d.source);
          return nodePositions.get(sourceId)?.y ?? 0;
        })
        .attr("x2", (d) => {
          const targetId = typeof d.target === "object" ? d.target.id : String(d.target);
          return nodePositions.get(targetId)?.x ?? 0;
        })
        .attr("y2", (d) => {
          const targetId = typeof d.target === "object" ? d.target.id : String(d.target);
          return nodePositions.get(targetId)?.y ?? 0;
        });
    }

    // Cleanup function
    return () => {
      try {
        svg.selectAll("*").interrupt();
      } catch {
        // Ignore D3 cleanup errors
      }
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
