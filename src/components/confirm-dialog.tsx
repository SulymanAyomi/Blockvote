"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  destructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Generic confirmation dialog used for any destructive/irreversible action
 * (cancel election, delete draft, archive, etc.).
 *
 * NOTE: If the project already has a Dialog/AlertDialog primitive (e.g.
 * from shadcn/ui or Radix), prefer swapping this implementation to reuse
 * that instead — this is a dependency-free fallback.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  destructive = true,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    confirmRef.current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-neutral-900/40" onClick={onCancel} aria-hidden="true" />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        className="relative w-full max-w-sm rounded-xl border border-neutral-200 bg-white p-5 shadow-lg"
      >
        <div className="flex gap-3">
          <div
            className={cn(
              "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full",
              destructive ? "bg-red-100" : "bg-neutral-100"
            )}
          >
            <AlertTriangle
              className={cn("h-5 w-5", destructive ? "text-red-600" : "text-neutral-600")}
              aria-hidden="true"
            />
          </div>
          <div>
            <h2 id="confirm-dialog-title" className="text-sm font-semibold text-neutral-900">
              {title}
            </h2>
            <p id="confirm-dialog-description" className="mt-1 text-sm text-neutral-600">
              {description}
            </p>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-neutral-300 bg-white px-3.5 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={cn(
              "rounded-lg px-3.5 py-2 text-sm font-medium text-white transition disabled:opacity-60",
              destructive ? "bg-red-600 hover:bg-red-700" : "bg-neutral-900 hover:bg-neutral-800"
            )}
          >
            {isLoading ? "Please wait…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
