import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import EditorPanel from "./components/EditorPanel/EditorPanel";
import VisualizationPanel from "./components/VisualizationPanel/VisualizationPanel";

function App() {
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
