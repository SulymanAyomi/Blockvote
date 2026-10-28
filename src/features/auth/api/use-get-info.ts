import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";
import { unwrap } from "@/lib/api";


interface useGetInfoProps {
    regSessionId: string;
}

export const useGetInfo = ({ regSessionId }: useGetInfoProps) => {
    const query = useQuery({
        queryKey: ["info"],
        queryFn: async () => unwrap(await client.api.register["confirm-info"]["$get"]({
            query: {
                regSessionId
            }
        }))
    })
    return query
}