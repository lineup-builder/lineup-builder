# Comprehensive Code Review: Lineup Builder

**Review Date**: 2025-10-21
**Reviewer**: Claude Code (Senior Software Engineer)
**Codebase**: Lineup Builder v1.0
**Grade**: B- (Good foundation, needs refactoring)

---

## 1. Overall Assessment

### Architecture & Project Structure ✓
Your codebase demonstrates a **well-organized, modern React architecture** with clear separation of concerns:

- **Clean component hierarchy**: Feature-based organization (`features/lineup/`) + reusable components (`components/`)
- **Centralized state management**: Zustand with persistence middleware
- **Proper API layer abstraction**: Supabase calls isolated in `lib/api/`
- **Type-safe foundation**: TypeScript with strict mode, generated Supabase types
- **Modern stack**: React 19, Vite, Tailwind CSS 4, shadcn/ui

### What's Working Well ✓
1. **Excellent project documentation** (CLAUDE.md is comprehensive)
2. **Smart use of path aliases** (@/, @/lib/*, etc.)
3. **Minimal, focused dependencies** (no bloat)
4. **Good immutability patterns** in state mutations
5. **Constraint enforcement** (uniqueness validation before lineup changes)
6. **Proper auth abstraction** via hooks
7. **Semantic color system** with USNA branding

### Core Concerns
The codebase has **grown without refactoring**, leading to:
- God Object pattern in Zustand store (60+ properties)
- Significant code duplication in critical UI components
- Module-level mutable state causing race condition risks
- Missing persistence layer for lineup changes to Supabase
- **Critical constant mismatch** that violates stated requirements

---

## 2. Issues Found (Prioritized)

### CRITICAL ISSUES

#### **#1: MAX_ATHLETES_IN_LINEUP Constant Mismatch**
- **Location**: `src/lib/constants/index.ts:4`
- **Severity**: **CRITICAL**
- **Description**: `MAX_ATHLETES_IN_LINEUP = 12` but CLAUDE.md states "Max 6 unique athletes across all events (NCAA rule)". The constraint logic uses this constant (`useAppStore.ts:329, 660`), meaning the app enforces the wrong limit.
- **Impact**: Users can add 12 unique athletes when only 6 should be allowed
- **Fix Time**: 5 minutes
- **Suggested Fix**:
```typescript
// src/lib/constants/index.ts
export const MAX_ATHLETES_IN_LINEUP = 6; // NCAA rule: max 6 unique athletes
```
- **Note**: Verify the actual NCAA rule. If it's 12, update CLAUDE.md instead.

---

#### **#2: Module-Level Mutable State (Race Conditions)**
- **Location**: `src/store/useAppStore.ts:96-97`
- **Severity**: **CRITICAL**
- **Description**:
```typescript
let confirmResolver: ((v: boolean) => void) | null = null;
let dragStartInfo: DragStartInfo | null = null;
```
These live outside Zustand state, causing:
  - **Concurrent modal risk**: Two simultaneous confirms corrupt state
  - **Drag-and-drop race conditions**: Multiple simultaneous drags interfere
  - **Memory leaks**: Resolvers may not get cleaned up
  - **Testing nightmare**: Can't reset state between tests

- **Fix Time**: 2-4 hours
- **Suggested Fix**:
```typescript
// Move into Zustand state
type AppContextValue = {
  // ...existing
  _confirmResolver: ((v: boolean) => void) | null;
  _dragStartInfo: DragStartInfo | null;
}

// Or use a proper Promise queue for modals
const confirmQueue = new PromiseQueue();
```

---

#### **#3: EventsSection Code Duplication (270+ lines)**
- **Location**: `src/features/lineup/EventsSection.tsx:157-438`
- **Severity**: **CRITICAL**
- **Description**: The slot rendering logic is **duplicated 3 times** (90+ lines each):
  - Lines 157-250: Main Team (4 routines)
  - Lines 254-344: All-Around (1)
  - Lines 348-438: Alternate (1)

  **Every change requires updating 3 places**, high bug propagation risk.

- **Fix Time**: 3-6 hours
- **Suggested Fix**: Extract into `EventSlot` component:
```typescript
// components/EventSlot.tsx
function EventSlot({
  eventId,
  slotIndex,
  label,
  athleteId,
  onDrop
}: EventSlotProps) {
  // All the drag-and-drop + rendering logic here
}

// EventsSection.tsx
{[0,1,2,3].map(i =>
  <EventSlot eventId={ev.id} slotIndex={i} label="Main Team (4)" />
)}
```

---

#### **#4: Missing Supabase Persistence Layer**
- **Location**: `src/store/useAppStore.ts` (entire file)
- **Severity**: **CRITICAL**
- **Description**: The store can **load** athletes and lineups from Supabase (`loadTeamAthletes`, `loadTeamLineups`) but has **no functions to save changes back**. All mutations (add athlete, update lineup, etc.) only modify local state. Changes don't persist to the database.
- **Impact**: Users' work is lost when switching teams or devices
- **Fix Time**: 1-2 days
- **Suggested Fix**: Add save operations:
```typescript
// New functions needed:
saveLineupToSupabase: async (lineupId: string) => {
  const lineup = get().savedLineups[lineupId];
  await updateLineup(lineupId, { title: lineup.title });
  await upsertLineupSlots(lineupId, /* transform slots */);
}

