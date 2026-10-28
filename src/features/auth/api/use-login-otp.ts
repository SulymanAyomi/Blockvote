import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { unwrap } from "@/lib/api";

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
                const err = data.error as string
                throw new Error(err)
            }
            return data
        },
        onSuccess: async (data) => {
            if (data.success) {
                toast.success("Welcome!!!");
                router.push(`/dashboard`)
            }
        }
    })
    return mutation
}