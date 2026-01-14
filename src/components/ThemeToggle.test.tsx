import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeToggle } from "./ThemeToggle";
import useAppStore from "../store/useAppStore";

describe("ThemeToggle", () => {
  beforeEach(() => {
    // Reset store to dark theme before each test
    useAppStore.setState({ theme: "dark" });
  });

  describe("Rendering", () => {
    it("renders a button", () => {
      render(<ThemeToggle />);
      const button = screen.getByRole("button");
      expect(button).toBeDefined();
    });

    it("displays sun icon in dark mode", () => {
      useAppStore.setState({ theme: "dark" });
      render(<ThemeToggle />);
      const button = screen.getByRole("button");
      expect(button.querySelector("svg")).toBeDefined();
      expect(button.querySelector("circle")).toBeDefined(); // Sun has a circle
    });

    it("displays moon icon in light mode", () => {
      useAppStore.setState({ theme: "light" });
      render(<ThemeToggle />);
      const button = screen.getByRole("button");
      expect(button.querySelector("svg")).toBeDefined();
      expect(button.querySelector("path")).toBeDefined(); // Moon has a path
    });

    it("has correct aria-label in dark mode", () => {
      useAppStore.setState({ theme: "dark" });
      render(<ThemeToggle />);
      const button = screen.getByRole("button");
      expect(button.getAttribute("aria-label")).toBe("Switch to light mode");
    });

    it("has correct aria-label in light mode", () => {
      useAppStore.setState({ theme: "light" });
      render(<ThemeToggle />);
      const button = screen.getByRole("button");
      expect(button.getAttribute("aria-label")).toBe("Switch to dark mode");
    });

    it("has correct title attribute in dark mode", () => {
      useAppStore.setState({ theme: "dark" });
      render(<ThemeToggle />);
      const button = screen.getByRole("button");
      expect(button.getAttribute("title")).toBe("Switch to light mode");
    });

    it("has correct title attribute in light mode", () => {
      useAppStore.setState({ theme: "light" });
      render(<ThemeToggle />);
      const button = screen.getByRole("button");
      expect(button.getAttribute("title")).toBe("Switch to dark mode");
    });
  });

  describe("User Interaction", () => {
    it("toggles theme from dark to light on click", async () => {
      const user = userEvent.setup();
      useAppStore.setState({ theme: "dark" });
      render(<ThemeToggle />);

      const button = screen.getByRole("button");
      await user.click(button);

      const theme = useAppStore.getState().theme;
      expect(theme).toBe("light");
    });

    it("toggles theme from light to dark on click", async () => {
      const user = userEvent.setup();
      useAppStore.setState({ theme: "light" });
      render(<ThemeToggle />);

      const button = screen.getByRole("button");
      await user.click(button);

      const theme = useAppStore.getState().theme;
      expect(theme).toBe("dark");
    });

    it("toggles theme multiple times correctly", async () => {
      const user = userEvent.setup();
      useAppStore.setState({ theme: "dark" });
      render(<ThemeToggle />);

      const button = screen.getByRole("button");

      // First click: dark -> light
      await user.click(button);
      expect(useAppStore.getState().theme).toBe("light");

      // Second click: light -> dark
      await user.click(button);
      expect(useAppStore.getState().theme).toBe("dark");

      // Third click: dark -> light
      await user.click(button);
      expect(useAppStore.getState().theme).toBe("light");
    });
  });

  describe("CSS Classes", () => {
    it("has theme-toggle class", () => {
      render(<ThemeToggle />);
      const button = screen.getByRole("button");
      expect(button.classList.contains("theme-toggle")).toBe(true);
    });
  });

  describe("Accessibility", () => {
    it("has proper button role", () => {
      render(<ThemeToggle />);
      const button = screen.getByRole("button");
      expect(button.tagName).toBe("BUTTON");
    });

    it("SVG has aria-hidden attribute", () => {
      render(<ThemeToggle />);
      const svg = screen.getByRole("button").querySelector("svg");
      expect(svg?.getAttribute("aria-hidden")).toBe("true");
    });
  });
});
