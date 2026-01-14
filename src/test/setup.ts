import "@testing-library/jest-dom";

// Mock ResizeObserver for ArrayVisualizer tests
globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
