import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { InferResponseType } from "hono";
import { unwrap } from "@/lib/api";

export const useGetAnnouncements = () => {
    const query = useQuery({
        queryKey: ["announcements"],
        queryFn: async () => unwrap(await client.api.notifications.announcement["$get"]())
    })
    return query
}
