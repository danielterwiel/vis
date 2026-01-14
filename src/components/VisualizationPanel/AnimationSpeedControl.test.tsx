import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AnimationSpeedControl } from "./AnimationSpeedControl";

describe("AnimationSpeedControl", () => {
  describe("Rendering", () => {
    it("renders the speed label", () => {
      render(<AnimationSpeedControl speed={1} onSpeedChange={vi.fn()} />);

      expect(screen.getByText("Speed:")).toBeInTheDocument();
    });

    it("renders all speed buttons", () => {
      render(<AnimationSpeedControl speed={1} onSpeedChange={vi.fn()} />);

      expect(screen.getByRole("button", { name: "0.25×" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "0.5×" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "1×" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "1.5×" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "2×" })).toBeInTheDocument();
    });

    it("displays the correct button labels", () => {
      render(<AnimationSpeedControl speed={1} onSpeedChange={vi.fn()} />);

      expect(screen.getByText("0.25×")).toBeInTheDocument();
      expect(screen.getByText("0.5×")).toBeInTheDocument();
      expect(screen.getByText("1×")).toBeInTheDocument();
      expect(screen.getByText("1.5×")).toBeInTheDocument();
      expect(screen.getByText("2×")).toBeInTheDocument();
    });
  });

  describe("Active State", () => {
    it("highlights the active speed button (1x)", () => {
      render(<AnimationSpeedControl speed={1} onSpeedChange={vi.fn()} />);

      const button1x = screen.getByRole("button", { name: "1×" });
      expect(button1x).toHaveClass("active");
    });

    it("highlights the active speed button (0.5x)", () => {
      render(<AnimationSpeedControl speed={0.5} onSpeedChange={vi.fn()} />);

      const button05x = screen.getByRole("button", { name: "0.5×" });
      expect(button05x).toHaveClass("active");
    });

    it("highlights the active speed button (2x)", () => {
      render(<AnimationSpeedControl speed={2} onSpeedChange={vi.fn()} />);

      const button2x = screen.getByRole("button", { name: "2×" });
      expect(button2x).toHaveClass("active");
    });

    it("only highlights one button at a time", () => {
      render(<AnimationSpeedControl speed={1.5} onSpeedChange={vi.fn()} />);

      const activeButtons = screen
        .getAllByRole("button")
        .filter((btn) => btn.classList.contains("active"));

      expect(activeButtons).toHaveLength(1);
      expect(activeButtons[0]).toHaveTextContent("1.5×");
    });
  });

  describe("User Interactions", () => {
    it("calls onSpeedChange when a button is clicked", async () => {
      const user = userEvent.setup();
      const onSpeedChange = vi.fn();

      render(<AnimationSpeedControl speed={1} onSpeedChange={onSpeedChange} />);

      const button2x = screen.getByRole("button", { name: "2×" });
      await user.click(button2x);

      expect(onSpeedChange).toHaveBeenCalledTimes(1);
      expect(onSpeedChange).toHaveBeenCalledWith(2);
    });

    it("calls onSpeedChange with correct value for 0.25x", async () => {
      const user = userEvent.setup();
      const onSpeedChange = vi.fn();

      render(<AnimationSpeedControl speed={1} onSpeedChange={onSpeedChange} />);

      const button025x = screen.getByRole("button", { name: "0.25×" });
      await user.click(button025x);

      expect(onSpeedChange).toHaveBeenCalledWith(0.25);
    });

    it("calls onSpeedChange with correct value for 0.5x", async () => {
      const user = userEvent.setup();
      const onSpeedChange = vi.fn();

      render(<AnimationSpeedControl speed={1} onSpeedChange={onSpeedChange} />);

      const button05x = screen.getByRole("button", { name: "0.5×" });
      await user.click(button05x);

      expect(onSpeedChange).toHaveBeenCalledWith(0.5);
    });

    it("calls onSpeedChange with correct value for 1.5x", async () => {
      const user = userEvent.setup();
      const onSpeedChange = vi.fn();

      render(<AnimationSpeedControl speed={1} onSpeedChange={onSpeedChange} />);

      const button15x = screen.getByRole("button", { name: "1.5×" });
      await user.click(button15x);

      expect(onSpeedChange).toHaveBeenCalledWith(1.5);
    });

    it("allows clicking the currently active button", async () => {
      const user = userEvent.setup();
      const onSpeedChange = vi.fn();

      render(<AnimationSpeedControl speed={1} onSpeedChange={onSpeedChange} />);

      const button1x = screen.getByRole("button", { name: "1×" });
      await user.click(button1x);

      expect(onSpeedChange).toHaveBeenCalledTimes(1);
      expect(onSpeedChange).toHaveBeenCalledWith(1);
    });
  });

  describe("Disabled State", () => {
    it("disables all buttons when disabled prop is true", () => {
      render(<AnimationSpeedControl speed={1} onSpeedChange={vi.fn()} disabled={true} />);

      const buttons = screen.getAllByRole("button");
      buttons.forEach((button) => {
        expect(button).toBeDisabled();
      });
    });

    it("enables all buttons when disabled prop is false", () => {
      render(<AnimationSpeedControl speed={1} onSpeedChange={vi.fn()} disabled={false} />);

      const buttons = screen.getAllByRole("button");
      buttons.forEach((button) => {
        expect(button).not.toBeDisabled();
      });
    });

    it("enables all buttons by default (disabled not specified)", () => {
      render(<AnimationSpeedControl speed={1} onSpeedChange={vi.fn()} />);

      const buttons = screen.getAllByRole("button");
      buttons.forEach((button) => {
        expect(button).not.toBeDisabled();
      });
    });

    it("does not call onSpeedChange when disabled button is clicked", async () => {
      const user = userEvent.setup();
      const onSpeedChange = vi.fn();

      render(<AnimationSpeedControl speed={1} onSpeedChange={onSpeedChange} disabled={true} />);

      const button2x = screen.getByRole("button", { name: "2×" });
      await user.click(button2x);

      expect(onSpeedChange).not.toHaveBeenCalled();
    });
  });

  describe("Accessibility", () => {
    it("has proper labels for screen readers", () => {
      render(<AnimationSpeedControl speed={1} onSpeedChange={vi.fn()} />);

      expect(screen.getByRole("button", { name: "0.25×" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "0.5×" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "1×" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "1.5×" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "2×" })).toBeInTheDocument();
    });

    it("associates label with controls", () => {
      render(<AnimationSpeedControl speed={1} onSpeedChange={vi.fn()} />);

      const label = screen.getByText("Speed:");
      expect(label).toHaveAttribute("for", "animation-speed-slider");
    });
  });

  describe("CSS Classes", () => {
    it("applies speed-button class to all buttons", () => {
      render(<AnimationSpeedControl speed={1} onSpeedChange={vi.fn()} />);

      const buttons = screen.getAllByRole("button");
      buttons.forEach((button) => {
        expect(button).toHaveClass("speed-button");
      });
    });

    it("applies active class only to the current speed button", () => {
      render(<AnimationSpeedControl speed={1} onSpeedChange={vi.fn()} />);

      const button1x = screen.getByRole("button", { name: "1×" });
      const button2x = screen.getByRole("button", { name: "2×" });

      expect(button1x).toHaveClass("active");
      expect(button2x).not.toHaveClass("active");
    });
  });

  describe("Edge Cases", () => {
    it("handles non-standard speed values gracefully (no button highlighted)", () => {
      render(<AnimationSpeedControl speed={3} onSpeedChange={vi.fn()} />);

      const activeButtons = screen
        .getAllByRole("button")
        .filter((btn) => btn.classList.contains("active"));

      expect(activeButtons).toHaveLength(0);
    });

    it("handles decimal speed values that match button values", () => {
      render(<AnimationSpeedControl speed={0.25} onSpeedChange={vi.fn()} />);

      const button025x = screen.getByRole("button", { name: "0.25×" });
      expect(button025x).toHaveClass("active");
    });

    it("renders correctly with all speed options", () => {
      const { container } = render(<AnimationSpeedControl speed={1} onSpeedChange={vi.fn()} />);

      expect(container.querySelector(".animation-speed-control")).toBeInTheDocument();
      expect(container.querySelector(".speed-label")).toBeInTheDocument();
      expect(container.querySelector(".speed-buttons")).toBeInTheDocument();
      expect(container.querySelectorAll(".speed-button")).toHaveLength(5);
    });
  });
});
