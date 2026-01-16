---
name: react-best-practices
description: React performance patterns for this D3+SVG visualization project. Apply when writing React components, hooks, state management, or reviewing code for performance issues.
---

# React Best Practices

Source: [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices)

## Avoid Barrel Imports (CRITICAL)

Import directly from source files, not barrel files (`index.js`). Barrel files can load thousands of modules.

```tsx
// Bad - loads 1,583 modules
import { Check, X } from "lucide-react";

// Good - loads 3 modules
import Check from "lucide-react/dist/esm/icons/check";
```

## Functional setState (MEDIUM)

Use functional updates when new state depends on previous state. Prevents stale closures, keeps callbacks stable.

```tsx
// Bad - stale closure risk
setItems([...items, newItem]);

// Good - always has latest state
setItems((curr) => [...curr, newItem]);
```

## Lazy State Initialization (MEDIUM)

Pass function to `useState` for expensive initial values. Without it, initializer runs every render.

```tsx
// Bad - parses on every render
useState(JSON.parse(localStorage.getItem("x") || "{}"));

// Good - parses once
useState(() => JSON.parse(localStorage.getItem("x") || "{}"));
```

## Derived State (MEDIUM)

Subscribe to processed boolean state, not raw continuous values.

```tsx
// Bad - re-renders on every pixel change
const width = useWindowWidth();
const isMobile = width < 768;

// Good - re-renders only when crossing threshold
const isMobile = useMediaQuery("(max-width: 767px)");
```

## Narrow Effect Dependencies (LOW)

Use primitives in dependency arrays, not objects.

```tsx
// Bad - runs when any user property changes
useEffect(() => { ... }, [user])

// Good - runs only when id changes
useEffect(() => { ... }, [user.id])
```

## Animate SVG Wrapper (LOW)

Wrap SVG in `<div>` for CSS animations. Many browsers lack hardware acceleration for SVG animations.

```tsx
// Bad - no GPU acceleration
<svg className="animate-spin">...</svg>

// Good - GPU accelerated
<div className="animate-spin"><svg>...</svg></div>
```

## Hoist Static JSX (LOW)

Extract static JSX outside components. Especially valuable for large static SVG nodes.

```tsx
// Bad - recreated every render
function Icon() {
  const svg = <svg>...</svg>;
  return svg;
}

// Good - single reference reused
const svg = <svg>...</svg>;
function Icon() {
  return svg;
}
```

## Explicit Conditional Rendering (LOW)

Use ternary instead of `&&` to prevent rendering `0` or `NaN`.

```tsx
// Bad - renders "0" when count is 0
{
  count && <span>{count}</span>;
}

// Good - renders nothing when count is 0
{
  count > 0 ? <span>{count}</span> : null;
}
```

## Set/Map for Lookups (LOW-MEDIUM)

Use `Set.has()` instead of `Array.includes()` for repeated lookups. O(1) vs O(n).

```tsx
// Bad - O(n) per check
const ids = ["a", "b", "c"];
items.filter((x) => ids.includes(x.id));

// Good - O(1) per check
const ids = new Set(["a", "b", "c"]);
items.filter((x) => ids.has(x.id));
```

## Event Handler Refs (LOW)

Store callbacks in refs when used in effects that shouldn't re-subscribe on callback changes.

```tsx
const handlerRef = useRef(handler);
useEffect(() => {
  handlerRef.current = handler;
});
useEffect(() => {
  const listener = (e) => handlerRef.current(e);
  window.addEventListener("resize", listener);
  return () => window.removeEventListener("resize", listener);
}, []); // stable - never re-subscribes
```
