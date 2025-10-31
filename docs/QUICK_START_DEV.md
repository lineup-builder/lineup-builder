# Quick Start - Local Development

Get up and running with local Supabase in under 5 minutes.

## Prerequisites

- Docker Desktop installed and running
- Node.js and pnpm installed

## Setup Steps

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Start Local Supabase

```bash
pnpm supabase:start
```

Wait for it to finish (2-3 minutes first time). You'll see output like:

```
Started supabase local development setup.

         API URL: http://localhost:54321
     GraphQL URL: http://localhost:54321/graphql/v1
          DB URL: postgresql://postgres:postgres@localhost:54322/postgres
      Studio URL: http://localhost:54323
    Inbucket URL: http://localhost:54324
      JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
        anon key: eyJhbGc...
service_role key: eyJhbGc...
```

### 3. Create .env.local

Copy the `API URL` and `anon key` from above:

```bash
# .env.local
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz
```

### 4. Start Dev Server

```bash
pnpm dev
```

Open `http://localhost:5173`

## Test Authentication

1. Sign up with any email (e.g., `test@example.com`)
2. Open `http://localhost:54324` (Inbucket - local email)
3. Click the confirmation email
4. Copy the confirmation link and open it
5. You're authenticated!

## Create Your First Team

Once logged in:

1. Click the "Select a team" dropdown in the header
2. Click "Create Team"
3. Enter team name (e.g., "Navy Midshipmen")
4. Select team type
5. Click "Create Team"

The app will automatically load your team's data from Supabase!

## Useful URLs

- **App**: `http://localhost:5173`
- **Database Studio**: `http://localhost:54323`
- **Email Inbox**: `http://localhost:54324`

## Common Commands

```bash
# Start Supabase
pnpm supabase:start

# Stop Supabase
pnpm supabase:stop

# Reset database (fresh start)
pnpm supabase:reset

# View database in browser
pnpm supabase:studio

# Check status/credentials
pnpm supabase:status

# Generate types from local DB
pnpm supabase:types:local
```

## Next Steps

- See [LOCAL_DEVELOPMENT.md](./LOCAL_DEVELOPMENT.md) for detailed docs
- See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for production setup
- See [SUPABASE_INTEGRATION_SUMMARY.md](../SUPABASE_INTEGRATION_SUMMARY.md) for implementation details

## Troubleshooting

**"Docker is not running"**
→ Start Docker Desktop

**"Port already in use"**
→ Run `pnpm supabase:stop` then `pnpm supabase:start`

**"Can't log in"**
→ Check `http://localhost:54324` for confirmation email

**"No teams showing"**
→ Create a team using the dropdown in the header
