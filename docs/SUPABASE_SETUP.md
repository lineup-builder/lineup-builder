# Supabase Setup Guide

This guide will walk you through setting up Supabase for the Gymnastics Lineup Builder.

## Prerequisites

- A Supabase account ([sign up here](https://supabase.com))
- Node.js and pnpm installed

## Step 1: Create a Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in project details:
   - **Name**: Gymnastics Lineup Builder
   - **Database Password**: (generate a strong password and save it securely)
   - **Region**: Choose closest to your users
4. Click "Create new project"
5. Wait for the project to finish setup (~2 minutes)

## Step 2: Get Your API Keys

1. In your Supabase project dashboard, click on the **Settings** icon (gear) in the left sidebar
2. Go to **API** section
3. You'll need two values:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **anon public key**: Long string starting with `eyJ...`

## Step 3: Configure Environment Variables

1. In the root of your project, create a file named `.env.local`
2. Add your Supabase credentials:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
```

**Important**: Never commit `.env.local` to git. It's already in `.gitignore`.

## Step 4: Run Database Migrations

1. In your Supabase project dashboard, go to the **SQL Editor** (in the left sidebar)
2. Click "New query"
3. Copy the entire contents of `supabase/schema.sql` from this project
4. Paste it into the SQL editor
5. Click "Run" (or press Cmd/Ctrl + Enter)

This will create all the necessary tables, indexes, Row Level Security policies, and triggers.

## Step 5: Configure Authentication Providers

### Email/Password (Already Enabled)

Email/password authentication is enabled by default in Supabase.

### Google OAuth (Recommended)

1. Go to **Authentication** → **Providers** in your Supabase dashboard
2. Find "Google" in the list and click to expand it
3. Enable "Google enabled"
4. Follow Supabase's guide to set up Google OAuth:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project (or select existing)
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `https://your-project-id.supabase.co/auth/v1/callback`
5. Copy the **Client ID** and **Client Secret** back to Supabase
6. Click "Save"

### Magic Link (Already Configured)

Magic link (passwordless) authentication works out of the box with your email provider settings.

## Step 6: Configure Email Settings (Optional but Recommended)

By default, Supabase uses their email service which has rate limits. For production:

1. Go to **Authentication** → **Email Templates**
2. Customize the email templates (confirmation, magic link, etc.)
3. For custom SMTP, go to **Settings** → **Auth** → **SMTP Settings**

## Step 7: Set Up URL Configuration

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL** to your production domain (or `http://localhost:5173` for development)
3. Add **Redirect URLs**:
   - `http://localhost:5173` (development)
   - Your production URL

## Step 8: Install Dependencies & Run

```bash
# Install dependencies (if you haven't already)
pnpm install

# Start the development server
pnpm dev
```

## Step 9: Test Authentication

1. Open your browser to `http://localhost:5173`
2. You should see the login page
3. Try signing up with email/password
4. Check your email for confirmation link
5. After confirming, you should be redirected to the app

## Database Schema Overview

The schema includes these main tables:

- **teams**: Team organizations (custom or NCAA official)
- **team_members**: User-team relationships with roles (owner/coach/viewer)
- **athletes**: Gymnast rosters per team
- **athlete_events**: Event-specific metrics (D-Score, Consistency, Avg Score)
- **seasons**: Season tracking per team
- **competitions**: Meets/competitions per season
- **lineups**: Saved lineup configurations
- **lineup_slots**: Individual athlete assignments to events

## Row Level Security (RLS)

All tables have RLS enabled with policies that ensure:
- Users can only access data for teams they're members of
- Only owners can delete teams or manage team members
- Coaches and owners can manage athletes and lineups
- Viewers have read-only access

## Triggers & Functions

- **Auto-add team owner**: When creating a team, the user is automatically added as the owner
- **Single active season**: Only one season can be active per team at a time
- **Auto-update timestamps**: `updated_at` fields are automatically maintained

## API Services

The following API service modules are available:

### `src/lib/api/teams.ts`
- `getUserTeams()`: Get all teams for current user
- `createTeam()`: Create a new team
- `updateTeam()`: Update team details
- `deleteTeam()`: Delete a team
- `getTeamMembers()`: Get members of a team
- `addTeamMember()`: Add a user to a team
- `removeTeamMember()`: Remove a user from a team

### `src/lib/api/athletes.ts`
- `getTeamAthletes()`: Get all athletes for a team
- `createAthlete()`: Add a new athlete
- `updateAthlete()`: Update athlete details
- `deleteAthlete()`: Remove an athlete
- `upsertAthleteEvent()`: Set event metrics for an athlete
- `bulkUpsertAthleteEvents()`: Set multiple event metrics at once

### `src/lib/api/lineups.ts`
- `getTeamLineups()`: Get all lineups for a team
- `createLineup()`: Create a new lineup
- `updateLineup()`: Update lineup metadata
- `deleteLineup()`: Delete a lineup
- `upsertLineupSlots()`: Save lineup slot assignments
- `updateLineupSlot()`: Update a single slot

### `src/lib/api/seasons.ts`
- `getTeamSeasons()`: Get all seasons for a team
- `getActiveSeason()`: Get the currently active season
- `createSeason()`: Create a new season
- `updateSeason()`: Update season details
- `deleteSeason()`: Delete a season
- `getSeasonCompetitions()`: Get competitions in a season
- `createCompetition()`: Add a new competition
- `updateCompetition()`: Update competition details
- `deleteCompetition()`: Remove a competition

## Troubleshooting

### "Missing Supabase environment variables"
- Make sure you created `.env.local` in the project root
- Verify the variable names start with `VITE_`
- Restart the dev server after adding environment variables

### Authentication not working
- Check that you've run the schema.sql in Supabase SQL Editor
- Verify your Site URL in Supabase auth settings
- Check browser console for errors

### RLS Policy errors
- Ensure the user is authenticated
- Verify the user is a member of the team they're trying to access
- Check the user's role (owner/coach/viewer) has appropriate permissions

### Database errors
- Check Supabase Dashboard → Database → Logs for detailed error messages
- Verify foreign key relationships are valid
- Ensure unique constraints aren't violated

## Next Steps

Now that Supabase is set up, you need to:

1. **Update the Zustand store** to fetch data from Supabase instead of localStorage
2. **Create team selection UI** for users with multiple teams
3. **Implement season/competition management UI**
4. **Migrate any existing localStorage data** to Supabase (optional)
5. **Add loading states and error handling** throughout the UI

See the main README for implementation details.

## Security Best Practices

- ✅ Never commit `.env.local` to version control
- ✅ Use RLS policies for all database access
- ✅ Validate user input on both client and server
- ✅ Use strong passwords for database
- ✅ Enable MFA on your Supabase account
- ✅ Regularly review access logs
- ✅ Use environment-specific projects (dev/staging/production)

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [JavaScript Client Library](https://supabase.com/docs/reference/javascript/introduction)
