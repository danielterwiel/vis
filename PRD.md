# Data Structure Visualization Application PRD

A minimalist CodePen-like application with a code editor on the left and real-time data structure visualization on the right. Users write JavaScript algorithms that manipulate data structures, with 3 test cases per structure displayed simultaneously. **100% client-side rendered with no backend.**

**Key Constraint**: This application must be entirely client-side rendered with no backend server.

---

## Technology Stack

### Framework: **React 19**

- Massive ecosystem with 190M+ weekly npm downloads
- Battle-tested with extensive third-party library support
- Framer Motion for animations integrates seamlessly
- `react-resizable-panels` for split pane layout

**Why not SolidJS?** While SolidJS offers better raw performance, its smaller ecosystem (~500k weekly downloads) means fewer ready-made solutions. React's mature ecosystem reduces development time and risk.

### Build Tool: **Vite**

- Fast HMR and dev server
- Excellent React support via `@vitejs/plugin-react`
- Modern ESM-first approach
- Tree-shaking to reduce bundle size

### Code Editor: **CodeMirror 6**

- Lightweight (~300KB vs Monaco's ~2.4MB+)
- Full JavaScript IntelliSense
- Syntax highlighting, error detection, autocomplete
- Excellent performance for client-side apps

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

### Code Instrumentation: **SWC WASM**

- `@swc/wasm-web` for browser-based AST transformation (20-70x faster than Babel)
- Transform user code to capture operations for visualization
- Inject loop counters for infinite loop detection
- Generate source maps for debugging

### Client-Side Testing: **Vitest expect (bundled)**

- Vitest's `expect` function bundled for sandbox use
- BDD-style assertions for readable tests
- Executes in sandboxed iframe alongside user code
- Results sent back via `postMessage`

### Icons: **Tabler Icons**

- Comprehensive icon set with consistent design
- Tree-shakeable imports
- Used strategically for UI controls (play, hints, examples, step controls)

---

## UI/UX Principles

### Minimalist Design

- Clean, uncluttered interfaces focusing on essential elements
- Single theme only (no dark mode toggle)
- Strategic use of icons without overwhelming the interface
- Immediate visual feedback from visualizations

### Real Estate Optimization

- Data structure selection via compact dropdown (not button grid)
- Hints accessible via single icon button (modal on click)
- All 3 test cases visible simultaneously (no difficulty filter)
- Floating controls for visualization to save space
- Play button positioned above editor for running tests

### Immediate Feedback

- Visualizations auto-play all steps immediately on code execution
- No speed controls - instant playback with replay option
- Horizontal slider for manual step-through
- Floating step back/forward buttons for granular control

---

## Test Cases System

Each data structure includes **3 test cases** at different difficulty levels, all visible simultaneously. Tests run entirely client-side using bundled Vitest expect in the sandboxed iframe.

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

  // Vitest expect assertions (runs in sandbox)
  assertions: string;

  // Reference solution (for "Show Solution" feature)
  referenceSolution: string;

  // Skeleton code with TODOs for user to fill in
  skeletonCode: string;

  // Hints (progressively revealed via modal)
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
      expect(result).toEqual([1, 2, 5, 8, 9]);
      expect(result).toHaveLength(5);
    `,
    referenceSolution: `
      // Example usage: Sort an array of numbers

      function sort(arr) {
        return arr.slice().sort((a, b) => a - b);
      }
    `,
    skeletonCode: `
      // Example usage: Sort an array of numbers

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
      expect(result).toEqual([11, 12, 22, 25, 34, 64, 90]);
      expect(steps.filter(s => s.type === 'swap').length).toBeGreaterThan(0);
    `,
    referenceSolution: `
      // Example usage: Implement bubble sort algorithm

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
      // Example usage: Implement bubble sort algorithm

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
      expect(result).toEqual([10, 30, 40, 50, 70, 80, 90]);
      expect(steps.filter(s => s.type === 'partition').length).toBeGreaterThan(0);
    `,
    referenceSolution: `
      // Example usage: Implement quick sort with partition

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
      // Example usage: Implement quick sort with partition

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

### Skeleton Code Format

**Important**: Skeleton code follows this format:

```javascript
// Example usage: [Brief description of what the code does]

function myFunction() {
  // TODO comments and implementation hints
}
```

**Rules**:

- "Example usage" comment always at the top
- One empty line between comment and function
- No "Your code here" comments
- TODOs and hints within function body

---

## Client-Side Test Execution Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│  Main App (React)                                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────┐         ┌────────────────────────────────────┐│
│  │  Play Button     │         │  Sandboxed iframe (srcdoc)         ││
│  │  (Above Editor)  │         │  sandbox="allow-scripts"           ││
│  │                  │         │                                    ││
│  │  [▶ Run Tests]   │ ──────▶ │  1. Load bundled Vitest expect     ││
│  │                  │         │  2. Load instrumented user code    ││
│  │                  │         │  3. Execute with test data         ││
│  │                  │         │  4. Run expect assertions          ││
│  │                  │         │  5. postMessage results back       ││
│  └──────────────────┘         └────────────────────────────────────┘│
│           │                                  │                      │
│           │                                  │                      │
│           ▼                                  ▼                      │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │  Test Results Panel (All 3 visible)                             ││
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
      <script src="[bundled-vitest-expect]"></script>
      <script>
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

When user code is incomplete or hasn't been written yet, the visualization panel shows skeleton state.

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

### Progressive Hints System

Hints are accessed via an icon button (absolute positioned in top-right of editor). Clicking opens a modal:

```typescript
// src/components/EditorPanel/HintModal.tsx

function HintModal({ testCase, hintsRevealed, onRevealHint, onClose }) {
  return (
    <dialog open className="hints-modal">
      <header>
        <h3>Hints ({hintsRevealed}/{testCase.hints.length})</h3>
        <button onClick={onClose} aria-label="Close hints">
          <IconX />
        </button>
      </header>

      <div className="hints-list">
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
    </dialog>
  );
}
```

---

## Supported Data Structures

Each data structure includes 3 test cases (Easy, Medium, Hard) visible simultaneously.

### 1. **Arrays**

- Visual: Horizontal bar representation
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
├─────────────────────────────┬───────────────────────────────────────────┤
│                             │                                           │
│      Code Editor Panel      │       Visualization Panel                 │
│     ┌─────────────────┐     │     ┌───────────────────────────────┐     │
│     │  [▶] Play Tests │     │     │                               │     │
│     ├─────────────────┤     │     │   SVG/Canvas Renderer         │     │
│     │ Data Structure  │     │     │                               │     │
│     │   [Dropdown ▼]  │     │     │   - Data Structure View       │     │
│     ├─────────────────┤     │     │   - Animation Layer           │     │
│     │                 │     │     │                               │     │
│     │ CodeMirror 6    │     │     │   ┌─────────────────────┐     │     │
│     │                 │     │     │   │ [↻] [◀] [▶]       │     │     │
│     │ - JS/TS         │     │     │   │ Floating controls   │     │     │
│     │ - Autocomplete  │     │     │   └─────────────────────┘     │     │
│     │ - Error hints   │     │     │                               │     │
│     │                 │     │     │   ────────●──────────────     │     │
│     │           [💡]  │     │     │   Step slider                 │     │
│     │    (hints icon) │     │     │                               │     │
│     └─────────────────┘     │     └───────────────────────────────┘     │
│                             │                                           │
│     ┌──────────────────┐    │     ┌───────────────────────────────┐     │
│     │ Examples         │    │     │  Test Results (All 3)         │     │
│     └──────────────────┘    │     │  ✓ Easy  ✗ Medium  ○ Hard     │     │
│                             │     └───────────────────────────────┘     │
│                             │                                           │
│     ┌─────────────────┐     │     ┌───────────────────────────────┐     │
│     │ Test Cases (×3) │     │     │  Console Output               │     │
│     │ - Easy          │     │     │  - Logs                       │     │
│     │ - Medium        │     │     │  - Return values              │     │
│     │ - Hard          │     │     └───────────────────────────────┘     │
│     └─────────────────┘     │                                           │
└─────────────────────────────┴───────────────────────────────────────────┘
```

---

## Core Components

### 1. `<App />`

- Main layout with resizable split panes (`react-resizable-panels`)
- Global state management (Zustand)
- Single theme (no dark mode toggle)

### 2. `<EditorPanel />`

- CodeMirror 6 wrapper
- Play button for running all tests (positioned above editor)
- Data structure dropdown selector
- Examples button (no emoji)
- Hints icon button (absolute positioned, top right) opens modal
- Skeleton code templates with TODOs

### 3. `<VisualizationPanel />`

- Dynamic renderer based on selected data structure
- Auto-plays all steps immediately on code execution
- Floating controls: Replay, Step Back, Step Forward
- Horizontal slider for manual step navigation
- No speed controls

### 4. `<TestPanel />`

- Displays all 3 test cases simultaneously (Easy, Medium, Hard)
- No difficulty filter buttons
- Shows pass/fail status with error messages
- Displays expected vs actual output diff

### 5. Data Structure Visualizers

- `<ArrayVisualizer />`
- `<LinkedListVisualizer />`
- `<StackQueueVisualizer />`
- `<TreeVisualizer />`
- `<GraphVisualizer />`
- `<HashMapVisualizer />`

### 6. `<ConsoleOutput />`

- Displays console.log output from user code
- Shows execution results and errors
- Test assertion failures with details

### 7. `<HintModal />`

- Modal dialog for progressive hint reveal
- Triggered by hints icon in editor panel
- Shows total hints and reveals progressively
- Close button with icon

### 8. `<PresetSelector />`

- Modal dialog for algorithm examples
- Category filtering
- Complexity badges
- Loads preset code into editor
- No emoji in trigger button

---

## Execution Model

### Instrumented Execution via SWC

User code is transformed at runtime using `@swc/wasm-web` to capture each operation:

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

### SWC Transformation Plugin

```javascript
// src/lib/execution/instrumenter.ts

import { initializeSWC } from '@swc/wasm-web';

// Initialize once on app mount
await initializeSWC();

export function instrumentCode(code: string): string {
  const result = transformSync(code, {
    jsc: {
      parser: {
        syntax: 'ecmascript',
      },
      transform: {
        // Inject loop counters for infinite loop detection
        // Add __capture() calls for operation tracking
      },
    },
    sourceMaps: 'inline',
  });
  return result.code;
}
```

### Execution Flow

1. User clicks play button above editor
2. Code is parsed and instrumented via SWC
3. Instrumented code runs in sandboxed iframe
4. Operations are captured as "steps" via `__capture()`
5. Steps sent to main app via `postMessage`
6. Visualization panel auto-plays all steps immediately
7. User can replay or step through manually via slider/floating buttons

### Sandbox Security

```html
<iframe sandbox="allow-scripts" srcdoc="..."></iframe>
```

Security measures:

- `sandbox="allow-scripts"` - allows JS but blocks:
  - Same-origin access to parent
  - Form submission
  - Popups and navigation
- Timeout mechanism (5 second default)
- `postMessage` with type whitelist and schema validation
- Message correlation with unique IDs

---

## Visualization Controls

### Auto-Play Behavior

When user code executes successfully:

1. **Immediate Auto-Play**: All steps play automatically (no speed control)
2. **Completion**: Animation plays through all steps once
3. **Controls Appear**: Replay button and step controls become available

### Manual Controls

**Floating Action Buttons** (positioned over visualization):

- **Replay Button** (`IconPlayerPlay` or `IconReload`): Restarts animation from beginning
- **Step Back** (`IconArrowLeft` or `IconChevronLeft`): Go to previous step
- **Step Forward** (`IconArrowRight` or `IconChevronRight`): Go to next step

**Horizontal Slider**:

- Positioned below visualization area
- Allows precise navigation to any step
- Thumb position indicates current step
- Total steps visible

**No Speed Controls**: Speed option removed for simplicity. All animations play at consistent, optimized speed.

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
│   │   │   ├── CodeMirrorEditor.tsx
│   │   │   ├── DataStructureDropdown.tsx
│   │   │   ├── RunButton.tsx
│   │   │   ├── HintButton.tsx
│   │   │   └── HintModal.tsx
│   │   ├── VisualizationPanel/
│   │   │   ├── VisualizationPanel.tsx
│   │   │   ├── AnimationController.tsx
│   │   │   ├── StepSlider.tsx
│   │   │   └── FloatingControls.tsx
│   │   ├── TestPanel/
│   │   │   ├── TestPanel.tsx
│   │   │   └── TestResults.tsx
│   │   ├── PresetSelector.tsx
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
│   │   │   ├── instrumenter.ts      # SWC AST transformation
│   │   │   ├── messageValidation.ts # Defense-in-depth validation
│   │   │   └── timeout.ts           # Infinite loop protection
│   │   ├── testing/
│   │   │   ├── testRunner.ts        # Client-side test execution
│   │   │   ├── expectBundle.ts      # Bundled Vitest expect
│   │   │   └── testCases/           # Test definitions per DS
│   │   │       ├── arrayTests.ts
│   │   │       ├── linkedListTests.ts
│   │   │       ├── stackQueueTests.ts
│   │   │       ├── treeTests.ts
│   │   │       ├── graphTests.ts
│   │   │       └── hashMapTests.ts
│   │   ├── animation/
│   │   │   ├── stepper.ts           # Animation step management
│   │   │   └── transitions.ts       # Framer Motion presets
│   │   └── presets/                 # Algorithm examples
│   │       ├── array.ts
│   │       ├── linkedList.ts
│   │       └── ...
│   ├── store/
│   │   └── useAppStore.ts           # Zustand store for global state
│   ├── templates/                   # Skeleton code per DS/test
│   │   ├── array/
│   │   │   ├── easy.ts
│   │   │   ├── medium.ts
│   │   │   └── hard.ts
│   │   ├── linkedList/
│   │   │   ├── easy.ts
│   │   │   ├── medium.ts
│   │   │   └── hard.ts
│   │   ├── stack/
│   │   ├── queue/
│   │   ├── tree/
│   │   ├── graph/
│   │   ├── hashMap/
│   │   └── ...
│   └── styles/
│       ├── global.css
│       └── components.css
└── public/
    └── favicon.svg
```

---

## Implementation Status

### Phase 1: Project Setup ✓

- [x] Initialize Vite + React 19 project
- [x] Install dependencies (CodeMirror 6, D3, Framer Motion, Vitest, SWC)
- [x] Set up basic layout with `react-resizable-panels`
- [x] Configure CodeMirror 6 editor
- [x] Set up Zustand store for app state

### Phase 2: Core Infrastructure ✓

- [x] Implement sandboxed iframe execution with `srcdoc`
- [x] Create SWC-based code instrumentation (loop injection)
- [x] Build step capture and `postMessage` communication
- [x] Implement timeout/infinite loop protection
- [x] Set up client-side test runner with bundled Vitest expect

### Phase 3: Test Cases System ✓

- [x] Define TestCase interface and structure
- [x] Create test cases for Arrays (Easy/Medium/Hard)
- [x] Build TestPanel UI with pass/fail display
- [x] Implement skeleton code system with TODOs
- [x] Add progressive hints system

### Phase 4: First Visualizer - Arrays ✓

- [x] Create ArrayVisualizer component with SVG
- [x] Implement TrackedArray with operation capture
- [x] Add D3 transition animations for push, pop, swap, sort
- [x] Connect editor → execution → visualization pipeline
- [x] Implement all 3 array test cases

### Phase 5: Visualization Modes ✓

- [x] Build ModeSelector component
- [x] Implement "Expected Output" mode
- [x] Implement "Reference Solution" mode
- [x] Add side-by-side comparison view
- [x] Handle incomplete code gracefully

### Phase 6: Additional Data Structures ✓

- [x] LinkedList (data structure, visualizer, test cases)
- [x] Stack/Queue (visualizer, test cases)
- [x] Binary Tree (data structure, visualizer, test cases)
- [x] Graph (data structure, visualizer, test cases)
- [x] HashMap (data structure, visualizer, test cases)

### Phase 7: Polish & UX ✓

- [x] Console output panel with formatting
- [x] Animation controls
- [x] Step-through debugging mode
- [x] Mobile-responsive layout (limited)

### Phase 8: Advanced Features ✓

- [x] Local storage for progress persistence
- [x] Preset algorithm examples (sorting, traversals)
- [x] Performance metrics display (time/space complexity)

### Phase 9: UI/UX Refinements (In Progress)

**Removals**:

- [x] Remove dark mode toggle and theme switching system
- [x] Remove DataStructureSelector button container
- [ ] Remove test case difficulty filter
- [ ] Remove "Your code here" comments from skeleton templates
- [ ] Remove emoji before "Examples" button
- [ ] Remove share functionality
- [ ] Remove speed controls from visualization

**Changes**:

- [x] Convert data structure selector to dropdown in EditorPanel
- [ ] Convert hints section to icon button with modal
- [ ] Add Tabler icons throughout UI (strategically)
- [ ] Fix Examples dialog UI/UX
- [ ] Move "Example usage" comments to top of skeleton functions
- [ ] Show all 3 test cases simultaneously (no filter)
- [ ] Add play button above editor for running all tests
- [ ] Implement auto-play visualization on code execution
- [ ] Add replay button for visualization
- [ ] Add floating step back/forward controls
- [ ] Add horizontal slider for step navigation

**Bug Fixes**:

- [ ] Fix skeleton template loading for linkedList and other data structures
- [ ] Ensure all data structure templates exist for easy/medium/hard

---

## Dependencies

```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@uiw/react-codemirror": "^4.23.0",
    "@codemirror/lang-javascript": "^6.2.0",
    "d3": "^7.9.0",
    "framer-motion": "^12.0.0",
    "react-resizable-panels": "^2.1.0",
    "@swc/wasm-web": "^1.4.0",
    "vitest": "^4.0.0",
    "zustand": "^5.0.0",
    "@tabler/icons-react": "^3.0.0"
  },
  "devDependencies": {
    "vite": "^6.0.0",
    "@vitejs/plugin-react": "^4.3.0",
    "typescript": "^5.7.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@types/d3": "^7.4.0",
    "oxlint": "^0.14.0"
  }
}
```

---

## Key Technical Decisions

| Decision       | Choice                  | Rationale                                                         |
| -------------- | ----------------------- | ----------------------------------------------------------------- |
| Framework      | React 19                | Massive ecosystem, battle-tested, excellent library support       |
| Editor         | CodeMirror 6            | Lightweight (~300KB), excellent performance, modern API           |
| Visualization  | D3.js + SVG             | Industry standard, excellent tree/graph layout algorithms         |
| Animation      | Framer Motion           | Comprehensive API, variant system, excellent React integration    |
| Code Transform | SWC WASM                | 20-70x faster than Babel, browser-based AST transformation        |
| Testing        | Vitest expect (bundled) | BDD-style assertions, runs entirely client-side                   |
| Execution      | Sandboxed iframe        | Secure isolation, `postMessage` communication, timeout control    |
| State          | Zustand                 | Lightweight, no boilerplate, works well with React 19             |
| Layout         | react-resizable-panels  | Well-maintained, accessible, smooth resizing                      |
| Icons          | Tabler Icons            | Comprehensive, consistent design, tree-shakeable                  |
| Theme          | Single theme only       | Simplifies UI, reduces maintenance, focuses on core functionality |

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

### postMessage Security

```javascript
// Main app - defense-in-depth validation
const ALLOWED_MESSAGE_TYPES = new Set(['test-result', 'execution-complete', ...]);

window.addEventListener("message", (event) => {
  // 1. Structure validation
  if (!event.data || typeof event.data !== 'object') return;

  // 2. Type whitelist
  if (!ALLOWED_MESSAGE_TYPES.has(event.data.type)) return;

  // 3. Schema validation
  if (!validateMessageSchema(event.data)) return;

  // 4. Source check
  if (event.source !== expectedIframe.contentWindow) return;

  // 5. Process validated message
  handleSandboxMessage(event.data);
});
```

### Timeout Protection

```javascript
// Injected via SWC transformation
let __loopCount_1 = 0;
while (condition) {
  if (++__loopCount_1 > 100000) {
    throw new Error("Infinite loop detected");
  }
  body;
}
```

---

## UI/UX Best Practices Applied

### Modal Design

Based on [modal UX best practices](https://www.eleken.co/blog-posts/modal-ux), the hints modal:

- Has clear title explaining purpose
- Provides obvious close button
- Shows progressive content reveal
- Uses clear CTAs ("Reveal Hint N")

### Timeline Controls

Inspired by [video player timeline patterns](https://support.syncsketch.com/hc/en-us/articles/32393850754196-Timeline-Navigation-and-Playback-Controls):

- Horizontal slider for precise step navigation
- Floating controls for replay/step actions
- Auto-play on first execution for immediate feedback
- Frame-by-frame stepping with arrow buttons

### Floating Action Buttons

Following [FAB design guidelines](https://mobbin.com/glossary/floating-action-button):

- Used for primary visualization controls (replay, step back/forward)
- Positioned consistently
- Icon-only for compact display
- Higher z-index to float above content

### Minimalist Design

Adhering to [2026 UI/UX trends](https://uidesignz.com/blogs/ui-ux-design-best-practices):

- Removes clutter (single theme, no dark mode toggle)
- Focuses on essential elements
- Strategic icon usage (not overwhelming)
- Immediate visual feedback

### Icon Usage

Following [accessibility best practices](https://www.eleken.co/blog-posts/modal-ux):

- Descriptive aria-labels for icon buttons
- Icons used strategically, not everywhere
- Consistent icon library (Tabler Icons)
- Icon + label for important actions

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

- [Vitest Browser Mode](https://vitest.dev/guide/browser.html)
- [freeCodeCamp Testing Architecture](https://forum.freecodecamp.org/t/how-does-freecodecamp-run-test-our-code/591458)

### Sandbox Security

- [Sandboxed iFrames - web.dev](https://web.dev/articles/sandboxed-iframes)
- [JavaScript Sandboxing Deep Dive - Leapcell](https://leapcell.io/blog/deep-dive-into-javascript-sandboxing)
- [Building Secure Code Sandbox - Medium](https://medium.com/@muyiwamighty/building-a-secure-code-sandbox-what-i-learned-about-iframe-isolation-and-postmessage-a6e1c45966df)

### Visualization

- [D3.js Alternatives 2025 - Galaxy](https://www.getgalaxy.io/resources/top-d3js-alternatives-2025)
- [Algorithm Visualizer](https://algorithm-visualizer.org/)
- [VisuAlgo](https://visualgo.net/en)

### Code Instrumentation

- [SWC Documentation](https://swc.rs/)
- [AST Manipulation Best Practices](https://www.trickster.dev/post/javascript-ast-manipulation-with-babel-transform-prototyping-and-plugin-development/)

### UI/UX Research (2026)

- [Modal UX Best Practices - Eleken](https://www.eleken.co/blog-posts/modal-ux)
- [UI Design Best Practices 2026](https://uidesignz.com/blogs/ui-ux-design-best-practices)
- [Timeline Navigation and Playback Controls - SyncSketch](https://support.syncsketch.com/hc/en-us/articles/32393850754196-Timeline-Navigation-and-Playback-Controls)
- [Floating Action Buttons - Mobbin](https://mobbin.com/glossary/floating-action-button)
- [Tooltips Best Practices - Appcues](https://www.appcues.com/blog/tooltips)
