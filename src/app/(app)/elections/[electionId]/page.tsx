"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Ban,
  BarChart3,
  CheckCircle2,
  ChevronLeft,
  HelpCircle,
  Vote,
  Lock,
} from "lucide-react";
import { CandidateProfile } from "@/components/candidate-profile";
import { Btn } from "@/components/btn";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/features/error/error-state";
import { Skel, SkelCards } from "@/components/skeleton-cards";
import { StatusBadge, Tag } from "@/components/status-badge";
import { Card } from "@/components/ui/card";
import { Av } from "@/components/user-avatar";
import { H1, fmtDateTime, H2, H3, startsIn } from "@/lib/helpers";
import { cx } from "class-variance-authority";
import { Separator } from "@/components/ui/separator";
import { useGetElection } from "@/features/elections/api/use-get-election";
import { useElectionId } from "@/features/elections/hooks/use-get-election-id";
import { candidateType, ErrorPayload } from "@/features/elections/type";

const SingleVotePage = () => {
  const electionId = useElectionId();
  const { data, isLoading, error, refetch } = useGetElection({ electionId });
  const [prof, setProf] = useState<candidateType | null>(null);

  if (isLoading)
    return (
      <div className="space-y-4">
        <Card className="rounded-2xl p-6">
          <Skel className="h-8 w-3/4" />
          <Skel className="mt-4 h-4 w-1/2" />
          <Skel className="mt-5 h-16 w-full" />
        </Card>
        <SkelCards n={2} />
      </div>
    );

  if (error || !data) {
    return <ErrorState error={error} retry={() => refetch()} id={electionId} />;
  }
  const election = data.data.election;
  const positions = data.data.positions;
  const voted = election.voted;
  const canVote = election.eligible && election.status == "ACTIVE";
  const full = "w-full";
  const scope = election.scopes ? election.scopes[0].value : "University-wide";
  return (
    <div>
      <div className="mb-3">
        <Btn variant="ghost" to="/elections" icon={ChevronLeft}>
          Back
        </Btn>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card role="group" className="rounded-2xl p-6" aria-labelledby="eh">
            <div className="mb-2 flex flex-wrap gap-2">
              <StatusBadge status={election.status!} />
              {!election.eligible && (
                <Tag kind="closed" icon={Ban}>
                  Not Eligible
                </Tag>
              )}
            </div>
            <h1 id="eh" className={H1}>
              {election.title}
            </h1>
            <p className="mt-3 max-w-prose text-slate-700">
              {election.description}
            </p>
            <Separator className="my-5" />
            <dl className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {[
                ["Election scope", scope],
                ["Starts", fmtDateTime(new Date(election.startsAt!))],
                ["Ends", fmtDateTime(new Date(election.endsAt!))],
                ["Positions", positions.length],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-sm text-slate-600">{k}</dt>
                  <dd className="font-semibold text-slate-900">{v}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <section aria-labelledby="pos">
            <h2 id="pos" className={cx(H2, "mb-3")}>
              Positions
            </h2>
            {!positions ? (
              <EmptyState icon={Ban}>
                Positions and candidates are shown to eligible students only.
              </EmptyState>
            ) : (
              <div className="space-y-4">
                {positions.map((p) => {
                  const rest = p.candidates.slice(4);
                  const row = rest.map((c) => (
                    <li className="flex items-center gap-3 py-2.5" key={c.id}>
                      {c.imageUrl ? (
                        <img
                          src={c.imageUrl}
                          className="size-10 rounded-full"
                        />
                      ) : (
                        <Av name={c.voter.fullName} size="sm" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-slate-900">
                          {c.voter.fullName}
                        </div>
                        <div className="text-sm text-slate-600">
                          {departmentName(c.voter.department?.name!)},{" "}
                          {c.voter.level}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-10 px-3 font-semibold text-blue-800 underline hover:bg-blue-50"
                        onClick={() => setProf(c)}
                        aria-label={`View profile: ${c.voter.fullName}`}
                      >
                        View Profile
                      </Button>
                    </li>
                  ));
                  return (
                    <Card
                      key={p.id}
                      role="group"
                      aria-labelledby={"p-" + p.id}
                      className="rounded-2xl p-5"
                    >
                      <h3
                        id={"p-" + p.id}
                        className="font-serif text-lg font-bold text-slate-900"
                      >
                        {p.position.name}
                      </h3>
                      <p className="mb-2 text-sm text-slate-600">
                        {p.description}
                      </p>
                      <ul
                        className="divide-y divide-slate-200 border-t border-slate-200"
                        aria-label={`Candidates for ${p.position.name}`}
                      >
                        {p.candidates.slice(0, 4).map((c) => (
                          <li
                            className="flex items-center gap-3 py-2.5"
                            key={c.id}
                          >
                            {c.imageUrl ? (
                              <img
                                src={c.imageUrl}
                                className="size-10 rounded-full"
                              />
                            ) : (
                              <Av name={c.voter.fullName} size="sm" />
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="font-semibold text-slate-900">
                                {c.voter.fullName}
                              </div>
                              <div className="text-sm text-slate-600">
                                {departmentName(c.voter.department?.name!)},{" "}
                                {c.voter.level}
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              className="h-10 px-3 font-semibold text-blue-800 underline hover:bg-blue-50"
                              onClick={() => setProf(c)}
                              aria-label={`View profile: ${c.voter.fullName}`}
                            >
                              View Profile
                            </Button>
                          </li>
                        ))}
                      </ul>
                      {rest.length > 0 && (
                        <details className="border-t border-slate-200">
                          <summary className="flex h-11 cursor-pointer items-center font-semibold text-blue-800">
                            Show {rest.length} more candidate
                            {rest.length > 1 ? "s" : ""}
                          </summary>
                          <ul className="divide-y divide-slate-200">{row}</ul>
                        </details>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        <aside
          aria-label="Your voting status"
          className="order-first space-y-4 lg:sticky lg:top-24 lg:order-0 lg:self-start"
        >
          <Card className={cx("rounded-2xl p-5", voted && "border-green-300")}>
            <h2 className={cx(H3, "mb-2")}>Your voting status</h2>
            {voted && election.submittedAt && (
              <>
                <p className="flex items-start gap-2 font-bold text-green-800">
                  <CheckCircle2
                    size={22}
                    aria-hidden="true"
                    className="shrink-0"
                  />
                  Your vote has been successfully submitted.
                </p>
                <p className="mb-4 mt-2 text-sm text-slate-600">
                  Submitted {fmtDateTime(new Date(election.submittedAt))}. Your
                  candidate selections are never shown.
                </p>
                <div className="space-y-2">
                  <Btn
                    variant="secondary"
                    to={`/elections/${electionId}/confirmation`}
                    className={full}
                  >
                    View Confirmation
                  </Btn>
                  {election.resultsPublished && (
                    <Btn
                      to={`/elections/${electionId}/results`}
                      icon={BarChart3}
                      className={full}
                    >
                      View Results
                    </Btn>
                  )}
                </div>
              </>
            )}
            {!voted && election.status === "ACTIVE" && (
              <>
                <p className="text-slate-900">
                  You are eligible to participate in this election.
                </p>
                <p className="mb-4 mt-1.5 text-sm text-slate-600">
                  Voting closes {fmtDateTime(new Date(election.endsAt!))}.
                </p>
                <Btn
                  to={`/elections/${electionId}/verify`}
                  size="lg"
                  icon={Vote}
                  className={full}
                >
                  Start Voting
                </Btn>
              </>
            )}
            {election.status === "SCHEDULED" && election.eligible && (
              <>
                <p className="text-slate-900">
                  You are eligible to participate in this election.
                </p>
                <p className="mb-4 mt-1.5 text-sm font-semibold text-amber-900">
                  Voting opens {fmtDateTime(new Date(election.startsAt!))} (
                  {startsIn(new Date(election.startsAt!)).toLowerCase()}).
                </p>
                <Btn
                  aria-disabled="true"
                  className={cx(full, "cursor-not-allowed opacity-60")}
                  onClick={(ev) => ev.preventDefault()}
                >
                  Voting Not Open Yet
                </Btn>
              </>
            )}
            {election.status === "CLOSED" && (
              <>
                <p className="text-slate-900">
                  Voting has closed for this election.
                </p>
                {election.resultsPublished ? (
                  <div className="mt-4">
                    <Btn
                      to={`/elections/${electionId}/results`}
                      icon={BarChart3}
                      className={full}
                    >
                      View Results
                    </Btn>
                  </div>
                ) : (
                  <p className="mt-1.5 text-sm text-slate-600">
                    Results will be published{" "}
                    {election.publishAt
                      ? fmtDateTime(new Date(election.publishAt))
                      : "soon"}
                    .
                  </p>
                )}
              </>
            )}
            {!election.eligible && (
              <>
                <p className="font-semibold text-slate-900">
                  You are not eligible to vote in this election.
                </p>
                <p className="mb-4 mt-1.5 text-sm text-slate-600">
                  Your enrollment record doesn't match this election's voter
                  list.
                </p>
                <Btn
                  variant="secondary"
                  to="/help"
                  icon={HelpCircle}
                  className={full}
                >
                  Get Help
                </Btn>
              </>
            )}
          </Card>
          <Card className="rounded-2xl border-blue-200 bg-blue-50 p-5">
            <div className="mb-1.5 flex items-center gap-2">
              <Lock size={20} aria-hidden="true" className="text-blue-800" />
              <h2 className={H3}>Your ballot is private</h2>
            </div>
            <p className="mb-3 text-sm text-slate-800">
              Your eligibility is verified before voting, but your identity is
              not displayed alongside your ballot choices.
            </p>
            <Btn variant="secondary" to="/how" className={full}>
              How voting works
            </Btn>
          </Card>
        </aside>
      </div>
      {prof && <CandidateProfile c={prof} onClose={() => setProf(null)} />}
    </div>
  );
};

export default SingleVotePage;

const departmentName = (name: string) => {
  return name.replace(/^.*?Department of /, "");
};
