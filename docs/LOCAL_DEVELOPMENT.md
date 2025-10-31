# Local Development with Supabase

This guide explains how to develop locally with a complete Supabase instance, isolated from production.

## Prerequisites

- Docker Desktop installed and running
- pnpm installed
- Supabase CLI (already in devDependencies)

## Quick Start

### 1. Start Local Supabase

```bash
pnpm supabase start
```

This will:
- Start PostgreSQL, Auth, Storage, Realtime, and other services
- Run on `http://localhost:54321`
- Create a local email inbox at `http://localhost:54324`
- Take 2-3 minutes on first run (downloads Docker images)

### 2. Get Local Credentials

```bash
pnpm supabase status
```

Copy the `API URL` and `anon key` from the output.

### 3. Configure Environment

Create `.env.local` with your LOCAL credentials:

```bash
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=<anon-key-from-supabase-status>
```

Keep `.env.production` (or similar) for production credentials.

### 4. Apply Database Schema

```bash
# This applies supabase/schema.sql to your local database
pnpm supabase db reset
```

### 5. Start Development Server

```bash
pnpm dev
```

Your app is now running against the local Supabase instance!

## How It Works

### Local Services

When you run `pnpm supabase start`, Docker containers are created for:

- **PostgreSQL**: `localhost:54322` (database)
- **API Gateway**: `http://localhost:54321` (what your app uses)
- **Auth**: Email/password, OAuth, magic links
- **Inbucket**: `http://localhost:54324` (catches all emails)
- **Studio**: `http://localhost:54323` (database UI)

### Email Testing

All emails (signup confirmations, magic links, etc.) are caught by Inbucket:

1. Sign up with any email (doesn't need to be real)
2. Open `http://localhost:54324`
3. Click on the email to view confirmation link
4. Copy the link and paste it in your browser

### Authentication Testing

Local auth is completely separate from production:
- Create test accounts with fake emails
- No OAuth setup needed (unless you want to test it)
- Reset database anytime without affecting prod

## Common Workflows

### Reset Database to Clean State

```bash
pnpm supabase db reset
```

This will:
- Drop all data
- Re-run migrations
- Apply `supabase/schema.sql`
- Fresh start in seconds

### View Database

```bash
# Open Supabase Studio (like Supabase dashboard)
open http://localhost:54323
```

Or use psql:
```bash
pnpm supabase db psql
```

### Generate Types from Local DB

```bash
pnpm supabase gen types typescript --local > src/lib/supabase/types.ts
```

### Stop Local Supabase

```bash
pnpm supabase stop
```

### Stop and Remove All Data

```bash
pnpm supabase stop --no-backup
```

## Schema Development Workflow

### Option 1: Direct SQL (Current Approach)

1. Edit `supabase/schema.sql`
2. Run `pnpm supabase db reset`
3. Regenerate types: `pnpm supabase gen types typescript --local > src/lib/supabase/types.ts`

### Option 2: Migrations (Recommended for Teams)

```bash
# Create a new migration
pnpm supabase migration new add_team_settings

# Edit the migration file in supabase/migrations/
# Then apply it
pnpm supabase migration up

# Generate types
pnpm supabase gen types typescript --local > src/lib/supabase/types.ts
```

Migrations are better because:
- Version controlled schema changes
- Easy to apply to production
- Rollback capability

## Switching Between Environments

### Method 1: Environment Variables

```bash
# Development (uses .env.local)
pnpm dev

# Production build (uses .env.production)
pnpm build
```

### Method 2: Multiple .env Files

```bash
# .env.development
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=local-key

# .env.production
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=prod-key
```

Then in `vite.config.ts`:
```typescript
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    // config
  }
})
```

## Deploying Schema to Production

### Initial Setup (First Time)

```bash
# Link to your production project
pnpm supabase link --project-ref your-project-id

# Push schema
pnpm supabase db push --linked
```

### After Schema Changes

```bash
# Option 1: Push entire schema
pnpm supabase db push --linked

# Option 2: Use migrations
pnpm supabase migration up --linked
```

## Troubleshooting

### "Docker is not running"

Start Docker Desktop and wait for it to fully start.

### "Port already in use"

Another Supabase instance is running:
```bash
pnpm supabase stop
pnpm supabase start
```

### "Permission denied"

```bash
sudo pnpm supabase start
```

### "Schema changes not appearing"

```bash
# Reset the database
pnpm supabase db reset

# Regenerate types
pnpm supabase gen types typescript --local > src/lib/supabase/types.ts
```

### "Can't receive emails"

Check Inbucket: `http://localhost:54324`

All emails go there, regardless of the email address used.

### "Lost all my test data"

Local data is ephemeral by design. To preserve data between restarts:

```bash
# Stop without deleting data
pnpm supabase stop

# Start again (data persists)
pnpm supabase start
```

## Best Practices

### 1. Never Mix Environments

Always check which environment you're connected to:
```bash
echo $VITE_SUPABASE_URL
```

### 2. Use Migrations for Schema Changes

Don't edit production database directly. Use migrations:
```bash
pnpm supabase migration new your_change
```

### 3. Seed Data for Testing

Create a seed file `supabase/seed.sql`:
```sql
-- Insert test team
INSERT INTO teams (name, type) VALUES ('Test Team', 'custom');

-- Insert test athletes
INSERT INTO athletes (name, team_id)
SELECT 'Test Athlete ' || i, (SELECT id FROM teams LIMIT 1)
FROM generate_series(1, 10) i;
```

Then apply:
```bash
pnpm supabase db reset  # This runs seed.sql automatically
```

### 4. Keep .env Files Secure

```bash
# .gitignore
.env.local
.env.production
.env*.local
```

### 5. Document Schema Changes

Add comments to migrations:
```sql
-- Migration: Add team settings
-- Date: 2024-10-19
-- Description: Add settings JSON column to teams table

ALTER TABLE teams ADD COLUMN settings JSONB DEFAULT '{}';
```

## Useful Commands Reference

```bash
# Start/stop
pnpm supabase start
pnpm supabase stop

# Database
pnpm supabase db reset          # Reset to schema.sql
pnpm supabase db push           # Push to remote
pnpm supabase db psql           # Open PostgreSQL shell

# Migrations
pnpm supabase migration new name   # Create migration
pnpm supabase migration up         # Apply migrations

# Types
pnpm supabase gen types typescript --local > src/lib/supabase/types.ts

# Status
pnpm supabase status            # Show all service URLs and keys
```

## Resources

- [Supabase Local Development Docs](https://supabase.com/docs/guides/cli/local-development)
- [Database Migrations Guide](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli/introduction)
