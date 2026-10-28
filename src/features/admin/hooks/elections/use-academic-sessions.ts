"use client";

import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";



export function useAcademicSession() {
    return useQuery({
        queryKey: ["academic-session"],
        queryFn: () => fetchAcademicSession(),
    });
}


async function fetchAcademicSession() {
    const response = await client.api.admin["academic-sessions"]["$get"]()

    if (!response.ok) {
        throw new Error("Something went wrong")
    }

    const { data } = await response.json()
    return data
}