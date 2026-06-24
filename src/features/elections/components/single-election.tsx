"use client";
import mockPolls from "@/lib/data";
import { useRouter } from "next/navigation";
import React from "react";

const ElectionList = () => {
  const router = useRouter();
  const data = mockPolls;

  return (
    <div className="rounded-md space-y-3 grid grid-cols-1 md:grid-cols-2 gap-4">
      {data.map((election) => (
        <div
          className="flex items-center p-3 rounded-md gap-4 border shadow-sm cursor-pointer"
          onClick={() => router.push(`/elections/${election?.id}`)}
        >
          <div className="flex-1/3 w-full h-20 border rounded-sm bg-yellow-100 overflow-hidden">
            <img
              src={election.coverImage}
              className="w-full h-full object-cover"
            />
          </div>
          <p className="font-semibold">{election.title}</p>
        </div>
      ))}
    </div>
  );
};

export default ElectionList;
