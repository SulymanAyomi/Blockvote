import { ShieldCheck } from "lucide-react";
import type { ElectionDetailType } from "../../../type";
import { formatNumber } from "@/lib/utils";

export function EligibilityTab({ data }: { data: ElectionDetailType }) {
  return (
    <div className="space-y-5">
      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-neutral-200 p-4">
          <dt className="text-xs font-medium text-neutral-500">Scope</dt>
          <dd className="mt-1 text-sm font-semibold text-neutral-900">
            {data.election.scopes[0].value}
          </dd>
        </div>
        <div className="rounded-lg border border-neutral-200 p-4">
          <dt className="text-xs font-medium text-neutral-500">Scope type</dt>
          <dd className="mt-1 text-sm font-semibold capitalize text-neutral-900">
            {data.election.scopes[0].value == "all"
              ? "School-wide"
              : data.election.scopes[0].value}{" "}
          </dd>
        </div>
        <div className="rounded-lg border border-neutral-200 p-4">
          <dt className="text-xs font-medium text-neutral-500">
            Eligible Voters
          </dt>
          <dd className="mt-1 text-sm font-semibold text-neutral-900">
            {formatNumber(data.eligibleVoterCount)}
          </dd>
        </div>
      </dl>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-neutral-900">
          Eligibility Rules
        </h3>
        <ul className="space-y-2">
          {eligibilityRules.map((rule) => (
            <li
              key={rule.id}
              className="flex items-start gap-2.5 rounded-lg border border-neutral-200 p-3"
            >
              <ShieldCheck
                className="mt-0.5 h-4 w-4 shrink-0 text-neutral-500"
                aria-hidden="true"
              />
              <div>
                <p className="text-sm font-medium text-neutral-900">
                  {rule.label}
                </p>
                {rule.description && (
                  <p className="mt-0.5 text-xs text-neutral-500">
                    {rule.description}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <p className="rounded-lg bg-neutral-50 p-3 text-xs text-neutral-500">
        This view shows aggregate eligibility rules and counts only. No
        individual voter identity is ever shown alongside vote choices, here or
        anywhere else in the system.
      </p>
    </div>
  );
}

const eligibilityRules = [
  {
    id: "r1",
    label: "Must be an enrolled, active student",
    description: "Verified against the student registry.",
  },
];
