# GitHub Actions CI Workflow Setup

## What are Status Checks?

Status checks are created by CI/CD workflows (like GitHub Actions). When you push code or create a PR, these workflows run and report back their status (pass/fail).

## Current Setup

I've created a GitHub Actions workflow at `.github/workflows/ci.yml` that will create 3 status checks:

1. **`lint`** - Runs ESLint to check code quality
2. **`type-check`** - Runs TypeScript type checking
3. **`build`** - Builds the project to ensure it compiles

## How to Enable Status Checks

### Step 1: Commit and Push the Workflow

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add GitHub Actions workflow for lint, type-check, and build"
git push origin integration/supabase
```

### Step 2: Wait for First Run

After pushing, GitHub will automatically run the workflow. You can see it in:
- Your repository → **Actions** tab
- It will run on the next push or PR

### Step 3: Configure Branch Protection

Once the workflow has run at least once, you'll see the status checks appear:

1. Go to: **Settings** → **Branches**
2. Click **"Add rule"** for `main`
3. Under **"Require status checks to pass before merging"**:
   - ✅ Require branches to be up to date before merging
   - Check the boxes for:
     - ✅ **lint**
     - ✅ **type-check**
     - ✅ **build**

### Step 4: Verify

Create a test PR to `main` - you should see the status checks running!

## What Happens Now?

- **On every push/PR:** GitHub Actions will automatically:
  1. Run `pnpm lint` (ESLint)
  2. Run `tsc -b` (TypeScript type check)
  3. Run `pnpm build` (Build project)

- **If any check fails:** The PR cannot be merged until fixed

- **If all checks pass:** The PR can be merged (if other requirements are met)

## Optional: Skip Status Checks for Now

If you want to set up branch protection without status checks first:

1. In branch protection settings, **uncheck** "Require status checks to pass"
2. You can still require PR reviews, linear history, etc.
3. Add status checks later once CI is set up

