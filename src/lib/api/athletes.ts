import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

type Athlete = Database["public"]["Tables"]["athletes"]["Row"];
type AthleteInsert = Database["public"]["Tables"]["athletes"]["Insert"];
type AthleteUpdate = Database["public"]["Tables"]["athletes"]["Update"];
type AthleteEvent = Database["public"]["Tables"]["athlete_events"]["Row"];
type AthleteEventInsert = Database["public"]["Tables"]["athlete_events"]["Insert"];

export type AthleteWithEvents = Athlete & {
  athlete_events: AthleteEvent[];
};

export async function getTeamAthletes(teamId: string) {
  const { data, error } = await supabase
    .from("athletes")
    .select(
      `
      *,
      athlete_events(*)
    `
    )
    .eq("team_id", teamId)
    .order("name");

  if (error) throw error;
  return data as AthleteWithEvents[];
}

export async function getAthlete(athleteId: string) {
  const { data, error } = await supabase
    .from("athletes")
    .select(
      `
      *,
      athlete_events(*)
    `
    )
    .eq("id", athleteId)
    .single();

  if (error) throw error;
  return data as AthleteWithEvents;
}

export async function createAthlete(
  athlete: Omit<AthleteInsert, "id" | "created_at" | "updated_at">
) {
  const { data, error } = await supabase
    .from("athletes")
    .insert(athlete)
    .select()
    .single();

  if (error) throw error;
  return data as Athlete;
}

export async function updateAthlete(athleteId: string, updates: AthleteUpdate) {
  const { data, error } = await supabase
    .from("athletes")
    .update(updates)
    .eq("id", athleteId)
    .select()
    .single();

  if (error) throw error;
  return data as Athlete;
}

export async function deleteAthlete(athleteId: string) {
  const { error } = await supabase.from("athletes").delete().eq("id", athleteId);

  if (error) throw error;
}

export async function upsertAthleteEvent(
  athleteId: string,
  eventData: Omit<AthleteEventInsert, "athlete_id" | "id">
) {
  const { data, error } = await supabase
    .from("athlete_events")
    .upsert({
      athlete_id: athleteId,
      ...eventData,
    })
    .select()
    .single();

  if (error) throw error;
  return data as AthleteEvent;
}

export async function deleteAthleteEvent(
  athleteId: string,
  eventAbbr: "FX" | "PH" | "SR" | "VT" | "PB" | "HB"
) {
  const { error } = await supabase
    .from("athlete_events")
    .delete()
    .eq("athlete_id", athleteId)
    .eq("event_abbr", eventAbbr);

  if (error) throw error;
}

export async function bulkUpsertAthleteEvents(
  athleteId: string,
  events: Omit<AthleteEventInsert, "athlete_id" | "id">[]
) {
  const { data, error } = await supabase
    .from("athlete_events")
    .upsert(
      events.map((e) => ({
        athlete_id: athleteId,
        ...e,
      }))
    )
    .select();

  if (error) throw error;
  return data as AthleteEvent[];
}
