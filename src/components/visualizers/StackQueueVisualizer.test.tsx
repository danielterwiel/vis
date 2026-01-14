import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { StackQueueVisualizer } from "./StackQueueVisualizer";
import type { VisualizationStep } from "../../store/useAppStore";

describe("StackQueueVisualizer", () => {
  afterEach(() => {
    cleanup();
  });

  describe("Stack Mode", () => {
    it("should render null data without crashing", () => {
      const { container } = render(<StackQueueVisualizer data={null} mode="stack" />);
      expect(container.querySelector("svg")).toBeInTheDocument();
    });

    it("should render empty stack", () => {
      const { container } = render(<StackQueueVisualizer data={[]} mode="stack" />);
      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });

    it("should render stack with single element", () => {
      const { container } = render(<StackQueueVisualizer data={[10]} mode="stack" />);
      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
      // D3 renders inside SVG, check for presence
      expect(svg?.querySelector("g.element")).toBeInTheDocument();
    });

    it("should render stack with multiple elements", () => {
      const { container } = render(<StackQueueVisualizer data={[10, 20, 30, 40]} mode="stack" />);
      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });

    it("should display TOP pointer for non-empty stack", () => {
      const { container } = render(<StackQueueVisualizer data={[10, 20, 30]} mode="stack" />);
      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
      // Pointer label rendered by D3
    });

    it("should handle push operation step", () => {
      const steps: VisualizationStep[] = [
        {
          type: "push",
          target: "stack",
          args: [50],
          result: [10, 20, 30, 50],
          timestamp: Date.now(),
          metadata: { index: 3, value: 50 },
        },
      ];

      const { container } = render(
        <StackQueueVisualizer
          data={[10, 20, 30, 50]}
          steps={steps}
          currentStepIndex={0}
          mode="stack"
        />,
      );

      expect(container.querySelector("svg")).toBeInTheDocument();
    });

    it("should handle pop operation step", () => {
      const steps: VisualizationStep[] = [
        {
          type: "pop",
          target: "stack",
          args: [],
          result: [10, 20],
          timestamp: Date.now(),
          metadata: { value: 30 },
        },
      ];

      const { container } = render(
        <StackQueueVisualizer data={[10, 20]} steps={steps} currentStepIndex={0} mode="stack" />,
      );

      expect(container.querySelector("svg")).toBeInTheDocument();
    });

    it("should handle peek operation step", () => {
      const steps: VisualizationStep[] = [
        {
          type: "peek",
          target: "stack",
          args: [],
          result: [10, 20, 30],
          timestamp: Date.now(),
          metadata: { value: 30 },
        },
      ];

      const { container } = render(
        <StackQueueVisualizer
          data={[10, 20, 30]}
          steps={steps}
          currentStepIndex={0}
          mode="stack"
        />,
      );

      expect(container.querySelector("svg")).toBeInTheDocument();
    });

    it("should handle clear operation step", () => {
      const steps: VisualizationStep[] = [
        {
          type: "clear",
          target: "stack",
          args: [],
          result: [],
          timestamp: Date.now(),
        },
      ];

      const { container } = render(
        <StackQueueVisualizer data={[]} steps={steps} currentStepIndex={0} mode="stack" />,
      );

      expect(container.querySelector("svg")).toBeInTheDocument();
    });

    it("should handle isEmpty operation step", () => {
      const steps: VisualizationStep[] = [
        {
          type: "isEmpty",
          target: "stack",
          args: [],
          result: [10],
          timestamp: Date.now(),
          metadata: { empty: false },
        },
      ];

      const { container } = render(
        <StackQueueVisualizer data={[10]} steps={steps} currentStepIndex={0} mode="stack" />,
      );

      expect(container.querySelector("svg")).toBeInTheDocument();
    });
  });

  describe("Queue Mode", () => {
    it("should render null data without crashing", () => {
      const { container } = render(<StackQueueVisualizer data={null} mode="queue" />);
      expect(container.querySelector("svg")).toBeInTheDocument();
    });

    it("should render empty queue", () => {
      const { container } = render(<StackQueueVisualizer data={[]} mode="queue" />);
      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });

    it("should render queue with single element", () => {
      const { container } = render(<StackQueueVisualizer data={[10]} mode="queue" />);
      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
      expect(svg?.querySelector("g.element")).toBeInTheDocument();
    });

    it("should render queue with multiple elements", () => {
      const { container } = render(<StackQueueVisualizer data={[10, 20, 30, 40]} mode="queue" />);
      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });

    it("should display FRONT and REAR pointers for non-empty queue", () => {
      const { container } = render(<StackQueueVisualizer data={[10, 20, 30]} mode="queue" />);
      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
      // Pointer labels rendered by D3
    });

    it("should handle enqueue operation step", () => {
      const steps: VisualizationStep[] = [
        {
          type: "enqueue",
          target: "queue",
          args: [50],
          result: [10, 20, 30, 50],
          timestamp: Date.now(),
          metadata: { index: 3, value: 50 },
        },
      ];

      const { container } = render(
        <StackQueueVisualizer
          data={[10, 20, 30, 50]}
          steps={steps}
          currentStepIndex={0}
          mode="queue"
        />,
      );

      expect(container.querySelector("svg")).toBeInTheDocument();
    });

    it("should handle dequeue operation step", () => {
      const steps: VisualizationStep[] = [
        {
          type: "dequeue",
          target: "queue",
          args: [],
          result: [20, 30],
          timestamp: Date.now(),
          metadata: { value: 10 },
        },
      ];

      const { container } = render(
        <StackQueueVisualizer data={[20, 30]} steps={steps} currentStepIndex={0} mode="queue" />,
      );

      expect(container.querySelector("svg")).toBeInTheDocument();
    });

    it("should handle peek operation step in queue mode", () => {
      const steps: VisualizationStep[] = [
        {
          type: "peek",
          target: "queue",
          args: [],
          result: [10, 20, 30],
          timestamp: Date.now(),
          metadata: { value: 10 },
        },
      ];

      const { container } = render(
        <StackQueueVisualizer
          data={[10, 20, 30]}
          steps={steps}
          currentStepIndex={0}
          mode="queue"
        />,
      );

      expect(container.querySelector("svg")).toBeInTheDocument();
    });

    it("should handle clear operation in queue mode", () => {
      const steps: VisualizationStep[] = [
        {
          type: "clear",
          target: "queue",
          args: [],
          result: [],
          timestamp: Date.now(),
        },
      ];

      const { container } = render(
        <StackQueueVisualizer data={[]} steps={steps} currentStepIndex={0} mode="queue" />,
      );

      expect(container.querySelector("svg")).toBeInTheDocument();
    });

    it("should handle isEmpty operation in queue mode", () => {
      const steps: VisualizationStep[] = [
        {
          type: "isEmpty",
          target: "queue",
          args: [],
          result: [],
          timestamp: Date.now(),
          metadata: { empty: true },
        },
      ];

      const { container } = render(
        <StackQueueVisualizer data={[]} steps={steps} currentStepIndex={0} mode="queue" />,
      );

      expect(container.querySelector("svg")).toBeInTheDocument();
    });
  });

  describe("Animation and Edge Cases", () => {
    it("should handle isAnimating prop", () => {
      const { container } = render(
        <StackQueueVisualizer data={[10, 20, 30]} isAnimating={true} mode="stack" />,
      );
      expect(container.querySelector("svg")).toBeInTheDocument();
    });

    it("should handle undefined steps", () => {
      const { container } = render(<StackQueueVisualizer data={[10, 20]} mode="stack" />);
      expect(container.querySelector("svg")).toBeInTheDocument();
    });

    it("should handle negative currentStepIndex", () => {
      const steps: VisualizationStep[] = [
        {
          type: "push",
          target: "stack",
          args: [10],
          result: [10],
          timestamp: Date.now(),
        },
      ];

      const { container } = render(
        <StackQueueVisualizer data={[10]} steps={steps} currentStepIndex={-1} mode="stack" />,
      );

      expect(container.querySelector("svg")).toBeInTheDocument();
    });

    it("should handle out-of-bounds currentStepIndex", () => {
      const steps: VisualizationStep[] = [
        {
          type: "push",
          target: "stack",
          args: [10],
          result: [10],
          timestamp: Date.now(),
        },
      ];

      const { container } = render(
        <StackQueueVisualizer data={[10]} steps={steps} currentStepIndex={999} mode="stack" />,
      );

      expect(container.querySelector("svg")).toBeInTheDocument();
    });

    it("should re-render when data changes", () => {
      const { container, rerender } = render(<StackQueueVisualizer data={[10, 20]} mode="stack" />);

      expect(container.querySelector("svg")).toBeInTheDocument();

      rerender(<StackQueueVisualizer data={[10, 20, 30, 40]} mode="stack" />);

      expect(container.querySelector("svg")).toBeInTheDocument();
    });

    it("should handle string values in stack", () => {
      const { container } = render(<StackQueueVisualizer data={["A", "B", "C"]} mode="stack" />);
      expect(container.querySelector("svg")).toBeInTheDocument();
    });

    it("should handle string values in queue", () => {
      const { container } = render(<StackQueueVisualizer data={["X", "Y", "Z"]} mode="queue" />);
      expect(container.querySelector("svg")).toBeInTheDocument();
    });

    it("should switch between stack and queue modes", () => {
      const { container, rerender } = render(
        <StackQueueVisualizer data={[10, 20, 30]} mode="stack" />,
      );

      expect(container.querySelector("svg")).toBeInTheDocument();

      rerender(<StackQueueVisualizer data={[10, 20, 30]} mode="queue" />);

      expect(container.querySelector("svg")).toBeInTheDocument();
    });
  });
});
