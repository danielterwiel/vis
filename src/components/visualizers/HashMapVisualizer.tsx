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

    // Get or create main group (persistent - never removed)
    let mainGroup = svg.select<SVGGElement>("g.main-group");
    if (mainGroup.empty()) {
      mainGroup = svg.append("g").attr("class", "main-group");
    }

    // Draw buckets using D3 data join pattern
    type BucketData = {
      index: number;
      entries: Array<{ key: unknown; value: unknown }>;
      hasEntries: boolean;
    };

    // Helper to get bucket fill color
    const getBucketFill = (d: BucketData) => {
      if (d.index === activeIndex) {
        if (isDeleted) return "#ef4444"; // Red for delete
        if (isFound) return "#a78bfa"; // Purple for found
        if (isCollision) return "#fb923c"; // Orange for collision
        return "#22c55e"; // Green for active
      }
      return d.hasEntries ? "#3b82f6" : "#1e293b"; // Blue if has entries, dark if empty
    };

    const bucketGroups = mainGroup
      .selectAll<SVGGElement, BucketData>("g.bucket")
      .data(visibleBuckets, (d) => d.index)
      .join(
        // Enter: create new bucket groups
        (enter) => {
          const g = enter.append("g").attr("class", "bucket");

          // Position buckets in grid
          g.attr("transform", (d) => {
            const row = Math.floor(d.index / bucketsPerRow);
            const col = d.index % bucketsPerRow;
            const x = margin.left + col * (bucketWidth + 10);
            const y = margin.top + row * (bucketHeight + 80);
            return `translate(${x},${y})`;
          });

          // Draw bucket rectangles
          g.append("rect")
            .attr("class", "bucket-rect")
            .attr("width", bucketWidth)
            .attr("height", bucketHeight)
            .attr("rx", 4)
            .attr("fill", getBucketFill)
            .attr("stroke", (d) => (d.index === activeIndex ? "#fff" : "#475569"))
            .attr("stroke-width", (d) => (d.index === activeIndex ? 2 : 1));

          // Draw bucket index labels
          g.append("text")
            .attr("class", "bucket-index")
            .attr("x", bucketWidth / 2)
            .attr("y", bucketHeight / 2)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .attr("fill", "#fff")
            .attr("font-size", "14px")
            .attr("font-weight", "bold")
            .text((d) => d.index);

          return g;
        },
        // Update: update existing bucket groups
        (update) => {
          // Update bucket rectangle colors (for highlighting)
          update
            .select("rect.bucket-rect")
            .attr("fill", getBucketFill)
            .attr("stroke", (d) => (d.index === activeIndex ? "#fff" : "#475569"))
            .attr("stroke-width", (d) => (d.index === activeIndex ? 2 : 1));
          return update;
        },
        // Exit: remove old bucket groups
        (exit) => exit.remove(),
      );

    // Draw collision chains (entries in buckets) using D3 data join pattern
    type EntryData = {
      bucketIndex: number;
      entryIndex: number;
      key: unknown;
      value: unknown;
    };

    bucketGroups.each(function (bucketData) {
      const bucketGroup = d3.select(this);

      // Prepare entry data for this bucket
      const entriesData: EntryData[] = bucketData.entries.map((entry, i) => ({
        bucketIndex: bucketData.index,
        entryIndex: i,
        key: entry.key,
        value: entry.value,
      }));

      // Data join for entries
      bucketGroup
        .selectAll<SVGGElement, EntryData>("g.entry")
        .data(entriesData, (d) => `${d.bucketIndex}-${d.entryIndex}-${String(d.key)}`)
        .join(
          // Enter: create new entry groups
          (enter) => {
            const g = enter.append("g").attr("class", "entry");

            // Position entries below bucket
            g.attr("transform", (d) => {
              const x = (bucketWidth - entryWidth) / 2;
              const y = bucketHeight + 10 + d.entryIndex * (entryHeight + 5);
              return `translate(${x},${y})`;
            });

            // Draw entry rectangles
            g.append("rect")
              .attr("class", "entry-rect")
              .attr("width", entryWidth)
              .attr("height", entryHeight)
              .attr("rx", 2)
              .attr("fill", "#1e40af")
              .attr("stroke", "#3b82f6")
              .attr("stroke-width", 1);

            // Draw entry labels (key: value)
            g.append("text")
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

            return g;
          },
          // Update: update existing entry groups
          (update) => {
            // Update position (in case entry index changed)
            update.attr("transform", (d) => {
              const x = (bucketWidth - entryWidth) / 2;
              const y = bucketHeight + 10 + d.entryIndex * (entryHeight + 5);
              return `translate(${x},${y})`;
            });

            // Update text content
            update.select("text.entry-label").text((d) => {
              const key = String(d.key);
              const value = String(d.value);
              const text = `${key}: ${value}`;
              return text.length > 10 ? `${text.slice(0, 10)}...` : text;
            });

            return update;
          },
          // Exit: remove old entry groups
          (exit) => exit.remove(),
        );

      // Data join for connectors
      type ConnectorData = { bucketIndex: number; entryIndex: number };
      const connectorsData: ConnectorData[] = bucketData.entries.map((_, i) => ({
        bucketIndex: bucketData.index,
        entryIndex: i,
      }));

      bucketGroup
        .selectAll<SVGLineElement, ConnectorData>("line.connector")
        .data(connectorsData, (d) => `${d.bucketIndex}-${d.entryIndex}`)
        .join(
          // Enter: create new connectors
          (enter) =>
            enter
              .append("line")
              .attr("class", "connector")
              .attr("x1", bucketWidth / 2)
              .attr("y1", bucketHeight)
              .attr("x2", bucketWidth / 2)
              .attr("y2", (d) => bucketHeight + 10 + d.entryIndex * (entryHeight + 5))
              .attr("stroke", "#475569")
              .attr("stroke-width", 1)
              .attr("stroke-dasharray", "2,2"),
          // Update: update connector positions
          (update) =>
            update.attr("y2", (d) => bucketHeight + 10 + d.entryIndex * (entryHeight + 5)),
          // Exit: remove old connectors
          (exit) => exit.remove(),
        );
    });

    // Format step description
    const stepDescription = currentStep
      ? formatStepDescription(currentStep)
      : "Hash Map Visualization";

    // Update step indicator using D3 data join pattern
    mainGroup
      .selectAll<SVGTextElement, string>("text.step-indicator")
      .data([stepDescription])
      .join(
        // Enter: create step indicator
        (enter) =>
          enter
            .append("text")
            .attr("class", "step-indicator")
            .attr("x", width / 2)
            .attr("y", 30)
            .attr("text-anchor", "middle")
            .attr("fill", "#cbd5e1")
            .attr("font-size", "16px")
            .attr("font-weight", "500")
            .text((d) => d),
        // Update: update text content
        (update) => update.text((d) => d),
        // Exit: remove (shouldn't happen with single element)
        (exit) => exit.remove(),
      );

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
