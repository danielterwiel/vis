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
  currentSteps: VisualizationStep[];
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
  setCurrentSteps: (steps: VisualizationStep[]) => void;
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

const useAppStore = create<AppState>((set) => ({
  // Initial state
  selectedDataStructure: "array",
  selectedDifficulty: "easy",

  userCode: "",
  codeStatus: "incomplete",

  visualizationMode: "skeleton",
  currentSteps: [],
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
      currentSteps: [],
      currentStepIndex: 0,
      testResults: new Map(),
      hintsRevealed: 0,
    }),

  setSelectedDifficulty: (difficulty) =>
    set({
      selectedDifficulty: difficulty,
      // Reset test-specific state
      currentSteps: [],
      currentStepIndex: 0,
      hintsRevealed: 0,
    }),

  // Actions - Editor
  setUserCode: (code) => set({ userCode: code }),
  setCodeStatus: (status) => set({ codeStatus: status }),

  // Actions - Visualization
  setVisualizationMode: (mode) => set({ visualizationMode: mode }),
  setCurrentSteps: (steps) => set({ currentSteps: steps, currentStepIndex: 0 }),
  setCurrentStepIndex: (index) => set({ currentStepIndex: index }),

  nextStep: () =>
    set((state) => ({
      currentStepIndex: Math.min(state.currentStepIndex + 1, state.currentSteps.length - 1),
    })),

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
      currentSteps: [],
      currentStepIndex: 0,
      isAnimating: false,
    }),
}));

export default useAppStore;
