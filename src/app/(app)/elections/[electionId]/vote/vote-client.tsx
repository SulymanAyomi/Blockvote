"use client";

import { useState } from "react";
import CompleteVoteComponent from "./complete-vote";
import VoteComponent from "./vote-component";
import { useParams } from "next/navigation";
import { VoteProvider } from "@/context/vote-context";
import { useGetElection } from "@/features/elections/api/use-get-election";
import PageLoading from "@/app/loading";
import BallotComponent from "./ballot";

const SingleVoteClientPage = () => {
  const params = useParams();
  const electionId = params.electionId as string;
  const [completeVote, setCompleteVote] = useState(false);
  const changeCompleteVote = () => setCompleteVote(true);

  const { data: nelection, isLoading } = useGetElection({ electionId });
  const election = nelection?.data.election;
  const positions = nelection?.data.positions;

  if (isLoading) {
    return <PageLoading />;
  }

  if (!election || !positions) {
    return (
      <div className="max-w-3xl h-full mx-auto bg-white rounded-md text-text-color mb-2">
        <div className="max-w-3xl mx-auto py-10 p-4 w-full h-full bg-white rounded-md">
          No election data
        </div>
      </div>
    );
  }

  return (
    <VoteProvider election={election} positions={positions}>
      <div className="max-w-3xl h-full mx-auto bg-white rounded-md text-text-color mb-2">
        <BallotComponent />
      </div>
    </VoteProvider>
  );
};

export default SingleVoteClientPage;
