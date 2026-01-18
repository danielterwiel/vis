import { useEffect, useCallback, useState, useMemo } from "react";
import { CodeMirrorEditor } from "./CodeMirrorEditor";
import { HintButton } from "./HintButton";
import { PresetSelector } from "./PresetSelector";
import { RunButton } from "./RunButton";
import { SolutionDropdown } from "./SolutionDropdown";
import useAppStore, { DataStructureType, DifficultyLevel } from "../../store/useAppStore";
import { skeletonCodeSystem } from "../../templates";
import {
  arrayTests,
  linkedListTests,
  stackQueueTests,
  binaryTreeTests,
  graphTests,
  hashMapTests,
} from "../../lib/testing/testCases";

const DATA_STRUCTURE_OPTIONS: { value: DataStructureType; label: string }[] = [
  { value: "array", label: "Array" },
  { value: "linkedList", label: "Linked List" },
  { value: "stack", label: "Stack" },
  { value: "queue", label: "Queue" },
  { value: "tree", label: "Binary Tree" },
  { value: "graph", label: "Graph" },
  { value: "hashMap", label: "Hash Map" },
];

const DIFFICULTY_LEVELS: DifficultyLevel[] = ["easy", "medium", "hard"];

const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

interface EditorPanelProps {
  onRunAllTests: () => Promise<void>;
}

function EditorPanel({ onRunAllTests }: EditorPanelProps) {
  const [isRunning, setIsRunning] = useState(false);
  const {
    selectedDataStructure,
    selectedDifficulty,
    userCode,
    visualizationMode,
    setUserCode,
    setCodeStatus,
    setSelectedDataStructure,
    setVisualizationMode,
    resetHints,
  } = useAppStore();

  // Get current test case for hints
  const getCurrentTestCase = useCallback(() => {
    switch (selectedDataStructure) {
      case "array":
        return arrayTests.find((t) => t.difficulty === selectedDifficulty);
      case "linkedList":
        return linkedListTests.find((t) => t.difficulty === selectedDifficulty);
      case "stack":
        // Filter by both difficulty AND test ID prefix to get correct stack test
        return stackQueueTests.find(
          (t) => t.difficulty === selectedDifficulty && t.id.startsWith("stack-"),
        );
      case "queue":
        // Filter by both difficulty AND test ID prefix to get correct queue test
        return stackQueueTests.find(
          (t) => t.difficulty === selectedDifficulty && t.id.startsWith("queue-"),
        );
      case "tree":
        return binaryTreeTests.find((t) => t.difficulty === selectedDifficulty);
      case "graph":
        return graphTests.find((t) => t.difficulty === selectedDifficulty);
      case "hashMap":
        return hashMapTests.find((t) => t.difficulty === selectedDifficulty);
      default:
        return arrayTests.find((t) => t.difficulty === selectedDifficulty);
    }
  }, [selectedDataStructure, selectedDifficulty]);

  const currentTestCase = getCurrentTestCase();

  // Load skeleton code when difficulty or data structure changes
  useEffect(() => {
    const skeleton = skeletonCodeSystem.getSkeletonCode(selectedDataStructure, selectedDifficulty);

    if (skeleton) {
      setUserCode(skeleton);
      setCodeStatus("incomplete");
    }

    // Reset hints when switching tests
    resetHints();
  }, [selectedDataStructure, selectedDifficulty, setUserCode, setCodeStatus, resetHints]);

  // Update code status when user edits code
  const handleCodeChange = (newCode: string) => {
    setUserCode(newCode);

    const skeleton = skeletonCodeSystem.getSkeletonCode(selectedDataStructure, selectedDifficulty);
    if (skeleton) {
      const isModified = skeletonCodeSystem.isModified(skeleton, newCode);
      setCodeStatus(isModified ? "complete" : "incomplete");
    }
  };

  // Editor is read-only in reference mode
  const isReadOnly = visualizationMode === "reference";

  // Handle preset selection
  const handlePresetSelect = (code: string) => {
    setUserCode(code);
    setCodeStatus("complete");
  };

  // Handle run all tests
  const handleRunTests = async () => {
    setIsRunning(true);
    try {
      await onRunAllTests();
    } finally {
      setIsRunning(false);
    }
  };

  // Get test case for a specific difficulty
  const getTestCaseForDifficultyLevel = useCallback(
    (difficulty: DifficultyLevel) => {
      switch (selectedDataStructure) {
        case "array":
          return arrayTests.find((t) => t.difficulty === difficulty);
        case "linkedList":
          return linkedListTests.find((t) => t.difficulty === difficulty);
        case "stack":
          return stackQueueTests.find((t) => t.difficulty === difficulty && t.id.startsWith("stack-"));
        case "queue":
          return stackQueueTests.find((t) => t.difficulty === difficulty && t.id.startsWith("queue-"));
        case "tree":
          return binaryTreeTests.find((t) => t.difficulty === difficulty);
        case "graph":
          return graphTests.find((t) => t.difficulty === difficulty);
        case "hashMap":
          return hashMapTests.find((t) => t.difficulty === difficulty);
        default:
          return arrayTests.find((t) => t.difficulty === difficulty);
      }
    },
    [selectedDataStructure],
  );

  // Handle show solution for a specific difficulty
  const handleShowSolutionForDifficultyLevel = async (difficulty: DifficultyLevel) => {
    const testCase = getTestCaseForDifficultyLevel(difficulty);
    const solution = testCase?.referenceSolution;

    if (solution) {
      setUserCode(solution);
      setCodeStatus("complete");
      setVisualizationMode("reference");
      await onRunAllTests();
    }
  };

  return (
    <div className="editor-panel">
      <div className="editor-header">
        <div className="editor-info">
          <select
            className="data-structure-select"
            value={selectedDataStructure}
            onChange={(e) => setSelectedDataStructure(e.target.value as DataStructureType)}
          >
            {DATA_STRUCTURE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <PresetSelector
            dataStructure={selectedDataStructure}
            onSelectPreset={handlePresetSelect}
            disabled={isReadOnly}
          />
          <SolutionDropdown disabled={isReadOnly} onSelectSolution={handleShowSolutionForDifficultyLevel} />
        </div>
      </div>
      <div className="run-button-container">
        <RunButton onRunTests={handleRunTests} disabled={false} isRunning={isRunning} />
      </div>
      <div className="editor-content">
        <CodeMirrorEditor value={userCode} onChange={handleCodeChange} readOnly={isReadOnly} />
        <HintButton testCase={currentTestCase || null} />
      </div>
    </div>
  );
}

export default EditorPanel;
