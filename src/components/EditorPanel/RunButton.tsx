import IconPlayerPlay from "@tabler/icons-react/dist/esm/icons/IconPlayerPlay.mjs";
import "./RunButton.css";

interface RunButtonProps {
  onRunTests: () => Promise<void>;
  disabled?: boolean;
  isRunning?: boolean;
}

export function RunButton({ onRunTests, disabled = false, isRunning = false }: RunButtonProps) {
  return (
    <button
      className="run-tests-button"
      onClick={onRunTests}
      disabled={disabled || isRunning}
      aria-label="Run all tests"
    >
      <IconPlayerPlay size={20} />
      {isRunning ? "Running Tests..." : "Run All Tests"}
    </button>
  );
}
