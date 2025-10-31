import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

type Lineup = Database["public"]["Tables"]["lineups"]["Row"];
type LineupInsert = Database["public"]["Tables"]["lineups"]["Insert"];
type LineupUpdate = Database["public"]["Tables"]["lineups"]["Update"];
type LineupSlot = Database["public"]["Tables"]["lineup_slots"]["Row"];
type LineupSlotInsert = Database["public"]["Tables"]["lineup_slots"]["Insert"];

export type LineupWithSlots = Lineup & {
  lineup_slots: LineupSlot[];
};

export async function getTeamLineups(teamId: string) {
  const { data, error } = await supabase
    .from("lineups")
    .select(
      `
      *,
      lineup_slots(*),
      seasons(name),
      competitions(name)
    `
    )
    .eq("team_id", teamId)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data as (LineupWithSlots & {
    seasons: { name: string } | null;
    competitions: { name: string } | null;
  })[];
}

export async function getLineup(lineupId: string) {
  const { data, error } = await supabase
    .from("lineups")
    .select(
      `
      *,
      lineup_slots(*)
    `
    )
    .eq("id", lineupId)
    .single();

  if (error) throw error;
  return data as LineupWithSlots;
}

export async function createLineup(
  lineup: Omit<LineupInsert, "id" | "created_at" | "updated_at">
) {
  const { data, error } = await supabase
    .from("lineups")
    .insert(lineup)
    .select()
    .single();

  if (error) throw error;
  return data as Lineup;
}

export async function updateLineup(lineupId: string, updates: LineupUpdate) {
  const { data, error } = await supabase
    .from("lineups")
    .update(updates)
    .eq("id", lineupId)
    .select()
    .single();

  if (error) throw error;
  return data as Lineup;
}

export async function deleteLineup(lineupId: string) {
  const { error } = await supabase.from("lineups").delete().eq("id", lineupId);

  if (error) throw error;
}

export async function upsertLineupSlots(
  lineupId: string,
  slots: Omit<LineupSlotInsert, "lineup_id" | "id">[]
) {
  // Delete existing slots for this lineup
  await supabase.from("lineup_slots").delete().eq("lineup_id", lineupId);

  // Insert new slots
  const { data, error } = await supabase
    .from("lineup_slots")
    .insert(
      slots.map((slot) => ({
        lineup_id: lineupId,
        ...slot,
      }))
    )
    .select();

  if (error) throw error;
  return data as LineupSlot[];
}

export async function updateLineupSlot(
  lineupId: string,
  eventId: string,
  slotIndex: number,
  athleteId: string | null
) {
  const { data, error } = await supabase
    .from("lineup_slots")
    .update({ athlete_id: athleteId })
    .eq("lineup_id", lineupId)
    .eq("event_id", eventId)
    .eq("slot_index", slotIndex)
    .select()
    .single();

  if (error) throw error;
  return data as LineupSlot;
}
