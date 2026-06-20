import React from "react";

const JoinVotePage = () => {
  return (
    <div className="max-w-md mx-auto  p-4 w-full h-full bg-white rounded-md">
      <div className="mb-3">
        <h1 className="text-2xl font-semibold mb-2">Join a vote</h1>
        <p className="text-sm text-text-color2">
          Kindly select the vote you want to join.
        </p>
      </div>
      <div className="">
        <div className="rounded-md space-y-3">
          <div className="flex items-center p-3 rounded-md gap-8 bg-sec-col">
            <img
              src={"/img-2.jpg"}
              className="size-10 rounded-full object-cover"
            />
            <p className="font-semibold">Presendential Election</p>
          </div>
          <div className="flex items-center p-3 rounded-md gap-8 bg-sec-col">
            <img
              src={"/img-2.jpg"}
              className="size-10 rounded-full object-cover"
            />
            <p className="font-semibold">Presendential Election</p>
          </div>
          <div className="flex items-center p-3 rounded-md gap-8 bg-sec-col">
            <img
              src={"/img-2.jpg"}
              className="size-10 rounded-full object-cover"
            />
            <p className="font-semibold">Presendential Election</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinVotePage;
