import type { PersistedData } from "@/lib/types/index.ts";
import { STORAGE_KEY } from "@/lib/constants/index.ts";

export function saveDataToLocalStorage(data: PersistedData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function loadDataFromLocalStorage(): PersistedData | null {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return null;
  try {
    return JSON.parse(saved) as PersistedData;
  } catch {
    return null;
  }
}
