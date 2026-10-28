import {
  Archive,
  CalendarClock,
  CheckCircle2,
  CircleDot,
  FileEdit,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ElectionStatus } from "@/generated/enums";

const STATUS_CONFIG: Record<
  ElectionStatus,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    className: string;
  }
> = {
  DRAFT: {
    label: "Draft",
    icon: FileEdit,
    className: "bg-slate-100 text-slate-700 border-slate-200",
  },
  SCHEDULED: {
    label: "Scheduled",
    icon: CalendarClock,
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  ACTIVE: {
    label: "Active",
    icon: CircleDot,
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  COMPLETED: {
    label: "Completed",
    icon: CheckCircle2,
    className: "bg-violet-50 text-violet-700 border-violet-200",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: XCircle,
    className: "bg-red-50 text-red-700 border-red-200",
  },
  CLOSED: {
    label: "Closed",
    icon: XCircle,
    className: "bg-red-50 text-red-700 border-red-200",
  },
  ARCHIVED: {
    label: "Archived",
    icon: Archive,
    className: "bg-neutral-100 text-neutral-600 border-neutral-200",
  },
};

interface ElectionStatusBadgeProps {
  status: ElectionStatus;
  className?: string;
}

/**
 * Status is always communicated via icon + label text, never color alone,
 * so the badge remains legible for colorblind users and in print/grayscale.
 */
export function ElectionStatusBadge({
  status,
  className,
}: ElectionStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        config.className,
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {config.label}
    </span>
  );
}

/**
 * A visually prominent "LIVE" indicator for active elections, used
 * alongside (not instead of) the status badge above.
 */
export function LiveIndicator({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white",
        className,
      )}
      role="status"
      aria-label="Election is live"
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/70" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
      </span>
      LIVE
    </span>
  );
}
