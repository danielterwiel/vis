import { useEffect } from "react";
import { CodeMirrorEditor } from "./CodeMirrorEditor";
import { HintSystem } from "./HintSystem";
import useAppStore from "../../store/useAppStore";
import { skeletonCodeSystem } from "../../templates";
import { arrayTests } from "../../lib/testing/testCases";

function EditorPanel() {
  const {
    selectedDataStructure,
    selectedDifficulty,
    userCode,
    setUserCode,
    setCodeStatus,
    resetHints,
  } = useAppStore();

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

  // Get current test case for hints
  const getCurrentTestCase = () => {
    switch (selectedDataStructure) {
      case "array":
        return arrayTests.find((t) => t.difficulty === selectedDifficulty);
      // TODO: Add other data structures
      default:
        return arrayTests.find((t) => t.difficulty === selectedDifficulty);
    }
  };

  const currentTestCase = getCurrentTestCase();

  return (
    <div className="editor-panel">
      <div className="editor-header">
        <h2>Editor</h2>
        <div className="editor-info">
          <span className="data-structure-badge">{selectedDataStructure}</span>
          <span className={`difficulty-badge difficulty-${selectedDifficulty}`}>
            {selectedDifficulty}
          </span>
        </div>
      </div>
      <CodeMirrorEditor value={userCode} onChange={handleCodeChange} />
      <HintSystem testCase={currentTestCase || null} />
    </div>
  );
}

export default EditorPanel;
