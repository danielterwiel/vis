import { create } from "zustand";
import type { ConsoleLog } from "../components/ConsoleOutput";
import {
  loadUserCode,
  saveUserCode,
  loadHintsRevealed,
  saveHintsRevealed,
} from "../lib/storage/localStorage";

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
  | "skeleton" // Show initial state, waiting for code
  | "comparison"; // Side-by-side comparison of user code vs expected output

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

  // Test results
  testResults: Map<string, TestResult>;
  hintsRevealed: number; // Count of hints revealed for current test

  // Console output
  consoleLogs: ConsoleLog[];

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

  // Actions - Testing
  setTestResult: (testId: string, result: TestResult) => void;
  clearTestResults: () => void;
  revealHint: () => void;
  resetHints: () => void;

  // Actions - Console
  addConsoleLog: (log: Omit<ConsoleLog, "timestamp">) => void;
  setConsoleLogs: (logs: ConsoleLog[]) => void;
  clearConsoleLogs: () => void;

  // Actions - Reset
  resetVisualization: () => void;
}

const useAppStore = create<AppState>((set, get) => {
  // Load initial state from localStorage
  const initialDataStructure: DataStructureType = "array";
  const initialDifficulty: DifficultyLevel = "easy";
  const savedCode = loadUserCode(initialDataStructure, initialDifficulty);
  const savedHintsRevealed = loadHintsRevealed(initialDataStructure, initialDifficulty);

  return {
    // Initial state
    selectedDataStructure: initialDataStructure,
    selectedDifficulty: initialDifficulty,

    userCode: savedCode || "",
    codeStatus: "incomplete",

    visualizationMode: "skeleton",
    userCodeSteps: [],
    expectedOutputSteps: [],
    referenceSteps: [],
    currentStepIndex: 0,
    isAnimating: false,

    testResults: new Map(),
    hintsRevealed: savedHintsRevealed ?? 0,

    consoleLogs: [],

    // Actions - Data structure selection
    setSelectedDataStructure: (dataStructure) => {
      const state = get();
      // Save current code before switching
      saveUserCode(state.selectedDataStructure, state.selectedDifficulty, state.userCode);

      // Load code for new data structure (default to easy)
      const newDifficulty: DifficultyLevel = "easy";
      const savedCode = loadUserCode(dataStructure, newDifficulty);
      const savedHints = loadHintsRevealed(dataStructure, newDifficulty);

      set({
        selectedDataStructure: dataStructure,
        selectedDifficulty: newDifficulty,
        userCode: savedCode || "",
        userCodeSteps: [],
        expectedOutputSteps: [],
        referenceSteps: [],
        currentStepIndex: 0,
        testResults: new Map(),
        hintsRevealed: savedHints ?? 0,
      });
    },

    setSelectedDifficulty: (difficulty) => {
      const state = get();
      // Save current code before switching
      saveUserCode(state.selectedDataStructure, state.selectedDifficulty, state.userCode);

      // Load code for new difficulty
      const savedCode = loadUserCode(state.selectedDataStructure, difficulty);
      const savedHints = loadHintsRevealed(state.selectedDataStructure, difficulty);

      set({
        selectedDifficulty: difficulty,
        userCode: savedCode || "",
        userCodeSteps: [],
        expectedOutputSteps: [],
        referenceSteps: [],
        currentStepIndex: 0,
        hintsRevealed: savedHints ?? 0,
      });
    },

    // Actions - Editor
    setUserCode: (code) => {
      const state = get();
      saveUserCode(state.selectedDataStructure, state.selectedDifficulty, code);
      set({ userCode: code });
    },
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

    // Actions - Testing
    setTestResult: (testId, result) =>
      set((state) => {
        const newResults = new Map(state.testResults);
        newResults.set(testId, result);
        return { testResults: newResults };
      }),

    clearTestResults: () => set({ testResults: new Map() }),

    revealHint: () => {
      const state = get();
      const newCount = state.hintsRevealed + 1;
      saveHintsRevealed(state.selectedDataStructure, state.selectedDifficulty, newCount);
      set({ hintsRevealed: newCount });
    },

    resetHints: () => {
      const state = get();
      saveHintsRevealed(state.selectedDataStructure, state.selectedDifficulty, 0);
      set({ hintsRevealed: 0 });
    },

    // Actions - Console
    addConsoleLog: (log) =>
      set((state) => ({
        consoleLogs: [...state.consoleLogs, { ...log, timestamp: Date.now() }],
      })),

    setConsoleLogs: (logs) => set({ consoleLogs: logs }),

    clearConsoleLogs: () => set({ consoleLogs: [] }),

    // Actions - Reset
    resetVisualization: () =>
      set({
        userCodeSteps: [],
        expectedOutputSteps: [],
        referenceSteps: [],
        currentStepIndex: 0,
        isAnimating: false,
      }),
  };
});

export default useAppStore;
