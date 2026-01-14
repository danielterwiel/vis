import { useEffect, useRef } from "react";
import * as d3 from "d3";
import type { VisualizationStep } from "../../store/useAppStore";
import type { HashMapBucket } from "../../lib/dataStructures/TrackedHashMap";
import "./HashMapVisualizer.css";

interface HashMapVisualizerProps {
  data: HashMapBucket<unknown, unknown>[] | null;
  steps?: VisualizationStep[];
  currentStepIndex?: number;
  isAnimating?: boolean;
}

/**
 * HashMapVisualizer - D3-based visualization of hash map with collision chains
 *
 * Follows D3Adapter pattern:
 * - React renders SVG once with ref
 * - D3 has exclusive ownership via ref
 * - Never mix React rendering with D3 DOM manipulation
 */
export function HashMapVisualizer({
  data,
  steps = [],
  currentStepIndex = -1,
  isAnimating = false,
}: HashMapVisualizerProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data) return;

    const svg = d3.select(svgRef.current);
    const width = 800;
    const bucketWidth = 80;
    const bucketHeight = 40;
    const entryWidth = 70;
    const entryHeight = 30;
    const margin = { top: 80, right: 20, bottom: 20, left: 20 };

    // Get current step metadata
    const currentStep =
      currentStepIndex >= 0 && currentStepIndex < steps.length ? steps[currentStepIndex] : null;

    const metadata = currentStep?.metadata as
      | {
          index?: number;
          key?: unknown;
          collision?: boolean;
          found?: boolean;
          deleted?: boolean;
          updated?: boolean;
        }
      | undefined;

    // Extract active indices for highlighting
    const activeIndex = metadata?.index;
    const isCollision = metadata?.collision === true;
    const isFound = metadata?.found === true;
    const isDeleted = metadata?.deleted === true;

    // Prepare bucket data for visualization
    const bucketsData = data.map((bucket, index) => ({
      index,
      entries: bucket ? bucket.entries : [],
      hasEntries: bucket ? bucket.entries.length > 0 : false,
    }));

    // Calculate visible buckets (show up to 16 buckets)
    const visibleBuckets = bucketsData.slice(0, 16);
    const bucketsPerRow = 8;

    // Clear and recreate main group
    svg.selectAll("g.main-group").remove();
    const mainGroup = svg.append("g").attr("class", "main-group");

    // Draw buckets
    type BucketData = {
      index: number;
      entries: Array<{ key: unknown; value: unknown }>;
      hasEntries: boolean;
    };

    const bucketGroups = mainGroup
      .selectAll<SVGGElement, BucketData>("g.bucket")
      .data(visibleBuckets, (d) => d.index);

    const bucketGroupsEnter = bucketGroups.enter().append("g").attr("class", "bucket");

    // Position buckets in grid
    bucketGroupsEnter.attr("transform", (d) => {
      const row = Math.floor(d.index / bucketsPerRow);
      const col = d.index % bucketsPerRow;
      const x = margin.left + col * (bucketWidth + 10);
      const y = margin.top + row * (bucketHeight + 80);
      return `translate(${x},${y})`;
    });

    // Draw bucket rectangles
    bucketGroupsEnter
      .append("rect")
      .attr("class", "bucket-rect")
      .attr("width", bucketWidth)
      .attr("height", bucketHeight)
      .attr("rx", 4)
      .attr("fill", (d) => {
        if (d.index === activeIndex) {
          if (isDeleted) return "#ef4444"; // Red for delete
          if (isFound) return "#a78bfa"; // Purple for found
          if (isCollision) return "#fb923c"; // Orange for collision
          return "#22c55e"; // Green for active
        }
        return d.hasEntries ? "#3b82f6" : "#1e293b"; // Blue if has entries, dark if empty
      })
      .attr("stroke", (d) => (d.index === activeIndex ? "#fff" : "#475569"))
      .attr("stroke-width", (d) => (d.index === activeIndex ? 2 : 1));

    // Draw bucket index labels
    bucketGroupsEnter
      .append("text")
      .attr("class", "bucket-index")
      .attr("x", bucketWidth / 2)
      .attr("y", bucketHeight / 2)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", "#fff")
      .attr("font-size", "14px")
      .attr("font-weight", "bold")
      .text((d) => d.index);

    // Draw collision chains (entries in buckets)
    const entryGroups = bucketGroupsEnter
      .selectAll("g.entry")
      .data((d: { index: number; entries: Array<{ key: unknown; value: unknown }> }) =>
        d.entries.map((entry, i) => ({
          bucketIndex: d.index,
          entryIndex: i,
          key: entry.key,
          value: entry.value,
        })),
      )
      .enter()
      .append("g")
      .attr("class", "entry");

    // Position entries below bucket
    entryGroups.attr("transform", (d) => {
      const x = (bucketWidth - entryWidth) / 2;
      const y = bucketHeight + 10 + d.entryIndex * (entryHeight + 5);
      return `translate(${x},${y})`;
    });

    // Draw entry rectangles
    entryGroups
      .append("rect")
      .attr("class", "entry-rect")
      .attr("width", entryWidth)
      .attr("height", entryHeight)
      .attr("rx", 2)
      .attr("fill", "#1e40af")
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", 1);

    // Draw entry labels (key: value)
    entryGroups
      .append("text")
      .attr("class", "entry-label")
      .attr("x", entryWidth / 2)
      .attr("y", entryHeight / 2)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", "#fff")
      .attr("font-size", "10px")
      .text((d) => {
        const key = String(d.key);
        const value = String(d.value);
        const text = `${key}: ${value}`;
        return text.length > 10 ? `${text.slice(0, 10)}...` : text;
      });

    // Draw connectors from bucket to entries
    bucketGroupsEnter
      .selectAll("line.connector")
      .data((d: { index: number; entries: Array<{ key: unknown; value: unknown }> }) =>
        d.entries.map((_, i) => ({
          bucketIndex: d.index,
          entryIndex: i,
        })),
      )
      .enter()
      .append("line")
      .attr("class", "connector")
      .attr("x1", bucketWidth / 2)
      .attr("y1", bucketHeight)
      .attr("x2", bucketWidth / 2)
      .attr("y2", (d) => bucketHeight + 10 + d.entryIndex * (entryHeight + 5))
      .attr("stroke", "#475569")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "2,2");

    // Format step description
    const stepDescription = currentStep
      ? formatStepDescription(currentStep)
      : "Hash Map Visualization";

    // Update step indicator
    mainGroup.selectAll("text.step-indicator").remove();
    mainGroup
      .append("text")
      .attr("class", "step-indicator")
      .attr("x", width / 2)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .attr("fill", "#cbd5e1")
      .attr("font-size", "16px")
      .attr("font-weight", "500")
      .text(stepDescription);

    // Cleanup on unmount
    return () => {
      svg.selectAll("*").interrupt();
    };
  }, [data, steps, currentStepIndex, isAnimating]);

  return <svg ref={svgRef} viewBox="0 0 800 600" className="hashmap-svg" />;
}

