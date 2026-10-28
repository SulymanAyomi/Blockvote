import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { InferRequestType, InferResponseType } from "hono";


type ResponseType = InferResponseType<typeof client.api.election[":electionId"]["authourization"]["$post"], 200>
type RequestType = InferRequestType<typeof client.api.election[":electionId"]["authourization"]["$post"]>
export type useFaceVerificationMutationType = ResponseType

export const useElectionVotingAuthourization = () => {
    const queryClient = useQueryClient()

    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async ({ param }) => {
            const response = await client.api.election[":electionId"]["authourization"]["$post"]({ param })

            const data = await response.json()
            if (!data.success) {
                const e = data.error as string
                throw new Error(e)
            }
            return data
        },
    })
    return mutation
}

export type useAuthorizationResponse = ResponseType