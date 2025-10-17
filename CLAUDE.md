# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Lineup Builder is a gymnastics team lineup management application built with React 19, TypeScript, and Zustand for state management. The app allows coaches to:
- Manage a roster of athletes with event-specific metrics (D-Score, Consistency, Average Score)
- Build lineups by assigning athletes to 6 gymnastics events (FX, PH, SR, VT, PB, HB)
- Enforce the constraint of maximum 6 unique athletes across all event lineups (NCAA rule)
- Save and switch between multiple lineup configurations
- Use drag-and-drop to assign athletes to event slots

**Stack**: React 19 + TypeScript, Zustand (with persist), Tailwind CSS 4, Radix UI + shadcn/ui, Vite

**Package Manager**: pnpm (lockfile: `pnpm@10.15.1`)

## Common Commands

```bash
# Development
pnpm dev              # Start dev server on localhost:5173 with HMR

# Build & Quality
pnpm build            # TypeScript check (tsc -b) + Vite build
pnpm lint             # Run ESLint on all files
pnpm preview          # Preview production build
```

**Important**: The dev server is typically already running. Do NOT automatically restart or kill dev processes - Vite HMR handles updates. Only restart manually if explicitly requested.

## Architecture & State Management

### Zustand Store (`src/store/useAppStore.ts`)

The application uses a single centralized Zustand store with three layers:

1. **Base State** (persisted to localStorage):
   - `athletes`: Array of all athletes with event-specific metrics
   - `savedLineups`: Object mapping lineup IDs to `{ title, lineup }`
   - `activeLineupId`: Currently selected lineup ID
   - `events`: Event configurations (6 gymnastics events)
   - `eventMetricState`: Per-event metric display preferences
   - `activeSummaryMetric`: Team summary metric display preference

2. **Derived State** (computed from base state):
   - `activeLineup`: The current lineup object (computed via `computeActiveLineup()`)
   - `uniqueCount`: Number of unique athletes in the active lineup (max 6)
   - `teamSummary`: Aggregated team metrics based on active metric preference

3. **Operations & UI State**:
   - Lineup mutations: `handleSpecialistAdd`, `removeFromSlot`, `clearEvent`, `resetAllEvents`, `dropToSlot`
   - Lineup management: `newLineup`, `deleteActiveLineup`, `renameActiveLineup`
   - Roster operations: `addAthlete`, `sortRoster`, `setAthletes`
   - Modal state: `rosterOpen`, `profileOpen`, `confirmState`
   - Drag & Drop: `onDragStart`, `onDragEnd`, `dropToSlot`

**Key Pattern**: All state updates that modify base state must call `computeDerived()` to recalculate derived values. The store enforces immutability via `JSON.parse(JSON.stringify())` for lineup mutations.

**Constraint Enforcement**: The store validates the 6-unique-athlete rule before committing any lineup change. If adding a new athlete would exceed the limit, the operation is silently rejected.

### Data Model

**Lineup Structure**: `Record<string, (string | null)[]>`
- Keys are event IDs
- Values are arrays of 6 slots (only first 4 are "counting" routines)
- Each slot contains an athlete ID or `null`

**Athlete Structure**:
```typescript
{
  id: string,
  name: string,
  events: Record<string, EventMetrics> // Key is event abbreviation (e.g., "FX")
}
```

**EventMetrics**: `{ d_score: number, consistency: number, avg_score: number }`

### Drag & Drop Implementation

Uses HTML5 Drag & Drop API with module-level state tracking:
- `dragStartInfo`: Tracks whether drag originated from athlete pool or an event slot
- Pool → Slot: Adds athlete to slot if not already in that event and uniqueness constraint allows
- Slot → Slot (same event): Reorders within event
- Slot → Slot (different event): Swaps athletes between events
- Already-in-event validation prevents duplicates within an event
- Uniqueness validation runs on temp lineup before committing

Components using drag & drop should use `onDragStart`, `onDragEnd`, `dropToSlot` from the store.

## File Structure & Organization

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # shadcn/ui + Radix primitives (Dialog, Select, etc.)
│   ├── AthleteCard.tsx  # Draggable athlete card with metrics
│   ├── EventChip.tsx    # Event badge display
│   ├── Header.tsx       # App header with lineup selector/actions
│   └── ThemeProvider.tsx # Dark mode context provider
├── features/lineup/     # Feature-specific lineup components
│   ├── AthletePool.tsx      # Left panel with all athletes
│   ├── EventsSection.tsx    # Right panel with 6 event columns
│   ├── AthleteProfile.tsx   # Modal for editing athlete metrics
│   └── RosterManagement.tsx # Modal for roster management
├── hooks/               # Custom React hooks
│   ├── useDragAndDrop.ts    # Drag & drop utilities (less used now)
│   └── usePersistentState.ts
├── lib/
│   ├── types/           # TypeScript type definitions
│   ├── constants/       # App constants (DEFAULT_EVENTS, MAX_ATHLETES_IN_LINEUP)
│   ├── utils/
│   │   ├── cn.ts        # Tailwind class merging utility
│   │   ├── lineup.ts    # createEmptyLineup, getUniqueAthletesInEvents
│   │   └── messages.ts  # User-facing message constants
│   └── storage/         # localStorage utilities (legacy - now in Zustand persist)
└── store/
    └── useAppStore.ts   # Single Zustand store (the heart of the app)
