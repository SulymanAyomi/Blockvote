import { Button } from "@/components/ui/button";
import React from "react";
import { CandidateType } from "../type";

interface CandidateComponentProps {
  onCancel: () => void;
  data: CandidateType;
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
        <h3 className="text-lg mb-4">
          Candidate Information{" "}
          <span className="font-semibold">({data.position})</span>
        </h3>
        <div className="w-full h-32 rounded-sm">
          <img
            src={data.imageUrl ? `${data.imageUrl}` : "/daniel.png"}
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex flex-col w-full items-center justify-between">
          <p className="font-semibold text-3xl">{data.fullName}</p>
          <p>{data.campaignSlogan}serving the student body</p>
          {/* <div className="w-fit flex items-center gap-4">
            <img
              src={"/img1.png"}
              className="size-10 rounded-full object-cover"
            />
            <p className="font-semibold">{data.level}</p>
          </div> */}
        </div>
        <div>
          <p className="text-lg font-semibold text-primary-col">Profile</p>
          <div className="border-b w-full h-1 my-2"></div>
          <div className="flex justify-between items-start mb-3">
            <div className="space-y-2 flex-2/5">
              <p className="font-semibold">Faculty</p>
              <p className="text-text-color2">{data.faculty?.name}</p>
            </div>
            <div className="space-y-2 flex-2/5">
              <p className="font-semibold">Department</p>
              <p className="text-text-color2">{data.department?.name}</p>
            </div>
            <div className="space-y-2">
              <p className="font-semibold">Level</p>
              <p className="text-text-color2">{data.level}</p>
            </div>
          </div>
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold">Socials</p>
              <div></div>
            </div>
          </div>
          <div className="text-sm mt-4">{data.manifesto}</div>
        </div>
        <Button className="w-full mt-5 " onClick={onCancel}>
          Close
        </Button>
      </div>
    </div>
  );
};

export default CandidateComponent;
