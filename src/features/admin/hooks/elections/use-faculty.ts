"use client";

import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";



export function useFaculty() {
    return useQuery({
        queryKey: ["faculty"],
        queryFn: () => fetchFaculty(),
    });
}


async function fetchFaculty() {
    const response = await client.api.admin.faculty["$get"]()

    if (!response.ok) {
        throw new Error("Something went wrong")
    }

    const { data } = await response.json()
    return data
}