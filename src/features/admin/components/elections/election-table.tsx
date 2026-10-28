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

interface ElectionTableProps {
  elections: ElectionListType[];
  actionHandlers: ActionHandlers;
}

const thClass =
  "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500";
const tdClass = "px-4 py-4 align-top text-sm text-neutral-700";

export function ElectionTable({
  elections,
  actionHandlers,
}: ElectionTableProps) {
  return (
    <div className="hidden overflow-hidden rounded-xl border border-neutral-200 bg-white lg:block">
      <table className="w-full border-collapse">
        <thead className="border-b border-neutral-200 bg-neutral-50">
          <tr>
            <th className={thClass}>Election</th>
            <th className={thClass}>Type</th>
            {/* <th className={thClass}>Scope</th> */}
            <th className={thClass}>Schedule</th>
            <th className={thClass}>Status</th>
            <th className={thClass}>Participation</th>
            <th className={thClass}>Candidates</th>
            <th className="px-4 py-3 text-right">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {elections.map((election) => (
            <tr key={election.id} className="transition hover:bg-neutral-50/60">
              <td className={tdClass}>
                <Link
                  href={`/admin/elections/${election.id}`}
                  className="font-medium text-neutral-900 hover:underline"
                >
                  {election.title}
                </Link>
                <p className="mt-0.5 line-clamp-1 text-xs text-neutral-500">
                  {election.description}
                </p>
                <p className="mt-0.5 font-mono text-[11px] text-neutral-400">
                  {election.code}
                </p>
              </td>
              <td className={tdClass}>
                <p className="text-xs font-normal">{election.scopes[0].type}</p>
              </td>
              {/* <td className={tdClass}>
                {election.scopes[0].value == "all"
                  ? "School-wide"
                  : departmentNameTruncate(election.scopes[0].value)}
              </td> */}
              <td className={tdClass}>
                <p className="whitespace-nowrap">
                  {formatDateLong(election.startsAt)}
                </p>
                <p className="text-[10px] text-neutral-500 whitespace-nowrap">
                  {to12HourTime(election.startsAt)} →{" "}
                  {to12HourTime(election.endsAt)}
                </p>
              </td>
              <td className={tdClass}>
                <div className="flex flex-col items-start gap-1.5">
                  <ElectionStatusBadge status={election.status} />
                  {election.status === "ACTIVE" && <LiveIndicator />}
                </div>
              </td>
              <td className={tdClass}>
                <ParticipationBar
                  eligibleVoters={election.eligibleVoters}
                  turnoutPercent={election.turnoutPercent}
                  votesCast={election.votesCast}
                />
              </td>
              <td className={tdClass}>
                <p>{election.positionCount} Positions</p>
                <p className="text-xs text-neutral-500">
                  {/* {election.candidateCount} Candidates */}
                </p>
              </td>
              <td className={`${tdClass} text-right`}>
                <ElectionActionsMenu
                  election={election}
                  handlers={actionHandlers}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
