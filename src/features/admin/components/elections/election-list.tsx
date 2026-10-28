"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useElections } from "../../hooks/elections/use-elections";
import { useElectionFilters } from "../../hooks/elections/use-election-filters";
import {
  useArchiveElection,
  useCancelElection,
  useDeleteElection,
} from "../../hooks/elections/use-delete-election";
import { useCreateElection } from "../../hooks/elections/use-create-election";
import { ElectionFiltersToolbar } from "./election-filters";
import { ElectionTable } from "./election-table";
import { ElectionCard } from "./election-card";
import { Pagination } from "./pagination";
import { TableSkeleton, CardListSkeleton } from "./election-skeletons";
import {
  ElectionsEmptyState,
  ElectionsErrorState,
  ElectionsNoResultsState,
} from "./election-empty-error-states";
import { ConfirmDialog } from "@/components/confirm-dialog";
import type { ElectionListItem, ElectionListType } from "../../type";
import type { ActionHandlers } from "./election-actions";

type PendingAction = {
  type: "cancel" | "archive" | "delete";
  election: ElectionListType;
} | null;

export function ElectionList() {
  const router = useRouter();
  const { filters, setFilter, clearFilters, hasActiveFilters } =
    useElectionFilters();
  const { data, isLoading, isError, isFetching, refetch } =
    useElections(filters);

  const cancelMutation = useCancelElection();
  const archiveMutation = useArchiveElection();
  const deleteMutation = useDeleteElection();
  const createMutation = useCreateElection();

  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const actionHandlers: ActionHandlers = {
    onDuplicate: (election) => {
      // Duplicating pre-fills the create wizard rather than silently
      // creating a copy, so the admin can review before saving.
      createMutation.reset();
      router.push(`/admin/elections/create?duplicateFrom=${election.id}`);
    },
    onArchive: (election) => setPendingAction({ type: "archive", election }),
    onCancel: (election) => setPendingAction({ type: "cancel", election }),
    onDelete: (election) => setPendingAction({ type: "delete", election }),
  };

  function handleConfirm() {
    if (!pendingAction) return;
    const { type, election } = pendingAction;
    const onSettled = () => setPendingAction(null);

    if (type === "cancel") cancelMutation.mutate(election.id, { onSettled });
    if (type === "archive") archiveMutation.mutate(election.id, { onSettled });
    if (type === "delete") deleteMutation.mutate(election.id, { onSettled });
  }

  const isMutating =
    cancelMutation.isPending ||
    archiveMutation.isPending ||
    deleteMutation.isPending;

  return (
    <div className="space-y-4">
      <ElectionFiltersToolbar
        filters={filters}
        onChange={setFilter}
        onClear={clearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {isLoading ? (
        <>
          <TableSkeleton />
          <div className="lg:hidden">
            <CardListSkeleton />
          </div>
        </>
      ) : isError ? (
        <ElectionsErrorState onRetry={() => refetch()} />
      ) : !data || data.elections.length === 0 ? (
        hasActiveFilters ? (
          <ElectionsNoResultsState onClearFilters={clearFilters} />
        ) : (
          <ElectionsEmptyState
            onCreateElection={() => router.push("/admin/elections/create")}
          />
        )
      ) : (
        <div
          className={
            isFetching ? "opacity-60 transition-opacity" : "transition-opacity"
          }
        >
          <div className="rounded-xl border border-neutral-200 bg-white lg:border-0 lg:bg-transparent p-4">
            <ElectionTable
              elections={data.elections}
              actionHandlers={actionHandlers}
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:hidden">
              {data.elections.map((election) => (
                <ElectionCard
                  key={election.id}
                  election={election}
                  actionHandlers={actionHandlers}
                />
              ))}
            </div>
          </div>
          <div className="hidden rounded-xl border border-neutral-200 bg-white lg:block">
            <Pagination
              page={data.page}
              limit={data.limit}
              total={data.total}
              onPageChange={(page) => setFilter("page", String(page))}
            />
          </div>
          <div className="lg:hidden">
            <Pagination
              page={data.page}
              limit={data.limit}
              total={data.total}
              onPageChange={(page) => setFilter("page", String(page))}
            />
          </div>
        </div>
      )}

      <ConfirmDialog
        open={pendingAction !== null}
        title={
          pendingAction?.type === "cancel"
            ? "Cancel Election?"
            : pendingAction?.type === "archive"
              ? "Archive Election?"
              : "Delete Draft?"
        }
        description={
          pendingAction?.type === "cancel"
            ? "This will prevent the election from proceeding. This action may not be reversible."
            : pendingAction?.type === "archive"
              ? "This will move the election to the archive. It will remain visible in read-only form."
              : "This will permanently delete this draft election. This action cannot be undone."
        }
        confirmLabel={
          pendingAction?.type === "cancel"
            ? "Cancel Election"
            : pendingAction?.type === "archive"
              ? "Archive Election"
              : "Delete Draft"
        }
        cancelLabel="Keep Election"
        destructive={pendingAction?.type !== "archive"}
        isLoading={isMutating}
        onConfirm={handleConfirm}
        onCancel={() => setPendingAction(null)}
      />
    </div>
  );
}
