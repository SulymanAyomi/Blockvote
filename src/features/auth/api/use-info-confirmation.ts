import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";
import { unwrap } from "@/lib/api";

type ResponseType = InferResponseType<typeof client.api.register["confirm-info"]["$post"]>
type RequestType = InferRequestType<typeof client.api.register["confirm-info"]["$post"]>


export const useInfoConfirmation = () => {

    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async ({ json }) => unwrap(await client.api.register["confirm-info"]["$post"]({ json }))

    })
    return mutation
}