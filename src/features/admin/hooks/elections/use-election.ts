"use client";

import { useQuery } from "@tanstack/react-query";
// import { fetchElection } from "../../api/api/elections";
import { electionKeys } from "./query-keys";
import { client } from "@/lib/rpc";
import { InferResponseType } from "hono";



export function useElection(electionId: string) {
  return useQuery({
    queryKey: electionKeys.detail(electionId ?? ""),
    queryFn: () => fetchElection(electionId as string),
    enabled: Boolean(electionId),
  });
}

export function useElectionResults(electionId: string) {
  return useQuery({
    queryKey: ["admin-election-result", electionId],
    queryFn: () => fetchElectionResults(electionId as string),
    enabled: Boolean(electionId),
  });
}

export type fetchProjectDetailType = InferResponseType<typeof client.api.admin.elections[":electionId"]["$get"], 200>


async function fetchElection(electionId: string) {
  const response = await client.api.admin.elections[":electionId"]["$get"]({
    param: {
      electionId
    }
  })

  if (!response.ok) {
    throw new Error("Something went wrong")
  }

  const { data } = await response.json()
  return data
}

async function fetchElectionResults(electionId: string) {
  const response = await client.api.admin.elections[":electionId"]["results"]["$get"]({
    param: {
      electionId
    }
  })

  if (!response.ok) {
    throw new Error("Something went wrong")
  }

  const { data } = await response.json()
  return data
}