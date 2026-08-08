import { Button } from "@/components/ui/button";
import { useVote } from "@/context/vote-context";
import { useVotingContext } from "@/context/voting-context";
import { useSubmitBallot } from "@/features/elections/api/use-submit-ballot";
import { useElectionId } from "@/features/elections/hooks/use-get-election-id";
import { useConfirm } from "@/hooks/use-confirm";

import React, { useState } from "react";
import { toast } from "sonner";
import CompleteVoteComponent from "./complete-vote";
import { LoaderCircle } from "lucide-react";
import { error } from "console";

const ReviewBallotClient = () => {
  const electionId = useElectionId();
  const { election, ballot, positions, goTo, submit, close } = useVote();
  const { anonymousToken, votingSessionId } = useVotingContext();
  const [complete, setComplete] = useState(false);
  const [ConfirmDialog, confirm] = useConfirm(
    "Confirmation",
    "Are you sure you want to submit your ballot. Your vote cannot be changed.",
    "default",
    "text-primary-col font-bold",
    "text-black",
  );

  const { mutate, isPending } = useSubmitBallot();

  const handleEdit = (index: number) => {
    goTo(index);
    close();
  };

  const handleSubmit = async () => {
    const ok = await confirm();
    if (!ok) return;
    const payload = submit();
    mutate(
      {
        json: {
          ballot: payload.votes,
          anonymousToken,
          votingSessionId,
        },
        param: {
          electionId,
        },
      },
      {
        onSuccess: (data) => {
          console.log(data);
          toast.success("Your vote has been recorded successfully!");
          setComplete(true);
        },
        onError: (error) => {
          console.log(error);
        },
      },
    );
  };

  if (complete) {
    return <CompleteVoteComponent />;
  }
  return (
    <div className="p-4 w-full h-full bg-white rounded-md">
      <ConfirmDialog />

      <div className="mb-3 space-y-3">
        <h1 className="text-2xl font-semibold mb-3">{election.title}</h1>
      </div>
      <h1 className="text-xl font-bold">Review your Ballot</h1>
      <p className="text-muted-foreground mt-2">
        Please verify your ballot before submitting.
      </p>
      <div className="mt-6 space-y-4 ">
        <div className="rounded-md space-y-3 grid gap-4 grid-cols-2 md:grid-cols-3">
          {positions.map((position, index) => {
            const candidate = position.candidates.find(
              (c) => c.id == ballot[position.id],
            );

            return (
              <div
                key={position.id}
                className="flex flex-col p-3 rounded-md gap-4 border shadow-sm"
              >
                <p className="font-semibold">{position.position.name}</p>
                <div>
                  <div className="flex-1/3 w-full h-20 border rounded-sm bg-yellow-100">
                    <img
                      src={candidate?.voter.imageUrl!}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex flex-2/3 flex-col space-y-0">
                    <div>
                      <p className="font-semibold mb-2!">
                        {candidate?.voter.fullName}
                      </p>
                      <p className="mb-2!">Computer science</p>
                      <p className="text-muted-foreground text-xs mb-2">
                        {candidate?.voter.level} level
                      </p>
                    </div>
                    <Button
                      size={"xs"}
                      className="w-fit"
                      onClick={() => handleEdit(index)}
                      variant={"outline"}
                    >
                      Edit{" "}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex justify-between mt-10">
        <Button
          variant={"outline"}
          className="px-6 py-2 border rounded-lg disabled:opacity-50"
          onClick={() => close()}
        >
          Back
        </Button>
        <Button
          className="px-6 py-2 "
          onClick={handleSubmit}
          disabled={isPending}
        >
          Submit {isPending && <LoaderCircle className="animate-spin" />}
        </Button>
      </div>
    </div>
  );
};

export default ReviewBallotClient;
