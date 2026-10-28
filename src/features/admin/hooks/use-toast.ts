"use client";

/**
 * PLACEHOLDER toast hook.
 *
 * Replace this with the project's existing toast/notification system
 * (e.g. `sonner`, a custom `useToast` from a UI kit, etc.) if one already
 * exists. The call signature below is intentionally minimal so swapping
 * the implementation requires no changes to call sites.
 */
export type ToastVariant = "default" | "success" | "destructive";

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
}

export function useToast() {
  function toast(options: ToastOptions) {
    // eslint-disable-next-line no-console
    console.log(`[toast:${options.variant ?? "default"}] ${options.title}`, options.description ?? "");
  }
  return { toast };
}
