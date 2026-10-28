"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ManagePositionsView } from "@/features/admin/components/elections/detail/manage-positions-view";
import { useElectionId } from "@/features/elections/hooks/use-get-election-id";

// export const metadata = { title: "Manage Positions — Admin" };

export default function ManagePositionsPage({
  params,
}: {
  params: { electionId: string };
}) {
  const electionId = useElectionId();

  return (
    <div className="mx-auto w-full space-y-6 px-4 py-6 pt-0 sm:px-6 lg:px-8">
      <div className="bg-primary-col text-white px-4 py-3.5 rounded-xl">
        <Link
          href={`/admin/elections/${electionId}`}
          className="inline-flex items-center gap-1.5 text-sm text-shadow-white transition hover:text-white/70"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Election
        </Link>
        <h1 className="text-xl font-semibold tracking-tight text-white">
          Manage Positions
        </h1>
      </div>

      <ManagePositionsView electionId={electionId} />
    </div>
  );
}
