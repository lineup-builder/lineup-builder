# Branch Strategy and PR Workflow

## Branch Structure

- **`main`** - Production-ready code, auto-deploys, protected
- **`integration/supabase`** - Accumulates all Supabase integration work
- **`feat/*`** - Feature branches for individual Supabase features
- **`fix/*`** - Bug fixes that can go directly to main

## Workflow for Breaking Up Supabase Integration

### Strategy: Feature Branches → Integration Branch → Main

1. **Create feature branches from `integration/supabase`**
   ```bash
   git checkout integration/supabase
   git pull origin integration/supabase
   git checkout -b feat/supabase-athlete-sync
   # ... make changes ...
   git commit -m "feat: connect athlete management to Supabase"
   git push origin feat/supabase-athlete-sync
   ```

2. **Create PR: `feat/*` → `integration/supabase`**
   - Small, focused PRs
   - Easy to review
   - Gets merged into integration branch

3. **Continue accumulating work in `integration/supabase`**
   - All Supabase work flows through this branch
   - Main stays clean and deployable

4. **When ready for production**
   - Create PR: `integration/supabase` → `main`
   - Review entire integration
   - Merge to main when approved

## Recommended Approach

Keep the current large merge commit as the foundation, then create smaller feature PRs going forward.

## Example Feature PRs to Create

1. `feat/athlete-supabase-sync` - Connect RosterManagement to Supabase
2. `feat/lineup-persistence` - Save lineups to database
3. `feat/season-management-ui` - Add season/competition UI
4. `feat/real-time-updates` - Add Supabase Realtime subscriptions

