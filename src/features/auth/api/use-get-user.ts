import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";
import { unwrap } from "@/lib/api";




export const useGetUserInformation = () => {
    const query = useQuery({
        queryKey: ["user-info"],
        queryFn: async () => unwrap(await client.api.register["user"]["$get"]())
    })
    return query
}