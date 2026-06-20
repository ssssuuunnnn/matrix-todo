# Copilot Instructions

## Commands

```bash
npm run dev          # start dev server (Vite)
npm run build        # tsc -b && vite build
npm run lint         # ESLint
npm test             # run tests once (Vitest)
npm run test:watch   # run tests in watch mode
```

Run a single test file:
```bash
npx vitest run src/hooks/__tests__/useTodos.reducer.test.ts
```

> A pre-push git hook runs `npm test` automatically; any failure blocks the push.

## Architecture

This is a pure frontend SPA (React 19 + TypeScript + Vite) with no backend. Data is persisted to `localStorage` (`matrix-todo-v1`).

**Data flow:**
- `src/types.ts` — single source of truth for `Todo`, `QuadrantId`, and the `QUADRANTS` config array (labels, colors, urgency/importance flags).
- `src/hooks/useTodos.ts` — contains both the `reducer` and the `useTodos` hook. The reducer handles `ADD | UPDATE | DELETE | TOGGLE_COMPLETE | MOVE` and is the only place business logic lives. The hook wraps it with `useReducer` and persists to localStorage on every state change.
- `App.tsx` — orchestrates all state, DnD context, and view switching (matrix / list / calendar).

**Component responsibilities:**
- `Quadrant` — droppable container for one quadrant; renders its `TodoCard`s.
- `TodoCard` — draggable card; receives `quadrant` config for colors.
- `TodoModal` — add/edit modal (controlled by `App`); shared between all views.
- `ListView` / `CalendarView` — alternate views; call the same `onToggle / onDelete / onEdit` callbacks as the matrix view.

**Drag-and-drop:** dnd-kit with `PointerSensor` (activation distance 6px) and `TouchSensor` (delay 250ms). Drop target is the quadrant ID; `DragOverlay` shows a rotated ghost card during drag.

## Key Conventions

- **`QUADRANTS` array in `types.ts`** is the canonical list of quadrant metadata. Any component that needs colors, labels, or urgency/importance flags imports from there — never hardcodes them.
- **CSS Modules** (`*.module.css`) for all component styles. No global CSS classes except `src/index.css` (resets/tokens).
- **Strict TypeScript** (`tsconfig.app.json`). All types must be explicitly declared; avoid `any`.
- **Tests target the reducer only.** `src/hooks/__tests__/useTodos.reducer.test.ts` contains 27 tests covering ADD, UPDATE, DELETE, TOGGLE_COMPLETE, MOVE, and immutability. Tests import `reducer` directly from `useTodos.ts`.
- **`vite.config.ts` must import `defineConfig` from `vitest/config`** (not `vite`) to support the `test` field without TypeScript errors.
- **UUID v4** (`uuid` package) for todo IDs; `createdAt` is a Unix timestamp (`Date.now()`).
- **Deadline format:** `YYYY-MM-DD` string (not a `Date` object).
- UI language is **Traditional Chinese (繁體中文)**.
