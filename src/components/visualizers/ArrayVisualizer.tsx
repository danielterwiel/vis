import { useEffect, useRef, useState, useMemo } from "react";
import { select } from "d3-selection";
import { transition } from "d3-transition";
import type { VisualizationStep } from "../../store/useAppStore";
import "./ArrayVisualizer.css";

// Register d3-transition with d3-selection
select.prototype.transition = transition;

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
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });

  // Get current step for the text display (outside D3)
  const currentStep = useMemo(() => {
    return currentStepIndex >= 0 && currentStepIndex < steps.length
      ? steps[currentStepIndex]
      : null;
  }, [currentStepIndex, steps]);

  const stepText = useMemo(() => {
    if (!currentStep) return null;
    return `Step ${currentStepIndex + 1}/${steps.length}: ${formatStep(currentStep)}`;
  }, [currentStep, currentStepIndex, steps.length]);

  // Track container size changes
  useEffect(() => {
    if (!svgRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setDimensions({ width, height });
        }
      }
    });

    resizeObserver.observe(svgRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = select(svgRef.current);
    const { width, height } = dimensions;

    // Set viewBox dynamically to match container - enables proper scaling
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    // Calculate dimensions (reduced top margin since step text is outside SVG)
    const margin = { top: 20, right: 40, bottom: 60, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const barWidth = Math.min(80, innerWidth / data.length - 10);
    const barSpacing = innerWidth / data.length;
    const maxValue = Math.max(...data, 1);

    // Get current step for highlighting
    const currentStep =
      currentStepIndex >= 0 && currentStepIndex < steps.length
        ? (steps[currentStepIndex] ?? null)
        : null;
    const highlightIndices = getHighlightIndices(currentStep);

    // Determine animation duration based on isAnimating flag
    const duration = isAnimating ? 500 : 0;

    // Create or update main group
    let g = svg.select<SVGGElement>("g.main-group");
    if (g.empty()) {
      g = svg.append("g").attr("class", "main-group");
    }
    g.attr("transform", `translate(${margin.left},${margin.top})`);

    // Data join for bars - use index as key for position-based animations
    // This ensures bars update in place rather than exit/enter when values swap
    const bars = g.selectAll<SVGGElement, number>("g.bar").data(data, (_, i) => `${i}`);

    // EXIT: Remove bars that are no longer in the data
    bars.exit().transition().duration(duration).style("opacity", 0).remove();

    // ENTER: Create new bar groups
    const barsEnter = bars
      .enter()
      .append("g")
      .attr("class", "bar")
      .attr("transform", (_, i) => `translate(${i * barSpacing},0)`)
      .style("opacity", 0);

    // Add rectangles to new bars
    barsEnter
      .append("rect")
      .attr("class", "bar-rect")
      .attr("x", (barWidth - barWidth) / 2)
      .attr("y", innerHeight)
      .attr("width", barWidth)
      .attr("height", 0)
      .attr("rx", 4);

    // Add value labels to new bars
    barsEnter
      .append("text")
      .attr("class", "bar-label")
      .attr("x", barWidth / 2)
      .attr("y", innerHeight - 10)
      .attr("text-anchor", "middle");

    // Add index labels to new bars
    barsEnter
      .append("text")
      .attr("class", "bar-index")
      .attr("x", barWidth / 2)
      .attr("y", innerHeight + 25)
      .attr("text-anchor", "middle");

    // UPDATE: Merge enter and update selections
    const barsMerge = barsEnter.merge(bars);

    // Animate bar positions
    barsMerge
      .transition()
      .duration(duration)
      .attr("transform", (_, i) => `translate(${i * barSpacing},0)`)
      .style("opacity", 1);

    // Update rectangles with highlighting and animations
    barsMerge
      .select<SVGRectElement>("rect")
      .transition()
      .duration(duration)
      .attr("class", (_, i) => {
        if (highlightIndices.active.includes(i)) return "bar-rect bar-active";
        if (highlightIndices.comparing.includes(i)) return "bar-rect bar-comparing";
        if (highlightIndices.swapped.includes(i)) return "bar-rect bar-swapped";
        return "bar-rect";
      })
      .attr("y", (d) => innerHeight - (d / maxValue) * innerHeight)
      .attr("height", (d) => (d / maxValue) * innerHeight);

    // Update value labels
    barsMerge
      .select<SVGTextElement>("text.bar-label")
      .text((d) => d)
      .transition()
      .duration(duration)
      .attr("y", (d) => innerHeight - (d / maxValue) * innerHeight - 10);

    // Update index labels
    barsMerge.select<SVGTextElement>("text.bar-index").text((_, i) => i);

    // Cleanup function
    return () => {
      try {
        // Interrupt all transitions before cleanup
        svg.selectAll("*").interrupt();
        // Remove all elements to prevent stale references
        svg.selectAll(".bar-group").remove();
      } catch {
        // Ignore cleanup errors (e.g., if SVG was already removed)
      }
    };
  }, [data, steps, currentStepIndex, isAnimating, dimensions]);

  return (
    <div className="array-visualizer-container">
      {stepText && <div className="step-indicator">{stepText}</div>}
      <svg ref={svgRef} className="array-visualizer" />
    </div>
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
