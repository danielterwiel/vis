import { useState, useRef, useEffect } from "react";
import type { DifficultyLevel } from "../../store/useAppStore";

interface SolutionDropdownProps {
  disabled: boolean;
  onSelectSolution: (difficulty: DifficultyLevel) => void;
}

const DIFFICULTY_OPTIONS: { value: DifficultyLevel; label: string }[] = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

export function SolutionDropdown({ disabled, onSelectSolution }: SolutionDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleSelect = (difficulty: DifficultyLevel) => {
    setIsOpen(false);
    onSelectSolution(difficulty);
  };

  return (
    <div className="solution-dropdown" ref={dropdownRef}>
      <button
        className="show-solution-button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        title="Reveal a reference solution"
      >
        Show Solution
        <span className="dropdown-arrow">{isOpen ? "▲" : "▼"}</span>
      </button>
      {isOpen && (
        <div className="solution-dropdown-menu">
          {DIFFICULTY_OPTIONS.map((option) => (
            <button
              key={option.value}
              className="solution-dropdown-item"
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
