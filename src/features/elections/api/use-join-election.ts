import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";


interface useGetInfoProps {
    regSessionId: string;
}

export const useGetElections = () => {
    const query = useQuery({
        queryKey: ["elections"],
        queryFn: async () => {
            console.log("I rannnnnn")
            const response = await client.api.election.ongoing["$get"]({

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