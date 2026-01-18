import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import App from "./App";
import * as swcInitializer from "./lib/execution/swcInitializer";

// Mock SWC initializer
vi.mock("./lib/execution/swcInitializer", () => ({
  initializeSWC: vi.fn(() => Promise.resolve()),
  isSWCInitialized: vi.fn(() => true),
  transformCode: vi.fn((code: string) => code),
}));

// Mock test runner
vi.mock("./lib/testing/testRunner", () => ({
  runTest: vi.fn(() =>
    Promise.resolve({
      testId: "test-1",
      passed: true,
      executionTime: 100,
      steps: [],
      consoleLogs: [],
    }),
  ),
  runTests: vi.fn(() => Promise.resolve([])),
}));

describe("App", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the application header", async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText("Data Structure Visualizer")).toBeDefined();
    });
  });

  it("shows loading state initially", async () => {
    render(<App />);
    expect(screen.getByText("Loading...")).toBeDefined();
    // Wait for state update to complete
    await waitFor(() => {
      expect(screen.queryByText("Loading...")).toBeNull();
    });
  });

  it("renders the editor panel after initialization", async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText("Editor")).toBeDefined();
    });
  });

  it("renders the visualization panel after initialization", async () => {
    render(<App />);
    await waitFor(() => {
      // Check for the mode selector header which is part of the visualization panel
      expect(screen.getByText("Mode")).toBeDefined();
    });
  });

  it("renders the test panel after initialization", async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText("Test Cases")).toBeDefined();
    });
  });

  it("renders the data structure dropdown in editor panel after initialization", async () => {
    render(<App />);
    await waitFor(() => {
      // Data structure selection is now in the EditorPanel as a dropdown
      const dropdown = screen.getByRole("combobox");
      expect(dropdown).toBeDefined();
      expect(dropdown.querySelector("option[value='array']")).toBeDefined();
      expect(dropdown.querySelector("option[value='linkedList']")).toBeDefined();
    });
  });

  it("displays error message on initialization failure", async () => {
    vi.mocked(swcInitializer.initializeSWC).mockRejectedValueOnce(new Error("Failed to load SWC"));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Initialization Error")).toBeDefined();
      expect(screen.getByText("Failed to load SWC")).toBeDefined();
    });
  });

  it("detects mobile screen size (width <= 768)", async () => {
    // Mock window.innerWidth for mobile
    const originalInnerWidth = window.innerWidth;
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 768,
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Data Structure Visualizer")).toBeDefined();
    });

    // Restore original width
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
  });

  it("detects desktop screen size (width > 768)", async () => {
    // Mock window.innerWidth for desktop
    const originalInnerWidth = window.innerWidth;
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Data Structure Visualizer")).toBeDefined();
    });

    // Restore original width
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
  });
});
