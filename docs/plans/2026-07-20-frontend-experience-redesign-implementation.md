# Frontend Experience Redesign Implementation Plan

**Goal:** Rebuild the existing Travel Planner page as a polished, map-first city itinerary console with scoped feedback, an editable route spine, and responsive mobile workspace views.

**Architecture:** Keep API orchestration and authoritative trip/place state in the route page, while extracting presentational and locally interactive regions into focused components. Introduce small pure view-model helpers for labels and formatting, use Zustand only for shared map/place selection, and preserve all existing backend contracts.

**Tech Stack:** Next.js 15, React 19, TypeScript, Zustand, CSS, Lucide React, Vitest, React Testing Library, jsdom

---

### Task 1: Add Deterministic Frontend Test Infrastructure

**Files:**
- Modify: `frontend/package.json`
- Modify: `frontend/package-lock.json`
- Create: `frontend/vitest.config.ts`
- Create: `frontend/src/test/setup.ts`
- Create: `frontend/src/lib/planner-view.test.ts`

**Step 1: Add the first failing test**

Create `planner-view.test.ts` importing `formatTripRange` from the not-yet-created `planner-view` module and assert that missing dates return `日期待定`, one date returns that date, and a range returns a compact Chinese range.

**Step 2: Verify RED**

Run: `npm.cmd test -- --run src/lib/planner-view.test.ts`

Expected: FAIL because `planner-view` does not exist.

**Step 3: Install and configure the minimum test stack**

