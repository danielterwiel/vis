/**
 * Preset Algorithm Selector Component
 * Allows users to load pre-written algorithm examples
 */

import { useState } from "react";
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

  const presets = getPresetsForDataStructure(dataStructure);
  const categories = getCategoriesForDataStructure(dataStructure);

  if (presets.length === 0) {
    return null;
  }

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
    }
  };

  return (
    <div className="preset-selector">
      <button
        className="preset-selector-trigger"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        title="Load algorithm examples"
      >
        Examples
      </button>

      {isOpen && (
        <>
          <div className="preset-backdrop" onClick={() => setIsOpen(false)} />
          <div className="preset-modal">
            <div className="preset-modal-header">
              <h3>Algorithm Examples</h3>
              <button className="preset-close" onClick={() => setIsOpen(false)} aria-label="Close">
                ×
              </button>
            </div>

            <div className="preset-categories">
              <button
                className={selectedCategory === null ? "active" : ""}
                onClick={() => setSelectedCategory(null)}
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
                  >
                    {category.name} ({count})
                  </button>
                );
              })}
            </div>

            <div className="preset-list">
              {filteredPresets.map((preset) => (
                <div
                  key={preset.id}
                  className="preset-card"
                  onClick={() => handlePresetClick(preset)}
                >
                  <div className="preset-card-header">
                    <h4>{preset.name}</h4>
                    <div className="preset-card-meta">
                      {preset.timeComplexity && (
                        <span className="complexity-badge time">{preset.timeComplexity}</span>
                      )}
                      {preset.spaceComplexity && (
                        <span className="complexity-badge space">{preset.spaceComplexity}</span>
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
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
