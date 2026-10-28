import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { InferResponseType } from "hono";
import { unwrap } from "@/lib/api";



export const useGetDashboard = () => {
    const query = useQuery({
        queryKey: ["dashboard"],
        queryFn: async () => {
            return unwrap(await client.api.election.dashboard["$get"]())

        }
    })
    return query
}
export type DashboardType = InferResponseType<typeof client.api.election.dashboard["$get"], 200>
