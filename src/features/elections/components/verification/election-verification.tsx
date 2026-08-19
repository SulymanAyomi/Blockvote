"use client";
import { CheckIcon, Loader2Icon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useElectionVerification } from "../../api/use-election-verification";
import { useElectionId } from "../../hooks/use-get-election-id";
import { error } from "console";
import { se } from "date-fns/locale";
import { useRouter } from "next/navigation";

interface responseType {
  success: true;
  data: {
    votersessionId: string;
    status: string;
  };
  message?: string | undefined;
}
interface ElectionVerificationProps {
  handleSessionId: (sessionId: string) => void;
}
const ElectionVerification = ({
  handleSessionId,
}: ElectionVerificationProps) => {
  const router = useRouter();
  const electionId = useElectionId();

  const [currentStep, setCurrentStep] = useState(0);
  const [voted, setVoted] = useState(false);
  const { mutate } = useElectionVerification();

  const change = (sessionId: string) => {
    handleSessionId(sessionId);
  };

  useEffect(() => {
    mutate(
      {
        param: { electionId },
      },
      {
        onSuccess: (data) => {
          console.log("data", data);
          const res = data as responseType;
          change(res.data.votersessionId);
        },
        onError: (error) => {
          if (error.message == "Already voted") {
            setVoted(true);
          }
          console.log(error);
        },
      },
    );
  }, []);

  if (voted) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <div className="mt-8 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100">
          <svg
            viewBox="0 0 24 24"
            className="h-8 w-8 text-rose-600"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-slate-900">
          You have voted already!
        </h2>
        <p className="max-w-sm text-sm text-slate-600">
          Our records indicate that you have already cast your vote for this
          election. If you believe this is an error, please contact the election
          committee for assistance.
        </p>
        <div className="flex flex-col items-center gap-2 sm:flex-row">
          <button
            onClick={() => router.push("/home")}
            className="rounded-lg flex-1/2 bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-700"
          >
            Home
          </button>
          <a
            // href={COMMITTEE_CONTACT_URL}
            className="rounded-lg text-nowrap border border-slate-300 px-6 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Contact election committee
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex  justify-center font-serif">
      <div className="w-full max-w-md bg-white rounded-sm p-8 text-center">
        <div className="flex justify-center mb-3">
          <div className="w-14 h-14  flex items-center justify-center">
            <Loader2Icon
              size={32}
              className="text-primary-col animate-spin"
              strokeWidth={2}
            />
          </div>
        </div>
        <h2 className="text-xl text-[#1B2A41] mb-2">
          Checking your eligibility
        </h2>
        <p className="font-sans text-sm text-[#6B6656] leading-relaxed mb-5">
          Checking your eligibility to vote in this election
        </p>
      </div>
    </div>
  );
};

export default ElectionVerification;
