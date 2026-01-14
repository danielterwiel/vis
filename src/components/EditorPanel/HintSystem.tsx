import { type TestCase } from "../../lib/testing/types";
import useAppStore from "../../store/useAppStore";
import "./HintSystem.css";

interface HintSystemProps {
  testCase: TestCase | null;
}

/**
 * HintSystem component - Progressive hint revelation for test cases
 *
 * Features:
 * - Shows total hint count and revealed count
 * - Progressive reveal: show revealed hints, hide unrevealed with button
 * - Clicking "Reveal Hint N" increments hintsRevealed in store
 * - Hints displayed in order with numbering
 * - Warning that hints reduce learning effectiveness
 */
export function HintSystem({ testCase }: HintSystemProps) {
  const hintsRevealed = useAppStore((state) => state.hintsRevealed);
  const revealHint = useAppStore((state) => state.revealHint);

  // No test case selected
  if (!testCase) {
    return (
      <div className="hint-system hint-system--empty">
        <h4 className="hint-system__header">Hints</h4>
        <p className="hint-system__empty-message">Select a test case to see hints</p>
      </div>
    );
  }

  // Test case has no hints
  if (!testCase.hints || testCase.hints.length === 0) {
    return (
      <div className="hint-system hint-system--empty">
        <h4 className="hint-system__header">Hints</h4>
        <p className="hint-system__empty-message">No hints available for this test</p>
      </div>
    );
  }

  const totalHints = testCase.hints.length;
  const hasUnrevealedHints = hintsRevealed < totalHints;

  return (
    <div className="hint-system">
      <div className="hint-system__header-section">
        <h4 className="hint-system__header">
          Hints ({hintsRevealed}/{totalHints})
        </h4>
        {hintsRevealed > 0 && (
          <p className="hint-system__warning">
            💡 Try solving without hints for the best learning experience
          </p>
        )}
      </div>

      <div className="hint-system__hints">
        {testCase.hints.map((hint, index) => {
          const isRevealed = index < hintsRevealed;

          if (isRevealed) {
            return (
              <div key={index} className="hint-system__hint hint-system__hint--revealed">
                <div className="hint-system__hint-number">Hint {index + 1}</div>
                <div className="hint-system__hint-text">{hint}</div>
              </div>
            );
          }

          // Show button for next unrevealed hint only
          if (index === hintsRevealed) {
            return (
              <div key={index} className="hint-system__hint hint-system__hint--hidden">
                <button className="hint-system__reveal-button" onClick={revealHint} type="button">
                  Reveal Hint {index + 1}
                </button>
              </div>
            );
          }

          // Don't show future hints at all
          return null;
        })}

        {!hasUnrevealedHints && (
          <div className="hint-system__complete">
            All hints revealed. Try implementing the solution!
          </div>
        )}
      </div>
    </div>
  );
}
