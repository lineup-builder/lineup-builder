# Netlify Deployment Setup Guide

## Overview

Your Netlify configuration supports:
- **Production**: `main` branch → production URL
- **Staging**: `staging` branch → staging URL  
- **Preview**: All other branches/PRs → preview URLs

## Setup Steps

### 1. Connect Repository to Netlify

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **GitHub** and authorize Netlify
4. Select your repository: `lineup-builder/lineup-builder`
5. Configure build settings (Netlify will auto-detect from `netlify.toml`)

### 2. Configure Branch Deployments

In Netlify Dashboard → **Site settings** → **Build & deploy** → **Continuous Deployment**:

**Production branch:**
- Set to: `main`
- Deploy hooks: Use production environment variables

**Branch deploys:**
- ✅ Enable: `staging`
- This will create a separate staging URL

**Deploy contexts:**
- Production: `main`
- Branch deploys: `staging`  
- Deploy previews: All other branches/PRs

### 3. Environment Variables

Set environment variables for each context:

**Production (`main` branch):**
```
VITE_SUPABASE_URL=https://your-prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-prod-anon-key
```

**Staging (`staging` branch):**
```
VITE_SUPABASE_URL=https://your-staging-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-staging-anon-key
```

**Where to set:**
1. Netlify Dashboard → Site settings → **Environment variables**
2. Add variables for:
   - **Production** context
   - **Staging** context (or **Branch deploy** context)

### 4. Create Staging Branch

If you haven't created `staging` branch yet:

```bash
git checkout main
git checkout -b staging
git push origin staging
```

### 5. Test Deployment

**Test staging:**
```bash
git checkout staging
# Make a small change
git commit -m "test: staging deployment"
git push origin staging
```

Check Netlify dashboard - you should see a staging deployment with a unique URL.

**Test production:**
```bash
git checkout main
git merge staging  # or create PR: staging → main
git push origin main
```

## Deployment URLs

After setup, you'll have:
- **Production**: `https://your-site-name.netlify.app` (or custom domain)
- **Staging**: `https://staging--your-site-name.netlify.app`
- **Preview**: `https://deploy-preview-123--your-site-name.netlify.app` (for PRs)

## Netlify Configuration

The `netlify.toml` file configures:

```toml
[build]
  command = "pnpm build"      # Build command
  publish = "dist"            # Output directory

[[context.production]]
  branch = "main"             # Production branch

[[context.staging]]
  branch = "staging"          # Staging branch

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200               # SPA routing support
```

## Next Steps After Deployment Setup

1. ✅ **Verify staging deployment works**
   - Push to `staging` branch
   - Check Netlify dashboard for deployment
   - Test staging URL

2. ✅ **Set up Supabase environments**
   - Production Supabase project for `main`
   - Staging Supabase project for `staging` (or use same project with different auth)

3. ✅ **Continue Supabase integration**
   - Work on `integration/supabase` branch
   - Create feature PRs → `integration/supabase`
   - Merge to `staging` for testing
   - Merge to `main` when ready

4. ✅ **Configure custom domains** (optional)
   - Production: `app.yourdomain.com`
   - Staging: `staging.yourdomain.com`

## Troubleshooting

**Build fails:**
- Check Netlify build logs
- Verify `pnpm` is available (configured in `netlify.toml`)
- Check environment variables are set correctly

**Environment variables not working:**
- Make sure they're set for the correct context (Production/Staging)
- Use `VITE_` prefix for Vite environment variables
- Redeploy after adding variables

**SPA routing not working:**
- Verify `[[redirects]]` section in `netlify.toml`
- Check that redirects are deployed

