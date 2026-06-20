"use client";

import { useState } from "react";
import Section1 from "./form/section1";
import Section2 from "./form/section2";
import Section3 from "./form/section3";
import { PollOptionsSection } from "./form/section-4";

const CreatePoll = () => {
  const [data, setData] = useState({
    title: "",
    startDate: undefined,
    startTime: "",
    endTime: "",
    endDate: undefined,
    img: "",
    type: "",
    restriction: "",
    timeZone: "",
  });
  const steps = [
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
  const [currentStep, setCurrentStep] = useState(3);
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
    <div className="max-w-md mx-auto  p-4 w-full h-full bg-white rounded-md">
      <div className="mb-3">
        <h1 className="text-2xl font-semibold mb-2">Create a poll</h1>
        <p className="text-sm text-text-color2">
          Fill the fields below to create a poll
        </p>
      </div>
      {currentStep === 0 && <Section1 onNext={nextStep} />}
      {currentStep === 1 && <Section2 onNext={nextStep} />}
      {currentStep === 2 && <Section3 onNext={nextStep} />}
      {currentStep === 3 && <PollOptionsSection onNext={nextStep} />}
    </div>
  );
};

export default CreatePoll;
