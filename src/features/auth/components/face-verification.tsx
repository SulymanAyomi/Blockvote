import { VerificationFlow } from "@/features/verification/components/verification/VerificationFlow";
import React from "react";

interface FaceVerificationProps {
  prevStep: () => void;
  onNext: () => void;
  regSessionId: string;
}

const FaceVerification = ({ onNext, regSessionId }: FaceVerificationProps) => {
  return <VerificationFlow onNext={onNext} regSessionId={regSessionId} />;
};

export default FaceVerification;
