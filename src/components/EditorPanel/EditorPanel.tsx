import { useState } from "react";
import { CodeMirrorEditor } from "./CodeMirrorEditor";

function EditorPanel() {
  const [code, setCode] = useState(`// Write your code here
function example() {
  console.log("Hello, World!");
}

example();`);

  return (
    <div className="editor-panel">
      <div className="editor-header">
        <h2>Editor</h2>
      </div>
      <CodeMirrorEditor value={code} onChange={setCode} />
    </div>
  );
}

export default EditorPanel;
