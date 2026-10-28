import { ShieldCheck } from "lucide-react";
import type { WizardFormState } from "./use-create-election-wizard";
import { formatNumber } from "@/lib/utils";

interface StepEligibilityProps {
  form: WizardFormState;
}

/**
 * Read-only summary at this stage in the wizard — eligibility rules
 * themselves are governed by the scope selected in Step 2. A dedicated
 * `/admin/elections/[electionId]/eligibility` page allows fine-tuning
 * rules after the election is created (see route in `app/admin/elections`).
 */
export function StepEligibility({ form }: StepEligibilityProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
        <ShieldCheck
          className="mt-0.5 h-5 w-5 shrink-0 text-neutral-500"
          aria-hidden="true"
        />
        <div>
          <p className="text-sm font-semibold text-neutral-900">
            Eligibility rules
          </p>
          <p className="mt-1 text-sm text-neutral-600">
            Must be an enrolled, active student within the selected scope.
            Verified against the student registry at voting time.
          </p>
        </div>
      </div>

      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-neutral-200 p-4">
          <dt className="text-xs font-medium text-neutral-500">Scope</dt>
          <dd className="mt-1 text-sm font-semibold text-neutral-900">
            {form.scopeLabel || "—"}
          </dd>
        </div>
        <div className="rounded-lg border border-neutral-200 p-4">
          <dt className="text-xs font-medium text-neutral-500">Scope type</dt>
          <dd className="mt-1 text-sm font-semibold capitalize text-neutral-900">
            {form.scopeType}
          </dd>
        </div>
        <div className="rounded-lg border border-neutral-200 p-4">
          <dt className="text-xs font-medium text-neutral-500">
            Eligible voters (est.)
          </dt>
          <dd className="mt-1 text-sm font-semibold text-neutral-900">
            {formatNumber(form.estimatedEligibleVoters)}
          </dd>
        </div>
      </dl>
    </div>
  );
}
