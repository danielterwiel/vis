# Product Requirements Document

## Project: Data Structure Visualization Platform - Ralph Iteration #1

This PRD follows the [Ralph Wiggum methodology](https://www.aihero.dev/getting-started-with-ralph) for autonomous AI development.

---

## User Stories

### US-001: Fix Data Structure Template Registration

**Category**: Bug Fix - Critical

**Description**: The data structure selector throws "No skeleton template found" errors when selecting Stack, Queue, Binary Tree, Graph, or Hash Map options. Only Array and Linked List have registered templates.

**Current Behavior**:

```
Uncaught Error: No skeleton template found for stack (easy)
    at SkeletonCodeSystemImpl.getSkeletonCode (skeletonCodeSystem.ts:43:13)
```

**Expected Behavior**: All data structures should load appropriate skeleton code templates without errors.

**Steps to Verify**:

1. Run `npm run dev` and open the application
2. Select "Stack" from the data structure dropdown
3. Verify skeleton code loads without error
4. Repeat for "Queue", "Binary Tree", "Graph", and "Hash Map"
5. Switch between all difficulty levels (easy/medium/hard) for each structure
6. Run `npm run validate` to ensure all tests pass

**Acceptance Criteria**:

- [x] Stack templates registered for all 3 difficulty levels
- [x] Queue templates registered for all 3 difficulty levels
- [x] Binary Tree templates registered for all 3 difficulty levels
- [x] Graph templates registered for all 3 difficulty levels
- [x] Hash Map templates registered for all 3 difficulty levels
- [x] No console errors when switching between any data structures
- [x] All templates follow the same pattern as array/linkedList templates
- [x] Templates are registered in `src/templates/index.ts`
- [x] All existing tests continue to pass

**Dependencies**: None

**Priority**: P0 (Blocker)

**Status**: `complete`

**Passes**: `true`

---

### US-002: Implement Proper Linked List Visualization

**Category**: Feature - Visualization

**Description**: The current Linked List visualization uses a bar chart (like arrays), which doesn't properly represent the node-and-pointer structure of a linked list. Need to research and implement a proper visualization showing nodes connected by arrows/pointers.

**Current Behavior**: Linked lists are visualized as bars, identical to array visualization.

**Expected Behavior**: Linked lists should display as a series of nodes (boxes) with arrows pointing from one node to the next, clearly showing the pointer-based structure.

**Research Requirements**:

- Study standard linked list visualization patterns from educational resources
- Ensure visualization shows:
  - Individual nodes as boxes/rectangles containing values
  - Pointer arrows connecting nodes
  - Head and tail markers
  - Null pointer at the end
  - Visual distinction between current node, comparing nodes, and found nodes during operations

**Steps to Verify**:

1. Run `npm run dev`
2. Select "Linked List" from dropdown
3. Run test code and observe visualization
4. Verify nodes appear as connected boxes with arrows
5. Verify operations (find, reverse, cycle detection) are visually clear
6. Run `npm run test:run` to ensure visualization tests pass
7. Run `npm run validate` for full validation

**Acceptance Criteria**:

- [x] Nodes rendered as rectangles/boxes with values inside
- [x] Arrows/pointers connect consecutive nodes
- [x] Head marker clearly indicates first node
- [x] Tail marker clearly indicates last node
- [x] Null pointer visualized at list end
- [x] Find operation highlights nodes during traversal
- [x] Reverse operation shows pointer direction changes
- [x] Cycle detection shows slow/fast pointer movement
- [x] Visualization responds to all TrackedLinkedList operations
- [x] D3Adapter pattern maintained (no React/D3 conflicts)
- [x] Animation smooth at 60fps
- [x] Responsive to container size changes
- [x] Tests pass with >80% coverage

**Dependencies**: None

**Priority**: P0 (Blocker)

**Status**: `complete`

**Passes**: `true`

---

### US-003: Implement Stack Visualization

**Category**: Feature - Visualization

**Description**: Create proper visualization for Stack data structure showing LIFO (Last In First Out) behavior with vertical stacking of elements.

**Expected Behavior**: Stack should visualize as a vertical column where elements are pushed onto the top and popped from the top.

**Research Requirements**:

- Study standard stack visualization patterns
- Show push operation adding to top
- Show pop operation removing from top
- Highlight top element
- Show stack growth/shrinkage vertically

**Steps to Verify**:

1. Run `npm run dev`
2. Select "Stack" from dropdown
3. Run test code for each difficulty level
4. Verify visualization shows vertical stacking
5. Verify push/pop operations are visually clear
6. Run `npm run test:run` and `npm run validate`

**Acceptance Criteria**:

- [x] Elements displayed vertically as a stack
- [x] Push operation animates element added to top
- [x] Pop operation animates element removed from top
- [x] Top element clearly marked/highlighted
- [x] Stack grows upward or downward consistently
- [x] Empty stack state shows placeholder
- [x] Works with TrackedStack data structure
- [x] All stack tests trigger appropriate visualizations
- [x] D3Adapter pattern followed
- [x] 60fps animation performance
- [x] Tests pass with >80% coverage

**Dependencies**: US-001

**Priority**: P0 (Blocker)

**Status**: `complete`

**Passes**: `true`

---

### US-004: Implement Queue Visualization

**Category**: Feature - Visualization

**Description**: Create proper visualization for Queue data structure showing FIFO (First In First Out) behavior with horizontal flow.

**Expected Behavior**: Queue should visualize as a horizontal line where elements are enqueued at the back and dequeued from the front.

**Research Requirements**:

- Study standard queue visualization patterns
- Show enqueue operation adding to back/rear
- Show dequeue operation removing from front
- Highlight front and rear pointers
- Show queue growth/shrinkage horizontally

**Steps to Verify**:

1. Run `npm run dev`
2. Select "Queue" from dropdown
3. Run test code for each difficulty level
4. Verify visualization shows horizontal FIFO flow
5. Verify enqueue/dequeue operations are visually clear
6. Run `npm run test:run` and `npm run validate`

**Acceptance Criteria**:

- [x] Elements displayed horizontally as a queue
- [x] Enqueue operation animates element added to rear
- [x] Dequeue operation animates element removed from front
- [x] Front and rear pointers clearly marked
- [x] Queue flows left-to-right or right-to-left consistently
- [x] Empty queue state shows placeholder
- [x] Works with TrackedQueue data structure
- [x] All queue tests trigger appropriate visualizations
- [x] D3Adapter pattern followed
- [x] 60fps animation performance
- [x] Tests pass with >80% coverage

**Dependencies**: US-001

**Priority**: P0 (Blocker)

**Status**: `complete`

**Passes**: `true`

---

### US-005: Implement Binary Tree Visualization

**Category**: Feature - Visualization

**Description**: Create proper visualization for Binary Tree data structure showing hierarchical node relationships with parent-child connections.

**Expected Behavior**: Binary tree should visualize as a hierarchical tree with nodes connected by edges, showing parent-child relationships.

**Research Requirements**:

- Study standard tree visualization algorithms (Reingold-Tilford, etc.)
- Show nodes arranged in levels/depth
- Show edges connecting parent to children
- Handle tree traversals (inorder, preorder, postorder)
- Handle tree operations (insert, delete, search)

**Steps to Verify**:

1. Run `npm run dev`
2. Select "Binary Tree" from dropdown
3. Run test code for each difficulty level
4. Verify visualization shows hierarchical tree structure
5. Verify tree operations are visually clear
6. Run `npm run test:run` and `npm run validate`

**Acceptance Criteria**:

- [x] Nodes arranged hierarchically by depth/level
- [x] Edges connect parent nodes to children
- [x] Root node clearly marked at top
- [x] Leaf nodes clearly identifiable
- [x] Left and right children positioned correctly
- [x] Tree balancing/rotations visualized if applicable
- [x] Traversal operations highlight nodes in correct order
- [x] Search operations show comparison path
- [x] Works with TrackedBinaryTree data structure
- [x] All tree tests trigger appropriate visualizations
- [x] D3Adapter pattern followed
- [x] 60fps animation performance
- [x] Handles trees of varying sizes gracefully
- [x] Tests pass with >80% coverage

**Dependencies**: US-001

**Priority**: P1 (High)

**Status**: `complete`

**Passes**: `true`

---

### US-006: Implement Graph Visualization

**Category**: Feature - Visualization

**Description**: Create proper visualization for Graph data structure showing vertices and edges with support for directed/undirected graphs.

**Expected Behavior**: Graph should visualize as vertices (nodes) connected by edges (lines/arrows) with force-directed or fixed layout.

**Research Requirements**:

- Study graph visualization algorithms (force-directed layout, etc.)
- Show vertices as nodes with labels
- Show edges as lines (undirected) or arrows (directed)
- Handle graph operations (add vertex/edge, search, traversal)
- Consider weighted edges display

**Steps to Verify**:

1. Run `npm run dev`
2. Select "Graph" from dropdown
3. Run test code for each difficulty level
4. Verify visualization shows graph structure
5. Verify graph operations are visually clear
6. Run `npm run test:run` and `npm run validate`

**Acceptance Criteria**:

- [ ] Vertices rendered as labeled nodes
- [ ] Edges rendered as lines or arrows
- [ ] Directed graphs show arrow directions
- [ ] Weighted edges show weights if applicable
- [ ] Graph traversals (BFS, DFS) highlight nodes in order
- [ ] Search operations show exploration path
- [ ] Connected components visually distinguishable
- [ ] Works with TrackedGraph data structure
- [ ] All graph tests trigger appropriate visualizations
- [ ] D3Adapter pattern followed
- [ ] 60fps animation performance for reasonable graph sizes
- [ ] Handles graphs of varying densities
- [ ] Tests pass with >80% coverage

**Dependencies**: US-001

**Priority**: P1 (High)

**Status**: `pending`

**Passes**: `false`

---

### US-007: Implement Hash Map Visualization

**Category**: Feature - Visualization

**Description**: Create proper visualization for Hash Map data structure showing buckets, keys, values, and collision handling.

**Expected Behavior**: Hash map should visualize as an array of buckets with key-value pairs, showing hash function distribution and collision resolution.

**Research Requirements**:

- Study hash map visualization patterns
- Show array of buckets/slots
- Show key-value pairs within buckets
- Visualize hash function mapping keys to buckets
- Show collision handling (chaining or open addressing)

**Steps to Verify**:

1. Run `npm run dev`
2. Select "Hash Map" from dropdown
3. Run test code for each difficulty level
4. Verify visualization shows bucket array structure
5. Verify operations (get, set, delete) are visually clear
6. Run `npm run test:run` and `npm run validate`

**Acceptance Criteria**:

- [ ] Buckets displayed as array slots
- [ ] Key-value pairs visible within buckets
- [ ] Hash function visualization shows key mapping to bucket
- [ ] Collision handling visualized (chaining or open addressing)
- [ ] Get operation highlights bucket access and key comparison
- [ ] Set operation shows insertion and collision resolution
- [ ] Delete operation shows removal
- [ ] Load factor/capacity displayed
- [ ] Works with TrackedHashMap data structure
- [ ] All hash map tests trigger appropriate visualizations
- [ ] D3Adapter pattern followed
- [ ] 60fps animation performance
- [ ] Tests pass with >80% coverage

**Dependencies**: US-001

**Priority**: P1 (High)

**Status**: `pending`

**Passes**: `false`

---

### US-008: Fix Difficulty Badge Text Alignment

**Category**: Bug Fix - UI/UX

**Description**: The "Easy" badge next to the data structure selector has incorrect text padding, with text padded to the top of its container instead of being vertically centered.

**Current Behavior**: Badge text appears top-aligned within the badge container.

**Expected Behavior**: Badge text should be vertically centered within the badge container, aligned with other header elements.

**Location**: `src/styles/global.css` lines 171-178 (`.difficulty-badge`)

**Steps to Verify**:

1. Run `npm run dev`
2. Observe the difficulty badge next to the data structure selector
3. Verify text is vertically centered in the badge
4. Test on different difficulty levels (Easy, Medium, Hard)
5. Test on different browsers (Chrome, Firefox, Safari)
6. Run `npm run validate`

**Acceptance Criteria**:

- [ ] Badge text vertically centered in all difficulty levels
- [ ] Badge aligns properly with adjacent select dropdown
- [ ] Badge height consistent across difficulty levels
- [ ] No visual regression in light/dark themes
- [ ] Works across Chrome, Firefox, and Safari

**Dependencies**: None

**Priority**: P2 (Medium)

**Status**: `pending`

**Passes**: `false`

---

### US-009: Fix Button Icon Alignment

**Category**: Bug Fix - UI/UX

**Description**: The "Run all tests" and "Play" buttons have icons that are not horizontally aligned with their text labels.

**Current Behavior**: Icons appear misaligned (vertically) relative to button text.

**Expected Behavior**: Icons should be perfectly aligned with button text, creating a cohesive visual appearance.

**Locations**:

- `src/components/EditorPanel/RunButton.tsx` and `RunButton.css`
- Play button in visualization controls

**Steps to Verify**:

1. Run `npm run dev`
2. Observe "Run all tests" button above the editor
3. Observe "Play" button in visualization controls
4. Verify icons are vertically centered with text
5. Test on different browsers and screen sizes
6. Run `npm run validate`

**Acceptance Criteria**:

- [ ] "Run all tests" button icon aligned with text
- [ ] "Play" button icon aligned with text
- [ ] Icons maintain alignment on hover states
- [ ] Icons maintain alignment when button is disabled
- [ ] Consistent alignment across light/dark themes
- [ ] Works across Chrome, Firefox, and Safari
- [ ] No layout shift on button state changes

**Dependencies**: None

**Priority**: P2 (Medium)

**Status**: `pending`

**Passes**: `false`

---

### US-010: Fix Examples Button Alignment

**Category**: Bug Fix - UI/UX

**Description**: The "Examples" button (PresetSelector trigger) has the same alignment issue as other buttons - icon not properly aligned with text.

**Current Behavior**: Button icon appears misaligned relative to button text.

**Expected Behavior**: Button icon should be perfectly aligned with button text.

**Location**: `src/components/EditorPanel/PresetSelector.tsx` and `PresetSelector.css`

**Steps to Verify**:

1. Run `npm run dev`
2. Observe "Examples" button in the editor header
3. Verify icon is vertically centered with text
4. Click button to ensure alignment maintained in hover/active states
5. Test on different browsers
6. Run `npm run validate`

**Acceptance Criteria**:

- [ ] Examples button icon aligned with text
- [ ] Icon maintains alignment on hover states
- [ ] Icon maintains alignment when button is disabled
- [ ] Consistent alignment across light/dark themes
- [ ] Works across Chrome, Firefox, and Safari

**Dependencies**: None

**Priority**: P2 (Medium)

**Status**: `pending`

**Passes**: `false`

---

### US-011: Fix Examples Modal Background Transparency

**Category**: Bug Fix - UI/UX

**Description**: The Examples Modal (PresetSelector modal) has a transparent background instead of the expected semi-transparent dark overlay.

**Current Behavior**: Modal backdrop is transparent or not rendering correctly.

**Expected Behavior**: Modal should have a semi-transparent dark backdrop (rgba(0, 0, 0, 0.5)) with optional blur effect, making the modal content stand out and dimming the background.

**Location**: `src/components/EditorPanel/PresetSelector.css` line 30-39 (`.preset-backdrop`)

**Steps to Verify**:

1. Run `npm run dev`
2. Click "Examples" button to open modal
3. Verify backdrop is semi-transparent dark overlay
4. Verify modal content is clearly visible
5. Click outside modal to close and verify backdrop disappears
6. Test in light and dark themes
7. Run `npm run validate`

**Acceptance Criteria**:

- [ ] Modal backdrop renders with rgba(0, 0, 0, 0.5) background
- [ ] Backdrop covers entire viewport
- [ ] Backdrop dims background content
- [ ] Modal content clearly visible above backdrop
- [ ] Backdrop closes modal when clicked
- [ ] Works in both light and dark themes
- [ ] No console errors or warnings

**Dependencies**: None

**Priority**: P2 (Medium)

**Status**: `pending`

**Passes**: `false`

---

### US-012: Fix Linked List Reference Solution Implementation

**Category**: Bug Fix - Code Correctness

**Description**: The "Show solution" feature for Linked List provides code that uses `list.find()` method, but the tests fail with "list.find is not a function" error. Despite TrackedLinkedList having a find() method, the test execution context doesn't recognize it.

**Current Behavior**:

```
Traverse the list and find a specific element
list.find is not a function
Failed after 110ms
```

**Expected Behavior**: Reference solution should work correctly with the test execution environment, properly finding elements in the linked list.

**Investigation Required**:

- Check how TrackedLinkedList is instantiated in test execution sandbox
- Verify find() method exists and is accessible in sandbox context
- Check if method binding or prototype chain is broken
- Verify reference solution in `src/lib/testing/testCases/linkedListTests.ts` lines 19-23

**Steps to Verify**:

1. Run `npm run dev`
2. Select "Linked List" with any difficulty
3. Click "Show Solution" in visualization mode selector
4. Click "Run all tests" button
5. Verify all tests pass (green checkmarks)
6. Test all three difficulty levels (Easy, Medium, Hard)
7. Run `npm run test:run` to verify test suite passes
8. Run `npm run validate` for full validation

**Acceptance Criteria**:

- [x] Reference solution code executes without errors
- [x] All three linked list tests pass (Easy, Medium, Hard)
- [x] find() method correctly locates elements
- [x] reverse() method correctly reverses list
- [x] hasCycle() method correctly detects cycles
- [x] Tests show green "Passed" status
- [x] Visualization shows correct operation steps
- [x] No console errors during test execution
- [x] All test assertions pass

**Dependencies**: None

**Priority**: P0 (Blocker)

**Status**: `complete`

**Passes**: `true`

---

## Verification Commands

Run these commands to verify all acceptance criteria are met:

```bash
# Development server (manual testing)
npm run dev

# Run all tests
npm run test:run

# Type checking
npm run typecheck

# Linting
npm run lint

# Formatting check
npm run format:check

# Master validation (required before completion)
npm run validate
```

## Completion Criteria

This Ralph iteration is considered **COMPLETE** when:

1. ✅ All user stories have `passes: true`
2. ✅ `npm run validate` exits with code 0
3. ✅ All data structures (Array, Linked List, Stack, Queue, Tree, Graph, Hash Map) work without errors
4. ✅ All visualizations properly represent their respective data structures
5. ✅ All UI alignment issues are fixed
6. ✅ Examples modal renders correctly
7. ✅ All reference solutions execute without errors
8. ✅ Test coverage remains ≥80%
9. ✅ No TypeScript errors (`npm run typecheck` passes)
10. ✅ No linting errors (`npm run lint` passes)

## Notes for AI Agent

- Use `agent-browser` methodology for iteration (see: https://github.com/vercel-labs/agent-browser)
- Focus on one user story at a time
- Mark `passes: true` only when ALL acceptance criteria are met for that story
- Do NOT proceed to next story if current one blocks progress
- Run `npm run validate` frequently to catch regressions early
- Maintain test coverage above 80% at all times
- Follow D3Adapter pattern for all visualizations (no React/D3 conflicts)
- Preserve SWC transformation, loop protection, and sandbox security
- Reference `CLAUDE.md` for architecture patterns and constraints

## Sources

- [Getting Started With Ralph - AI Hero](https://www.aihero.dev/getting-started-with-ralph)
- [11 Tips For AI Coding With Ralph Wiggum - AI Hero](https://www.aihero.dev/tips-for-ai-coding-with-ralph-wiggum)
- [GitHub - agent-browser README](https://github.com/vercel-labs/agent-browser)
