# GitHub Actions CI Setup - Quick Guide

## ✅ What Was Created

The `.github/workflows/ci.yml` file provides three status checks:
1. **`lint`** - Runs ESLint
2. **`type-check`** - Runs TypeScript type checking  
3. **`build`** - Builds the project

## 🚀 Next Steps

### 1. Commit and Push the Workflow

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add GitHub Actions workflow for CI checks"
git push origin staging
```

### 2. Wait for First Run

After pushing, GitHub Actions will automatically run:
- Go to your repository → **Actions** tab
- You'll see the workflow running
- It will create the three status checks: `lint`, `type-check`, `build`

### 3. Configure Branch Protection

Once the workflow has run at least once, configure branch protection:

**For `main` branch:**
1. Go to: Repository → **Settings** → **Branches**
2. Find `main` branch rule (or add one)
3. Under **"Require status checks to pass before merging"**:
   - ✅ Require branches to be up to date before merging
   - Check these boxes:
     - ✅ **lint**
     - ✅ **type-check**
     - ✅ **build**

**For `staging` branch:**
1. Same process for `staging` branch
2. Under **"Require status checks to pass before merging"**:
   - ✅ Require branches to be up to date before merging
   - Check:
     - ✅ **lint**
     - ✅ **type-check**
     - ✅ **build**

### 4. Verify It Works

Create a test PR or push to a branch:
- GitHub Actions will run automatically
- Status checks will appear on the PR
- All checks must pass before merging (if branch protection is configured)

## 🔍 How It Works

**When code is pushed or PR is created:**
1. GitHub Actions triggers automatically
2. Runs three jobs in parallel:
   - Lint validation
   - TypeScript type checking
   - Build validation
3. Reports status back to GitHub
4. Status checks appear on PRs/branches

**When merging to `main`/`staging`:**
- Branch protection checks if status checks passed
- If all checks pass → merge allowed
- If checks fail → merge blocked

**After merge:**
- Netlify automatically deploys (separate from CI)
- CI = validation, Netlify = deployment

## 🎯 What This Achieves

- ✅ Fast feedback on PRs (GitHub Actions runs immediately)
- ✅ Branch protection requirements met
- ✅ Code quality enforced before merge
- ✅ No deployment redundancy (CI validates, Netlify deploys)

## 📝 Note

The workflow runs on:
- `main` branch pushes
- `staging` branch pushes  
- `integration/supabase` branch pushes
- PRs targeting these branches

All other branches/PRs will also trigger the workflow.

