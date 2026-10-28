import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { InferResponseType } from "hono";
import { unwrap } from "@/lib/api";



export const useGetElectionResults = ({ electionId }: { electionId: string }) => {
    const query = useQuery({
        queryKey: ["election-result", electionId],
        queryFn: async () => unwrap(await client.api.election[":electionId"]["results"]["$get"]({
            param: {
                electionId
            }
        }))
    })
    return query
}
