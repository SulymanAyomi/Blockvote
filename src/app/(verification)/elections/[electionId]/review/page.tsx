"use client";
import { Btn } from "@/components/btn";
import { ErrorState } from "@/features/error/error-state";
import { Modal } from "@/components/modal";
import { Notice } from "@/components/notice";
import { Stepper } from "@/components/stepper";
import { Card } from "@/components/ui/card";
import { useVotingContext } from "@/context/voting-context";
import { useElectionId } from "@/features/elections/hooks/use-get-election-id";
import { H1, H2 } from "@/lib/helpers";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import SessionBar from "../session-bar";
import { cn } from "@/lib/utils";
import { useGetElection } from "@/features/elections/api/use-get-election";
import { useSubmitBallot } from "@/features/elections/api/use-submit-ballot";
import { useDeleteVotingSession } from "@/features/elections/api/use-delete-voting-session";

function ReviewPage() {
  const router = useRouter();
  const electionId = useElectionId();
  const { data, isLoading, error, refetch } = useGetElection({ electionId });
  const deleteSession = useDeleteVotingSession();

  const {
    ballots,
    anonymousToken,
    votingSessionId,
    handleFocusPos,
    clearBallot,
    setChoice,
    expiresAt,
  } = useVotingContext();

  const { mutate, isPending } = useSubmitBallot();

  const [expired, setExpired] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [phase, setPhase] = useState("idle");
  const [fail, setFail] = useState(null);
  const [fatal, setFatal] = useState<any>(null);
  const lock = useRef(false);

  const restartVerification = () => {
    deleteSession.mutate(electionId);
  };

  const onExpire = useCallback(() => {
    // api.endSession(id);
    clearBallot();
    setExpired(true);
  }, [electionId, clearBallot]);

  const submit = async () => {
    if (lock.current) return;
    lock.current = true;
    setConfirm(false);
    setPhase("submitting");
    setFail(null);
    setFatal(null);

    const finalBallot = Object.entries(ballots).map(
      ([positionId, candidateId]) => ({
        positionId,
        candidateId,
      }),
    );

    mutate(
      {
        json: {
          anonymousToken,
          votingSessionId,
          ballot: finalBallot,
        },
        param: {
          electionId,
        },
      },
      {
        onSuccess: () => {
          clearBallot();
          router.push(`/elections/${electionId}/confirmation`);
        },
        onError: (e) => {
          lock.current = false;
          console.log(e);
          setPhase("idle");
          setFatal(e);
        },
      },
    );
  };

  // if (fatal) return <ErrorState error={fatal} id={electionId} />;

  const sel = ballots || {};
  const missing = data?.data.positions.filter((p) => !sel[p.id]);
  const busy = phase === "submitting" || isPending;

  return (
    <div>
      <Stepper current={2} />
      <SessionBar expiresAt={expiresAt} paused={busy} onExpire={onExpire} />
      <h1 className={H1}>Review Your Ballot</h1>
      <p className="mb-5 mt-1.5 text-slate-600">
        Review your selections carefully before submitting.
      </p>
      {missing && missing?.length > 0 ? (
        <Card className="rounded-2xl p-8 text-center">
          <h2 className={H2}>Your ballot is incomplete</h2>
          <p className="mb-5 mt-2 text-slate-600">
            Select a candidate for{" "}
            {missing.map((m) => m.position.name).join(", ")} before you review.
          </p>
          <Btn to={`/elections/${electionId}/ballot`}>Back to Ballot</Btn>
        </Card>
      ) : (
        <>
          <Card className="divide-y divide-slate-200 rounded-2xl px-5">
            {data?.data.positions.map((p) => {
              const c = p.candidates.find((x) => x.id === sel[p.id]);
              return (
                <div
                  className="flex flex-wrap items-center gap-3 py-4"
                  key={p.id}
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-sm text-slate-600">
                      {p.position.name}
                    </div>
                    <div className="text-lg font-bold text-slate-900">
                      {c?.voter.fullName}
                    </div>
                    <div className="text-sm text-slate-600">
                      {c?.voter.department?.name}, {c?.voter.level}
                    </div>
                  </div>
                  <Btn
                    variant="secondary"
                    disabled={busy}
                    onClick={() => {
                      handleFocusPos(p.id);
                      router.push(`/elections/${electionId}/ballot`);
                    }}
                    aria-label={`Change selection for ${p.position.name}`}
                  >
                    Change
                  </Btn>
                </div>
              );
            })}
          </Card>
          <Notice tone="warn" className="mt-5">
            Once submitted, your ballot cannot be changed or submitted again.
          </Notice>
          {fatal && (
            <ErrorState
              error={fatal}
              id={electionId}
              onRestart={restartVerification}
              isLoading={deleteSession.isPending || isPending}
              retry={submit}
            />
          )}
          <div className="sticky bottom-0 z-20 -mx-4 mt-8 border-t border-slate-200 bg-white px-4 py-3">
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-600">
                Your identity is not shown with your choices.
              </p>
              <div className="flex gap-2.5">
                <Btn
                  variant="secondary"
                  size="lg"
                  to={`/elections/${electionId}/ballot`}
                  icon={ChevronLeft}
                  className="flex-1 sm:flex-none"
                >
                  Back
                </Btn>
                <Btn
                  size="lg"
                  disabled={busy}
                  loading={busy}
                  onClick={() => setConfirm(true)}
                  className="flex-1 sm:flex-none"
                >
                  {busy ? "Submitting…" : fail ? "Try Again" : "Submit Ballot"}
                </Btn>
              </div>
            </div>
          </div>
        </>
      )}
      {confirm && (
        <Modal
          title="Submit your ballot?"
          description="Your selections will be permanently submitted. You will not be able to change your vote after submission."
          onClose={() => setConfirm(false)}
          footer={
            <>
              <Btn variant="secondary" onClick={() => setConfirm(false)}>
                Cancel
              </Btn>
              <Btn onClick={submit}>Confirm Submission</Btn>
            </>
          }
        >
          <Notice tone="warn">This can't be undone.</Notice>
        </Modal>
      )}
      {busy && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-white/95 p-6 text-center"
          role="status"
          aria-live="assertive"
        >
          <div>
            <Loader2
              size={48}
              className="mx-auto animate-spin text-blue-700"
              aria-hidden="true"
            />
            <h2 className={cn(H2, "mt-4")}>Submitting your ballot...</h2>
            <p className="mt-1.5 text-slate-600">
              Please don't close or refresh this page.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReviewPage;
