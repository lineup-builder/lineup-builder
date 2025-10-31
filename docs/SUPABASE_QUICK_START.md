# Supabase Quick Start

This is a condensed guide to get you up and running with Supabase quickly.

## 5-Minute Setup

### 1. Create Supabase Project
1. Go to [app.supabase.com](https://app.supabase.com)
2. Create new project
3. Save the database password somewhere secure

### 2. Get Your Credentials
In your Supabase dashboard → **Settings** → **API**:
- Copy **Project URL**
- Copy **anon public** key

### 3. Create .env.local File
In the project root, create `.env.local`:
```bash
VITE_SUPABASE_URL=your-project-url-here
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run Database Schema
In Supabase dashboard → **SQL Editor**:
1. Click "New query"
2. Paste entire contents of `supabase/schema.sql`
3. Click "Run"

### 5. Enable Google OAuth (Optional)
In Supabase dashboard → **Authentication** → **Providers**:
1. Enable Google
2. Follow the setup wizard
3. Add redirect URL: `https://your-project-id.supabase.co/auth/v1/callback`

### 6. Run the App
```bash
pnpm install  # if you haven't already
pnpm dev
```

## What Just Happened?

✅ **Authentication is now live**
- Email/Password login
- Magic Link (passwordless)
- Google OAuth (if configured)

✅ **Database is ready**
- 8 tables created with relationships
- Row Level Security enabled
- Automatic triggers configured

✅ **App is protected**
- Login page shows for unauthenticated users
- Main app only accessible after login

## Next Steps

The current app still uses localStorage. To migrate to Supabase:

1. **Create a team** (coming soon - needs UI)
2. **Add athletes to your team** (will replace hardcoded list)
3. **Save lineups to database** (will replace localStorage)
4. **Create seasons & competitions** (new feature)

## Testing Authentication

1. Open `http://localhost:5173`
2. You should see the login page
3. Try signing up with email/password
4. Check your email for confirmation
5. Click the confirmation link
6. You'll be redirected back to the app

## Troubleshooting

**"Missing Supabase environment variables"**
→ Check that `.env.local` exists and has correct variable names starting with `VITE_`
→ Restart the dev server

**Can't log in**
→ Check email spam folder for confirmation email
→ Verify Site URL in Supabase Auth settings
→ Check browser console for errors

**Database errors**
→ Make sure you ran the schema.sql file
→ Check Supabase Dashboard → Database → Logs

## File Structure Created

```
src/
├── lib/
│   ├── supabase/
│   │   ├── client.ts          # Supabase client instance
│   │   └── types.ts           # TypeScript database types
│   └── api/
│       ├── teams.ts           # Team CRUD operations
│       ├── athletes.ts        # Athlete management
│       ├── lineups.ts         # Lineup persistence
│       └── seasons.ts         # Season/competition management
├── components/auth/
│   ├── AuthProvider.tsx       # Auth context provider
│   └── LoginPage.tsx          # Login/signup UI
├── hooks/
│   └── useAuth.ts             # Authentication hook
└── App.tsx                    # Updated with auth check

supabase/
└── schema.sql                 # Database schema

.env.example                   # Environment template
.env.local                     # Your credentials (git ignored)
```

## API Usage Examples

### Teams
```typescript
import { getUserTeams, createTeam } from '@/lib/api/teams';

// Get all teams for current user
const teams = await getUserTeams();

// Create a new team
const team = await createTeam({
  name: 'Navy Midshipmen',
  type: 'ncaa_official',
  ncaa_team_id: 'navy'
});
```

### Athletes
```typescript
import { getTeamAthletes, createAthlete, upsertAthleteEvent } from '@/lib/api/athletes';

// Get all athletes for a team
const athletes = await getTeamAthletes(teamId);

// Create a new athlete
const athlete = await createAthlete({
  team_id: teamId,
  name: 'John Smith',
  jersey_number: '24',
  year: 'SO'
});

// Add event metrics
await upsertAthleteEvent(athlete.id, {
  event_abbr: 'FX',
  d_score: 6.5,
  consistency: 85,
  avg_score: 14.25
});
```

### Lineups
```typescript
import { createLineup, upsertLineupSlots } from '@/lib/api/lineups';

// Create a lineup
const lineup = await createLineup({
  team_id: teamId,
  season_id: seasonId,
  competition_id: competitionId,
  title: 'Season Opener 2026',
  created_by: user.id
});

// Save slot assignments
await upsertLineupSlots(lineup.id, [
  { event_id: 'event-1', slot_index: 0, athlete_id: athlete1Id },
  { event_id: 'event-1', slot_index: 1, athlete_id: athlete2Id },
  // ... more slots
]);
```

## Current Limitations

⚠️ The following features need to be implemented:

- [ ] Team selection/creation UI
- [ ] Athlete data synced with Supabase
- [ ] Lineup persistence to database
- [ ] Season/competition management UI
- [ ] Real-time updates via Supabase subscriptions
- [ ] User profile/settings page
- [ ] Team member invitation system

These will be added in upcoming updates.

## Full Documentation

See [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md) for detailed configuration options, security best practices, and advanced features.
