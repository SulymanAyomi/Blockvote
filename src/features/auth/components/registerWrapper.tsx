"use client";
import { ArrowLeftIcon } from "lucide-react";
import React, { useState } from "react";
import { RegisterComponent } from "./register";
import { OTPForm } from "./otp-form";
import PersonalInfo from "./personal-info";
import RegistrationComplete from "./registration-complete";
import FaceVerification from "./face-verification";
import { DataType } from "../type";
import { PasswordComponent } from "./password";
import BallotPasswordInput from "./p";

export const steps = [
  {
    name: "ID",
  },
  {
    name: "OTP",
  },
  {
    name: "Face-verication",
  },
  {
    name: "personal-info",
  },
  {
    name: "password",
  },
];

const RegisterWrapper = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showPrev, setShowPrev] = useState(false);
  const [data, setData] = useState<DataType>({
    id: undefined,
    idNumber: "",
    regSessionId: "",
  });

  const nextStep = () => {
    const nextStep = Math.min(currentStep + 1, steps.length - 1);
    setCurrentStep(nextStep);
  };
  const prevStep = () => {
    const prevStep = Math.max(currentStep - 1, 0);
    setCurrentStep(prevStep);
  };

  const handleData = (value: DataType) => {
    setData(value);
  };
  // && currentStep != 3
  return (
    <div className="max-w-md w-full h-full mx-auto py-10 px-4">
      {currentStep != (0 || 4) && (
        <div
          className="flex gap-1 items-center w-fit justify-start cursor-pointer mb-2"
          onClick={prevStep}
        >
          <div className="p-1 rounded-full bg-black w-fit">
            <ArrowLeftIcon className="size-3 text-white" />
          </div>
          <p className="font-semibold">Back</p>
        </div>
      )}
      <div className="w-full h-full">
        {currentStep === 0 && (
          <RegisterComponent
            onNext={nextStep}
            handleData={handleData}
            data={data}
          />
        )}
        {currentStep === 1 && (
          <OTPForm data={data} onNext={nextStep} prevStep={prevStep} />
        )}
        {currentStep === 2 && (
          <FaceVerification
            onNext={nextStep}
            prevStep={prevStep}
            regSessionId={data.regSessionId}
          />
        )}
        {currentStep === 3 && (
          <PersonalInfo onNext={nextStep} regSessionId={data.regSessionId} />
        )}
        {currentStep === 4 && <BallotPasswordInput data={data} />}
      </div>
    </div>
  );
};

export default RegisterWrapper;
