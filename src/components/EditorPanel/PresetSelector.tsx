/**
 * Preset Algorithm Selector Component
 * Allows users to load pre-written algorithm examples
 */

import { useState, useEffect, useRef } from "react";
import IconCode from "@tabler/icons-react/dist/esm/icons/IconCode.mjs";
import IconX from "@tabler/icons-react/dist/esm/icons/IconX.mjs";
import {
  getPresetsForDataStructure,
  getCategoriesForDataStructure,
  type PresetExample,
} from "../../lib/presets";
import type { DataStructureType } from "../../store/useAppStore";
import "./PresetSelector.css";

interface PresetSelectorProps {
  dataStructure: DataStructureType;
  onSelectPreset: (code: string) => void;
  disabled?: boolean;
}

export function PresetSelector({
  dataStructure,
  onSelectPreset,
  disabled = false,
}: PresetSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const presets = getPresetsForDataStructure(dataStructure);
  const categories = getCategoriesForDataStructure(dataStructure);

  const filteredPresets = selectedCategory
    ? presets.filter((p) => p.category === selectedCategory)
    : presets;

  const handlePresetClick = (preset: PresetExample) => {
    // Confirm before replacing user's code
    const confirmed = window.confirm(
      `Load "${preset.name}" example?\n\nThis will replace your current code.`,
    );

    if (confirmed) {
      onSelectPreset(preset.code);
      setIsOpen(false);
      setSelectedCategory(null); // Reset category filter on close
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedCategory(null); // Reset category filter on close
  };

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Focus the modal for accessibility
      modalRef.current?.focus();
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Move conditional return after all hooks
  if (presets.length === 0) {
    return null;
  }

  return (
    <div className="preset-selector">
      <button
        className="preset-selector-trigger"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        title="Load algorithm examples"
        aria-label="Load algorithm examples"
      >
        <IconCode size={18} />
        Examples
      </button>

      {isOpen && (
        <>
          <div className="preset-backdrop" onClick={handleClose} role="presentation" />
          <div
            ref={modalRef}
            className="preset-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="preset-modal-title"
            tabIndex={-1}
          >
            <div className="preset-modal-header">
              <h3 id="preset-modal-title">Algorithm Examples</h3>
              <button
                className="preset-close"
                onClick={handleClose}
                aria-label="Close examples dialog"
                title="Close (ESC)"
              >
                <IconX size={20} />
              </button>
            </div>

            {categories.length > 0 && (
              <div className="preset-categories">
                <button
                  className={selectedCategory === null ? "active" : ""}
                  onClick={() => setSelectedCategory(null)}
                  aria-pressed={selectedCategory === null}
                >
                  All ({presets.length})
                </button>
                {categories.map((category) => {
                  const count = presets.filter((p) => p.category === category.id).length;
                  return (
                    <button
                      key={category.id}
                      className={selectedCategory === category.id ? "active" : ""}
                      onClick={() => setSelectedCategory(category.id)}
                      aria-pressed={selectedCategory === category.id}
                    >
                      {category.name} ({count})
                    </button>
                  );
                })}
              </div>
            )}

            <div className="preset-list">
              {filteredPresets.length > 0 ? (
                filteredPresets.map((preset) => (
                  <button
                    key={preset.id}
                    className="preset-card"
                    onClick={() => handlePresetClick(preset)}
                    aria-label={`Load ${preset.name} example`}
                  >
                    <div className="preset-card-header">
                      <h4>{preset.name}</h4>
                      <div className="preset-card-meta">
                        {preset.timeComplexity && (
                          <span
                            className="complexity-badge time"
                            aria-label={`Time complexity: ${preset.timeComplexity}`}
                          >
                            {preset.timeComplexity}
                          </span>
                        )}
                        {preset.spaceComplexity && (
                          <span
                            className="complexity-badge space"
                            aria-label={`Space complexity: ${preset.spaceComplexity}`}
                          >
                            {preset.spaceComplexity}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="preset-card-description">{preset.description}</p>
                    {preset.tags && preset.tags.length > 0 && (
                      <div className="preset-tags">
                        {preset.tags.map((tag) => (
                          <span key={tag} className="preset-tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                ))
              ) : (
                <div className="preset-empty-state">
                  <p>No examples found in this category.</p>
                  <button onClick={() => setSelectedCategory(null)}>View all examples</button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
