import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<typeof client.api.register["confirm-info"]["$post"]>
type RequestType = InferRequestType<typeof client.api.register["confirm-info"]["$post"]>


export const useInfoConfirmation = () => {

    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async ({ json }) => {
            const response = await client.api.register["confirm-info"]["$post"]({ json })
            const data = await response.json()
            if (!response.ok) {
                // @ts-ignore
                throw new Error("Something went wrong")
            }
            return data
        },
    })
    return mutation
}