import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { InferResponseType } from "hono";



export const useGetActivities = () => {
    const query = useQuery({
        queryKey: ["election-activities"],
        queryFn: async () => {
            const response = await client.api.election.activities["$get"]()
            if (!response.ok) {
                throw new Error("Something went wrong")
            }
            const { data } = await response.json()
            return data
        }
    })
    return query
}
type ElectionActiivityType = InferResponseType<typeof client.api.election.activities["$get"], 200>

export type elType = ElectionActiivityType["data"][0]