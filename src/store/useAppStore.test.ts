import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useAppStore from "./useAppStore";

describe("useAppStore", () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    const { result } = renderHook(() => useAppStore());
    act(() => {
      result.current.setSelectedDataStructure("array");
      result.current.setSelectedDifficulty("easy");
      result.current.setUserCode("");
      result.current.setCodeStatus("incomplete");
      result.current.setVisualizationMode("skeleton");
      result.current.resetVisualization();
      result.current.clearTestResults();
      result.current.resetHints();
    });
  });

  describe("Initial State", () => {
    it("should have correct initial state", () => {
      const { result } = renderHook(() => useAppStore());

      expect(result.current.selectedDataStructure).toBe("array");
      expect(result.current.selectedDifficulty).toBe("easy");
      expect(result.current.userCode).toBe("");
      expect(result.current.codeStatus).toBe("incomplete");
      expect(result.current.visualizationMode).toBe("skeleton");
      expect(result.current.currentSteps).toEqual([]);
      expect(result.current.currentStepIndex).toBe(0);
      expect(result.current.isAnimating).toBe(false);
      expect(result.current.animationSpeed).toBe(1);
      expect(result.current.testResults.size).toBe(0);
      expect(result.current.hintsRevealed).toBe(0);
    });
  });

  describe("Data Structure Selection", () => {
    it("should update selected data structure", () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.setSelectedDataStructure("linkedList");
      });

      expect(result.current.selectedDataStructure).toBe("linkedList");
    });

    it("should reset related state when switching data structures", () => {
      const { result } = renderHook(() => useAppStore());

      // Set up some state
      act(() => {
        result.current.setSelectedDifficulty("hard");
        result.current.setCurrentSteps([{ type: "push", timestamp: Date.now() }]);
        result.current.setCurrentStepIndex(1);
        result.current.revealHint();
        result.current.setTestResult("test-1", {
          testId: "test-1",
          passed: true,
          executionTime: 100,
          steps: [],
          consoleLogs: [],
        });
      });

      // Switch data structure
      act(() => {
        result.current.setSelectedDataStructure("tree");
      });

      // Should reset to defaults
      expect(result.current.selectedDifficulty).toBe("easy");
      expect(result.current.currentSteps).toEqual([]);
      expect(result.current.currentStepIndex).toBe(0);
      expect(result.current.hintsRevealed).toBe(0);
      expect(result.current.testResults.size).toBe(0);
    });

    it("should update selected difficulty", () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.setSelectedDifficulty("medium");
      });

      expect(result.current.selectedDifficulty).toBe("medium");
    });

    it("should reset test-specific state when changing difficulty", () => {
      const { result } = renderHook(() => useAppStore());

      // Set up some state
      act(() => {
        result.current.setCurrentSteps([{ type: "push", timestamp: Date.now() }]);
        result.current.setCurrentStepIndex(1);
        result.current.revealHint();
      });

      // Change difficulty
      act(() => {
        result.current.setSelectedDifficulty("hard");
      });

      expect(result.current.currentSteps).toEqual([]);
      expect(result.current.currentStepIndex).toBe(0);
      expect(result.current.hintsRevealed).toBe(0);
    });
  });

  describe("Editor State", () => {
    it("should update user code", () => {
      const { result } = renderHook(() => useAppStore());
      const code = "const arr = [1, 2, 3];";

      act(() => {
        result.current.setUserCode(code);
      });

      expect(result.current.userCode).toBe(code);
    });

    it("should update code status", () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.setCodeStatus("complete");
      });

      expect(result.current.codeStatus).toBe("complete");

      act(() => {
        result.current.setCodeStatus("error");
      });

      expect(result.current.codeStatus).toBe("error");
    });
  });

  describe("Visualization State", () => {
    it("should update visualization mode", () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.setVisualizationMode("user-code");
      });

      expect(result.current.visualizationMode).toBe("user-code");
    });

    it("should set current steps and reset index", () => {
      const { result } = renderHook(() => useAppStore());
      const steps = [
        { type: "push", args: [5], timestamp: Date.now() },
        { type: "pop", timestamp: Date.now() },
      ];

      act(() => {
        result.current.setCurrentStepIndex(5); // Set to non-zero
        result.current.setCurrentSteps(steps);
      });

      expect(result.current.currentSteps).toEqual(steps);
      expect(result.current.currentStepIndex).toBe(0); // Should reset to 0
    });

    it("should navigate steps forward", () => {
      const { result } = renderHook(() => useAppStore());
      const steps = [
        { type: "push", timestamp: Date.now() },
        { type: "push", timestamp: Date.now() },
        { type: "pop", timestamp: Date.now() },
      ];

      act(() => {
        result.current.setCurrentSteps(steps);
      });

      expect(result.current.currentStepIndex).toBe(0);

      act(() => {
        result.current.nextStep();
      });
      expect(result.current.currentStepIndex).toBe(1);

      act(() => {
        result.current.nextStep();
      });
      expect(result.current.currentStepIndex).toBe(2);
    });

    it("should not navigate past last step", () => {
      const { result } = renderHook(() => useAppStore());
      const steps = [
        { type: "push", timestamp: Date.now() },
        { type: "pop", timestamp: Date.now() },
      ];

      act(() => {
        result.current.setCurrentSteps(steps);
        result.current.setCurrentStepIndex(1); // Last step
      });

      act(() => {
        result.current.nextStep();
      });

      expect(result.current.currentStepIndex).toBe(1); // Should stay at 1
    });

    it("should navigate steps backward", () => {
      const { result } = renderHook(() => useAppStore());
      const steps = [
        { type: "push", timestamp: Date.now() },
        { type: "push", timestamp: Date.now() },
        { type: "pop", timestamp: Date.now() },
      ];

      act(() => {
        result.current.setCurrentSteps(steps);
        result.current.setCurrentStepIndex(2);
      });

      act(() => {
        result.current.previousStep();
      });
      expect(result.current.currentStepIndex).toBe(1);

      act(() => {
        result.current.previousStep();
      });
      expect(result.current.currentStepIndex).toBe(0);
    });

    it("should not navigate before first step", () => {
      const { result } = renderHook(() => useAppStore());
      const steps = [
        { type: "push", timestamp: Date.now() },
        { type: "pop", timestamp: Date.now() },
      ];

      act(() => {
        result.current.setCurrentSteps(steps);
      });

      act(() => {
        result.current.previousStep();
      });

      expect(result.current.currentStepIndex).toBe(0); // Should stay at 0
    });

    it("should update animation state", () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.setIsAnimating(true);
      });

      expect(result.current.isAnimating).toBe(true);

      act(() => {
        result.current.setIsAnimating(false);
      });

      expect(result.current.isAnimating).toBe(false);
    });

    it("should update animation speed", () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.setAnimationSpeed(2);
      });

      expect(result.current.animationSpeed).toBe(2);

      act(() => {
        result.current.setAnimationSpeed(0.5);
      });

      expect(result.current.animationSpeed).toBe(0.5);
    });

    it("should reset visualization state", () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.setCurrentSteps([{ type: "push", timestamp: Date.now() }]);
        result.current.setCurrentStepIndex(1);
        result.current.setIsAnimating(true);
      });

      act(() => {
        result.current.resetVisualization();
      });

      expect(result.current.currentSteps).toEqual([]);
      expect(result.current.currentStepIndex).toBe(0);
      expect(result.current.isAnimating).toBe(false);
    });
  });

  describe("Test Results", () => {
    it("should store test result", () => {
      const { result } = renderHook(() => useAppStore());
      const testResult = {
        testId: "array-sort-easy",
        passed: true,
        executionTime: 150,
        steps: [{ type: "sort", timestamp: Date.now() }],
        consoleLogs: [],
      };

      act(() => {
        result.current.setTestResult("array-sort-easy", testResult);
      });

      const storedResult = result.current.testResults.get("array-sort-easy");
      expect(storedResult).toEqual(testResult);
    });

    it("should store multiple test results", () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.setTestResult("test-1", {
          testId: "test-1",
          passed: true,
          executionTime: 100,
          steps: [],
          consoleLogs: [],
        });
        result.current.setTestResult("test-2", {
          testId: "test-2",
          passed: false,
          error: "Expected [1,2,3] but got [3,2,1]",
          executionTime: 120,
          steps: [],
          consoleLogs: [],
        });
      });

      expect(result.current.testResults.size).toBe(2);
      expect(result.current.testResults.get("test-1")?.passed).toBe(true);
      expect(result.current.testResults.get("test-2")?.passed).toBe(false);
    });

    it("should clear all test results", () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.setTestResult("test-1", {
          testId: "test-1",
          passed: true,
          consoleLogs: [],
          executionTime: 100,
          steps: [],
        });
        result.current.setTestResult("test-2", {
          testId: "test-2",
          passed: false,
          executionTime: 120,
          steps: [],
          consoleLogs: [],
        });
      });

      act(() => {
        result.current.clearTestResults();
      });

      expect(result.current.testResults.size).toBe(0);
    });
  });

  describe("Hints", () => {
    it("should reveal hints incrementally", () => {
      const { result } = renderHook(() => useAppStore());

      expect(result.current.hintsRevealed).toBe(0);

      act(() => {
        result.current.revealHint();
      });
      expect(result.current.hintsRevealed).toBe(1);

      act(() => {
        result.current.revealHint();
      });
      expect(result.current.hintsRevealed).toBe(2);
    });

    it("should reset hints", () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.revealHint();
        result.current.revealHint();
        result.current.revealHint();
      });

      expect(result.current.hintsRevealed).toBe(3);

      act(() => {
        result.current.resetHints();
      });

      expect(result.current.hintsRevealed).toBe(0);
    });
  });
});
