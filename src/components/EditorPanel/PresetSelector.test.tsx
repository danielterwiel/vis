/**
 * Tests for PresetSelector component
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PresetSelector } from "./PresetSelector";

describe("PresetSelector", () => {
  const mockOnSelectPreset = vi.fn();

  beforeEach(() => {
    mockOnSelectPreset.mockClear();
  });

  it("should render trigger button", () => {
    render(<PresetSelector dataStructure="array" onSelectPreset={mockOnSelectPreset} />);

    const button = screen.getByText("Examples");
    expect(button).toBeTruthy();
  });

  it("should not render if no presets available", () => {
    const { container } = render(
      <PresetSelector dataStructure={"unknown" as any} onSelectPreset={mockOnSelectPreset} />,
    );

    expect(container.firstChild).toBeNull();
  });

  it("should show modal when trigger button clicked", () => {
    render(<PresetSelector dataStructure="array" onSelectPreset={mockOnSelectPreset} />);

    const button = screen.getByText("Examples");
    fireEvent.click(button);

    const modal = screen.getByText("Algorithm Examples");
    expect(modal).toBeTruthy();
  });

  it("should display presets for selected data structure", () => {
    render(<PresetSelector dataStructure="array" onSelectPreset={mockOnSelectPreset} />);

    fireEvent.click(screen.getByText("Examples"));

    expect(screen.getByText("Bubble Sort")).toBeTruthy();
    expect(screen.getByText("Quick Sort")).toBeTruthy();
    expect(screen.getByText("Binary Search")).toBeTruthy();
  });

  it("should display categories", () => {
    render(<PresetSelector dataStructure="array" onSelectPreset={mockOnSelectPreset} />);

    fireEvent.click(screen.getByText("Examples"));

    const allButton = screen.getByText(/All \(\d+\)/);
    expect(allButton).toBeTruthy();

    const sortingButton = screen.getByText(/Sorting \(\d+\)/);
    expect(sortingButton).toBeTruthy();
  });

  it("should filter presets by category", () => {
    render(<PresetSelector dataStructure="array" onSelectPreset={mockOnSelectPreset} />);

    fireEvent.click(screen.getByText("Examples"));

    const sortingButton = screen.getByText(/Sorting \(\d+\)/);
    fireEvent.click(sortingButton);

    expect(screen.getByText("Bubble Sort")).toBeTruthy();
    expect(screen.getByText("Quick Sort")).toBeTruthy();
  });

  it("should show complexity badges", () => {
    render(<PresetSelector dataStructure="array" onSelectPreset={mockOnSelectPreset} />);

    fireEvent.click(screen.getByText("Examples"));

    const complexity = screen.getByText(/O\(n²\)/);
    expect(complexity).toBeTruthy();
  });

  it("should close modal when backdrop clicked", () => {
    render(<PresetSelector dataStructure="array" onSelectPreset={mockOnSelectPreset} />);

    fireEvent.click(screen.getByText("Examples"));
    expect(screen.getByText("Algorithm Examples")).toBeTruthy();

    const backdrop = document.querySelector(".preset-backdrop");
    if (backdrop) {
      fireEvent.click(backdrop);
    }

    expect(screen.queryByText("Algorithm Examples")).toBeNull();
  });

  it("should close modal when close button clicked", () => {
    render(<PresetSelector dataStructure="array" onSelectPreset={mockOnSelectPreset} />);

    fireEvent.click(screen.getByText("Examples"));
    expect(screen.getByText("Algorithm Examples")).toBeTruthy();

    const closeButton = screen.getByLabelText("Close examples dialog");
    fireEvent.click(closeButton);

    expect(screen.queryByText("Algorithm Examples")).toBeNull();
  });

  it("should be disabled when disabled prop is true", () => {
    render(
      <PresetSelector dataStructure="array" onSelectPreset={mockOnSelectPreset} disabled={true} />,
    );

    const button = screen.getByText("Examples") as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it("should call onSelectPreset when preset clicked and confirmed", () => {
    // Mock window.confirm to return true
    const originalConfirm = window.confirm;
    window.confirm = vi.fn(() => true);

    render(<PresetSelector dataStructure="array" onSelectPreset={mockOnSelectPreset} />);

    fireEvent.click(screen.getByText("Examples"));
    fireEvent.click(screen.getByText("Bubble Sort"));

    expect(mockOnSelectPreset).toHaveBeenCalledWith(expect.stringContaining("bubbleSort"));

    // Restore original confirm
    window.confirm = originalConfirm;
  });

  it("should close modal when preset is selected and confirmed", () => {
    // Mock window.confirm to return true
    const originalConfirm = window.confirm;
    window.confirm = vi.fn(() => true);

    render(<PresetSelector dataStructure="array" onSelectPreset={mockOnSelectPreset} />);

    // Open modal
    fireEvent.click(screen.getByText("Examples"));
    expect(screen.getByText("Algorithm Examples")).toBeTruthy();

    // Click a preset
    fireEvent.click(screen.getByText("Bubble Sort"));

    // Modal should be closed
    expect(screen.queryByText("Algorithm Examples")).toBeNull();

    // Restore original confirm
    window.confirm = originalConfirm;
  });

  it("should not call onSelectPreset when preset clicked but not confirmed", () => {
    // Mock window.confirm to return false
    const originalConfirm = window.confirm;
    window.confirm = vi.fn(() => false);

    render(<PresetSelector dataStructure="array" onSelectPreset={mockOnSelectPreset} />);

    fireEvent.click(screen.getByText("Examples"));
    fireEvent.click(screen.getByText("Bubble Sort"));

    expect(mockOnSelectPreset).not.toHaveBeenCalled();

    // Restore original confirm
    window.confirm = originalConfirm;
  });

  it("should display preset tags", () => {
    render(<PresetSelector dataStructure="array" onSelectPreset={mockOnSelectPreset} />);

    fireEvent.click(screen.getByText("Examples"));

    const tags = document.querySelectorAll(".preset-tag");
    expect(tags.length).toBeGreaterThan(0);
  });

  it("should show correct count in category buttons", () => {
    render(<PresetSelector dataStructure="array" onSelectPreset={mockOnSelectPreset} />);

    fireEvent.click(screen.getByText("Examples"));

    const allButton = screen.getByText(/All \(\d+\)/);
    const match = allButton.textContent?.match(/\((\d+)\)/);

    expect(match).toBeTruthy();
    if (match && match[1]) {
      const count = parseInt(match[1], 10);
      expect(count).toBeGreaterThan(0);
    }
  });

  it("should close modal when ESC key is pressed", () => {
    render(<PresetSelector dataStructure="array" onSelectPreset={mockOnSelectPreset} />);

    fireEvent.click(screen.getByText("Examples"));
    expect(screen.getByText("Algorithm Examples")).toBeTruthy();

    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByText("Algorithm Examples")).toBeNull();
  });

  it("should have proper ARIA attributes for accessibility", () => {
    render(<PresetSelector dataStructure="array" onSelectPreset={mockOnSelectPreset} />);

    fireEvent.click(screen.getByText("Examples"));

    const modal = screen.getByRole("dialog");
    expect(modal).toBeTruthy();
    expect(modal.getAttribute("aria-modal")).toBe("true");
    expect(modal.getAttribute("aria-labelledby")).toBe("preset-modal-title");
  });

  it("should reset category filter when modal is closed", () => {
    render(<PresetSelector dataStructure="array" onSelectPreset={mockOnSelectPreset} />);

    // Open modal
    fireEvent.click(screen.getByText("Examples"));

    // Select a category
    const sortingButton = screen.getByText(/Sorting \(\d+\)/);
    fireEvent.click(sortingButton);
    expect(sortingButton.className).toContain("active");

    // Close modal
    const closeButton = screen.getByLabelText("Close examples dialog");
    fireEvent.click(closeButton);

    // Reopen modal
    fireEvent.click(screen.getByText("Examples"));

    // Check that "All" is selected again
    const allButton = screen.getByText(/All \(\d+\)/);
    expect(allButton.className).toContain("active");
  });

  it("should render preset cards as buttons for accessibility", () => {
    render(<PresetSelector dataStructure="array" onSelectPreset={mockOnSelectPreset} />);

    fireEvent.click(screen.getByText("Examples"));

    const presetCard = screen.getByLabelText(/Load Bubble Sort example/);
    expect(presetCard.tagName).toBe("BUTTON");
  });
});
