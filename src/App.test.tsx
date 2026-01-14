import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "./App";

describe("App", () => {
  it("renders the application header", () => {
    render(<App />);
    expect(screen.getByText("Data Structure Visualizer")).toBeDefined();
  });

  it("renders the editor panel", () => {
    render(<App />);
    expect(screen.getByText("Editor")).toBeDefined();
  });

  it("renders the visualization panel", () => {
    render(<App />);
    expect(screen.getByText("Visualization")).toBeDefined();
  });
});
