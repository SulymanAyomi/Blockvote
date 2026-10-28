"use client";

import { useQuery } from "@tanstack/react-query";
// import { fetchElection } from "../../api/api/elections";
import { electionKeys } from "./query-keys";
import { client } from "@/lib/rpc";
import { InferResponseType } from "hono";

export function useElectionPositions(id: string | undefined) {
  return useQuery({
    queryKey: ["positions", id],
    queryFn: () => fetchElectionPositions(id as string),
    enabled: Boolean(id),
  });
}

export function usePositions() {
  return useQuery({
    queryKey: ["positions"],
    queryFn: () => fetchPositions(),
  });
}

async function fetchElectionPositions(electionId: string) {
  const response = await client.api.admin.positions[":electionId"]["$get"]({
    param: {
      electionId,
    },
  });

  if (!response.ok) {
    throw new Error("Something went wrong");
  }

  const { data } = await response.json();
  return data;
}

async function fetchPositions() {
  const response = await client.api.admin.positions["$get"]();

  if (!response.ok) {
    throw new Error("Something went wrong");
  }

  const { data } = await response.json();
  return data;
}
