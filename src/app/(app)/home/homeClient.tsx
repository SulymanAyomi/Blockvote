"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import React from "react";

const HomeClient = () => {
  const router = useRouter();

  return (
    <div className="relative">
      <h1 className="text-lg font-semibold">Good Afternoon, John Doe</h1>
      <div className="w-full text-center flex flex-col items-center justify-center rounded-md">
        <img src="/img-7.png" />
        <h1 className="text-2xl md:text-4xl font-extralight italic text-primary-col">
          Connect and Vote now
        </h1>
      </div>
      <div className="absolute bottom-0 w-full h-32 space-y-3 bg-sec-col p-3 rounded-sm">
        <div className="flex flex-col item-start justify-between h-full">
          <p className="text-text-color2 text-sm">What will you like to do?</p>
          <div className="flex w-full items-center justify-between">
            <Button className="" onClick={() => router.push("/create-poll")}>
              Create a Poll
            </Button>
            <Button onClick={() => router.push("/elections")}>
              Join a Vote
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeClient;
