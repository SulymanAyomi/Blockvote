"use client";
import "./stepper.css"; // Import the CSS file

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOpenCandidateModal } from "@/features/candidate/hook/use-open-candidate";
import { useConfirm } from "@/hooks/use-confirm";
import {
  ArrowRightIcon,
  CheckIcon,
  ChevronRightIcon,
  FingerprintIcon,
  MoveRightIcon,
  SearchIcon,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import mockPolls from "@/lib/data";
import { useGetElection } from "@/features/elections/api/use-get-election";
import PageLoading from "@/app/loading";
import { cn } from "@/lib/utils";
import { useVote } from "@/context/vote-context";

type Ballot = {
  [positionId: string]: string;
};
interface VoteComponentProps {
  changeCompleteVote: () => void;
}
const VoteComponent = () => {
  const router = useRouter();
  const {
    election,
    positions,
    currentPosition,
    completedPositions,
    ballot,
    progress,
    totalPositions,
    currentStep,
    next,
    previous,
    selectCandidate,
    getSelectedCandidate,
    hasCompleted,
    open,
  } = useVote();

  console.log("election: ", election);

  const [ConfirmDialog, confirm] = useConfirm(
    "Confirmation",
    "Are you sure you want to vote for Ademola Tolu. Your vote cannot be changed.",
    "default",
    "text-primary-col font-bold",
    "text-black",
  );

  const handleReview = () => {
    router.push("/review");
  };

  return (
    <div>
      <ConfirmDialog />
      <div className="p-4 w-full h-full bg-white rounded-md">
        <div className="mb-3 space-y-3">
          <h1 className="text-2xl font-semibold mb-3">{election.title}</h1>
        </div>
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <p className="font-semibold py-3">Positions</p>
          </div>

          <div className="mt-6 w-full">
            <div className="mb-8 relative">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-semibold">
                  {currentPosition.position.name}
                </h2>
                <span className="text-sm text-muted-foreground">
                  {completedPositions} of {totalPositions}
                </span>
              </div>
              <div className="z-10">
                <div className="progress-container">
                  <motion.div
                    className="h-2 mx-20 rounded-full max-w-[83%] bg-primary absolute top-1/5 z-20"
                    animate={{
                      width: `${progress}%`,
                    }}
                    transition={{
                      duration: 0.4,
                      ease: "easeOut",
                    }}
                  />
                  <div className="flex flex-1 justify-between z-40">
                    {positions.map((position, index) => {
                      const completed = hasCompleted(position.id);

                      const active = index === currentStep;

                      return (
                        <div
                          key={position.id}
                          className="flex flex-col items-center flex-1"
                        >
                          <div
                            className={cn(
                              "h-10 w-10 rounded-full flex items-center justify-center",
                              completed
                                ? "bg-green-600 text-white"
                                : active
                                  ? "bg-primary text-white"
                                  : "bg-gray-200",
                            )}
                          >
                            {completed ? "✓" : index + 1}
                          </div>

                          <p className="text-xs mt-2 text-center">
                            {position.position.name}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm mb-3 ml-3">
                Select and vote for your preferred candidate.
              </p>
              <div className="rounded-md space-y-3 grid gap-4 grid-cols-1 md:grid-cols-2">
                {currentPosition.candidates.map((candidate, index) => {
                  const isSelected =
                    getSelectedCandidate(currentPosition.id) == candidate.id;
                  return (
                    <motion.div
                      key={candidate.id}
                      initial={{
                        opacity: 0,
                        y: 20,
                      }}
                      transition={{
                        delay: index * 0.08,
                      }}
                      animate={{
                        scale: isSelected ? 1.02 : 1,
                        borderColor: isSelected ? "#2563eb" : "#e5e7eb",
                        opacity: 1,
                        y: 0,
                      }}
                    >
                      <div
                        className={cn(
                          "flex items-center p-3 rounded-md gap-4 border shadow-sm",
                          isSelected && "border-primary-col",
                        )}
                      >
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
                            <p className="mb-2!">Computer science</p>
                            <p className="text-muted-foreground text-xs mb-2">
                              {candidate.voter.level} level
                            </p>
                          </div>
                          <Button
                            size={"xs"}
                            className="w-1/2"
                            onClick={() =>
                              selectCandidate(currentPosition.id, candidate.id)
                            }
                          >
                            <FingerprintIcon /> {isSelected ? "Voted" : "Vote"}
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-10">
            <button
              onClick={previous}
              disabled={currentStep === 0}
              className="px-6 py-2 border rounded-lg disabled:opacity-50"
            >
              ← Previous
            </button>

            {currentStep === totalPositions - 1 ? (
              <Button
                onClick={open}
                disabled={!hasCompleted(currentPosition.id)}
                className="px-6 py-2 rounded-lg"
              >
                Review Ballot
              </Button>
            ) : (
              <button
                onClick={next}
                disabled={!hasCompleted(currentPosition.id)}
                className="px-6 py-2 rounded-lg bg-primary text-white disabled:opacity-50"
              >
                Next →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoteComponent;
