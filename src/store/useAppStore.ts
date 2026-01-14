import { create } from "zustand";

export type DataStructureType =
  | "array"
  | "linkedList"
  | "stack"
  | "queue"
  | "tree"
  | "graph"
  | "hashMap";

export type DifficultyLevel = "easy" | "medium" | "hard";

export type VisualizationMode =
  | "user-code" // Visualize user's actual code execution
  | "expected-output" // Show what the result SHOULD look like
  | "reference" // Animate the reference solution
  | "skeleton"; // Show initial state, waiting for code

export interface VisualizationStep {
  type: string;
  target?: any;
  args?: any[];
  result?: any;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface TestResult {
  testId: string;
  passed: boolean;
  error?: string;
  executionTime: number;
  steps: VisualizationStep[];
  consoleLogs: Array<{ level: string; args: unknown[] }>;
}

export interface AppState {
  // Data structure selection
  selectedDataStructure: DataStructureType;
  selectedDifficulty: DifficultyLevel;

  // Editor state
  userCode: string;
  codeStatus: "incomplete" | "complete" | "error";

  // Visualization state
  visualizationMode: VisualizationMode;
  // Steps stored separately per mode so switching modes preserves each
  userCodeSteps: VisualizationStep[];
  expectedOutputSteps: VisualizationStep[];
  referenceSteps: VisualizationStep[];
  currentStepIndex: number;
  isAnimating: boolean;
  animationSpeed: number; // 1 = normal, 2 = 2x, 0.5 = half speed

  // Test results
  testResults: Map<string, TestResult>;
  hintsRevealed: number; // Count of hints revealed for current test

  // Actions - Data structure selection
  setSelectedDataStructure: (dataStructure: DataStructureType) => void;
  setSelectedDifficulty: (difficulty: DifficultyLevel) => void;

  // Actions - Editor
  setUserCode: (code: string) => void;
  setCodeStatus: (status: "incomplete" | "complete" | "error") => void;

  // Actions - Visualization
  setVisualizationMode: (mode: VisualizationMode) => void;
  setUserCodeSteps: (steps: VisualizationStep[]) => void;
  setExpectedOutputSteps: (steps: VisualizationStep[]) => void;
  setReferenceSteps: (steps: VisualizationStep[]) => void;
  setCurrentSteps: (steps: VisualizationStep[]) => void; // Convenience method that sets based on current mode
  getCurrentSteps: () => VisualizationStep[]; // Get steps for current mode
  setCurrentStepIndex: (index: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  setIsAnimating: (isAnimating: boolean) => void;
  setAnimationSpeed: (speed: number) => void;

  // Actions - Testing
  setTestResult: (testId: string, result: TestResult) => void;
  clearTestResults: () => void;
  revealHint: () => void;
  resetHints: () => void;

  // Actions - Reset
  resetVisualization: () => void;
}

const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  selectedDataStructure: "array",
  selectedDifficulty: "easy",

  userCode: "",
  codeStatus: "incomplete",

  visualizationMode: "skeleton",
  userCodeSteps: [],
  expectedOutputSteps: [],
  referenceSteps: [],
  currentStepIndex: 0,
  isAnimating: false,
  animationSpeed: 1,

  testResults: new Map(),
  hintsRevealed: 0,

  // Actions - Data structure selection
  setSelectedDataStructure: (dataStructure) =>
    set({
      selectedDataStructure: dataStructure,
      // Reset related state when switching data structures
      selectedDifficulty: "easy",
      userCodeSteps: [],
      expectedOutputSteps: [],
      referenceSteps: [],
      currentStepIndex: 0,
      testResults: new Map(),
      hintsRevealed: 0,
    }),

  setSelectedDifficulty: (difficulty) =>
    set({
      selectedDifficulty: difficulty,
      // Reset test-specific state
      userCodeSteps: [],
      expectedOutputSteps: [],
      referenceSteps: [],
      currentStepIndex: 0,
      hintsRevealed: 0,
    }),

  // Actions - Editor
  setUserCode: (code) => set({ userCode: code }),
  setCodeStatus: (status) => set({ codeStatus: status }),

  // Actions - Visualization
  setVisualizationMode: (mode) => set({ visualizationMode: mode, currentStepIndex: 0 }),

  setUserCodeSteps: (steps) => set({ userCodeSteps: steps, currentStepIndex: 0 }),
  setExpectedOutputSteps: (steps) => set({ expectedOutputSteps: steps, currentStepIndex: 0 }),
  setReferenceSteps: (steps) => set({ referenceSteps: steps, currentStepIndex: 0 }),

  // Convenience method that sets steps for user-code mode (used by test runner)
  setCurrentSteps: (steps) => set({ userCodeSteps: steps, currentStepIndex: 0 }),

  // Get steps for current visualization mode
  getCurrentSteps: () => {
    const state = get();
    switch (state.visualizationMode) {
      case "user-code":
        return state.userCodeSteps;
      case "expected-output":
        return state.expectedOutputSteps;
      case "reference":
        return state.referenceSteps;
      default:
        return [];
    }
  },

  setCurrentStepIndex: (index) => set({ currentStepIndex: index }),

  nextStep: () =>
    set((state) => {
      const steps = get().getCurrentSteps();
      return {
        currentStepIndex: Math.min(state.currentStepIndex + 1, steps.length - 1),
      };
    }),

  previousStep: () =>
    set((state) => ({
      currentStepIndex: Math.max(state.currentStepIndex - 1, 0),
    })),

  setIsAnimating: (isAnimating) => set({ isAnimating }),
  setAnimationSpeed: (speed) => set({ animationSpeed: speed }),

  // Actions - Testing
  setTestResult: (testId, result) =>
    set((state) => {
      const newResults = new Map(state.testResults);
      newResults.set(testId, result);
      return { testResults: newResults };
    }),

  clearTestResults: () => set({ testResults: new Map() }),

  revealHint: () => set((state) => ({ hintsRevealed: state.hintsRevealed + 1 })),

  resetHints: () => set({ hintsRevealed: 0 }),

  // Actions - Reset
  resetVisualization: () =>
    set({
      userCodeSteps: [],
      expectedOutputSteps: [],
      referenceSteps: [],
      currentStepIndex: 0,
      isAnimating: false,
    }),
}));

export default useAppStore;
