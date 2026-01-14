import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach } from "vitest";
import { HintButton } from "./HintButton";
import useAppStore from "../../store/useAppStore";
import type { TestCase } from "../../lib/testing/types";

describe("HintButton", () => {
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
    it("renders button with icon", () => {
      render(<HintButton testCase={mockTestCase} />);

      const button = screen.getByRole("button", { name: "Show hints" });
      expect(button).toBeInTheDocument();
    });

    it("shows hint count badge when test case has hints", () => {
      render(<HintButton testCase={mockTestCase} />);

      expect(screen.getByText("0/3")).toBeInTheDocument();
    });

    it("updates badge when hints are revealed", () => {
      useAppStore.setState({ hintsRevealed: 2 });

      render(<HintButton testCase={mockTestCase} />);

      expect(screen.getByText("2/3")).toBeInTheDocument();
    });

    it("is disabled when no test case provided", () => {
      render(<HintButton testCase={null} />);

      const button = screen.getByRole("button", { name: "Show hints" });
      expect(button).toBeDisabled();
    });

    it("is disabled when test case has no hints", () => {
      const noHintsTestCase: TestCase = {
        ...mockTestCase,
        hints: [],
      };

      render(<HintButton testCase={noHintsTestCase} />);

      const button = screen.getByRole("button", { name: "Show hints" });
      expect(button).toBeDisabled();
    });

    it("has correct title attribute with hint count", () => {
      render(<HintButton testCase={mockTestCase} />);

      const button = screen.getByRole("button", { name: "Show hints" });
      expect(button).toHaveAttribute("title", "Hints (0/3)");
    });

    it("shows 'No hints available' title when disabled", () => {
      render(<HintButton testCase={null} />);

      const button = screen.getByRole("button", { name: "Show hints" });
      expect(button).toHaveAttribute("title", "No hints available");
    });
  });

  describe("Modal Interaction", () => {
    it("opens modal when button is clicked", async () => {
      const user = userEvent.setup();
      render(<HintButton testCase={mockTestCase} />);

      const button = screen.getByRole("button", { name: "Show hints" });
      await user.click(button);

      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText("Hints (0/3)")).toBeInTheDocument();
    });

    it("does not open modal when disabled", async () => {
      const user = userEvent.setup();
      render(<HintButton testCase={null} />);

      const button = screen.getByRole("button", { name: "Show hints" });
      await user.click(button);

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("closes modal when close button is clicked", async () => {
      const user = userEvent.setup();
      render(<HintButton testCase={mockTestCase} />);

      // Open modal
      await user.click(screen.getByRole("button", { name: "Show hints" }));
      expect(screen.getByRole("dialog")).toBeInTheDocument();

      // Close modal
      await user.click(screen.getByRole("button", { name: "Close hints" }));
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("closes modal when backdrop is clicked", async () => {
      const user = userEvent.setup();
      render(<HintButton testCase={mockTestCase} />);

      // Open modal
      await user.click(screen.getByRole("button", { name: "Show hints" }));
      expect(screen.getByRole("dialog")).toBeInTheDocument();

      // Click backdrop
      const backdrop = screen.getByRole("dialog").parentElement;
      if (backdrop) {
        await user.click(backdrop);
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      }
    });
  });

  describe("Accessibility", () => {
    it("has proper aria-label", () => {
      render(<HintButton testCase={mockTestCase} />);

      const button = screen.getByRole("button", { name: "Show hints" });
      expect(button).toHaveAttribute("aria-label", "Show hints");
    });

    it("uses button type attribute", () => {
      render(<HintButton testCase={mockTestCase} />);

      const button = screen.getByRole("button", { name: "Show hints" });
      expect(button).toHaveAttribute("type", "button");
    });
  });
});
