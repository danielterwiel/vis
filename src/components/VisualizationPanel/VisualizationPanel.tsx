import { useMemo } from "react";
import useAppStore from "../../store/useAppStore";
import { ArrayVisualizer } from "../visualizers/ArrayVisualizer";
import { arrayTests } from "../../lib/testing/testCases";

function VisualizationPanel() {
  const {
    selectedDataStructure,
    selectedDifficulty,
    currentSteps,
    currentStepIndex,
    isAnimating,
    nextStep,
    previousStep,
    setCurrentStepIndex,
    setIsAnimating,
  } = useAppStore();

  // Get initial data from current test case
  const getCurrentTestCase = () => {
    switch (selectedDataStructure) {
      case "array":
        return arrayTests.find((t) => t.difficulty === selectedDifficulty);
      default:
        return arrayTests.find((t) => t.difficulty === selectedDifficulty);
    }
  };

  const currentTestCase = getCurrentTestCase();
  const initialData = currentTestCase?.initialData || [];

  // Extract current array data from steps or use initial data
  const currentData = useMemo(() => {
    if (currentSteps.length === 0) {
      return initialData;
    }
    if (currentStepIndex >= 0 && currentStepIndex < currentSteps.length) {
      const step = currentSteps[currentStepIndex];
      return step?.result || initialData;
    }
    return initialData;
  }, [currentSteps, currentStepIndex, initialData]);

  // Render visualizer based on data structure
  const renderVisualizer = () => {
    switch (selectedDataStructure) {
      case "array":
        return (
          <ArrayVisualizer
            data={currentData}
            steps={currentSteps}
            currentStepIndex={currentStepIndex}
            isAnimating={isAnimating}
          />
        );
      // TODO: Add other data structure visualizers
      default:
        return (
          <ArrayVisualizer
            data={currentData}
            steps={currentSteps}
            currentStepIndex={currentStepIndex}
            isAnimating={isAnimating}
          />
        );
    }
  };

  return (
    <div className="visualization-panel">
      <div className="visualization-header">
        <h2>Visualization</h2>
        <div className="visualization-controls">
          <button
            onClick={previousStep}
            disabled={currentStepIndex <= 0}
            className="control-button"
          >
            ← Previous
          </button>
          <span className="step-counter">
            Step {currentStepIndex + 1} / {currentSteps.length || 1}
          </span>
          <button
            onClick={nextStep}
            disabled={currentStepIndex >= currentSteps.length - 1}
            className="control-button"
          >
            Next →
          </button>
          <button
            onClick={() => setIsAnimating(!isAnimating)}
            className={`control-button ${isAnimating ? "active" : ""}`}
          >
            {isAnimating ? "⏸ Pause" : "▶ Play"}
          </button>
          <button
            onClick={() => setCurrentStepIndex(0)}
            disabled={currentSteps.length === 0}
            className="control-button"
          >
            ⟲ Reset
          </button>
        </div>
      </div>
      <div className="visualizer-container">{renderVisualizer()}</div>
    </div>
  );
}

export default VisualizationPanel;
