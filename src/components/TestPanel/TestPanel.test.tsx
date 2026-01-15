import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TestPanel } from "./TestPanel";
import type { TestCase, TestResult } from "../../lib/testing/types";
import useAppStore from "../../store/useAppStore";

// Mock the store
vi.mock("../../store/useAppStore");

describe("TestPanel", () => {
  const mockTestCases: TestCase[] = [
    {
      id: "test-1",
      name: "Easy Test",
      difficulty: "easy",
      description: "An easy test case",
      initialData: [1, 2, 3],
      expectedOutput: [1, 2, 3],
      assertions: "expect(result).toEqual([1, 2, 3]);",
      referenceSolution: "function solve() { return [1, 2, 3]; }",
      skeletonCode: "function solve() { /* TODO */ }",
      hints: ["Hint 1", "Hint 2"],
      acceptanceCriteria: ["Returns correct array"],
    },
    {
      id: "test-2",
      name: "Medium Test",
      difficulty: "medium",
      description: "A medium test case",
      initialData: [3, 2, 1],
      expectedOutput: [1, 2, 3],
      assertions: "expect(result).toEqual([1, 2, 3]);",
      referenceSolution: "function solve() { return [1, 2, 3]; }",
      skeletonCode: "function solve() { /* TODO */ }",
      hints: ["Hint 1", "Hint 2"],
      acceptanceCriteria: ["Returns correct array"],
    },
    {
      id: "test-3",
      name: "Hard Test",
      difficulty: "hard",
      description: "A hard test case",
      initialData: [5, 4, 3, 2, 1],
      expectedOutput: [1, 2, 3, 4, 5],
      assertions: "expect(result).toEqual([1, 2, 3, 4, 5]);",
      referenceSolution: "function solve() { return [1, 2, 3, 4, 5]; }",
      skeletonCode: "function solve() { /* TODO */ }",
      hints: ["Hint 1", "Hint 2"],
      acceptanceCriteria: ["Returns correct array"],
    },
  ];

  const mockOnRunTest = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock: no test results
    vi.mocked(useAppStore).mockReturnValue(new Map());
  });

  describe("Rendering", () => {
    it("should render with all test cases visible simultaneously", () => {
      render(<TestPanel testCases={mockTestCases} onRunTest={mockOnRunTest} />);

      expect(screen.getByText("Test Cases")).toBeInTheDocument();
      expect(screen.getByText("Easy Test")).toBeInTheDocument();
      expect(screen.getByText("Medium Test")).toBeInTheDocument();
      expect(screen.getByText("Hard Test")).toBeInTheDocument();
    });

    it("should show no tests message when testCases is empty", () => {
      render(<TestPanel testCases={[]} onRunTest={mockOnRunTest} />);

      expect(screen.getByText("No tests available")).toBeInTheDocument();
    });

    it("should display test descriptions", () => {
      render(<TestPanel testCases={mockTestCases} onRunTest={mockOnRunTest} />);

      expect(screen.getByText("An easy test case")).toBeInTheDocument();
      expect(screen.getByText("A medium test case")).toBeInTheDocument();
      expect(screen.getByText("A hard test case")).toBeInTheDocument();
    });

    it("should display difficulty badges", () => {
      render(<TestPanel testCases={mockTestCases} onRunTest={mockOnRunTest} />);

      const easyBadges = screen.getAllByText("easy");
      const mediumBadges = screen.getAllByText("medium");
      const hardBadges = screen.getAllByText("hard");

      expect(easyBadges.length).toBeGreaterThan(0);
      expect(mediumBadges.length).toBeGreaterThan(0);
      expect(hardBadges.length).toBeGreaterThan(0);
    });
  });

  describe("Test Execution", () => {
    it("should call onRunTest when clicking Run on individual test", async () => {
      const user = userEvent.setup();
      render(<TestPanel testCases={mockTestCases} onRunTest={mockOnRunTest} />);

      const runButtons = screen.getAllByText("Run");
      if (runButtons[0]) {
        await user.click(runButtons[0]);
      }

      expect(mockOnRunTest).toHaveBeenCalledWith(mockTestCases[0]);
    });

    it("should disable buttons while running", async () => {
      const user = userEvent.setup();
      mockOnRunTest.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

      render(<TestPanel testCases={mockTestCases} onRunTest={mockOnRunTest} />);

      const runButtons = screen.getAllByText("Run");
      if (runButtons[0]) {
        await user.click(runButtons[0]);
      }

      // Should show "Running..." text in individual test buttons
      const runningTexts = screen.getAllByText("Running...");
      expect(runningTexts.length).toBeGreaterThan(0);
    });
  });

  describe("Test Results Display", () => {
    it("should show not-run status (○) for tests without results", () => {
      render(<TestPanel testCases={mockTestCases} onRunTest={mockOnRunTest} />);

      // Check for not-run CSS class instead of icon text
      const testItems = screen
        .getAllByRole("generic", { hidden: true })
        .filter((el) => el.className === "test-item not-run");
      expect(testItems.length).toBe(3);
    });

    it("should show passed status (✓) for passed tests", () => {
      const mockResults = new Map<string, TestResult>([
        [
          "test-1",
          {
            testId: "test-1",
            passed: true,
            executionTime: 42,
            steps: [
              {
                type: "push",
                target: "array",
                args: [5],
                result: undefined,
                timestamp: Date.now(),
              },
            ],
            consoleLogs: [],
          },
        ],
      ]);

      vi.mocked(useAppStore).mockReturnValue(mockResults);

      render(<TestPanel testCases={mockTestCases} onRunTest={mockOnRunTest} />);

      // Check for passed CSS class instead of icon text
      const testItems = screen
        .getAllByRole("generic", { hidden: true })
        .filter((el) => el.className === "test-item passed");
      expect(testItems.length).toBe(1);
      expect(screen.getByText("Passed in 42ms")).toBeInTheDocument();
      expect(screen.getByText("1 operations captured")).toBeInTheDocument();
    });

    it("should show failed status (✗) for failed tests", () => {
      const mockResults = new Map<string, TestResult>([
        [
          "test-1",
          {
            testId: "test-1",
            passed: false,
            error: "Expected [1,2,3] but got [3,2,1]",
            executionTime: 25,
            steps: [],
            consoleLogs: [],
          },
        ],
      ]);

      vi.mocked(useAppStore).mockReturnValue(mockResults);

      render(<TestPanel testCases={mockTestCases} onRunTest={mockOnRunTest} />);

      // Check for failed CSS class instead of icon text
      const testItems = screen
        .getAllByRole("generic", { hidden: true })
        .filter((el) => el.className === "test-item failed");
      expect(testItems.length).toBe(1);
      expect(screen.getByText("Expected [1,2,3] but got [3,2,1]")).toBeInTheDocument();
      expect(screen.getByText("Failed after 25ms")).toBeInTheDocument();
    });

    it("should display test summary correctly", () => {
      const mockResults = new Map<string, TestResult>([
        [
          "test-1",
          { testId: "test-1", passed: true, executionTime: 10, steps: [], consoleLogs: [] },
        ],
        [
          "test-2",
          {
            testId: "test-2",
            passed: false,
            error: "Failed",
            executionTime: 20,
            steps: [],
            consoleLogs: [],
          },
        ],
        [
          "test-3",
          { testId: "test-3", passed: true, executionTime: 15, steps: [], consoleLogs: [] },
        ],
      ]);

      vi.mocked(useAppStore).mockReturnValue(mockResults);

      render(<TestPanel testCases={mockTestCases} onRunTest={mockOnRunTest} />);

      expect(screen.getByText("2/3 passed")).toBeInTheDocument();
    });

    it("should not show summary when no tests have run", () => {
      render(<TestPanel testCases={mockTestCases} onRunTest={mockOnRunTest} />);

      expect(screen.queryByText(/passed/)).not.toBeInTheDocument();
    });

    it("should handle tests with zero execution time", () => {
      const mockResults = new Map<string, TestResult>([
        [
          "test-1",
          {
            testId: "test-1",
            passed: false,
            error: "Syntax error",
            executionTime: 0,
            steps: [],
            consoleLogs: [],
          },
        ],
      ]);

      vi.mocked(useAppStore).mockReturnValue(mockResults);

      render(<TestPanel testCases={mockTestCases} onRunTest={mockOnRunTest} />);

      expect(screen.getByText("Syntax error")).toBeInTheDocument();
      expect(screen.queryByText(/Failed after/)).not.toBeInTheDocument();
    });
  });

  describe("Integration", () => {
    it("should update display when test results change", () => {
      const { rerender } = render(
        <TestPanel testCases={mockTestCases} onRunTest={mockOnRunTest} />,
      );

      // Check for not-run CSS class instead of icon text
      let testItems = screen
        .getAllByRole("generic", { hidden: true })
        .filter((el) => el.className === "test-item not-run");
      expect(testItems.length).toBe(3);

      // Simulate test results being added
      const mockResults2 = new Map<string, TestResult>([
        [
          "test-1",
          { testId: "test-1", passed: true, executionTime: 10, steps: [], consoleLogs: [] },
        ],
      ]);
      vi.mocked(useAppStore).mockReturnValue(mockResults2);

      rerender(<TestPanel testCases={mockTestCases} onRunTest={mockOnRunTest} />);

      // Check for passed CSS class after re-render
      testItems = screen
        .getAllByRole("generic", { hidden: true })
        .filter((el) => el.className === "test-item passed");
      expect(testItems.length).toBe(1);
      expect(screen.getByText("1/1 passed")).toBeInTheDocument();
    });

    it("should preserve test case order", () => {
      render(<TestPanel testCases={mockTestCases} onRunTest={mockOnRunTest} />);

      const testNames = screen.getAllByText(/Test$/).map((el) => el.textContent);
      expect(testNames).toEqual(["Easy Test", "Medium Test", "Hard Test"]);
    });
  });
});