saveAthleteToSupabase: async (athleteId: string) => {
  const athlete = get().athletes.find(a => a.id === athleteId);
  await updateAthlete(athleteId, { name: athlete.name });
  await bulkUpsertAthleteEvents(athleteId, /* transform events */);
}
```

---

#### **#5: useTeam Hook Circular Dependency**
- **Location**: `src/hooks/useTeam.ts:54`
- **Severity**: **HIGH** (can cause infinite loops)
- **Description**:
```typescript
const loadTeams = useCallback(async () => {
  // ...
  if (!currentTeamId && fetchedTeams.length > 0) {
    setCurrentTeamId(firstTeamId); // modifies currentTeamId
  }
}, [currentTeamId]); // depends on currentTeamId it modifies
```
`loadTeams` recreates every time `currentTeamId` changes, and `loadTeams` sets `currentTeamId`, creating a potential infinite loop.

- **Fix Time**: 30 minutes
- **Suggested Fix**:
```typescript
// Option 1: Remove from dependency array (controlled risk)
const loadTeams = useCallback(async () => {
  // ... existing logic
}, []); // Empty deps, use functional updates

// Option 2: Use separate "initialized" flag
const [initialized, setInitialized] = useState(false);
```

---

### HIGH PRIORITY ISSUES

#### **#6: Non-Atomic Database Operations**
- **Location**: `src/lib/api/lineups.ts:82-102`
- **Severity**: **HIGH**
- **Description**: `upsertLineupSlots` deletes all slots then inserts new ones:
```typescript
await supabase.from("lineup_slots").delete().eq("lineup_id", lineupId);
// If this fails, data is lost permanently ↓
const { data, error } = await supabase.from("lineup_slots").insert(...);
```
- **Risk**: Data loss if insert fails after delete succeeds
- **Fix Time**: 1-2 hours
- **Suggested Fix**: Use Supabase RPC with transaction or wrap in try-catch with rollback:
```typescript
// Create a Supabase database function with transaction
// Or use optimistic locking
```

---

#### **#7: AppContextValue Type Explosion (60+ Properties)**
- **Location**: `src/store/useAppStore.ts:23-90`
- **Severity**: **HIGH** (maintainability)
- **Description**: Single interface with 60+ mixed-concern properties makes:
  - Testing extremely difficult (must mock all properties)
  - Type inference slow
  - Unclear separation of concerns
  - Hard to reason about dependencies

- **Fix Time**: 1-2 days
- **Suggested Fix**: Split into context slices:
```typescript
// Separate stores
const useDataStore = create(...)  // athletes, lineups, events
const useUIStore = create(...)    // modals, loading states
const useDragStore = create(...)  // drag-and-drop state
```

---

#### **#8: TypeScript `any` Types in Auth**
- **Location**: `src/components/auth/AuthProvider.tsx:11-20`
- **Severity**: **HIGH** (type safety)
- **Description**:
```typescript
signIn: (email: string, password: string) => Promise<{
  data: any;
  error: any;
}>;
```
All auth methods return `any` types, losing type safety.

- **Fix Time**: 1 hour
- **Suggested Fix**:
```typescript
import type { AuthResponse, AuthError } from '@supabase/supabase-js';

