import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type ResponseType = InferResponseType<typeof client.api.election[":electionId"]["join"]["$post"]>
type RequestType = InferRequestType<typeof client.api.election[":electionId"]["join"]["$post"]>


export const useElectionVerification = () => {

    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async ({ param }) => {
            const response = await client.api.election[":electionId"]["join"]["$post"]({ param })
            const data = await response.json()
            if (!data.success) {
                // if (response.status == 500) {
                //     throw new Error("")
                // }
                throw new Error(data.error)
            }
            return data
        },
    })
    return mutation
}