import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { useState } from "react";
import { useTeam } from "@/hooks/useTeam";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreateTeamDialog } from "@/components/dialogs/CreateTeamDialog";

export function TeamSwitcher() {
  const { teams, currentTeam, loading, selectTeam } = useTeam();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  if (loading) {
    return (
      <Button variant="outline" disabled className="w-[200px] justify-between">
        <span className="truncate">Loading teams...</span>
        <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
      </Button>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-[200px] justify-between">
            <span className="truncate">
              {currentTeam ? currentTeam.name : "Select a team"}
            </span>
            <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[200px]">
          <DropdownMenuLabel>Your Teams</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {teams.length === 0 ? (
            <DropdownMenuItem disabled>No teams yet</DropdownMenuItem>
          ) : (
            teams.map((team) => (
              <DropdownMenuItem
                key={team.id}
                onClick={() => selectTeam(team.id)}
                className="flex items-center justify-between"
              >
                <div className="flex flex-col">
                  <span className="truncate">{team.name}</span>
                  <span className="text-xs text-muted-foreground capitalize">
                    {team.team_members[0]?.role || "member"}
                  </span>
                </div>
                {currentTeam?.id === team.id && (
                  <Check className="ml-2 size-4 shrink-0" />
                )}
              </DropdownMenuItem>
            ))
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 size-4" />
            Create Team
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateTeamDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </>
  );
}
