import { type VisualizationMode } from "../../store/useAppStore";
import "./ModeSelector.css";

interface ModeSelectorProps {
  currentMode: VisualizationMode;
  onModeChange: (mode: VisualizationMode) => void;
  codeStatus: "incomplete" | "complete" | "error";
  hasSteps: boolean; // Whether user has run tests and captured execution steps
}

export function ModeSelector({
  currentMode,
  onModeChange,
  hasSteps,
}: ModeSelectorProps) {
  return (
    <div className="mode-selector">
      <div className="mode-selector-row">
        <div className="mode-selector-header">Mode</div>
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
            Code Visualization
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
        </div>
      </div>

      <div className="mode-description">
        {currentMode === "user-code" && !hasSteps && (
          <p className="hint-text">
            Run a test to see your code&apos;s execution visualized here.
          </p>
        )}
        {currentMode === "comparison" && !hasSteps && (
          <p className="hint-text">
            Run a test to compare your code with expected output side-by-side.
          </p>
        )}
      </div>
    </div>
  );
}
