"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { electionKeys } from "./query-keys";
import { useToast } from "../use-toast";

export function useUpdateElection() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // return useMutation({
  //   mutationFn: updateElection,
  //   onSuccess: (election) => {
  //     queryClient.invalidateQueries({ queryKey: electionKeys.detail(election.id) });
  //     queryClient.invalidateQueries({ queryKey: electionKeys.lists() });
  //     toast({
  //       title: "Election updated",
  //       description: `${election.name} was updated successfully.`,
  //       variant: "success",
  //     });
  //   },
  //   onError: (error) => {
  //     toast({
  //       title: "Couldn't update election",
  //       description: error instanceof Error ? error.message : "Please try again.",
  //       variant: "destructive",
  //     });
  //   },
  // });
}
