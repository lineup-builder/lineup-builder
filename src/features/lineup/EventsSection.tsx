import { useAppStore } from "@/store/useAppStore";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip.tsx";
import { Pencil } from "lucide-react";
import { AutoShrinkText } from "@/components/AutoShrinkText";

export const EventsSection = () => {
  const {
    resetAllEvents,
    teamSummary,
    activeSummaryMetric,
    setActiveSummaryMetric,
    savedLineups,
    activeLineupId,
    setActiveLineupId,
    renameActiveLineup,
    newLineup,
    deleteActiveLineup,
    events,
    activeLineup,
    eventMetricState,
    setEventMetricState,
    handleSpecialistAdd,
    removeFromSlot,
    clearEvent,
    eventTotalLabelAndValue,
    onDragStart,
    onDragEnd,
    dropToSlot,
    athletes,
    openProfile,
  } = useAppStore();
  return (
    <main className="md:w-2/3">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-center lg:text-left">Events</h2>
        <div className="flex gap-2">
          <Button
            id="print-btn"
            variant="secondary"
            size="sm"
            onClick={() => window.print()}
          >
            Print/Download
          </Button>
          <Button
            id="reset-all-events-btn"
            variant="destructive"
            size="sm"
            onClick={resetAllEvents}
          >
            Reset All Events
          </Button>
        </div>
      </div>
      <div
        id="events-grid"
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
      >
        {events.map((ev) => {
          const total = eventTotalLabelAndValue(ev.id);
          const sortBy = (eventMetricState[ev.id] || "d_score") as
            | "d_score"
            | "consistency"
            | "avg_score";
          const specialists = athletes
            .filter(
              (a) =>
                a.events &&
                Object.prototype.hasOwnProperty.call(a.events, ev.abbr)
            )
            .sort(
              (a, b) => b.events[ev.abbr][sortBy] - a.events[ev.abbr][sortBy]
            );
          return (
            <Card key={ev.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xl font-bold text-primary">{ev.name}</h3>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="clear-event-btn text-xs text-muted-foreground hover:text-destructive font-semibold uppercase h-auto py-1"
                        onClick={() => clearEvent(ev.id)}
                      >
                        Clear
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Clear this event</TooltipContent>
                  </Tooltip>
                </div>
                <div className="mb-3">
                  <div className="flex items-center gap-2 text-xs mb-1">
                    <span className="font-semibold">Sort by:</span>
                    <Select
                      value={(eventMetricState[ev.id] || "d_score") as string}
                      onValueChange={(
                        val: "d_score" | "consistency" | "avg_score"
                      ) =>
                        setEventMetricState((s) => ({
                          ...s,
                          [ev.id]: val,
                        }))
                      }
                    >
                      <SelectTrigger size="sm" className="h-7 w-[150px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="d_score">D-Score</SelectItem>
                        <SelectItem value="consistency">Consistency</SelectItem>
                        <SelectItem value="avg_score">Avg. Score</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Select
                    onValueChange={(v: string) =>
                      v && handleSpecialistAdd(ev.id, v)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Add Specialist..." />
                    </SelectTrigger>
                    <SelectContent>
                      {specialists.map((s) => {
                        const d = s.events[ev.abbr];
                        return (
                          <SelectItem key={s.id} value={s.id}>{`${
                            s.name
                          } (D: ${d.d_score.toFixed(1)}, C: ${
                            d.consistency
                          }%, A: ${d.avg_score.toFixed(2)})`}</SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-muted-foreground">
                    Main Team (4)
                  </p>
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="drop-zone border-2 border-dashed border-border rounded-lg p-2"
                      data-event-id={ev.id}
                      data-slot-index={i}
                      onDragOver={(e) => {
                        e.preventDefault();
                        (e.currentTarget as HTMLElement).classList.add(
                          "drag-over"
                        );
                      }}
                      onDragLeave={(e) => {
                        (e.currentTarget as HTMLElement).classList.remove(
                          "drag-over"
                        );
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        (e.currentTarget as HTMLElement).classList.remove(
                          "drag-over"
                        );
                        const id = e.dataTransfer.getData("text/plain");
                        if (id) dropToSlot(ev.id, i, id);
                      }}
                    >
                      {activeLineup[ev.id][i] &&
                        (() => {
                          const athleteId = activeLineup[ev.id][i] as string;
                          const a = athletes.find((x) => x.id === athleteId);
                          const mk = sortBy;
                          const ed =
                            a && a.events[ev.abbr]
                              ? a.events[ev.abbr]
                              : { d_score: 0, consistency: 0, avg_score: 0 };
                          const display =
                            mk === "consistency"
                              ? `${ed.consistency}%`
                              : mk === "avg_score"
                              ? ed.avg_score.toFixed(2)
                              : ed.d_score.toFixed(1);
                          return (
                            <div
                              id={athleteId}
                              className="athlete athlete-in-slot bg-primary text-primary-foreground p-2 rounded-lg shadow-sm"
                              draggable
                              onDragStart={onDragStart}
                              onDragEnd={onDragEnd}
                            >
                              <AutoShrinkText
                                className="font-semibold"
                                maxFontSizePx={16}
                                minFontSizePx={12}
                              >
                                {a ? a.name : ""}
                              </AutoShrinkText>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="ml-2 h-6 w-6 rounded hover:bg-primary/80"
                                    aria-label={`Edit ${a ? a.name : "athlete"}`}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (a) openProfile(a.id);
                                    }}
                                    onDragStart={(e) => e.stopPropagation()}
                                  >
                                    <Pencil className="size-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Edit athlete</TooltipContent>
                              </Tooltip>
                              <span className="font-bold bg-primary/90 text-primary-foreground px-2 py-1 rounded text-sm">
                                {display}
                              </span>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span
                                    className="remove-athlete"
                                    onClick={() => removeFromSlot(ev.id, i)}
                                  >
                                    ×
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>Remove athlete</TooltipContent>
                              </Tooltip>
                            </div>
                          );
                        })()}
                    </div>
                  ))}
                  <p className="text-sm font-semibold text-muted-foreground pt-2">
                    All-Around (1)
                  </p>
                  <div
                    className="drop-zone border-2 border-dashed border-border rounded-lg p-2"
                    data-event-id={ev.id}
                    data-slot-index={4}
                    onDragOver={(e) => {
                      e.preventDefault();
                      (e.currentTarget as HTMLElement).classList.add(
                        "drag-over"
                      );
                    }}
                    onDragLeave={(e) => {
                      (e.currentTarget as HTMLElement).classList.remove(
                        "drag-over"
                      );
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      (e.currentTarget as HTMLElement).classList.remove(
                        "drag-over"
                      );
                      const id = e.dataTransfer.getData("text/plain");
                      if (id) dropToSlot(ev.id, 4, id);
                    }}
                  >
                    {activeLineup[ev.id][4] &&
                      (() => {
                        const athleteId = activeLineup[ev.id][4] as string;
                        const a = athletes.find((x) => x.id === athleteId);
                        const mk = sortBy;
                        const ed =
                          a && a.events[ev.abbr]
                            ? a.events[ev.abbr]
                            : { d_score: 0, consistency: 0, avg_score: 0 };
                        const display =
                          mk === "consistency"
                            ? `${ed.consistency}%`
                            : mk === "avg_score"
                            ? ed.avg_score.toFixed(2)
                            : ed.d_score.toFixed(1);
                        return (
                          <div
                            id={athleteId}
                            className="athlete athlete-in-slot bg-primary text-primary-foreground p-2 rounded-lg shadow-sm"
                            draggable
                            onDragStart={onDragStart}
                            onDragEnd={onDragEnd}
                          >
                            <AutoShrinkText
                              className="font-semibold"
                              maxFontSizePx={16}
                              minFontSizePx={12}
                            >
                              {a ? a.name : ""}
                            </AutoShrinkText>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="ml-2 h-6 w-6 rounded hover:bg-primary/80"
                                  aria-label={`Edit ${a ? a.name : "athlete"}`}
                                  onMouseDown={(e) => e.stopPropagation()}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (a) openProfile(a.id);
                                  }}
                                  onDragStart={(e) => e.stopPropagation()}
                                >
                                  <Pencil className="size-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit athlete</TooltipContent>
                            </Tooltip>
                            <span className="font-bold bg-primary/90 text-primary-foreground px-2 py-1 rounded text-sm">
                              {display}
                            </span>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span
                                  className="remove-athlete"
                                  onClick={() => removeFromSlot(ev.id, 4)}
                                >
                                  ×
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>Remove athlete</TooltipContent>
                            </Tooltip>
                          </div>
                        );
                      })()}
                  </div>
                  <p className="text-sm font-semibold text-muted-foreground pt-2">
                    Alternate (1)
                  </p>
                  <div
                    className="drop-zone border-2 border-dashed border-border rounded-lg p-2"
                    data-event-id={ev.id}
                    data-slot-index={5}
                    onDragOver={(e) => {
                      e.preventDefault();
                      (e.currentTarget as HTMLElement).classList.add(
                        "drag-over"
                      );
                    }}
                    onDragLeave={(e) => {
                      (e.currentTarget as HTMLElement).classList.remove(
                        "drag-over"
                      );
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      (e.currentTarget as HTMLElement).classList.remove(
                        "drag-over"
                      );
                      const id = e.dataTransfer.getData("text/plain");
                      if (id) dropToSlot(ev.id, 5, id);
                    }}
                  >
                    {activeLineup[ev.id][5] &&
                      (() => {
                        const athleteId = activeLineup[ev.id][5] as string;
                        const a = athletes.find((x) => x.id === athleteId);
                        const mk = sortBy;
                        const ed =
                          a && a.events[ev.abbr]
                            ? a.events[ev.abbr]
                            : { d_score: 0, consistency: 0, avg_score: 0 };
                        const display =
                          mk === "consistency"
                            ? `${ed.consistency}%`
                            : mk === "avg_score"
                            ? ed.avg_score.toFixed(2)
                            : ed.d_score.toFixed(1);
                        return (
                          <div
                            id={athleteId}
                            className="athlete athlete-in-slot bg-primary text-primary-foreground p-2 rounded-lg shadow-sm"
                            draggable
                            onDragStart={onDragStart}
                            onDragEnd={onDragEnd}
                          >
                            <AutoShrinkText
                              className="font-semibold"
                              maxFontSizePx={16}
                              minFontSizePx={12}
                            >
                              {a ? a.name : ""}
                            </AutoShrinkText>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="ml-2 h-6 w-6 rounded hover:bg-primary/80"
                                  aria-label={`Edit ${a ? a.name : "athlete"}`}
                                  onMouseDown={(e) => e.stopPropagation()}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (a) openProfile(a.id);
                                  }}
                                  onDragStart={(e) => e.stopPropagation()}
                                >
                                  <Pencil className="size-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit athlete</TooltipContent>
                            </Tooltip>
                            <span className="font-bold bg-primary/90 text-primary-foreground px-2 py-1 rounded text-sm">
                              {display}
                            </span>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span
                                  className="remove-athlete"
                                  onClick={() => removeFromSlot(ev.id, 5)}
                                >
                                  ×
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>Remove athlete</TooltipContent>
                            </Tooltip>
                          </div>
                        );
                      })()}
                  </div>
                </div>
                <div className="mt-3 pt-3 text-right">
                  <Separator className="mb-3" />
                  <span className="event-total-label font-bold">
                    {total.label}:{" "}
                  </span>
                  <span
                    className="event-total-value font-bold text-lg text-primary"
                    data-event-id={ev.id}
                  >
                    {total.value}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <Card className="mt-8 text-center">
        <CardContent className="p-6">
          <div className="flex justify-center mb-4 rounded-lg bg-secondary p-1">
            {(["d_score", "consistency", "avg_score"] as const).map(
              (metric) => (
                <Button
                  key={metric}
                  data-metric={metric}
                  variant={activeSummaryMetric === metric ? "default" : "ghost"}
                  className={`summary-toggle-btn w-1/3`}
                  onClick={() => setActiveSummaryMetric(metric)}
                >
                  {metric === "d_score"
                    ? "Total D-Score"
                    : metric === "consistency"
                    ? "Avg. Consistency"
                    : "Total Avg. Score"}
                </Button>
              )
            )}
          </div>
          <h3 className="text-2xl font-bold text-foreground">
            {teamSummary.title}
          </h3>
          <p className="text-5xl font-bold text-primary mt-2">
            {teamSummary.value}
          </p>
        </CardContent>
      </Card>
      <Card id="lineup-management" className="mt-8">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-2 text-center">Saved Lineups</h2>
          <Select
            value={activeLineupId}
            onValueChange={(v: string) => setActiveLineupId(v)}
          >
            <SelectTrigger className="mb-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(savedLineups).map((id) => (
                <SelectItem key={id} value={id}>
                  {savedLineups[id].title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <Button
              id="save-lineup-btn"
              className="w-full"
              onClick={() => {
                const current = savedLineups[activeLineupId];
                const title = window.prompt(
                  "Enter a title for this lineup:",
                  current.title
                );
                if (title) renameActiveLineup(title);
              }}
            >
              Save
            </Button>
            <Button
              id="rename-lineup-btn"
              variant="secondary"
              className="w-full"
              onClick={() => {
                const current = savedLineups[activeLineupId];
                const title = window.prompt(
                  "Enter a new title:",
                  current.title
                );
                if (title) renameActiveLineup(title);
              }}
            >
              Rename
            </Button>
            <Button
              id="new-lineup-btn"
              variant="outline"
              className="w-full"
              onClick={() => {
                const title = window.prompt(
                  "Enter a title for the new lineup:"
                );
                if (title) newLineup(title);
              }}
            >
              New
            </Button>
            <Button
              id="delete-lineup-btn"
              variant="destructive"
              className="w-full"
              onClick={() => {
                if (Object.keys(savedLineups).length <= 1) {
                  alert("Cannot delete the last lineup.");
                  return;
                }
                const ok = window.confirm(
                  `Delete "${savedLineups[activeLineupId].title}"? This cannot be undone.`
                );
                if (ok) deleteActiveLineup();
              }}
            >
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
};
