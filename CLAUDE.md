# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A CodePen-like application for visualizing data structures with a code editor on the left and real-time animated visualization on the right. Users write JavaScript algorithms that manipulate data structures, with test cases at 3 difficulty levels per structure. **100% client-side rendered with no backend.**

## Build Commands

```bash
# Development
npm run dev              # Start dev server (http://localhost:5173)

# Testing
npm test                 # Run tests in watch mode
npm run test:run         # Run tests once (CI mode)
npm run test:coverage    # Generate coverage report
npm run test:ui          # Open Vitest UI

# Code Quality
npm run lint             # Check linting with oxlint
npm run lint:fix         # Auto-fix linting issues
npm run format           # Format code with oxfmt
npm run format:check     # Check formatting without changes
npm run typecheck        # TypeScript type checking

# Validation (Run before commit)
npm run validate         # Master validation: lint + format + typecheck + test

# Build
npm run build            # Production build (TypeScript + Vite)
npm run preview          # Preview production build
```

## Technology Stack

- **React 19** + **Vite 6** - Framework and build tool
- **TypeScript** in strict mode
- **CodeMirror 6** (~300KB) - Code editor (NOT Monaco)
- **D3.js + SVG** - Data structure visualization
- **Framer Motion 12** - Animations (React 19 compatible)
- **SWC WASM** (`@swc/wasm-web`) - Code transformation (20-70x faster than Babel)
- **Vitest 4** - Testing with browser mode + bundled expect for sandbox
- **Oxlint + Oxfmt** - Rust-based linting/formatting (50-100x faster than ESLint/Prettier)
- **Zustand** - State management
- **Lefthook** - Pre-commit validation hooks

## Architecture Patterns

### 1. Sandboxed Code Execution

User JavaScript runs in isolated iframe with `sandbox="allow-scripts"`:

