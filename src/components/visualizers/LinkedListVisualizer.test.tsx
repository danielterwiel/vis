import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { LinkedListVisualizer } from "./LinkedListVisualizer";
import type { LinkedListNode } from "../../lib/dataStructures/TrackedLinkedList";
import type { VisualizationStep } from "../../store/useAppStore";

describe("LinkedListVisualizer", () => {
  afterEach(() => {
    cleanup();
  });

  const createLinkedList = (values: number[]): LinkedListNode<number> | null => {
    if (values.length === 0) return null;

    const firstValue = values[0];
    if (firstValue === undefined) return null;

    const head: LinkedListNode<number> = { value: firstValue, next: null };
    let current = head;

    for (let i = 1; i < values.length; i++) {
      const value = values[i];
      if (value === undefined) continue;
      const newNode: LinkedListNode<number> = { value, next: null };
      current.next = newNode;
      current = newNode;
    }

    return head;
  };

  describe("Rendering", () => {
    it("should render without crashing with null data", () => {
      const { container } = render(<LinkedListVisualizer data={null} />);
      expect(container.querySelector(".linked-list-visualizer")).toBeTruthy();
      expect(container.querySelector("svg")).toBeTruthy();
    });

    it("should render with empty list", () => {
      const { container } = render(<LinkedListVisualizer data={null} />);
      const svg = container.querySelector("svg");
      expect(svg).toBeTruthy();
      expect(svg?.querySelector(".node")).toBeFalsy();
    });

    it("should render with single node", () => {
      const data = createLinkedList([42]);
      const { container } = render(<LinkedListVisualizer data={data} />);
      const svg = container.querySelector("svg");
      expect(svg).toBeTruthy();
    });

    it("should render with multiple nodes", () => {
      const data = createLinkedList([1, 2, 3, 4, 5]);
      const { container } = render(<LinkedListVisualizer data={data} />);
      const svg = container.querySelector("svg");
      expect(svg).toBeTruthy();
    });

    it("should render step indicator", () => {
      const data = createLinkedList([1, 2, 3]);
      const { container } = render(<LinkedListVisualizer data={data} />);
      const stepIndicator = container.querySelector(".step-indicator");
      expect(stepIndicator).toBeTruthy();
      expect(stepIndicator?.textContent).toBe("Linked List Visualization");
    });
  });

  describe("Data Handling", () => {
    it("should handle null data gracefully", () => {
      const { container } = render(<LinkedListVisualizer data={null} />);
      expect(container.querySelector(".linked-list-visualizer")).toBeTruthy();
    });

    it("should handle single element list", () => {
      const data = createLinkedList([1]);
      const { container } = render(<LinkedListVisualizer data={data} />);
      expect(container.querySelector("svg")).toBeTruthy();
    });

    it("should handle large list", () => {
      const data = createLinkedList(Array.from({ length: 10 }, (_, i) => i));
      const { container } = render(<LinkedListVisualizer data={data} />);
      expect(container.querySelector("svg")).toBeTruthy();
    });

    it("should handle string values", () => {
      const data: LinkedListNode<string> = {
        value: "hello",
        next: { value: "world", next: null },
      };
      const { container } = render(<LinkedListVisualizer data={data} />);
      expect(container.querySelector("svg")).toBeTruthy();
    });
  });

  describe("Step Visualization", () => {
    it("should display append step", () => {
      const data = createLinkedList([1, 2, 3]);
      const steps: VisualizationStep[] = [
        {
          type: "append",
          target: "linkedList",
          args: [4],
          result: createLinkedList([1, 2, 3, 4]),
          timestamp: Date.now(),
        },
      ];
      const { container } = render(
        <LinkedListVisualizer data={data} steps={steps} currentStepIndex={0} />,
      );
      const stepIndicator = container.querySelector(".step-indicator");
      expect(stepIndicator?.textContent).toContain("Append 4 to end of list");
    });

    it("should display prepend step", () => {
      const data = createLinkedList([1, 2, 3]);
      const steps: VisualizationStep[] = [
        {
          type: "prepend",
          target: "linkedList",
          args: [0],
          result: createLinkedList([0, 1, 2, 3]),
          timestamp: Date.now(),
        },
      ];
      const { container } = render(
        <LinkedListVisualizer data={data} steps={steps} currentStepIndex={0} />,
      );
      const stepIndicator = container.querySelector(".step-indicator");
      expect(stepIndicator?.textContent).toContain("Prepend 0 to start of list");
    });

    it("should display insertAt step", () => {
      const data = createLinkedList([1, 2, 3]);
      const steps: VisualizationStep[] = [
        {
          type: "insertAt",
          target: "linkedList",
          args: [1, 99],
          result: createLinkedList([1, 99, 2, 3]),
          timestamp: Date.now(),
        },
      ];
      const { container } = render(
        <LinkedListVisualizer data={data} steps={steps} currentStepIndex={0} />,
      );
      const stepIndicator = container.querySelector(".step-indicator");
      expect(stepIndicator?.textContent).toContain("Insert 99 at index 1");
    });

    it("should display delete step", () => {
      const data = createLinkedList([1, 2, 3]);
      const steps: VisualizationStep[] = [
        {
          type: "delete",
          target: "linkedList",
          args: [2],
          result: createLinkedList([1, 3]),
          timestamp: Date.now(),
        },
      ];
      const { container } = render(
        <LinkedListVisualizer data={data} steps={steps} currentStepIndex={0} />,
      );
      const stepIndicator = container.querySelector(".step-indicator");
      expect(stepIndicator?.textContent).toContain("Delete value 2");
    });

    it("should display find step with found metadata", () => {
      const data = createLinkedList([1, 2, 3]);
      const steps: VisualizationStep[] = [
        {
          type: "find",
          target: "linkedList",
          args: [2],
          result: { value: 2, next: null },
          timestamp: Date.now(),
          metadata: { found: true, index: 1 },
        },
      ];
      const { container } = render(
        <LinkedListVisualizer data={data} steps={steps} currentStepIndex={0} />,
      );
      const stepIndicator = container.querySelector(".step-indicator");
      expect(stepIndicator?.textContent).toContain("Found 2 at index 1");
    });

    it("should display reverse step", () => {
      const data = createLinkedList([1, 2, 3]);
      const steps: VisualizationStep[] = [
        {
          type: "reverse",
          target: "linkedList",
          args: [],
          result: createLinkedList([3, 2, 1]),
          timestamp: Date.now(),
        },
      ];
      const { container } = render(
        <LinkedListVisualizer data={data} steps={steps} currentStepIndex={0} />,
      );
      const stepIndicator = container.querySelector(".step-indicator");
      expect(stepIndicator?.textContent).toContain("Reversing linked list");
    });

    it("should display hasCycle step", () => {
      const data = createLinkedList([1, 2, 3]);
      const steps: VisualizationStep[] = [
        {
          type: "hasCycle",
          target: "linkedList",
          args: [],
          result: false,
          timestamp: Date.now(),
          metadata: { hasCycle: false },
        },
      ];
      const { container } = render(
        <LinkedListVisualizer data={data} steps={steps} currentStepIndex={0} />,
      );
      const stepIndicator = container.querySelector(".step-indicator");
      expect(stepIndicator?.textContent).toContain("No cycle found");
    });

    it("should handle out-of-bounds step index", () => {
      const data = createLinkedList([1, 2, 3]);
      const steps: VisualizationStep[] = [
        {
          type: "append",
          target: "linkedList",
          args: [4],
          result: createLinkedList([1, 2, 3, 4]),
          timestamp: Date.now(),
        },
      ];
      const { container } = render(
        <LinkedListVisualizer data={data} steps={steps} currentStepIndex={999} />,
      );
      const stepIndicator = container.querySelector(".step-indicator");
      expect(stepIndicator?.textContent).toBe("Linked List Visualization");
    });
  });

  describe("Animation", () => {
    it("should accept isAnimating prop", () => {
      const data = createLinkedList([1, 2, 3]);
      const { container } = render(<LinkedListVisualizer data={data} isAnimating={true} />);
      expect(container.querySelector(".linked-list-visualizer")).toBeTruthy();
    });

    it("should accept isAnimating=false", () => {
      const data = createLinkedList([1, 2, 3]);
      const { container } = render(<LinkedListVisualizer data={data} isAnimating={false} />);
      expect(container.querySelector(".linked-list-visualizer")).toBeTruthy();
    });
  });

  describe("Edge Cases", () => {
    it("should handle undefined steps array", () => {
      const data = createLinkedList([1, 2, 3]);
      const { container } = render(<LinkedListVisualizer data={data} />);
      expect(container.querySelector(".linked-list-visualizer")).toBeTruthy();
    });

    it("should handle negative step index", () => {
      const data = createLinkedList([1, 2, 3]);
      const steps: VisualizationStep[] = [
        {
          type: "append",
          target: "linkedList",
          args: [4],
          result: createLinkedList([1, 2, 3, 4]),
          timestamp: Date.now(),
        },
      ];
      const { container } = render(
        <LinkedListVisualizer data={data} steps={steps} currentStepIndex={-1} />,
      );
      const stepIndicator = container.querySelector(".step-indicator");
      expect(stepIndicator?.textContent).toBe("Linked List Visualization");
    });

    it("should re-render on data change", () => {
      const data1 = createLinkedList([1, 2, 3]);
      const { container, rerender } = render(<LinkedListVisualizer data={data1} />);
      expect(container.querySelector("svg")).toBeTruthy();

      const data2 = createLinkedList([4, 5, 6]);
      rerender(<LinkedListVisualizer data={data2} />);
      expect(container.querySelector("svg")).toBeTruthy();
    });

    it("should cleanup on unmount", () => {
      const data = createLinkedList([1, 2, 3]);
      const { unmount } = render(<LinkedListVisualizer data={data} />);
      unmount();
      // Verify no errors during cleanup
    });
  });
});
