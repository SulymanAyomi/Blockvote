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
import { useGetElection } from "@/features/elections/api/use-get-election";
import PageLoading from "@/app/loading";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
const SingleVotePage = () => {
  const router = useRouter();
  const params = useParams();
  const electionId = params.electionId as string;
  const { data: nelection, isLoading } = useGetElection({ electionId });
  // const election = mockPolls.find((election) => election.id == electionId);
  const election = nelection?.data.election;
  const postion = nelection?.data.positions;
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState({
    electionId: electionId,
    candidateId: "",
  });

  const open = (id: string) => {
    if (id) {
      setData((prev) => ({ ...prev, candidateId: id }));
      setIsOpen(true);
    }
  };

  const close = () => {
    setIsOpen(false);
  };
  if (isLoading) {
    return <PageLoading />;
  }

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
        electionId={electionId}
        candidateId={data.candidateId}
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
            className="bg-green-500 text-white capitalize rounded-md py-3"
          >
            {election.status}
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
            <p className="text-xs ">8hrs of 9hrs</p>
          </div>
        </div>
      </div>
      <div className="border-t">
        <p className="font-semibold py-3">
          {/* {election?.pollType == "Candidate" ? "Contestants" : "Options"} */}
          Positions
        </p>
        <div className="space-y-3">
          <Accordion
            type="single"
            collapsible
            defaultValue="item-1"
            className="space-y-3"
          >
            {postion?.map((p, i) => (
              <AccordionItem value={`${i}`} key={i} className="py">
                <AccordionTrigger className="hover:no-underline">
                  <div>
                    <span className="font-bold">{p.position.name} - </span>
                    {p.candidates.length} candidate(s)
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="rounded-md space-y-3 grid gap-4 grid-cols-1 md:grid-cols-2">
                    {p.candidates.map((candidate) => (
                      <div className="flex items-center p-3 rounded-md gap-4 border shadow-sm">
                        <div className="flex-1/3 w-full h-20 border rounded-sm bg-yellow-100">
                          <img
                            src={
                              candidate.voter.imageUrl
                                ? `${candidate.voter.imageUrl}`
                                : "/daniel.png"
                            }
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="flex flex-2/3 flex-col space-y-0">
                          <div>
                            <p className="font-semibold mb-2!">
                              {candidate.voter.fullName}
                            </p>
                            <p className="mb-2!">
                              {departmentName(
                                candidate.voter?.department?.name!,
                              )}
                            </p>
                            <p className="text-muted-foreground text-xs mb-2">
                              {candidate.voter.level} level
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
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/*
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
        </div> */}
        <div className="mt-6 w-full">
          <Button
            className="w-full"
            onClick={() => router.push(`/elections/${election?.id}/join`)}
          >
            Join Online Vote <MoveRightIcon className="size-6" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SingleVotePage;

const departmentName = (name: string) => {
  return name.replace(/^.*?Department of /, "");
};
