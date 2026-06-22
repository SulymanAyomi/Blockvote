"use client";

import { useState } from "react";
import CompleteVoteComponent from "./complete-vote";
import VoteComponent from "./vote-component";

const SingleVotePage = () => {
  const [completeVote, setCompleteVote] = useState(false);
  const changeCompleteVote = () => setCompleteVote(true);
  return (
    <div className="max-w-3xl h-full mx-auto bg-white rounded-md text-text-color mb-2">
      {!completeVote ? (
        <VoteComponent changeCompleteVote={changeCompleteVote} />
      ) : (
        <CompleteVoteComponent />
      )}
    </div>
  );
};

export default SingleVotePage;
