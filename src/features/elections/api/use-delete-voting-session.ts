"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";
import { unwrap } from "@/lib/api";

export function useDeleteVotingSession() {
  const queryClient = useQueryClient();
  const router = useRouter()

  return useMutation({
    mutationFn: async (electionId: string) => unwrap(await client.api.election[":electionId"]["voting-session"]["$delete"]({
      param: {
        electionId,
      },

    })),
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({ queryKey: ["election-eligbility", data.electionId] });
      router.refresh();
      router.push(`/elections/${data.electionId}/verify`)
    },
    onError: (error) => {
      router.refresh();
    },
  });
}



