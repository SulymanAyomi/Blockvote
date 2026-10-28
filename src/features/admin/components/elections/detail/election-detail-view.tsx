"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useElection } from "../../../hooks/elections/use-election";
import { DetailPageSkeleton } from "../election-skeletons";
import { ElectionsErrorState } from "../election-empty-error-states";
import { ElectionDetailHeader } from "./election-detail-header";
import { ElectionDetailStats } from "./election-detail-stats";
import { ElectionDetailTabs, type DetailTabKey } from "./election-detail-tabs";
import { OverviewTab } from "./overview-tab";
import { PositionsCandidatesTab } from "./positions-candidates-tab";
import { EligibilityTab } from "./eligibility-tab";
import { ResultsTab } from "./results-tab";
import { AuditLogTab } from "./audit-log-tab";
import { useElectionId } from "@/features/elections/hooks/use-get-election-id";

const VALID_TABS: DetailTabKey[] = [
  "overview",
  "positions",
  "eligibility",
  "results",
  "audit",
];

export function ElectionDetailView() {
  const electionId = useElectionId();
  const { data, isLoading, isError, refetch } = useElection(electionId);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const tabParam = searchParams.get("tab");
  const activeTab: DetailTabKey = VALID_TABS.includes(tabParam as DetailTabKey)
    ? (tabParam as DetailTabKey)
    : "overview";

  function setTab(tab: DetailTabKey) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  if (isLoading) return <DetailPageSkeleton />;
  if (isError || !data)
    return <ElectionsErrorState onRetry={() => refetch()} />;

  return (
    <div className="space-y-6">
      <ElectionDetailHeader election={data.election} />
      <ElectionDetailStats data={data} />
      <div className="rounded-xl border border-neutral-200 bg-white">
        <div className="px-4 pt-2 sm:px-6">
          <ElectionDetailTabs active={activeTab} onChange={setTab} />
        </div>
        <div className="p-4 sm:p-6">
          {activeTab === "overview" && <OverviewTab data={data} />}
          {activeTab === "positions" && (
            <PositionsCandidatesTab positions={data.positions} />
          )}
          {activeTab === "eligibility" && <EligibilityTab data={data} />}
          {activeTab === "results" && <ResultsTab />}
          {activeTab === "audit" && <AuditLogTab election={data} />}
        </div>
      </div>
    </div>
  );
}
