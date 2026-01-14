import { IconX } from "@tabler/icons-react";
import { type TestCase } from "../../lib/testing/types";
import useAppStore from "../../store/useAppStore";
import "./HintModal.css";

interface HintModalProps {
  testCase: TestCase;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * HintModal component - Modal dialog for progressive hint reveal
 *
 * Features:
 * - Modal dialog triggered by hints icon button in editor panel
 * - Shows total hints and number revealed
 * - Progressive reveal with "Reveal Hint N" buttons
 * - Close button with Tabler icon
 * - Dismissible by clicking backdrop or close button
 */
export function HintModal({ testCase, isOpen, onClose }: HintModalProps) {
  const hintsRevealed = useAppStore((state) => state.hintsRevealed);
  const revealHint = useAppStore((state) => state.revealHint);

  if (!isOpen) return null;

  const totalHints = testCase.hints?.length || 0;

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="hint-modal-backdrop" onClick={handleBackdropClick}>
      <dialog open className="hint-modal">
        <header className="hint-modal__header">
          <h3 className="hint-modal__title">
            Hints ({hintsRevealed}/{totalHints})
          </h3>
          <button
            className="hint-modal__close-button"
            onClick={onClose}
            aria-label="Close hints"
            type="button"
          >
            <IconX size={20} />
          </button>
        </header>

        <div className="hint-modal__content">
          {totalHints === 0 ? (
            <p className="hint-modal__empty">No hints available for this test case.</p>
          ) : (
            <div className="hint-modal__hints">
              {testCase.hints.map((hint, index) => {
                const isRevealed = index < hintsRevealed;

                return (
                  <div key={index} className="hint-modal__hint">
                    {isRevealed ? (
                      <div className="hint-modal__hint-revealed">
                        <div className="hint-modal__hint-number">Hint {index + 1}</div>
                        <p className="hint-modal__hint-text">{hint}</p>
                      </div>
                    ) : index === hintsRevealed ? (
                      <button
                        className="hint-modal__reveal-button"
                        onClick={revealHint}
                        type="button"
                      >
                        Reveal Hint {index + 1}
                      </button>
                    ) : null}
                  </div>
                );
              })}

              {hintsRevealed === totalHints && (
                <div className="hint-modal__complete">
                  All hints revealed. Try implementing the solution!
                </div>
              )}
            </div>
          )}
        </div>
      </dialog>
    </div>
  );
}
