import { useAppStore } from "@/store/useAppStore";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
// import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { AthleteCard } from "@/components/AthleteCard";

export const AthletePool = () => {
  const {
    sortRoster,
    uniqueCount,
    setRosterOpen,
    athletes,
    activeLineup,
    onDragStart,
    onDragEnd,
  } = useAppStore();
  return (
    <aside className="md:w-1/3 md:sticky md:top-8 self-start">
      <Card>
        <CardHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <CardTitle>Athlete Pool</CardTitle>
            <Button
              id="sort-roster-btn"
              variant="link"
              className="px-0"
              onClick={sortRoster}
            >
              Sort A-Z
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex justify-between items-center mb-4">
            <span className="font-semibold">Unique Athletes Used:</span>
            <span
              id="athlete-count"
              className={`text-lg font-bold px-3 py-1 rounded-full ${
                uniqueCount >= 12
                  ? "bg-destructive/10 text-destructive"
                  : "bg-accent text-accent-foreground"
              }`}
            >
              {uniqueCount} / 12
            </span>
          </div>
          <div className="flex justify-between items-center text-xs text-muted-foreground font-semibold mb-2 px-1 uppercase">
            <span>Athlete</span>
            <span># of Events</span>
          </div>
          <div
            id="athlete-pool"
            className="space-y-3 pt-2 border-t max-h-[60vh] overflow-y-auto"
          >
            {athletes.map((athlete) => {
              const usage = Object.values(activeLineup)
                .flat()
                .filter((id) => id === athlete.id).length;
              return (
                <AthleteCard
                  key={athlete.id}
                  athlete={athlete}
                  usageCount={usage}
                  onDragStart={onDragStart}
                  onDragEnd={onDragEnd}
                />
              );
            })}
          </div>
          <Button
            id="manage-roster-btn"
            className="w-full mt-4"
            onClick={() => setRosterOpen(true)}
          >
            Manage Roster
          </Button>
        </CardContent>
      </Card>
    </aside>
  );
};
