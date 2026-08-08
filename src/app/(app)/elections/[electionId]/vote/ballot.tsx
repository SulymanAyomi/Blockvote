import React from "react";
import VoteComponent from "./vote-component";
import { useVote } from "@/context/vote-context";
import ReviewBallotClient from "./review";

const BallotComponent = () => {
  const { openReview } = useVote();

  return <>{openReview ? <ReviewBallotClient /> : <VoteComponent />}</>;
};

export default BallotComponent;
