"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { electionKeys } from "./query-keys";
import { useToast } from "../use-toast";

export function useUpdateEligibility() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  // return useMutation({
  //   mutationFn: updateEligibility,
  //   onSuccess: (election) => {
  //     queryClient.invalidateQueries({ queryKey: electionKeys.detail(election.id) });
  //     toast({ title: "Eligibility rules updated", variant: "success" });
  //   },
  //   onError: (error) => {
  //     toast({
  //       title: "Couldn't update eligibility",
  //       description: error instanceof Error ? error.message : "Please try again.",
  //       variant: "destructive",
  //     });
  //   },
  // });
}
