"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { electionKeys } from "./query-keys";
// import { useToast } from "../use-toast";
import { client } from "@/lib/rpc";
import { toast } from "sonner";


export function useAddPosition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ electionId, positionId }: { electionId: string; positionId: string }) =>
      addPosition({ electionId, positionId }),
    onSuccess: (election) => {
      queryClient.invalidateQueries({ queryKey: electionKeys.detail(election.data.id) });
      queryClient.invalidateQueries({ queryKey: electionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ["positions", election.data.id] });
      toast.success("Position added");
    },
    onError: (error) => {
      toast("Couldn't add position", {
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

export function useRemovePosition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ electionId, positionId }: { electionId: string; positionId: string }) =>
      removePosition({ electionId, positionId }),
    onSuccess: (election) => {
      queryClient.invalidateQueries({ queryKey: electionKeys.detail(election.data.id) });
      queryClient.invalidateQueries({ queryKey: electionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ["positions", election.data.id] });
      toast.success("Position removed");
    },
    onError: (error) => {
      toast("Couldn't remove position", {
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

async function addPosition({ electionId, positionId }: { electionId: string; positionId: string }) {
  const response = await client.api.admin.elections[":electionId"]["positions"]["$post"]({
    param: {
      electionId,
    },
    json: {
      positionId
    }
  })
  const data = await response.json()
  if (!data.success) {
    // @ts-ignore
    throw new Error(data.error)
  }
  return data
}


async function removePosition({ electionId, positionId }: { electionId: string; positionId: string }) {
  const response = await client.api.admin.elections[":electionId"]["positions"][":electionPositionId"]["$delete"]({
    param: {
      electionId,
      electionPositionId: positionId
    }
  })
  const data = await response.json()
  if (!data.success) {
    // @ts-ignore
    throw new Error(data.error)
  }
  return data
}
