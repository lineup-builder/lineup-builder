# Netlify Setup Verification Checklist

## ✅ Configuration Files

### 1. netlify.toml
- [x] Build command: `pnpm build` ✅
- [x] Publish directory: `dist` ✅
- [x] Node version: 20 ✅
- [x] PNPM version: 10.15.1 ✅
- [x] SPA redirects configured ✅

### 2. Build Output
- [x] `pnpm build` creates `dist/` directory ✅
- [x] Static files are generated ✅

## 🔍 Netlify Dashboard Checklist

### Site Settings → Build & Deploy

**Build settings:**
- [ ] Build command: `pnpm build` (should match netlify.toml)
- [ ] Publish directory: `dist` (should match netlify.toml)
- [ ] Node version: 20 (or let Netlify auto-detect)

**Continuous Deployment:**
- [ ] Production branch: `main`
- [ ] Branch deploys: `staging` (or "Preview servers" → `staging`)

**Environment variables:**
- [ ] Production context:
  - `VITE_SUPABASE_URL` = your production Supabase URL
  - `VITE_SUPABASE_ANON_KEY` = your production Supabase key
- [ ] Branch deploy context (for staging):
  - `VITE_SUPABASE_URL` = your staging/production Supabase URL
  - `VITE_SUPABASE_ANON_KEY` = your staging/production Supabase key

### Deploy Logs

**Check a recent deployment:**
1. Go to **Deploys** tab
2. Click on latest deployment
3. Should see:
   ```
   Installing dependencies...
   Running build command...
   pnpm build
   ✓ Built successfully
   Publishing directory...
   ```

**Should NOT see:**
- `pnpm dev` running
- Vite dev server starting
- Any errors about dev server

## 🚨 Common Issues

### Issue: "devserver" host error
**Cause:** Netlify trying to run dev server instead of build
**Fix:** Ensure build command is `pnpm build`, not `pnpm dev`

### Issue: Preview server confusion
**What "Preview servers" means:**
- Preview servers = branch deployments (including staging)
- This is correct! You did it right.
- Staging branch → preview server → staging URL

### Issue: Build failing
**Check:**
1. Build logs in Netlify
2. Environment variables are set
3. Node/PNPM versions match

## 📝 Quick Verification Commands

```bash
# Test build locally (should match Netlify)
pnpm build

# Check build output
ls -la dist/

# Verify files exist
cat dist/index.html
```

## 🎯 Expected Behavior

**When you push to `staging`:**
1. Netlify detects the push
2. Runs `pnpm build`
3. Creates `dist/` directory with static files
4. Serves those files at staging URL
5. No dev server should run

**Staging URL format:**
- `https://staging--your-site-name.netlify.app`
- OR `https://deploy-preview-XXX--your-site-name.netlify.app`

