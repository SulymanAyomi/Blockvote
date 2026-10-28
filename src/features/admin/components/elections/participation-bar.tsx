import { formatNumber } from "@/lib/utils";
import type { ParticipationStats } from "../../type";

interface ParticipationBarProps {
  eligibleVoters: number;
  votesCast: number;
  turnoutPercent: number;
  compact?: boolean;
}

export function ParticipationBar({
  eligibleVoters,
  votesCast,
  turnoutPercent,
  compact = false,
}: ParticipationBarProps) {
  return (
    <div className={compact ? "w-full min-w-36" : "w-full min-w-40"}>
      <div className="flex items-baseline justify-between text-xs">
        <span className="font-medium text-neutral-700">
          {formatNumber(votesCast)} / {formatNumber(eligibleVoters)}
        </span>
        <span className="text-neutral-500">{turnoutPercent.toFixed(1)}%</span>
      </div>
      <div
        className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100"
        role="progressbar"
        aria-valuenow={Math.round(turnoutPercent)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Voter turnout"
      >
        <div
          className="h-full rounded-full bg-emerald-500 transition-all"
          style={{ width: `${Math.min(turnoutPercent, 100)}%` }}
        />
      </div>
    </div>
  );
}
