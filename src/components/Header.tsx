import { LogOut } from "lucide-react";
import { TeamSwitcher } from "./TeamSwitcher";
import { useAuthContext } from "./auth/AuthProvider";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./ui/tooltip";

export const Header = () => {
  const { signOut, user } = useAuthContext();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <header className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <TeamSwitcher />
        <div className="flex items-center gap-3">
          {user && (
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {user.email}
            </span>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Sign out</TooltipContent>
          </Tooltip>
        </div>
      </div>
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">
          Gymnastics Lineup Builder
        </h1>
        <p className="text-muted-foreground mt-2">
          Drag athletes from the pool or use the dropdown to add specialists to
          events.
        </p>
      </div>
    </header>
  );
};
