"use client";

import { ImagePlus, Loader2, Upload, X } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

const DEFAULT_ACCEPT = "image/jpeg,image/png,image/webp";

export interface ImageUploadFieldProps {
  id: string;
  value: File | string | undefined;
  onChange: (file: File | undefined) => void;
  accept?: string;
  maxSizeMb?: number;
  disabled?: boolean;
  /** Smaller square variant used inside the poll options list. */
  compact?: boolean;
  invalid?: boolean;
  placeholderLabel?: string;
}

export function ImageUploadField({
  id,
  value,
  onChange,
  accept = DEFAULT_ACCEPT,
  maxSizeMb = 5,
  disabled,
  compact,
  invalid,
  placeholderLabel = "Upload image",
}: ImageUploadFieldProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState<string | undefined>(
    typeof value === "string" ? value : undefined,
  );

  React.useEffect(() => {
    if (value instanceof File) {
      const url = URL.createObjectURL(value);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(typeof value === "string" ? value : undefined);
    return undefined;
  }, [value]);

  const handleFiles = React.useCallback(
    (files: FileList | null) => {
      const file = files?.[0];
      if (!file) return;
      if (file.size > maxSizeMb * 1024 * 1024) {
        onChange(file); // let Zod surface the size error via FormMessage
        return;
      }
      onChange(file);
    },
    [maxSizeMb, onChange],
  );

  return (
    <div
      className={cn(
        "group relative flex items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-input bg-muted/30 transition-colors",
        compact ? "h-16 w-16 shrink-0 rounded-md" : "h-40 w-full",
        isDragging && "border-primary bg-primary/5",
        invalid && "border-destructive",
        disabled && "pointer-events-none opacity-60",
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
    >
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        disabled={disabled}
        className="sr-only"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {previewUrl ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt="" className="h-full w-full object-cover" />
          <button
            type="button"
            aria-label="Remove image"
            onClick={() => {
              onChange(undefined);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="absolute right-1 top-1 rounded-full bg-background/90 p-1 text-foreground shadow-sm opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </>
      ) : (
        <label
          htmlFor={id}
          className={cn(
            "flex h-full w-full cursor-pointer flex-col items-center justify-center gap-1.5 text-muted-foreground hover:text-foreground",
            compact && "gap-0.5",
          )}
        >
          {compact ? (
            <ImagePlus className="h-5 w-5" aria-hidden="true" />
          ) : (
            <>
              <Upload className="h-5 w-5" aria-hidden="true" />
              <span className="text-xs font-medium">{placeholderLabel}</span>
              <span className="text-[11px] text-muted-foreground/80">
                JPG, PNG or WEBP — up to {maxSizeMb}MB
              </span>
            </>
          )}
        </label>
      )}
    </div>
  );
}

export function ImageUploadSkeleton({ compact }: { compact?: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-lg border border-input bg-muted/30",
        compact ? "h-16 w-16" : "h-40 w-full",
      )}
    >
      <Loader2
        className="h-4 w-4 animate-spin text-muted-foreground"
        aria-hidden="true"
      />
    </div>
  );
}
