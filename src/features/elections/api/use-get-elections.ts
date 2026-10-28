import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";
import { unwrap } from "@/lib/api";

interface useGetElectionsProps {
    status?: string;
    page: string;
    limit: string
}
export const useGetElections = (filter: useGetElectionsProps) => {
    const query = useQuery({
        queryKey: ["elections", filter],
        queryFn: async () => unwrap(await client.api.election.all["$get"]({
            query: {
                ...filter
            }
        }))
    })
    return query
}