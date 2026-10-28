import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { unwrap } from "@/lib/api";


interface useGetElectionProps {
    electionId: string;
}

export const useGetElection = ({ electionId }: useGetElectionProps) => {
    const query = useQuery({
        queryKey: ["election", electionId],
        queryFn: async () => unwrap(await client.api.election[":electionId"]["$get"]({
            param: {
                electionId
            }
        }))
    })
    return query
}