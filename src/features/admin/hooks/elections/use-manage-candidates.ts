"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { electionKeys } from "./query-keys";
import { client } from "@/lib/rpc";
import { toast } from "sonner";

export function useAddCandidate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ electionId, positionId, votersId }: { electionId: string; positionId: string; votersId: string[] }) => addCandidate({ electionId, positionId, votersId }),
    onSuccess: (election) => {
      queryClient.invalidateQueries({ queryKey: electionKeys.detail(election.data.electionId) });
      queryClient.invalidateQueries({ queryKey: electionKeys.lists() });
      toast.success("Candidates added");

    },
    onError: (error) => {
      toast("Couldn't add candidate", {
        description: error instanceof Error ? error.message : "Please try again.",
        position: "bottom-right",
        classNames: {
          content: "flex flex-col gap-2",
        },
        style: {
          "--border-radius": "calc(var(--radius)  + 4px)",
        } as React.CSSProperties,
      });
    },
  });
}

export function useRemoveCandidate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ electionId, positionId, candidateId }: { electionId: string; positionId: string; candidateId: string }) =>
      removeCandidate({ electionId, positionId, candidateId }),
    onSuccess: (election) => {
      queryClient.invalidateQueries({ queryKey: electionKeys.detail(election.data.electionId) });
      queryClient.invalidateQueries({ queryKey: electionKeys.lists() });
      toast.success("Candidate removed");

    },
    onError: (error) => {
      toast("Couldn't remove candidate", {
        description: error instanceof Error ? error.message : "Please try again.",
        position: "bottom-right",
        classNames: {
          content: "flex flex-col gap-2",
        },
        style: {
          "--border-radius": "calc(var(--radius)  + 4px)",
        } as React.CSSProperties,
      });

    },
  });
}

async function addCandidate({ electionId, positionId, votersId }: { electionId: string; positionId: string; votersId: string[] }) {
  const response = await client.api.admin.elections[":electionId"]["positions"][":electionPositionId"]["candidates"]["$post"]({
    param: {
      electionId,
      electionPositionId: positionId
    },
    json: {
      votersId
    }
  })
  const data = await response.json()
  if (!data.success) {
    // @ts-ignore
    throw new Error(data.error)
  }
  return data
}

async function removeCandidate({ electionId, positionId, candidateId }: { electionId: string; positionId: string; candidateId: string }) {
  const response = await client.api.admin.elections[":electionId"]["positions"][":electionPositionId"]["candidates"][":candidateId"]["$delete"]({
    param: {
      electionId,
      electionPositionId: positionId,
      candidateId
    },
  })
  const data = await response.json()
  if (!data.success) {
    // @ts-ignore
    throw new Error(data.error)
  }
  return data
}