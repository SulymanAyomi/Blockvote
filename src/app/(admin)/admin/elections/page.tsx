"use client";
import Link from "next/link";
import { Plus } from "lucide-react";
import { ElectionStatsCards } from "@/features/admin/components/elections/election-stats";
import { ElectionList } from "@/features/admin/components/elections/election-list";

export default function ElectionsAdminPage() {
  return (
    <div className="mx-auto max-w-350 space-y-6 px-4 py-6 pt-0 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-primary-col text-white px-4 py-6 border-b rounded-xl">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-white">
            Elections
          </h1>
          <p className="mt-1 text-sm text-bg-color1">
            Create, manage, and monitor school elections.
          </p>
        </div>
        <Link
          href="/admin/elections/create"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-primary-col shadow-sm transition hover:bg-white/80"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Create Election
        </Link>
      </div>

      <ElectionStatsCards />

      <ElectionList />
    </div>
  );
}
