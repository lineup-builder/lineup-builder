import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import type { EventMetrics } from "@/lib/types/index.ts";

type EditorRow = {
  id: string;
  name: string;
  events: Record<string, EventMetrics>;
};

export const RosterManagement = () => {
  const {
    rosterOpen,
    setRosterOpen,
    athletes,
    events,
    setAthletes,
    setSavedLineups,
  } = useAppStore();
  const [rows, setRows] = useState<EditorRow[]>([]);

  useEffect(() => {
    if (rosterOpen) {
      setRows(
        athletes.map((a) => ({
          id: a.id,
          name: a.name,
          events: { ...a.events },
        }))
      );
    }
  }, [rosterOpen, athletes]);

  if (!rosterOpen) return null;

  const handleAddRow = () => {
    setRows((prev) => [
      ...prev,
      { id: `athlete-${Date.now()}`, name: "", events: {} },
    ]);
  };

  const handleRemoveRow = (id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const handleToggleEvent = (
    rowIdx: number,
    abbr: string,
    checked: boolean
  ) => {
    setRows((prev) =>
      prev.map((r, i) => {
        if (i !== rowIdx) return r;
        const next: EditorRow = { ...r, events: { ...r.events } };
        if (checked) {
          next.events[abbr] = next.events[abbr] || {
            d_score: 0,
            consistency: 0,
            avg_score: 0,
          };
        } else {
          const rest = { ...next.events } as Record<string, EventMetrics>;
          delete rest[abbr];
          next.events = rest;
        }
        return next;
      })
    );
  };

  const handleEventField = (
    rowIdx: number,
    abbr: string,
    field: keyof EventMetrics,
    value: number
  ) => {
    setRows((prev) =>
      prev.map((r, i) => {
        if (i !== rowIdx) return r;
        const existing = r.events[abbr] || {
          d_score: 0,
          consistency: 0,
          avg_score: 0,
        };
        return {
          ...r,
          events: { ...r.events, [abbr]: { ...existing, [field]: value } },
        };
      })
    );
  };

  const handleNameChange = (rowIdx: number, name: string) => {
    setRows((prev) => prev.map((r, i) => (i === rowIdx ? { ...r, name } : r)));
  };

  const handleSave = () => {
    const newAthletes = rows
      .map((r) => ({ id: r.id, name: r.name.trim(), events: r.events }))
      .filter((r) => r.name.length > 0);
    const validIds = new Set(newAthletes.map((a) => a.id));
    setAthletes(newAthletes);
    setSavedLineups((prev) => {
      const copy = { ...prev };
      Object.keys(copy).forEach((lid) => {
        Object.keys(copy[lid].lineup).forEach((eid) => {
          copy[lid].lineup[eid] = copy[lid].lineup[eid].map((id) =>
            id && !validIds.has(id) ? null : id
          );
        });
      });
      return copy;
    });
    setRosterOpen(false);
  };

  const onCsvChange = (file: File) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = String(ev.target?.result || "");
      const names = text
        .split("\n")
        .map((n) => n.trim())
        .filter(Boolean);
      setRows(
        names.map((name) => ({
          id: `athlete-${Date.now()}-${name}`,
          name,
          events: {},
        }))
      );
    };
    reader.readAsText(file);
  };

  return (
    <Dialog open onOpenChange={(open) => !open && setRosterOpen(false)}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Manage Roster</DialogTitle>
        </DialogHeader>
        <div className="flex justify-between items-center mb-2">
          <div className="flex gap-2 ml-auto">
            <Button
              id="load-csv-btn"
              variant="outline"
              size="sm"
              onClick={() => document.getElementById("csv-file-input")?.click()}
            >
              Load from CSV
            </Button>
            <input
              type="file"
              id="csv-file-input"
              className="hidden"
              accept=".csv"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onCsvChange(f);
                (e.target as HTMLInputElement).value = "";
              }}
            />
            <Button id="add-athlete-btn" size="sm" onClick={handleAddRow}>
              Add Athlete
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mb-2">
          CSV format: A single column with athlete names, no header row.
        </p>
        <div id="roster-editor" className="space-y-2 max-h-96 overflow-y-auto">
          {rows.map((row, idx) => (
            <div
              key={row.id}
              className="roster-editor-row p-2 border rounded-lg"
              data-id={row.id}
            >
              <div className="flex items-center gap-4 mb-2">
                <div className="flex-grow">
                  <Input
                    value={row.name}
                    onChange={(e) => handleNameChange(idx, e.target.value)}
                    placeholder="Athlete Name"
                    className="athlete-name-input"
                  />
                </div>
                <Button
                  variant="ghost"
                  className="remove-roster-athlete-btn text-red-600"
                  onClick={() => handleRemoveRow(row.id)}
                >
                  &times;
                </Button>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2 p-2 bg-secondary rounded-lg">
                {events.map((event) => {
                  const isChecked = Object.prototype.hasOwnProperty.call(
                    row.events,
                    event.abbr
                  );
                  const ev = row.events[event.abbr] || {
                    d_score: 0,
                    consistency: 0,
                    avg_score: 0,
                  };
                  return (
                    <div
                      key={event.id}
                      className={`flex flex-col items-center p-2 rounded-md ${
                        isChecked ? "bg-accent/10" : ""
                      }`}
                    >
                      <label className="text-sm font-medium">
                        {event.abbr}
                      </label>
                      <Checkbox
                        className="event-checkbox mb-1"
                        checked={isChecked}
                        onCheckedChange={(checked) =>
                          handleToggleEvent(idx, event.abbr, Boolean(checked))
                        }
                      />
                      <div
                        className={`event-details ${
                          isChecked ? "" : "hidden"
                        } space-y-1 text-xs w-full`}
                      >
                        <label className="inline-flex items-center justify-between w-full gap-2">
                          D:{" "}
                          <Input
                            type="number"
                            step={0.1}
                            value={ev.d_score}
                            onChange={(e) =>
                              handleEventField(
                                idx,
                                event.abbr,
                                "d_score",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="d-score-input w-20 text-right"
                          />
                        </label>
                        <label className="inline-flex items-center justify-between w-full gap-2">
                          C%:{" "}
                          <Input
                            type="number"
                            step={1}
                            value={ev.consistency}
                            onChange={(e) =>
                              handleEventField(
                                idx,
                                event.abbr,
                                "consistency",
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="consistency-input w-20 text-right"
                          />
                        </label>
                        <label className="inline-flex items-center justify-between w-full gap-2">
                          Avg:{" "}
                          <Input
                            type="number"
                            step={0.05}
                            value={ev.avg_score}
                            onChange={(e) =>
                              handleEventField(
                                idx,
                                event.abbr,
                                "avg_score",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="avg-score-input w-20 text-right"
                          />
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-end gap-4">
          <Button
            id="close-roster-modal-btn"
            variant="secondary"
            onClick={() => setRosterOpen(false)}
          >
            Close
          </Button>
          <Button id="save-roster-btn" onClick={handleSave}>
            Save & Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
