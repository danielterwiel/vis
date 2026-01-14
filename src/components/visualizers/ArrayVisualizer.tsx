import { useEffect, useRef } from "react";
import { select } from "d3-selection";
import type { VisualizationStep } from "../../store/useAppStore";
import "./ArrayVisualizer.css";

interface ArrayVisualizerProps {
  data: number[];
  steps?: VisualizationStep[];
  currentStepIndex?: number;
  isAnimating?: boolean;
}

/**
 * ArrayVisualizer component using D3Adapter pattern.
 *
 * Follows the D3 + React 19 integration pattern from CLAUDE.md:
 * - React renders SVG once and hands off to D3 via ref
 * - D3 has exclusive ownership of the DOM node
 * - Never mix React rendering with D3 DOM manipulation
 */
export function ArrayVisualizer({
  data,
  steps = [],
  currentStepIndex = -1,
  isAnimating = false,
}: ArrayVisualizerProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = select(svgRef.current);
    const width = svgRef.current.clientWidth || 800;
    const height = svgRef.current.clientHeight || 400;

    // Clear previous render
    svg.selectAll("*").remove();

    // Calculate dimensions
    const margin = { top: 40, right: 40, bottom: 60, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const barWidth = Math.min(80, innerWidth / data.length - 10);
    const barSpacing = innerWidth / data.length;
    const maxValue = Math.max(...data, 1);

    // Create main group
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // Get current step for highlighting
    const currentStep =
      currentStepIndex >= 0 && currentStepIndex < steps.length
        ? (steps[currentStepIndex] ?? null)
        : null;
    const highlightIndices = getHighlightIndices(currentStep);

    // Create bars
    const bars = g
      .selectAll<SVGGElement, number>("g.bar")
      .data(data)
      .enter()
      .append("g")
      .attr("class", "bar")
      .attr("transform", (_, i) => `translate(${i * barSpacing},0)`);

    // Add rectangles
    bars
      .append("rect")
      .attr("class", (_, i) => {
        if (highlightIndices.active.includes(i)) return "bar-rect bar-active";
        if (highlightIndices.comparing.includes(i)) return "bar-rect bar-comparing";
        if (highlightIndices.swapped.includes(i)) return "bar-rect bar-swapped";
        return "bar-rect";
      })
      .attr("x", (barWidth - barWidth) / 2)
      .attr("y", (d) => innerHeight - (d / maxValue) * innerHeight)
      .attr("width", barWidth)
      .attr("height", (d) => (d / maxValue) * innerHeight)
      .attr("rx", 4);

    // Add value labels
    bars
      .append("text")
      .attr("class", "bar-label")
      .attr("x", barWidth / 2)
      .attr("y", (d) => innerHeight - (d / maxValue) * innerHeight - 10)
      .attr("text-anchor", "middle")
      .text((d) => d);

    // Add index labels
    bars
      .append("text")
      .attr("class", "bar-index")
      .attr("x", barWidth / 2)
      .attr("y", innerHeight + 25)
      .attr("text-anchor", "middle")
      .text((_, i) => i);

    // Add step indicator
    if (currentStep) {
      svg
        .append("text")
        .attr("class", "step-indicator")
        .attr("x", width / 2)
        .attr("y", 25)
        .attr("text-anchor", "middle")
        .text(`Step ${currentStepIndex + 1}/${steps.length}: ${formatStep(currentStep)}`);
    }

    // Cleanup function
    return () => {
      svg.selectAll("*").remove();
    };
  }, [data, steps, currentStepIndex, isAnimating]);

  return (
    <svg
      ref={svgRef}
      className="array-visualizer"
      width="100%"
      height="100%"
      viewBox="0 0 800 400"
      preserveAspectRatio="xMidYMid meet"
    />
  );
}

/**
 * Extract indices to highlight based on current step
 */
function getHighlightIndices(step: VisualizationStep | null): {
  active: number[];
  comparing: number[];
  swapped: number[];
} {
  const result: {
    active: number[];
    comparing: number[];
    swapped: number[];
  } = { active: [], comparing: [], swapped: [] };

  if (!step) return result;

  // Extract indices from step metadata
  if (step.type === "swap" && Array.isArray(step.args) && step.args.length >= 2) {
    result.swapped = [step.args[0], step.args[1]].filter(
      (idx): idx is number => typeof idx === "number",
    );
  } else if (step.type === "compare" && Array.isArray(step.args) && step.args.length >= 2) {
    result.comparing = [step.args[0], step.args[1]].filter(
      (idx): idx is number => typeof idx === "number",
    );
  } else if (
    (step.type === "push" || step.type === "pop" || step.type === "set") &&
    typeof step.args?.[0] === "number"
  ) {
    result.active = [step.args[0]];
  }

  return result;
}

/**
 * Format step description for display
 */
function formatStep(step: VisualizationStep): string {
  switch (step.type) {
    case "push":
      return `Push ${step.args?.[0] ?? "value"}`;
    case "pop":
      return "Pop element";
    case "swap":
      return `Swap indices ${step.args?.[0] ?? "?"} and ${step.args?.[1] ?? "?"}`;
    case "compare":
      return `Compare indices ${step.args?.[0] ?? "?"} and ${step.args?.[1] ?? "?"}`;
    case "set":
      return `Set index ${step.args?.[0] ?? "?"} to ${step.args?.[1] ?? "value"}`;
    case "sort":
      return "Sort array";
    case "partition":
      return `Partition around pivot ${step.args?.[0] ?? ""}`;
    default:
      return step.type;
  }
}
