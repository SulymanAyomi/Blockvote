import Image from "next/image";
import type { WizardFormState } from "./use-create-election-wizard";
import { formatDateLong, formatNumber, formatTime12h } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ImageIcon } from "lucide-react";

interface StepReviewProps {
  form: WizardFormState;
}

export function StepReview({ form }: StepReviewProps) {
  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        <div>
          {form.coverImage ? (
            <div className="size-18 relative rounded-md overflow-hidden">
              <Image
                // src={form.coverImage instanceof File ? URL.createObjectURL(image) : form.coverImage }
                src={form.coverImage}
                fill
                alt="logo"
                className="object-cover"
              />
            </div>
          ) : (
            <Avatar className="size-18">
              <AvatarFallback>
                <ImageIcon className="size-9 text-neutral-400" />
              </AvatarFallback>
            </Avatar>
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-neutral-900">
            {form.title || "Untitled Election"}
          </h3>
          <p className="text-sm text-neutral-500">{form.description}</p>
        </div>
      </div>

      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-neutral-400">
            Type
          </dt>
          <dd className="mt-1 text-sm text-neutral-900">
            {form.type === "school-wide" ? "School-wide" : "Departmental"}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-neutral-400">
            Scope
          </dt>
          <dd className="mt-1 text-sm text-neutral-900">{form.scopeLabel}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs font-medium uppercase tracking-wide text-neutral-400">
            Schedule
          </dt>
          <dd className="mt-1 text-sm text-neutral-900">
            {form.startDate ? formatDateLong(form.startDate) : "-"}
            {form.endDate && form.endDate !== form.startDate
              ? ` → ${formatDateLong(form.endDate)}`
              : ""}
            <span className="text-neutral-500">
              {" "}
              · {formatTime12h(form.startTime)} - {formatTime12h(form.endTime)}{" "}
              ({form.timezone})
            </span>
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-neutral-400">
            Positions
          </dt>
          <dd className="mt-1 text-sm text-neutral-900">
            {form.positions.length}
          </dd>
        </div>
        {/* <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-neutral-400">
            Candidates
          </dt>
          <dd className="mt-1 text-sm text-neutral-900">
            {form.candidates.length}
          </dd>
        </div> */}
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-neutral-400">
            Eligible Voters
          </dt>
          <dd className="mt-1 text-sm text-neutral-900">
            {formatNumber(form.estimatedEligibleVoters)}
          </dd>
        </div>
      </dl>

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-400">
          Positions
        </p>
        <div className="space-y-3 rounded-lg border border-neutral-200 p-4">
          {form.positions.length === 0 && (
            <p className="text-sm text-neutral-400">No positions configured.</p>
          )}
          {form.positions.map((position) => (
            <div key={position.id}>
              <p className="text-sm font-semibold text-neutral-900">
                {position.name}
              </p>
              {/* <p className="text-sm text-neutral-600">
                {form.candidates
                  .filter((c) => c.positionLocalId === position.localId)
                  .map((c) => c.name)
                  .join(", ") || "No candidates"}
              </p> */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
