import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import EditorPanel from "./EditorPanel";
import useAppStore from "../../store/useAppStore";
import { arrayTests } from "../../lib/testing/testCases";

// Mock getClientRects for CodeMirror layout calculations
if (typeof Range.prototype.getClientRects === "undefined") {
  Range.prototype.getClientRects = vi.fn(() => ({
    length: 0,
    item: () => null,
    [Symbol.iterator]: function* () {},
  })) as unknown as () => DOMRectList;
}

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

  it("displays data structure selector", () => {
    render(<EditorPanel onRunAllTests={mockOnRunAllTests} />);
    const select = screen.getByRole("combobox");
    expect(select).toHaveValue("array");
  });

  it("renders HintButton component", () => {
    render(<EditorPanel onRunAllTests={mockOnRunAllTests} />);
    // HintButton should be rendered
    const hintButton = screen.getByRole("button", { name: "Show hints" });
    expect(hintButton).toBeInTheDocument();
  });

  describe("Show Solution functionality", () => {
    it("loads current test reference solution when all tests use same function name", async () => {
      render(<EditorPanel onRunAllTests={mockOnRunAllTests} />);

      // Get reference solution for easy test (current difficulty)
      const easyReferenceSolution = arrayTests.find(
        (t) => t.difficulty === "easy",
      )?.referenceSolution;
      expect(easyReferenceSolution).toBeDefined();

      // Change mode to reference
      await act(async () => {
        useAppStore.setState({ visualizationMode: "reference" });
        // Wait for effects to complete
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // Verify the store has the current test's reference solution
      // (not all solutions, since Array tests all use the same function name 'sortArray')
      const state = useAppStore.getState();
      expect(state.userCode).toBe(easyReferenceSolution);
      expect(state.codeStatus).toBe("complete");
    });

    it("does not reload reference solution when re-setting same reference mode", async () => {
      render(<EditorPanel onRunAllTests={mockOnRunAllTests} />);

      // First, switch to reference mode to load reference solution
      await act(async () => {
        useAppStore.setState({ visualizationMode: "reference" });
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      const easyReferenceSolution = arrayTests.find(
        (t) => t.difficulty === "easy",
      )?.referenceSolution;
      expect(useAppStore.getState().userCode).toBe(easyReferenceSolution);

      // User modifies the code while in reference mode
      await act(async () => {
        useAppStore.setState({ userCode: "modified code" });
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // Re-setting the same mode should NOT reload reference solution
      await act(async () => {
        useAppStore.setState({ visualizationMode: "reference" });
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // Code should remain as user modified it
      expect(useAppStore.getState().userCode).toBe("modified code");
    });

    it("Show Solution button is disabled when in reference mode", async () => {
      render(<EditorPanel onRunAllTests={mockOnRunAllTests} />);

      // Initially, Show Solution button is enabled
      const solutionButton = screen.getByText("Show Solution");
      expect(solutionButton).not.toBeDisabled();

      // Switch to reference mode
      await act(async () => {
        useAppStore.setState({ visualizationMode: "reference" });
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // Show Solution button should be disabled in reference mode
      expect(solutionButton).toBeDisabled();
    });

    it("Show Solution button is enabled again when leaving reference mode", async () => {
      render(<EditorPanel onRunAllTests={mockOnRunAllTests} />);

      // Switch to reference mode
      await act(async () => {
        useAppStore.setState({ visualizationMode: "reference" });
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      const solutionButton = screen.getByText("Show Solution");
      expect(solutionButton).toBeDisabled();

      // Switch back to user-code mode
      await act(async () => {
        useAppStore.setState({ visualizationMode: "user-code" });
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // Show Solution button should be enabled again
      expect(solutionButton).not.toBeDisabled();
    });
  });
});
