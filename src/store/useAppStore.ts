import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { StateCreator } from "zustand";
import type {
  Athlete,
  EventConfig,
  EventMetrics,
  Lineup,
  SavedLineups,
} from "@/lib/types/index.ts";
import {
  DEFAULT_ATHLETES,
  DEFAULT_EVENTS,
  MAX_ATHLETES_IN_LINEUP,
} from "@/lib/constants/index.ts";
import { createEmptyLineup, getUniqueAthletesInEvents } from "@/lib/utils/lineup.ts";
import { getTeamAthletes, type AthleteWithEvents } from "@/lib/api/athletes";
import { getTeamLineups, type LineupWithSlots } from "@/lib/api/lineups";
// storage is handled by zustand persist middleware

type EventMetricKey = keyof EventMetrics; // 'd_score' | 'consistency' | 'avg_score'

export type AppContextValue = {
  // Team context
  currentTeamId: string | null;
  setCurrentTeamId: (teamId: string | null) => void;
  // Loading and error states
  isLoading: boolean;
  error: Error | null;
  // Data
  events: EventConfig[];
  athletes: Athlete[];
  setAthletes: React.Dispatch<React.SetStateAction<Athlete[]>>;
  savedLineups: SavedLineups;
  setSavedLineups: React.Dispatch<React.SetStateAction<SavedLineups>>;
  activeLineupId: string;
  setActiveLineupId: (id: string) => void;
  activeLineup: Lineup;
  // metrics
  eventMetricState: Record<string, EventMetricKey>;
  setEventMetricState: React.Dispatch<
    React.SetStateAction<Record<string, EventMetricKey>>
  >;
  activeSummaryMetric: EventMetricKey;
  setActiveSummaryMetric: React.Dispatch<React.SetStateAction<EventMetricKey>>;
  // derived
  uniqueCount: number;
  // operations
  handleSpecialistAdd: (eventId: string, athleteId: string) => void;
  removeFromSlot: (eventId: string, slotIndex: number) => void;
  clearEvent: (eventId: string) => void;
  resetAllEvents: () => void;
  sortRoster: () => void;
  // lineup management
  renameActiveLineup: (title: string) => void;
  newLineup: (title: string) => void;
  deleteActiveLineup: () => void;
  addAthlete: () => void;
  // Async Supabase operations
  loadTeamAthletes: (teamId: string) => Promise<void>;
  loadTeamLineups: (teamId: string) => Promise<void>;
  syncWithSupabase: (teamId: string) => Promise<void>;
  // helpers
  eventTotalLabelAndValue: (eventId: string) => {
    label: string;
    value: string;
  };
  teamSummary: { title: string; value: string };
  // modals
  rosterOpen: boolean;
  setRosterOpen: (open: boolean) => void;
  profileOpen: boolean;
  setProfileOpen: (open: boolean) => void;
  editingAthleteId: string | null;
  setEditingAthleteId: (id: string | null) => void;
  openProfile: (athleteId: string) => void;
  // confirmation modal
  confirmState: { title: string; message: string } | null;
  showConfirm: (title: string, message: string) => Promise<boolean>;
  confirmAccept: () => void;
  confirmCancel: () => void;
  // DnD
  onDragStart: (e: React.DragEvent<HTMLElement>) => void;
  onDragEnd: () => void;
  dropToSlot: (
    eventId: string,
    slotIndex: number,
    draggedAthleteId: string
  ) => void;
};

type DragStartInfo =
  | { source: "pool" }
  | { source: "slot"; eventId: string; slotIndex: number };

let confirmResolver: ((v: boolean) => void) | null = null;
let dragStartInfo: DragStartInfo | null = null;

function computeActiveLineup(
  activeLineupId: string,
  savedLineups: SavedLineups,
  events: EventConfig[]
): Lineup {
  return activeLineupId
    ? savedLineups[activeLineupId]?.lineup || createEmptyLineup(events)
    : createEmptyLineup(events);
}

