import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { RunButton } from "./RunButton";

describe("RunButton", () => {
  it("renders the button with default text", () => {
    const mockOnRunTests = vi.fn(async () => {});
    render(<RunButton onRunTests={mockOnRunTests} />);

    const button = screen.getByRole("button", { name: "Run all tests" });
    expect(button).toBeInTheDocument();
    expect(screen.getByText("Run All Tests")).toBeDefined();
  });

  it("displays running state when isRunning is true", () => {
    const mockOnRunTests = vi.fn(async () => {});
    render(<RunButton onRunTests={mockOnRunTests} isRunning={true} />);

    expect(screen.getByText("Running Tests...")).toBeDefined();
  });

  it("is disabled when disabled prop is true", () => {
    const mockOnRunTests = vi.fn(async () => {});
    render(<RunButton onRunTests={mockOnRunTests} disabled={true} />);

    const button = screen.getByRole("button", { name: "Run all tests" });
    expect(button).toBeDisabled();
  });

  it("is disabled when isRunning is true", () => {
    const mockOnRunTests = vi.fn(async () => {});
    render(<RunButton onRunTests={mockOnRunTests} isRunning={true} />);

    const button = screen.getByRole("button", { name: "Run all tests" });
    expect(button).toBeDisabled();
  });

  it("calls onRunTests when clicked", async () => {
    const mockOnRunTests = vi.fn(async () => {});
    render(<RunButton onRunTests={mockOnRunTests} />);

    const button = screen.getByRole("button", { name: "Run all tests" });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockOnRunTests).toHaveBeenCalledTimes(1);
    });
  });

  it("does not call onRunTests when disabled", () => {
    const mockOnRunTests = vi.fn(async () => {});
    render(<RunButton onRunTests={mockOnRunTests} disabled={true} />);

    const button = screen.getByRole("button", { name: "Run all tests" });
    fireEvent.click(button);

    expect(mockOnRunTests).not.toHaveBeenCalled();
  });

  it("renders play icon", () => {
    const mockOnRunTests = vi.fn(async () => {});
    const { container } = render(<RunButton onRunTests={mockOnRunTests} />);

    const icon = container.querySelector("svg");
    expect(icon).toBeInTheDocument();
  });
});
