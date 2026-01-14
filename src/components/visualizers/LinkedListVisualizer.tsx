import { useEffect, useRef } from "react";
import * as d3 from "d3";
import type { VisualizationStep } from "../../store/useAppStore";
import type { LinkedListNode } from "../../lib/dataStructures/TrackedLinkedList";
import "./LinkedListVisualizer.css";

interface LinkedListVisualizerProps {
  data: LinkedListNode<unknown> | null;
  steps?: VisualizationStep[];
  currentStepIndex?: number;
  isAnimating?: boolean;
}

interface NodeData {
  value: unknown;
  index: number;
  x: number;
  y: number;
}

export function LinkedListVisualizer({
  data,
  steps = [],
  currentStepIndex = -1,
  isAnimating = false,
}: LinkedListVisualizerProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Convert linked list to array for visualization
    const nodes: NodeData[] = [];
    let current = data;
    let index = 0;
    while (current) {
      nodes.push({
        value: current.value,
        index,
        x: 0, // Will be calculated
        y: 0,
      });
      current = current.next || null;
      index++;
    }

    // Calculate node positions (horizontal layout)
    const width = 800;
    const height = 200;
    const nodeRadius = 30;
    const nodeSpacing = 120;
    const startX = 50;
    const centerY = height / 2;

    nodes.forEach((node, i) => {
      node.x = startX + i * nodeSpacing;
      node.y = centerY;
    });

    // Get current step for highlighting
    const currentStep =
      currentStepIndex >= 0 && currentStepIndex < steps.length ? steps[currentStepIndex] : null;

    // Determine highlighting based on step
    const highlightIndices = new Set<number>();
    const compareIndices = new Set<number>();
    const deletedIndices = new Set<number>();
    const foundIndices = new Set<number>();

    if (currentStep?.metadata) {
      const { index, comparing, deleted, found } = currentStep.metadata as {
        index?: number;
        comparing?: boolean;
        deleted?: boolean;
        found?: boolean;
        hasCycle?: boolean;
      };

      if (typeof index === "number") {
        if (deleted) {
          deletedIndices.add(index);
        } else if (found) {
          foundIndices.add(index);
        } else if (comparing) {
          compareIndices.add(index);
        } else {
          highlightIndices.add(index);
        }
      }
    }

    // D3 owns this DOM node - React never touches it after initial render
    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    // Clear previous content (use main group for persistence)
    let mainGroup = svg.select<SVGGElement>("g.main-group");
    if (mainGroup.empty()) {
      mainGroup = svg.append("g").attr("class", "main-group");
    }

    // Animation duration
    const duration = isAnimating ? 500 : 0;

    // Draw arrows between nodes
    const arrowData = nodes.slice(0, -1).map((node, i) => {
      const nextNode = nodes[i + 1];
      if (!nextNode) {
        throw new Error("Unexpected missing node");
      }
      return {
        x1: node.x + nodeRadius,
        y1: node.y,
        x2: nextNode.x - nodeRadius,
        y2: nextNode.y,
        index: i,
      };
    });

    const arrows = mainGroup
      .selectAll<SVGLineElement, (typeof arrowData)[number]>("line.arrow")
      .data(arrowData, (d) => `arrow-${d.index}`);

    // Enter
    arrows
      .enter()
      .append("line")
      .attr("class", "arrow")
      .attr("x1", (d) => d.x1)
      .attr("y1", (d) => d.y1)
      .attr("x2", (d) => d.x1)
      .attr("y2", (d) => d.y1)
      .attr("stroke", "#646cff")
      .attr("stroke-width", 2)
      .attr("marker-end", "url(#arrowhead)")
      .merge(arrows)
      .transition()
      .duration(duration)
      .attr("x1", (d) => d.x1)
      .attr("y1", (d) => d.y1)
      .attr("x2", (d) => d.x2)
      .attr("y2", (d) => d.y2);

    // Exit
    arrows.exit().transition().duration(duration).style("opacity", 0).remove();

    // Draw nodes
    const nodeGroups = mainGroup
      .selectAll<SVGGElement, NodeData>("g.node")
      .data(nodes, (d) => `node-${d.index}-${d.value}`);

    // Enter
    const enterGroups = nodeGroups
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d) => `translate(${d.x},${d.y})`);

    enterGroups
      .append("circle")
      .attr("r", 0)
      .attr("class", "node-circle")
      .transition()
      .duration(duration)
      .attr("r", nodeRadius);

    enterGroups
      .append("text")
      .attr("class", "node-value")
      .attr("text-anchor", "middle")
      .attr("dy", "0.3em")
      .style("opacity", 0)
      .text((d) => String(d.value))
      .transition()
      .duration(duration)
      .style("opacity", 1);

    enterGroups
      .append("text")
      .attr("class", "node-index")
      .attr("text-anchor", "middle")
      .attr("dy", "-45px")
      .style("opacity", 0)
      .text((d) => `[${d.index}]`)
      .transition()
      .duration(duration)
      .style("opacity", 1);

    // Update
    const mergedGroups = enterGroups.merge(nodeGroups);

    mergedGroups
      .transition()
      .duration(duration)
      .attr("transform", (d) => `translate(${d.x},${d.y})`);

    mergedGroups
      .select("circle")
      .transition()
      .duration(duration)
      .attr("r", nodeRadius)
      .attr("class", (d) => {
        if (deletedIndices.has(d.index)) return "node-circle deleted";
        if (foundIndices.has(d.index)) return "node-circle found";
        if (compareIndices.has(d.index)) return "node-circle comparing";
        if (highlightIndices.has(d.index)) return "node-circle active";
        return "node-circle";
      });

    mergedGroups
      .select("text.node-value")
      .transition()
      .duration(duration)
      .text((d) => String(d.value));

    mergedGroups
      .select("text.node-index")
      .transition()
      .duration(duration)
      .text((d) => `[${d.index}]`);

    // Exit
    nodeGroups.exit().transition().duration(duration).style("opacity", 0).remove();

    // Add arrowhead marker definition
    const defs = svg.select("defs");
    if (defs.empty()) {
      const newDefs = svg.append("defs");
      newDefs
        .append("marker")
        .attr("id", "arrowhead")
        .attr("markerWidth", 10)
        .attr("markerHeight", 10)
        .attr("refX", 8)
        .attr("refY", 3)
        .attr("orient", "auto")
        .append("polygon")
        .attr("points", "0 0, 10 3, 0 6")
        .attr("fill", "#646cff");
    }

    // Cleanup function
    return () => {
      svg.selectAll("*").interrupt();
    };
  }, [data, steps, currentStepIndex, isAnimating]);

  // Format step description
  const formatStepDescription = (step: VisualizationStep | null | undefined): string => {
    if (!step) return "Linked List Visualization";

    const { type, args = [], metadata } = step;

    switch (type) {
      case "append":
        return `Append ${args[0]} to end of list`;
      case "prepend":
        return `Prepend ${args[0]} to start of list`;
      case "insertAt":
        return `Insert ${args[1]} at index ${args[0]}`;
      case "delete":
        return `Delete value ${args[0]}`;
      case "deleteAt":
        return `Delete node at index ${args[0]}`;
      case "find":
        return (metadata as { found?: boolean; index?: number })?.found
          ? `Found ${args[0]} at index ${(metadata as { index?: number }).index}`
          : `Searching for ${args[0]}...`;
      case "reverse":
        return "Reversing linked list";
      case "hasCycle":
        return (metadata as { hasCycle?: boolean })?.hasCycle
          ? "Cycle detected in list"
          : "No cycle found";
      case "clear":
        return "Clearing linked list";
      default:
        return `Operation: ${type}`;
    }
  };

  const currentStep =
    currentStepIndex >= 0 && currentStepIndex < steps.length ? steps[currentStepIndex] : null;

  return (
    <div className="linked-list-visualizer">
      <div className="step-indicator">{formatStepDescription(currentStep)}</div>
      <svg ref={svgRef} className="linked-list-svg" />
    </div>
  );
}