signIn: (email: string, password: string) => Promise<AuthResponse>;
```

---

#### **#9: Deep Cloning via JSON.parse/stringify**
- **Location**: `src/store/useAppStore.ts:320-322, 357-358, 384-385, 651`
- **Severity**: **HIGH** (performance)
- **Description**: Used for immutability:
```typescript
const temp: Lineup = JSON.parse(JSON.stringify(current));
```
**Problems**:
- Slow (O(n) serialization + deserialization)
- Loses functions, Dates, undefined, circular refs
- Non-standard approach

- **Fix Time**: 2-3 hours
- **Suggested Fix**:
```typescript
// Option 1: Use structuredClone() (modern browsers)
const temp: Lineup = structuredClone(current);

// Option 2: Use immer.js
import produce from 'immer';
const temp = produce(current, draft => { /* mutations */ });
```

---

#### **#10: window.prompt/confirm Instead of Modals**
- **Location**: `src/features/lineup/EventsSection.tsx:510-560`
- **Severity**: **HIGH** (UX)
- **Description**: Uses blocking `window.prompt()` and `window.confirm()` for lineup management:
```typescript
const title = window.prompt("Enter a title for this lineup:", current.title);
const ok = window.confirm(`Delete "${savedLineups[activeLineupId].title}"?`);
```
**Problems**:
- Poor UX (browser native dialogs)
- Not styleable
- Blocks entire page
- Not accessible
- Can't be tested

- **Fix Time**: 2-4 hours
- **Suggested Fix**: You already have a `showConfirm` modal system (useAppStore.ts:589-603)! Just missing a text input modal:
```typescript
// Add to store
showPrompt: (title: string, defaultValue: string) => Promise<string | null>

// Use existing Dialog component
<PromptDialog
  isOpen={!!promptState}
  onSubmit={handlePrompt}
/>
```

---

### MEDIUM PRIORITY ISSUES

#### **#11: Missing Runtime Validation on API Responses**
- **Location**: `src/lib/api/athletes.ts:27,43,56,68,91,122`, `src/lib/api/lineups.ts:29,48,61,73,101,120`
- **Severity**: **MEDIUM**
- **Description**: Type assertions without validation:
```typescript
return data as AthleteWithEvents[];
```
Assumes Supabase always returns correct structure. If schema changes or data is corrupted, TypeScript won't catch it at runtime.

- **Fix Time**: 4-6 hours
- **Suggested Fix**:
```typescript
import { z } from 'zod';

const athleteSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  athlete_events: z.array(z.object({ /* ... */ }))
});

return athleteSchema.parse(data);
```

---

#### **#12: Silent Error Failures**
- **Location**: `src/store/useAppStore.ts:720-726, 780-785, 799-804`
- **Severity**: **MEDIUM**
- **Description**: Async operations catch errors but only log to console:
```typescript
catch (err) {
  set({ error: err instanceof Error ? err : new Error("...") });
  console.error("Error loading team athletes:", err);
}
```
`error` is set in state but nothing renders it to the user.

- **Fix Time**: 2-3 hours
- **Suggested Fix**: Add error boundary or toast notifications:
```typescript
// Use a toast library
import { toast } from 'sonner';
catch (err) {
  toast.error("Failed to load athletes. Please try again.");
  set({ error: err });
}
```

---

#### **#13: Unnecessary Re-renders**
- **Location**: `src/features/lineup/EventsSection.tsx:21-45`
- **Severity**: **MEDIUM** (performance)
- **Description**: Component subscribes to **entire store** (40+ properties):
```typescript
const {
  resetAllEvents,
  teamSummary,
  activeSummaryMetric,
  // ... 40+ more properties
} = useAppStore();
```
Any store change triggers re-render, even if unrelated.

- **Fix Time**: 1-2 hours
- **Suggested Fix**: Use Zustand selectors:
```typescript
const activeLineup = useAppStore(state => state.activeLineup);
const events = useAppStore(state => state.events);
// Only re-renders when activeLineup or events change
```

---

#### **#14: AutoShrinkText eslint-disable**
- **Location**: `src/components/AutoShrinkText.tsx:26,38,43`
- **Severity**: **MEDIUM**
- **Description**: Three `eslint-disable-next-line react-hooks/exhaustive-deps` warnings suggest incomplete dependency arrays. Could cause stale closures.
- **Fix Time**: 1 hour
- **Suggested Fix**: Review logic and add proper dependencies or move to useLayoutEffect.

---

#### **#15: computeTeamSummary O(n²) Complexity**
- **Location**: `src/store/useAppStore.ts:109-157`
- **Severity**: **MEDIUM** (performance)
- **Description**: Nested loops through events and athletes called on every state update:
```typescript
state.events.forEach((cfg) => {
  const lineupForEvent = state.savedLineups[...].lineup[cfg.id] || [];
  for (let i = 0; i < 4; i++) {
    const athleteId = lineupForEvent[i];
    const athlete = state.athletes.find((a) => a.id === athleteId); // O(n)
  }
});
```
- **Fix Time**: 2 hours
- **Suggested Fix**: Memoize or create athlete lookup Map:
```typescript
const athleteMap = new Map(state.athletes.map(a => [a.id, a]));
const athlete = athleteMap.get(athleteId); // O(1)
```

---

#### **#16: get() Inside set() Callback**
- **Location**: `src/store/useAppStore.ts:758`
- **Severity**: **MEDIUM** (timing issue)
- **Description**:
```typescript
const finalLineups = Object.keys(transformedLineups).length > 0
  ? transformedLineups
  : {
      [`lineup-${Date.now()}`]: {
        title: "Untitled Lineup",
        lineup: createEmptyLineup(get().events), // get() inside set()
      },
    };
