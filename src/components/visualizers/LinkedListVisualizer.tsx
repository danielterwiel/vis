import { useEffect, useRef } from "react";
import * as d3 from "d3";
import type { VisualizationStep } from "../../store/useAppStore";
import type { LinkedListNode } from "../../lib/dataStructures/TrackedLinkedList";
import "./LinkedListVisualizer.css";

interface LinkedListVisualizerProps {
  data: LinkedListNode<unknown> | unknown[] | null;
  steps?: VisualizationStep[];
  currentStepIndex?: number;
  isAnimating?: boolean;
}

interface NodeData {
  value: unknown;
  index: number;
  x: number;
  y: number;
  isHead?: boolean;
  isTail?: boolean;
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

    // Convert data to array of nodes for visualization
    // Data can be either a LinkedListNode structure or a plain array
    const nodes: NodeData[] = [];

    if (Array.isArray(data)) {
      // Handle plain array input - convert to node format
      data.forEach((value, index) => {
        nodes.push({
          value,
          index,
          x: 0, // Will be calculated
          y: 0,
          isHead: index === 0,
          isTail: index === data.length - 1,
        });
      });
    } else {
      // Handle LinkedListNode structure
      let current = data;
      let index = 0;
      while (current) {
        nodes.push({
          value: current.value,
          index,
          x: 0, // Will be calculated
          y: 0,
          isHead: index === 0,
          isTail: current.next === null || current.next === undefined,
        });
        current = current.next || null;
        index++;
      }
    }

    // Calculate node positions (horizontal layout)
    const width = 800;
    const height = 300; // Increased height for labels
    const nodeWidth = 70;
    const nodeHeight = 50;
    const nodeSpacing = 140;
    const startX = 80;
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

    // Draw arrows between nodes (pointer lines)
    const arrowData = nodes.slice(0, -1).map((node, i) => {
      const nextNode = nodes[i + 1];
      if (!nextNode) {
        throw new Error("Unexpected missing node");
      }
      return {
        x1: node.x + nodeWidth / 2,
        y1: node.y,
        x2: nextNode.x - nodeWidth / 2,
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

    // Draw null pointer at the end
    if (nodes.length > 0) {
      const lastNode = nodes[nodes.length - 1];
      if (!lastNode) {
        throw new Error("Unexpected missing last node");
      }
      const nullData = [
        {
          x: lastNode.x + nodeWidth / 2 + 40,
          y: lastNode.y,
        },
      ];

      const nullPointers = mainGroup
        .selectAll<SVGTextElement, (typeof nullData)[number]>("text.null-pointer")
        .data(nullData);

      nullPointers
        .enter()
        .append("text")
        .attr("class", "null-pointer")
        .attr("x", (d) => d.x)
        .attr("y", (d) => d.y)
        .attr("text-anchor", "middle")
        .attr("dy", "0.3em")
        .style("opacity", 0)
        .text("null")
        .merge(nullPointers)
        .transition()
        .duration(duration)
        .attr("x", (d) => d.x)
        .attr("y", (d) => d.y)
        .style("opacity", 1);

      nullPointers.exit().transition().duration(duration).style("opacity", 0).remove();

      // Draw arrow from last node to null
      const nullArrowData = [
        {
          x1: lastNode.x + nodeWidth / 2,
          y1: lastNode.y,
          x2: lastNode.x + nodeWidth / 2 + 25,
          y2: lastNode.y,
        },
      ];

      const nullArrows = mainGroup
        .selectAll<SVGLineElement, (typeof nullArrowData)[number]>("line.null-arrow")
        .data(nullArrowData);

      nullArrows
        .enter()
        .append("line")
        .attr("class", "null-arrow")
        .attr("x1", (d) => d.x1)
        .attr("y1", (d) => d.y1)
        .attr("x2", (d) => d.x1)
        .attr("y2", (d) => d.y1)
        .attr("stroke", "#888")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "4,4")
        .merge(nullArrows)
        .transition()
        .duration(duration)
        .attr("x1", (d) => d.x1)
        .attr("y1", (d) => d.y1)
        .attr("x2", (d) => d.x2)
        .attr("y2", (d) => d.y2);

      nullArrows.exit().transition().duration(duration).style("opacity", 0).remove();
    }

    // Draw nodes as rectangles
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
      .append("rect")
      .attr("width", 0)
      .attr("height", 0)
      .attr("x", 0)
      .attr("y", 0)
      .attr("class", "node-rect")
      .attr("rx", 4)
      .transition()
      .duration(duration)
      .attr("width", nodeWidth)
      .attr("height", nodeHeight)
      .attr("x", -nodeWidth / 2)
      .attr("y", -nodeHeight / 2);

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

    // Add head label
    enterGroups
      .filter((d) => d.isHead === true)
      .append("text")
      .attr("class", "node-label head-label")
      .attr("text-anchor", "middle")
      .attr("dy", "55px")
      .style("opacity", 0)
      .text("HEAD")
      .transition()
      .duration(duration)
      .style("opacity", 1);

    // Add tail label
    enterGroups
      .filter((d) => d.isTail === true)
      .append("text")
      .attr("class", "node-label tail-label")
      .attr("text-anchor", "middle")
      .attr("dy", "70px")
      .style("opacity", 0)
      .text("TAIL")
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
      .select("rect")
      .transition()
      .duration(duration)
      .attr("width", nodeWidth)
      .attr("height", nodeHeight)
      .attr("x", -nodeWidth / 2)
      .attr("y", -nodeHeight / 2)
      .attr("class", (d) => {
        if (deletedIndices.has(d.index)) return "node-rect deleted";
        if (foundIndices.has(d.index)) return "node-rect found";
        if (compareIndices.has(d.index)) return "node-rect comparing";
        if (highlightIndices.has(d.index)) return "node-rect active";
        return "node-rect";
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

    // Update head label
    mergedGroups
      .select("text.head-label")
      .transition()
      .duration(duration)
      .style("opacity", (d) => (d.isHead ? 1 : 0));

    // Update tail label
    mergedGroups
      .select("text.tail-label")
      .transition()
      .duration(duration)
      .style("opacity", (d) => (d.isTail ? 1 : 0));

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
