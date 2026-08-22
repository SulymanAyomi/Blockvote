import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";
import { InferResponseType } from "hono";


interface useGetCandidateProps {
    electionId: string;
}

export type useGetCandidateResponseType = InferResponseType<typeof client.api.election[":electionId"]["candidates"][":candidateId"]["$get"], 200>

export const useGetAllVoters = ({ electionId }: useGetCandidateProps) => {
    const query = useQuery({
        queryKey: ["all-voters", electionId],
        queryFn: async () => {
            const response = await client.api.candidate[":electionId"]["all"]["$get"]({
                param: {
                    electionId,
                }
            })

            if (!response.ok) {
                throw new Error("Something went wrong")
            }

            const { data } = await response.json()
            return data
        }
    })
    return query
}