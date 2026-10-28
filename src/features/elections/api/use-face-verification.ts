import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { shouldResync, unwrap } from "@/lib/api";

type ResponseType = InferResponseType<typeof client.api.election["voting-session"]["face-verify"]["$post"], 200>
type RequestType = InferRequestType<typeof client.api.election["voting-session"]["face-verify"]["$post"]>
export type useFaceVerificationMutationType = ResponseType

export const useFaceVerification = () => {
    const queryClient = useQueryClient()
    const router = useRouter()


    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async ({ json }) => {
            return unwrap(await client.api.election["voting-session"]["face-verify"]["$post"]({ json }))

        },
        onError: (error) => {
            if (shouldResync(error)) {
                queryClient.invalidateQueries({ queryKey: ["election-eligbility"] }); // must match your useQuery key exactly
                router.refresh();
            }

        },
    })
    return mutation
}