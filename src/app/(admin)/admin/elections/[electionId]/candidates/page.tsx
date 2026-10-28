import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ManageCandidatesView } from "@/features/admin/components/elections/detail/manage-candidates-view";
import { useElectionId } from "@/features/elections/hooks/use-get-election-id";

export const metadata = { title: "Manage Candidates — Admin" };

export default function ManageCandidatesPage() {
  return (
    <div
      className="mx-auto w-full space-y-6 px-4 py-6 pt-0 sm:px-6 lg:px-8"
      style={{ background: "#F6F8FB", fontFamily: "Inter, sans-serif" }}
    >
      <ManageCandidatesView />
    </div>
  );
}
