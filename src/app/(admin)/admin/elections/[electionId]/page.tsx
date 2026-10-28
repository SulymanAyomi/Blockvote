import { ElectionDetailView } from "@/features/admin/components/elections/detail/election-detail-view";

export const metadata = {
  title: "Admin - Election Details",
};

export default function ElectionDetailPage() {
  return (
    <div className="mx-auto w-full space-y-6 px-4 py-6 pt-0 sm:px-6 lg:px-8">
      <ElectionDetailView />
    </div>
  );
}
