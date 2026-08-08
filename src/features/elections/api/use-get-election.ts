import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";


interface useGetElectionProps {
    electionId: string;
}

export const useGetElection = ({ electionId }: useGetElectionProps) => {
    const query = useQuery({
        queryKey: ["election", electionId],
        queryFn: async () => {
            const response = await client.api.election[":electionId"]["$get"]({
                param: {
                    electionId
                }
            })

            if (!response.ok) {
                throw new Error("Something went wrong")
            }

            const { data } = await response.json()

            console.log("data", data)
            return data
        }
    })
    return query
}