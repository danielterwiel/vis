import { useEffect, useRef, useCallback } from "react";
import { EditorView, basicSetup } from "codemirror";
import { Decoration, type DecorationSet } from "@codemirror/view";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorState, StateField, StateEffect } from "@codemirror/state";

// Effect to set the highlighted line (1-indexed, null to clear)
const setHighlightedLineEffect = StateEffect.define<number | null>();

// Line highlight decoration
const lineHighlightMark = Decoration.line({
  attributes: { class: "cm-highlighted-line" },
});

// StateField to track highlighted line decorations
const highlightField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },
  update(decorations, tr) {
    for (const effect of tr.effects) {
      if (effect.is(setHighlightedLineEffect)) {
        const lineNumber = effect.value;
        if (lineNumber === null || lineNumber < 1 || lineNumber > tr.state.doc.lines) {
          return Decoration.none;
        }
        const line = tr.state.doc.line(lineNumber);
        return Decoration.set([lineHighlightMark.range(line.from)]);
      }
    }
    return decorations.map(tr.changes);
  },
  provide: (f) => EditorView.decorations.from(f),
});

// Theme for highlighted line - bright yellow highlight visible on dark theme
const highlightTheme = EditorView.baseTheme({
  ".cm-highlighted-line": {
    backgroundColor: "rgba(255, 213, 0, 0.4) !important", // Brighter yellow, more opaque
    borderLeft: "3px solid #ffd500 !important", // Left border for extra visibility
    transition: "background-color 0.2s ease-out",
  },
});

interface CodeMirrorEditorProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  highlightedLine?: number | null;
}

export function CodeMirrorEditor({
  value,
  onChange,
  readOnly = false,
  highlightedLine = null,
}: CodeMirrorEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const fadeTimeoutRef = useRef<number | null>(null);

  // Highlight a specific line with fade effect
  const highlightLine = useCallback((lineNumber: number | null) => {
    const view = viewRef.current;
    if (!view) return;

    // Clear any pending fade timeout
    if (fadeTimeoutRef.current !== null) {
      clearTimeout(fadeTimeoutRef.current);
      fadeTimeoutRef.current = null;
    }

    // Apply the highlight
    view.dispatch({
      effects: setHighlightedLineEffect.of(lineNumber),
    });

    // Keep highlight visible for the step duration (animation interval is 800ms)
    // Fade after 700ms so highlight is visible almost the entire step
    if (lineNumber !== null) {
      fadeTimeoutRef.current = window.setTimeout(() => {
        view.dispatch({
          effects: setHighlightedLineEffect.of(null),
        });
        fadeTimeoutRef.current = null;
      }, 700);
    }
  }, []);

  useEffect(() => {
    if (!editorRef.current) return;

    const startState = EditorState.create({
      doc: value,
      extensions: [
        basicSetup,
        javascript(),
        oneDark,
        highlightField,
        highlightTheme,
        EditorView.editable.of(!readOnly),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const newValue = update.state.doc.toString();
            onChange(newValue);
          }
        }),
      ],
    });

    const view = new EditorView({
      state: startState,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      if (fadeTimeoutRef.current !== null) {
        clearTimeout(fadeTimeoutRef.current);
      }
      view.destroy();
      viewRef.current = null;
    };
  }, []); // Only create once on mount

  // Handle external value changes
  useEffect(() => {
    if (viewRef.current) {
      const currentValue = viewRef.current.state.doc.toString();
      if (currentValue !== value) {
        viewRef.current.dispatch({
          changes: {
            from: 0,
            to: currentValue.length,
            insert: value,
          },
        });
      }
    }
  }, [value]);

  // Handle highlighted line changes
  useEffect(() => {
    highlightLine(highlightedLine ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- highlightLine is stable (useCallback with [])
  }, [highlightedLine]);

  return <div ref={editorRef} className="codemirror-wrapper" />;
}
