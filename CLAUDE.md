# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CodePen-like application for visualizing data structures. Code editor (left) with real-time animated visualization (right). Users write JavaScript algorithms that manipulate data structures. Test cases at 3 difficulty levels per structure. **100% client-side, no backend.**

## Essential Commands

```bash
# Development
npm run dev              # http://localhost:5173

# Validation (run before any commit or iteration completion)
npm run validate         # Runs: lint + format:check + typecheck + test:run

# Individual checks
npm run test:run         # Run tests once (CI mode)
npm run test             # Watch mode
npm run test:coverage    # Coverage report (80% threshold)
npm run test:ui          # Vitest UI
npm run typecheck        # TypeScript validation
npm run lint             # oxlint check
npm run lint:fix         # Auto-fix linting
npm run format           # oxfmt format
npm run format:check     # Check formatting only
```

## Tech Stack (Critical Constraints)

- **React 19** + **Vite 6** + **TypeScript** (strict mode)
- **CodeMirror 6** (~300KB) - NOT Monaco (would be 2.4MB+)
- **D3.js + SVG** - Visualizations (NOT canvas)
- **Framer Motion 12** - Animations (React 19 compatible)
- **SWC WASM** - Code transformation (NOT Babel)
- **Vitest 4** - Testing (browser mode + bundled expect)
- **Oxlint + Oxfmt** - Linting/formatting (NOT ESLint/Prettier)
- **Zustand** - State management
- **Lefthook** - Git hooks

## Architecture: Three Critical Patterns

### 1. D3 + React Integration (NEVER Violate This)

**Problem**: D3 and React both manipulate DOM → flickering, lost elements, crashes.

**Solution**: D3Adapter pattern with exclusive ref ownership:

```tsx
function D3Visualization({ data }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current); // D3 owns this node
    // All D3 code here
    return () => svg.selectAll("*").remove();
  }, [data]);

  return <svg ref={svgRef} />; // React renders once, never touches again
}
```

**Always** wrap D3 components in error boundaries. See `src/components/visualizers/D3Adapter.tsx`.

### 2. Sandboxed Code Execution

User code runs in iframe with `sandbox="allow-scripts"`:

