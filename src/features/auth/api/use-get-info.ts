import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";


interface useGetInfoProps {
    regSessionId: string;
}

export const useGetInfo = ({ regSessionId }: useGetInfoProps) => {
    const query = useQuery({
        queryKey: ["info"],
        queryFn: async () => {
            console.log("I rannnnnn")
            const response = await client.api.register["confirm-info"]["$get"]({
                query: {
                    regSessionId
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