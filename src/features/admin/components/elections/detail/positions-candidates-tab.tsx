import Link from "next/link";
import type {
  ElectionDetailPositionType,
  ElectionDetailType,
} from "../../../type";
import { useElectionId } from "@/features/elections/hooks/use-get-election-id";

export function PositionsCandidatesTab({
  positions,
}: {
  positions: ElectionDetailPositionType;
}) {
  const electionId = useElectionId();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-900">
          Positions & Candidates
        </h3>
        <div className="flex gap-2">
          <Link
            href={`/admin/elections/${electionId}/positions`}
            className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50"
          >
            Manage Positions
          </Link>
          <Link
            href={`/admin/elections/${electionId}/candidates`}
            className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50"
          >
            Manage Candidates
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        {positions.map((position) => {
          return (
            <div
              key={position.id}
              className="rounded-lg border border-neutral-200 p-4"
            >
              <div className="flex items-baseline justify-between">
                <p className="text-sm font-semibold text-neutral-900">
                  {position.position.name}
                </p>
                <p className="text-xs text-neutral-500">
                  {/* {position.numberOfWinners} winner
                  {position.numberOfWinners === 1 ? "" : "s"} */}
                </p>
              </div>
              {/* {position.description && (
                <p className="mt-0.5 text-xs text-neutral-500">
                  {position.description}
                </p>
              )} */}
              <ul className="mt-2 flex flex-wrap gap-2">
                {position.candidates.map((c, i) => (
                  <li
                    key={i}
                    className="rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs text-neutral-700"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <img
                        src={c.voter.imageUrl ?? ""}
                        className="h-12 w-12 rounded-full"
                      />
                      <p className="text-xs">{c.voter.fullName}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
