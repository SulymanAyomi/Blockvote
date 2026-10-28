"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { CandidateFilters, ElectionFilters } from "../../type";
import { electionKeys } from "./query-keys";
import { client } from "@/lib/rpc";
import { listCandidatesQuery } from "../../schema";


/**
 * Fetches the filtered/paginated election list.
 * `keepPreviousData` avoids a full-table flash of loading skeletons when
 * the admin tweaks a filter — the old page stays visible until fresh data
 * arrives, with `isFetching` available to show a subtle in-place indicator.
 */
export function useCandidates(filters: CandidateFilters) {
    return useQuery({
        queryKey: ["candidates", filters],
        queryFn: () => fetchCandidates(filters),
        placeholderData: keepPreviousData,
        staleTime: 15_000,
    });
}


async function fetchCandidates(filters: CandidateFilters) {
    const response = await client.api.admin["eligbible-voters"]["$get"]({
        query: filters
    })

    if (!response.ok) {
        throw new Error("Something went wrong")
    }

    const { data } = await response.json()
    return data
}