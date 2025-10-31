# PR Workflow Guide

## Setting Up GitHub CLI

1. **Authenticate:**
   ```bash
   gh auth login
   ```
   Follow the prompts (web browser is easiest).

2. **Verify:**
   ```bash
   gh auth status
   ```

## Setting Up Branch Protection

### Option 1: Use the Script
```bash
bash scripts/setup-branch-protection.sh
```

### Option 2: Manual via GitHub Web UI
1. Go to: `https://github.com/lineup-builder/lineup-builder/settings/branches`
2. Click "Add rule" for `main`
3. Configure:
   - ✅ Require a pull request before merging
   - Required approvals: 1
   - ✅ Require branches to be up to date
   - ✅ Include administrators
   - ❌ Allow force pushes
   - ❌ Allow deletions

## Creating Feature PRs

### Example: Connect Athlete Management to Supabase

```bash
# 1. Start from integration branch
git checkout integration/supabase
git pull origin integration/supabase

# 2. Create feature branch
git checkout -b feat/athlete-supabase-sync

# 3. Make your changes
# Edit src/features/lineup/RosterManagement.tsx
# Edit src/store/useAppStore.ts

# 4. Commit
git add src/features/lineup/RosterManagement.tsx src/store/useAppStore.ts
git commit -m "feat: connect RosterManagement to Supabase athletes API

- Replace hardcoded DEFAULT_ATHLETES with Supabase fetch
- Add loading states for athlete data
- Update addAthlete to save to Supabase"

# 5. Push
git push origin feat/athlete-supabase-sync

# 6. Create PR (after GitHub CLI is set up)
gh pr create \
  --base integration/supabase \
  --title "feat: connect RosterManagement to Supabase" \
  --body "Connects the roster management component to fetch and save athletes from Supabase.

## Changes
- Replace hardcoded DEFAULT_ATHLETES with Supabase API calls
- Add loading states for athlete data
- Update addAthlete to persist to database

## Testing
- [ ] Athletes load from Supabase on app start
- [ ] Creating new athlete saves to database
- [ ] Editing athlete updates database
- [ ] Deleting athlete removes from database"
```

## PR Naming Convention

- `feat/:` - New features (e.g., `feat/athlete-supabase-sync`)
- `fix/:` - Bug fixes (e.g., `fix/auth-redirect-loop`)
- `refactor/:` - Code refactoring (e.g., `refactor/store-structure`)
- `docs/:` - Documentation updates (e.g., `docs/api-examples`)
- `chore/:` - Maintenance tasks (e.g., `chore/update-dependencies`)

## PR Size Guidelines

- **Small PRs (100-300 lines):** Ideal, easy to review
- **Medium PRs (300-500 lines):** Acceptable, but prefer smaller
- **Large PRs (500+ lines):** Should be broken down

## Review Checklist

When creating PRs, include:
- [ ] Clear description of changes
- [ ] Testing checklist
- [ ] Screenshots (if UI changes)
- [ ] Breaking changes (if any)
- [ ] Related issues/PRs

