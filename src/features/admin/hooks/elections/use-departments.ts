"use client";

import { useQuery } from "@tanstack/react-query";
// import { fetchElection } from "../../api/api/elections";
import { electionKeys } from "./query-keys";
import { client } from "@/lib/rpc";
import { InferResponseType } from "hono";



export function useDepartments(facultyId: string | undefined) {
    return useQuery({
        queryKey: ["departments", facultyId],
        queryFn: () => fetchDepartments(facultyId as string),
    });
}

export type fetchProjectDetailType = InferResponseType<typeof client.api.admin.elections[":electionId"]["$get"], 200>


async function fetchDepartments(facultyId: string) {
    const response = await client.api.admin.departments["$get"]({
        query: {
            facultyId
        }
    })

    if (!response.ok) {
        throw new Error("Something went wrong")
    }

    const { data } = await response.json()
    return data
}