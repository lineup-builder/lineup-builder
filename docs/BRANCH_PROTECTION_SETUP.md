# Branch Protection and Deployment Strategy Guide

## Common GitHub Branching Strategies

### 1. **Main + Staging Strategy** (Recommended for your setup)
```
main (production) → deploys to production URL
  ↑
staging (test/preview) → deploys to staging URL
  ↑
feature branches
```

### 2. **Git Flow** (More complex, for larger teams)
```
main (production)
  ↑
develop (integration)
  ↑
feature branches
```

### 3. **GitHub Flow** (Simplest, for small teams)
```
main (production)
  ↑
feature branches
```

## Recommended Setup for Your Project

### Branch Structure
- **`main`** - Production branch → `https://your-app.com` (production URL)
- **`staging`** - Staging branch → `https://staging.your-app.com` (staging URL)
- **`integration/supabase`** - Supabase integration branch (not deployed, work-in-progress)
- **`feat/*`** - Feature branches

## Branch Protection Best Practices

### Production Branch (`main`) - Strict Protection

**Required Settings:**
- ✅ **Require a pull request before merging**
  - Required approvals: **1** (or more for larger teams)
  - ✅ Dismiss stale reviews when new commits are pushed
  - ✅ Require review from Code Owners (if you have CODEOWNERS file)
  
- ✅ **Require status checks to pass before merging**
  - ✅ Require branches to be up to date before merging
  - List of required checks: `build`, `lint`, `test` (if you have CI)
  
- ✅ **Require conversation resolution before merging**
  - All comments must be resolved before merge

- ✅ **Require linear history**
  - Prevents merge commits, keeps history clean

- ✅ **Include administrators**
  - Even admins must follow protection rules

**Restrictions:**
- ❌ Do not allow force pushes
- ❌ Do not allow deletions
- ❌ Do not allow bypassing the above settings

### Staging Branch (`staging`) - Moderate Protection

**Required Settings:**
- ✅ **Require a pull request before merging**
  - Required approvals: **0** (optional, faster iteration)
  
- ✅ **Require status checks to pass before merging**
  - ✅ Require branches to be up to date before merging
  
- ✅ **Include administrators**

**Restrictions:**
- ❌ Do not allow force pushes
- ❌ Do not allow deletions
- ✅ Allow bypassing (optional, for emergency fixes)

## Step-by-Step: Setting Up Branch Protection in GitHub

### Step 1: Protect `main` Branch (Production)

1. Go to your repository on GitHub
2. Click **Settings** tab
3. Click **Branches** in the left sidebar (under "Code and automation")
4. Click **"Add rule"** button
5. Configure:

**Branch name pattern:** `main`

**Protect matching branches:**

- ✅ **Require a pull request before merging**
  - ✅ Require approvals: **1**
  - ✅ Dismiss stale pull request approvals when new commits are pushed
  - (Optional) ✅ Require review from Code Owners
  
- ✅ **Require status checks to pass before merging**
  - ✅ Require branches to be up to date before merging
  - (If you have CI/CD) Add required checks: `build`, `lint`, `test`
  
- ✅ **Require conversation resolution before merging**
  
- ✅ **Require linear history**
  
- ✅ **Include administrators**

**Restrict pushes that create matching branches:**

- ✅ **Do not allow force pushes**
- ✅ **Do not allow deletions**

6. Click **"Create"** button

### Step 2: Create and Protect `staging` Branch

**First, create the staging branch:**

```bash
git checkout main
git checkout -b staging
git push origin staging
```

**Then protect it:**

1. In GitHub, go to: **Settings** → **Branches**
2. Click **"Add rule"** button
3. Configure:

**Branch name pattern:** `staging`

**Protect matching branches:**

- ✅ **Require a pull request before merging**
  - Required approvals: **0** (optional approval)
  
- ✅ **Require status checks to pass before merging**
  - ✅ Require branches to be up to date before merging
  
- ✅ **Include administrators**

**Restrict pushes:**

- ✅ **Do not allow force pushes**
- ✅ **Do not allow deletions**

4. Click **"Create"** button

## Deployment Configuration

### Vercel Deployment Setup

If using Vercel, configure in `vercel.json` or dashboard:

```json
{
  "production": {
    "branch": "main",
    "url": "https://lineup-builder.com"
  },
  "staging": {
    "branch": "staging",
    "url": "https://staging-lineup-builder.vercel.app"
  }
}
```

In Vercel Dashboard:
1. Go to Project Settings → Git
2. Configure:
   - **Production Branch:** `main`
   - **Preview Branches:** Add `staging` as a preview branch

### Netlify Deployment Setup

In `netlify.toml`:

```toml
[build]
  command = "pnpm build"
  publish = "dist"

[[context.production]]
  branch = "main"

[[context.staging]]
  branch = "staging"
```

In Netlify Dashboard:
1. Site settings → Build & deploy → Continuous Deployment
2. Add branch:
   - **Production branch:** `main`
   - **Branch deploys:** Enable for `staging`

## Workflow Example

### Daily Development Workflow

```bash
# 1. Work on Supabase features
git checkout integration/supabase
git checkout -b feat/athlete-sync
# ... make changes ...
git push origin feat/athlete-sync
# Create PR: feat/athlete-sync → integration/supabase

# 2. After review, merge to integration branch
# (PR merged: feat/athlete-sync → integration/supabase)

# 3. Test in staging
git checkout staging
git merge integration/supabase
git push origin staging
# Auto-deploys to staging URL for testing

# 4. When ready for production
git checkout main
# Create PR: staging → main
# After approval, merge to main
# Auto-deploys to production URL
```

## Summary: Your Branch Setup

```
main (production)
  ↑ PR required, 1 approval, CI checks, strict protection
  → Deploys to: https://your-app.com

staging (test/preview)
  ↑ PR optional, CI checks, moderate protection
  → Deploys to: https://staging.your-app.com

integration/supabase (work in progress)
  ↑ PR optional, accumulates features
  → Not deployed

feat/* (feature branches)
  ↑ Small PRs → integration/supabase
```

## Quick Reference: Protection Levels

| Setting | main (Production) | staging (Test) |
|---------|------------------|----------------|
| PR Required | ✅ Yes, 1 approval | ✅ Yes, 0 approvals |
| Status Checks | ✅ Required | ✅ Required |
| Linear History | ✅ Required | ❌ Optional |
| Force Push | ❌ Blocked | ❌ Blocked |
| Include Admins | ✅ Yes | ✅ Yes |

