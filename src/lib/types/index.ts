export type EventConfig = { id: string; name: string; abbr: string };

export type EventMetrics = {
  d_score: number;
  consistency: number;
  avg_score: number;
};

export type Athlete = {
  id: string;
  name: string;
  events: Record<string, EventMetrics>;
};

export type Lineup = Record<string, (string | null)[]>;

export type SavedLineup = {
  title: string;
  lineup: Lineup;
};

export type SavedLineups = Record<string, SavedLineup>;

export type PersistedData = {
  athletes: Athlete[];
  savedLineups: SavedLineups;
  activeLineupId: string | null;
};
