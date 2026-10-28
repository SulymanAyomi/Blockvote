import { AlertTriangle, FilterX, Plus, Vote } from "lucide-react";

interface EmptyStateProps {
  onCreateElection: () => void;
}

/** No elections exist at all yet (unfiltered). */
export function ElectionsEmptyState({ onCreateElection }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
        <Vote className="h-6 w-6 text-neutral-500" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-neutral-900">No elections yet</h3>
      <p className="mt-1 max-w-sm text-sm text-neutral-500">
        Create your first election to begin managing the school&apos;s voting process.
      </p>
      <button
        type="button"
        onClick={onCreateElection}
        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        Create Election
      </button>
    </div>
  );
}

interface NoResultsStateProps {
  onClearFilters: () => void;
}

/** Elections exist, but the current filters/search matched none. */
export function ElectionsNoResultsState({ onClearFilters }: NoResultsStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
        <FilterX className="h-6 w-6 text-neutral-500" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-neutral-900">No elections match your filters</h3>
      <p className="mt-1 max-w-sm text-sm text-neutral-500">
        Try adjusting your search or filters to find what you&apos;re looking for.
      </p>
      <button
        type="button"
        onClick={onClearFilters}
        className="mt-5 inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
      >
        Clear Filters
      </button>
    </div>
  );
}

interface ErrorStateProps {
  onRetry: () => void;
  message?: string;
}

export function ElectionsErrorState({ onRetry, message }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 px-6 py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
        <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-red-900">Unable to load elections</h3>
      <p className="mt-1 max-w-sm text-sm text-red-700">
        {message ?? "Something went wrong while fetching elections. Please try again."}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
      >
        Try Again
      </button>
    </div>
  );
}
