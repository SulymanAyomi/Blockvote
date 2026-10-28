"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import type {
  ElectionFilters,
  ElectionScope,
  ElectionScopeType,
} from "../../type";
import { useDebouncedValue } from "../../hooks/use-debounced-value";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface ElectionFiltersToolbarProps {
  filters: ElectionFilters;
  onChange: <K extends keyof ElectionFilters>(
    key: K,
    value: ElectionFilters[K],
  ) => void;
  onClear: () => void;
  hasActiveFilters: boolean;
}

const selectClass =
  "rounded-lg border border-primary-col bg-white px-3 py-2 text-sm text-neutral-700 transition focus:primary-col focus:outline-none focus:ring-2 focus:ring-primary-col";

export function ElectionFiltersToolbar({
  filters,
  onChange,
  onClear,
  hasActiveFilters,
}: ElectionFiltersToolbarProps) {
  // Local input state is debounced before being pushed into `filters.search`,
  // since search is treated as server-side (see hooks/elections/use-elections.ts).
  const [searchInput, setSearchInput] = useState(filters.search);
  const debouncedSearch = useDebouncedValue(searchInput, 350);

  useEffect(() => {
    if (debouncedSearch !== filters.search) onChange("search", debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  useEffect(() => {
    // Keep local input in sync if filters are cleared externally.
    if (filters.search === "" && searchInput !== "") setSearchInput("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search]);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search elections..."
            aria-label="Search elections"
            className="w-full rounded-lg border border-neutral-300 bg-slate-50 py-2 pl-9 pr-3 text-sm text-neutral-900 placeholder:text-neutral-400"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            aria-label="Filter by status"
            value={filters.status}
            onChange={(e) => {
              const v =
                e.target.value === "all"
                  ? undefined
                  : (e.target.value as ElectionFilters["status"]);
              onChange("status", v);
            }}
            className={selectClass}
          >
            <option value={"all"}>All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="ARCHIVED">Archived</option>
          </select>
          <select
            aria-label="Filter by election type"
            value={filters.scope}
            onChange={(e) => {
              const v =
                e.target.value === "all"
                  ? undefined
                  : (e.target.value as ElectionFilters["scope"]);
              onChange("scope", v);
            }}
            className={selectClass}
          >
            <option value="all">All Types</option>
            <option value="UNIVERSITY">University</option>
            <option value="FACULTY">Faculty</option>
            <option value="DEPARTMENT">Department</option>
          </select>

          {/* <select
            aria-label="Filter by scope"
            value={filters.scope}
            onChange={(e) =>
              onChange("scope", e.target.value as ElectionFilters["scope"])
            }
            className={selectClass}
          >
            <option value="all">All Scopes</option>
            <option value="school">School</option>
            <option value="faculty">Faculty</option>
            <option value="department">Department</option>
          </select> */}

          <select
            aria-label="Filter by date"
            value={filters.datePreset}
            onChange={(e) => {
              const v =
                e.target.value === "all"
                  ? undefined
                  : (e.target.value as ElectionFilters["datePreset"]);
              onChange("datePreset", v);
            }}
            className={selectClass}
          >
            <option value="all">All Dates</option>
            <option value="TODAY">Today</option>
            <option value="THIS_WEEK">This Week</option>
            <option value="THIS_MONTH">This Month</option>
            <option value="UPCOMING">Upcoming</option>
            <option value="CUSTOM">Custom Range</option>
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                onClear();
              }}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition hover:bg-neutral-50 border-[#2454E8] bg-[#EEF2FF] text-[#16308F]",
              )}
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {filters.datePreset === "CUSTOM" && (
        <div className="flex flex-wrap items-center gap-2 border-t border-neutral-100 pt-3">
          <label
            className="text-xs font-medium text-neutral-500"
            htmlFor="date-from"
          >
            From
          </label>
          <input
            id="date-from"
            type="date"
            value={filters.dateFrom ?? ""}
            onChange={(e) => onChange("dateFrom", e.target.value)}
            className={selectClass}
          />
          <label
            className="text-xs font-medium text-neutral-500"
            htmlFor="date-to"
          >
            To
          </label>
          <input
            id="date-to"
            type="date"
            value={filters.dateTo ?? ""}
            onChange={(e) => onChange("dateTo", e.target.value)}
            className={selectClass}
          />
        </div>
      )}
    </div>
  );
}
