import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach } from "vitest";
import { HintSystem } from "./HintSystem";
import useAppStore from "../../store/useAppStore";
import type { TestCase } from "../../lib/testing/types";

describe("HintSystem", () => {
  const mockTestCase: TestCase = {
    id: "array-sort-easy",
    name: "Sort Small Array",
    difficulty: "easy",
    description: "Sort an array of 5 numbers",
    initialData: [5, 2, 8, 1, 9],
    expectedOutput: [1, 2, 5, 8, 9],
    assertions: "expect(result).toEqual([1, 2, 5, 8, 9]);",
    referenceSolution: "function sort(arr) { return arr.slice().sort((a, b) => a - b); }",
    skeletonCode: "function sort(arr) { /* TODO */ }",
    hints: [
      "JavaScript arrays have a built-in sort() method",
      "sort() needs a compare function for numbers: (a, b) => a - b",
      "Consider using slice() first to avoid mutating the original array",
    ],
    acceptanceCriteria: ["Array is sorted in ascending order", "Original array is not mutated"],
  };

  beforeEach(() => {
    // Reset store state before each test
    useAppStore.setState({ hintsRevealed: 0 });
  });

  describe("Rendering", () => {
    it("renders empty state when no test case provided", () => {
      render(<HintSystem testCase={null} />);

      expect(screen.getByText("Hints")).toBeInTheDocument();
      expect(screen.getByText("Select a test case to see hints")).toBeInTheDocument();
    });

    it("renders empty state when test case has no hints", () => {
      const testCaseNoHints: TestCase = {
        ...mockTestCase,
        hints: [],
      };

      render(<HintSystem testCase={testCaseNoHints} />);

      expect(screen.getByText("Hints")).toBeInTheDocument();
      expect(screen.getByText("No hints available for this test")).toBeInTheDocument();
    });

    it("renders hint count in header", () => {
      render(<HintSystem testCase={mockTestCase} />);

      expect(screen.getByText("Hints (0/3)")).toBeInTheDocument();
    });

    it("shows button for first unrevealed hint", () => {
      render(<HintSystem testCase={mockTestCase} />);

      expect(screen.getByRole("button", { name: "Reveal Hint 1" })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Reveal Hint 2" })).not.toBeInTheDocument();
    });

    it("does not show warning when no hints revealed", () => {
      render(<HintSystem testCase={mockTestCase} />);

      expect(screen.queryByText(/Try solving without hints/)).not.toBeInTheDocument();
    });
  });

  describe("Progressive Reveal", () => {
    it("reveals first hint when button clicked", async () => {
      const user = userEvent.setup();
      render(<HintSystem testCase={mockTestCase} />);

      const revealButton = screen.getByRole("button", { name: "Reveal Hint 1" });
      await user.click(revealButton);

      expect(screen.getByText("Hint 1")).toBeInTheDocument();
      expect(screen.getByText(mockTestCase.hints[0] as string)).toBeInTheDocument();
      expect(screen.getByText("Hints (1/3)")).toBeInTheDocument();
    });

    it("shows next hint button after revealing first hint", async () => {
      const user = userEvent.setup();
      render(<HintSystem testCase={mockTestCase} />);

      await user.click(screen.getByRole("button", { name: "Reveal Hint 1" }));

      expect(screen.getByRole("button", { name: "Reveal Hint 2" })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Reveal Hint 1" })).not.toBeInTheDocument();
    });

    it("reveals hints sequentially", async () => {
      const user = userEvent.setup();
      render(<HintSystem testCase={mockTestCase} />);

      // Reveal hint 1
      await user.click(screen.getByRole("button", { name: "Reveal Hint 1" }));
      expect(screen.getByText(mockTestCase.hints[0] as string)).toBeInTheDocument();

      // Reveal hint 2
      await user.click(screen.getByRole("button", { name: "Reveal Hint 2" }));
      expect(screen.getByText(mockTestCase.hints[1] as string)).toBeInTheDocument();

      // Reveal hint 3
      await user.click(screen.getByRole("button", { name: "Reveal Hint 3" }));
      expect(screen.getByText(mockTestCase.hints[2] as string)).toBeInTheDocument();

      expect(screen.getByText("Hints (3/3)")).toBeInTheDocument();
    });

    it("shows completion message when all hints revealed", async () => {
      const user = userEvent.setup();
      render(<HintSystem testCase={mockTestCase} />);

      await user.click(screen.getByRole("button", { name: "Reveal Hint 1" }));
      await user.click(screen.getByRole("button", { name: "Reveal Hint 2" }));
      await user.click(screen.getByRole("button", { name: "Reveal Hint 3" }));

      expect(
        screen.getByText("All hints revealed. Try implementing the solution!"),
      ).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /Reveal Hint/ })).not.toBeInTheDocument();
    });

    it("shows warning after revealing first hint", async () => {
      const user = userEvent.setup();
      render(<HintSystem testCase={mockTestCase} />);

      await user.click(screen.getByRole("button", { name: "Reveal Hint 1" }));

      expect(
        screen.getByText(/Try solving without hints for the best learning experience/),
      ).toBeInTheDocument();
    });
  });

  describe("Store Integration", () => {
    it("calls revealHint action from store", async () => {
      const user = userEvent.setup();
      render(<HintSystem testCase={mockTestCase} />);

      expect(useAppStore.getState().hintsRevealed).toBe(0);

      await user.click(screen.getByRole("button", { name: "Reveal Hint 1" }));

      expect(useAppStore.getState().hintsRevealed).toBe(1);
    });

    it("reads hintsRevealed from store", () => {
      useAppStore.setState({ hintsRevealed: 2 });

      render(<HintSystem testCase={mockTestCase} />);

      expect(screen.getByText("Hint 1")).toBeInTheDocument();
      expect(screen.getByText("Hint 2")).toBeInTheDocument();
      expect(screen.getByText(mockTestCase.hints[0] as string)).toBeInTheDocument();
      expect(screen.getByText(mockTestCase.hints[1] as string)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Reveal Hint 3" })).toBeInTheDocument();
      expect(screen.getByText("Hints (2/3)")).toBeInTheDocument();
    });

    it("resets properly when store resets hints", async () => {
      act(() => {
        useAppStore.setState({ hintsRevealed: 3 });
      });

      const { rerender } = render(<HintSystem testCase={mockTestCase} />);

      expect(screen.getByText("Hints (3/3)")).toBeInTheDocument();

      // Reset hints
      act(() => {
        useAppStore.getState().resetHints();
      });
      rerender(<HintSystem testCase={mockTestCase} />);

      expect(screen.getByText("Hints (0/3)")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Reveal Hint 1" })).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles test case with single hint", () => {
      const singleHintTest: TestCase = {
        ...mockTestCase,
        hints: ["This is the only hint"],
      };

      render(<HintSystem testCase={singleHintTest} />);

      expect(screen.getByText("Hints (0/1)")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Reveal Hint 1" })).toBeInTheDocument();
    });

    it("handles test case with many hints", () => {
      const manyHintsTest: TestCase = {
        ...mockTestCase,
        hints: ["Hint 1", "Hint 2", "Hint 3", "Hint 4", "Hint 5"],
      };

      render(<HintSystem testCase={manyHintsTest} />);

      expect(screen.getByText("Hints (0/5)")).toBeInTheDocument();
    });

    it("handles switching test cases with different hint counts", async () => {
      const user = userEvent.setup();
      const test1: TestCase = {
        ...mockTestCase,
        id: "test-1",
        hints: ["Hint 1", "Hint 2"],
      };
      const test2: TestCase = {
        ...mockTestCase,
        id: "test-2",
        hints: ["Different 1", "Different 2", "Different 3"],
      };

      const { rerender } = render(<HintSystem testCase={test1} />);
      await user.click(screen.getByRole("button", { name: "Reveal Hint 1" }));
      expect(screen.getByText("Hints (1/2)")).toBeInTheDocument();

      // Switch test case - hints should be reset by parent component
      act(() => {
        useAppStore.setState({ hintsRevealed: 0 });
      });
      rerender(<HintSystem testCase={test2} />);

      expect(screen.getByText("Hints (0/3)")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Reveal Hint 1" })).toBeInTheDocument();
    });

    it("does not crash with undefined hints array", () => {
      const noHintsTest: TestCase = {
        ...mockTestCase,
        hints: undefined as unknown as string[],
      };

      render(<HintSystem testCase={noHintsTest} />);

      expect(screen.getByText("No hints available for this test")).toBeInTheDocument();
    });

    it("handles empty string hints", async () => {
      const user = userEvent.setup();
      const emptyHintTest: TestCase = {
        ...mockTestCase,
        hints: ["", "Valid hint", ""],
      };

      render(<HintSystem testCase={emptyHintTest} />);

      await user.click(screen.getByRole("button", { name: "Reveal Hint 1" }));
      expect(screen.getByText("Hint 1")).toBeInTheDocument();
      // Empty string should still be rendered (even if not visible)
    });
  });

  describe("Accessibility", () => {
    it("uses semantic HTML with proper headings", () => {
      render(<HintSystem testCase={mockTestCase} />);

      const heading = screen.getByRole("heading", { name: "Hints (0/3)" });
      expect(heading).toBeInTheDocument();
      expect(heading.tagName).toBe("H4");
    });

    it("uses button elements with type attribute", () => {
      render(<HintSystem testCase={mockTestCase} />);

      const button = screen.getByRole("button", { name: "Reveal Hint 1" });
      expect(button.getAttribute("type")).toBe("button");
    });

    it("provides clear button labels with hint numbers", async () => {
      const user = userEvent.setup();
      render(<HintSystem testCase={mockTestCase} />);

      expect(screen.getByRole("button", { name: "Reveal Hint 1" })).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "Reveal Hint 1" }));
      expect(screen.getByRole("button", { name: "Reveal Hint 2" })).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "Reveal Hint 2" }));
      expect(screen.getByRole("button", { name: "Reveal Hint 3" })).toBeInTheDocument();
    });
  });
});
