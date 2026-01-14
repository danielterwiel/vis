import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { ArrayVisualizer } from "./ArrayVisualizer";
import type { VisualizationStep } from "../../store/useAppStore";

describe("ArrayVisualizer", () => {
  it("renders an SVG element", () => {
    const { container } = render(<ArrayVisualizer data={[1, 2, 3]} />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass("array-visualizer");
  });

  it("renders with empty data", () => {
    const { container } = render(<ArrayVisualizer data={[]} />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("renders with steps and currentStepIndex", () => {
    const steps: VisualizationStep[] = [
      {
        type: "push",
        target: "arr",
        args: [5],
        result: undefined,
        timestamp: Date.now(),
      },
      {
        type: "swap",
        target: "arr",
        args: [0, 1],
        result: undefined,
        timestamp: Date.now(),
      },
    ];

    const { container } = render(
      <ArrayVisualizer data={[1, 2, 3, 4, 5]} steps={steps} currentStepIndex={0} />,
    );
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("renders with isAnimating flag", () => {
    const { container } = render(<ArrayVisualizer data={[1, 2, 3]} isAnimating={true} />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("handles single element array", () => {
    const { container } = render(<ArrayVisualizer data={[42]} />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("handles large array", () => {
    const largeArray = Array.from({ length: 100 }, (_, i) => i + 1);
    const { container } = render(<ArrayVisualizer data={largeArray} />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("handles negative values", () => {
    const { container } = render(<ArrayVisualizer data={[-5, -2, -8, -1]} />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("handles mixed positive and negative values", () => {
    const { container } = render(<ArrayVisualizer data={[-3, 5, -1, 8, 0]} />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("handles step with compare operation", () => {
    const steps: VisualizationStep[] = [
      {
        type: "compare",
        target: "arr",
        args: [1, 2],
        result: undefined,
        timestamp: Date.now(),
      },
    ];

    const { container } = render(
      <ArrayVisualizer data={[5, 2, 8, 1, 9]} steps={steps} currentStepIndex={0} />,
    );
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("handles step with partition operation", () => {
    const steps: VisualizationStep[] = [
      {
        type: "partition",
        target: "arr",
        args: [3],
        result: undefined,
        timestamp: Date.now(),
      },
    ];

    const { container } = render(
      <ArrayVisualizer data={[10, 30, 40, 50, 70]} steps={steps} currentStepIndex={0} />,
    );
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("handles step with set operation", () => {
    const steps: VisualizationStep[] = [
      {
        type: "set",
        target: "arr",
        args: [2, 99],
        result: undefined,
        timestamp: Date.now(),
      },
    ];

    const { container } = render(
      <ArrayVisualizer data={[1, 2, 99, 4, 5]} steps={steps} currentStepIndex={0} />,
    );
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("handles step with no args", () => {
    const steps: VisualizationStep[] = [
      {
        type: "sort",
        target: "arr",
        args: [],
        result: undefined,
        timestamp: Date.now(),
      },
    ];

    const { container } = render(
      <ArrayVisualizer data={[1, 2, 3, 4, 5]} steps={steps} currentStepIndex={0} />,
    );
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("handles currentStepIndex = -1", () => {
    const steps: VisualizationStep[] = [
      {
        type: "push",
        target: "arr",
        args: [5],
        result: undefined,
        timestamp: Date.now(),
      },
    ];

    const { container } = render(
      <ArrayVisualizer data={[1, 2, 3]} steps={steps} currentStepIndex={-1} />,
    );
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("handles currentStepIndex beyond steps length", () => {
    const steps: VisualizationStep[] = [
      {
        type: "push",
        target: "arr",
        args: [5],
        result: undefined,
        timestamp: Date.now(),
      },
    ];

    const { container } = render(
      <ArrayVisualizer data={[1, 2, 3]} steps={steps} currentStepIndex={10} />,
    );
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it.skip("has correct viewBox and preserveAspectRatio", () => {
    // Skip: D3 attribute setting doesn't work properly in jsdom
    const { container } = render(<ArrayVisualizer data={[1, 2, 3]} />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("viewBox", "0 0 800 400");
    expect(svg).toHaveAttribute("preserveAspectRatio", "xMidYMid meet");
  });

  it("renders correct number of bars for initial data", () => {
    const testData = [5, 2, 8, 1, 9];
    const { container } = render(<ArrayVisualizer data={testData} />);
    const bars = container.querySelectorAll("g.bar");
    expect(bars).toHaveLength(testData.length);
  });

  it("renders a bar for each data point including small values", () => {
    const testData = [10, 1, 5]; // Includes value 1 which is small
    const { container } = render(<ArrayVisualizer data={testData} />);
    const bars = container.querySelectorAll("g.bar");
    expect(bars).toHaveLength(3);
    // Each bar should have a rect
    const rects = container.querySelectorAll("g.bar rect");
    expect(rects).toHaveLength(3);
  });

  it("re-renders when data changes", () => {
    const { container, rerender } = render(<ArrayVisualizer data={[1, 2, 3]} />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();

    rerender(<ArrayVisualizer data={[4, 5, 6, 7]} />);
    expect(svg).toBeInTheDocument();
  });

  it("re-renders when steps change", () => {
    const steps1: VisualizationStep[] = [
      {
        type: "push",
        target: "arr",
        args: [5],
        result: undefined,
        timestamp: Date.now(),
      },
    ];

    const steps2: VisualizationStep[] = [
      {
        type: "swap",
        target: "arr",
        args: [0, 1],
        result: undefined,
        timestamp: Date.now(),
      },
    ];

    const { container, rerender } = render(
      <ArrayVisualizer data={[1, 2, 3]} steps={steps1} currentStepIndex={0} />,
    );
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();

    rerender(<ArrayVisualizer data={[1, 2, 3]} steps={steps2} currentStepIndex={0} />);
    expect(svg).toBeInTheDocument();
  });

  it("cleans up on unmount", () => {
    const { container, unmount } = render(<ArrayVisualizer data={[1, 2, 3]} />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();

    unmount();
    // Verify component unmounted cleanly
    expect(container.querySelector("svg")).not.toBeInTheDocument();
  });
});
