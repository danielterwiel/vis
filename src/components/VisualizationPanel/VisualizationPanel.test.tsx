import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import VisualizationPanel from "./VisualizationPanel";

describe("VisualizationPanel", () => {
  it("renders the visualization panel", () => {
    render(<VisualizationPanel />);
    expect(screen.getByText("Visualization")).toBeDefined();
  });

  it("renders ModeSelector component", () => {
    render(<VisualizationPanel />);
    expect(screen.getByText("Visualization Mode")).toBeInTheDocument();
    expect(screen.getByText("Run My Code")).toBeInTheDocument();
    expect(screen.getByText("Show Expected")).toBeInTheDocument();
    expect(screen.getByText("Skeleton")).toBeInTheDocument();
    expect(screen.getByText("Show Solution")).toBeInTheDocument();
  });

  it("renders visualization controls", () => {
    render(<VisualizationPanel />);
    expect(screen.getByText("← Previous")).toBeDefined();
    expect(screen.getByText("Next →")).toBeDefined();
    expect(screen.getByText("▶ Play")).toBeDefined();
    expect(screen.getByText("⟲ Reset")).toBeDefined();
  });

  it("renders step counter", () => {
    render(<VisualizationPanel />);
    expect(screen.getByText(/Step \d+ \/ \d+/)).toBeDefined();
  });

  it("renders ArrayVisualizer component", () => {
    const { container } = render(<VisualizationPanel />);
    // ArrayVisualizer should render an SVG
    expect(container.querySelector("svg")).toBeInTheDocument();
  });
});
