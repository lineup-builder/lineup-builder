-- Gymnastics Lineup Builder Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types/enums
CREATE TYPE team_type AS ENUM ('ncaa_official', 'custom');
CREATE TYPE team_member_role AS ENUM ('owner', 'coach', 'viewer');
CREATE TYPE athlete_year AS ENUM ('FR', 'SO', 'JR', 'SR');
CREATE TYPE event_abbr AS ENUM ('FX', 'PH', 'SR', 'VT', 'PB', 'HB');

-- Teams table
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  type team_type NOT NULL DEFAULT 'custom',
  ncaa_team_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Team members (many-to-many relationship between users and teams)
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role team_member_role NOT NULL DEFAULT 'coach',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Athletes table
CREATE TABLE athletes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  jersey_number TEXT,
  year athlete_year,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Athlete event metrics
CREATE TABLE athlete_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  event_abbr event_abbr NOT NULL,
  d_score NUMERIC(4, 1) NOT NULL DEFAULT 0.0,
  consistency INTEGER NOT NULL DEFAULT 0 CHECK (consistency >= 0 AND consistency <= 100),
  avg_score NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
  UNIQUE(athlete_id, event_abbr)
);

-- Seasons table
CREATE TABLE seasons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(team_id, name)
);

-- Competitions table
CREATE TABLE competitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  date DATE,
  location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Lineups table
CREATE TABLE lineups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  season_id UUID REFERENCES seasons(id) ON DELETE SET NULL,
  competition_id UUID REFERENCES competitions(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Lineup slots table
CREATE TABLE lineup_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lineup_id UUID NOT NULL REFERENCES lineups(id) ON DELETE CASCADE,
  event_id TEXT NOT NULL, -- Maps to DEFAULT_EVENTS (event-1 through event-6)
  slot_index INTEGER NOT NULL CHECK (slot_index >= 0 AND slot_index <= 5),
  athlete_id UUID REFERENCES athletes(id) ON DELETE SET NULL,
  UNIQUE(lineup_id, event_id, slot_index)
);

-- Indexes for performance
CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_athletes_team_id ON athletes(team_id);
CREATE INDEX idx_athlete_events_athlete_id ON athlete_events(athlete_id);
CREATE INDEX idx_seasons_team_id ON seasons(team_id);
CREATE INDEX idx_competitions_season_id ON competitions(season_id);
CREATE INDEX idx_lineups_team_id ON lineups(team_id);
CREATE INDEX idx_lineups_season_id ON lineups(season_id);
CREATE INDEX idx_lineups_competition_id ON lineups(competition_id);
CREATE INDEX idx_lineup_slots_lineup_id ON lineup_slots(lineup_id);
CREATE INDEX idx_lineup_slots_athlete_id ON lineup_slots(athlete_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_athletes_updated_at BEFORE UPDATE ON athletes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lineups_updated_at BEFORE UPDATE ON lineups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE athletes ENABLE ROW LEVEL SECURITY;
ALTER TABLE athlete_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lineups ENABLE ROW LEVEL SECURITY;
ALTER TABLE lineup_slots ENABLE ROW LEVEL SECURITY;

-- Teams policies
CREATE POLICY "Users can view teams they are members of"
  ON teams FOR SELECT
  USING (
    id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create teams"
  ON teams FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Team owners can update their teams"
  ON teams FOR UPDATE
  USING (
    id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

CREATE POLICY "Team owners can delete their teams"
  ON teams FOR DELETE
  USING (
    id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- Team members policies
CREATE POLICY "Users can view team members for their teams"
  ON team_members FOR SELECT
  USING (
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Team owners can manage team members"
  ON team_members FOR ALL
  USING (
    team_id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- Athletes policies
CREATE POLICY "Users can view athletes from their teams"
  ON athletes FOR SELECT
  USING (
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Coaches and owners can manage athletes"
  ON athletes FOR ALL
  USING (
    team_id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'coach')
    )
  );

-- Athlete events policies
CREATE POLICY "Users can view athlete events from their teams"
  ON athlete_events FOR SELECT
  USING (
    athlete_id IN (
      SELECT a.id FROM athletes a
      INNER JOIN team_members tm ON a.team_id = tm.team_id
      WHERE tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Coaches and owners can manage athlete events"
  ON athlete_events FOR ALL
  USING (
    athlete_id IN (
      SELECT a.id FROM athletes a
      INNER JOIN team_members tm ON a.team_id = tm.team_id
      WHERE tm.user_id = auth.uid() AND tm.role IN ('owner', 'coach')
    )
  );

-- Seasons policies
CREATE POLICY "Users can view seasons from their teams"
  ON seasons FOR SELECT
  USING (
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Coaches and owners can manage seasons"
  ON seasons FOR ALL
  USING (
    team_id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'coach')
    )
  );

-- Competitions policies
CREATE POLICY "Users can view competitions from their teams"
  ON competitions FOR SELECT
  USING (
    season_id IN (
      SELECT s.id FROM seasons s
      INNER JOIN team_members tm ON s.team_id = tm.team_id
      WHERE tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Coaches and owners can manage competitions"
  ON competitions FOR ALL
  USING (
    season_id IN (
      SELECT s.id FROM seasons s
      INNER JOIN team_members tm ON s.team_id = tm.team_id
      WHERE tm.user_id = auth.uid() AND tm.role IN ('owner', 'coach')
    )
  );

-- Lineups policies
CREATE POLICY "Users can view lineups from their teams"
  ON lineups FOR SELECT
  USING (
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Coaches and owners can manage lineups"
  ON lineups FOR ALL
  USING (
    team_id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'coach')
    )
  );

-- Lineup slots policies
CREATE POLICY "Users can view lineup slots from their teams"
  ON lineup_slots FOR SELECT
  USING (
    lineup_id IN (
      SELECT l.id FROM lineups l
      INNER JOIN team_members tm ON l.team_id = tm.team_id
      WHERE tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Coaches and owners can manage lineup slots"
  ON lineup_slots FOR ALL
  USING (
    lineup_id IN (
      SELECT l.id FROM lineups l
      INNER JOIN team_members tm ON l.team_id = tm.team_id
      WHERE tm.user_id = auth.uid() AND tm.role IN ('owner', 'coach')
    )
  );

-- Function to automatically add user as team owner when creating a team
CREATE OR REPLACE FUNCTION add_user_as_team_owner()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO team_members (team_id, user_id, role)
  VALUES (NEW.id, auth.uid(), 'owner');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER add_user_as_team_owner_trigger
  AFTER INSERT ON teams
  FOR EACH ROW
  EXECUTE FUNCTION add_user_as_team_owner();

-- Function to ensure only one active season per team
CREATE OR REPLACE FUNCTION ensure_single_active_season()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_active = true THEN
    UPDATE seasons
    SET is_active = false
    WHERE team_id = NEW.team_id
      AND id != NEW.id
      AND is_active = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_single_active_season_trigger
  BEFORE INSERT OR UPDATE ON seasons
  FOR EACH ROW
  WHEN (NEW.is_active = true)
  EXECUTE FUNCTION ensure_single_active_season();
