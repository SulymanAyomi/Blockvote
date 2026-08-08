"use client";

import { useParams, useRouter } from "next/navigation";
import SingleVoteClientPage from "./vote-client";
import { useElectionId } from "@/features/elections/hooks/use-get-election-id";
import { useVotingContext } from "@/context/voting-context";

const SingleVotePage = () => {
  const router = useRouter();
  const electionId = useElectionId();
  const { anonymousToken, votingSessionId } = useVotingContext();

  if (!anonymousToken || !votingSessionId) {
    router.replace(`/elections/${electionId}/join`);
  }

  return (
    <div className="max-w-3xl h-full mx-auto bg-white rounded-md text-text-color mb-2">
      <SingleVoteClientPage />
    </div>
  );
};

export default SingleVotePage;
