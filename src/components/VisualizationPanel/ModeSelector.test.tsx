import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ModeSelector } from "./ModeSelector";
import type { VisualizationMode } from "../../store/useAppStore";

describe("ModeSelector", () => {
  const defaultProps = {
    currentMode: "skeleton" as VisualizationMode,
    onModeChange: vi.fn(),
    codeStatus: "incomplete" as const,
    hasSteps: false,
  };

  it("renders all mode buttons", () => {
    render(<ModeSelector {...defaultProps} />);

    expect(screen.getByText("Code Visualization")).toBeInTheDocument();
    expect(screen.getByText("Compare")).toBeInTheDocument();
  });

  it("displays mode description when no steps", () => {
    render(<ModeSelector {...defaultProps} currentMode="user-code" hasSteps={false} />);

    expect(screen.getByText(/Run a test to see your code/i)).toBeInTheDocument();
  });

  it("highlights active mode button", () => {
    render(<ModeSelector {...defaultProps} currentMode="comparison" hasSteps />);

    const compareButton = screen.getByText("Compare");
    expect(compareButton).toHaveClass("active");
  });

  it("disables 'Code Visualization' when there are no steps (regardless of code status)", () => {
    render(<ModeSelector {...defaultProps} codeStatus="incomplete" hasSteps={false} />);

    const runButton = screen.getByText("Code Visualization");
    expect(runButton).toBeDisabled();
  });

  it("disables 'Code Visualization' when there are no steps even with complete code", () => {
    render(<ModeSelector {...defaultProps} codeStatus="complete" hasSteps={false} />);

    const runButton = screen.getByText("Code Visualization");
    expect(runButton).toBeDisabled();
  });

  it("enables 'Code Visualization' when has steps", () => {
    render(<ModeSelector {...defaultProps} codeStatus="complete" hasSteps />);

    const runButton = screen.getByText("Code Visualization");
    expect(runButton).not.toBeDisabled();
  });

  it("does not call onModeChange when clicking disabled Code Visualization", async () => {
    const onModeChange = vi.fn();
    const user = userEvent.setup();

    render(<ModeSelector {...defaultProps} onModeChange={onModeChange} hasSteps={false} />);

    const button = screen.getByText("Code Visualization");
    await user.click(button);

    expect(onModeChange).not.toHaveBeenCalled();
  });

  it("does not call onModeChange when clicking disabled Compare", async () => {
    const onModeChange = vi.fn();
    const user = userEvent.setup();

    render(<ModeSelector {...defaultProps} onModeChange={onModeChange} hasSteps={false} />);

    const button = screen.getByText("Compare");
    await user.click(button);

    expect(onModeChange).not.toHaveBeenCalled();
  });

  it("displays user-code mode description when no steps", () => {
    render(<ModeSelector {...defaultProps} currentMode="user-code" hasSteps={false} />);

    expect(screen.getByText(/Run a test to see your code/i)).toBeInTheDocument();
  });

  it("does not display description when user-code mode has steps", () => {
    render(<ModeSelector {...defaultProps} currentMode="user-code" hasSteps />);

    // No description text is shown when user has steps - the visualization speaks for itself
    expect(screen.queryByText(/Visualizing your code execution/i)).not.toBeInTheDocument();
  });

  it("displays comparison mode description when no steps", () => {
    render(<ModeSelector {...defaultProps} currentMode="comparison" hasSteps={false} />);

    expect(screen.getByText(/Run a test to compare/i)).toBeInTheDocument();
  });

  it("does not display description when comparison mode has steps", () => {
    render(<ModeSelector {...defaultProps} currentMode="comparison" hasSteps />);

    expect(screen.queryByText(/Run a test to compare/i)).not.toBeInTheDocument();
  });

  it("calls onModeChange when clicking enabled 'Code Visualization'", async () => {
    const onModeChange = vi.fn();
    const user = userEvent.setup();

    render(
      <ModeSelector {...defaultProps} codeStatus="complete" hasSteps onModeChange={onModeChange} />,
    );

    await user.click(screen.getByText("Code Visualization"));

    expect(onModeChange).toHaveBeenCalledWith("user-code");
  });

  it("displays correct title for disabled 'Code Visualization' (no steps)", () => {
    render(<ModeSelector {...defaultProps} codeStatus="complete" hasSteps={false} />);

    const runButton = screen.getByText("Code Visualization");
    expect(runButton).toHaveAttribute("title", "Run a test first to see your code visualization");
  });

  it("displays correct title for enabled 'Code Visualization'", () => {
    render(<ModeSelector {...defaultProps} codeStatus="complete" hasSteps />);

    const runButton = screen.getByText("Code Visualization");
    expect(runButton).toHaveAttribute("title", "View your code execution steps");
  });

  it("renders mode selector header", () => {
    render(<ModeSelector {...defaultProps} />);

    expect(screen.getByText("Mode")).toBeInTheDocument();
  });

  it("disables 'Compare' button when there are no steps", () => {
    render(<ModeSelector {...defaultProps} hasSteps={false} />);

    const compareButton = screen.getByText("Compare");
    expect(compareButton).toBeDisabled();
  });

  it("enables 'Compare' button when there are steps", () => {
    render(<ModeSelector {...defaultProps} hasSteps />);

    const compareButton = screen.getByText("Compare");
    expect(compareButton).not.toBeDisabled();
  });

  it("calls onModeChange with 'comparison' when Compare button clicked", async () => {
    const onModeChange = vi.fn();
    const user = userEvent.setup();

    render(<ModeSelector {...defaultProps} hasSteps onModeChange={onModeChange} />);

    await user.click(screen.getByText("Compare"));

    expect(onModeChange).toHaveBeenCalledWith("comparison");
  });

  it("does not display comparison mode description when active with steps", () => {
    render(<ModeSelector {...defaultProps} currentMode="comparison" hasSteps />);

    // No hint text when there are steps
    expect(screen.queryByText(/Run a test/i)).not.toBeInTheDocument();
  });
});
