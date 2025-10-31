import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

type Season = Database["public"]["Tables"]["seasons"]["Row"];
type SeasonInsert = Database["public"]["Tables"]["seasons"]["Insert"];
type SeasonUpdate = Database["public"]["Tables"]["seasons"]["Update"];
type Competition = Database["public"]["Tables"]["competitions"]["Row"];
type CompetitionInsert = Database["public"]["Tables"]["competitions"]["Insert"];
type CompetitionUpdate = Database["public"]["Tables"]["competitions"]["Update"];

export async function getTeamSeasons(teamId: string) {
  const { data, error } = await supabase
    .from("seasons")
    .select("*")
    .eq("team_id", teamId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Season[];
}

export async function getActiveSeason(teamId: string) {
  const { data, error } = await supabase
    .from("seasons")
    .select("*")
    .eq("team_id", teamId)
    .eq("is_active", true)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No active season found
      return null;
    }
    throw error;
  }
  return data as Season;
}

export async function createSeason(
  season: Omit<SeasonInsert, "id" | "created_at">
) {
  const { data, error } = await supabase
    .from("seasons")
    .insert(season)
    .select()
    .single();

  if (error) throw error;
  return data as Season;
}

export async function updateSeason(seasonId: string, updates: SeasonUpdate) {
  const { data, error } = await supabase
    .from("seasons")
    .update(updates)
    .eq("id", seasonId)
    .select()
    .single();

  if (error) throw error;
  return data as Season;
}

export async function deleteSeason(seasonId: string) {
  const { error } = await supabase.from("seasons").delete().eq("id", seasonId);

  if (error) throw error;
}

export async function getSeasonCompetitions(seasonId: string) {
  const { data, error } = await supabase
    .from("competitions")
    .select("*")
    .eq("season_id", seasonId)
    .order("date", { ascending: true, nullsFirst: false });

  if (error) throw error;
  return data as Competition[];
}

export async function createCompetition(
  competition: Omit<CompetitionInsert, "id" | "created_at">
) {
  const { data, error } = await supabase
    .from("competitions")
    .insert(competition)
    .select()
    .single();

  if (error) throw error;
  return data as Competition;
}

export async function updateCompetition(
  competitionId: string,
  updates: CompetitionUpdate
) {
  const { data, error } = await supabase
    .from("competitions")
    .update(updates)
    .eq("id", competitionId)
    .select()
    .single();

  if (error) throw error;
  return data as Competition;
}

export async function deleteCompetition(competitionId: string) {
  const { error } = await supabase
    .from("competitions")
    .delete()
    .eq("id", competitionId);

  if (error) throw error;
}