```
`get()` inside `set()` can cause timing issues or stale state.

- **Fix Time**: 10 minutes
- **Suggested Fix**:
```typescript
set((prev) => {
  const finalLineups = /* ... */ createEmptyLineup(prev.events);
  return { savedLineups: finalLineups, ... };
});
```

---

### LOW PRIORITY ISSUES

#### **#17: Missing Tests**
- **Location**: Entire codebase
- **Severity**: **LOW** (quality assurance)
- **Description**: No test files found. Critical logic untested:
  - Uniqueness constraint validation
  - Drag-and-drop state machine
  - CSV import parsing
  - Lineup mutations

- **Fix Time**: 2-3 days (full coverage)
- **Suggested Fix**: Start with critical paths:
```typescript
// useAppStore.test.ts
describe('uniqueness constraint', () => {
  it('prevents adding 7th unique athlete', () => {
    // ...
  });
});
```

---

#### **#18: Browser Compatibility (oklch)**
- **Location**: `src/index.css:133`
- **Severity**: **LOW**
- **Description**: `oklch()` color function may not work in older Safari versions
- **Fix Time**: 30 minutes
- **Suggested Fix**: Add fallback colors or use PostCSS polyfill

---

#### **#19: Missing JSDoc Comments**
- **Location**: Complex functions throughout
- **Severity**: **LOW** (documentation)
- **Description**: Functions like `computeTeamSummary`, drag-and-drop logic lack explanatory comments
- **Fix Time**: 2-3 hours
- **Suggested Fix**: Add JSDoc:
```typescript
/**
 * Computes team summary metrics across all counting routines (first 4 slots per event).
 * Aggregates D-Score, Consistency, and Average Score based on active metric preference.
 */