Add scripts `test: vitest` and `test:run: vitest run`. Add `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, and `@testing-library/user-event`. Configure jsdom, the `@/` alias, globals, and the shared setup file.

**Step 4: Verify the test runner reaches the intended missing-module failure**

Run: `npm.cmd test -- --run src/lib/planner-view.test.ts`

Expected: FAIL only because `@/lib/planner-view` is missing.

**Step 5: Commit**

```bash
git add frontend/package.json frontend/package-lock.json frontend/vitest.config.ts frontend/src/test/setup.ts frontend/src/lib/planner-view.test.ts
git commit -m "test: add frontend component test harness"
```

### Task 2: Create Planner View Models And Semantic Labels

**Files:**
- Create: `frontend/src/lib/planner-view.ts`
- Modify: `frontend/src/lib/planner-view.test.ts`

**Step 1: Expand failing tests**

Test these pure behaviors:

- `formatTripRange(start, end)` produces stable Chinese copy for missing, partial, and complete date ranges.
- `getSaveTone(label)` returns `error`, `working`, or `saved` from the existing save labels.
- `categoryLabel(value)` maps legacy English categories and preserves user-created Chinese tags.
- `summarizePlaces(places)` returns total, must-visit, and optional counts.
- `buildRouteTime(start, index)` creates deterministic display times at 90-minute intervals for the visual route spine.

**Step 2: Verify RED**

Run: `npm.cmd test -- --run src/lib/planner-view.test.ts`

Expected: FAIL on missing exports and assertions.

**Step 3: Implement minimal helpers**

Create typed, side-effect-free functions. Keep route time explicitly presentational so it does not imply backend route calculation.

**Step 4: Verify GREEN**

Run: `npm.cmd test -- --run src/lib/planner-view.test.ts`

Expected: PASS.

**Step 5: Commit**

```bash
git add frontend/src/lib/planner-view.ts frontend/src/lib/planner-view.test.ts
git commit -m "feat: add planner presentation helpers"
```

### Task 3: Build Trip Header And Settings Drawer

**Files:**
- Create: `frontend/src/components/planner/TripHeader.tsx`
- Create: `frontend/src/components/planner/TripHeader.test.tsx`
- Create: `frontend/src/components/planner/TripSettingsDrawer.tsx`
- Create: `frontend/src/components/planner/TripSettingsDrawer.test.tsx`
- Modify: `frontend/src/app/layout.tsx`

**Step 1: Write failing interaction tests**

Test that `TripHeader` renders trip identity, destination fallback, date range, traveler count, and save status; clicking the settings icon calls `onOpenSettings`; clicking new trip calls `onCreateTrip`.

Test that `TripSettingsDrawer` renders only when open, labels the dialog accessibly, calls `onClose`, and passes changed trip fields through `onChange`/`onCommit` without changing API shapes.

**Step 2: Verify RED**

Run: `npm.cmd test -- --run src/components/planner/TripHeader.test.tsx src/components/planner/TripSettingsDrawer.test.tsx`

Expected: FAIL because components do not exist.

**Step 3: Implement components**

Use Lucide icons with `aria-label` and `title`. Keep settings in a side drawer on desktop and a full-screen sheet on narrow screens. Update root metadata and font variables in `layout.tsx` using suitable built-in/local-safe fallbacks without adding a network runtime dependency.

**Step 4: Verify GREEN**

Run the same targeted tests and expect PASS.

**Step 5: Commit**

```bash
git add frontend/src/components/planner frontend/src/app/layout.tsx
git commit -m "feat: add trip context header and settings drawer"
```

### Task 4: Build The Scoped Place Search Experience

**Files:**
- Create: `frontend/src/components/planner/PlaceSearchPanel.tsx`
- Create: `frontend/src/components/planner/PlaceSearchPanel.test.tsx`

**Step 1: Write failing behavior tests**

Cover:

- Keyword and city changes call their handlers.
- Searching, no-result, and error feedback render inside the panel.
- Selecting a result reveals the adjacent add action.
- Add stays disabled until a result and tag exist.
- Custom tag form submits trimmed copy.
- Result buttons expose selected state accessibly.

**Step 2: Verify RED**

Run: `npm.cmd test -- --run src/components/planner/PlaceSearchPanel.test.tsx`

Expected: FAIL because the component does not exist.

**Step 3: Implement minimal component**

Keep data fetching in the route page. The component receives values, states, and callbacks. Use Search, MapPin, Plus, Tag, and LoaderCircle icons. Keep results compact and avoid nested cards.

**Step 4: Verify GREEN**

Run the targeted test and expect PASS.

**Step 5: Commit**

```bash
git add frontend/src/components/planner/PlaceSearchPanel.tsx frontend/src/components/planner/PlaceSearchPanel.test.tsx
git commit -m "feat: redesign place search workflow"
```

### Task 5: Build The Route Spine

**Files:**
- Create: `frontend/src/components/planner/RoutePanel.tsx`
- Create: `frontend/src/components/planner/RoutePanel.test.tsx`

**Step 1: Write failing behavior tests**

Test that the panel renders summary counts, empty guidance, ordered station numbers, presentational times, priority text, selected state, category/priority changes, note commits, and named delete confirmation callbacks.

**Step 2: Verify RED**

Run: `npm.cmd test -- --run src/components/planner/RoutePanel.test.tsx`

Expected: FAIL because the component does not exist.

**Step 3: Implement route spine**

Render one continuous rail with quiet nodes instead of isolated cards. Each node has a stable sequence marker, selection button, metadata, editable controls, note field, and overflow/delete action. Do not claim real route duration; label generated times as planning slots.

**Step 4: Verify GREEN**

Run the targeted test and expect PASS.

**Step 5: Commit**

```bash
git add frontend/src/components/planner/RoutePanel.tsx frontend/src/components/planner/RoutePanel.test.tsx
git commit -m "feat: add editable route spine"
```

### Task 6: Compose The Responsive Workspace

**Files:**
- Create: `frontend/src/components/planner/MobileWorkspaceNav.tsx`
- Create: `frontend/src/components/planner/MobileWorkspaceNav.test.tsx`
- Modify: `frontend/src/app/page.tsx`
- Replace: `frontend/src/app/globals.css`

**Step 1: Write failing mobile navigation test**

Test that Map, Places, and Itinerary tabs expose `aria-selected`, call `onChange`, and use stable labels.

**Step 2: Verify RED**

Run: `npm.cmd test -- --run src/components/planner/MobileWorkspaceNav.test.tsx`

Expected: FAIL because the component does not exist.

**Step 3: Implement mobile navigation**

Create the small controlled tab component with icons and accessible tab semantics.

**Step 4: Verify GREEN**

Run the targeted test and expect PASS.

**Step 5: Refactor the route page**

Keep load, create, switch, update, delete, search debounce, tag persistence, add, and remove functions in `page.tsx`. Replace inline UI with `TripHeader`, `TripSettingsDrawer`, `PlaceSearchPanel`, `RoutePanel`, `MobileWorkspaceNav`, and the existing `MapCanvas`. Split general errors into search and workspace scopes. Add controlled settings/mobile-view state.

**Step 6: Implement the token-driven CSS**

Define the six approved color tokens, three typography roles, precise desktop grid, fixed map dimensions, route spine, drawer, scoped states, visible focus, and reduced motion. At 980px switch to a single active workspace pane controlled by mobile tabs. Avoid large radii, excessive shadows, pills, nested cards, and decorative gradients.

**Step 7: Run all tests and build**

Run: `npm.cmd run test:run`

Expected: all tests PASS.

Run: `npm.cmd run build`

Expected: production build PASS.

**Step 8: Commit**

```bash
git add frontend/src/app/page.tsx frontend/src/app/globals.css frontend/src/components/planner/MobileWorkspaceNav.tsx frontend/src/components/planner/MobileWorkspaceNav.test.tsx
git commit -m "feat: compose responsive itinerary workspace"
```

### Task 7: Improve Map States And Perform Visual Verification

**Files:**
- Modify: `frontend/src/components/map/MapCanvas.tsx`
- Create: `frontend/src/components/map/MapCanvas.test.tsx`
- Modify: `frontend/package.json`
- Create: `frontend/eslint.config.mjs`

**Step 1: Write failing map-state test**

Mock the map loader boundary and assert that missing map configuration renders an accessible, scoped error with a configuration hint while preserving the map region label. Test the no-place overlay copy independently from the map SDK.

**Step 2: Verify RED**

Run: `npm.cmd test -- --run src/components/map/MapCanvas.test.tsx`

Expected: FAIL on missing accessible states or test seam.

**Step 3: Implement map states**

Extract or inject the loader minimally, add `aria-label`, loading and empty overlays, selected-marker styling where supported, and configuration guidance. Preserve the existing AMap API behavior.

**Step 4: Configure non-interactive lint**

Replace deprecated `next lint` with `eslint .` and add a flat config compatible with Next.js 15.

**Step 5: Verify automated checks**

Run: `npm.cmd run test:run`

Run: `npm.cmd run lint`

Run: `npm.cmd run build`

Expected: all commands exit 0.

**Step 6: Start services and inspect real rendering**

Start the backend on an available port and the worktree frontend on an available port. Use browser screenshots at desktop (1440x900), tablet (1024x768), and mobile (390x844). Verify nonblank map/error region, no overlapping controls, text containment, visible next-section/workspace cues, mobile tab behavior, keyboard focus, and reduced-motion layout.

**Step 7: Self-critique and polish**

Compare screenshots to the approved token system and signature route spine. Remove one unnecessary decorative treatment, fix any overlap or density issue, and rerun the full checks.

**Step 8: Commit**

```bash
git add frontend/src/components/map/MapCanvas.tsx frontend/src/components/map/MapCanvas.test.tsx frontend/package.json frontend/package-lock.json frontend/eslint.config.mjs frontend/src/app/globals.css
git commit -m "test: verify polished planner experience"
```

