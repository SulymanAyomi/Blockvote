import type { ElectionDetailType } from "../../../type";
import { ParticipationBar } from "../participation-bar";
import { formatDateLong, formatTime12h, to12HourTime } from "@/lib/utils";

export function OverviewTab({ data }: { data: ElectionDetailType }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-neutral-900">Description</h3>
        <p className="mt-1 text-sm text-neutral-600">
          {data.election.description}
        </p>
      </div>

      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-neutral-400">
            Election Type
          </dt>
          <dd className="mt-1 text-sm text-neutral-900">
            {data.election.scopes[0].type}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-neutral-400">
            Scope
          </dt>
          <dd className="mt-1 text-sm text-neutral-900">
            {data.election.scopes[0].value == "all"
              ? "School-wide"
              : data.election.scopes[0].value}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-neutral-400">
            Start
          </dt>
          <dd className="mt-1 text-sm text-neutral-900">
            {formatDateLong(data.election.startsAt)} at{" "}
            {to12HourTime(data.election.startsAt)}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-neutral-400">
            End
          </dt>
          <dd className="mt-1 text-sm text-neutral-900">
            {formatDateLong(data.election.endsAt)} at{" "}
            {to12HourTime(data.election.endsAt)}
          </dd>
        </div>
      </dl>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-neutral-900">
          Participation
        </h3>
        <div className="max-w-sm rounded-lg border border-neutral-200 p-4">
          <ParticipationBar
            eligibleVoters={data.eligibleVoterCount}
            turnoutPercent={data.turnoutPercent}
            votesCast={data.votesCast}
          />
        </div>
      </div>
    </div>
  );
}
