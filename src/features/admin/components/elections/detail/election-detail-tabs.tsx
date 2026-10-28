"use client";

import { cn } from "@/lib/utils";

export type DetailTabKey = "overview" | "positions" | "eligibility" | "results" | "audit";

const TABS: { key: DetailTabKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "positions", label: "Positions & Candidates" },
  { key: "eligibility", label: "Eligibility" },
  { key: "results", label: "Results" },
  { key: "audit", label: "Audit Log" },
];

interface ElectionDetailTabsProps {
  active: DetailTabKey;
  onChange: (tab: DetailTabKey) => void;
}

export function ElectionDetailTabs({ active, onChange }: ElectionDetailTabsProps) {
  return (
    <div role="tablist" aria-label="Election detail sections" className="flex gap-1 overflow-x-auto border-b border-neutral-200">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          role="tab"
          aria-selected={active === tab.key}
          onClick={() => onChange(tab.key)}
          className={cn(
            "whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition",
            active === tab.key
              ? "border-neutral-900 text-neutral-900"
              : "border-transparent text-neutral-500 hover:text-neutral-700"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