function computeTeamSummary(
  state: Pick<
    AppContextValue,
    | "activeLineupId"
    | "savedLineups"
    | "athletes"
    | "events"
    | "activeSummaryMetric"
  >
): { title: string; value: string } {
  if (!state.activeLineupId)
    return { title: "Total Team D-Score", value: "0.0" };
  let totalD = 0,
    totalC = 0,
    totalA = 0,
    count = 0;
  state.events.forEach((cfg) => {
    const lineupForEvent =
      state.savedLineups[state.activeLineupId].lineup[cfg.id] || [];
    for (let i = 0; i < 4; i++) {
      const athleteId = lineupForEvent[i];
      if (athleteId) {
        const athlete = state.athletes.find((a) => a.id === athleteId);
        if (
          athlete &&
          athlete.events &&
          Object.prototype.hasOwnProperty.call(athlete.events, cfg.abbr)
        ) {
          const ev = athlete.events[cfg.abbr]!;
          totalD += ev.d_score;
          totalC += ev.consistency;
          totalA += ev.avg_score;
          count++;
        }
      }
    }
  });
  switch (state.activeSummaryMetric) {
    case "d_score":
      return { title: "Total Team D-Score", value: totalD.toFixed(1) };
    case "consistency":
      return {
        title: "Team Average Consistency",
        value: `${(count ? totalC / count : 0).toFixed(1)}%`,
      };
    case "avg_score":
      return { title: "Total Team Average Score", value: totalA.toFixed(2) };
  }
}

function computeDerived(state: {
  events: EventConfig[];
  athletes: Athlete[];
  savedLineups: SavedLineups;
  activeLineupId: string;
  activeSummaryMetric: EventMetricKey;
}) {
  const activeLineup = computeActiveLineup(
    state.activeLineupId,
    state.savedLineups,
    state.events
  );
  const uniqueCount = activeLineup
    ? getUniqueAthletesInEvents(activeLineup).size
    : 0;
  const teamSummary = computeTeamSummary({
    activeLineupId: state.activeLineupId,
    savedLineups: state.savedLineups,
    athletes: state.athletes,
    events: state.events,
    activeSummaryMetric: state.activeSummaryMetric,
  });
  return { activeLineup, uniqueCount, teamSummary };
}

type WithPersist = [["zustand/persist", unknown]];

