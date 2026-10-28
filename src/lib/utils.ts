import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const departmentNameTruncate = (name: string) => {
  return name.replace(/^(Department of |faculty of )\s*/i, "");
};

export function formatDateLong(isoDate: string | Date): string {
  return new Date(isoDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatTime12h(time24: string | Date): string {
  const newT = time24.toString()
  const [h, m] = newT.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

/** Human-readable countdown/elapsed label, e.g. "Ends in 4h 32m" / "Starts in 3 days". */
export function formatRelativeToNow(targetIso: string): { label: string; isPast: boolean } {
  const diffMs = new Date(targetIso).getTime() - Date.now();
  const isPast = diffMs < 0;
  const abs = Math.abs(diffMs);

  const days = Math.floor(abs / (24 * 60 * 60 * 1000));
  const hours = Math.floor((abs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((abs % (60 * 60 * 1000)) / (60 * 1000));

  let label: string;
  if (days >= 1) {
    label = `${days} day${days === 1 ? "" : "s"}`;
  } else if (hours >= 1) {
    label = `${hours}h ${minutes}m`;
  } else {
    label = `${Math.max(minutes, 1)}m`;
  }
  return { label, isPast };
}

export function scheduleToDateTime(dateIso: string, time24: string): string {
  return new Date(`${dateIso}T${time24}:00`).toISOString();
}

export function to12HourTime(d: Date | string): string {
  const date = new Date(d)
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours >= 12 ? "PM" : "AM";

  hours = hours % 12 || 12; // 0 -> 12, 13 -> 1, etc.

  const paddedMinutes = minutes.toString().padStart(2, "0");
  return `${hours}:${paddedMinutes} ${period}`;
}