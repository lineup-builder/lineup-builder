import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

type Team = Database["public"]["Tables"]["teams"]["Row"];
type TeamInsert = Database["public"]["Tables"]["teams"]["Insert"];
type TeamUpdate = Database["public"]["Tables"]["teams"]["Update"];
type TeamMember = Database["public"]["Tables"]["team_members"]["Row"];

export async function getUserTeams() {
  const { data, error } = await supabase
    .from("teams")
    .select(
      `
      *,
      team_members!inner(role)
    `
    )
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as (Team & { team_members: { role: string }[] })[];
}

export async function getTeam(teamId: string) {
  const { data, error } = await supabase
    .from("teams")
    .select("*")
    .eq("id", teamId)
    .single();

  if (error) throw error;
  return data as Team;
}

export async function createTeam(team: Omit<TeamInsert, "id" | "created_at" | "updated_at">) {
  const { data, error } = await supabase
    .from("teams")
    .insert(team)
    .select()
    .single();

  if (error) throw error;
  return data as Team;
}

export async function updateTeam(teamId: string, updates: TeamUpdate) {
  const { data, error } = await supabase
    .from("teams")
    .update(updates)
    .eq("id", teamId)
    .select()
    .single();

  if (error) throw error;
  return data as Team;
}

export async function deleteTeam(teamId: string) {
  const { error } = await supabase.from("teams").delete().eq("id", teamId);

  if (error) throw error;
}

export async function getTeamMembers(teamId: string) {
  const { data, error } = await supabase
    .from("team_members")
    .select("*")
    .eq("team_id", teamId);

  if (error) throw error;
  return data as TeamMember[];
}

export async function addTeamMember(
  teamId: string,
  userId: string,
  role: "owner" | "coach" | "viewer"
) {
  const { data, error } = await supabase
    .from("team_members")
    .insert({ team_id: teamId, user_id: userId, role })
    .select()
    .single();

  if (error) throw error;
  return data as TeamMember;
}

export async function removeTeamMember(teamId: string, userId: string) {
  const { error} = await supabase
    .from("team_members")
    .delete()
    .eq("team_id", teamId)
    .eq("user_id", userId);

  if (error) throw error;
}
