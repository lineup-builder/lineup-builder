# Next Steps After Adding Netlify Environment Variables

## ✅ What You've Done
- [x] Added `VITE_SUPABASE_URL` to Netlify (Production + Branch deploys)
- [x] Added `VITE_SUPABASE_ANON_KEY` to Netlify (Production + Branch deploys)
- [x] Marked as secret values ✅

## 🚀 Next Steps

### Step 1: Commit Any Pending Changes

If you have uncommitted changes:

```bash
# Check what needs to be committed
git status

# Add and commit (if needed)
git add vite.config.ts  # Has Netlify host fix
git commit -m "fix: configure Vite for Netlify deployments"
git push origin staging
```

### Step 2: Trigger a Redeploy in Netlify

After adding environment variables, you need to redeploy:

**Option A: Automatic (if you just pushed)**
- Netlify will auto-deploy from your push
- Wait a few minutes for it to complete

**Option B: Manual Redeploy**
1. Go to Netlify Dashboard → **Deploys** tab
2. Click **"Trigger deploy"** dropdown
3. Select **"Clear cache and deploy site"**
4. Select branch: `staging`
5. Click **"Deploy site"**

### Step 3: Verify the Deployment

**Check build log:**
1. Go to **Deploys** tab
2. Click on the latest deployment
3. Expand **"Build log"**
4. Should see:
   ```
   Installing dependencies...
   Running build command...
   pnpm build
   ✓ Built successfully
   Publishing directory dist/
   ```

**Check for errors:**
- ✅ Should NOT see: "Missing Supabase environment variables"
- ✅ Should NOT see: devserver host errors
- ✅ Should see: Build completes successfully

### Step 4: Test the Staging Site

1. After deployment completes, visit your staging URL:
   - `https://staging--your-site-name.netlify.app`
   - OR check Netlify Deploys tab for the exact URL

2. Test the app:
   - Should load without errors
   - Should be able to sign in/sign up
   - Should connect to Supabase

## 🎯 Expected Results

After redeploy with environment variables:
- ✅ App loads successfully
- ✅ Can authenticate with Supabase
- ✅ No "Missing environment variables" errors
- ✅ No devserver host errors

## 🐛 Troubleshooting

**If you see "Missing Supabase environment variables":**
- Double-check variable names: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Ensure scopes are set correctly (Production + Branch deploys)
- Trigger a fresh deploy after adding variables

**If staging still shows devserver error:**
- The `vite.config.ts` fix should help
- Make sure you committed and pushed the vite.config.ts changes
- Trigger a redeploy with cache cleared

**If build fails:**
- Check build logs in Netlify
- Verify environment variables are set
- Make sure values are correct (no extra spaces)

## ✅ Checklist

- [ ] Environment variables added to Netlify
- [ ] Marked as secret values
- [ ] Set for Production scope
- [ ] Set for Branch deploys scope (staging)
- [ ] Committed vite.config.ts changes
- [ ] Pushed to staging branch (or triggered manual redeploy)
- [ ] Build completed successfully
- [ ] Staging site loads correctly

