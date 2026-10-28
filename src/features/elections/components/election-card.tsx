import { Card } from "@/components/ui/card";
import { cx } from "class-variance-authority";
import {
  CheckCircle2,
  Vote,
  BarChart3,
  Building2,
  Calendar,
  ListChecks,
  Users,
  Ban,
} from "lucide-react";
import { DashboardElectionType } from "@/features/elections/type";
import { Btn } from "@/components/btn";
import { StatusBadge, Tag } from "@/components/status-badge";
import { closesIn, fmtTime, startsIn, fmtRange } from "@/lib/helpers";

interface ElectionCardProps {
  election: DashboardElectionType;
  cta?: string;
}
export function ElectionCard({ election, cta = "view" }: ElectionCardProps) {
  const voted = election.voted;
  const canVote = election.eligible && election.status == "ACTIVE";
  const hid = "ec-" + election.id;
  return (
    <Card
      role="group"
      aria-labelledby={hid}
      className={cx(
        "rounded-2xl p-5",
        canVote && "border-l-4 border-l-blue-700",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 id={hid} className="font-serif text-xl font-bold text-slate-900">
          {election.title}
        </h3>
        <div className="flex flex-wrap gap-2">
          <StatusBadge status={election.status} />
          {!election.eligible && (
            <Tag kind="closed" icon={Ban}>
              Not Eligible
            </Tag>
          )}
        </div>
      </div>
      <div className="mt-3">
        <Meta election={election} />
      </div>
      {election.status === "ACTIVE" && (
        <p className="mt-2 text-sm font-semibold text-green-800">
          {closesIn(new Date(election.endsAt))} at{" "}
          {fmtTime(new Date(election.endsAt))}
        </p>
      )}
      {election.status === "SCHEDULED" && (
        <p className="mt-2 text-sm font-semibold text-amber-900">
          {startsIn(new Date(election.startsAt))}
        </p>
      )}
      <p className="mt-2 max-w-prose text-slate-600">{election.description}</p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {voted && (
          <span className="flex h-11 items-center gap-2 font-bold text-green-800">
            <CheckCircle2 size={22} aria-hidden="true" />
            Vote Submitted
          </span>
        )}
        {canVote &&
          (cta === "vote" ? (
            <Btn to={`/elections/${election.id}/verify`} size="lg" icon={Vote}>
              Vote Now
            </Btn>
          ) : (
            <Btn to={`/elections/${election.id}`}>View Election</Btn>
          ))}
        {!canVote && !voted && election.status === "SCHEDULED" && (
          <Btn
            to={`/elections/${election.id}`}
            variant={cta === "vote" ? "secondary" : "primary"}
          >
            {cta === "vote" ? "View Details" : "View Election"}
          </Btn>
        )}
        {(voted ||
          (election.status === "COMPLETED" && !voted) ||
          !election.eligible) && (
          <Btn to={`/elections/${election.id}`} variant="secondary">
            View Election
          </Btn>
        )}

        {election.status === "COMPLETED" && (
          <Btn to={`/elections/${election.id}/results`} icon={BarChart3}>
            View Results
          </Btn>
        )}
        {/* {election.status === "COMPLETED" && election.resultsPublished && (
          <Btn to={`/elections/${election.id}/results`} icon={BarChart3}>
            View Results
          </Btn>
        )} */}
      </div>
    </Card>
  );
}

const Meta = ({ election }: { election: DashboardElectionType }) => (
  <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
    <li className="flex items-center gap-1.5">
      <Building2 size={16} aria-hidden="true" className="text-slate-500" />
      {election.scopes[0].value}
    </li>
    <li className="flex items-center gap-1.5">
      <Calendar size={16} aria-hidden="true" className="text-slate-500" />
      {fmtRange(new Date(election.startsAt), new Date(election.endsAt))}
    </li>
    <li className="flex items-center gap-1.5">
      <ListChecks size={16} aria-hidden="true" className="text-slate-500" />
      {election.positionCount} positions
    </li>
    <li className="flex items-center gap-1.5">
      <Users size={16} aria-hidden="true" className="text-slate-500" />
      {election.candidateCount} candidates
    </li>
  </ul>
);
