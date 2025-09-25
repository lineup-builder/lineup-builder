export type ToastType = "error" | "success" | "info";

export type Toast = { text: string; type: ToastType } | null;

export function makeMessage(text: string, type: ToastType = "info"): Toast {
  return { text, type };
}
