import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";
import { InferResponseType } from "hono";


interface useGetCandidateProps {
    electionId: string;
    candidateId: string;
}

export type useGetCandidateResponseType = InferResponseType<typeof client.api.election[":electionId"]["candidates"][":candidateId"]["$get"], 200>

export const useGetCandidate = ({ electionId, candidateId }: useGetCandidateProps) => {
    const query = useQuery({
        queryKey: ["election-candidate", electionId, candidateId],
        queryFn: async () => {
            const response = await client.api.election[":electionId"]["candidates"][":candidateId"]["$get"]({
                param: {
                    electionId,
                    candidateId
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