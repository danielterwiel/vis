# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Data structure visualizer. Code editor (left) + animated D3 visualization (right). User writes JS algorithms, sees real-time animation. Test cases at 3 difficulty levels. **100% client-side.**

## Commands

```bash
npm run dev              # Dev server at localhost:5173
npm run validate         # REQUIRED before commit: lint + format + typecheck + test
npm run test:run         # Tests once (CI)
npm run test -- path     # Single test file
npm run typecheck        # TS validation only
npm run lint:fix         # Auto-fix lint
```

## Tech Constraints

- CodeMirror 6 (NOT Monaco) - bundle size
- D3.js + SVG (NOT canvas) - for animations
- SWC WASM (NOT Babel) - code transformation
- Oxlint/Oxfmt (NOT ESLint/Prettier)
- No `any` - use `unknown` + type guards
- Coverage ≥80% enforced

## Critical Patterns

### D3 + React (NEVER violate)

D3 and React both manipulate DOM → conflicts. Solution: D3 owns ref exclusively.

```tsx
const svgRef = useRef<SVGSVGElement>(null);
useEffect(() => {
  const svg = d3.select(svgRef.current); // D3 owns this
  return () => svg.selectAll("*").remove();
}, [data]);
return <svg ref={svgRef} />; // React renders once, never touches
```

See `src/components/visualizers/D3Adapter.tsx`. Wrap in error boundaries.

### Sandboxed Execution

User code runs in iframe `sandbox="allow-scripts"`:
- Loop protection via SWC-injected counters (NOT setTimeout)
- postMessage validation: type whitelist + schema + source check
- Sandboxed iframes have null origin - cannot rely on origin alone

See `src/lib/execution/messageValidation.ts`.

### SWC Init

Must call `await initializeSWC()` once on app mount before any transforms.

## Key Locations

- `src/lib/execution/` - Sandbox, instrumenter, validation
- `src/lib/testing/testCases/` - Test definitions per data structure
- `src/components/visualizers/` - D3 visualizers per structure
- `src/store/useAppStore.ts` - Zustand global state
- `src/templates/` - Skeleton code, must register in `index.ts`

## Pitfalls

- Never mix React + D3 DOM manipulation
- SWC init once only, don't re-init
- Bundle <4MB (CodeMirror already ~300KB)

## Plan Mode

- Make plan extremely concise. Sacrifice grammar for concision.
- List unresolved questions at end, if any.
