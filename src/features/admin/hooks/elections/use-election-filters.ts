"use client";

import { useCallback, useMemo, useState } from "react";
import { DEFAULT_ELECTION_FILTERS, type ElectionFilters } from "../../type";

/**
 * Local UI state for the filter toolbar. This intentionally does NOT use
 * React Query — filters are ephemeral UI state, not server state. The
 * resulting `filters` object is shaped to be passed straight through as
 * API query parameters (see `types/election.ts#ElectionFilters`).
 *
 * If/when this should be reflected in the URL (e.g. via `useSearchParams`
 * + `router.replace`), that concern can be layered on top of this hook
 * without touching any consuming component.
 */
export function useElectionFilters(initial: Partial<ElectionFilters> = {}) {
  const [filters, setFilters] = useState<ElectionFilters>({
    ...DEFAULT_ELECTION_FILTERS,
    ...initial,
  });

  const setFilter = useCallback(
    <K extends keyof ElectionFilters>(key: K, value: ElectionFilters[K]) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value,
        // Any filter change other than pagination itself resets to page 1.
        page: key === "page" ? (value as string) : "1",
      }));
    },
    []
  );

  const clearFilters = useCallback(() => setFilters(DEFAULT_ELECTION_FILTERS), []);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.search?.trim() !== "" ||
      filters.status !== undefined ||
      filters.scope !== undefined ||
      filters.datePreset !== undefined
    );
  }, [filters]);

  return { filters, setFilter, setFilters, clearFilters, hasActiveFilters };
}
