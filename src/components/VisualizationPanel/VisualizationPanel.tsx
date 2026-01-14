import { useMemo, useEffect, useCallback, useRef } from "react";
import useAppStore from "../../store/useAppStore";
import { ArrayVisualizer } from "../visualizers/ArrayVisualizer";
import { arrayTests } from "../../lib/testing/testCases";
import { ModeSelector } from "./ModeSelector";
import { ComparisonView } from "./ComparisonView";
import { AnimationSpeedControl } from "./AnimationSpeedControl";
import { PerformanceMetrics } from "./PerformanceMetrics";
import { runReferenceSolution } from "../../lib/execution/referenceSolutionRunner";
import "./AnimationSpeedControl.css";

function VisualizationPanel() {
  const {
    selectedDataStructure,
    selectedDifficulty,
    userCodeSteps,
    expectedOutputSteps,
    referenceSteps,
    currentStepIndex,
    isAnimating,
    animationSpeed,
    visualizationMode,
    codeStatus,
    testResults,
    nextStep,
    previousStep,
    setCurrentStepIndex,
    setIsAnimating,
    setAnimationSpeed,
    setVisualizationMode,
    setExpectedOutputSteps,
    setReferenceSteps,
  } = useAppStore();

  // Track if we're loading expected/reference steps
  const loadingRef = useRef(false);

  // Automatically switch to skeleton mode when code is incomplete or no user steps
  useEffect(() => {
    // If user-code mode is selected but code is incomplete or no steps available, switch to skeleton
    if (visualizationMode === "user-code") {
      if (codeStatus === "incomplete" || userCodeSteps.length === 0) {
        setVisualizationMode("skeleton");
      }
    }
  }, [visualizationMode, codeStatus, userCodeSteps.length, setVisualizationMode]);

  // Get current steps based on visualization mode
  const currentSteps = useMemo(() => {
    switch (visualizationMode) {
      case "user-code":
        return userCodeSteps;
      case "expected-output":
        return expectedOutputSteps;
      case "reference":
        return referenceSteps;
      case "skeleton":
        return []; // No steps for skeleton mode - show initial state only
      default:
        return [];
    }
  }, [visualizationMode, userCodeSteps, expectedOutputSteps, referenceSteps]);

  // Get initial data from current test case
  const getCurrentTestCase = useCallback(() => {
    switch (selectedDataStructure) {
      case "array":
        return arrayTests.find((t) => t.difficulty === selectedDifficulty);
      default:
        return arrayTests.find((t) => t.difficulty === selectedDifficulty);
    }
  }, [selectedDataStructure, selectedDifficulty]);

  const currentTestCase = getCurrentTestCase();
  const initialData = currentTestCase?.initialData || [];

  // Load expected output steps when mode is selected and not already loaded
  useEffect(() => {
    const loadExpectedOutput = async () => {
      if (
        (visualizationMode === "expected-output" || visualizationMode === "comparison") &&
        currentTestCase &&
        expectedOutputSteps.length === 0 &&
        !loadingRef.current
      ) {
        loadingRef.current = true;
        const result = await runReferenceSolution(currentTestCase);
        if (result.success) {
          setExpectedOutputSteps(result.steps);
        }
        loadingRef.current = false;
      }
    };

    loadExpectedOutput();
  }, [visualizationMode, currentTestCase, expectedOutputSteps.length, setExpectedOutputSteps]);

  // Load reference solution steps when mode is selected
  useEffect(() => {
    const loadReferenceSolution = async () => {
      if (
        visualizationMode === "reference" &&
        currentTestCase &&
        referenceSteps.length === 0 &&
        !loadingRef.current
      ) {
        loadingRef.current = true;
        const result = await runReferenceSolution(currentTestCase);
        if (result.success) {
          setReferenceSteps(result.steps);
        }
        loadingRef.current = false;
      }
    };

    loadReferenceSolution();
  }, [visualizationMode, currentTestCase, referenceSteps.length, setReferenceSteps]);

  // Auto-animation loop - advance steps automatically when playing
  useEffect(() => {
    if (!isAnimating || currentSteps.length === 0) {
      return;
    }

    // Calculate interval based on animation speed (base 800ms)
    const interval = 800 / animationSpeed;

    const timer = setInterval(() => {
      const state = useAppStore.getState();
      const steps = (() => {
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
      })();

      if (state.currentStepIndex >= steps.length - 1) {
        // Reached the end, stop animation
        setIsAnimating(false);
      } else {
        nextStep();
      }
    }, interval);

    return () => clearInterval(timer);
  }, [isAnimating, animationSpeed, currentSteps.length, nextStep, setIsAnimating]);

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

  // Extract data for comparison view (left = user code, right = expected output)
  const comparisonLeftData = useMemo(() => {
    if (userCodeSteps.length === 0) return initialData;
    if (currentStepIndex >= 0 && currentStepIndex < userCodeSteps.length) {
      return userCodeSteps[currentStepIndex]?.result || initialData;
    }
    return initialData;
  }, [userCodeSteps, currentStepIndex, initialData]);

  const comparisonRightData = useMemo(() => {
    if (expectedOutputSteps.length === 0) return initialData;
    if (currentStepIndex >= 0 && currentStepIndex < expectedOutputSteps.length) {
      return expectedOutputSteps[currentStepIndex]?.result || initialData;
    }
    return initialData;
  }, [expectedOutputSteps, currentStepIndex, initialData]);

  // Render visualizer based on data structure and mode
  const renderVisualizer = () => {
    // Comparison view renders side-by-side visualizers
    if (visualizationMode === "comparison") {
      return (
        <ComparisonView
          dataStructure={selectedDataStructure}
          leftData={comparisonLeftData}
          rightData={comparisonRightData}
          leftSteps={userCodeSteps}
          rightSteps={expectedOutputSteps}
          currentStepIndex={currentStepIndex}
          isAnimating={isAnimating}
          leftLabel="Your Code"
          rightLabel="Expected Output"
        />
      );
    }

    // Single visualizer for other modes
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
      <ModeSelector
        currentMode={visualizationMode}
        onModeChange={setVisualizationMode}
        codeStatus={codeStatus}
        hasSteps={userCodeSteps.length > 0}
      />
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
          <AnimationSpeedControl
            speed={animationSpeed}
            onSpeedChange={setAnimationSpeed}
            disabled={currentSteps.length === 0}
          />
        </div>
      </div>
      <div className="visualizer-container">
        <div className="visualizer-inner">
          {renderVisualizer()}
          {visualizationMode === "skeleton" && (
            <div className="skeleton-overlay">
              <div className="skeleton-message">
                <h3>Initial State</h3>
                <p>Complete the function in the editor to see the animation.</p>
                <p className="skeleton-hint">
                  Try clicking "Show Expected" to understand what should happen, or use the hints
                  below the editor.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Performance Metrics - show when we have execution data */}
        {currentSteps.length > 0 && visualizationMode !== "skeleton" && (
          <PerformanceMetrics
            executionTime={currentTestCase && testResults.get(currentTestCase.id)?.executionTime}
            steps={currentSteps}
            dataSize={Array.isArray(initialData) ? initialData.length : 0}
          />
        )}
      </div>
    </div>
  );
}

export default VisualizationPanel;