- **Loop Protection**: SWC injects counters (NOT setTimeout - won't fire if blocked)
- **Operation Capture**: Instrument with `__capture()` calls
- **Security**: Defense-in-depth postMessage (type whitelist + schema + source)
- **Critical**: Sandboxed iframes have null origin - cannot rely on origin checks alone

See `src/lib/execution/messageValidation.ts` for validation pattern.

### 3. Dual Testing Architecture

**Development Tests**: Vitest + browser mode for app components
**Runtime Tests**: Bundled Vitest `expect` for user code in sandbox

Coverage thresholds (enforced): 80% statements, 75% branches, 80% functions/lines

## Project Structure

```
src/
├── components/
│   ├── EditorPanel/        # CodeMirror + controls
│   ├── VisualizationPanel/ # D3Adapter + animation
│   ├── TestPanel/          # Test selection
│   └── visualizers/        # One per data structure
├── lib/                    # Shared utilities (project stdlib)
│   ├── dataStructures/     # TrackedArray, TrackedLinkedList, etc.
│   ├── execution/          # Sandbox, instrumenter, validation
│   ├── testing/            # Test runner, test case definitions
│   └── animation/          # Animation step management
├── store/
│   └── useAppStore.ts      # Zustand global state
└── templates/              # Skeleton code per structure/difficulty
```

## Ralph Wiggum Methodology (AI Agent Development)

This project follows the **Ralph Wiggum** autonomous development pattern.

### Core Files

- **PRD.md**: Machine-readable user stories with acceptance criteria
- **CLAUDE.md**: This file - architecture guidance
- **progress.txt**: Iteration tracking (optional)

### Iteration Loop

1. **Read PRD.md** - Pick next user story with `passes: false`
2. **Implement** - Make changes to satisfy acceptance criteria
3. **Verify with agent-browser** - Use interactive browser validation
4. **Validate** - Run `npm run validate` (must exit 0)
5. **Mark complete** - Update user story to `passes: true` in PRD.md
6. **Repeat** - Next story or done if all `passes: true`

### Agent-Browser Verification (REQUIRED)

After each implementation, verify using `agent-browser`:

```bash
# 1. Capture current state (interactive elements with refs)
agent-browser snapshot -i

# 2. Execute targeted interactions using refs
agent-browser click @e2
agent-browser fill @e3 "test input"

# 3. Re-snapshot to confirm state transitions
agent-browser snapshot -i

# 4. Verify specific conditions
agent-browser is visible @ref
agent-browser get text @ref --json
```

**Key Points**:

- Use refs (@e1, @e2) for deterministic element selection
- Snapshot before and after interactions to confirm state changes
- Filter snapshots (`-i -c -d 3`) to focus on relevant elements
- Use `--json` for machine-readable verification

See: https://raw.githubusercontent.com/vercel-labs/agent-browser/refs/heads/main/README.md

### Completion Criteria (ALL Required)

- ✅ All PRD user stories have `passes: true`
- ✅ `npm run validate` exits 0
- ✅ Coverage ≥80%
- ✅ No TypeScript errors
- ✅ No linting errors
- ✅ Browser verification confirms expected behavior

**NEVER commit if `npm run validate` fails.**

## Critical Implementation Details

### SWC Initialization

Must call `await initializeSWC()` once on app mount. See `src/lib/execution/instrumenter.ts`.

### Loop Detection Pattern

```javascript
// User writes:
while (condition) {
  body;
}

// SWC transforms to:
let __loopCount_1 = 0;
while (condition) {
  if (++__loopCount_1 > 100000) throw new Error("Infinite loop detected");
  body;
}
```

### postMessage Validation (Defense-in-Depth)

```typescript
const ALLOWED_MESSAGE_TYPES = new Set(["test-result", "execution-complete"]);

window.addEventListener("message", (event) => {
  if (!event.data || typeof event.data !== "object") return; // 1. Structure
  if (!ALLOWED_MESSAGE_TYPES.has(event.data.type)) return; // 2. Type whitelist
  if (!validateMessageSchema(event.data)) return; // 3. Schema
  if (event.source !== expectedIframe.contentWindow) return; // 4. Source
  handleMessage(event.data); // 5. Process
});
```

### Test Case System

Each data structure has 3 difficulty levels in `src/lib/testing/testCases/[structure]Tests.ts`:

- `skeletonCode` - Template with TODOs
- `referenceSolution` - Shown on "Show Solution"
- `assertions` - Vitest expect syntax
- `hints` - Progressively revealed
- `acceptanceCriteria` - Objective pass/fail

### Template Registration

Templates must be registered in `src/templates/index.ts`:

```typescript
import { registerArrayTemplates } from "./array";
import { registerLinkedListTemplates } from "./linkedList";

registerArrayTemplates();
registerLinkedListTemplates();
// etc.
```

Each template file exports registration function that calls:

```typescript
skeletonCodeSystem.registerTemplate(dataStructure, difficulty, code);
```

## Common Pitfalls

1. **D3/React Conflicts** - Always use D3Adapter pattern. Never mix React + D3 DOM manipulation.
2. **SWC Init** - Must initialize once before transformations. Don't re-initialize.
3. **Type Safety** - Strict mode. No `any` - use `unknown` + type guards.
4. **Coverage** - Must maintain ≥80%. Add tests if it drops.
5. **Bundle Size** - Keep <4MB. CodeMirror is already 300KB.
6. **CSP Limitation** - Sandboxed iframes inherit parent CSP. Use sandbox + postMessage validation.

## Performance Targets

- Bundle: ~3-4MB
- SWC transform: <10ms
- D3 rendering: 16ms (60fps)
- Test execution: <1s per case

## Tool Usage Requirements

When implementing features:

1. **Use Task tool** for exploration (Explore agent) when researching patterns
2. **Use Glob/Grep** for targeted file/code searches
3. **Use Read** before Edit/Write (required)
4. **Use agent-browser** for verification after implementation
5. **Run `npm run validate`** before marking user story complete

## Reference

For detailed specifications, see PRD.md:

- Security architecture
- Visualization specifications
- Complete test case examples
- SWC transformation details
- Framer Motion patterns
