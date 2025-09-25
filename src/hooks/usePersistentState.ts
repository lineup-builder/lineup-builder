import { useEffect, useState } from "react";
import type {
  Athlete,
  EventConfig,
  PersistedData,
  SavedLineups,
} from "@/lib/types/index.ts";
import { DEFAULT_ATHLETES, DEFAULT_EVENTS } from "@/lib/constants/index.ts";
import { createEmptyLineup } from "@/lib/utils/lineup.ts";
import {
  loadDataFromLocalStorage,
  saveDataToLocalStorage,
} from "@/lib/storage/localStorage.ts";

export function usePersistentState() {
  const [events] = useState<EventConfig[]>([...DEFAULT_EVENTS]);
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [savedLineups, setSavedLineups] = useState<SavedLineups>({});
  const [activeLineupId, setActiveLineupId] = useState<string | null>(null);

  useEffect(() => {
    const persisted = loadDataFromLocalStorage();
    if (persisted) {
      setAthletes(persisted.athletes || [...DEFAULT_ATHLETES]);
      setSavedLineups(persisted.savedLineups || {});
      setActiveLineupId(persisted.activeLineupId || null);
      return;
    }
    const firstId = `lineup-${Date.now()}`;
    const initial = createEmptyLineup(events);
    const data: PersistedData = {
      athletes: [...DEFAULT_ATHLETES],
      savedLineups: {
        [firstId]: { title: "Untitled Lineup", lineup: initial },
      },
      activeLineupId: firstId,
    };
    setAthletes(data.athletes);
    setSavedLineups(data.savedLineups);
    setActiveLineupId(data.activeLineupId);
    saveDataToLocalStorage(data);
  }, [events]);

  useEffect(() => {
    if (!activeLineupId) return;
    const data: PersistedData = { athletes, savedLineups, activeLineupId };
    saveDataToLocalStorage(data);
  }, [athletes, savedLineups, activeLineupId]);

  return {
    events,
    athletes,
    setAthletes,
    savedLineups,
    setSavedLineups,
    activeLineupId,
    setActiveLineupId,
  };
}
