# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # start dev server (default port 5173, overridable via $PORT)
npm run build     # tsc type-check + vite production build
npm run lint      # ESLint (zero warnings allowed)
npm run preview   # serve production build locally
```

No test framework is configured.

## Architecture

FlowBoard is a single-page Kanban app in React + TypeScript + Vite with no backend. All state is client-only, persisted to `localStorage`.

**Data flow:**
- `src/types/task.ts` — single source of truth for types (`Task`, `Status`, `Priority`), `COLUMN_CONFIG` (labels, colors, icons per status), and `STATUS_ORDER`. Add new statuses here first.
- `src/hooks/useLocalStorage.ts` — generic hook that writes to localStorage with a 300 ms debounce. Keys: `flowboard:tasks`, `flowboard:tags`.
- `src/hooks/useTasks.ts` — all task CRUD (`createTask`, `updateTask`, `deleteTask`, `moveTask`, `reorderWithinColumn`, `addCustomTag`). The single consumer of `useLocalStorage`. `orderInColumn` is maintained as an integer index and re-normalised after every move.
- `src/components/Board.tsx` — root component; owns `DndContext`, active filter state, and the quick-create input bar. Passes `moveTask` / `reorderWithinColumn` through drag-end handlers.
- `src/components/Column.tsx` — droppable drop target (via `useDroppable`) wrapping a `SortableContext`; renders `TaskCard` list sorted by `orderInColumn`.
- `src/components/TaskCard.tsx` — sortable/draggable item via `useSortable`; clicking opens `TaskModal`.
- `src/components/TaskModal.tsx` — edit modal for title, description, priority, and tags (preset Hebrew tags + user-defined custom tags).

**Drag-and-drop** uses `@dnd-kit/core` + `@dnd-kit/sortable`. `handleDragEnd` in `Board` distinguishes drops onto a column (`over.id` is a `Status`) vs. drops onto another card, delegating to `moveTask` or `reorderWithinColumn` accordingly.

## Environment

`VITE_APP_NAME` — optional env var; falls back to `"FlowBoard"` in the quick-create placeholder.

## UI language

All visible strings are in Hebrew (RTL). Keep new UI text in Hebrew.
