import Link from "next/link";
import { ArrowLeft } from "lucide-react";
// import { ManageEligibilityView } from "@/features/admin/components/elections/detail/manage-eligibility-view";

export const metadata = { title: "Manage Eligibility — Admin" };

export default function ManageEligibilityPage({
  params,
}: {
  params: { electionId: string };
}) {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <Link
        href={`/admin/elections/${params.electionId}`}
        className="inline-flex items-center gap-1.5 text-sm text-neutral-500 transition hover:text-neutral-900"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to Election
      </Link>
      <h1 className="text-xl font-semibold tracking-tight text-neutral-900">
        Manage Eligibility
      </h1>
      {/* <ManageEligibilityView electionId={params.electionId} /> */}
    </div>
  );
}
