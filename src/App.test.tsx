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
      expect(screen.getByText("Visualization")).toBeDefined();
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
});
