import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CreateElectionWizard } from "@/features/admin/components/elections/create/create-election-wizard";

export const metadata = {
  title: "Create Election — Admin",
};
// mx-auto max-w-4xl
export default function CreateElectionPage() {
  return (
    <div className="space-y-6 py-6 pt-0">
      <div className="bg-primary-col text-white border-b border-slate-200 px-5 py-3.5 sm:px-8">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/admin/elections"
            className="inline-flex items-center gap-1.5 text-sm  transition hover:text-white/80"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Elections
          </Link>
          <h1 className="mt-2 text-xl font-semibold tracking-tight">
            Create Election
          </h1>
          <p className="mt-1 text-sm text-shadow-white">
            Configure a new election in a few guided steps.
          </p>
        </div>
      </div>

      <CreateElectionWizard />
    </div>
  );
}
