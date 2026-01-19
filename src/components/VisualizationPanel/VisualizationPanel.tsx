import { useMemo, useEffect, useCallback, useRef } from "react";
import IconPlayerPlay from "@tabler/icons-react/dist/esm/icons/IconPlayerPlay.mjs";
import IconPlayerPause from "@tabler/icons-react/dist/esm/icons/IconPlayerPause.mjs";
import IconChevronLeft from "@tabler/icons-react/dist/esm/icons/IconChevronLeft.mjs";
import IconChevronRight from "@tabler/icons-react/dist/esm/icons/IconChevronRight.mjs";
import IconReload from "@tabler/icons-react/dist/esm/icons/IconReload.mjs";
import useAppStore from "../../store/useAppStore";
import { ArrayVisualizer } from "../visualizers/ArrayVisualizer";
import { LinkedListVisualizer } from "../visualizers/LinkedListVisualizer";
import { StackQueueVisualizer } from "../visualizers/StackQueueVisualizer";
import { BinaryTreeVisualizer } from "../visualizers/BinaryTreeVisualizer";
import GraphVisualizer from "../visualizers/GraphVisualizer";
import { HashMapVisualizer } from "../visualizers/HashMapVisualizer";
import {
  arrayTests,
  linkedListTests,
  stackQueueTests,
  binaryTreeTests,
  graphTests,
  hashMapTests,
} from "../../lib/testing/testCases";
import type { BinaryTreeNode } from "../../lib/dataStructures/TrackedBinaryTree";
import type { HashMapBucket } from "../../lib/dataStructures/TrackedHashMap";
import { ModeSelector } from "./ModeSelector";
import { ComparisonView } from "./ComparisonView";
import { runReferenceSolution } from "../../lib/execution/referenceSolutionRunner";

