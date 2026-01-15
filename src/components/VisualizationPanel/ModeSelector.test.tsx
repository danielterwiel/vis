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

    expect(screen.getByText("My Execution")).toBeInTheDocument();
    expect(screen.getByText("Show Expected")).toBeInTheDocument();
    expect(screen.getByText("Compare")).toBeInTheDocument();
    expect(screen.getByText("Show Solution")).toBeInTheDocument();
  });

  it("displays mode description for current mode", () => {
    render(<ModeSelector {...defaultProps} currentMode="expected-output" />);

    expect(screen.getByText(/Showing the expected output/i)).toBeInTheDocument();
  });

  it("highlights active mode button", () => {
    render(<ModeSelector {...defaultProps} currentMode="expected-output" />);

    const expectedButton = screen.getByText("Show Expected");
    expect(expectedButton).toHaveClass("active");
  });

  it("disables 'My Execution' when there are no steps (regardless of code status)", () => {
    render(<ModeSelector {...defaultProps} codeStatus="incomplete" hasSteps={false} />);

    const runButton = screen.getByText("My Execution");
    expect(runButton).toBeDisabled();
  });

  it("disables 'My Execution' when there are no steps even with complete code", () => {
    render(<ModeSelector {...defaultProps} codeStatus="complete" hasSteps={false} />);

    const runButton = screen.getByText("My Execution");
    expect(runButton).toBeDisabled();
  });

  it("enables 'My Execution' when has steps", () => {
    render(<ModeSelector {...defaultProps} codeStatus="complete" hasSteps />);

    const runButton = screen.getByText("My Execution");
    expect(runButton).not.toBeDisabled();
  });

  it("calls onModeChange when clicking 'Show Expected'", async () => {
    const onModeChange = vi.fn();
    const user = userEvent.setup();

    render(<ModeSelector {...defaultProps} onModeChange={onModeChange} />);

    await user.click(screen.getByText("Show Expected"));

    expect(onModeChange).toHaveBeenCalledWith("expected-output");
  });

  it("shows confirmation dialog before switching to reference mode", async () => {
    const onModeChange = vi.fn();
    const user = userEvent.setup();

    // Mock window.confirm to return true
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);

    render(<ModeSelector {...defaultProps} onModeChange={onModeChange} />);

    await user.click(screen.getByText("Show Solution"));

    expect(confirmSpy).toHaveBeenCalledWith("This will reveal the solution. Continue?");
    expect(onModeChange).toHaveBeenCalledWith("reference");

    confirmSpy.mockRestore();
  });

  it("does not switch to reference mode if user cancels confirmation", async () => {
    const onModeChange = vi.fn();
    const user = userEvent.setup();

    // Mock window.confirm to return false
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);

    render(<ModeSelector {...defaultProps} onModeChange={onModeChange} />);

    await user.click(screen.getByText("Show Solution"));

    expect(confirmSpy).toHaveBeenCalled();
    expect(onModeChange).not.toHaveBeenCalled();

    confirmSpy.mockRestore();
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

  it("displays expected-output mode description", () => {
    render(<ModeSelector {...defaultProps} currentMode="expected-output" />);

    expect(screen.getByText(/Showing the expected output/i)).toBeInTheDocument();
  });

  it("displays reference mode description with warning", () => {
    render(<ModeSelector {...defaultProps} currentMode="reference" />);

    expect(screen.getByText(/Solution revealed!/i)).toBeInTheDocument();
    expect(screen.getByText(/Study the reference implementation/i)).toBeInTheDocument();
  });

  it("applies warning styling to 'Show Solution' button", () => {
    render(<ModeSelector {...defaultProps} />);

    const solutionButton = screen.getByText("Show Solution");
    expect(solutionButton).toHaveClass("mode-button-warning");
  });

  it("calls onModeChange when clicking enabled 'My Execution'", async () => {
    const onModeChange = vi.fn();
    const user = userEvent.setup();

    render(
      <ModeSelector {...defaultProps} codeStatus="complete" hasSteps onModeChange={onModeChange} />,
    );

    await user.click(screen.getByText("My Execution"));

    expect(onModeChange).toHaveBeenCalledWith("user-code");
  });

  it("displays correct title for disabled 'My Execution' (no steps)", () => {
    render(<ModeSelector {...defaultProps} codeStatus="complete" hasSteps={false} />);

    const runButton = screen.getByText("My Execution");
    expect(runButton).toHaveAttribute("title", "Run a test first to see your code visualization");
  });

  it("displays correct title for enabled 'My Execution'", () => {
    render(<ModeSelector {...defaultProps} codeStatus="complete" hasSteps />);

    const runButton = screen.getByText("My Execution");
    expect(runButton).toHaveAttribute("title", "View your code execution steps");
  });

  it("renders mode selector header", () => {
    render(<ModeSelector {...defaultProps} />);

    expect(screen.getByText("Visualization Mode")).toBeInTheDocument();
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

  it("displays comparison mode description when active", () => {
    render(<ModeSelector {...defaultProps} currentMode="comparison" hasSteps />);

    expect(
      screen.getByText(/Comparing your execution .* with expected output/i),
    ).toBeInTheDocument();
  });
});
