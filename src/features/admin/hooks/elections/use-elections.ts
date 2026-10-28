"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { ElectionFilters } from "../../type";
import { electionKeys } from "./query-keys";
import { client } from "@/lib/rpc";


/**
 * Fetches the filtered/paginated election list.
 * `keepPreviousData` avoids a full-table flash of loading skeletons when
 * the admin tweaks a filter — the old page stays visible until fresh data
 * arrives, with `isFetching` available to show a subtle in-place indicator.
 */
export function useElections(filters: ElectionFilters) {
  return useQuery({
    queryKey: electionKeys.list(filters),
    queryFn: () => fetchElections(filters),
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  });
}


async function fetchElections(filters: ElectionFilters) {
  const response = await client.api.admin.elections["$get"]({
    query: filters
  })

  if (!response.ok) {
    throw new Error("Something went wrong")
  }

  const { data } = await response.json()
  return data
}