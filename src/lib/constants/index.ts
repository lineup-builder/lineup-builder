import type { Athlete, EventConfig } from "@/lib/types/index.ts";

export const STORAGE_KEY = "gymnasticsLineupDataV2";
export const MAX_ATHLETES_IN_LINEUP = 12;

export const DEFAULT_EVENTS: EventConfig[] = [
  { id: "event-1", name: "Floor Exercise", abbr: "FX" },
  { id: "event-2", name: "Pommel Horse", abbr: "PH" },
  { id: "event-3", name: "Still Rings", abbr: "SR" },
  { id: "event-4", name: "Vault", abbr: "VT" },
  { id: "event-5", name: "Parallel Bars", abbr: "PB" },
  { id: "event-6", name: "Horizontal Bar", abbr: "HB" },
];

export const YOUR_ROSTER_NAMES: string[] = [
  "Boone Washburn",
  "Caden Clinton",
  "Chase Davenport-Mills",
  "Danila Leykin",
  "David Rauch",
  "Dexter Roettker",
  "Eli Hoban",
  "Euan Sullivan",
  "Garrett Schooley",
  "Hasan Aydogdu",
  "Jaren Gibble",
  "Kai Uemura",
  "Kiran Mandava",
  "Landon Wu",
  "Max O'Claer",
  "Maxwell Odden",
  "Nathan Grigsby",
  "Preston Ngai",
  "Solen Chiodi",
  "Tristan Flores",
  "Troy Nako",
  "Vahe Petrosyan",
  "Wade Nelson",
  "Xander Hong",
];

export const DEFAULT_ATHLETES: Athlete[] = YOUR_ROSTER_NAMES.map(
  (name, index) => ({ id: `athlete-default-${index}`, name, events: {} })
);
