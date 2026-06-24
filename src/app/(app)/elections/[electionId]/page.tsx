"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { CandidateModal } from "@/features/candidate/components/candidate-modal";
import { CandidateType } from "@/features/candidate/type";
import { MoveRightIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import mockPolls from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const SingleVotePage = () => {
  const router = useRouter();
  const params = useParams();
  const electionId = params.electionId as string;
  const election = mockPolls.find((election) => election.id == electionId);

  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<CandidateType>();

  const open = (id: string) => {
    const dd = election?.candidates?.find((c) => id === c.id);
    if (dd) {
      setData(dd);
      setIsOpen(true);
    }
  };

  const close = () => {
    setIsOpen(false);
  };

  if (!election) {
    return (
      <div className="max-w-3xl mx-auto py-10 p-4 w-full h-full bg-white rounded-md">
        No election data
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-10 p-4 w-full h-full bg-white rounded-md">
      <CandidateModal
        close={close}
        data={data}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />

      <div className="mb-3">
        <h1 className="text-2xl font-semibold mb-3">{election.title}</h1>
        <p className="text-sm text-text-color2">{election.description}</p>
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Status</p>
          <Badge
            variant={"secondary"}
            className="bg-yellow-700 rounded-md py-3"
          >
            Ongoing
          </Badge>
        </div>
        <div className="flex flex-col items-start gap-2">
          <p className="text-sm font-semibold">Countdown</p>
          <div className="flex flex-col gap-2 items-start w-full">
            {/* <div className="h-2 w-90 rounded-xl bg-green-500"></div> */}
            <Progress
              value={80}
              className="bg-neutral-400 text-green-500 w-full"
            ></Progress>
            <p className="text-xs text-green-900">8hrs of 9hrs</p>
          </div>
        </div>
      </div>
      <div className="border-t">
        <p className="font-semibold py-3">
          {election?.pollType == "Candidate" ? "Contestants" : "Options"}
        </p>
        <div className="rounded-md space-y-3 grid gap-4 grid-cols-1 md:grid-cols-2">
          {election?.pollType == "Candidate"
            ? election.candidates?.map((candidate) => (
                <div className="flex items-center p-3 rounded-md gap-4 border shadow-sm">
                  <div className="flex-1/3 w-full h-20 border rounded-sm bg-yellow-100">
                    <img
                      src={candidate.candidateImage}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex flex-2/3 flex-col">
                    <p className="font-semibold">{candidate.name}</p>
                    <div className="flex gap-2 items-center text-xs">
                      <img
                        src={candidate.partyImage}
                        className="size-10 object-cover rounded-full"
                      />
                      <p className="text-muted-foreground text-xs">
                        {candidate.partyName}
                      </p>
                    </div>
                    <Button
                      size={"xs"}
                      className="w-fit"
                      onClick={() => open(candidate.id)}
                    >
                      View details
                    </Button>
                  </div>
                </div>
              ))
            : election?.options?.map((option) => (
                <div className="flex items-center p-3 rounded-md gap-4 border shadow-sm">
                  <div className="flex-1/3 w-full h-20 border rounded-sm bg-yellow-100">
                    <img
                      src={option.image}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex flex-2/3 flex-col">
                    <p className="font-semibold">{option.label}</p>
                  </div>
                </div>
              ))}
        </div>
        <div className="mt-6 w-full">
          <Button
            className="w-full"
            onClick={() => router.push(`/elections/${election?.id}/vote`)}
          >
            Join Online Vote <MoveRightIcon className="size-6" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SingleVotePage;