/**
 * Format step description for display
 */
function formatStepDescription(step: VisualizationStep): string {
  const metadata = step.metadata as
    | {
        key?: unknown;
        value?: unknown;
        index?: number;
        hashValue?: number;
        found?: boolean;
        deleted?: boolean;
        updated?: boolean;
        collision?: boolean;
        oldValue?: unknown;
        deletedValue?: unknown;
        cleared?: boolean;
        resized?: boolean;
        oldCapacity?: number;
        newCapacity?: number;
      }
    | undefined;

  switch (step.type) {
    case "set": {
      const key = String(metadata?.key);
      const value = String(metadata?.value);
      const updated = metadata?.updated === true;
      const collision = metadata?.collision === true;
      const action = updated ? "Updated" : "Set";
      const collisionText = collision ? " (collision)" : "";
      return `${action} ${key} = ${value}${collisionText} at bucket ${metadata?.index}`;
    }
    case "get": {
      const key = String(metadata?.key);
      const found = metadata?.found === true;
      if (found) {
        const value = String(metadata?.value);
        return `Get ${key} = ${value} from bucket ${metadata?.index}`;
      }
      return `Get ${key} (not found) at bucket ${metadata?.index}`;
    }
    case "delete": {
      const key = String(metadata?.key);
      const deleted = metadata?.deleted === true;
      if (deleted) {
        return `Deleted ${key} from bucket ${metadata?.index}`;
      }
      return `Delete ${key} (not found) at bucket ${metadata?.index}`;
    }
    case "clear":
      return "Cleared all entries";
    case "resize":
      return `Resized from ${metadata?.oldCapacity} to ${metadata?.newCapacity} buckets`;
    default:
      return `Operation: ${step.type}`;
  }
}
