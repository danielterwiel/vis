import { useMemo } from "react";
import { ArrayVisualizer } from "../visualizers/ArrayVisualizer";
import { LinkedListVisualizer } from "../visualizers/LinkedListVisualizer";
import { StackQueueVisualizer } from "../visualizers/StackQueueVisualizer";
import { BinaryTreeVisualizer } from "../visualizers/BinaryTreeVisualizer";
import GraphVisualizer from "../visualizers/GraphVisualizer";
import { HashMapVisualizer } from "../visualizers/HashMapVisualizer";
import type { DataStructureType, VisualizationStep } from "../../store/useAppStore";
import type { LinkedListNode } from "../../lib/dataStructures/TrackedLinkedList";
import type { BinaryTreeNode } from "../../lib/dataStructures/TrackedBinaryTree";
import type { HashMapBucket } from "../../lib/dataStructures/TrackedHashMap";
import "./ComparisonView.css";

interface ComparisonViewProps {
  dataStructure: DataStructureType;
  leftData: unknown;
  rightData: unknown;
  leftSteps: VisualizationStep[];
  rightSteps: VisualizationStep[];
  currentStepIndex: number;
  isAnimating: boolean;
  leftLabel: string;
  rightLabel: string;
}

export function ComparisonView({
  dataStructure,
  leftData,
  rightData,
  leftSteps,
  rightSteps,
  currentStepIndex,
  isAnimating,
  leftLabel,
  rightLabel,
}: ComparisonViewProps) {
  // Render visualizer based on data structure
  const renderVisualizer = (data: unknown, steps: VisualizationStep[], stepIndex: number) => {
    switch (dataStructure) {
      case "array":
        return (
          <ArrayVisualizer
            data={data as number[]}
            steps={steps}
            currentStepIndex={stepIndex}
            isAnimating={isAnimating}
          />
        );
      case "linkedList":
        return (
          <LinkedListVisualizer
            data={data as LinkedListNode<unknown> | null}
            steps={steps}
            currentStepIndex={stepIndex}
            isAnimating={isAnimating}
          />
        );
      case "stack":
        return (
          <StackQueueVisualizer
            data={data as unknown[]}
            steps={steps}
            currentStepIndex={stepIndex}
            isAnimating={isAnimating}
            mode="stack"
          />
        );
      case "queue":
        return (
          <StackQueueVisualizer
            data={data as unknown[]}
            steps={steps}
            currentStepIndex={stepIndex}
            isAnimating={isAnimating}
            mode="queue"
          />
        );
      case "tree":
        return (
          <BinaryTreeVisualizer
            data={data as BinaryTreeNode<number> | null}
            steps={steps}
            currentStepIndex={stepIndex}
            isAnimating={isAnimating}
          />
        );
      case "graph":
        return (
          <GraphVisualizer
            data={
              data as Array<{
                id: string | number;
                label?: string;
                edges?: Array<{
                  from: string | number;
                  to: string | number;
                  weight?: number;
                  directed?: boolean;
                }>;
              }> | null
            }
            steps={steps}
            currentStepIndex={stepIndex}
            isAnimating={isAnimating}
          />
        );
      case "hashMap":
        return (
          <HashMapVisualizer
            data={data as HashMapBucket<unknown, unknown>[] | null}
            steps={steps}
            currentStepIndex={stepIndex}
            isAnimating={isAnimating}
          />
        );
      default:
        return (
          <ArrayVisualizer
            data={data as number[]}
            steps={steps}
            currentStepIndex={stepIndex}
            isAnimating={isAnimating}
          />
        );
    }
  };

  // Calculate synchronized step index (use min of both lengths)
  const syncedStepIndex = useMemo(() => {
    const maxLeft = leftSteps.length - 1;
    const maxRight = rightSteps.length - 1;
    const maxIndex = Math.min(maxLeft, maxRight);
    return Math.min(currentStepIndex, maxIndex);
  }, [currentStepIndex, leftSteps.length, rightSteps.length]);

  return (
    <div className="comparison-view">
      <div className="comparison-panel">
        <div className="comparison-header">
          <h3>{leftLabel}</h3>
        </div>
        <div className="comparison-visualizer">
          {renderVisualizer(leftData, leftSteps, syncedStepIndex)}
        </div>
      </div>
      <div className="comparison-divider" />
      <div className="comparison-panel">
        <div className="comparison-header">
          <h3>{rightLabel}</h3>
        </div>
        <div className="comparison-visualizer">
          {renderVisualizer(rightData, rightSteps, syncedStepIndex)}
        </div>
      </div>
    </div>
  );
}
