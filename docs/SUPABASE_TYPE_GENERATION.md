# Supabase Type Generation Guide

## Overview

This project includes scripts to automatically generate TypeScript types from your Supabase database schema. This ensures type safety when working with database queries.

## Prerequisites

- Supabase CLI installed (already included as dev dependency)
- Supabase project created and linked

## Method 1: Using Linked Project (Recommended)

### One-time Setup

1. **Initialize Supabase in your project:**
```bash
pnpm supabase init
```

2. **Link to your remote project:**
```bash
pnpm supabase link --project-ref your-project-id
```

You'll be prompted for:
- Your Supabase access token (get from https://app.supabase.com/account/tokens)
- Your database password (from when you created the project)

### Generate Types

Once linked, simply run:

```bash
pnpm supabase:types
```

This will generate types from your linked project and save them to `src/lib/supabase/types.ts`.

## Method 2: Using Project ID

If you prefer not to link your project:

1. **Add your project ID to `.env.local`:**
```bash
SUPABASE_PROJECT_ID=your-project-id-here
```

Your project ID is the subdomain in your Supabase URL:
- URL: `https://abcdefghijklmnop.supabase.co`
- Project ID: `abcdefghijklmnop`

2. **Run the script:**
```bash
pnpm supabase:types:project
```

## When to Regenerate Types

Regenerate types whenever you:
- ✅ Add new tables to your database
- ✅ Modify table columns
- ✅ Change column types
- ✅ Add/remove enums
- ✅ Update RLS policies (types may include policy info)

## What Gets Generated

The generated `types.ts` file includes:

```typescript
export type Database = {
  public: {
    Tables: {
      teams: {
        Row: { ... }      // SELECT queries
        Insert: { ... }   // INSERT queries
        Update: { ... }   // UPDATE queries
      }
      athletes: { ... }
      // ... all your tables
    }
    Views: { ... }
    Functions: { ... }
    Enums: {
      team_type: 'ncaa_official' | 'custom'
      event_abbr: 'FX' | 'PH' | 'SR' | 'VT' | 'PB' | 'HB'
      // ... all your enums
    }
  }
}
```

## Using Generated Types

### In API Files

```typescript
import { Database } from '@/lib/supabase/types';

type Team = Database['public']['Tables']['teams']['Row'];
type TeamInsert = Database['public']['Tables']['teams']['Insert'];
type TeamUpdate = Database['public']['Tables']['teams']['Update'];
```

### With Supabase Client

The client is already typed:

```typescript
import { supabase } from '@/lib/supabase/client';

// TypeScript knows the schema!
const { data, error } = await supabase
  .from('teams')
  .select('*')
  .eq('id', teamId);

// data is typed as Team[]
```

## Troubleshooting

### "No linked project found"

Run `pnpm supabase link` first, or use the `supabase:types:project` script instead.

### "Permission denied"

Make sure you have a valid access token:
1. Go to https://app.supabase.com/account/tokens
2. Create a new access token
3. Use it when running `supabase link`

### "Failed to generate types"

- Check that you've run the schema.sql in your Supabase project
- Verify your project ID is correct
- Make sure your Supabase project is not paused

### Types are outdated

Types are NOT automatically updated. You must manually run the generation script after making schema changes in Supabase.

## CI/CD Integration

For automated type generation in CI/CD:

```yaml
# .github/workflows/types.yml
name: Update Supabase Types

on:
  workflow_dispatch:
  schedule:
    - cron: '0 0 * * 0'  # Weekly

jobs:
  update-types:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm supabase:types:project
        env:
          SUPABASE_PROJECT_ID: ${{ secrets.SUPABASE_PROJECT_ID }}
      - uses: peter-evans/create-pull-request@v5
        with:
          commit-message: 'chore: update supabase types'
          title: 'Update Supabase Types'
```

## Best Practices

1. **Version Control**: Commit the generated types file
2. **Review Changes**: Check the diff when types change
3. **Regular Updates**: Regenerate after every schema migration
4. **Team Sync**: Share the regeneration script with your team

## Alternative: Manual Type Generation

If you prefer manual control, you can use the Supabase CLI directly:

```bash
# With linked project
npx supabase gen types typescript --linked

# With project ID
npx supabase gen types typescript --project-id abcdefghijklmnop

# Save to file
npx supabase gen types typescript --linked > src/lib/supabase/types.ts
```

## Schema-First Development

For local development with migrations:

1. **Create migration:**
```bash
pnpm supabase migration new add_team_settings
```

2. **Edit migration file** in `supabase/migrations/`

3. **Apply migration locally:**
```bash
pnpm supabase db push
```

4. **Generate types from local DB:**
```bash
pnpm supabase gen types typescript --local > src/lib/supabase/types.ts
```

5. **Push to remote:**
```bash
pnpm supabase db push --linked
```

## Resources

- [Supabase CLI Docs](https://supabase.com/docs/guides/cli)
- [Type Generation Docs](https://supabase.com/docs/guides/api/generating-types)
- [Database Migrations](https://supabase.com/docs/guides/cli/local-development)
