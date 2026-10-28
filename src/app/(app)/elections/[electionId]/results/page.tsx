"use client";
import { Btn } from "@/components/btn";
import { PageHead } from "@/components/pageHeader";
import { SkelCards } from "@/components/skeleton-cards";
import { Tag } from "@/components/status-badge";
import { Card } from "@/components/ui/card";
import { useGetElectionResults } from "@/features/elections/api/use-get-election-result";
import { useElectionId } from "@/features/elections/hooks/use-get-election-id";
import { ErrorState } from "@/features/error/error-state";
import { fmtDateTime, H2 } from "@/lib/helpers";
import { cx } from "class-variance-authority";
import { ChevronLeft, Award } from "lucide-react";

function ResultsPage() {
  const electionId = useElectionId();
  const { data, isLoading, error, refetch } = useGetElectionResults({
    electionId,
  });

  if (isLoading) return <SkelCards n={2} />;
  if (error || !data)
    return <ErrorState error={error} id={electionId} retry={refetch} />;

  const election = data.data.election;
  const positions = data.data.positions;
  return (
    <div>
      <div className="mb-3">
        <Btn variant="ghost" to={`/elections/${electionId}`} icon={ChevronLeft}>
          Back
        </Btn>
      </div>
      <PageHead
        title="Official results"
        sub={`${election.title}. Published ${fmtDateTime(new Date(election.resultsPublishAt!))}.`}
      />
      <div className="space-y-4">
        {positions.map((p) => {
          return (
            <Card
              key={p.id}
              role="group"
              aria-labelledby={"r-" + p.id}
              className="rounded-2xl p-5"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 id={"r-" + p.id} className={H2}>
                  {p.name}
                </h2>
                <span className="text-sm text-slate-600">
                  {p.totalVotes.toLocaleString()} votes counted
                </span>
              </div>
              <ul className="mt-4 space-y-4">
                {[...p.candidates]
                  .sort((a, b) => b.votes - a.votes)
                  .map((c) => {
                    return (
                      <li key={c.id}>
                        <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                          <span className="flex items-center gap-2">
                            <strong className="text-slate-900">
                              {c.fullName}
                            </strong>
                            {c.isWinner && (
                              <Tag kind="done" icon={Award}>
                                Elected
                              </Tag>
                            )}
                          </span>
                          <span className="text-sm text-slate-700">
                            {c.percent.toFixed(1)}% ({c.votes.toLocaleString()})
                          </span>
                        </div>
                        <div
                          className="h-3 overflow-hidden rounded-full bg-slate-200"
                          role="img"
                          aria-label={`${c.fullName}: ${c.percent.toFixed(1)} percent`}
                        >
                          <div
                            className={cx(
                              "h-full rounded-full",
                              c.isWinner ? "bg-blue-700" : "bg-slate-400",
                            )}
                            style={{ width: c.percent + "%" }}
                          />
                        </div>
                      </li>
                    );
                  })}
              </ul>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
export default ResultsPage;
