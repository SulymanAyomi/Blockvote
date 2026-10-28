"use client";

import { useQuery } from "@tanstack/react-query";
import { electionKeys } from "./query-keys";
import { client } from "@/lib/rpc";


export function useElectionStats() {
  return useQuery({
    queryKey: electionKeys.stats(),
    queryFn: fetchElectionStats,
    staleTime: 30_000,
  });
}

async function fetchElectionStats() {
  const response = await client.api.admin.elections.stats["$get"]()

  if (!response.ok) {
    throw new Error("Something went wrong")
  }

  const { data } = await response.json()
  return data
}