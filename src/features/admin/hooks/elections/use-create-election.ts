"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { electionKeys } from "./query-keys";
// NOTE: swap this import for your project's existing toast/notification hook.
import { client } from "@/lib/rpc";
import { CreateElectionInput } from "../../type";
import { toast } from "sonner";

export function useCreateElection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateElectionInput) => createElection(input),
    onSuccess: (election) => {
      queryClient.invalidateQueries({ queryKey: electionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: electionKeys.stats() });
      toast(election.data.status === "DRAFT" ? "Draft saved" : "Election created", {
        description: `${election.data.title} was ${election.data.status === "DRAFT" ? "saved as a draft" : "created successfully"}.`,
        position: "bottom-right",
        classNames: {
          content: "flex flex-col gap-2",
        },
        style: {
          "--border-radius": "calc(var(--radius)  + 4px)",
        } as React.CSSProperties,
      });
    },
    onError: (error) => {
      toast("Couldn't create election", {
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

async function createElection(data1: CreateElectionInput) {
  const response = await client.api.admin.elections["$post"]({
    json: {
      election: {
        title: data1.election.title,
        description: data1.election.description,
        coverImage: data1.election.coverImage,
        academicSessionId: data1.election.academicSessionId,
        schedule: data1.election.schedule,
      },
      positions: data1.positions.map((p) => ({ id: p.id, name: p.name })),
      scope: data1.scope,
      saveAsDraft: data1.saveAsDraft
    }
  })
  const data = await response.json()
  if (!data.success) {
    // @ts-ignore
    throw new Error(data.error)
  }
  return data
}