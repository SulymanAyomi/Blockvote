"use client";
import { CheckIcon, Loader2Icon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useElectionVerification } from "../../api/use-election-verification";
import { useElectionId } from "../../hooks/use-get-election-id";
import { error } from "console";
import { se } from "date-fns/locale";

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
  const electionId = useElectionId();

  const [currentStep, setCurrentStep] = useState(0);
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
          console.log(error);
        },
      },
    );
  }, []);

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
