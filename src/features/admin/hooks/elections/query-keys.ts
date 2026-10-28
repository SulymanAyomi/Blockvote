import type { ElectionFilters } from "../../type";

/**
 * Centralized query key factory.
 *
 * Keeping this in one place means filters, invalidation, and cache reads
 * all agree on the exact shape of a key — no risk of a typo splitting the
 * cache into two entries that should have been one.
 */
export const electionKeys = {
  all: ["elections"] as const,
  lists: () => [...electionKeys.all, "list"] as const,
  list: (filters: ElectionFilters) => [...electionKeys.lists(), filters] as const,
  details: () => [...electionKeys.all, "detail"] as const,
  detail: (id: string) => [...electionKeys.details(), id] as const,
  stats: () => [...electionKeys.all, "stats"] as const,
};
