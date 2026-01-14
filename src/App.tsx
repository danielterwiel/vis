import { useEffect, useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import EditorPanel from "./components/EditorPanel/EditorPanel";
import VisualizationPanel from "./components/VisualizationPanel/VisualizationPanel";
import { initializeSWC } from "./lib/execution/swcInitializer";

function App() {
  const [swcReady, setSwcReady] = useState(false);
  const [swcError, setSwcError] = useState<string | null>(null);

  useEffect(() => {
    initializeSWC()
      .then(() => setSwcReady(true))
      .catch((error) => {
        console.error("Failed to initialize SWC:", error);
        setSwcError(error instanceof Error ? error.message : String(error));
      });
  }, []);

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
          <EditorPanel />
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
