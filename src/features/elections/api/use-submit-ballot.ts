import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type ResponseType = InferResponseType<typeof client.api.election[":electionId"]["vote"]["$post"]>
type RequestType = InferRequestType<typeof client.api.election[":electionId"]["vote"]["$post"]>
export type useFaceVerificationMutationType = ResponseType

export const useSubmitBallot = () => {
    const queryClient = useQueryClient()

    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async ({ json, param }) => {
            const response = await client.api.election[":electionId"]["vote"]["$post"]({ json, param })
            const data = await response.json()
            if (!data.success) {
                const e = data.error as string
                throw new Error(e || "Something went wrong")
            }
            return data
        },
    })
    return mutation
}