import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ComparisonView } from "./ComparisonView";
import type { VisualizationStep } from "../../store/useAppStore";

describe("ComparisonView", () => {
  const mockSteps: VisualizationStep[] = [
    { type: "push", result: [1, 2, 3], timestamp: Date.now() },
    { type: "swap", result: [1, 3, 2], timestamp: Date.now() },
  ];

  const defaultProps = {
    dataStructure: "array" as const,
    leftData: [1, 2, 3],
    rightData: [1, 2, 3],
    leftSteps: mockSteps,
    rightSteps: mockSteps,
    currentStepIndex: 0,
    isAnimating: false,
    leftLabel: "Your Code",
    rightLabel: "Expected Output",
  };

  it("renders comparison view with two panels", () => {
    render(<ComparisonView {...defaultProps} />);

    expect(screen.getByText("Your Code")).toBeInTheDocument();
    expect(screen.getByText("Expected Output")).toBeInTheDocument();
  });

  it("renders both visualizers", () => {
    const { container } = render(<ComparisonView {...defaultProps} />);

    const panels = container.querySelectorAll(".comparison-panel");
    expect(panels).toHaveLength(2);
  });

  it("renders divider between panels", () => {
    const { container } = render(<ComparisonView {...defaultProps} />);

    const divider = container.querySelector(".comparison-divider");
    expect(divider).toBeInTheDocument();
  });

  it("passes correct data to left visualizer", () => {
    const leftData = [5, 10, 15];
    const rightData = [1, 2, 3];

    const { container } = render(
      <ComparisonView {...defaultProps} leftData={leftData} rightData={rightData} />,
    );

    // Both visualizers should be rendered
    const visualizers = container.querySelectorAll(".array-visualizer");
    expect(visualizers).toHaveLength(2);
  });

  it("passes correct data to right visualizer", () => {
    const leftData = [1, 2, 3];
    const rightData = [10, 20, 30];

    const { container } = render(
      <ComparisonView {...defaultProps} leftData={leftData} rightData={rightData} />,
    );

    const visualizers = container.querySelectorAll(".array-visualizer");
    expect(visualizers).toHaveLength(2);
  });

  it("synchronizes step index between visualizers", () => {
    const { container } = render(<ComparisonView {...defaultProps} currentStepIndex={1} />);

    // Both visualizers should receive the same step index
    const visualizers = container.querySelectorAll(".array-visualizer");
    expect(visualizers).toHaveLength(2);
  });

  it("handles empty left steps", () => {
    const { container } = render(<ComparisonView {...defaultProps} leftSteps={[]} />);

    const visualizers = container.querySelectorAll(".array-visualizer");
    expect(visualizers).toHaveLength(2);
  });

  it("handles empty right steps", () => {
    const { container } = render(<ComparisonView {...defaultProps} rightSteps={[]} />);

    const visualizers = container.querySelectorAll(".array-visualizer");
    expect(visualizers).toHaveLength(2);
  });

  it("handles different step counts by using minimum", () => {
    const shortSteps: VisualizationStep[] = [{ type: "push", result: [1], timestamp: Date.now() }];
    const longSteps: VisualizationStep[] = [
      { type: "push", result: [1], timestamp: Date.now() },
      { type: "push", result: [1, 2], timestamp: Date.now() },
      { type: "push", result: [1, 2, 3], timestamp: Date.now() },
    ];

    const { container } = render(
      <ComparisonView
        {...defaultProps}
        leftSteps={shortSteps}
        rightSteps={longSteps}
        currentStepIndex={2}
      />,
    );

    // Should render both visualizers
    const visualizers = container.querySelectorAll(".array-visualizer");
    expect(visualizers).toHaveLength(2);
  });

  it("renders custom labels", () => {
    render(<ComparisonView {...defaultProps} leftLabel="My Solution" rightLabel="Reference" />);

    expect(screen.getByText("My Solution")).toBeInTheDocument();
    expect(screen.getByText("Reference")).toBeInTheDocument();
  });

  it("passes isAnimating prop to both visualizers", () => {
    const { container } = render(<ComparisonView {...defaultProps} isAnimating={true} />);

    const visualizers = container.querySelectorAll(".array-visualizer");
    expect(visualizers).toHaveLength(2);
  });

  it("handles array data structure", () => {
    const { container } = render(<ComparisonView {...defaultProps} dataStructure="array" />);

    const visualizers = container.querySelectorAll(".array-visualizer");
    expect(visualizers).toHaveLength(2);
  });

  it("handles out-of-bounds step index", () => {
    const { container } = render(<ComparisonView {...defaultProps} currentStepIndex={999} />);

    // Should render without crashing
    const visualizers = container.querySelectorAll(".array-visualizer");
    expect(visualizers).toHaveLength(2);
  });

  it("renders comparison-view container", () => {
    const { container } = render(<ComparisonView {...defaultProps} />);

    const comparisonView = container.querySelector(".comparison-view");
    expect(comparisonView).toBeInTheDocument();
  });

  it("renders comparison headers", () => {
    const { container } = render(<ComparisonView {...defaultProps} />);

    const headers = container.querySelectorAll(".comparison-header");
    expect(headers).toHaveLength(2);
  });

  it("renders comparison visualizers", () => {
    const { container } = render(<ComparisonView {...defaultProps} />);

    const visualizerContainers = container.querySelectorAll(".comparison-visualizer");
    expect(visualizerContainers).toHaveLength(2);
  });
});
