import { useState, useEffect, useCallback } from "react";
import { getUserTeams, createTeam, type TeamWithRole } from "@/lib/api/teams";
import type { Tables, TablesInsert } from "@/lib/supabase/types";

type Team = Tables<"teams">;
type TeamInsert = TablesInsert<"teams">;

interface UseTeamReturn {
  teams: TeamWithRole[];
  currentTeam: TeamWithRole | null;
  loading: boolean;
  error: Error | null;
  selectTeam: (teamId: string) => void;
  createNewTeam: (teamData: Omit<TeamInsert, "id" | "created_at" | "updated_at">) => Promise<Team>;
  refreshTeams: () => Promise<void>;
}

const CURRENT_TEAM_KEY = "lineup-builder:current-team-id";

export function useTeam(): UseTeamReturn {
  const [teams, setTeams] = useState<TeamWithRole[]>([]);
  const [currentTeamId, setCurrentTeamId] = useState<string | null>(() => {
    // Load from localStorage on mount
    return localStorage.getItem(CURRENT_TEAM_KEY);
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load teams from Supabase
  const loadTeams = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedTeams = await getUserTeams();
      setTeams(fetchedTeams);

      // If no current team selected, select the first one
      if (!currentTeamId && fetchedTeams.length > 0) {
        const firstTeamId = fetchedTeams[0].id;
        setCurrentTeamId(firstTeamId);
        localStorage.setItem(CURRENT_TEAM_KEY, firstTeamId);
      }
      // If current team is no longer available, clear it
      else if (currentTeamId && !fetchedTeams.find((t) => t.id === currentTeamId)) {
        setCurrentTeamId(null);
        localStorage.removeItem(CURRENT_TEAM_KEY);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load teams"));
      console.error("Error loading teams:", err);
    } finally {
      setLoading(false);
    }
  }, [currentTeamId]);

  // Load teams on mount
  useEffect(() => {
    loadTeams();
  }, [loadTeams]);

  // Select a team
  const selectTeam = useCallback((teamId: string) => {
    setCurrentTeamId(teamId);
    localStorage.setItem(CURRENT_TEAM_KEY, teamId);
  }, []);

  // Create a new team
  const createNewTeam = useCallback(
    async (teamData: Omit<TeamInsert, "id" | "created_at" | "updated_at">) => {
      try {
        setError(null);
        const newTeam = await createTeam(teamData);

        // Refresh teams list to include the new team with role info
        await loadTeams();

        // Auto-select the newly created team
        selectTeam(newTeam.id);

        return newTeam;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to create team");
        setError(error);
        throw error;
      }
    },
    [loadTeams, selectTeam]
  );

  // Get current team object
  const currentTeam = currentTeamId ? teams.find((t) => t.id === currentTeamId) || null : null;

  return {
    teams,
    currentTeam,
    loading,
    error,
    selectTeam,
    createNewTeam,
    refreshTeams: loadTeams,
  };
}
