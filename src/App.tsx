import { useEffect, useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import EditorPanel from "./components/EditorPanel/EditorPanel";
import VisualizationPanel from "./components/VisualizationPanel/VisualizationPanel";
import { TestPanel } from "./components/TestPanel/TestPanel";
import { initializeSWC } from "./lib/execution/swcInitializer";
import { runTest } from "./lib/testing/testRunner";
import { arrayTests } from "./lib/testing/testCases";
import type { TestCase } from "./lib/testing/types";
import useAppStore from "./store/useAppStore";

function App() {
  const [swcReady, setSwcReady] = useState(false);
  const [swcError, setSwcError] = useState<string | null>(null);

  const { selectedDataStructure, userCode, setTestResult, setCurrentSteps, setVisualizationMode } =
    useAppStore();

  useEffect(() => {
    initializeSWC()
      .then(() => setSwcReady(true))
      .catch((error) => {
        console.error("Failed to initialize SWC:", error);
        setSwcError(error instanceof Error ? error.message : String(error));
      });
  }, []);

  // Get test cases based on selected data structure
  const getTestCases = () => {
    switch (selectedDataStructure) {
      case "array":
        return arrayTests;
      // TODO: Add other data structures
      default:
        return arrayTests;
    }
  };

  const testCases = getTestCases();

  // Handler for running a single test
  const handleRunTest = async (testCase: TestCase) => {
    try {
      const result = await runTest(userCode, testCase);
      setTestResult(testCase.id, result);

      // Update visualization with captured steps (regardless of pass/fail)
      // Even failing tests can show partial visualization of what the code did
      if (result.steps.length > 0) {
        setCurrentSteps(result.steps);
        setVisualizationMode("user-code");
      }
    } catch (error) {
      console.error("Test execution failed:", error);
      setTestResult(testCase.id, {
        testId: testCase.id,
        passed: false,
        error: error instanceof Error ? error.message : String(error),
        executionTime: 0,
        steps: [],
        consoleLogs: [],
      });
    }
  };

  // Handler for running all tests
  const handleRunAllTests = async () => {
    for (const testCase of testCases) {
      await handleRunTest(testCase);
    }
  };

  if (swcError) {
    return (
      <div className="app">
        <header className="app-header">
          <h1>Data Structure Visualizer</h1>
        </header>
        <div style={{ padding: "2rem", color: "red" }}>
          <h2>Initialization Error</h2>
          <p>{swcError}</p>
        </div>
      </div>
    );
  }

  if (!swcReady) {
    return (
      <div className="app">
        <header className="app-header">
          <h1>Data Structure Visualizer</h1>
        </header>
        <div style={{ padding: "2rem" }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Data Structure Visualizer</h1>
      </header>
      <PanelGroup direction="horizontal" className="panels-container">
        <Panel defaultSize={50} minSize={30}>
          <PanelGroup direction="vertical">
            <Panel defaultSize={60} minSize={30}>
              <EditorPanel />
            </Panel>
            <PanelResizeHandle className="resize-handle" />
            <Panel defaultSize={40} minSize={20}>
              <TestPanel
                testCases={testCases}
                onRunTest={handleRunTest}
                onRunAllTests={handleRunAllTests}
              />
            </Panel>
          </PanelGroup>
        </Panel>
        <PanelResizeHandle className="resize-handle" />
        <Panel defaultSize={50} minSize={30}>
          <VisualizationPanel />
        </Panel>
      </PanelGroup>
    </div>
  );
}

export default App;
