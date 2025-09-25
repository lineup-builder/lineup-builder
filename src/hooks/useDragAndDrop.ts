import { useRef } from "react";
import type { Lineup } from "@/lib/types/index.ts";

export type DragStartInfo =
  | { source: "pool" }
  | { source: "slot"; eventId: string; slotIndex: number };

export function useDragAndDrop() {
  const draggedRef = useRef<HTMLElement | null>(null);
  const dragStartInfoRef = useRef<DragStartInfo | null>(null);

  function onDragStart(e: React.DragEvent<HTMLElement>) {
    const target = e.currentTarget as HTMLElement;
    const fromDropZone = target.closest(".drop-zone") as HTMLElement | null;
    if (!target.id) return;
    draggedRef.current = target;
    e.dataTransfer.setData("text/plain", target.id);
    e.dataTransfer.effectAllowed = "move";
    setTimeout(() => target.classList.add("dragging"), 0);
    if (fromDropZone) {
      dragStartInfoRef.current = {
        source: "slot",
        eventId: fromDropZone.dataset.eventId!,
        slotIndex: parseInt(fromDropZone.dataset.slotIndex!),
      };
    } else {
      dragStartInfoRef.current = { source: "pool" };
    }
  }

  function onDragEnd() {
    const t = draggedRef.current;
    if (t) t.classList.remove("dragging");
    draggedRef.current = null;
    dragStartInfoRef.current = null;
  }

  function computeDrop(
    current: Lineup,
    targetEventId: string,
    targetSlotIndex: number,
    draggedAthleteId: string
  ) {
    const start = dragStartInfoRef.current;
    if (
      start &&
      start.source === "slot" &&
      start.eventId === targetEventId &&
      start.slotIndex === targetSlotIndex
    )
      return current;
    const temp: Lineup = JSON.parse(JSON.stringify(current));
    const athleteInTargetSlot = temp[targetEventId][targetSlotIndex];
    temp[targetEventId][targetSlotIndex] = draggedAthleteId;
    if (start && start.source === "slot") {
      temp[start.eventId][start.slotIndex] = athleteInTargetSlot;
    }
    return temp;
  }

  return { draggedRef, dragStartInfoRef, onDragStart, onDragEnd, computeDrop };
}
