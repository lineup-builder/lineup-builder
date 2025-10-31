# Netlify Staging Setup - Quick Steps

## ✅ Your Current Setup
- Production (`main`) is already deploying ✅
- `netlify.toml` file added (won't break existing setup)

## 🎯 Enable Staging Branch Deployments

### Option 1: Via Netlify Dashboard (Recommended)

1. Go to your Netlify site dashboard
2. Navigate to: **Site settings** → **Build & deploy** → **Continuous Deployment**
3. Under **"Branch deploys"** section:
   - Click **"Add branch"**
   - Enter: `staging`
   - Click **"Save"**

### Option 2: Via netlify.toml (Already Done ✅)

The `netlify.toml` file already includes:
```toml
[[context.staging]]
  branch = "staging"
```

Netlify will automatically detect this when you push the file.

## 🔍 Verify Configuration

After pushing `netlify.toml`:

1. Check Netlify dashboard → **Deploys** tab
2. You should see:
   - Production deploys from `main` ✅ (already working)
   - Branch deploys section showing `staging` ready

## 🚀 Test Staging Deployment

```bash
# Make sure you're on staging branch
git checkout staging

# Push to trigger deployment
git push origin staging
```

You'll get a staging URL like: `https://staging--your-site-name.netlify.app`

## 📝 Environment Variables

If you need different Supabase credentials for staging:

1. Netlify Dashboard → **Site settings** → **Environment variables**
2. Add variables for **"Branch deploy"** context (applies to staging):
   ```
   VITE_SUPABASE_URL=https://your-staging-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-staging-anon-key
   ```

Or keep using the same Supabase project for both (simpler for now).

## ⚠️ Important Notes

- **Existing production setup is NOT affected** - `main` branch will continue working exactly as before
- **netlify.toml enhances your setup** - adds staging without removing anything
- **Dashboard settings still matter** - make sure to enable branch deploys in dashboard

