import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { HintModal } from "./HintModal";
import useAppStore from "../../store/useAppStore";
import type { TestCase } from "../../lib/testing/types";

describe("HintModal", () => {
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

  const mockOnClose = vi.fn();

  beforeEach(() => {
    // Reset store state before each test
    useAppStore.setState({ hintsRevealed: 0 });
    mockOnClose.mockClear();
  });

  describe("Rendering", () => {
    it("renders nothing when isOpen is false", () => {
      render(<HintModal testCase={mockTestCase} isOpen={false} onClose={mockOnClose} />);

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("renders modal when isOpen is true", () => {
      render(<HintModal testCase={mockTestCase} isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText("Hints (0/3)")).toBeInTheDocument();
    });

    it("renders close button with icon", () => {
      render(<HintModal testCase={mockTestCase} isOpen={true} onClose={mockOnClose} />);

      const closeButton = screen.getByRole("button", { name: "Close hints" });
      expect(closeButton).toBeInTheDocument();
    });

    it("shows first hint reveal button", () => {
      render(<HintModal testCase={mockTestCase} isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByRole("button", { name: "Reveal Hint 1" })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Reveal Hint 2" })).not.toBeInTheDocument();
    });

    it("renders empty state when test case has no hints", () => {
      const noHintsTestCase: TestCase = {
        ...mockTestCase,
        hints: [],
      };

      render(<HintModal testCase={noHintsTestCase} isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText("No hints available for this test case.")).toBeInTheDocument();
    });
  });

  describe("Progressive Reveal", () => {
    it("reveals first hint when button clicked", async () => {
      const user = userEvent.setup();
      render(<HintModal testCase={mockTestCase} isOpen={true} onClose={mockOnClose} />);

      await user.click(screen.getByRole("button", { name: "Reveal Hint 1" }));

      expect(screen.getByText("Hint 1")).toBeInTheDocument();
      expect(screen.getByText(mockTestCase.hints[0] as string)).toBeInTheDocument();
      expect(screen.getByText("Hints (1/3)")).toBeInTheDocument();
    });

    it("shows next hint button after revealing first hint", async () => {
      const user = userEvent.setup();
      render(<HintModal testCase={mockTestCase} isOpen={true} onClose={mockOnClose} />);

      await user.click(screen.getByRole("button", { name: "Reveal Hint 1" }));

      expect(screen.getByRole("button", { name: "Reveal Hint 2" })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Reveal Hint 1" })).not.toBeInTheDocument();
    });

    it("reveals hints sequentially", async () => {
      const user = userEvent.setup();
      render(<HintModal testCase={mockTestCase} isOpen={true} onClose={mockOnClose} />);

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
      render(<HintModal testCase={mockTestCase} isOpen={true} onClose={mockOnClose} />);

      await user.click(screen.getByRole("button", { name: "Reveal Hint 1" }));
      await user.click(screen.getByRole("button", { name: "Reveal Hint 2" }));
      await user.click(screen.getByRole("button", { name: "Reveal Hint 3" }));

      expect(
        screen.getByText("All hints revealed. Try implementing the solution!"),
      ).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /Reveal Hint/ })).not.toBeInTheDocument();
    });
  });

  describe("Modal Interaction", () => {
    it("calls onClose when close button is clicked", async () => {
      const user = userEvent.setup();
      render(<HintModal testCase={mockTestCase} isOpen={true} onClose={mockOnClose} />);

      await user.click(screen.getByRole("button", { name: "Close hints" }));

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("calls onClose when backdrop is clicked", async () => {
      const user = userEvent.setup();
      render(<HintModal testCase={mockTestCase} isOpen={true} onClose={mockOnClose} />);

      const backdrop = screen.getByRole("dialog").parentElement;
      if (backdrop) {
        await user.click(backdrop);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      }
    });

    it("does not close when dialog content is clicked", async () => {
      const user = userEvent.setup();
      render(<HintModal testCase={mockTestCase} isOpen={true} onClose={mockOnClose} />);

      const dialog = screen.getByRole("dialog");
      await user.click(dialog);

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe("Store Integration", () => {
    it("calls revealHint action from store", async () => {
      const user = userEvent.setup();
      render(<HintModal testCase={mockTestCase} isOpen={true} onClose={mockOnClose} />);

      expect(useAppStore.getState().hintsRevealed).toBe(0);

      await user.click(screen.getByRole("button", { name: "Reveal Hint 1" }));

      expect(useAppStore.getState().hintsRevealed).toBe(1);
    });

    it("reads hintsRevealed from store", () => {
      useAppStore.setState({ hintsRevealed: 2 });

      render(<HintModal testCase={mockTestCase} isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText("Hint 1")).toBeInTheDocument();
      expect(screen.getByText("Hint 2")).toBeInTheDocument();
      expect(screen.getByText(mockTestCase.hints[0] as string)).toBeInTheDocument();
      expect(screen.getByText(mockTestCase.hints[1] as string)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Reveal Hint 3" })).toBeInTheDocument();
      expect(screen.getByText("Hints (2/3)")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("uses dialog element", () => {
      render(<HintModal testCase={mockTestCase} isOpen={true} onClose={mockOnClose} />);

      const dialog = screen.getByRole("dialog");
      expect(dialog.tagName).toBe("DIALOG");
    });

    it("has proper heading structure", () => {
      render(<HintModal testCase={mockTestCase} isOpen={true} onClose={mockOnClose} />);

      const heading = screen.getByRole("heading", { name: "Hints (0/3)" });
      expect(heading).toBeInTheDocument();
      expect(heading.tagName).toBe("H3");
    });

    it("close button has proper aria-label", () => {
      render(<HintModal testCase={mockTestCase} isOpen={true} onClose={mockOnClose} />);

      const closeButton = screen.getByRole("button", { name: "Close hints" });
      expect(closeButton).toHaveAttribute("aria-label", "Close hints");
    });

    it("buttons have type attribute", () => {
      render(<HintModal testCase={mockTestCase} isOpen={true} onClose={mockOnClose} />);

      const closeButton = screen.getByRole("button", { name: "Close hints" });
      expect(closeButton).toHaveAttribute("type", "button");

      const revealButton = screen.getByRole("button", { name: "Reveal Hint 1" });
      expect(revealButton).toHaveAttribute("type", "button");
    });
  });

  describe("Edge Cases", () => {
    it("handles test case with single hint", () => {
      const singleHintTest: TestCase = {
        ...mockTestCase,
        hints: ["This is the only hint"],
      };

      render(<HintModal testCase={singleHintTest} isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText("Hints (0/1)")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Reveal Hint 1" })).toBeInTheDocument();
    });

    it("handles test case with many hints", () => {
      const manyHintsTest: TestCase = {
        ...mockTestCase,
        hints: ["Hint 1", "Hint 2", "Hint 3", "Hint 4", "Hint 5"],
      };

      render(<HintModal testCase={manyHintsTest} isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText("Hints (0/5)")).toBeInTheDocument();
    });

    it("handles undefined hints gracefully", () => {
      const noHintsTest: TestCase = {
        ...mockTestCase,
        hints: undefined as unknown as string[],
      };

      render(<HintModal testCase={noHintsTest} isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText("Hints (0/0)")).toBeInTheDocument();
      expect(screen.getByText("No hints available for this test case.")).toBeInTheDocument();
    });
  });
});
