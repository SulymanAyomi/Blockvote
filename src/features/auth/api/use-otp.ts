import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<typeof client.api.register["verify-otp"]["$post"]>
type RequestType = InferRequestType<typeof client.api.register["verify-otp"]["$post"]>


export const useVerifyOtp = () => {

    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async ({ json }) => {
            const response = await client.api.register["verify-otp"]["$post"]({ json })
            const data = await response.json()
            if (!data.success) {
                let err = data.error as string
                if (err == "INTERNAL_ERROR") err = "Something is wrong. Try again";
                throw new Error(err)
            }
            return data
        },
    })
    return mutation
}