const initializer: StateCreator<AppContextValue, WithPersist> = (set, get) => {
  const initialEvents = [...DEFAULT_EVENTS];
  const initialEventMetricState: Record<string, EventMetricKey> = {};
  initialEvents.forEach((e) => {
    initialEventMetricState[e.id] = "d_score";
  });

  const firstId = `lineup-${Date.now()}`;
  const initialSaved: SavedLineups = {
    [firstId]: {
      title: "Untitled Lineup",
      lineup: createEmptyLineup(initialEvents),
    },
  };
  return {
    // Team context
    currentTeamId: null,
    setCurrentTeamId: (teamId: string | null) => set({ currentTeamId: teamId }),
    // Loading and error states
    isLoading: false,
    error: null,
    // Data
    events: initialEvents,
    athletes: [...DEFAULT_ATHLETES],
    savedLineups: initialSaved,
    activeLineupId: firstId,
    ...computeDerived({
      events: initialEvents,
      athletes: [...DEFAULT_ATHLETES],
      savedLineups: initialSaved,
      activeLineupId: firstId,
      activeSummaryMetric: "d_score",
    }),
    eventMetricState: initialEventMetricState,
    setEventMetricState: (
      updater: React.SetStateAction<Record<string, EventMetricKey>>
    ) => {
      set((prev: AppContextValue) => {
        const next =
          typeof updater === "function"
            ? (
                updater as (
                  s: Record<string, EventMetricKey>
                ) => Record<string, EventMetricKey>
              )(prev.eventMetricState)
            : updater;
        return { eventMetricState: next } as Partial<AppContextValue>;
      });
    },
    activeSummaryMetric: "d_score",
    setActiveSummaryMetric: (value: React.SetStateAction<EventMetricKey>) => {
      set((prev: AppContextValue) => {
        const metric =
          typeof value === "function"
            ? (value as (prev: EventMetricKey) => EventMetricKey)(
                prev.activeSummaryMetric
              )
            : value;
        const base = { ...prev, activeSummaryMetric: metric } as unknown as {
          events: EventConfig[];
          athletes: Athlete[];
          savedLineups: SavedLineups;
          activeLineupId: string;
          activeSummaryMetric: EventMetricKey;
        };
        return {
          activeSummaryMetric: metric,
          ...computeDerived(base),
        } as Partial<AppContextValue>;
      });
    },
    setAthletes: (updater: React.SetStateAction<Athlete[]>) => {
      set((prev: AppContextValue) => {
        const athletes =
          typeof updater === "function"
            ? (updater as (a: Athlete[]) => Athlete[])(prev.athletes)
            : updater;
        const base = {
          events: prev.events,
          athletes,
          savedLineups: prev.savedLineups,
          activeLineupId: prev.activeLineupId,
          activeSummaryMetric: prev.activeSummaryMetric,
        };
        return {
          athletes,
          ...computeDerived(base),
        } as Partial<AppContextValue>;
      });
    },
    setSavedLineups: (updater: React.SetStateAction<SavedLineups>) => {
      set((prev: AppContextValue) => {
        const savedLineups =
          typeof updater === "function"
            ? (updater as (s: SavedLineups) => SavedLineups)(prev.savedLineups)
            : updater;
        const base = {
          events: prev.events,
          athletes: prev.athletes,
          savedLineups,
          activeLineupId: prev.activeLineupId,
          activeSummaryMetric: prev.activeSummaryMetric,
        };
        return {
          savedLineups,
          ...computeDerived(base),
        } as Partial<AppContextValue>;
      });
    },
    setActiveLineupId: (id: string) => {
      set((prev: AppContextValue) => {
        const base = {
          events: prev.events,
          athletes: prev.athletes,
          savedLineups: prev.savedLineups,
          activeLineupId: id,
          activeSummaryMetric: prev.activeSummaryMetric,
        };
        return {
          activeLineupId: id,
          ...computeDerived(base),
        } as Partial<AppContextValue>;
      });
    },
    // operations
    handleSpecialistAdd: (eventId: string, athleteId: string) => {
      const { activeLineupId, savedLineups } = get();
      if (!activeLineupId) return;
      const lineupForEvent = savedLineups[activeLineupId].lineup[eventId];
      if (lineupForEvent.includes(athleteId)) return;
      const firstEmpty = lineupForEvent.findIndex(
        (s: string | null) => s === null
      );
      if (firstEmpty === -1) return;
      const temp: Lineup = JSON.parse(
        JSON.stringify(savedLineups[activeLineupId].lineup)
      );
      temp[eventId][firstEmpty] = athleteId;
      const uniqueCurrent = getUniqueAthletesInEvents(
        savedLineups[activeLineupId].lineup
      );
      const uniqueTemp = getUniqueAthletesInEvents(temp);
      if (
        uniqueTemp.size > MAX_ATHLETES_IN_LINEUP &&
        !uniqueCurrent.has(athleteId)
      )
        return;
      set((prev: AppContextValue) => {
        const nextSaved = {
          ...prev.savedLineups,
          [activeLineupId]: {
            ...prev.savedLineups[activeLineupId],
            lineup: temp,
          },
        } as SavedLineups;
        const base = {
          events: prev.events,
          athletes: prev.athletes,
          savedLineups: nextSaved,
          activeLineupId: prev.activeLineupId,
          activeSummaryMetric: prev.activeSummaryMetric,
        };
        return {
          savedLineups: nextSaved,
          ...computeDerived(base),
        } as Partial<AppContextValue>;
      });
    },
    removeFromSlot: (eventId: string, slotIndex: number) => {
      set((prev: AppContextValue) => {
        if (!prev.activeLineupId) return {} as Partial<AppContextValue>;
        const copy: Lineup = JSON.parse(
          JSON.stringify(prev.savedLineups[prev.activeLineupId].lineup)
        );
        copy[eventId][slotIndex] = null;
        const nextSaved = {
          ...prev.savedLineups,
          [prev.activeLineupId]: {
            ...prev.savedLineups[prev.activeLineupId],
            lineup: copy,
          },
        } as SavedLineups;
        const base = {
          events: prev.events,
          athletes: prev.athletes,
          savedLineups: nextSaved,
          activeLineupId: prev.activeLineupId,
          activeSummaryMetric: prev.activeSummaryMetric,
        };
        return {
          savedLineups: nextSaved,
          ...computeDerived(base),
        } as Partial<AppContextValue>;
      });
    },
    clearEvent: (eventId: string) => {
      set((prev: AppContextValue) => {
        if (!prev.activeLineupId) return {} as Partial<AppContextValue>;
        const copy: Lineup = JSON.parse(
          JSON.stringify(prev.savedLineups[prev.activeLineupId].lineup)
        );
        copy[eventId] = Array(6).fill(null);
        const nextSaved = {
          ...prev.savedLineups,
          [prev.activeLineupId]: {
            ...prev.savedLineups[prev.activeLineupId],
            lineup: copy,
          },
        } as SavedLineups;
        const base = {
          events: prev.events,
          athletes: prev.athletes,
          savedLineups: nextSaved,
          activeLineupId: prev.activeLineupId,
          activeSummaryMetric: prev.activeSummaryMetric,
        };
        return {
          savedLineups: nextSaved,
          ...computeDerived(base),
        } as Partial<AppContextValue>;
      });
    },
    resetAllEvents: () => {
      set((prev: AppContextValue) => {
        if (!prev.activeLineupId) return {} as Partial<AppContextValue>;
        const nextSaved = {
          ...prev.savedLineups,
          [prev.activeLineupId]: {
            ...prev.savedLineups[prev.activeLineupId],
            lineup: createEmptyLineup(prev.events),
          },
        } as SavedLineups;
        const base = {
          events: prev.events,
          athletes: prev.athletes,
          savedLineups: nextSaved,
          activeLineupId: prev.activeLineupId,
          activeSummaryMetric: prev.activeSummaryMetric,
        };
        return {
          savedLineups: nextSaved,
          ...computeDerived(base),
        } as Partial<AppContextValue>;
      });
    },
    sortRoster: () => {
      set((prev: AppContextValue) => {
        const athletes = [...prev.athletes].sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        const base = {
          events: prev.events,
          athletes,
          savedLineups: prev.savedLineups,
          activeLineupId: prev.activeLineupId,
          activeSummaryMetric: prev.activeSummaryMetric,
        };
        return {
          athletes,
          ...computeDerived(base),
        } as Partial<AppContextValue>;
      });
    },
    renameActiveLineup: (title: string) => {
      set((prev: AppContextValue) => {
        if (!prev.activeLineupId) return {} as Partial<AppContextValue>;
        const nextSaved = {
          ...prev.savedLineups,
          [prev.activeLineupId]: {
            ...prev.savedLineups[prev.activeLineupId],
            title,
          },
        } as SavedLineups;
        const base = {
          events: prev.events,
          athletes: prev.athletes,
          savedLineups: nextSaved,
          activeLineupId: prev.activeLineupId,
          activeSummaryMetric: prev.activeSummaryMetric,
        };
        return {
          savedLineups: nextSaved,
          ...computeDerived(base),
        } as Partial<AppContextValue>;
      });
    },
    newLineup: (title: string) => {
      set((prev: AppContextValue) => {
        const id = `lineup-${Date.now()}`;
        const nextSaved = {
          ...prev.savedLineups,
          [id]: { title, lineup: createEmptyLineup(prev.events) },
        } as SavedLineups;
        const base = {
          events: prev.events,
          athletes: prev.athletes,
          savedLineups: nextSaved,
          activeLineupId: id,
          activeSummaryMetric: prev.activeSummaryMetric,
        };
        return {
          savedLineups: nextSaved,
          activeLineupId: id,
          ...computeDerived(base),
        } as Partial<AppContextValue>;
      });
    },
    deleteActiveLineup: () => {
      set((prev: AppContextValue) => {
        if (!prev.activeLineupId) return {} as Partial<AppContextValue>;
        if (Object.keys(prev.savedLineups).length <= 1)
          return {} as Partial<AppContextValue>;
        const copy: SavedLineups = { ...prev.savedLineups };
        delete (copy as Record<string, unknown>)[prev.activeLineupId];
        const nextId = Object.keys(copy)[0] || "";
        const base = {
          events: prev.events,
          athletes: prev.athletes,
          savedLineups: copy,
          activeLineupId: nextId,
          activeSummaryMetric: prev.activeSummaryMetric,
        };
        return {
          savedLineups: copy,
          activeLineupId: nextId,
          ...computeDerived(base),
        } as Partial<AppContextValue>;
      });
    },
    addAthlete: () => {
      set((prev: AppContextValue) => {
        const athletes = [
          ...prev.athletes,
          { id: `athlete-${Date.now()}`, name: "", events: {} },
        ];
        const base = {
          events: prev.events,
          athletes,
          savedLineups: prev.savedLineups,
          activeLineupId: prev.activeLineupId,
          activeSummaryMetric: prev.activeSummaryMetric,
        };
        return {
          athletes,
          ...computeDerived(base),
        } as Partial<AppContextValue>;
      });
    },
    eventTotalLabelAndValue: (eventId: string) => {
      const {
        activeLineupId,
        events,
        eventMetricState,
        savedLineups,
        athletes,
      } = get();
      if (!activeLineupId) return { label: "Total D-Score", value: "0.0" };
      const cfg = events.find((e: EventConfig) => e.id === eventId)!;
      const metric = eventMetricState[eventId] || "d_score";
      let total = 0;
      let routineCount = 0;
      const lineupForEvent = savedLineups[activeLineupId].lineup[eventId] || [];
      for (let i = 0; i < 4; i++) {
        const athleteId = lineupForEvent[i];
        if (athleteId) {
          const athlete = athletes.find((a: Athlete) => a.id === athleteId);
          if (
            athlete &&
            athlete.events &&
            Object.prototype.hasOwnProperty.call(athlete.events, cfg.abbr)
          ) {
            const evData = athlete.events[cfg.abbr]!;
            total += evData[metric];
            routineCount++;
          }
        }
      }
      switch (metric) {
        case "consistency":
          return {
            label: "Avg. Consistency",
            value:
              routineCount > 0
                ? `${(total / routineCount).toFixed(1)}%`
                : "0.0%",
          };
        case "avg_score":
          return { label: "Total Avg. Score", value: total.toFixed(2) };
        case "d_score":
        default:
          return { label: "Total D-Score", value: total.toFixed(1) };
      }
    },
    teamSummary: { title: "Total Team D-Score", value: "0.0" },
    rosterOpen: false,
    setRosterOpen: (open: boolean) => set({ rosterOpen: open }),
    profileOpen: false,
    setProfileOpen: (open: boolean) => set({ profileOpen: open }),
    editingAthleteId: null,
    setEditingAthleteId: (id: string | null) => set({ editingAthleteId: id }),
    openProfile: (athleteId: string) =>
      set({ editingAthleteId: athleteId, profileOpen: true }),
    confirmState: null,
    showConfirm: (title: string, message: string) =>
      new Promise<boolean>((resolve) => {
        confirmResolver = resolve;
        set({ confirmState: { title, message } });
      }),
    confirmAccept: () => {
      if (confirmResolver) confirmResolver(true);
      confirmResolver = null;
      set({ confirmState: null });
    },
    confirmCancel: () => {
      if (confirmResolver) confirmResolver(false);
      confirmResolver = null;
      set({ confirmState: null });
    },
    onDragStart: (e: React.DragEvent<HTMLElement>) => {
      const target = e.currentTarget as HTMLElement;
      const fromDropZone = target.closest(".drop-zone") as HTMLElement | null;
      if (!target.id) return;
      e.dataTransfer.setData("text/plain", target.id);
      e.dataTransfer.effectAllowed = "move";
      setTimeout(() => target.classList.add("dragging"), 0);
      if (fromDropZone) {
        dragStartInfo = {
          source: "slot",
          eventId: fromDropZone.dataset.eventId!,
          slotIndex: parseInt(fromDropZone.dataset.slotIndex!),
        };
      } else {
        dragStartInfo = { source: "pool" };
      }
    },
    onDragEnd: () => {
      document
        .querySelectorAll(".dragging")
        .forEach((el) => el.classList.remove("dragging"));
      dragStartInfo = null;
    },
    dropToSlot: (
      targetEventId: string,
      targetSlotIndex: number,
      draggedAthleteId: string
    ) => {
      const { activeLineupId, savedLineups } = get();
      if (!activeLineupId) return;
      const current = savedLineups[activeLineupId].lineup;
      const start = dragStartInfo;
      if (
        start &&
        start.source === "slot" &&
        start.eventId === targetEventId &&
        start.slotIndex === targetSlotIndex
      )
        return;
      const isAlreadyInEvent =
        current[targetEventId].includes(draggedAthleteId);
      if (
        isAlreadyInEvent &&
        (!start || start.source === "pool" || start.eventId !== targetEventId)
      ) {
        return;
      }
      const temp: Lineup = JSON.parse(JSON.stringify(current));
      const athleteInTargetSlot = temp[targetEventId][targetSlotIndex];
      temp[targetEventId][targetSlotIndex] = draggedAthleteId;
      if (start && start.source === "slot") {
        temp[start.eventId][start.slotIndex] = athleteInTargetSlot;
      }
      const uniqueInCurrent = getUniqueAthletesInEvents(current);
      const uniqueInTemp = getUniqueAthletesInEvents(temp);
      if (
        uniqueInTemp.size > MAX_ATHLETES_IN_LINEUP &&
        !uniqueInCurrent.has(draggedAthleteId)
      ) {
        return;
      }
      set((prev: AppContextValue) => {
        const nextSaved = {
          ...prev.savedLineups,
          [activeLineupId]: {
            ...prev.savedLineups[activeLineupId],
            lineup: temp,
          },
        } as SavedLineups;
        const base = {
          events: prev.events,
          athletes: prev.athletes,
          savedLineups: nextSaved,
          activeLineupId: prev.activeLineupId,
          activeSummaryMetric: prev.activeSummaryMetric,
        };
        return {
          savedLineups: nextSaved,
          ...computeDerived(base),
        } as Partial<AppContextValue>;
      });
    },
    // Async Supabase operations
    loadTeamAthletes: async (teamId: string) => {
      try {
        set({ isLoading: true, error: null });
        const athletesData = await getTeamAthletes(teamId);

        // Transform Supabase athletes to app format
        const transformedAthletes: Athlete[] = athletesData.map((dbAthlete: AthleteWithEvents) => ({
          id: dbAthlete.id,
          name: dbAthlete.name,
          events: dbAthlete.athlete_events.reduce((acc, athleteEvent) => {
            acc[athleteEvent.event_abbr] = {
              d_score: athleteEvent.d_score,
              consistency: athleteEvent.consistency,
              avg_score: athleteEvent.avg_score,
            };
            return acc;
          }, {} as Record<string, EventMetrics>),
        }));

        set((prev: AppContextValue) => {
          const base = {
            events: prev.events,
            athletes: transformedAthletes,
            savedLineups: prev.savedLineups,
            activeLineupId: prev.activeLineupId,
            activeSummaryMetric: prev.activeSummaryMetric,
          };
          return {
            athletes: transformedAthletes,
            isLoading: false,
            ...computeDerived(base),
          } as Partial<AppContextValue>;
        });
      } catch (err) {
        set({
          error: err instanceof Error ? err : new Error("Failed to load athletes"),
          isLoading: false
        });
        console.error("Error loading team athletes:", err);
      }
    },
    loadTeamLineups: async (teamId: string) => {
      try {
        set({ isLoading: true, error: null });
        const lineupsData = await getTeamLineups(teamId);

        // Transform Supabase lineups to app format
        const transformedLineups: SavedLineups = lineupsData.reduce((acc, dbLineup: LineupWithSlots) => {
          const lineup: Lineup = {};

          // Group slots by event
          dbLineup.lineup_slots.forEach((slot) => {
            if (!lineup[slot.event_id]) {
              lineup[slot.event_id] = Array(6).fill(null);
            }
            lineup[slot.event_id][slot.slot_index] = slot.athlete_id;
          });

          acc[dbLineup.id] = {
            title: dbLineup.title,
            lineup,
          };
          return acc;
        }, {} as SavedLineups);

        // If no lineups exist, create a default one
        const finalLineups = Object.keys(transformedLineups).length > 0
          ? transformedLineups
          : {
              [`lineup-${Date.now()}`]: {
                title: "Untitled Lineup",
                lineup: createEmptyLineup(get().events),
              },
            };

        const firstLineupId = Object.keys(finalLineups)[0] || "";

        set((prev: AppContextValue) => {
          const base = {
            events: prev.events,
            athletes: prev.athletes,
            savedLineups: finalLineups,
            activeLineupId: firstLineupId,
            activeSummaryMetric: prev.activeSummaryMetric,
          };
          return {
            savedLineups: finalLineups,
            activeLineupId: firstLineupId,
            isLoading: false,
            ...computeDerived(base),
          } as Partial<AppContextValue>;
        });
      } catch (err) {
        set({
          error: err instanceof Error ? err : new Error("Failed to load lineups"),
          isLoading: false
        });
        console.error("Error loading team lineups:", err);
      }
    },
    syncWithSupabase: async (teamId: string) => {
      try {
        set({ isLoading: true, error: null });

        // Load both athletes and lineups in parallel
        await Promise.all([
          get().loadTeamAthletes(teamId),
          get().loadTeamLineups(teamId),
        ]);

        set({ isLoading: false });
      } catch (err) {
        set({
          error: err instanceof Error ? err : new Error("Failed to sync with Supabase"),
          isLoading: false
        });
        console.error("Error syncing with Supabase:", err);
      }
    },
  };
};

export const useAppStore = create<AppContextValue>()(
  persist<AppContextValue>(initializer, {
    name: "lineup-builder",
    onRehydrateStorage: () => () => {
      const s = useAppStore.getState();
      const base = {
        events: s.events,
        athletes: s.athletes,
        savedLineups: s.savedLineups,
        activeLineupId: s.activeLineupId,
        activeSummaryMetric: s.activeSummaryMetric,
      };
      const derived = computeDerived(base);
      useAppStore.setState(derived);
    },
  })
);
