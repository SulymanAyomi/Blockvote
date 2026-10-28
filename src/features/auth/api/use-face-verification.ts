import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";
import { unwrap } from "@/lib/api";

type ResponseType = InferResponseType<typeof client.api.register["verify-face"]["$post"], 200>
type RequestType = InferRequestType<typeof client.api.register["verify-face"]["$post"]>


export const useFaceVerification = () => {
    const queryClient = useQueryClient()
    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async ({ json }) => {
            return unwrap(await client.api.register["verify-face"]["$post"]({ json }))

        },
    })
    return mutation
}