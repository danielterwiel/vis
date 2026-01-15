import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import EditorPanel from "./EditorPanel";
import useAppStore from "../../store/useAppStore";
import { arrayTests } from "../../lib/testing/testCases";

// Mock onRunAllTests handler
const mockOnRunAllTests = vi.fn(async () => {});

describe("EditorPanel", () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    act(() => {
      useAppStore.setState({
        selectedDataStructure: "array",
        selectedDifficulty: "easy",
        visualizationMode: "skeleton",
        userCode: "",
        codeStatus: "incomplete",
        hintsRevealed: 0,
      });
    });
    mockOnRunAllTests.mockClear();
  });

  it("renders the editor panel", () => {
    render(<EditorPanel onRunAllTests={mockOnRunAllTests} />);
    expect(screen.getByText("Editor")).toBeDefined();
  });

  it("renders CodeMirrorEditor component", () => {
    const { container } = render(<EditorPanel onRunAllTests={mockOnRunAllTests} />);
    expect(container.querySelector(".codemirror-wrapper")).toBeInTheDocument();
  });

  it("displays data structure selector and difficulty badge", () => {
    render(<EditorPanel onRunAllTests={mockOnRunAllTests} />);
    const select = screen.getByRole("combobox");
    expect(select).toHaveValue("array");
    expect(screen.getByText("easy")).toBeDefined();
  });

  it("renders HintButton component", () => {
    render(<EditorPanel onRunAllTests={mockOnRunAllTests} />);
    // HintButton should be rendered
    const hintButton = screen.getByRole("button", { name: "Show hints" });
    expect(hintButton).toBeInTheDocument();
  });

  describe("Show Solution functionality", () => {
    it("loads reference solution when visualization mode changes to reference", async () => {
      render(<EditorPanel onRunAllTests={mockOnRunAllTests} />);

      // Get the expected reference solution for easy array test
      const easyTest = arrayTests.find((t) => t.difficulty === "easy");
      expect(easyTest?.referenceSolution).toBeDefined();

      // Change mode to reference
      await act(async () => {
        useAppStore.setState({ visualizationMode: "reference" });
      });

      // Verify the store now has the reference solution code
      const state = useAppStore.getState();
      expect(state.userCode).toBe(easyTest?.referenceSolution);
      expect(state.codeStatus).toBe("complete");
    });

    it("does not reload reference solution when re-setting same reference mode", async () => {
      render(<EditorPanel onRunAllTests={mockOnRunAllTests} />);

      // First, switch to reference mode to load reference solution
      await act(async () => {
        useAppStore.setState({ visualizationMode: "reference" });
      });

      const easyTest = arrayTests.find((t) => t.difficulty === "easy");
      expect(useAppStore.getState().userCode).toBe(easyTest?.referenceSolution);

      // User modifies the code while in reference mode
      await act(async () => {
        useAppStore.setState({ userCode: "modified code" });
      });

      // Re-setting the same mode should NOT reload reference solution
      await act(async () => {
        useAppStore.setState({ visualizationMode: "reference" });
      });

      // Code should remain as user modified it
      expect(useAppStore.getState().userCode).toBe("modified code");
    });

    it("displays reference mode badge when in reference mode", async () => {
      render(<EditorPanel onRunAllTests={mockOnRunAllTests} />);

      // Initially, no reference mode badge
      expect(screen.queryByText(/Reference Solution \(Read-Only\)/)).toBeNull();

      // Switch to reference mode
      await act(async () => {
        useAppStore.setState({ visualizationMode: "reference" });
      });

      // Reference mode badge should appear
      expect(screen.getByText("Reference Solution (Read-Only)")).toBeDefined();
    });

    it("editor becomes editable again when leaving reference mode", async () => {
      render(<EditorPanel onRunAllTests={mockOnRunAllTests} />);

      // Switch to reference mode
      await act(async () => {
        useAppStore.setState({ visualizationMode: "reference" });
      });

      expect(screen.getByText("Reference Solution (Read-Only)")).toBeDefined();

      // Switch back to user-code mode
      await act(async () => {
        useAppStore.setState({ visualizationMode: "user-code" });
      });

      // Reference mode badge should disappear
      expect(screen.queryByText(/Reference Solution \(Read-Only\)/)).toBeNull();
    });
  });
});
