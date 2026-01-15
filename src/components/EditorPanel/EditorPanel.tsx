import { useEffect, useRef, useCallback, useState } from "react";
import { CodeMirrorEditor } from "./CodeMirrorEditor";
import { HintButton } from "./HintButton";
import { PresetSelector } from "./PresetSelector";
import { RunButton } from "./RunButton";
import useAppStore, { DataStructureType } from "../../store/useAppStore";
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
    highlightedLine,
    setUserCode,
    setCodeStatus,
    setSelectedDataStructure,
    resetHints,
  } = useAppStore();

  // Track previous mode to detect when switching to reference mode
  const prevModeRef = useRef(visualizationMode);

  // Get current test case for hints and reference solution
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

  // Get all test cases for the current data structure
  const getAllTestCasesForDataStructure = useCallback(() => {
    switch (selectedDataStructure) {
      case "array":
        return arrayTests;
      case "linkedList":
        return linkedListTests;
      case "stack":
        return stackQueueTests.filter((t) => t.id.startsWith("stack-"));
      case "queue":
        return stackQueueTests.filter((t) => t.id.startsWith("queue-"));
      case "tree":
        return binaryTreeTests;
      case "graph":
        return graphTests;
      case "hashMap":
        return hashMapTests;
      default:
        return arrayTests;
    }
  }, [selectedDataStructure]);

  // Load reference solution when visualization mode changes to "reference"
  useEffect(() => {
    const prevMode = prevModeRef.current;
    prevModeRef.current = visualizationMode;

    // Only load reference when switching TO reference mode (not when already in it)
    if (visualizationMode === "reference" && prevMode !== "reference") {
      // Load the current test case's reference solution
      // Since all Array tests use the same 'sortArray' function name,
      // we only load one reference solution (the selected difficulty).
      // For other data structures that use different function names per difficulty,
      // load all reference solutions so all tests can pass.
      const allTestCases = getAllTestCasesForDataStructure();
      const currentTestCase = getCurrentTestCase();

      // Check if all test cases use the same main function name
      const functionNames = allTestCases.map((tc) => {
        const match = tc.referenceSolution?.match(/function\s+(\w+)\s*\(/);
        return match?.[1];
      });
      const uniqueFunctionNames = new Set(functionNames.filter(Boolean));
      const allUseSameFunctionName = uniqueFunctionNames.size === 1;

      let solution: string;
      if (allUseSameFunctionName) {
        // All tests use the same function name - load only current test's solution
        solution = currentTestCase?.referenceSolution || "";
      } else {
        // Tests use different function names - load all solutions
        solution = allTestCases
          .map((tc) => tc.referenceSolution)
          .filter(Boolean)
          .join("\n\n");
      }

      if (solution) {
        setUserCode(solution);
        setCodeStatus("complete");
      }
    }
  }, [
    visualizationMode,
    getAllTestCasesForDataStructure,
    getCurrentTestCase,
    setUserCode,
    setCodeStatus,
  ]);

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

  return (
    <div className="editor-panel">
      <div className="editor-header">
        <h2>Editor</h2>
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
          <span className={`difficulty-badge difficulty-${selectedDifficulty}`}>
            {selectedDifficulty}
          </span>
          {isReadOnly && (
            <span className="reference-mode-badge">Reference Solution (Read-Only)</span>
          )}
          <PresetSelector
            dataStructure={selectedDataStructure}
            onSelectPreset={handlePresetSelect}
            disabled={isReadOnly}
          />
        </div>
      </div>
      <div className="run-button-container">
        <RunButton onRunTests={handleRunTests} disabled={false} isRunning={isRunning} />
      </div>
      <div className="editor-content">
        <CodeMirrorEditor
          value={userCode}
          onChange={handleCodeChange}
          readOnly={isReadOnly}
          highlightedLine={highlightedLine}
        />
        <HintButton testCase={currentTestCase || null} />
      </div>
    </div>
  );
}

export default EditorPanel;