- **Loop Protection**: Inject counters during SWC transformation (NOT setTimeout - won't fire if thread blocked)
- **Operation Capture**: Instrument code with `__capture()` calls for visualization steps
- **Security**: Defense-in-depth postMessage validation (type whitelist + schema + source check)
- **Message Correlation**: Use unique IDs to match request/response pairs

**Critical**: Cannot rely on origin checks (sandboxed iframes have null origin). See `src/lib/execution/messageValidation.ts`

### 2. D3 + React 19 Integration

**Problem**: D3 and React both want DOM ownership, causing flickering and lost elements.

**Solution**: D3Adapter pattern with exclusive ref-based ownership:

```tsx
function D3Visualization({ data }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // D3 owns this DOM node - React never touches it
    const svg = d3.select(svgRef.current);
    // All D3 manipulations here

    return () => svg.selectAll("*").remove();
  }, [data]);

  // React renders once, then hands off to D3
  return <svg ref={svgRef} />;
}
```

**Always** wrap D3 components in error boundaries. See `src/components/visualizers/D3Adapter.tsx` for the pattern.

### 3. Dual Testing Architecture

**Development Testing** (Vitest + Browser Mode):

- Tests application components, utilities, stores
- Run via `npm test` during development
- Coverage thresholds: 80% statements, 75% branches (enforced)

**Runtime Sandbox Testing** (Bundled Vitest expect):

- Tests user code in sandboxed iframe
- Bundle Vitest's `expect` function for sandbox use
- Configured in `vite.config.ts` with separate entry point

### 4. Code Instrumentation with SWC

Initialize SWC WASM once on app mount: `await initializeSWC()`

Transform user code to:

1. Inject loop counters (detect infinite loops at 100k iterations)
2. Add `__capture()` calls for operation tracking
3. Add error boundaries

See `src/lib/execution/instrumenter.ts` for implementation.

## Project Structure

```
src/
├── components/
│   ├── EditorPanel/           # CodeMirror wrapper, controls, hints
│   ├── VisualizationPanel/    # D3Adapter, animation controller, mode selector
│   ├── TestPanel/             # Test case selection and results
│   └── visualizers/           # One per data structure (Array, LinkedList, etc.)
├── lib/
│   ├── dataStructures/        # Tracked implementations (TrackedArray, etc.)
│   ├── execution/             # Sandbox, instrumenter, loop protection, validation
│   ├── testing/               # Test runner, expect bundle, test case definitions
│   └── animation/             # Animation step management, Framer Motion presets
├── store/
│   └── useAppStore.ts         # Zustand global state
└── templates/                 # Skeleton code per data structure/difficulty
```

Place shared utilities in `src/lib/` - this is the project's standard library.

## Critical Implementation Details

### Security: postMessage Validation

**Never** check for null origin alone. Use defense-in-depth:

```typescript
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
  handleMessage(event.data);
});
```

### Loop Detection: Code Injection Pattern

Transform loops to inject counters:

```javascript
// User writes:
while (condition) {
  body;
}

// SWC transforms to:
let __loopCount_1 = 0;
while (condition) {
  if (++__loopCount_1 > 100000) {
    throw new Error("Infinite loop detected");
  }
  body;
}
```

Apply to: `while`, `for`, `do-while`, and recursive functions (call stack depth).

### CSP Limitation

**Known Issue**: srcdoc iframes inherit parent page CSP (W3C marked "wontfix" Dec 2024). Cannot rely solely on iframe CSP. Use sandbox attribute + postMessage validation instead.

## Test Case System

Each data structure has 3 difficulty levels (Easy/Medium/Hard):

- **skeletonCode**: Template with TODOs for user to fill
- **assertions**: Vitest expect syntax run in sandbox
- **referenceSolution**: Shown when user clicks "Show Solution"
- **hints**: Progressively revealed
- **acceptanceCriteria**: Objective pass/fail conditions

Test files in `src/lib/testing/testCases/[dataStructure]Tests.ts`

## Validation & Quality Gates

**Pre-commit hooks** (via Lefthook) enforce:

1. Linting (oxlint)
2. Formatting (oxfmt)
3. Type checking (tsc)
4. Tests passing (vitest)

Coverage thresholds create backpressure:

- 80% statements
- 75% branches
- 80% functions
- 80% lines

Exit code ≠ 0 blocks commits. CI stays green.

## Common Pitfalls

1. **D3/React Conflicts**: Always use D3Adapter pattern with refs. Never mix React rendering with D3 DOM manipulation.

2. **SWC Initialization**: Must call `await initializeSWC()` before first code transformation. Only initialize once.

3. **Type Safety**: Strict mode enabled. No `any` types - use `unknown` and narrow with type guards.

4. **Coverage Drops**: Add tests if coverage falls below 80%. Agents cannot proceed with failing coverage.

5. **Bundle Size**: CodeMirror (~300KB) not Monaco (~2.4MB+). If Monaco needed, expect 8-10x bundle increase.

## AI Agent Development Notes

This project uses the **Ralph Wiggum methodology** for autonomous agent development:

### Core Principles

- **Iteration over perfection**: Clean slate iterations until completion
- **Clear success criteria**: Tests pass, types resolve, builds succeed
- **CI green guarantee**: Never commit broken code
- **Backpressure via testing**: Automated validation prevents forward progress with broken code
- **Machine-verifiable signals**: Objective criteria (test pass/fail, exit codes)

### Support Files

- `AGENTS.md`: Operational guide (≤1000 words) loaded each iteration
- `IMPLEMENTATION_PLAN.md`: Persistent task tracking between loops
- `prd.json`: Machine-readable user stories with acceptance criteria
- `specs/`: One markdown file per topic of concern

### Completion Criteria

Tasks are complete when ALL conditions met:

- Tests passing (`npm run test:run` exits 0)
- Types valid (`npm run typecheck` exits 0)
- Linting passes (`npm run lint` exits 0)
- Formatting correct (`npm run format:check` exits 0)
- Coverage ≥80%

Use `npm run validate` to check all criteria.

## Performance Targets

- **Initial bundle**: ~3-4MB (vs 8-15MB with Monaco)
- **SWC transformation**: <10ms for typical user code
- **D3 rendering**: 16ms budget (60fps) for educational datasets
- **Test execution**: <1s for typical test cases

## Reference Documentation

See PRD.md for:

- Comprehensive security architecture
- Detailed visualization specifications
- Complete test case examples
- Bundle configuration for Vitest expect
- SWC transformation implementation
- Framer Motion animation patterns
