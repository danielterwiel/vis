import { useEffect, useRef } from "react";
import * as d3 from "d3";
import type { VisualizationStep } from "../../store/useAppStore";
import type { BinaryTreeNode } from "../../lib/dataStructures/TrackedBinaryTree";
import "./BinaryTreeVisualizer.css";

interface BinaryTreeVisualizerProps {
  data: BinaryTreeNode<number> | null;
  steps?: VisualizationStep[];
  currentStepIndex?: number;
  isAnimating?: boolean;
}

interface TreeNode extends d3.HierarchyPointNode<BinaryTreeNode<number>> {
  x: number;
  y: number;
}

export function BinaryTreeVisualizer({
  data,
  steps = [],
  currentStepIndex = -1,
  isAnimating = false,
}: BinaryTreeVisualizerProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = 800;
    const height = 600;
    const duration = isAnimating ? 500 : 0;

    // Create or select persistent main group for tree
    let g = svg.select<SVGGElement>("g.tree-group");
    if (g.empty()) {
      g = svg.append("g").attr("class", "tree-group");
    }

    // Handle empty tree case with data join pattern
    const emptyData = data ? [] : [{ x: width / 2, y: height / 2, text: "Empty tree" }];
    g.selectAll<SVGTextElement, { x: number; y: number; text: string }>("text.empty-message")
      .data(emptyData, (d) => d.text)
      .join(
        (enter) =>
          enter
            .append("text")
            .attr("x", (d) => d.x)
            .attr("y", (d) => d.y)
            .attr("text-anchor", "middle")
            .attr("class", "empty-message")
            .text((d) => d.text),
        (update) => update,
        (exit) => exit.remove(),
      );

    if (!data) {
      // Clear nodes and links when tree is empty
      g.selectAll(".link").data([]).join("line");
      g.selectAll(".node-group").data([]).join("g");
      return;
    }

    // Create D3 hierarchy from tree data
    const root = d3.hierarchy(data, (d) => {
      const children: BinaryTreeNode<number>[] = [];
      if (d.left) children.push(d.left);
      if (d.right) children.push(d.right);
      return children.length > 0 ? children : null;
    });

    // Calculate tree layout
    const treeLayout = d3.tree<BinaryTreeNode<number>>().size([width - 100, height - 100]);
    const treeData = treeLayout(root) as TreeNode;

    // Shift tree to center
    const nodes = treeData.descendants() as TreeNode[];
    const links = treeData.links();

    // Get current step metadata for highlighting
    const currentStep =
      currentStepIndex >= 0 && currentStepIndex < steps.length ? steps[currentStepIndex] : null;
    const metadata = currentStep?.metadata as
      | {
          value?: number;
          inserted?: boolean;
          found?: boolean;
          deleted?: boolean;
          path?: number[];
          comparing?: boolean;
        }
      | undefined;

    // Convert path array to Set for O(1) lookup in render loop
    const pathSet = metadata?.path ? new Set(metadata.path) : undefined;

    // Draw links (edges)
    g.selectAll(".link")
      .data(links, (d: unknown) => {
        const link = d as { target: TreeNode };
        return `${link.target.data.value}`;
      })
      .join(
        (enter) =>
          enter
            .append("line")
            .attr("class", "link")
            .attr("x1", (d) => d.source.x + 50)
            .attr("y1", (d) => d.source.y + 50)
            .attr("x2", (d) => d.source.x + 50)
            .attr("y2", (d) => d.source.y + 50)
            .attr("stroke", "#444")
            .attr("stroke-width", 2)
            .call((enter) =>
              enter
                .transition()
                .duration(duration)
                .attr("x2", (d) => d.target.x + 50)
                .attr("y2", (d) => d.target.y + 50),
            ),
        (update) =>
          update.call((update) =>
            update
              .transition()
              .duration(duration)
              .attr("x1", (d) => d.source.x + 50)
              .attr("y1", (d) => d.source.y + 50)
              .attr("x2", (d) => d.target.x + 50)
              .attr("y2", (d) => d.target.y + 50),
          ),
        (exit) => exit.transition().duration(duration).attr("stroke-opacity", 0).remove(),
      );

    // Draw nodes
    g.selectAll(".node-group")
      .data(nodes, (d: unknown) => {
        const node = d as TreeNode;
        return `${node.data.value}`;
      })
      .join(
        (enter) => {
          const group = enter.append("g").attr("class", "node-group");

          group
            .append("circle")
            .attr("class", "node")
            .attr("cx", (d) => d.x + 50)
            .attr("cy", (d) => d.y + 50)
            .attr("r", 0)
            .attr("fill", (d) => getNodeColor(d.data.value, metadata, pathSet))
            .attr("stroke", "#fff")
            .attr("stroke-width", 2)
            .transition()
            .duration(duration)
            .attr("r", 25);

          group
            .append("text")
            .attr("class", "node-label")
            .attr("x", (d) => d.x + 50)
            .attr("y", (d) => d.y + 55)
            .attr("text-anchor", "middle")
            .attr("fill", "#fff")
            .attr("font-size", "14px")
            .attr("font-weight", "bold")
            .attr("opacity", 0)
            .text((d) => d.data.value)
            .transition()
            .duration(duration)
            .attr("opacity", 1);

          return group;
        },
        (update) => {
          update
            .select("circle")
            .transition()
            .duration(duration)
            .attr("cx", (d) => d.x + 50)
            .attr("cy", (d) => d.y + 50)
            .attr("fill", (d) => getNodeColor(d.data.value, metadata, pathSet));

          update
            .select("text")
            .transition()
            .duration(duration)
            .attr("x", (d) => d.x + 50)
            .attr("y", (d) => d.y + 55);

          return update;
        },
        (exit) => {
          exit.select("circle").transition().duration(duration).attr("r", 0);
          exit.select("text").transition().duration(duration).attr("opacity", 0);
          exit.transition().duration(duration).remove();
          return exit;
        },
      );

    // Cleanup function
    return () => {
      try {
        svg.selectAll("*").interrupt();
      } catch {
        // Ignore D3 cleanup errors in test environment
      }
    };
  }, [data, currentStepIndex, isAnimating, steps]);

  // Format step description
  const currentStep =
    currentStepIndex >= 0 && currentStepIndex < steps.length ? steps[currentStepIndex] : null;
  const stepDescription = currentStep ? formatStep(currentStep) : "";

  return (
    <div className="binary-tree-visualizer">
      <svg ref={svgRef} viewBox="0 0 800 600" preserveAspectRatio="xMidYMid meet" />
      {stepDescription && <div className="step-indicator">{stepDescription}</div>}
    </div>
  );
}

