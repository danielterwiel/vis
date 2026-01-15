import { type VisualizationMode } from "../../store/useAppStore";
import "./ModeSelector.css";

interface ModeSelectorProps {
  currentMode: VisualizationMode;
  onModeChange: (mode: VisualizationMode) => void;
  codeStatus: "incomplete" | "complete" | "error";
  hasSteps: boolean; // Whether user has run tests and captured execution steps
}

export function ModeSelector({ currentMode, onModeChange, hasSteps }: ModeSelectorProps) {
  const handleReferenceModeClick = () => {
    const confirmed = confirm("This will reveal the solution. Continue?");
    if (confirmed) {
      onModeChange("reference");
    }
  };

  return (
    <div className="mode-selector">
      <div className="mode-selector-header">Visualization Mode</div>
      <div className="mode-selector-buttons">
        <button
          className={`mode-button ${currentMode === "user-code" ? "active" : ""}`}
          onClick={() => onModeChange("user-code")}
          disabled={!hasSteps}
          title={
            !hasSteps
              ? "Run a test first to see your code visualization"
              : "View your code execution steps"
          }
        >
          My Execution
        </button>

        <button
          className={`mode-button ${currentMode === "expected-output" ? "active" : ""}`}
          onClick={() => onModeChange("expected-output")}
          title="Show what the result should look like"
        >
          Show Expected
        </button>

        <button
          className={`mode-button ${currentMode === "comparison" ? "active" : ""}`}
          onClick={() => onModeChange("comparison")}
          disabled={!hasSteps}
          title={
            !hasSteps
              ? "Run a test first to compare your code with expected output"
              : "Compare your code execution side-by-side with expected output"
          }
        >
          Compare
        </button>

        <button
          className={`mode-button mode-button-warning ${currentMode === "reference" ? "active" : ""}`}
          onClick={handleReferenceModeClick}
          title="Reveal the reference solution (warning: spoilers!)"
        >
          Show Solution
        </button>
      </div>

      <div className="mode-description">
        {currentMode === "user-code" && !hasSteps && (
          <p className="hint-text">Run a test to see your code&apos;s execution visualized here.</p>
        )}
        {currentMode === "expected-output" && (
          <p>Showing the expected output - what a correct solution produces.</p>
        )}
        {currentMode === "comparison" && !hasSteps && (
          <p className="hint-text">
            Run a test to compare your code with expected output side-by-side.
          </p>
        )}
        {currentMode === "comparison" && hasSteps && (
          <p>Comparing your execution (left) with expected output (right) side-by-side.</p>
        )}
        {currentMode === "skeleton" && (
          <p>Showing initial array state. Run tests or select another mode to see animation.</p>
        )}
        {currentMode === "reference" && (
          <p className="warning-text">
            <strong>Solution revealed!</strong> Study the reference implementation.
          </p>
        )}
      </div>
    </div>
  );
}
