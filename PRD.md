# Data Structure Visualization Application Plan

A CodePen-like application with a code editor on the left and real-time data structure visualization on the right. Users write JavaScript algorithms that manipulate data structures, and the right panel animates the result. Includes a test case system with 3 difficulty levels per data structure.

**Key Constraint**: This application must be entirely client-side rendered with no backend server.

---

## Technology Stack

### Framework: **React 19**

- Massive ecosystem with 190M+ weekly npm downloads
- Battle-tested with extensive third-party library support
- Well-maintained wrappers for Monaco Editor (`@monaco-editor/react`)
- Framer Motion for animations integrates seamlessly
- `react-resizable-panels` for split pane layout

**Why not SolidJS?** While SolidJS offers better raw performance, its smaller ecosystem (~500k weekly downloads) means fewer ready-made solutions. React's mature ecosystem reduces development time and risk.

### Build Tool: **Vite**

- Fast HMR and dev server
- Excellent React support via `@vitejs/plugin-react`
- Modern ESM-first approach
- Tree-shaking to reduce Monaco bundle size

### Code Editor: **Monaco Editor**

- Powers VS Code - familiar experience
- Full TypeScript/JavaScript IntelliSense
- Syntax highlighting, error detection, autocomplete
- Use `@monaco-editor/react` wrapper

**Mitigation for bundle size (5-10MB)**:

