# Lineup Builder Cursor Rules

## Project Overview

- **Framework**: React 19 + TypeScript
- **State Management**: Zustand with persistence
- **Styling**: Tailwind CSS 4 with dark mode
- **UI Components**: Radix UI + shadcn/ui
- **Build Tool**: Vite
- **Package Manager**: pnpm

## Code Style & Standards

### TypeScript

- Use strict TypeScript (all `any` types must be justified)
- Always use `satisfies` keyword for type validation when appropriate
- Prefer explicit type definitions over inference for complex types
- Use `type` keyword for type aliases (not `interface` unless extending)
- Example: `export type AppContextValue = { ... } satisfies SomeType`

### React & Components

- Use functional components exclusively
- Use PascalCase for component names (e.g., `AthleteCard`, not `athleteCard`)
- Use descriptive prop names; avoid generic names like `data` or `handler`
- Keep components focused: max ~300 lines; extract complex logic to hooks/utils
- Use React 19 features (useActionState, etc.) where applicable

### File Organization

- **Components**: `src/components/` for reusable UI components
- **Features**: `src/features/` for feature-specific components (grouped by feature)
- **UI Library**: `src/components/ui/` for shadcn/ui wrapped components
- **State**: `src/store/` for Zustand stores
- **Hooks**: `src/hooks/` for custom React hooks
- **Utilities**: `src/lib/utils/` for pure functions and helpers
- **Types**: `src/lib/types/` for type definitions
- **Constants**: `src/lib/constants/` for application constants
- **Storage**: `src/lib/storage/` for storage-related utilities

### State Management (Zustand)

- Use `create()` with `persist` middleware for global state that needs persistence
- Always compute derived state inside the store (e.g., `activeLineup`, `uniqueCount`)
- Use `set()` and `get()` for state updates
- Specify precise return types for all store methods: `Partial<AppContextValue>`
- Group related mutations together (operations, lineup management, modals, DnD)
- Example pattern:
  ```typescript
  const useStore = create<State>()(
    persist(
      (set, get) => ({
        // state
        // derived state via computeDerived()
        // setters
        // operations
      }),
      { name: "storage-key" }
    )
  );
  ```

### Styling (Tailwind CSS)

- Use Tailwind utility classes exclusively (no custom CSS unless unavoidable)
- Leverage dark mode with `dark:` prefix (already configured with `class` strategy)
- Use custom color tokens (navy, gold, neutral) from tailwind.config.ts
- Responsive design: mobile-first approach with `md:`, `lg:` breakpoints
- Use `cn()` utility for conditional class merging:
  ```typescript
  import { cn } from "@/lib/utils/cn";
  className={cn("base-class", condition && "extra-class")}
  ```
- Never inline arbitrary values; add them to tailwind.config.ts

### Radix UI & shadcn/ui

- Always import from local `ui/` components, not directly from `@radix-ui`
- Use Radix UI for unstyled primitives (Dialog, Select, Dropdown, etc.)
- shadcn/ui components are already in `src/components/ui/` - use them directly
- Ensure accessibility: ARIA labels, keyboard navigation, focus management

### Performance

- Use `React.memo()` for components that receive unchanged props
- Implement proper key usage in lists (unique, stable keys)
- Avoid inline function definitions in component render; use `useCallback`
- Lazy load components if needed: `const LazyComponent = lazy(() => import(...))`

### Hooks

- Custom hooks should start with `use` prefix (e.g., `useDragAndDrop`)
- Keep hooks focused on a single concern
- Return stable references using `useCallback` and `useMemo` where appropriate

### Error Handling

- Use try-catch for async operations
- Provide user feedback via modals or toast notifications
- Log errors to console in development (consider logger in production)
- Validate inputs early, fail fast

### Testing Considerations

- Components should be testable; avoid tight coupling
- Extract business logic to utility functions for easier testing
- Mock Zustand store in tests using `zustand/react/shallow`

## Import Path Aliases

Always use configured path aliases:

- `@/` - src directory root
- `@/lib/*` - src/lib directory
- `@/components/*` - src/components directory
- `@/features/*` - src/features directory
- `@/hooks/*` - src/hooks directory
- `@/store/*` - src/store directory
- `@/types/*` - src/lib/types directory

## Git & Commits

- Use conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`
- Keep commits focused and atomic
- Write descriptive commit messages
- Reference issue numbers when applicable

## ESLint Configuration

- Run `pnpm lint` before committing
- Follow ESLint rules as configured in `eslint.config.js`
- No console errors or warnings in production code
- Disable ESLint rules only with documented justification

## Naming Conventions

- **Variables**: camelCase (e.g., `athleteCount`, `isLoading`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_ATHLETES_IN_LINEUP`)
- **Types**: PascalCase (e.g., `Athlete`, `EventConfig`)
- **Files**:
  - Components: PascalCase (e.g., `AthleteCard.tsx`)
  - Utils/Hooks: camelCase (e.g., `useAppStore.ts`, `cn.ts`)
  - Types: PascalCase (e.g., `index.ts` for exports)

## Domain-Specific Rules (Lineup Builder)

- **Athletes**: Individual competitors with event-specific metrics
- **Events**: Competitive categories (e.g., Vault, Bars) with abbreviations
- **Lineup**: Group of 4+ athletes assigned to each event
- **Specialization**: Athletes can have different roles/expertise per event
- **Metrics**: D-Score, Consistency, Average Score tracked per athlete per event
- Enforce uniqueness constraints: max 6 unique athletes across all events

## Zustand Store Architecture Notes

The `useAppStore` uses a sophisticated pattern with:

1. **Base state**: athletes, events, savedLineups, activeLineupId
2. **Derived state**: activeLineup, uniqueCount, teamSummary
3. **Event metric tracking**: per-event display preferences
4. **Modal state**: rosterOpen, profileOpen, confirmState
5. **Drag & Drop**: onDragStart, onDragEnd, dropToSlot

When adding new state:

- Identify if it's "base" or "derived"
- If derived, add computation function like `computeDerived()`
- Update persistence key if adding persistent state
- Test rehydration behavior in `onRehydrateStorage`

## Drag & Drop Implementation Guidelines

- Use HTML5 Drag & Drop API (dataTransfer)
- Store drag source info in module-level variable (dragStartInfo)
- Validate drops: check uniqueness constraints, same-slot drops
- Use immutable temp lineup for validation before commit
- Test: pool→slot, slot→slot, slot→pool scenarios

## Performance Tips

- Lineup mutations: use immutable patterns (`JSON.parse(JSON.stringify(...))`)
- Zustand selector pattern for granular updates
- Lazy render large athlete lists

## Testing Strategy

Mock patterns:

- Zustand: Use `useAppStore.setState()` in tests
- Components: Mock store with shallow selectors
- Utils: Pure function unit tests (lineup.ts, cn.ts)
- Integration: Test drag-and-drop workflows end-to-end

## Documentation

- Add JSDoc comments to complex functions and hooks
- Document non-obvious algorithmic choices
- Include usage examples for exported utilities and hooks
- Keep README.md updated with architecture overview

## Common Pitfalls to Avoid

1. Directly mutating state in Zustand (always return new objects)
2. Forgetting to persist localStorage changes
3. Missing TypeScript types on function parameters
4. Inline event handlers causing unnecessary re-renders
5. Not validating athlete constraints before mutations
6. Not testing drag-and-drop edge cases
