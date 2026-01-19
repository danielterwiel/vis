import { useEffect, useRef, useState, useMemo } from "react";
import { select } from "d3-selection";
import { transition } from "d3-transition";
import type { VisualizationStep } from "../../store/useAppStore";
import "./ArrayVisualizer.css";

// Register d3-transition with d3-selection
select.prototype.transition = transition;

interface ArrayVisualizerProps {
  data: number[] | null;
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
  // Start with small dimensions that will be immediately updated by ResizeObserver
  // This prevents the initial 800x400 from causing overflow on mobile
  const [dimensions, setDimensions] = useState({ width: 300, height: 300 });

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
    if (!svgRef.current || !data || data.length === 0) return;

    const svg = select(svgRef.current);
    const { width, height } = dimensions;

    // Set viewBox dynamically to match container - enables proper scaling
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    // Calculate dimensions (reduced top margin since step text is outside SVG)
    // Use responsive margins for mobile viewports
    const isMobile = width < 480;
    const margin = isMobile
      ? { top: 10, right: 15, bottom: 50, left: 15 }
      : { top: 20, right: 40, bottom: 100, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const barSpacing = innerWidth / data.length;
    const maxBarWidth = isMobile ? 30 : 50;
    const barWidth = Math.min(maxBarWidth, barSpacing * 0.4);
    const maxValue = Math.max(...data, 1);
    const barOffset = (barSpacing - barWidth) / 2;
    const fontSize = isMobile ? 10 : 14;
    const indexFontSize = isMobile ? 9 : 11;

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
      .attr("x", barOffset)
      .attr("y", innerHeight)
      .attr("width", barWidth)
      .attr("height", 0)
      .attr("rx", 4);

    // Add value labels to new bars
    barsEnter
      .append("text")
      .attr("class", "bar-label")
      .attr("x", barSpacing / 2)
      .attr("y", innerHeight - 10)
      .attr("text-anchor", "middle")
      .style("font-size", `${fontSize}px`);

    // Add index label group (background + text) to new bars
    const indexGroup = barsEnter
      .append("g")
      .attr("class", "bar-index-group")
      .attr("transform", `translate(${barSpacing / 2}, ${innerHeight + 18})`);

    indexGroup
      .append("rect")
      .attr("class", "bar-index-bg")
      .attr("x", -10)
      .attr("y", -10)
      .attr("width", 20)
      .attr("height", 16)
      .attr("rx", 3);

    indexGroup
      .append("text")
      .attr("class", "bar-index")
      .attr("text-anchor", "middle")
      .style("font-size", `${indexFontSize}px`);

    // UPDATE: Merge enter and update selections
    const barsMerge = barsEnter.merge(bars);

    // Animate bar positions
    barsMerge
      .transition()
      .duration(duration)
      .attr("transform", (_, i) => `translate(${i * barSpacing},0)`)
      .style("opacity", 1);

    // Convert highlight arrays to Sets for O(1) lookup in render loop
    const activeSet = new Set(highlightIndices.active);
    const comparingSet = new Set(highlightIndices.comparing);
    const swappedSet = new Set(highlightIndices.swapped);

    // Update rectangles with highlighting and animations
    barsMerge
      .select<SVGRectElement>("rect")
      .transition()
      .duration(duration)
      .attr("class", (_, i) => {
        if (activeSet.has(i)) return "bar-rect bar-active";
        if (comparingSet.has(i)) return "bar-rect bar-comparing";
        if (swappedSet.has(i)) return "bar-rect bar-swapped";
        return "bar-rect";
      })
      .attr("x", barOffset)
      .attr("width", barWidth)
      .attr("y", (d) => innerHeight - (d / maxValue) * innerHeight)
      .attr("height", (d) => (d / maxValue) * innerHeight);

    // Update value labels
    barsMerge
      .select<SVGTextElement>("text.bar-label")
      .text((d) => d)
      .style("font-size", `${fontSize}px`)
      .transition()
      .duration(duration)
      .attr("x", barSpacing / 2)
      .attr("y", (d) => innerHeight - (d / maxValue) * innerHeight - 10);

    // Update index label groups - position at bottom of each bar
    barsMerge
      .select<SVGGElement>("g.bar-index-group")
      .attr("transform", `translate(${barSpacing / 2}, ${innerHeight + 18})`);

    // Update index text
    barsMerge
      .select<SVGTextElement>("text.bar-index")
      .text((_, i) => i)
      .style("font-size", `${indexFontSize}px`);

    // Cleanup: only interrupt in-flight transitions
    // Do NOT remove bars here - let D3's data join handle enter/update/exit animations
    return () => {
      try {
        svg.selectAll("*").interrupt();
      } catch {
        // Ignore cleanup errors (e.g., if SVG was already removed)
      }
    };
  }, [data, steps, currentStepIndex, isAnimating, dimensions]);

  return (
    <div className="array-visualizer-container">
      <svg ref={svgRef} className="array-visualizer" />
      {stepText && <div className="step-indicator">{stepText}</div>}
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
