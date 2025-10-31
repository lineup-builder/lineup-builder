import { useState } from "react";
import { useTeam } from "@/hooks/useTeam";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Database } from "@/lib/supabase/types";

type TeamType = Database["public"]["Enums"]["team_type"];

interface CreateTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateTeamDialog({ open, onOpenChange }: CreateTeamDialogProps) {
  const { createNewTeam } = useTeam();
  const [name, setName] = useState("");
  const [type, setType] = useState<TeamType>("custom");
  const [ncaaTeamId, setNcaaTeamId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Team name is required");
      return;
    }

    try {
      setIsSubmitting(true);
      await createNewTeam({
        name: name.trim(),
        type,
        ncaa_team_id: type === "ncaa_official" && ncaaTeamId ? ncaaTeamId : null,
      });

      // Reset form and close dialog
      setName("");
      setType("custom");
      setNcaaTeamId("");
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create team");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isSubmitting) {
      onOpenChange(newOpen);
      if (!newOpen) {
        // Reset form when closing
        setName("");
        setType("custom");
        setNcaaTeamId("");
        setError(null);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Team</DialogTitle>
            <DialogDescription>
              Create a new team to manage your athletes and lineups.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="name">Team Name</Label>
              <Input
                id="name"
                placeholder="Enter team name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSubmitting}
                autoFocus
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type">Team Type</Label>
              <Select
                value={type}
                onValueChange={(value) => setType(value as TeamType)}
                disabled={isSubmitting}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">Custom Team</SelectItem>
                  <SelectItem value="ncaa_official">NCAA Official Team</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {type === "custom"
                  ? "A custom team for club, high school, or personal use"
                  : "An official NCAA gymnastics team"}
              </p>
            </div>

            {type === "ncaa_official" && (
              <div className="grid gap-2">
                <Label htmlFor="ncaa-id">NCAA Team ID (Optional)</Label>
                <Input
                  id="ncaa-id"
                  placeholder="e.g., navy, stanford"
                  value={ncaaTeamId}
                  onChange={(e) => setNcaaTeamId(e.target.value)}
                  disabled={isSubmitting}
                />
                <p className="text-xs text-muted-foreground">
                  A unique identifier for the NCAA team
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Team"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
