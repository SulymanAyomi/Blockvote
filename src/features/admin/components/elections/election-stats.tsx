"use client";

import { Archive, CalendarClock, CircleDot, ListChecks } from "lucide-react";
import { useElectionStats } from "@/features/admin/hooks/elections/use-election-stats";
import { StatsSkeleton } from "./election-skeletons";
import { cn } from "@/lib/utils";

const CARD_CONFIG = [
  {
    key: "total",
    label: "Total Elections",
    icon: ListChecks,
    accent: "text-neutral-700 bg-neutral-100",
  },
  {
    key: "active",
    label: "Active Elections",
    icon: CircleDot,
    accent: "text-emerald-700 bg-emerald-50",
  },
  {
    key: "upcoming",
    label: "Upcoming Elections",
    icon: CalendarClock,
    accent: "text-blue-700 bg-blue-50",
  },
  {
    key: "completed",
    label: "Completed Elections",
    icon: Archive,
    accent: "text-violet-700 bg-violet-50",
  },
] as const;

export function ElectionStatsCards() {
  const { data, isLoading, isError, refetch } = useElectionStats();

  if (isLoading) return <StatsSkeleton />;

  if (isError || !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Couldn&apos;t load election statistics.{" "}
        <button
          type="button"
          onClick={() => refetch()}
          className="font-medium underline underline-offset-2"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {CARD_CONFIG.map(({ key, label, icon: Icon, accent }) => (
        <div
          key={key}
          className="rounded-xl border border-neutral-200 bg-white p-4"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-neutral-500">{label}</p>
            <span
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg",
                accent,
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900">
            {data[key]}
          </p>
        </div>
      ))}
    </div>
  );
}
