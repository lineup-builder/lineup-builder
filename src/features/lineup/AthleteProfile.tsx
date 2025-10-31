import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { Label } from "@/components/ui/label.tsx";

export const AthleteProfile = () => {
  const {
    profileOpen,
    setProfileOpen,
    editingAthleteId,
    athletes,
    events,
    setAthletes,
    setSavedLineups,
  } = useAppStore();
  const athlete = editingAthleteId
    ? athletes.find((a) => a.id === editingAthleteId)
    : undefined;

  const [name, setName] = useState<string>(athlete?.name ?? "");
  const [selectedEvents, setSelectedEvents] = useState<
    Record<string, { d_score: number; consistency: number; avg_score: number }>
  >(athlete?.events ? { ...athlete.events } : {});

  useEffect(() => {
    // Reset local state when switching athletes
    if (!athlete) return;
    setName(athlete.name);
    setSelectedEvents({ ...athlete.events });
  }, [editingAthleteId, athlete]);

  if (!profileOpen || !editingAthleteId || !athlete) return null;
  return (
    <Dialog open onOpenChange={(open) => !open && setProfileOpen(false)}>
      <DialogContent className="sm:max-w-3xl md:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Edit Athlete Profile</DialogTitle>
        </DialogHeader>
        <div id="profile-editor" className="space-y-4">
          <div>
            <Label
              htmlFor="profile-name-input"
              className="font-bold text-gray-700"
            >
              Athlete Name
            </Label>
            <Input
              id="profile-name-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1"
            />
          </div>
          <div className="mt-4 p-2 bg-secondary rounded-lg">
            <Label
              htmlFor="profile-events-scores-input"
              className="font-bold text-gray-700"
            >
              Events & Scores
            </Label>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-2">
              {events.map((event) => {
                const isChecked = !!selectedEvents[event.abbr];
                const ed = selectedEvents[event.abbr] || {
                  d_score: 0,
                  consistency: 0,
                  avg_score: 0,
                };
                return (
                  <div
                    key={event.id}
                    data-event-id={event.id}
                    className={`flex flex-col items-center p-2 rounded-md ${
                      isChecked ? "bg-accent/10" : ""
                    }`}
                  >
                    <Label
                      htmlFor={`profile-event-checkbox-${event.id}`}
                      className="text-sm font-medium"
                    >
                      {event.abbr}
                    </Label>
                    <Checkbox
                      className="profile-event-checkbox mb-1"
                      checked={isChecked}
                      onCheckedChange={(checked) => {
                        const nextChecked = !!checked;
                        setSelectedEvents((prev) => {
                          if (nextChecked) {
                            return {
                              ...prev,
                              [event.abbr]: prev[event.abbr] || {
                                d_score: 0,
                                consistency: 0,
                                avg_score: 0,
                              },
                            };
                          }
                          const copy = { ...prev };
                          delete (copy as Record<string, unknown>)[event.abbr];
                          return copy as Record<
                            string,
                            {
                              d_score: number;
                              consistency: number;
                              avg_score: number;
                            }
                          >;
                        });
                      }}
                    />
                    {isChecked && (
                      <div className="profile-event-details space-y-1 text-xs w-full">
                        <Label
                          htmlFor={`profile-d-score-input-${event.id}`}
                          className="w-full justify-between"
                        >
                          D:
                          <Input
                            type="number"
                            step={0.1}
                            value={ed.d_score}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value);
                              setSelectedEvents((prev) => ({
                                ...prev,
                                [event.abbr]: {
                                  ...prev[event.abbr],
                                  d_score: isNaN(value) ? 0 : value,
                                },
                              }));
                            }}
                            className="profile-d-score-input w-20 text-right bg-white"
                          />
                        </Label>
                        <Label
                          htmlFor={`profile-c-percent-input-${event.id}`}
                          className="w-full justify-between"
                        >
                          C%:{" "}
                          <Input
                            type="number"
                            step={1}
                            value={ed.consistency}
                            onChange={(e) => {
                              const value = parseInt(e.target.value);
                              setSelectedEvents((prev) => ({
                                ...prev,
                                [event.abbr]: {
                                  ...prev[event.abbr],
                                  consistency: isNaN(value) ? 0 : value,
                                },
                              }));
                            }}
                            className="profile-consistency-input w-20 text-right bg-white"
                          />
                        </Label>
                        <Label
                          htmlFor={`profile-avg-score-input-${event.id}`}
                          className="w-full justify-between"
                        >
                          Avg:{" "}
                          <Input
                            type="number"
                            step={0.05}
                            value={ed.avg_score}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value);
                              setSelectedEvents((prev) => ({
                                ...prev,
                                [event.abbr]: {
                                  ...prev[event.abbr],
                                  avg_score: isNaN(value) ? 0 : value,
                                },
                              }));
                            }}
                            className="profile-avg-score-input w-20 text-right bg-white"
                          />
                        </Label>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-4">
          <Button
            id="cancel-profile-btn"
            variant="secondary"
            onClick={() => setProfileOpen(false)}
          >
            Cancel
          </Button>
          <Button
            id="save-profile-btn"
            onClick={() => {
              const newName = name.trim();
              if (!newName) {
                alert("Athlete name cannot be empty.");
                return;
              }
              const selected = { ...selectedEvents };
              setAthletes((prev) =>
                prev.map((a) =>
                  a.id === editingAthleteId
                    ? { ...a, name: newName, events: selected }
                    : a
                )
              );
              setSavedLineups((prev) => {
                const copy = { ...prev };
                Object.keys(copy).forEach((lid) => {
                  Object.keys(copy[lid].lineup).forEach((eid) => {
                    const cfg = events.find((e) => e.id === eid)!;
                    copy[lid].lineup[eid] = copy[lid].lineup[eid].map((id) => {
                      if (
                        id === editingAthleteId &&
                        !Object.prototype.hasOwnProperty.call(
                          selected,
                          cfg.abbr
                        )
                      )
                        return null;
                      return id;
                    });
                  });
                });
                return copy;
              });
              setProfileOpen(false);
            }}
          >
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
