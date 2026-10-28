"use client";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/features/error/error-state";
import { PageHead } from "@/components/pageHeader";
import { Skel } from "@/components/skeleton-cards";
import { Card } from "@/components/ui/card";
import { fmtDateTime, fmtDate } from "@/lib/helpers";
import { CheckCircle2, Ban, Clock, History } from "lucide-react";
import { Tag } from "@/components/status-badge";
import Link from "next/link";
import {
  elType,
  useGetActivities,
} from "@/features/elections/api/use-get-activities";
import { ErrorPayload } from "@/features/elections/type";

function VotesPage() {
  const { data, isLoading, refetch, error } = useGetActivities();

  const stat = (e: elType) => {
    if (e.voted)
      return (
        <span className="flex items-center gap-1.5 font-bold text-green-800">
          <CheckCircle2 size={18} aria-hidden="true" />
          Vote Submitted
        </span>
      );
    if (e.status === "CLOSED")
      return (
        <Tag kind="closed" icon={Ban}>
          Election Closed
        </Tag>
      );
    if (!e.eligible)
      return (
        <Tag kind="closed" icon={Ban}>
          Not Eligible
        </Tag>
      );
    return (
      <span className="flex flex-wrap items-center gap-3">
        <Tag kind="upcoming" icon={Clock}>
          Not Yet Voted
        </Tag>
        {e.status === "ACTIVE" && (
          <Link
            href={`/elections/${e.id}/verify`}
            className="font-semibold text-blue-800 underline"
          >
            Vote Now
          </Link>
        )}
      </span>
    );
  };

  const date = (e: elType) =>
    e.voted
      ? fmtDateTime(new Date(e.votedAt!))
      : e.status === "ACTIVE"
        ? `Closes ${fmtDate(new Date(e.endsAt))}`
        : e.status === "SCHEDULED"
          ? `Opens ${fmtDate(new Date(e.startsAt))}`
          : `Closed ${fmtDate(new Date(e.endsAt))}`;

  // if (error) return <ErrorState error={error} retry={() => refetch()} />;

  return (
    <div>
      <PageHead
        title="My Voting Activity"
        sub="View your participation in school elections."
      />
      {isLoading && (
        <Card
          className="space-y-3 rounded-2xl p-5"
          role="status"
          aria-label="Loading"
        >
          {[0, 1, 2, 3].map((i) => (
            <Skel key={i} className="h-11 w-full" />
          ))}
        </Card>
      )}
      {error && <ErrorState error={error} retry={() => refetch()} />}

      {data &&
        (data.length === 0 ? (
          <EmptyState icon={History}>
            You haven't participated in any elections yet.
          </EmptyState>
        ) : (
          <Card
            className="overflow-hidden rounded-2xl"
            role="table"
            aria-label="Voting activity"
          >
            <div
              role="row"
              className="hidden grid-cols-12 gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-600 md:grid"
            >
              <div role="columnheader" className="col-span-6">
                Election
              </div>
              <div role="columnheader" className="col-span-3">
                Date
              </div>
              <div role="columnheader" className="col-span-3">
                Status
              </div>
            </div>
            <div className="divide-y divide-slate-200">
              {data.map((e) => (
                <div
                  role="row"
                  key={e.id}
                  className="grid gap-1.5 px-5 py-4 md:grid-cols-12 md:items-center md:gap-4"
                >
                  <div
                    role="cell"
                    className="font-semibold text-slate-900 md:col-span-6"
                  >
                    <Link
                      href={`/elections/${e.id}`}
                      className="hover:underline"
                    >
                      {e.title}
                    </Link>
                  </div>
                  <div
                    role="cell"
                    className="text-sm text-slate-600 md:col-span-3"
                  >
                    {date(e)}
                  </div>
                  <div role="cell" className="md:col-span-3">
                    {stat(e)}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      <p className="mt-4 text-sm text-slate-600">
        This page shows whether you took part, never who you voted for.
      </p>
    </div>
  );
}

export default VotesPage;
