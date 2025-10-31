import { createContext, useContext, useEffect } from "react";
import type { ReactNode } from "react";
import { useTeam } from "@/hooks/useTeam";
import { useAppStore } from "@/store/useAppStore";

interface TeamContextType {
  currentTeamId: string | null;
  isLoading: boolean;
  error: Error | null;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export function TeamProvider({ children }: { children: ReactNode }) {
  const { currentTeam, loading, error } = useTeam();
  const { currentTeamId, setCurrentTeamId, syncWithSupabase } = useAppStore();

  // Sync currentTeam from useTeam hook to the store
  useEffect(() => {
    if (currentTeam?.id && currentTeam.id !== currentTeamId) {
      setCurrentTeamId(currentTeam.id);
    }
  }, [currentTeam?.id, currentTeamId, setCurrentTeamId]);

  // When team changes, sync data from Supabase
  useEffect(() => {
    if (currentTeamId && !loading) {
      syncWithSupabase(currentTeamId);
    }
  }, [currentTeamId, loading, syncWithSupabase]);

  const value: TeamContextType = {
    currentTeamId,
    isLoading: loading,
    error,
  };

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
}

// Export hook alongside provider for convenience
// eslint-disable-next-line react-refresh/only-export-components
export function useTeamContext() {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error("useTeamContext must be used within a TeamProvider");
  }
  return context;
}