function getNodeColor(
  value: number,
  metadata:
    | {
        value?: number;
        inserted?: boolean;
        found?: boolean;
        deleted?: boolean;
        path?: number[];
        comparing?: boolean;
      }
    | undefined,
  pathSet?: Set<number>,
): string {
  if (!metadata) return "#4169e1"; // Default blue

  // Check if this node is in the path using O(1) Set lookup
  const inPath = pathSet?.has(value);

  if (metadata.deleted && metadata.value === value) return "#dc2626"; // Red for deleted
  if (metadata.found && metadata.value === value) return "#9333ea"; // Purple for found
  if (metadata.inserted && metadata.value === value) return "#16a34a"; // Green for inserted
  if (metadata.comparing && inPath) return "#ea580c"; // Orange for comparing (in path)

  return "#4169e1"; // Default blue
}

function formatStep(step: VisualizationStep): string {
  const metadata = step.metadata as
    | {
        value?: number;
        inserted?: boolean;
        found?: boolean;
        deleted?: boolean;
        path?: number[];
        case?: string;
        successor?: number;
        traversalType?: string;
        result?: number[];
        isValid?: boolean;
        height?: number;
        cleared?: boolean;
      }
    | undefined;

  switch (step.type) {
    case "insert":
      if (metadata?.inserted) {
        return `Inserted ${metadata.value} into tree`;
      }
      return `Inserting ${metadata?.value}...`;

    case "delete":
      if (metadata?.deleted) {
        const caseInfo = metadata.case ? ` (${metadata.case})` : "";
        return `Deleted ${metadata.value}${caseInfo}`;
      }
      return `Deleting ${metadata?.value}...`;

    case "search":
      if (metadata?.found) {
        return `Found ${metadata.value} at index ${metadata.path?.[metadata.path.length - 1] ?? ""}`;
      }
      return `Searching for ${metadata?.value}...`;

    case "inorderTraversal":
      return `In-order traversal: [${metadata?.result?.join(", ") ?? ""}]`;

    case "preorderTraversal":
      return `Pre-order traversal: [${metadata?.result?.join(", ") ?? ""}]`;

    case "postorderTraversal":
      return `Post-order traversal: [${metadata?.result?.join(", ") ?? ""}]`;

    case "isValidBST":
      return `BST validation: ${metadata?.isValid ? "Valid" : "Invalid"}`;

    case "getHeight":
      return `Tree height: ${metadata?.height ?? 0}`;

    case "clear":
      return "Tree cleared";

    default:
      return step.type;
  }
}
