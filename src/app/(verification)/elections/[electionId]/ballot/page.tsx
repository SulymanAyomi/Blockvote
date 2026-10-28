"use client";
import { Btn } from "@/components/btn";
import { CandidateProfile } from "@/components/candidate-profile";
import { ErrorState } from "@/features/error/error-state";
import { Notice } from "@/components/notice";
import { Skel } from "@/components/skeleton-cards";
import { Tag } from "@/components/status-badge";
import { Stepper } from "@/components/stepper";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Av } from "@/components/user-avatar";
import { useVotingContext } from "@/context/voting-context";
import { useGetElection } from "@/features/elections/api/use-get-election";
import { useElectionId } from "@/features/elections/hooks/use-get-election-id";
import { candidateType, ErrorPayload } from "@/features/elections/type";
import { cx, H1, H2 } from "@/lib/helpers";
import { id } from "date-fns/locale";
import { AlertTriangle, Check, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import SessionBar from "../session-bar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useDeleteVotingSession } from "@/features/elections/api/use-delete-voting-session";

function BallotPage() {
  const router = useRouter();
  const electionId = useElectionId();
  const {
    ballots,
    focusPos,
    handleFocusPos,
    clearBallot,
    setChoice,
    expiresAt,
  } = useVotingContext();
  const { data, isLoading, error, refetch } = useGetElection({ electionId });
  const deleteSession = useDeleteVotingSession();

  const [expired, setExpired] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [prof, setProf] = useState<candidateType | null>(null);

  const restartVerification = () => {
    deleteSession.mutate(electionId);
  };

  const sel = ballots || {};
  const seletedCandidate = (candidateId: string) => {
    console.log("sel", ballots);
  };

  useEffect(() => {
    if (data && focusPos) {
      requestAnimationFrame(() => {
        const el = document.getElementById("fs-" + focusPos);
        if (el) {
          el.scrollIntoView({ block: "start" });
          el.focus({ preventScroll: true });
        }
      });
      handleFocusPos(null);
    }
  }, [data]); // eslint-disable-line

  const onExpire = useCallback(() => {
    clearBallot();
    setExpired(true);
  }, [id, clearBallot]);

  if (expired)
    return <ErrorState error={{ code: "session_expired" }} id={electionId} />;

  if (isLoading)
    return (
      <div role="status" aria-label="Loading ballot">
        <Skel className="mb-5 h-10 w-3/5" />
        {[0, 1].map((i) => (
          <Card key={i} className="mb-4 rounded-2xl p-5">
            <Skel className="h-7 w-1/3" />
            <Skel className="mt-4 h-24 w-full" />
            <Skel className="mt-3 h-24 w-full" />
          </Card>
        ))}
      </div>
    );

  const election = data?.data;

  if (error || !election) {
    return (
      <ErrorState
        error={error}
        id={electionId}
        isLoading={deleteSession.isPending}
        onRestart={restartVerification}
      />
    );
  }

  const pos = election?.positions;
  const chosen = pos?.filter((p) => sel[p.id]).length;
  const nErr = Object.keys(errors).length;

  const review = () => {
    const miss = pos?.filter((p) => !sel[p.id]);

    if (miss?.length) {
      const er: any = {};
      miss?.forEach((p) => {
        er[p.id] = `Please select a candidate for ${p.position.name}.`;
      });
      setErrors(er);
      const el = document.getElementById("fs-" + miss[0].id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        el.focus({ preventScroll: true });
      }
      return;
    }

    router.push(`/elections/${electionId}/review`);
  };

  return (
    <div>
      <Stepper current={2} />
      <SessionBar expiresAt={expiresAt} onExpire={onExpire} />
      <div className="mb-5">
        <h1 className={H1}>Cast Your Vote</h1>
        <p className="mt-1.5 text-slate-700">{election?.election.title}</p>
        <p className="text-sm text-slate-600">
          Step 2 of 3. Select one candidate for each position.
        </p>
      </div>
      {nErr > 0 && (
        <Notice tone="error" className="mb-5" role="alert">
          {nErr === 1
            ? "One position still needs a selection."
            : `${nErr} positions still need a selection.`}
        </Notice>
      )}
      <div className="space-y-5">
        {pos?.map((p) => (
          <section
            key={p.id}
            id={"fs-" + p.id}
            tabIndex={-1}
            className="scroll-mt-40 overflow-hidden rounded-2xl border border-slate-200 bg-white outline-none"
          >
            <div className="border-b border-l-4 border-slate-200 border-l-slate-900 bg-slate-50 px-5 py-4">
              <h2 id={"lg-" + p.id} className={H2}>
                {p.position.name}
              </h2>
              <p id={"h-" + p.id} className="text-sm text-slate-600">
                Select one candidate
              </p>
            </div>
            <RadioGroup
              value={sel[p.id] || ""}
              aria-labelledby={"lg-" + p.id}
              aria-describedby={
                "h-" + p.id + (errors[p.id] ? " err-" + p.id : "")
              }
              aria-invalid={errors[p.id] ? true : undefined}
              onValueChange={(v) => {
                setChoice(electionId, p.id, v);
                setErrors((x) => {
                  const n = { ...x };
                  delete n[p.id];
                  return n;
                });
              }}
              className="grid gap-3 p-4"
            >
              {p.candidates.map((c) => {
                const on = sel[p.id] === c.id;
                const cid = `c-${c.id}`;
                return (
                  <div
                    key={c.id}
                    className={cx(
                      "rounded-xl border-2 transition-colors focus-within:ring-2 focus-within:ring-blue-700 focus-within:ring-offset-2",
                      on
                        ? "border-blue-700 bg-blue-50"
                        : "border-slate-200 bg-white hover:border-blue-300",
                    )}
                  >
                    <Label
                      htmlFor={cid}
                      className="flex cursor-pointer items-start gap-3 p-4 font-normal leading-normal"
                    >
                      <RadioGroupItem
                        id={cid}
                        value={c.id}
                        className="mt-1 h-6 w-6 shrink-0 border-2 border-slate-500"
                      />
                      {c.imageUrl ? (
                        <img
                          src={c.imageUrl}
                          className="size-10 rounded-full"
                        />
                      ) : (
                        <Av name={c.voter.fullName} size="md" />
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block text-lg font-bold text-slate-900">
                          {c.voter.fullName}
                        </span>
                        <span className="block text-sm text-slate-600">
                          {c.voter.department?.name}, {c.voter.level}
                        </span>
                        <span className="mt-1.5 block text-slate-800">
                          {c.voter.fullName}
                        </span>
                        {on && (
                          <span className="mt-2 block">
                            <Tag kind="info" icon={Check}>
                              Selected
                            </Tag>
                          </span>
                        )}
                      </span>
                    </Label>
                    <div className="pb-2 pl-14">
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-10 px-3 font-semibold text-blue-800 underline hover:bg-blue-100"
                        onClick={() => setProf(c)}
                        aria-label={`View profile: ${c.voter.fullName}`}
                      >
                        View Profile
                      </Button>
                    </div>
                  </div>
                );
              })}
            </RadioGroup>
            {errors[p.id] && (
              <p
                id={"err-" + p.id}
                role="alert"
                className="mx-4 mb-4 flex items-start gap-2 font-semibold text-red-700"
              >
                <AlertTriangle
                  size={18}
                  aria-hidden="true"
                  className="mt-0.5 shrink-0"
                />
                {errors[p.id]}
              </p>
            )}
          </section>
        ))}
      </div>
      <div className="sticky bottom-0 z-20 -mx-4 mt-8 border-t border-slate-200 bg-white px-4 py-3">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600" aria-live="polite">
            {chosen} of {pos?.length} positions selected
          </p>
          <div className="flex gap-2.5">
            <Btn
              variant="secondary"
              size="lg"
              to={`/elections/${electionId}`}
              icon={ChevronLeft}
              className="flex-1 sm:flex-none"
            >
              Back
            </Btn>
            <Btn size="lg" onClick={review} className="flex-1 sm:flex-none">
              Review Ballot
            </Btn>
          </div>
        </div>
      </div>
      {prof && <CandidateProfile c={prof} onClose={() => setProf(null)} />}
    </div>
  );
}

export default BallotPage;
