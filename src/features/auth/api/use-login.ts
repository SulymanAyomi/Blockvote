import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { unwrap } from "@/lib/api";

type ResponseType = InferResponseType<typeof client.api.register["login"]["$post"]>
type RequestType = InferRequestType<typeof client.api.register["login"]["$post"]>


export const useLogin = () => {
    const router = useRouter()

    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async ({ json }) => unwrap(await client.api.register["login"]["$post"]({ json })),
        onSuccess: async (data) => {
            if (data.success) {
                toast.success(`Your otp is ${data.data.otp}`, {
                    duration: 30000
                })
                router.push(`/verification?vid=${data.data.vid}`)
            }
        }

    })
    return mutation
}