- Lazy load Monaco (don't block initial render)
- Tree-shake unused language features
- Accept limited mobile experience

### Visualization Engine: **D3.js + SVG**

- D3.js for layout algorithms (trees, force-directed graphs)
- SVG-based rendering for crisp visuals
- Industry standard with extensive documentation

**Performance notes**:

- SVG is CPU-rendered; works well for educational dataset sizes
- Use `requestAnimationFrame` for smooth animations
- Canvas fallback available for Graph visualizer if force layouts get heavy

### Animation: **Framer Motion**

- Comprehensive API with variant system
- Excellent React integration
- Layout animations built-in
- Active community and documentation

### Code Execution: **Sandboxed iframe with srcdoc**

- Execute user code safely in isolated environment
- Use `sandbox="allow-scripts"` attribute
- Communicate via `postMessage` with origin verification
- Timeout mechanisms for infinite loop protection

### Code Instrumentation: **Babel Standalone**

- `@babel/standalone` for browser-based AST transformation
- `@babel/parser` for code parsing
- Transform user code to capture operations for visualization
- Generate source maps for debugging

### Client-Side Testing: **Chai Assertions**

- Chai runs entirely in browser with no dependencies
- BDD-style `expect` assertions for readable tests
- Executes in sandboxed iframe alongside user code
- Results sent back via `postMessage`

---

## Test Cases System

Each data structure includes **3 test cases** at different difficulty levels. Tests run entirely client-side using Chai assertions in the sandboxed iframe.

### Test Case Structure

```typescript
interface TestCase {
  id: string;
  name: string;
  difficulty: "easy" | "medium" | "hard";
  description: string;

  // Initial data structure state
  initialData: any;

  // Expected final state after user code runs
  expectedOutput: any;

  // Chai assertion code (runs in sandbox)
  assertions: string;

  // Reference solution (for "Show Solution" feature)
  referenceSolution: string;

  // Skeleton code with TODOs for user to fill in
  skeletonCode: string;

  // Hints (progressively revealed)
  hints: string[];
}
```

### Example: Array Sorting Test Cases

```javascript
const arraySortingTests = [
  {
    id: "array-sort-easy",
    name: "Sort Small Array",
    difficulty: "easy",
    description: "Sort an array of 5 numbers in ascending order",
    initialData: [5, 2, 8, 1, 9],
    expectedOutput: [1, 2, 5, 8, 9],
    assertions: `
      expect(result).to.deep.equal([1, 2, 5, 8, 9]);
      expect(result).to.have.lengthOf(5);
    `,
    referenceSolution: `
      function sort(arr) {
        return arr.slice().sort((a, b) => a - b);
      }
    `,
    skeletonCode: `
      function sort(arr) {
        // TODO: Implement sorting algorithm
        // Hint: You can use arr.sort() with a compare function

      }
    `,
    hints: [
      "JavaScript arrays have a built-in sort() method",
      "sort() needs a compare function for numbers: (a, b) => a - b",
      "Consider using slice() first to avoid mutating the original array",
    ],
  },
  {
    id: "array-sort-medium",
    name: "Bubble Sort Implementation",
    difficulty: "medium",
    description: "Implement bubble sort without using built-in sort()",
    initialData: [64, 34, 25, 12, 22, 11, 90],
    expectedOutput: [11, 12, 22, 25, 34, 64, 90],
    assertions: `
      expect(result).to.deep.equal([11, 12, 22, 25, 34, 64, 90]);
      expect(steps.filter(s => s.type === 'swap').length).to.be.greaterThan(0);
    `,
    referenceSolution: `
      function bubbleSort(arr) {
        const n = arr.length;
        for (let i = 0; i < n - 1; i++) {
          for (let j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
              [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
            }
          }
        }
        return arr;
      }
    `,
    skeletonCode: `
      function bubbleSort(arr) {
        const n = arr.length;
        // TODO: Implement nested loops
        // Outer loop: iterate n-1 times
        // Inner loop: compare adjacent elements and swap if needed

        return arr;
      }
    `,
    hints: [
      "Bubble sort compares adjacent elements and swaps them if out of order",
      "You need two nested loops",
      "Use destructuring to swap: [arr[j], arr[j+1]] = [arr[j+1], arr[j]]",
    ],
  },
  {
    id: "array-sort-hard",
    name: "Quick Sort Implementation",
    difficulty: "hard",
    description: "Implement quick sort with partition visualization",
    initialData: [10, 80, 30, 90, 40, 50, 70],
    expectedOutput: [10, 30, 40, 50, 70, 80, 90],
    assertions: `
      expect(result).to.deep.equal([10, 30, 40, 50, 70, 80, 90]);
      expect(steps.filter(s => s.type === 'partition').length).to.be.greaterThan(0);
    `,
    referenceSolution: `
      function quickSort(arr, low = 0, high = arr.length - 1) {
        if (low < high) {
          const pi = partition(arr, low, high);
          quickSort(arr, low, pi - 1);
          quickSort(arr, pi + 1, high);
        }
        return arr;
      }

      function partition(arr, low, high) {
        const pivot = arr[high];
        let i = low - 1;
        for (let j = low; j < high; j++) {
          if (arr[j] < pivot) {
            i++;
            [arr[i], arr[j]] = [arr[j], arr[i]];
          }
        }
        [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
        return i + 1;
      }
    `,
    skeletonCode: `
      function quickSort(arr, low = 0, high = arr.length - 1) {
        // TODO: Implement recursive quick sort
        // Base case: if low >= high, return
        // 1. Call partition to get pivot index
        // 2. Recursively sort left and right subarrays

        return arr;
      }

      function partition(arr, low, high) {
        // TODO: Implement partition
        // 1. Choose pivot (last element)
        // 2. Move smaller elements to left of pivot
        // 3. Return final pivot position

      }
    `,
    hints: [
      "Quick sort uses divide-and-conquer with a pivot element",
      "The partition function rearranges elements around the pivot",
      "Elements smaller than pivot go left, larger go right",
    ],
  },
];
```

### Client-Side Test Execution Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│  Main App (React)                                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────┐         ┌────────────────────────────────────┐│
│  │  Test Selector   │         │  Sandboxed iframe (srcdoc)         ││
│  │  ┌────────────┐  │         │  sandbox="allow-scripts"           ││
│  │  │ Easy       │  │         │                                    ││
│  │  │ Medium     │  │ ──────▶ │  1. Load Chai.js                   ││
│  │  │ Hard       │  │         │  2. Load instrumented user code    ││
│  │  └────────────┘  │         │  3. Execute with test data         ││
│  │                  │         │  4. Run Chai assertions            ││
│  │  [Run Tests]     │         │  5. postMessage results back       ││
│  └──────────────────┘         └────────────────────────────────────┘│
│           │                                  │                      │
│           │                                  │                      │
│           ▼                                  ▼                      │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │  Test Results Panel                                             ││
│  │  ✓ Easy: Sort Small Array (passed)                              ││
│  │  ✗ Medium: Bubble Sort (failed - expected [11,12...])           ││
│  │  ○ Hard: Quick Sort (not run)                                   ││
│  └─────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

### Test Runner Implementation

```typescript
// src/lib/testing/testRunner.ts

interface TestResult {
  testId: string;
  passed: boolean;
  error?: string;
  executionTime: number;
  steps: VisualizationStep[]; // Captured for animation
}

async function runTest(userCode: string, testCase: TestCase): Promise<TestResult> {
  return new Promise((resolve) => {
    const iframe = document.createElement("iframe");
    iframe.sandbox = "allow-scripts";

    const sandboxCode = `
      <script src="https://unpkg.com/chai/chai.js"></script>
      <script>
        const expect = chai.expect;
        const steps = [];

        // Capture function for visualization
        function __capture(operation, target, args, result) {
          steps.push({ type: operation, target, args, result, timestamp: Date.now() });
        }

        try {
          // User's instrumented code
          ${instrumentCode(userCode)}

          // Initialize with test data
          const input = ${JSON.stringify(testCase.initialData)};
          const result = ${getFunctionCall(userCode)}(input);

          // Run assertions
          ${testCase.assertions}

          parent.postMessage({
            type: 'test-result',
            passed: true,
            steps: steps
          }, '*');
        } catch (error) {
          parent.postMessage({
            type: 'test-result',
            passed: false,
            error: error.message,
            steps: steps
          }, '*');
        }
      </script>
    `;

    iframe.srcdoc = sandboxCode;

    // Listen for results
    window.addEventListener("message", (event) => {
      if (event.data.type === "test-result") {
        resolve({
          testId: testCase.id,
          passed: event.data.passed,
          error: event.data.error,
          executionTime: Date.now() - startTime,
          steps: event.data.steps,
        });
        iframe.remove();
      }
    });

    document.body.appendChild(iframe);
  });
}
```

---

## Handling Incomplete Code

When user code is incomplete or hasn't been written yet, the visualization panel needs to show something useful.

### Visualization Modes

```typescript
type VisualizationMode =
  | "user-code" // Visualize user's actual code execution
  | "expected-output" // Show what the result SHOULD look like
  | "reference" // Animate the reference solution
  | "skeleton"; // Show initial state, waiting for code
```

### Mode Behaviors

#### 1. **Skeleton Mode** (Default when code is incomplete)

- Display the initial data structure state
- Show TODO markers in visualization
- Grayed-out "expected" overlay showing target state
- Prompt: "Complete the function to see the animation"

#### 2. **Expected Output Mode** (Toggle: "Show Expected")

- Animates what SHOULD happen without revealing code
- User can study the expected behavior
- Steps are labeled but implementation hidden
- Useful for understanding the problem

#### 3. **Reference Solution Mode** (Toggle: "Show Solution")

- Reveals and animates the reference solution
- Code appears in editor (read-only overlay or side panel)
- Full step-by-step visualization
- Warning: "This will show you the answer"

#### 4. **User Code Mode** (After code compiles)

- Normal execution of user's code
- Red highlights for errors/unexpected behavior
- Green highlights when matching expected output
- Side-by-side comparison available

### UI Components for Modes

```tsx
// src/components/VisualizationPanel/ModeSelector.tsx

function ModeSelector({ currentMode, onModeChange, codeStatus }) {
  return (
    <div className="mode-selector">
      <button onClick={() => onModeChange("user-code")} disabled={codeStatus === "incomplete"}>
        Run My Code
      </button>

      <button onClick={() => onModeChange("expected-output")}>Show Expected</button>

      <button
        onClick={() => {
          if (confirm("This will reveal the solution. Continue?")) {
            onModeChange("reference");
          }
        }}
      >
        Show Solution
      </button>
    </div>
  );
}
```

### Skeleton Code System

Each data structure challenge starts with skeleton code containing:

```javascript
// Example skeleton for Binary Search Tree insertion

class BST {
  constructor() {
    this.root = null;
  }

  insert(value) {
    // TODO: Create a new node with the given value
    const newNode = { value, left: null, right: null };

    // TODO: If tree is empty, set root to new node
    if (/* your condition here */) {

    }

    // TODO: Otherwise, find correct position
    // Hint: Use a while loop to traverse
    // - If value < current.value, go left
    // - If value > current.value, go right


    return this; // Enable chaining
  }
}

// Test your implementation:
const tree = new BST();
tree.insert(10).insert(5).insert(15);
```

### Progressive Hints System

```typescript
// src/components/EditorPanel/HintSystem.tsx

function HintSystem({ testCase, hintsRevealed, onRevealHint }) {
  return (
    <div className="hints-panel">
      <h4>Hints ({hintsRevealed}/{testCase.hints.length})</h4>

      {testCase.hints.map((hint, index) => (
        <div key={index} className="hint">
          {index < hintsRevealed ? (
            <p>{hint}</p>
          ) : (
            <button onClick={() => onRevealHint(index)}>
              Reveal Hint {index + 1}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
```

---

## Supported Data Structures

Each data structure includes 3 test cases (Easy, Medium, Hard).

### 1. **Arrays**

- Visual: Horizontal/vertical bar representation
- Operations: push, pop, shift, unshift, splice, sort, reverse
- Animations: Element movement, swaps, highlights during sorting
- **Test Cases**:
  - Easy: Basic sorting with built-in methods
  - Medium: Implement bubble sort
  - Hard: Implement quick sort with partition visualization

### 2. **Linked Lists** (Singly & Doubly)

- Visual: Nodes connected by arrows
- Operations: insert, delete, traverse, reverse
- Animations: Pointer updates, node additions/removals
- **Test Cases**:
  - Easy: Traverse and find an element
  - Medium: Reverse a linked list
  - Hard: Detect and remove cycle

### 3. **Stacks & Queues**

- Visual: Vertical stack / horizontal queue representation
- Operations: push/pop (stack), enqueue/dequeue (queue)
- Animations: Element sliding in/out
- **Test Cases**:
  - Easy: Balanced parentheses checker
  - Medium: Implement queue using two stacks
  - Hard: Min stack with O(1) getMin

### 4. **Binary Trees / BST / Heaps**

- Visual: D3 tree layout with nodes and edges
- Operations: insert, delete, search, traverse (in/pre/post-order)
- Animations: Tree rebalancing, traversal highlighting, rotations
- **Test Cases**:
  - Easy: In-order traversal
  - Medium: Validate BST property
  - Hard: Balance an unbalanced BST

### 5. **Graphs**

- Visual: Force-directed or hierarchical layout
- Operations: addVertex, addEdge, BFS, DFS, shortest path
- Animations: Edge traversal, visited node highlighting
- **Test Cases**:
  - Easy: BFS traversal
  - Medium: Detect cycle in directed graph
  - Hard: Dijkstra's shortest path

### 6. **Hash Maps**

- Visual: Bucket array with collision chains
- Operations: set, get, delete, collision handling
- Animations: Hashing visualization, collision resolution
- **Test Cases**:
  - Easy: Implement basic get/set
  - Medium: Handle collisions with chaining
  - Hard: Implement open addressing with linear probing

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              App Shell                                  │
├─────────────────────────────────┬───────────────────────────────────────┤
│                                 │                                       │
│      Code Editor Panel          │       Visualization Panel             │
│     ┌─────────────────────┐     │     ┌───────────────────────────┐     │
│     │                     │     │     │                           │     │
│     │   Monaco Editor     │     │     │   SVG/Canvas Renderer     │     │
│     │                     │     │     │                           │     │
│     │   - JS/TS           │     │     │   - Data Structure View   │     │
│     │   - Autocomplete    │     │     │   - Animation Layer       │     │
│     │   - Error hints     │     │     │   - Mode Selector         │     │
│     │                     │     │     │   - Controls (play/step)  │     │
│     └─────────────────────┘     │     └───────────────────────────┘     │
│                                 │                                       │
│     ┌──────────────────────┐    │     ┌───────────────────────────┐     │
│     │ Run Controls         │    │     │  Test Results Panel       │     │
│     │ [▶ Run] [Test] [Step]│    │     │  ✓ Easy  ✗ Medium  ○ Hard │     │
│     └──────────────────────┘    │     └───────────────────────────┘     │
│                                 │                                       │
│     ┌─────────────────────┐     │     ┌───────────────────────────┐     │
│     │ Hints Panel         │     │     │  Console Output           │     │
│     │ [Hint 1] [Hint 2]...│     │     │  - Logs                   │     │
│     └─────────────────────┘     │     │  - Return values          │     │
│                                 │     └───────────────────────────┘     │
├─────────────────────────────────┴───────────────────────────────────────┤
│                    Data Structure & Test Selector                       │
│  [Array] [LinkedList] [Stack] [Queue] [Tree] [Graph] [Map]              │
│  Test: [Easy ✓] [Medium] [Hard]                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Core Components

### 1. `<App />`

- Main layout with resizable split panes (`react-resizable-panels`)
- Global state management (Zustand or React Context)
- Route handling for data structure selection

### 2. `<EditorPanel />`

- Monaco Editor wrapper (`@monaco-editor/react`)
- Skeleton code templates with TODOs
- Run/Test/Step controls
- Hints panel with progressive reveal

### 3. `<VisualizationPanel />`

- Dynamic renderer based on selected data structure
- Mode selector (User Code / Expected / Reference)
- Animation controller (play, pause, step, speed control)
- Zoom/pan controls

### 4. `<TestPanel />`

- Test case selector (Easy/Medium/Hard)
- Run individual or all tests
- Display pass/fail status with error messages
- Show expected vs actual output diff

### 5. `<DataStructureSelector />`

- Toolbar to switch between data structures
- Loads corresponding skeleton code, tests, and visualization

### 6. Data Structure Visualizers

- `<ArrayVisualizer />`
- `<LinkedListVisualizer />`
- `<StackQueueVisualizer />`
- `<TreeVisualizer />`
- `<GraphVisualizer />`
- `<HashMapVisualizer />`

### 7. `<ConsoleOutput />`

- Displays console.log output from user code
- Shows execution results and errors
- Test assertion failures with details

---

## Execution Model

### Instrumented Execution via Babel

User code is transformed at runtime using `@babel/standalone` to capture each operation:

```javascript
// User writes:
arr.push(5);
arr.sort((a, b) => a - b);

// Transformed to:
__capture("push", arr, [5]);
arr.push(5);
__capture("sort", arr, [(a, b) => a - b]);
arr.sort((a, b) => a - b);
```

Each captured operation becomes an animation step.

### Babel Transformation Plugin

```javascript
// src/lib/execution/instrumenter.ts

import { transform } from '@babel/standalone';

const instrumentPlugin = {
  visitor: {
    CallExpression(path) {
      // Detect method calls on tracked objects
      if (path.node.callee.type === 'MemberExpression') {
        const methodName = path.node.callee.property.name;
        const trackedMethods = ['push', 'pop', 'shift', 'unshift', 'sort', 'reverse', 'splice'];

        if (trackedMethods.includes(methodName)) {
          // Insert capture call before the original
          path.insertBefore(
            t.callExpression(
              t.identifier('__capture'),
              [
                t.stringLiteral(methodName),
                path.node.callee.object,
                t.arrayExpression(path.node.arguments)
              ]
            )
          );
        }
      }
    }
  }
};

export function instrumentCode(code: string): string {
  const result = transform(code, {
    plugins: [instrumentPlugin],
    sourceMaps: 'inline'
  });
  return result.code;
}
```

### Execution Flow

1. User writes/modifies code
2. Code is parsed and instrumented via Babel
3. Instrumented code runs in sandboxed iframe
4. Operations are captured as "steps" via `__capture()`
5. Steps sent to main app via `postMessage`
6. Visualization panel animates the steps
7. User can play all steps or step through manually

### Sandbox Security

```html
<iframe sandbox="allow-scripts" srcdoc="..."></iframe>
```

Security measures:

- `sandbox="allow-scripts"` - allows JS but blocks:
  - Same-origin access to parent
  - Form submission
  - Popups and navigation
- CSP headers in srcdoc
- Timeout mechanism (5 second default)
- `postMessage` with origin verification

---

## Project Structure

```
vis/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── src/
│   ├── main.tsx                    # Entry point
│   ├── App.tsx                     # Main app component
│   ├── components/
│   │   ├── EditorPanel/
│   │   │   ├── EditorPanel.tsx
│   │   │   ├── MonacoEditor.tsx
│   │   │   ├── Controls.tsx
│   │   │   └── HintSystem.tsx
│   │   ├── VisualizationPanel/
│   │   │   ├── VisualizationPanel.tsx
│   │   │   ├── AnimationController.tsx
│   │   │   └── ModeSelector.tsx
│   │   ├── TestPanel/
│   │   │   ├── TestPanel.tsx
│   │   │   ├── TestCaseSelector.tsx
│   │   │   └── TestResults.tsx
│   │   ├── DataStructureSelector.tsx
│   │   ├── ConsoleOutput.tsx
│   │   └── visualizers/
│   │       ├── ArrayVisualizer.tsx
│   │       ├── LinkedListVisualizer.tsx
│   │       ├── StackQueueVisualizer.tsx
│   │       ├── TreeVisualizer.tsx
│   │       ├── GraphVisualizer.tsx
│   │       └── HashMapVisualizer.tsx
│   ├── lib/
│   │   ├── dataStructures/          # DS implementations with tracking
│   │   │   ├── TrackedArray.ts
│   │   │   ├── LinkedList.ts
│   │   │   ├── Stack.ts
│   │   │   ├── Queue.ts
│   │   │   ├── BinaryTree.ts
│   │   │   ├── Graph.ts
│   │   │   └── HashMap.ts
│   │   ├── execution/
│   │   │   ├── sandbox.ts           # Sandboxed iframe execution
│   │   │   ├── instrumenter.ts      # Babel AST transformation
│   │   │   └── timeout.ts           # Infinite loop protection
│   │   ├── testing/
│   │   │   ├── testRunner.ts        # Client-side test execution
│   │   │   ├── assertions.ts        # Chai wrapper utilities
│   │   │   └── testCases/           # Test definitions per DS
│   │   │       ├── arrayTests.ts
│   │   │       ├── linkedListTests.ts
│   │   │       ├── stackQueueTests.ts
│   │   │       ├── treeTests.ts
│   │   │       ├── graphTests.ts
│   │   │       └── hashMapTests.ts
│   │   └── animation/
│   │       ├── stepper.ts           # Animation step management
│   │       └── transitions.ts       # Framer Motion presets
│   ├── store/
│   │   └── useAppStore.ts           # Zustand store for global state
│   ├── templates/                   # Skeleton code per DS/test
│   │   ├── array/
│   │   │   ├── easy.js
│   │   │   ├── medium.js
│   │   │   └── hard.js
│   │   ├── linkedList/
│   │   ├── tree/
│   │   └── ...
│   └── styles/
│       ├── global.css
│       └── themes.css
└── public/
    └── favicon.svg
```

---

## Implementation Phases

### Phase 1: Project Setup

- [x] Initialize Vite + React 19 project
- [x] Install dependencies (CodeMirror 6, D3, Framer Motion, Chai, SWC)
- [x] Set up basic layout with `react-resizable-panels`
- [x] Configure CodeMirror 6 editor
- [x] Set up Zustand store for app state

### Phase 2: Core Infrastructure

- [x] Implement sandboxed iframe execution with `srcdoc`
- [x] Create SWC-based code instrumentation (loop injection)
- [x] Build step capture and `postMessage` communication
- [x] Implement timeout/infinite loop protection
- [x] Set up client-side test runner with Vitest expect

### Phase 3: Test Cases System

- [x] Define TestCase interface and structure
- [x] Create test cases for Arrays (Easy/Medium/Hard)
- [x] Build TestPanel UI with pass/fail display
- [x] Implement skeleton code system with TODOs
- [x] Add progressive hints system

### Phase 4: First Visualizer - Arrays

- [x] Create ArrayVisualizer component with SVG
- [x] Implement TrackedArray with operation capture
- [x] Add D3 transition animations for push, pop, swap, sort
- [x] Connect editor → execution → visualization pipeline
- [x] Implement all 3 array test cases

### Phase 5: Visualization Modes

- [ ] Build ModeSelector component
- [ ] Implement "Expected Output" mode
- [ ] Implement "Reference Solution" mode
- [ ] Add side-by-side comparison view
- [ ] Handle incomplete code gracefully

### Phase 6: Additional Data Structures

- [ ] LinkedList visualizer + 3 test cases
- [ ] Stack/Queue visualizer + 3 test cases each
- [ ] Binary Tree visualizer (D3 layout) + 3 test cases
- [ ] Graph visualizer (D3 force layout) + 3 test cases
- [ ] HashMap visualizer + 3 test cases

### Phase 7: Polish & UX

- [ ] Data structure selector toolbar
- [ ] Console output panel with formatting
- [ ] Animation speed controls
- [ ] Step-through debugging mode
- [ ] Dark/light theme toggle
- [ ] Mobile-responsive layout (limited)

### Phase 8: Advanced Features

- [ ] Export/share code snippets (URL encoding)
- [ ] Local storage for progress persistence
- [ ] Preset algorithm examples (sorting, traversals)
- [ ] Performance metrics display (time/space complexity)

---

## Dependencies

```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@monaco-editor/react": "^4.6.0",
    "monaco-editor": "^0.52.0",
    "d3": "^7.9.0",
    "framer-motion": "^12.0.0",
    "react-resizable-panels": "^2.1.0",
    "@babel/standalone": "^7.26.0",
    "@babel/parser": "^7.26.0",
    "chai": "^5.1.0",
    "zustand": "^5.0.0"
  },
  "devDependencies": {
    "vite": "^6.0.0",
    "@vitejs/plugin-react": "^4.3.0",
    "typescript": "^5.7.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@types/d3": "^7.4.0"
  }
}
```

---

## Key Technical Decisions

| Decision       | Choice                 | Rationale                                                        |
| -------------- | ---------------------- | ---------------------------------------------------------------- |
| Framework      | React 19               | Massive ecosystem, battle-tested, excellent library support      |
| Editor         | Monaco                 | VS Code experience, best JS/TS IntelliSense, user preference     |
| Visualization  | D3.js + SVG            | Industry standard, excellent tree/graph layout algorithms        |
| Animation      | Framer Motion          | Comprehensive API, variant system, excellent React integration   |
| Code Transform | Babel Standalone       | Browser-based AST transformation, source maps, well-documented   |
| Testing        | Chai (browser)         | No dependencies, runs entirely client-side, BDD-style assertions |
| Execution      | Sandboxed iframe       | Secure isolation, `postMessage` communication, timeout control   |
| State          | Zustand                | Lightweight, no boilerplate, works well with React 19            |
| Layout         | react-resizable-panels | Well-maintained, accessible, smooth resizing                     |

---

## Security Considerations

### Sandbox Configuration

```html
<iframe sandbox="allow-scripts" srcdoc="..." style="display: none;"></iframe>
```

The `sandbox` attribute with only `allow-scripts`:

- Blocks same-origin access (can't read parent DOM)
- Blocks form submission
- Blocks popups and modal dialogs
- Blocks top-level navigation
- Blocks pointer lock and orientation lock

### Content Security Policy

```html
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'none'; script-src 'unsafe-inline' https://unpkg.com/chai/"
/>
```

### postMessage Security

```javascript
// Main app - verify origin
window.addEventListener("message", (event) => {
  // Only accept messages from our sandbox
  if (event.origin !== "null") return; // sandboxed iframes have null origin

  // Validate message structure
  if (!event.data || typeof event.data.type !== "string") return;

  // Process message
  handleSandboxMessage(event.data);
});
```

### Timeout Protection

```javascript
// In sandbox
const TIMEOUT_MS = 5000;
const timeoutId = setTimeout(() => {
  parent.postMessage(
    {
      type: "error",
      error: "Execution timeout - possible infinite loop",
    },
    "*",
  );
}, TIMEOUT_MS);

// Clear on successful completion
clearTimeout(timeoutId);
```

---

## Research Sources

### Framework Decision

- [React vs SolidJS 2026 - Squareboat](https://www.squareboat.com/blog/solidjs-vs-react)
- [SolidJS Pain Points - Medium](https://vladislav-lipatov.medium.com/solidjs-pain-points-and-pitfalls-a693f62fcb4c)
- [5 Places SolidJS is Not the Best - DEV](https://dev.to/this-is-learning/5-places-solidjs-is-not-the-best-5019)

### Editor Decision

- [Sourcegraph Monaco to CodeMirror Migration](https://sourcegraph.com/blog/migrating-monaco-codemirror)
- [Code Editors Comparison - Replit](https://blog.replit.com/code-editors)

### Client-Side Testing

- [Mocha Browser Support](https://mochajs.org/)
- [Chai.js Documentation](https://www.chaijs.com/)
- [freeCodeCamp Testing Architecture](https://forum.freecodecamp.org/t/how-does-freecodecamp-run-test-our-code/591458)
- [CodePen Unit Testing](https://codepen.io/brownerd/post/4-ways-to-unit-test-js-in-codepen)

### Sandbox Security

- [Sandboxed iFrames - web.dev](https://web.dev/articles/sandboxed-iframes)
- [JavaScript Sandboxing Deep Dive - Leapcell](https://leapcell.io/blog/deep-dive-into-javascript-sandboxing)
- [Building Secure Code Sandbox - Medium](https://medium.com/@muyiwamighty/building-a-secure-code-sandbox-what-i-learned-about-iframe-isolation-and-postmessage-a6e1c45966df)

### Visualization

- [D3.js Alternatives 2025 - Galaxy](https://www.getgalaxy.io/resources/top-d3js-alternatives-2025)
- [Algorithm Visualizer](https://algorithm-visualizer.org/)
- [VisuAlgo](https://visualgo.net/en)

### Code Instrumentation

- [Babel AST Manipulation - Trickster Dev](https://www.trickster.dev/post/javascript-ast-manipulation-with-babel-transform-prototyping-and-plugin-development/)
- [AST Explorer](https://astexplorer.net/)
- [Heap's Babel Transform Approach](https://www.heap.io/blog/how-we-leveraged-asts-and-babel-to-capture-everything-on-react-native-apps)
