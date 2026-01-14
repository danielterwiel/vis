import { useEffect, useRef, useCallback } from "react";
import { CodeMirrorEditor } from "./CodeMirrorEditor";
import { HintButton } from "./HintButton";
import { PresetSelector } from "./PresetSelector";
import useAppStore, { DataStructureType } from "../../store/useAppStore";
import { skeletonCodeSystem } from "../../templates";
import { arrayTests } from "../../lib/testing/testCases";

const DATA_STRUCTURE_OPTIONS: { value: DataStructureType; label: string }[] = [
  { value: "array", label: "Array" },
  { value: "linkedList", label: "Linked List" },
  { value: "stack", label: "Stack" },
  { value: "queue", label: "Queue" },
  { value: "tree", label: "Binary Tree" },
  { value: "graph", label: "Graph" },
  { value: "hashMap", label: "Hash Map" },
];

function EditorPanel() {
  const {
    selectedDataStructure,
    selectedDifficulty,
    userCode,
    visualizationMode,
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
      // TODO: Add other data structures
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

  // Load reference solution when visualization mode changes to "reference"
  useEffect(() => {
    const prevMode = prevModeRef.current;
    prevModeRef.current = visualizationMode;

    // Only load reference when switching TO reference mode (not when already in it)
    if (visualizationMode === "reference" && prevMode !== "reference") {
      const testCase = getCurrentTestCase();
      if (testCase?.referenceSolution) {
        setUserCode(testCase.referenceSolution);
        setCodeStatus("complete");
      }
    }
  }, [visualizationMode, getCurrentTestCase, setUserCode, setCodeStatus]);

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
      <div className="editor-content">
        <CodeMirrorEditor value={userCode} onChange={handleCodeChange} readOnly={isReadOnly} />
        <HintButton testCase={currentTestCase || null} />
      </div>
    </div>
  );
}

export default EditorPanel;
