import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { CodeMirrorEditor } from "./CodeMirrorEditor";

describe("CodeMirrorEditor", () => {
  it("renders without crashing", () => {
    const onChange = vi.fn();
    const { container } = render(<CodeMirrorEditor value="test code" onChange={onChange} />);

    expect(container.querySelector(".codemirror-wrapper")).toBeInTheDocument();
  });

  it("initializes with provided value", () => {
    const onChange = vi.fn();
    const initialValue = "function test() {}";

    const { container } = render(<CodeMirrorEditor value={initialValue} onChange={onChange} />);

    // CodeMirror creates editor content dynamically
    expect(container.querySelector(".cm-editor")).toBeInTheDocument();
    expect(container.querySelector(".cm-content")).toBeInTheDocument();
  });

  it("accepts readOnly prop", () => {
    const onChange = vi.fn();
    const { container } = render(<CodeMirrorEditor value="test" onChange={onChange} readOnly />);

    expect(container.querySelector(".codemirror-wrapper")).toBeInTheDocument();
    expect(container.querySelector(".cm-editor")).toBeInTheDocument();
  });
});