function computeTeamSummary(...) { }
```

---

## 3. Best Practices Analysis

### ✓ Following Best Practices
1. **Immutability** - State mutations create new objects
2. **Single source of truth** - Zustand as centralized store
3. **Type safety** - TypeScript strict mode, generated types
4. **Separation of concerns** - API layer, components, state separated
5. **Component composition** - Good use of shadcn/ui primitives
6. **Semantic HTML** - Proper use of buttons, forms, accessibility
7. **Responsive design** - Mobile-first Tailwind approach
8. **Git conventions** - Would follow conventional commits (per docs)
9. **Path aliases** - Clean imports with @/
10. **Environment variables** - Supabase config properly checked

### ✗ Violating Best Practices
1. **DRY principle** - Massive duplication in EventsSection
2. **Encapsulation** - Module-level state instead of proper state management
3. **Error handling** - Silent failures, no user feedback
4. **Testing** - Zero test coverage
5. **Code size** - 826-line store file, 570-line component
6. **Separation of concerns** - UI state, business logic, data all in one store
7. **Performance** - Whole-store subscriptions cause unnecessary re-renders
8. **Type safety** - `any` types in critical auth code
9. **Atomicity** - Non-atomic database operations
10. **Documentation** - Missing inline comments for complex logic

### Industry Standards to Adopt
1. **Zod or io-ts** for runtime type validation
2. **React Query / TanStack Query** for server state management (instead of mixing with Zustand)
3. **Vitest + React Testing Library** for unit/integration tests
4. **Playwright or Cypress** for E2E tests
5. **ESLint + Prettier** with stricter rules (no `any`, no `eslint-disable`)
6. **Husky + lint-staged** for pre-commit hooks
7. **Sentry or similar** for error tracking
8. **Immer.js** for immutable updates
9. **React Error Boundaries** for graceful error handling
10. **Storybook** for component development

---

## 4. Category-Specific Analysis

### Security Vulnerabilities
**LOW RISK** overall, but:
- ✓ Auth delegated to Supabase (good)
- ✓ Environment variables checked
- ⚠️ **Missing**: Supabase Row Level Security (RLS) review (not visible in codebase)
- ⚠️ **Missing**: Rate limiting on auth endpoints
- ⚠️ **Missing**: Input sanitization (especially CSV import)

**Recommendation**: Review RLS policies in Supabase dashboard. Ensure users can only access their team's data.

---

### Performance Bottlenecks
1. **Whole-store subscriptions** → unnecessary re-renders (MEDIUM)
2. **JSON.parse/stringify cloning** → slow immutability (MEDIUM)
3. **O(n²) team summary computation** → called every state update (MEDIUM)
4. **Multiple `.find()` calls** in render loops (LOW)
5. **No memoization** for expensive computations (LOW)

**Quick Win**: Add React.memo to AthleteCard, EventSlot components.

---

### Code Smells & Anti-Patterns
1. **God Object** - 826-line store with 60+ properties (HIGH)
2. **Code Duplication** - 270+ duplicated lines (CRITICAL)
3. **Module-level mutable state** (CRITICAL)
4. **Magic numbers** - Hardcoded 4, 6 slot counts without constants
5. **Long methods** - `computeTeamSummary` could be broken down
6. **Callback hell** - Nested promises in some components
7. **Inline type assertions** - `as` casts without validation

---

### Error Handling & Edge Cases
**Missing**:
- Network failure retry logic
- Offline support
- Optimistic updates with rollback
- User-facing error messages
- Null/undefined checks in nested properties
- Validation for CSV import format
- Edge case: What if athlete removed from roster but still in lineups?
- Edge case: What if Supabase connection lost mid-operation?

**Present**:
- ✓ Try-catch in async functions
- ✓ Error state in store
- ✓ Uniqueness constraint validation

---

### Testing Coverage & Quality
**ZERO test files found** in codebase.

**Critical paths needing tests**:
1. Uniqueness constraint (max 6/12 athletes)
2. Drag-and-drop state machine
3. Lineup mutations (add, remove, clear)
4. CSV import parsing
5. Supabase data transformations
6. Auth flows

---

### Documentation & Comments
**Good**:
- Excellent CLAUDE.md with architecture, conventions, domain rules
- README-style docs in docs/ folder
- TypeScript types as documentation

**Missing**:
- Inline JSDoc for complex functions
- State machine diagram for drag-and-drop
- API documentation (expected request/response shapes)
- Component props documentation (could use JSDoc)

---

### Naming Conventions & Readability
**Good**:
- ✓ camelCase variables
- ✓ PascalCase components and types
- ✓ UPPER_SNAKE_CASE constants
- ✓ Descriptive names (`computeTeamSummary`, `handleSpecialistAdd`)
- ✓ Event handlers prefixed with `on` or `handle`

**Could Improve**:
- `cfg` → `eventConfig` (abbreviations reduce readability)
- `ev` → `event`
- `s` → `state` (in callbacks)
- `a` → `athlete`

---

### Dependencies & Technical Debt
**Dependencies**: Clean, minimal, well-maintained ✓

**Technical Debt**:
1. **Growing store** - Will become unmaintainable at current trajectory
2. **Missing persistence layer** - Supabase writes not implemented
3. **Duplicated slot rendering** - Compounds with every feature
4. **Module-level state** - Will cause bugs as features grow
5. **No testing infrastructure** - Debt increases with every feature

**Estimated Technical Debt**: **~5-7 days** to fully address

---

### Scalability Concerns
**Current State**: Works well for single team, small roster (<50 athletes)

**At Scale** (100+ athletes, 50+ lineups):
1. **Performance**: O(n²) computations will slow down
2. **Re-renders**: Whole-store subscriptions will cause lag
3. **Memory**: JSON cloning creates garbage
4. **Database**: No pagination, loads all data at once
5. **UI**: EventsSection will be slow with many events

**Recommendations**:
- Add pagination/virtualization for large rosters
- Implement selectors for granular subscriptions
- Consider server-side computations for team metrics
- Add caching layer (React Query)

---

## 5. Prioritized Action Plan

### 🟢 Quick Wins (< 2 hours)

**Immediate fixes** you can do right now:

1. **Fix MAX_ATHLETES_IN_LINEUP constant** (5 min)
   - Change `12` to `6` in `constants/index.ts:4` (or update docs)

2. **Fix useTeam circular dependency** (30 min)
   - Remove `currentTeamId` from `loadTeams` dependency array (useTeam.ts:54)

3. **Fix get() inside set()** (10 min)
   - Use `prev.events` instead of `get().events` (useAppStore.ts:758)

4. **Add React.memo to AthleteCard** (15 min)
   - Prevents unnecessary re-renders

5. **Fix auth types** (1 hour)
   - Replace `any` with proper Supabase types (AuthProvider.tsx:11-20)

6. **Add error toasts** (1 hour)
   - Install `sonner`, show user-facing errors

**Total**: ~3 hours, **high impact**

---

### 🟡 High-Impact Improvements (2-8 hours)

**Address critical issues**:

7. **Extract EventSlot component** (3-6 hours)
   - Eliminate 270 lines of duplication
   - Add to `components/EventSlot.tsx`

8. **Move module-level state into Zustand** (2-4 hours)
   - Fix race condition risks
   - `confirmResolver` and `dragStartInfo` → store properties

9. **Replace window.prompt/confirm with modals** (2-4 hours)
   - Better UX, accessibility, styling
   - Reuse existing `showConfirm` pattern

10. **Add runtime validation with Zod** (4-6 hours)
    - Validate Supabase API responses
    - Prevent silent type errors

11. **Fix non-atomic upsertLineupSlots** (1-2 hours)
    - Wrap in transaction or add error recovery

**Total**: ~16-28 hours, **critical fixes**

---

### 🔴 Long-Term Refactoring (1-3 days each)

**Architectural improvements**:

12. **Implement Supabase persistence layer** (1-2 days)
    - `saveLineupToSupabase()`, `saveAthleteToSupabase()`
    - Real-time sync with optimistic updates

13. **Split AppContextValue into slices** (1-2 days)
    - `useDataStore`, `useUIStore`, `useDragStore`
    - Reduces complexity, improves performance

14. **Add comprehensive test suite** (2-3 days)
    - Vitest + React Testing Library
    - Cover critical paths (uniqueness, mutations, drag-and-drop)

15. **Implement granular selectors** (1 day)
    - Prevent unnecessary re-renders
    - Add Zustand devtools

16. **Replace JSON cloning with immer.js** (2-3 hours)
    - Better performance
    - Cleaner mutations

**Total**: ~7-12 days, **sustainability**

---

## Summary

### Start Here (This Week)
1. Fix the `MAX_ATHLETES_IN_LINEUP` constant mismatch
2. Address module-level state race conditions
3. Extract EventSlot component to eliminate duplication

### Next Month
4. Implement Supabase persistence layer (currently missing)
5. Split Zustand store into manageable slices
6. Add error boundaries and user-facing error messages
7. Implement basic test coverage (50%+ of critical paths)

### Long-Term (Q2 2025)
8. Full test coverage (80%+)
9. Performance optimization (selectors, memoization)
10. Add Storybook for component development
11. Implement offline support with optimistic updates

---

**Overall Grade**: B- (Good foundation, needs refactoring)

**Strengths**: Modern stack, good TypeScript usage, clean architecture
**Weaknesses**: Technical debt accumulating, missing persistence, duplication

You have a **solid MVP** that works well for current use case. The critical issues (#1-5) should be addressed before adding new features to prevent compounding technical debt.
