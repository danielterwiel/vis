import { type VisualizationMode } from "../../store/useAppStore";
import "./ModeSelector.css";

interface ModeSelectorProps {
  currentMode: VisualizationMode;
  onModeChange: (mode: VisualizationMode) => void;
  codeStatus: "incomplete" | "complete" | "error";
  hasSteps: boolean;
}

export function ModeSelector({
  currentMode,
  onModeChange,
  codeStatus,
  hasSteps,
}: ModeSelectorProps) {
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
          disabled={codeStatus !== "complete" || !hasSteps}
          title={
            codeStatus === "incomplete"
              ? "Complete the code to run it"
              : codeStatus === "error"
                ? "Fix code errors before running"
                : !hasSteps
                  ? "Run tests to see visualization"
                  : "Visualize your code execution"
          }
        >
          Run My Code
        </button>

        <button
          className={`mode-button ${currentMode === "expected-output" ? "active" : ""}`}
          onClick={() => onModeChange("expected-output")}
          title="Show what the result should look like"
        >
          Show Expected
        </button>

        <button
          className={`mode-button ${currentMode === "skeleton" ? "active" : ""}`}
          onClick={() => onModeChange("skeleton")}
          title="Show initial state"
        >
          Skeleton
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
        {currentMode === "user-code" && (
          <p>Visualizing your code execution with captured operations.</p>
        )}
        {currentMode === "expected-output" && (
          <p>Showing the expected output without revealing implementation details.</p>
        )}
        {currentMode === "skeleton" && (
          <p>Showing initial state. Complete the code to see animation.</p>
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
