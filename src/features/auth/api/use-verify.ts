import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.register["verify-nin"]["$post"], 200>
type RequestType = InferRequestType<typeof client.api.register["verify-nin"]["$post"]>


export const useVerifyNin = () => {

    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async ({ json }) => {
            const response = await client.api.register["verify-nin"]["$post"]({ json })
            const data = await response.json()
            if (!data.success) {
                let err = data.error as string
                if (err == "INTERNAL_ERROR") err = "Something is wrong. Try again";
                throw new Error(err)
            }
            return data
        },
        onSuccess: (data) => {
            const otp = data.data.otp
            if (otp) {
                toast.success(`Your otp is ${otp}.`, {
                    duration: 30000
                })
            }
        }
    })
    return mutation
}