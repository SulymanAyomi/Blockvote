import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type ResponseType = InferResponseType<typeof client.api.register["set-password"]["$post"]>
type RequestType = InferRequestType<typeof client.api.register["set-password"]["$post"]>


export const usePassword = () => {
    const queryClient = useQueryClient()

    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async ({ json }) => {
            const response = await client.api.register["set-password"]["$post"]({ json })
            const data = await response.json()
            console.log(data)
            if (!data.success) {

                // @ts-ignore
                throw new Error(data.error)
            }
            return data
        },
    })
    return mutation
}