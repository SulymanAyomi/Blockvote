"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { electionKeys } from "./query-keys";
import { client } from "@/lib/rpc";
import { toast } from "sonner";

/** Deletes a draft election outright. Only valid for status === "draft". */
export function useDeleteElection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteElection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: electionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: electionKeys.stats() });
      toast.success("Draft deleted");
    },
    onError: (error) => {
      toast("Couldn't delete election", {
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

/** Cancels a scheduled or active election (soft, reversible-by-policy action). */
export function useCancelElection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelElection,
    onSuccess: (election) => {
      queryClient.invalidateQueries({ queryKey: electionKeys.detail(election.data.id) });
      queryClient.invalidateQueries({ queryKey: electionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: electionKeys.stats() });
      toast.success(`Election ${election.data.title} cancelled.`);
    },
    onError: (error) => {
      toast("Couldn't cancel election", {
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

/** Archives a completed election. */
export function useArchiveElection() {
  const queryClient = useQueryClient();
  // const { toast } = useToast();

  return useMutation({
    mutationFn: archiveElection,
    onSuccess: (election) => {
      queryClient.invalidateQueries({ queryKey: electionKeys.detail(election.data.id) });
      queryClient.invalidateQueries({ queryKey: electionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: electionKeys.stats() });
      toast.success(`Election ${election.data.title} archived.`);
    },
    onError: (error) => {
      toast("Couldn't archive election", {
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

async function deleteElection(electionId: string) {
  const response = await client.api.admin.elections[":electionId"]["$delete"]({
    param: {
      electionId,
    },

  })
  const data = await response.json()
  if (!data.success) {
    // @ts-ignore
    throw new Error(data.error)
  }
  return data
}

async function cancelElection(electionId: string) {
  const response = await client.api.admin.elections[":elctionId"]["cancel"]["$post"]({
    param: {
      electionId,
    },

  })
  const data = await response.json()
  if (!data.success) {
    // @ts-ignore
    throw new Error(data.error)
  }
  return data
}

async function archiveElection(electionId: string) {
  const response = await client.api.admin.elections[":elctionId"]["archive"]["$post"]({
    param: {
      electionId,
    },

  })
  const data = await response.json()
  if (!data.success) {
    // @ts-ignore
    throw new Error(data.error)
  }
  return data
}