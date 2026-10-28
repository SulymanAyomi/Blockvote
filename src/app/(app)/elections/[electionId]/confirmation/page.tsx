"use client";
import { Btn } from "@/components/btn";
import { ErrorState } from "@/features/error/error-state";
import { Notice } from "@/components/notice";
import { Skel } from "@/components/skeleton-cards";
import { Tag } from "@/components/status-badge";
import { Stepper } from "@/components/stepper";
import { Card } from "@/components/ui/card";
import { useGetVoteConfirmation } from "@/features/elections/api/use-get-vote-confirmation";
import { useElectionId } from "@/features/elections/hooks/use-get-election-id";
import { H1 } from "@/lib/helpers";
import { Check, CheckCircle2, Lock } from "lucide-react";

function ConfirmationPage() {
  const electionId = useElectionId();
  const { data, isFetching, error, refetch } = useGetVoteConfirmation({
    electionId,
  });

  if (isFetching)
    return (
      <Card className="rounded-2xl p-8" role="status" aria-label="Loading">
        <Skel className="mx-auto h-24 w-24 rounded-full" />
        <Skel className="mx-auto mt-5 h-8 w-3/5" />
        <Skel className="mx-auto mt-5 h-36 w-full max-w-md" />
      </Card>
    );
  if (error || !data)
    return <ErrorState error={error} id={electionId} retry={() => refetch()} />;
  const res = data.data;
  return (
    <div className="mx-auto max-w-2xl">
      <Stepper current={4} />
      <div className="text-center" role="status">
        <div className="mx-auto mb-5 grid h-24 w-24 place-items-center rounded-full bg-green-700 text-white">
          <Check size={52} strokeWidth={3} aria-hidden="true" />
        </div>
        <h1 className={H1}>Your Vote Has Been Submitted</h1>
        <p className="mx-auto mb-7 mt-2.5 max-w-md text-slate-600">
          Your ballot for the {res?.title} has been successfully submitted.
        </p>
      </div>
      <Card className="mx-auto mb-6 max-w-lg rounded-2xl border-2 border-dashed border-slate-300 p-6">
        <dl className="divide-y divide-dashed divide-slate-300">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-3 first:pt-0 last:pb-0">
            <dt className="text-slate-600">Election</dt>
            <dd className="text-right font-semibold text-slate-900">
              {res?.title}
            </dd>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-3 first:pt-0 last:pb-0">
            <dt className="text-slate-600">Status</dt>
            <dd className="text-right font-semibold text-slate-900">
              {" "}
              <Tag key="b" kind="done" icon={CheckCircle2}>
                Vote Submitted
              </Tag>
              ,
            </dd>
          </div>
        </dl>
      </Card>
      <Notice tone="info" icon={Lock} className="mb-6">
        Your ballot choices are private. Your voting status is recorded
        separately from your candidate selections.
      </Notice>
      <div className="flex flex-wrap justify-center gap-3">
        <Btn size="lg" to="/dashboard">
          Return to Dashboard
        </Btn>
        <Btn size="lg" variant="secondary" to="/my-votes">
          View My Voting Activity
        </Btn>
      </div>
    </div>
  );
}

export default ConfirmationPage;
