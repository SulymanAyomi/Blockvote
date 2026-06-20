"use client";
import { ArrowLeftIcon } from "lucide-react";
import React, { useState } from "react";
import { RegisterComponent } from "./register";
import { OTPForm } from "./otp-form";
import PersonalInfo from "./personal-info";
import RegistrationComplete from "./registration-complete";

export const steps = [
  {
    name: "ID",
  },
  {
    name: "OTP",
  },
  {
    name: "personal",
  },
  {
    name: "confirm",
  },
];
const RegisterWrapper = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showPrev, setShowPrev] = useState(false);

  const nextStep = () => {
    const nextStep = Math.min(currentStep + 1, steps.length - 1);
    setCurrentStep(nextStep);
  };
  const prevStep = () => {
    const prevStep = Math.max(currentStep - 1, 0);
    setCurrentStep(prevStep);
  };
  return (
    <div className="max-w-md w-full h-full mx-auto py-10 px-4">
      {currentStep != 0 && currentStep != 3 && (
        <div className="flex gap-1 items-center w-fit justify-start cursor-pointer mb-2">
          <div className="p-1 rounded-full bg-black w-fit" onClick={prevStep}>
            <ArrowLeftIcon className="size-3 text-white" />
          </div>
          <p className="font-semibold">Back</p>
        </div>
      )}
      <div className="w-full h-full">
        {currentStep === 0 && <RegisterComponent onNext={nextStep} />}
        {currentStep === 1 && <OTPForm onNext={nextStep} prevStep={prevStep} />}
        {currentStep === 2 && <PersonalInfo onNext={nextStep} />}
        {currentStep === 3 && <RegistrationComplete />}
      </div>
    </div>
  );
};

export default RegisterWrapper;
