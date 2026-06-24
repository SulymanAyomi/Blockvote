import { Button } from "@/components/ui/button";
import React from "react";
import { CandidateType } from "../type";

interface CandidateComponentProps {
  onCancel: () => void;
  data: CandidateType | undefined;
}
const CandidateComponent = ({ onCancel, data }: CandidateComponentProps) => {
  if (!data) {
    return (
      <div className="w-full h-full border-none shadow-none">
        <div className="p-7"> Candidate not found</div>
      </div>
    );
  }
  return (
    <div className="w-full h-full border-none shadow-none">
      <div className="p-7">
        <h3 className="text-lg mb-4">Candidate Information</h3>
        <div className="w-full h-32 rounded-sm">
          <img
            src={data.candidateImage}
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex w-full items-center justify-between">
          <p className="font-semibold">{data.name}</p>
          <div className="w-fit flex items-center gap-4">
            <img
              src={data.partyImage}
              className="size-10 rounded-full object-cover"
            />
            <p className="font-semibold">{data.partyName}</p>
          </div>
        </div>
        <div>
          <p className="text-lg font-semibold text-primary-col">Profile</p>
          <div className="border-b w-full h-1 my-2"></div>
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <p className="font-semibold">Age</p>
              <p className="text-text-color2">50 years old</p>
            </div>

            <div>
              <p className="font-semibold">Socials</p>
              <div></div>
            </div>
          </div>
          <div className="text-sm mt-4">{data.profile}</div>
        </div>
        <Button className="w-full mt-5 " onClick={onCancel}>
          Close
        </Button>
      </div>
    </div>
  );
};

export default CandidateComponent;
