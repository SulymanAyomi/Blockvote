import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type ResponseType = InferResponseType<typeof client.api.register["login"]["confirm-otp"]["$post"]>
type RequestType = InferRequestType<typeof client.api.register["login"]["confirm-otp"]["$post"]>


export const useVerifyLoginOtp = () => {
    const router = useRouter()
    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async ({ json }) => {
            const response = await client.api.register["login"]["confirm-otp"]["$post"]({ json })
            const data = await response.json()
            if (!data.success) {
                // if (response.status == 500) {
                //     throw new Error("")
                // }
                // @ts-ignore
                throw new Error(data.error)
            }
            return data
        },
        onSuccess: async (data) => {
            if (data.success) {
                toast.success("Welcome!!!");
                router.push(`/home`)
            }
        }
    })
    return mutation
}