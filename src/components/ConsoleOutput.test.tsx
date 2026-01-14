import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConsoleOutput } from "./ConsoleOutput";

describe("ConsoleOutput", () => {
  describe("Rendering", () => {
    it("should render the component with header", () => {
      render(<ConsoleOutput logs={[]} />);
      expect(screen.getByText("Console Output")).toBeInTheDocument();
    });

    it("should show empty state when no logs", () => {
      render(<ConsoleOutput logs={[]} />);
      expect(screen.getByText("No console output yet")).toBeInTheDocument();
    });

    it("should not show clear button when no logs", () => {
      render(<ConsoleOutput logs={[]} />);
      expect(screen.queryByRole("button", { name: /clear/i })).not.toBeInTheDocument();
    });

    it("should show clear button when logs exist", () => {
      const logs = [{ level: "log" as const, args: ["test"], timestamp: Date.now() }];
      render(<ConsoleOutput logs={logs} />);
      expect(screen.getByRole("button", { name: /clear/i })).toBeInTheDocument();
    });
  });

  describe("Log Display", () => {
    it("should display a single log message", () => {
      const logs = [{ level: "log" as const, args: ["Hello, world!"], timestamp: Date.now() }];
      render(<ConsoleOutput logs={logs} />);
      expect(screen.getByText("Hello, world!")).toBeInTheDocument();
      expect(screen.getByText("LOG")).toBeInTheDocument();
    });

    it("should display multiple log messages", () => {
      const logs = [
        { level: "log" as const, args: ["Message 1"], timestamp: Date.now() },
        { level: "warn" as const, args: ["Message 2"], timestamp: Date.now() },
        { level: "error" as const, args: ["Message 3"], timestamp: Date.now() },
      ];
      render(<ConsoleOutput logs={logs} />);
      expect(screen.getByText("Message 1")).toBeInTheDocument();
      expect(screen.getByText("Message 2")).toBeInTheDocument();
      expect(screen.getByText("Message 3")).toBeInTheDocument();
    });

    it("should display all log levels with correct styling", () => {
      const logs = [
        { level: "log" as const, args: ["Log level"], timestamp: Date.now() },
        { level: "warn" as const, args: ["Warn level"], timestamp: Date.now() },
        { level: "error" as const, args: ["Error level"], timestamp: Date.now() },
        { level: "info" as const, args: ["Info level"], timestamp: Date.now() },
      ];
      render(<ConsoleOutput logs={logs} />);
      expect(screen.getByText("LOG")).toBeInTheDocument();
      expect(screen.getByText("WARN")).toBeInTheDocument();
      expect(screen.getByText("ERROR")).toBeInTheDocument();
      expect(screen.getByText("INFO")).toBeInTheDocument();
    });
  });

  describe("Argument Formatting", () => {
    it("should format string arguments", () => {
      const logs = [{ level: "log" as const, args: ["Test string"], timestamp: Date.now() }];
      render(<ConsoleOutput logs={logs} />);
      expect(screen.getByText("Test string")).toBeInTheDocument();
    });

    it("should format number arguments", () => {
      const logs = [{ level: "log" as const, args: [42], timestamp: Date.now() }];
      render(<ConsoleOutput logs={logs} />);
      expect(screen.getByText("42")).toBeInTheDocument();
    });

    it("should format boolean arguments", () => {
      const logs = [{ level: "log" as const, args: [true], timestamp: Date.now() }];
      render(<ConsoleOutput logs={logs} />);
      expect(screen.getByText("true")).toBeInTheDocument();
    });

    it("should format null and undefined", () => {
      const logs = [
        { level: "log" as const, args: [null], timestamp: Date.now() },
        { level: "log" as const, args: [undefined], timestamp: Date.now() + 1 },
      ];
      render(<ConsoleOutput logs={logs} />);
      expect(screen.getByText("null")).toBeInTheDocument();
      expect(screen.getByText("undefined")).toBeInTheDocument();
    });

    it("should format object arguments as JSON", () => {
      const logs = [{ level: "log" as const, args: [{ foo: "bar" }], timestamp: Date.now() }];
      render(<ConsoleOutput logs={logs} />);
      expect(screen.getByText(/"foo": "bar"/)).toBeInTheDocument();
    });

    it("should format array arguments as JSON", () => {
      const logs = [{ level: "log" as const, args: [[1, 2, 3]], timestamp: Date.now() }];
      render(<ConsoleOutput logs={logs} />);
      expect(screen.getByText(/\[[\s\S]*1,[\s\S]*2,[\s\S]*3[\s\S]*\]/)).toBeInTheDocument();
    });

    it("should join multiple arguments with space", () => {
      const logs = [{ level: "log" as const, args: ["Hello", "world", 42], timestamp: Date.now() }];
      render(<ConsoleOutput logs={logs} />);
      expect(screen.getByText("Hello world 42")).toBeInTheDocument();
    });
  });

  describe("Timestamp Display", () => {
    it("should display timestamps in HH:MM:SS.mmm format", () => {
      const timestamp = new Date("2026-01-14T15:30:45.123").getTime();
      const logs = [{ level: "log" as const, args: ["Test"], timestamp }];
      render(<ConsoleOutput logs={logs} />);
      // Should show timestamp in format like "15:30:45.123"
      expect(screen.getByText(/\d{2}:\d{2}:\d{2}\.\d{3}/)).toBeInTheDocument();
    });
  });

  describe("User Interactions", () => {
    it("should call onClear when clear button is clicked", async () => {
      const user = userEvent.setup();
      const onClear = vi.fn();
      const logs = [{ level: "log" as const, args: ["Test"], timestamp: Date.now() }];
      render(<ConsoleOutput logs={logs} onClear={onClear} />);

      const clearButton = screen.getByRole("button", { name: /clear/i });
      await user.click(clearButton);

      expect(onClear).toHaveBeenCalledTimes(1);
    });

    it("should not crash if onClear is not provided", async () => {
      const user = userEvent.setup();
      const logs = [{ level: "log" as const, args: ["Test"], timestamp: Date.now() }];
      render(<ConsoleOutput logs={logs} />);

      const clearButton = screen.getByRole("button", { name: /clear/i });
      await user.click(clearButton);

      // Should not throw an error
    });
  });

  describe("CSS Classes", () => {
    it("should apply correct CSS classes for log levels", () => {
      const logs = [
        { level: "log" as const, args: ["Log"], timestamp: Date.now() },
        { level: "warn" as const, args: ["Warn"], timestamp: Date.now() + 1 },
        { level: "error" as const, args: ["Error"], timestamp: Date.now() + 2 },
        { level: "info" as const, args: ["Info"], timestamp: Date.now() + 3 },
      ];
      const { container } = render(<ConsoleOutput logs={logs} />);

      expect(container.querySelector(".console-log-log")).toBeInTheDocument();
      expect(container.querySelector(".console-log-warn")).toBeInTheDocument();
      expect(container.querySelector(".console-log-error")).toBeInTheDocument();
      expect(container.querySelector(".console-log-info")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle large number of logs", () => {
      const logs = Array.from({ length: 100 }, (_, i) => ({
        level: "log" as const,
        args: [`Message ${i}`],
        timestamp: Date.now() + i,
      }));
      render(<ConsoleOutput logs={logs} />);
      expect(screen.getByText("Message 0")).toBeInTheDocument();
      expect(screen.getByText("Message 99")).toBeInTheDocument();
    });

    it("should handle circular references in objects gracefully", () => {
      const circular: any = { name: "test" };
      circular.self = circular;

      const logs = [{ level: "log" as const, args: [circular], timestamp: Date.now() }];

      // Should not crash - will use String() fallback
      render(<ConsoleOutput logs={logs} />);
      expect(screen.getByText(/object/i)).toBeInTheDocument();
    });

    it("should handle function arguments", () => {
      const logs = [{ level: "log" as const, args: [() => "test"], timestamp: Date.now() }];
      render(<ConsoleOutput logs={logs} />);
      expect(screen.getByText(/=>/)).toBeInTheDocument();
    });
  });
});
