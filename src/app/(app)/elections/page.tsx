import ElectionList from "@/features/elections/components/single-election";
import React from "react";

const JoinVotePage = () => {
  return (
    <div className="max-w-3xl mx-auto p-4 w-full h-full bg-white rounded-md">
      <div className="mb-3">
        <h1 className="text-2xl font-semibold mb-2">Join a vote</h1>
        <p className="text-sm text-text-color2">
          Kindly select the vote you want to join.
        </p>
      </div>
      <div className="">
        <ElectionList />
      </div>
    </div>
  );
};

export default JoinVotePage;
