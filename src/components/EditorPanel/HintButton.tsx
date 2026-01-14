import { useState } from "react";
import { IconBulb } from "@tabler/icons-react";
import { type TestCase } from "../../lib/testing/types";
import { HintModal } from "./HintModal";
import useAppStore from "../../store/useAppStore";
import "./HintButton.css";

interface HintButtonProps {
  testCase: TestCase | null;
}

/**
 * HintButton component - Icon button that opens hints modal
 *
 * Features:
 * - Positioned absolutely in top-right of editor
 * - Uses Tabler IconBulb
 * - Shows hint count badge
 * - Opens HintModal on click
 * - Disabled when no test case selected
 */
export function HintButton({ testCase }: HintButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const hintsRevealed = useAppStore((state) => state.hintsRevealed);

  const handleClick = () => {
    if (testCase) {
      setIsModalOpen(true);
    }
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };

  const totalHints = testCase?.hints?.length || 0;
  const hasHints = totalHints > 0;

  return (
    <>
      <button
        className="hint-button"
        onClick={handleClick}
        disabled={!testCase || !hasHints}
        aria-label="Show hints"
        title={hasHints ? `Hints (${hintsRevealed}/${totalHints})` : "No hints available"}
        type="button"
      >
        <IconBulb size={20} />
        {hasHints && (
          <span className="hint-button__badge">
            {hintsRevealed}/{totalHints}
          </span>
        )}
      </button>

      {testCase && isModalOpen && (
        <HintModal testCase={testCase} isOpen={isModalOpen} onClose={handleClose} />
      )}
    </>
  );
}
