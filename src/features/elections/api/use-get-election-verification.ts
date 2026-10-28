import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { InferRequestType, InferResponseType } from "hono";
import { unwrap } from "@/lib/api";

interface useGetElectionEligibilityProps {
    electionId: string;
}


export const useGetElectionEligibility = ({ electionId }: useGetElectionEligibilityProps) => {
    const query = useQuery({
        queryKey: ["election-eligbility", electionId],
        queryFn: async () => {
            const response = await client.api.election[":electionId"]["eligibility"]["$post"]({
                param: {
                    electionId
                }
            })

            const res = await response.json()
            if (!res.success) {
                throw new Error(res.error)
            }

            return res.data
        }
    })
    return query
}
type ResponseType = InferResponseType<typeof client.api.election[":electionId"]["eligibility"]["$post"], 200>
type RequestType = InferRequestType<typeof client.api.election[":electionId"]["eligibility"]["$post"]>
export type useFaceVerificationMutationType = ResponseType

export const useGetVottingSession = () => {
    const queryClient = useQueryClient()

    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async ({ param }) => unwrap(await client.api.election[":electionId"]["eligibility"]["$post"]({ param }))
    })
    return mutation
}

export type useGetVottingSessionResponse = ResponseType