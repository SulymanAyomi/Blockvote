"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  MoreHorizontal,
  Pencil,
  Radio,
} from "lucide-react";
import type { ElectionDetail, ElectionDetailType } from "../../../type";
import { ElectionStatusBadge, LiveIndicator } from "../election-status-badge";
import { formatRelativeToNow, scheduleToDateTime } from "@/lib/utils";

interface ElectionDetailHeaderProps {
  election: ElectionDetailType["election"];
}

export function ElectionDetailHeader({ election }: ElectionDetailHeaderProps) {
  const [, forceTick] = useState(0);

  // Re-render every 60s so "Starts in…" / "Ends in…" countdowns stay fresh
  // without needing a full data refetch.
  useEffect(() => {
    const interval = setInterval(() => forceTick((t) => t + 1), 60_000);
    return () => clearInterval(interval);
  }, []);

  // const startIso = scheduleToDateTime(
  //   election.,
  //   election.schedule.startTime,
  // );
  // const endIso = scheduleToDateTime(
  //   election.schedule.endDate,
  //   election.schedule.endTime,
  // );

  let countdownLabel: string | null = null;
  if (election.status === "SCHEDULED") {
    countdownLabel = `Starts in ${formatRelativeToNow(election.startsAt).label}`;
  } else if (election.status === "ACTIVE") {
    countdownLabel = `Ends in ${formatRelativeToNow(election.endsAt).label}`;
  }

  return (
    <div className="w-full bg-primary-col text-white rounded-xl border-b border-slate-200 px-5 py-3.5 sm:px-8">
      <div className="max-w-350 space-y-3">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/admin/elections"
              className="inline-flex items-center gap-1.5 text-sm text-shadow-white transition hover:text-neutral-900"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </Link>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold tracking-tight text-white">
                  {election.title}
                </h1>
                <span className="font-mono text-xs text-neutral-400">
                  {election.code}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <ElectionStatusBadge status={election.status} />
                {election.status === "ACTIVE" && (
                  <LiveIndicator className="bg-green-200 text-green-900" />
                )}
                {countdownLabel && (
                  <span className="text-sm text-white/60">
                    {countdownLabel}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 gap-2">
            {(election.status === "DRAFT" ||
              election.status === "SCHEDULED") && (
              <Link
                href={`/admin/elections/${election.id}?edit=1`}
                className="h-fit inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
                Edit
              </Link>
            )}
            {election.status === "ACTIVE" && (
              <Link
                href={`/admin/elections/${election.id}?tab=overview`}
                className="h-fit inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white 
                px-3 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                <Radio className="h-4 w-4" aria-hidden="true" />
                Monitor
              </Link>
            )}
            {(election.status === "CLOSED" ||
              election.status === "ACTIVE" ||
              election.status === "ARCHIVED") && (
              <Link
                href={`/admin/elections/${election.id}?tab=results`}
                className="h-fit inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                <BarChart3 className="h-4 w-4" aria-hidden="true" />
                View Results
              </Link>
            )}
            {/* <button
              type="button"
              aria-label="More actions"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-300 bg-white text-neutral-500 transition hover:bg-neutral-50"
            >
              <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
            </button> */}
          </div>
        </div>
      </div>
    </div>
  );
}
