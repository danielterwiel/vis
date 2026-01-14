import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import EditorPanel from "./EditorPanel";

describe("EditorPanel", () => {
  it("renders the editor panel", () => {
    render(<EditorPanel />);
    expect(screen.getByText("Editor")).toBeDefined();
  });

  it("renders CodeMirrorEditor component", () => {
    const { container } = render(<EditorPanel />);
    expect(container.querySelector(".codemirror-wrapper")).toBeInTheDocument();
  });
});
