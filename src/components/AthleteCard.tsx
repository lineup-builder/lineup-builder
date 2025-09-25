import type React from "react";
import type { Athlete } from "@/lib/types/index.ts";
import { useAppStore } from "@/store/useAppStore";
import { EventChip } from "@/components/EventChip";
import { Button } from "@/components/ui/button.tsx";
import { Pencil } from "lucide-react";

type AthleteCardProps = {
  athlete: Athlete;
  usageCount: number;
  onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
};

export const AthleteCard = ({
  athlete,
  usageCount,
  onDragStart,
  onDragEnd,
}: AthleteCardProps) => {
  const { openProfile } = useAppStore();
  return (
    <div
      id={athlete.id}
      className="athlete bg-secondary p-3 rounded-md hover:bg-secondary/80 transition-colors"
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span>{athlete.name}</span>
          <Button
            variant="ghost"
            size="sm"
            className="p-1 h-7 w-7"
            aria-label={`Edit ${athlete.name}`}
            title="Edit athlete"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              openProfile(athlete.id);
            }}
            onDragStart={(e) => e.stopPropagation()}
          >
            <Pencil className="size-4" />
          </Button>
        </div>
        <span
          className="usage-count"
          style={{ display: usageCount > 0 ? "flex" : "none" }}
        >
          {usageCount}
        </span>
      </div>
      {athlete.events && Object.keys(athlete.events).length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {Object.keys(athlete.events).map((abbr) => (
            <EventChip key={abbr} abbr={abbr} />
          ))}
        </div>
      )}
    </div>
  );
};
