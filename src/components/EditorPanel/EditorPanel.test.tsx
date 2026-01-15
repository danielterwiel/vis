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
    it("loads all reference solutions when visualization mode changes to reference", async () => {
      render(<EditorPanel onRunAllTests={mockOnRunAllTests} />);

      // Get all reference solutions for array tests
      const allReferenceSolutions = arrayTests
        .map((t) => t.referenceSolution)
        .filter(Boolean)
        .join("\n\n");
      expect(allReferenceSolutions).toBeDefined();

      // Change mode to reference
      await act(async () => {
        useAppStore.setState({ visualizationMode: "reference" });
        // Wait for effects to complete
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // Verify the store now has ALL reference solutions (so all tests can pass)
      const state = useAppStore.getState();
      expect(state.userCode).toBe(allReferenceSolutions);
      expect(state.codeStatus).toBe("complete");
    });

    it("does not reload reference solution when re-setting same reference mode", async () => {
      render(<EditorPanel onRunAllTests={mockOnRunAllTests} />);

      // First, switch to reference mode to load all reference solutions
      await act(async () => {
        useAppStore.setState({ visualizationMode: "reference" });
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      const allReferenceSolutions = arrayTests
        .map((t) => t.referenceSolution)
        .filter(Boolean)
        .join("\n\n");
      expect(useAppStore.getState().userCode).toBe(allReferenceSolutions);

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

    it("displays reference mode badge when in reference mode", async () => {
      render(<EditorPanel onRunAllTests={mockOnRunAllTests} />);

      // Initially, no reference mode badge
      expect(screen.queryByText(/Reference Solution \(Read-Only\)/)).toBeNull();

      // Switch to reference mode
      await act(async () => {
        useAppStore.setState({ visualizationMode: "reference" });
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // Reference mode badge should appear
      expect(screen.getByText("Reference Solution (Read-Only)")).toBeDefined();
    });

    it("editor becomes editable again when leaving reference mode", async () => {
      render(<EditorPanel onRunAllTests={mockOnRunAllTests} />);

      // Switch to reference mode
      await act(async () => {
        useAppStore.setState({ visualizationMode: "reference" });
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(screen.getByText("Reference Solution (Read-Only)")).toBeDefined();

      // Switch back to user-code mode
      await act(async () => {
        useAppStore.setState({ visualizationMode: "user-code" });
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // Reference mode badge should disappear
      expect(screen.queryByText(/Reference Solution \(Read-Only\)/)).toBeNull();
    });
  });
});
