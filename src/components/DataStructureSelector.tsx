import { type DataStructureType } from "../store/useAppStore";
import "./DataStructureSelector.css";

interface DataStructureSelectorProps {
  selectedDataStructure: DataStructureType;
  onSelectDataStructure: (dataStructure: DataStructureType) => void;
}

const dataStructures: Array<{
  type: DataStructureType;
  label: string;
  description: string;
}> = [
  {
    type: "array",
    label: "Array",
    description: "Sequential collection with index-based access",
  },
  {
    type: "linkedList",
    label: "Linked List",
    description: "Chain of nodes with pointer-based traversal",
  },
  {
    type: "stack",
    label: "Stack",
    description: "LIFO (Last-In-First-Out) data structure",
  },
  {
    type: "queue",
    label: "Queue",
    description: "FIFO (First-In-First-Out) data structure",
  },
  {
    type: "tree",
    label: "Binary Tree",
    description: "Hierarchical structure with parent-child relationships",
  },
  {
    type: "graph",
    label: "Graph",
    description: "Network of vertices connected by edges",
  },
  {
    type: "hashMap",
    label: "Hash Map",
    description: "Key-value pairs with O(1) average lookup",
  },
];

export function DataStructureSelector({
  selectedDataStructure,
  onSelectDataStructure,
}: DataStructureSelectorProps) {
  return (
    <div className="data-structure-selector">
      <div className="selector-header">
        <h2>Data Structure</h2>
        <p className="selector-subtitle">Select a data structure to practice algorithms</p>
      </div>
      <div className="selector-buttons">
        {dataStructures.map((ds) => (
          <button
            key={ds.type}
            className={`ds-button ${selectedDataStructure === ds.type ? "active" : ""}`}
            onClick={() => onSelectDataStructure(ds.type)}
            title={ds.description}
            type="button"
          >
            {ds.label}
          </button>
        ))}
      </div>
    </div>
  );
}
