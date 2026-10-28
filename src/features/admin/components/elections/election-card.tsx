import Link from "next/link";
import type { ElectionListItem, ElectionListType } from "../../type";
import { ElectionStatusBadge, LiveIndicator } from "./election-status-badge";
import { ElectionActionsMenu, type ActionHandlers } from "./election-actions";
import { ParticipationBar } from "./participation-bar";
import {
  departmentNameTruncate,
  formatDateLong,
  formatTime12h,
  to12HourTime,
} from "@/lib/utils";

interface ElectionCardProps {
  election: ElectionListType;
  actionHandlers: ActionHandlers;
}

/**
 * Mirrors the information hierarchy of the desktop table row, just laid
 * out for narrow viewports: identity → status → schedule → participation
 * → positions/candidates → actions.
 */
export function ElectionCard({ election, actionHandlers }: ElectionCardProps) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link
            href={`/admin/elections/${election.id}`}
            className="font-medium text-neutral-900 hover:underline"
          >
            {election.title}
          </Link>
          <p className="mt-0.5 truncate text-xs text-neutral-500">
            {election.description}
          </p>
          <p className="mt-0.5 font-mono text-[11px] text-neutral-400">
            {election.code}
          </p>
        </div>
        <ElectionActionsMenu election={election} handlers={actionHandlers} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <ElectionStatusBadge status={election.status} />
        {election.status === "ACTIVE" && <LiveIndicator />}
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <div>
          <dt className="text-xs text-neutral-400">Type</dt>
          <dd className="text-neutral-700">
            {
              election.scopes[0].type
              // === "UNIVERSITY"
              //   ? "School-wide"
              //   : "Departmental"
            }{" "}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-neutral-400">Scope</dt>
          <dd className="text-neutral-700">
            {election.scopes[0].value == "all"
              ? "School-wide"
              : departmentNameTruncate(election.scopes[0].value)}
          </dd>
        </div>
        <div className="col-span-2">
          <dt className="text-xs text-neutral-400">Schedule</dt>
          <dd className="text-neutral-700">
            {formatDateLong(election.startsAt)} ·{" "}
            {to12HourTime(election.startsAt)} →{" "}
            {to12HourTime(election.startsAt)}
          </dd>
        </div>
        <div className="col-span-2">
          <dt className="mb-1 text-xs text-neutral-400">Participation</dt>
          {/* <ParticipationBar participation={election.participation} compact /> */}
        </div>
        <div>
          <dt className="text-xs text-neutral-400">Positions</dt>
          <dd className="text-neutral-700">{0}</dd>
        </div>
        <div>
          <dt className="text-xs text-neutral-400">Candidates</dt>
          <dd className="text-neutral-700">{0}</dd>
        </div>
      </dl>
    </div>
  );
}