```

**Import Path Aliases**:
- `@/` → `src/`
- `@/lib/*`, `@/components/*`, `@/features/*`, `@/hooks/*`, `@/store/*`, `@/types/*`

## Code Style & TypeScript

- **Strict TypeScript**: All `any` types must be justified. Use `satisfies` for type validation.
- **Type preference**: Use `type` over `interface` unless extending.
- **Functional components only**: No class components. Use PascalCase naming.
- **Component size**: Max ~300 lines. Extract complex logic to hooks/utils.
- **Setters in Zustand**: Return `Partial<AppContextValue>` from `set()` callbacks.
- **Naming conventions**:
  - Variables: `camelCase`
  - Constants: `UPPER_SNAKE_CASE`
  - Types: `PascalCase`
  - Components: `PascalCase.tsx`
  - Utils/Hooks: `camelCase.ts`

## Styling with Tailwind CSS 4

- **Utility-first**: Use Tailwind classes exclusively. No custom CSS unless unavoidable.
- **Dark mode**: Use `dark:` prefix (strategy: `class`).
- **Color system**: Single source of truth in `src/index.css` with CSS variables
  - **USNA colors**: Navy Blue (#13294B) and Gold (#F8B739) as brand colors
  - **Semantic tokens**: Always use `bg-primary`, `text-foreground`, `bg-accent`, etc. instead of hardcoded colors
  - **Brand scales**: `navy-{50-950}`, `gold-{50-900}`, `neutral-{50-900}` available
  - **See**: `docs/COLOR_SYSTEM.md` for complete color documentation
- **Responsive**: Mobile-first with `md:`, `lg:` breakpoints.
- **Class merging**: Use `cn()` utility from `@/lib/utils/cn` for conditional classes.
- **Never inline arbitrary values**: Add custom values to `tailwind.config.ts`.
- **Never hardcode colors**: Always use semantic tokens or CSS variables.

## Performance Considerations

- Use `React.memo()` for components with stable props (e.g., AthleteCard).
- Use `useCallback` for event handlers to prevent unnecessary re-renders.
- Stable keys in lists (use athlete/event IDs, not indices).
- Zustand selector pattern for granular subscriptions when needed.
- Immutable patterns for lineup mutations avoid unintended side effects.

## Development Workflow Expectations

- **Dev server**: Assumed to be running already. Do NOT automatically restart.
- **No process management**: Do NOT kill, start, or manage processes.
- **Hot reload**: Vite HMR picks up changes automatically.
- **Manual restart only**: Only restart dev server if user explicitly requests it.
- **Port 5173**: If in use, assume dev server is running - do not interfere.

## Testing & Validation

When making changes:
- Test uniqueness constraint validation (max 6 unique athletes)
- Test all drag-and-drop scenarios: pool→slot, slot→slot (same event), slot→slot (different events)
- Verify persistence: changes should survive page reload
- Verify derived state recomputes correctly (uniqueCount, teamSummary)
- Check that duplicate prevention works within events

## Git Conventions

Use conventional commits:
- `feat:` - New features
- `fix:` - Bug fixes
- `refactor:` - Code refactoring
- `docs:` - Documentation changes
- `chore:` - Maintenance tasks

Run `pnpm lint` before committing.

## Domain-Specific Rules

- **Max 6 unique athletes** across all events (NCAA rule). The app enforces this constraint.
- **4 counting routines** per event (slots 0-3), even though lineups have 6 slots.
- **Event abbreviations**: FX (Floor Exercise), PH (Pommel Horse), SR (Still Rings), VT (Vault), PB (Parallel Bars), HB (Horizontal Bar).
- **Metrics**: D-Score (difficulty), Consistency (%), Average Score.
- **Specialization**: Athletes have event-specific metrics stored in `athlete.events[eventAbbr]`.

## Common Pitfalls

1. **Direct state mutation**: Always return new objects from Zustand `set()` callbacks.
2. **Forgetting `computeDerived()`**: Derived state won't update if you don't call it after base state changes.
3. **Missing TypeScript types**: All function parameters should have explicit types.
4. **Inline event handlers**: Causes unnecessary re-renders. Use `useCallback`.
5. **Not validating constraints**: Always check uniqueness before mutating lineups.
6. **Forgetting persistence**: The store uses `persist` middleware - changes are auto-saved to localStorage as `"lineup-builder"`.