function VisualizationPanel() {
  const {
    selectedDataStructure,
    selectedDifficulty,
    userCodeSteps,
    expectedOutputSteps,
    referenceSteps,
    currentStepIndex,
    isAnimating,
    visualizationMode,
    codeStatus,
    nextStep,
    previousStep,
    setCurrentStepIndex,
    setIsAnimating,
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
      case "linkedList":
        return linkedListTests.find((t) => t.difficulty === selectedDifficulty);
      case "stack":
        return stackQueueTests.find(
          (t) => t.difficulty === selectedDifficulty && t.id.startsWith("stack-"),
        );
      case "queue":
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
  const initialData = currentTestCase?.initialData || [];

  // Helper function to convert TrackedGraph result to GraphVisualizer format
  const convertGraphData = useCallback(
    (
      graphResult: Array<{ vertex: unknown; neighbors: unknown[] }> | null | undefined,
    ): Array<{
      id: string | number;
      label?: string;
      edges?: Array<{
        from: string | number;
        to: string | number;
        weight?: number;
        directed?: boolean;
      }>;
    }> | null => {
      if (!graphResult || !Array.isArray(graphResult)) return null;
      const graphInit = currentTestCase?.initialData as { directed?: boolean } | undefined;
      return graphResult.map((node) => ({
        id: node.vertex as string | number,
        label: String(node.vertex),
        edges: node.neighbors.map((neighbor) => ({
          from: node.vertex as string | number,
          to: neighbor as string | number,
          directed: graphInit?.directed || false,
        })),
      }));
    },
    [currentTestCase],
  );

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

    // Fixed animation interval (800ms per step)
    const interval = 800;

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
  }, [isAnimating, currentSteps.length, nextStep, setIsAnimating]);

  // Extract current array data from steps or use initial data
  const currentData = useMemo(() => {
    if (currentSteps.length === 0) {
      // For binary trees, build tree structure from initial array
      if (
        selectedDataStructure === "tree" &&
        Array.isArray(initialData) &&
        initialData.length > 0
      ) {
        // Build BST from array by inserting values in order
        let root: BinaryTreeNode<number> | null = null;

        const insertNode = (
          node: BinaryTreeNode<number> | null,
          value: number,
        ): BinaryTreeNode<number> => {
          if (node === null) {
            return { value, left: null, right: null };
          }
          if (value < node.value) {
            node.left = insertNode(node.left, value);
          } else if (value > node.value) {
            node.right = insertNode(node.right, value);
          }
          return node;
        };

        for (const value of initialData as number[]) {
          root = insertNode(root, value);
        }

        return root;
      }

      // For graphs, convert initialData to graph format
      if (selectedDataStructure === "graph" && initialData) {
        const graphInit = initialData as {
          vertices?: unknown[];
          edges?: Array<{ from: unknown; to: unknown; weight?: number; directed?: boolean }>;
          directed?: boolean;
        };
        if (graphInit.vertices && graphInit.edges) {
          return graphInit.vertices.map((vertex) => ({
            id: vertex as string | number,
            label: String(vertex),
            edges: graphInit.edges
              ?.filter((e) => e.from === vertex)
              .map((e) => ({
                from: e.from as string | number,
                to: e.to as string | number,
                weight: e.weight,
                directed: e.directed || graphInit.directed || false,
              })),
          }));
        }
      }
      return initialData;
    }
    if (currentStepIndex >= 0 && currentStepIndex < currentSteps.length) {
      const step = currentSteps[currentStepIndex];
      // For binary trees, extract the tree structure from metadata
      if (selectedDataStructure === "tree" && step?.metadata) {
        const metadata = step.metadata as { treeStructure?: BinaryTreeNode<number> | null };
        return metadata.treeStructure || null;
      }
      // For graphs, convert result to graph format
      if (selectedDataStructure === "graph" && step?.result) {
        return convertGraphData(step.result as Array<{ vertex: unknown; neighbors: unknown[] }>);
      }
      return step?.result || initialData;
    }
    return initialData;
  }, [currentSteps, currentStepIndex, initialData, selectedDataStructure, convertGraphData]);

  // Extract data for comparison view (left = user code, right = expected output)
  const comparisonLeftData = useMemo(() => {
    if (userCodeSteps.length === 0) {
      // For binary trees, build tree structure from initial array
      if (
        selectedDataStructure === "tree" &&
        Array.isArray(initialData) &&
        initialData.length > 0
      ) {
        let root: BinaryTreeNode<number> | null = null;
        const insertNode = (
          node: BinaryTreeNode<number> | null,
          value: number,
        ): BinaryTreeNode<number> => {
          if (node === null) {
            return { value, left: null, right: null };
          }
          if (value < node.value) {
            node.left = insertNode(node.left, value);
          } else if (value > node.value) {
            node.right = insertNode(node.right, value);
          }
          return node;
        };
        for (const value of initialData as number[]) {
          root = insertNode(root, value);
        }
        return root;
      }
      return initialData;
    }
    if (currentStepIndex >= 0 && currentStepIndex < userCodeSteps.length) {
      const step = userCodeSteps[currentStepIndex];
      // For binary trees, extract the tree structure from metadata
      if (selectedDataStructure === "tree" && step?.metadata) {
        const metadata = step.metadata as { treeStructure?: BinaryTreeNode<number> | null };
        return metadata.treeStructure || null;
      }
      // For graphs, convert result to graph format
      if (selectedDataStructure === "graph" && step?.result) {
        return convertGraphData(step.result as Array<{ vertex: unknown; neighbors: unknown[] }>);
      }
      return step?.result || initialData;
    }
    return initialData;
  }, [userCodeSteps, currentStepIndex, initialData, selectedDataStructure, convertGraphData]);

  const comparisonRightData = useMemo(() => {
    if (expectedOutputSteps.length === 0) {
      // For binary trees, build tree structure from initial array
      if (
        selectedDataStructure === "tree" &&
        Array.isArray(initialData) &&
        initialData.length > 0
      ) {
        let root: BinaryTreeNode<number> | null = null;
        const insertNode = (
          node: BinaryTreeNode<number> | null,
          value: number,
        ): BinaryTreeNode<number> => {
          if (node === null) {
            return { value, left: null, right: null };
          }
          if (value < node.value) {
            node.left = insertNode(node.left, value);
          } else if (value > node.value) {
            node.right = insertNode(node.right, value);
          }
          return node;
        };
        for (const value of initialData as number[]) {
          root = insertNode(root, value);
        }
        return root;
      }
      return initialData;
    }
    if (currentStepIndex >= 0 && currentStepIndex < expectedOutputSteps.length) {
      const step = expectedOutputSteps[currentStepIndex];
      // For binary trees, extract the tree structure from metadata
      if (selectedDataStructure === "tree" && step?.metadata) {
        const metadata = step.metadata as { treeStructure?: BinaryTreeNode<number> | null };
        return metadata.treeStructure || null;
      }
      // For graphs, convert result to graph format
      if (selectedDataStructure === "graph" && step?.result) {
        return convertGraphData(step.result as Array<{ vertex: unknown; neighbors: unknown[] }>);
      }
      return step?.result || initialData;
    }
    return initialData;
  }, [expectedOutputSteps, currentStepIndex, initialData, selectedDataStructure, convertGraphData]);

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
      case "linkedList":
        return (
          <LinkedListVisualizer
            data={currentData}
            steps={currentSteps}
            currentStepIndex={currentStepIndex}
            isAnimating={isAnimating}
          />
        );
      case "stack":
        return (
          <StackQueueVisualizer
            data={currentData}
            steps={currentSteps}
            currentStepIndex={currentStepIndex}
            isAnimating={isAnimating}
            mode="stack"
          />
        );
      case "queue":
        return (
          <StackQueueVisualizer
            data={currentData}
            steps={currentSteps}
            currentStepIndex={currentStepIndex}
            isAnimating={isAnimating}
            mode="queue"
          />
        );
      case "tree":
        return (
          <BinaryTreeVisualizer
            data={currentData as BinaryTreeNode<number> | null}
            steps={currentSteps}
            currentStepIndex={currentStepIndex}
            isAnimating={isAnimating}
          />
        );
      case "graph":
        return (
          <GraphVisualizer
            data={
              currentData as Array<{
                id: string | number;
                label?: string;
                edges?: Array<{
                  from: string | number;
                  to: string | number;
                  weight?: number;
                  directed?: boolean;
                }>;
              }> | null
            }
            steps={currentSteps}
            currentStepIndex={currentStepIndex}
            isAnimating={isAnimating}
          />
        );
      case "hashMap":
        return (
          <HashMapVisualizer
            data={currentData as HashMapBucket<unknown, unknown>[] | null}
            steps={currentSteps}
            currentStepIndex={currentStepIndex}
            isAnimating={isAnimating}
          />
        );
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

  // Handler for replay button - resets to beginning and starts animation
  const handleReplay = useCallback(() => {
    setCurrentStepIndex(0);
    setIsAnimating(true);
  }, [setCurrentStepIndex, setIsAnimating]);

  return (
    <div className="visualization-panel">
      <ModeSelector
        currentMode={visualizationMode}
        onModeChange={setVisualizationMode}
        codeStatus={codeStatus}
        hasSteps={userCodeSteps.length > 0}
      />
      <div className="visualizer-container">
        <div className="visualizer-inner">
          {renderVisualizer()}
          {visualizationMode === "skeleton" && <div className="skeleton-badge">Initial State</div>}
        </div>

        {/* Playback controls - shown below visualization when there are steps */}
        {currentSteps.length > 0 && visualizationMode !== "skeleton" && (
          <div className="playback-controls">
            <button
              onClick={() => setIsAnimating(!isAnimating)}
              className={`playback-button playback-button-primary ${isAnimating ? "active" : ""}`}
              aria-label={isAnimating ? "Pause animation" : "Play animation"}
            >
              {isAnimating ? <IconPlayerPause size={20} /> : <IconPlayerPlay size={20} />}
              {isAnimating ? "Pause" : "Play"}
            </button>
            <span className="playback-step-counter">
              Step {currentStepIndex + 1} / {currentSteps.length}
            </span>
            <div className="playback-nav-buttons">
              <button
                onClick={handleReplay}
                className="playback-button"
                aria-label="Replay animation from beginning"
                title="Replay"
              >
                <IconReload size={18} />
              </button>
              <button
                onClick={previousStep}
                disabled={currentStepIndex <= 0}
                className="playback-button"
                aria-label="Previous step"
                title="Previous Step"
              >
                <IconChevronLeft size={18} />
              </button>
              <button
                onClick={nextStep}
                disabled={currentStepIndex >= currentSteps.length - 1}
                className="playback-button"
                aria-label="Next step"
                title="Next Step"
              >
                <IconChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VisualizationPanel;
