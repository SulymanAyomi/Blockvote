"use client";
import mockPolls from "@/lib/data";
import { useRouter } from "next/navigation";
import React from "react";
import { useGetElections } from "../api/use-get-elections";
import { Loader2 } from "lucide-react";

const ElectionList = () => {
  const router = useRouter();
  const { data, isLoading } = useGetElections();
  if (isLoading) {
    return (
      <div className="w-full py-3 flex items-center justify-center">
        <Loader2 className="size-10 animate-spin text-primary-col" />
      </div>
    );
  }

  if (!data?.election) {
    return (
      <div className="w-full py-3 flex items-center justify-center">
        <p>No election available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md space-y-3 grid grid-cols-1 md:grid-cols-2 gap-4">
      {data?.election.map((election) => (
        <div
          className="flex items-center p-3 rounded-md gap-4 border shadow-sm cursor-pointer"
          onClick={() => router.push(`/elections/${election?.id}`)}
        >
          <div className="flex-1/3 w-full h-20 border rounded-sm bg-yellow-100 overflow-hidden">
            <img src={"/img-7.png"} className="w-full h-full object-cover" />
          </div>
          <p className="font-semibold">{election.title}</p>
        </div>
      ))}
    </div>
  );
};

export default ElectionList;
