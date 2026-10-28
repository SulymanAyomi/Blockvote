"use client";

import { Btn } from "@/components/btn";
import { ErrorState } from "@/features/error/error-state";
import { Notice } from "@/components/notice";
import { Skel } from "@/components/skeleton-cards";
import { Stepper } from "@/components/stepper";
import { Card } from "@/components/ui/card";
import { useVotingContext } from "@/context/voting-context";
import { useDeleteVotingSession } from "@/features/elections/api/use-delete-voting-session";
import {
  useAuthorizationResponse,
  useElectionVotingAuthourization,
} from "@/features/elections/api/use-get-election-authourization";
import { useElectionId } from "@/features/elections/hooks/use-get-election-id";
import { ErrorCode, ErrorPayload } from "@/features/elections/type";
import { H1 } from "@/lib/helpers";
import { ShieldCheck, Timer } from "lucide-react";
import { useEffect, useState } from "react";

function AuthorizationPage() {
  const electionId = useElectionId();
  const authourzation = useElectionVotingAuthourization();
  const deleteSession = useDeleteVotingSession();

  const { setVotinData, setSession } = useVotingContext();
  const [error, setError] = useState<ErrorCode | "INTERNAL_ERROR" | null>(null);

  const restartVerification = () => {
    deleteSession.mutate(electionId);
  };

  useEffect(() => {
    authourzation.mutate(
      {
        param: { electionId },
      },
      {
        onSuccess: (data: useAuthorizationResponse) => {
          if (data.data.status == "COMPLETED") {
            setError("already_voted");
            return;
          }
          if (data.data.status == "EXPIRED") {
            setError("session_expired");
            setSession("");
            return;
          }
          if (data.data.token && data.data.expiresAt) {
            setVotinData(data.data.token, new Date(data.data.expiresAt));
            return;
          }
        },
        onError: (error) => {
          if (error.message == "SESSION_NOT_FOUND") {
            setError("session_expired");
            setSession("");
            return;
          }
          if (error.message == "SESSION_EXPIRED") {
            setError("session_expired");
            setSession("");
            return;
          }
          if (error.message == "INVALID_SESSION_STATE") {
            setError("session_expired");
            setSession("");
            return;
          }
          if (error.message == "FACE_NOT_VERIFIED") {
            setError("not_verified");
            setSession("");
            return;
          }

          if (error.message == "ALREADY_VOTED") {
            setError("already_voted");
            setSession("");
            return;
          }
          if (error.message == "NOT_ELIGIBLE") {
            setError("not_eligible");
            setSession("");
            return;
          }
          if (error.message == "ELECTION_ENDED") {
            setError("closed");
            setSession("");
            return;
          }
          if (error.message == "ELECTION_NOT_OPEN") {
            setError("not_open");
            setSession("");
            return;
          }
          if (error.message == "ELECTION_NOT_FOUND") {
            setError("not_found");
            setSession("");
            return;
          }

          setError("INTERNAL_ERROR");
          setSession("");
        },
      },
    );
  }, []);

  if (authourzation.isPending)
    return (
      <Card className="rounded-2xl p-8" role="status" aria-label="Loading">
        <Skel className="mx-auto h-24 w-24 rounded-full" />
        <Skel className="mx-auto mt-5 h-7 w-1/2" />
        <Skel className="mx-auto mt-4 h-4 w-4/5" />
      </Card>
    );

  if (error) {
    return (
      <ErrorState
        error={error}
        id={electionId}
        isLoading={deleteSession.isPending}
        onRestart={restartVerification}
      />
    );
  }
  const secs = 600;

  const dur =
    secs >= 60 ? `${Math.round(secs / 60)} minutes` : `${secs} seconds`;

  return (
    <div>
      <Stepper current={2} />
      <Card
        className="mx-auto max-w-xl rounded-2xl p-6 text-center md:p-8"
        role="status"
      >
        <div className="mx-auto mb-5 grid h-28 w-28 place-items-center rounded-full border-4 border-green-700 bg-green-50 text-green-700">
          <ShieldCheck size={56} aria-hidden="true" />
        </div>
        <h1 className={H1}>You're Verified</h1>
        <p className="mb-1.5 mt-3 text-slate-800">
          Your identity has been successfully verified. You can now cast your
          ballot.
        </p>
        <p className="text-slate-600">
          You have been granted temporary authorization to vote in this
          election.
        </p>
        <Notice tone="info" icon={Timer} className="my-5 text-left">
          You'll have <strong>{dur}</strong> to complete your ballot. The
          countdown starts when the ballot opens.
        </Notice>
        <Btn
          size="lg"
          to={`/elections/${electionId}/ballot`}
          className="w-full"
        >
          Continue to Ballot
        </Btn>
      </Card>
    </div>
  );
}

export default AuthorizationPage;
