import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";
import { unwrap } from "@/lib/api";

type ResponseType = InferResponseType<typeof client.api.register["set-password"]["$post"]>
type RequestType = InferRequestType<typeof client.api.register["set-password"]["$post"]>


export const usePassword = () => {
    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async ({ json }) => unwrap(await client.api.register["set-password"]["$post"]({ json }))
    })
    return mutation
}