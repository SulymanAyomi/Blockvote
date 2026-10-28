import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { InferResponseType } from "hono";
import { unwrap } from "@/lib/api";



export const useGetNotifications = () => {
    const query = useQuery({
        queryKey: ["notifications"],
        queryFn: async () => unwrap(await client.api.notifications["$get"]())
    })
    return query
}
