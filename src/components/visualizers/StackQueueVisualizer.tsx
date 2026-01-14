import { useEffect, useRef } from "react";
import * as d3 from "d3";
import type { VisualizationStep } from "../../store/useAppStore";
import "./StackQueueVisualizer.css";

interface StackQueueVisualizerProps {
  data: unknown[] | null;
  steps?: VisualizationStep[];
  currentStepIndex?: number;
  isAnimating?: boolean;
  mode?: "stack" | "queue";
}

export function StackQueueVisualizer({
  data,
  steps,
  currentStepIndex,
  isAnimating = false,
  mode = "stack",
}: StackQueueVisualizerProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = 800;
    const height = 600;
    const elementWidth = 100;
    const elementHeight = 60;
    const spacing = 10;
    const duration = isAnimating ? 500 : 0;

    // Clear previous content
    svg.selectAll("*").remove();

    // Create main group
    const mainGroup = svg.append("g");

    // Get current step if available
    const currentStep =
      steps && currentStepIndex !== undefined && currentStepIndex >= 0
        ? steps[currentStepIndex]
        : null;

    // Extract array data
    const arrayData = data ? (Array.isArray(data) ? data : []) : [];

    // Get highlighting indices from step metadata
    let activeIndex = -1;
    let operation = "";

    if (currentStep) {
      const metadata = currentStep.metadata as
        | {
            index?: number;
            value?: unknown;
            empty?: boolean;
          }
        | undefined;

      operation = currentStep.type;

      if (metadata?.index !== undefined) {
        activeIndex = metadata.index;
      } else if (operation === "push" || operation === "enqueue") {
        // Highlight the last element (newly added)
        activeIndex = arrayData.length - 1;
      } else if (operation === "pop" || operation === "dequeue") {
        // For pop/dequeue, highlight the element that was removed
        // Since it's already gone from the array, we check the previous step
        activeIndex = -1; // No highlighting for removed elements
      }
    }

    // Calculate layout based on mode
    let positions: Array<{ x: number; y: number }> = [];

    if (mode === "stack") {
      // Stack: vertical layout, bottom to top
      const startY = height - 100;
      positions = arrayData.map((_, i) => ({
        x: width / 2 - elementWidth / 2,
        y: startY - i * (elementHeight + spacing),
      }));
    } else {
      // Queue: horizontal layout, left to right
      const startX = 100;
      const startY = height / 2 - elementHeight / 2;
      positions = arrayData.map((_, i) => ({
        x: startX + i * (elementWidth + spacing),
        y: startY,
      }));
    }

    // Data join with key function for smooth transitions
    const elements = mainGroup
      .selectAll<SVGGElement, unknown>("g.element")
      .data(arrayData, (d, i) => `${i}-${String(d)}`);

    // EXIT: Remove old elements
    elements.exit().transition().duration(duration).style("opacity", 0).remove();

    // ENTER: Add new elements
    const enterGroup = elements.enter().append("g").attr("class", "element").style("opacity", 0);

    // Add rectangles for new elements
    enterGroup
      .append("rect")
      .attr("width", elementWidth)
      .attr("height", elementHeight)
      .attr("rx", 5)
      .attr("ry", 5)
      .attr("class", "element-rect");

    // Add value labels for new elements
    enterGroup
      .append("text")
      .attr("class", "element-value")
      .attr("x", elementWidth / 2)
      .attr("y", elementHeight / 2)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .text((d) => String(d));

    // Add index labels for new elements
    enterGroup
      .append("text")
      .attr("class", "element-index")
      .attr("x", elementWidth / 2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .text((_, i) => `[${i}]`);

    // UPDATE: Merge enter + update selections
    const merged = enterGroup.merge(elements);

    // Animate position and opacity
    merged
      .transition()
      .duration(duration)
      .attr("transform", (_, i) => {
        const pos = positions[i];
        return pos ? `translate(${pos.x},${pos.y})` : "translate(0,0)";
      })
      .style("opacity", 1);

    // Update highlighting based on current step
    merged
      .select<SVGRectElement>("rect")
      .transition()
      .duration(duration)
      .attr("class", (_, i) => {
        if (i === activeIndex) {
          return "element-rect active";
        }
        return "element-rect";
      });

    // Add step indicator
    if (currentStep) {
      const stepText = formatStepDescription(currentStep, mode);

      mainGroup
        .append("text")
        .attr("class", "step-indicator")
        .attr("x", width / 2)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .text(stepText);
    }

    // Add pointer indicators for stack (top) and queue (front/rear)
    if (arrayData.length > 0 && positions.length > 0) {
      if (mode === "stack") {
        // Top pointer
        const topPos = positions[positions.length - 1];
        if (topPos) {
          mainGroup
            .append("text")
            .attr("class", "pointer-label")
            .attr("x", topPos.x - 20)
            .attr("y", topPos.y + elementHeight / 2)
            .attr("text-anchor", "end")
            .text("← TOP");
        }
      } else {
        // Queue: Front and Rear pointers
        const frontPos = positions[0];
        const rearPos = positions[positions.length - 1];

        if (frontPos) {
          mainGroup
            .append("text")
            .attr("class", "pointer-label")
            .attr("x", frontPos.x + elementWidth / 2)
            .attr("y", frontPos.y - 30)
            .attr("text-anchor", "middle")
            .text("FRONT ↓");
        }

        if (rearPos) {
          mainGroup
            .append("text")
            .attr("class", "pointer-label")
            .attr("x", rearPos.x + elementWidth / 2)
            .attr("y", rearPos.y + elementHeight + 45)
            .attr("text-anchor", "middle")
            .text("REAR ↑");
        }
      }
    }

    // Cleanup on unmount
    return () => {
      svg.selectAll("*").interrupt();
    };
  }, [data, steps, currentStepIndex, isAnimating, mode]);

  return (
    <div className="stack-queue-visualizer">
      <svg ref={svgRef} viewBox="0 0 800 600" preserveAspectRatio="xMidYMid meet" />
    </div>
  );
}

function formatStepDescription(step: VisualizationStep, mode: "stack" | "queue"): string {
  const metadata = step.metadata as
    | {
        value?: unknown;
        empty?: boolean;
        index?: number;
      }
    | undefined;

  const operation = step.type;
  const value = metadata?.value;

  if (mode === "stack") {
    switch (operation) {
      case "push":
        return `Push ${String(value)} onto stack`;
      case "pop":
        return value !== undefined ? `Pop ${String(value)} from stack` : "Pop from stack";
      case "peek":
        return value !== undefined ? `Peek: ${String(value)}` : "Peek at top element";
      case "clear":
        return "Clear stack";
      case "isEmpty":
        return metadata?.empty ? "Stack is empty" : "Stack is not empty";
      default:
        return `Operation: ${operation}`;
    }
  } else {
    // Queue mode
    switch (operation) {
      case "enqueue":
        return `Enqueue ${String(value)} to queue`;
      case "dequeue":
        return value !== undefined ? `Dequeue ${String(value)} from queue` : "Dequeue from queue";
      case "peek":
        return value !== undefined ? `Peek: ${String(value)}` : "Peek at front element";
      case "clear":
        return "Clear queue";
      case "isEmpty":
        return metadata?.empty ? "Queue is empty" : "Queue is not empty";
      default:
        return `Operation: ${operation}`;
    }
  }
}
