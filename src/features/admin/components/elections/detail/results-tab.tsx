import { Loader2, Lock } from "lucide-react";
import { useElectionResults } from "@/features/admin/hooks/elections/use-election";
import { useElectionId } from "@/features/elections/hooks/use-get-election-id";

export function ResultsTab() {
  const electionId = useElectionId();
  const { data, isLoading, isError, refetch } = useElectionResults(electionId);

  if (isLoading) {
    return (
      <div className="flex gap-2 items-center justify-center">
        <Loader2
          className="h-6 w-6 animate-spin text-primary-col"
          aria-hidden="true"
        />
        <p className="text-sm font-medium text-neutral-700">Fetching results</p>
      </div>
    );
  }
  // const canShowResults = data?.status === "COMPLETED";

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-neutral-300 p-10 text-center">
        <Lock className="mb-3 h-6 w-6 text-neutral-400" aria-hidden="true" />
        <p className="text-sm font-medium text-neutral-700">
          Results are not yet available
        </p>
        <p className="mt-1 max-w-sm text-xs text-neutral-500">
          Per this election&apos;s result-visibility rules, results are shown
          once voting has closed. Only aggregate vote counts will ever be
          displayed — never tied to individual voter identity.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.positions.map((position) => (
        <div
          key={position.positionId}
          className="rounded-lg border border-neutral-200 p-4"
        >
          <p className="text-sm font-semibold text-neutral-900">
            {position.positionName}
          </p>
          <p className="mt-1 text-xs text-neutral-500">{position.totalVotes}</p>
        </div>
      ))}
    </div>
  );
}
