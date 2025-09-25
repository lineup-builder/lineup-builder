import type { EventConfig, Lineup } from "@/lib/types/index.ts";

export function createEmptyLineup(events: EventConfig[]): Lineup {
  const l: Lineup = {};
  events.forEach((e) => {
    l[e.id] = Array(6).fill(null);
  });
  return l;
}

export function getUniqueAthletesInEvents(lineup: Lineup): Set<string> {
  const uniqueIds = new Set<string>();
  Object.values(lineup).forEach((eventSlots) => {
    for (let i = 0; i < 4; i++) {
      const athleteId = eventSlots[i];
      if (athleteId) uniqueIds.add(athleteId);
    }
  });
  return uniqueIds;
}
