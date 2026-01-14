import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataStructureSelector } from "./DataStructureSelector";
import type { DataStructureType } from "../store/useAppStore";

describe("DataStructureSelector", () => {
  const mockOnSelect = vi.fn();

  beforeEach(() => {
    mockOnSelect.mockClear();
  });

  describe("Rendering", () => {
    it("renders the component with header and subtitle", () => {
      render(
        <DataStructureSelector
          selectedDataStructure="array"
          onSelectDataStructure={mockOnSelect}
        />,
      );

      expect(screen.getByText("Data Structure")).toBeInTheDocument();
      expect(
        screen.getByText("Select a data structure to practice algorithms"),
      ).toBeInTheDocument();
    });

    it("renders all 7 data structure buttons", () => {
      render(
        <DataStructureSelector
          selectedDataStructure="array"
          onSelectDataStructure={mockOnSelect}
        />,
      );

      expect(screen.getByText("Array")).toBeInTheDocument();
      expect(screen.getByText("Linked List")).toBeInTheDocument();
      expect(screen.getByText("Stack")).toBeInTheDocument();
      expect(screen.getByText("Queue")).toBeInTheDocument();
      expect(screen.getByText("Binary Tree")).toBeInTheDocument();
      expect(screen.getByText("Graph")).toBeInTheDocument();
      expect(screen.getByText("Hash Map")).toBeInTheDocument();
    });

    it("displays descriptions as button titles", () => {
      render(
        <DataStructureSelector
          selectedDataStructure="array"
          onSelectDataStructure={mockOnSelect}
        />,
      );

      const arrayButton = screen.getByText("Array");
      expect(arrayButton).toHaveAttribute("title", "Sequential collection with index-based access");

      const stackButton = screen.getByText("Stack");
      expect(stackButton).toHaveAttribute("title", "LIFO (Last-In-First-Out) data structure");
    });
  });

  describe("Active State", () => {
    it("highlights the selected data structure", () => {
      render(
        <DataStructureSelector
          selectedDataStructure="linkedList"
          onSelectDataStructure={mockOnSelect}
        />,
      );

      const linkedListButton = screen.getByText("Linked List");
      expect(linkedListButton).toHaveClass("active");
    });

    it("does not highlight non-selected data structures", () => {
      render(
        <DataStructureSelector
          selectedDataStructure="array"
          onSelectDataStructure={mockOnSelect}
        />,
      );

      const stackButton = screen.getByText("Stack");
      expect(stackButton).not.toHaveClass("active");
    });

    it("updates active state when selection changes", () => {
      const { rerender } = render(
        <DataStructureSelector
          selectedDataStructure="array"
          onSelectDataStructure={mockOnSelect}
        />,
      );

      expect(screen.getByText("Array")).toHaveClass("active");

      rerender(
        <DataStructureSelector selectedDataStructure="tree" onSelectDataStructure={mockOnSelect} />,
      );

      expect(screen.getByText("Array")).not.toHaveClass("active");
      expect(screen.getByText("Binary Tree")).toHaveClass("active");
    });
  });

  describe("User Interactions", () => {
    it("calls onSelectDataStructure when a button is clicked", async () => {
      const user = userEvent.setup();

      render(
        <DataStructureSelector
          selectedDataStructure="array"
          onSelectDataStructure={mockOnSelect}
        />,
      );

      await user.click(screen.getByText("Stack"));

      expect(mockOnSelect).toHaveBeenCalledTimes(1);
      expect(mockOnSelect).toHaveBeenCalledWith("stack");
    });

    it("calls onSelectDataStructure with correct data structure type", async () => {
      const user = userEvent.setup();

      render(
        <DataStructureSelector
          selectedDataStructure="array"
          onSelectDataStructure={mockOnSelect}
        />,
      );

      await user.click(screen.getByText("Hash Map"));

      expect(mockOnSelect).toHaveBeenCalledWith("hashMap");
    });

    it("allows clicking the currently selected data structure", async () => {
      const user = userEvent.setup();

      render(
        <DataStructureSelector
          selectedDataStructure="queue"
          onSelectDataStructure={mockOnSelect}
        />,
      );

      await user.click(screen.getByText("Queue"));

      expect(mockOnSelect).toHaveBeenCalledTimes(1);
      expect(mockOnSelect).toHaveBeenCalledWith("queue");
    });
  });

  describe("All Data Structure Types", () => {
    const dataStructures: Array<{
      type: DataStructureType;
      label: string;
    }> = [
      { type: "array", label: "Array" },
      { type: "linkedList", label: "Linked List" },
      { type: "stack", label: "Stack" },
      { type: "queue", label: "Queue" },
      { type: "tree", label: "Binary Tree" },
      { type: "graph", label: "Graph" },
      { type: "hashMap", label: "Hash Map" },
    ];

    dataStructures.forEach(({ type, label }) => {
      it(`handles ${label} selection correctly`, async () => {
        const user = userEvent.setup();

        render(
          <DataStructureSelector
            selectedDataStructure="array"
            onSelectDataStructure={mockOnSelect}
          />,
        );

        await user.click(screen.getByText(label));

        expect(mockOnSelect).toHaveBeenCalledWith(type);
      });
    });
  });

  describe("Accessibility", () => {
    it("uses semantic HTML with proper button elements", () => {
      render(
        <DataStructureSelector
          selectedDataStructure="array"
          onSelectDataStructure={mockOnSelect}
        />,
      );

      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(7);
    });

    it("has proper heading hierarchy", () => {
      render(
        <DataStructureSelector
          selectedDataStructure="array"
          onSelectDataStructure={mockOnSelect}
        />,
      );

      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Data Structure");
    });

    it("provides descriptive titles for screen readers", () => {
      render(
        <DataStructureSelector
          selectedDataStructure="array"
          onSelectDataStructure={mockOnSelect}
        />,
      );

      const graphButton = screen.getByText("Graph");
      expect(graphButton).toHaveAttribute("title", "Network of vertices connected by edges");
    });
  });
});
