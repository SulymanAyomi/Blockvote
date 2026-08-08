import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type ResponseType = InferResponseType<typeof client.api.register["verify-nin"]["$post"]>
type RequestType = InferRequestType<typeof client.api.register["verify-nin"]["$post"]>


export const useVerifyNin = () => {
    const queryClient = useQueryClient()

    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async ({ json }) => {
            console.log("i rannn")
            const response = await client.api.register["verify-nin"]["$post"]({ json })
            const data = await response.json()
            console.log("data", data)
            if (!data.success) {
                // if (response.status == 500) {
                //     throw new Error("")
                // }
                // @ts-ignore
                throw new Error(data.error)
            }
            return data
        },
    })
    return mutation
}