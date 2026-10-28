import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { InferResponseType } from "hono";
import { unwrap } from "@/lib/api";

interface useGetVoteConfirmationProps {
  electionId: string;
}

export const useGetVoteConfirmation = ({
  electionId,
}: useGetVoteConfirmationProps) => {
  const query = useQuery({
    queryKey: ["confirmation", electionId],
    queryFn: async () =>
      unwrap(
        await client.api.election[":electionId"]["confirmation"]["$get"]({
          param: { electionId },
        }),
      ),
  });
  return query;
};
export type DashboardType = InferResponseType<
  (typeof client.api.election.dashboard)["$get"],
  200
>;
