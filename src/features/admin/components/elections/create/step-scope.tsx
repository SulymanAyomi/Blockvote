"use client";

import type { WizardFormState } from "./use-create-election-wizard";
import { formatNumber } from "@/lib/utils";
import { useDepartments } from "@/features/admin/hooks/elections/use-departments";
import { AlertCircle, Loader2Icon } from "lucide-react";
import { ScopeType } from "@/generated/enums";
import { useFaculty } from "@/features/admin/hooks/elections/use-faculty";

interface StepScopeProps {
  form: WizardFormState;
  onChange: (patch: Partial<WizardFormState>) => void;
}

// PLACEHOLDER: replace with real faculty/department lookups + eligible-voter
// counts from the student registry API once available.
const FACULTIES = [
  { id: "eng", label: "Faculty of Engineering", estimatedVoters: 640 },
  { id: "arts", label: "Faculty of Arts", estimatedVoters: 510 },
  { id: "biz", label: "Faculty of Business", estimatedVoters: 380 },
];

const DEPARTMENTS = [
  { id: "cs", label: "Computer Science Department", estimatedVoters: 420 },
  { id: "econ", label: "Economics Department", estimatedVoters: 260 },
  { id: "chem", label: "Chemistry Department", estimatedVoters: 190 },
];

const SCHOOL_TOTAL = 200;

export function StepScope({ form, onChange }: StepScopeProps) {
  const { data: faculties, isLoading } = useFaculty();
  const { data: departments, isLoading: loadingDepartment } =
    useDepartments(undefined);

  function handleScopeType(scopeType: ScopeType) {
    if (scopeType === "UNIVERSITY") {
      onChange({
        scopeType,
        scopeRefId: undefined,
        scopeLabel: "Entire School",
        estimatedEligibleVoters: SCHOOL_TOTAL,
      });
    } else {
      onChange({
        scopeType,
        scopeRefId: undefined,
        scopeLabel: "",
        estimatedEligibleVoters: 0,
      });
    }
  }

  function handleRefSelect(id: string) {
    const list = form.scopeType === "FACULTY" ? faculties : departments;
    const match = list?.find((item) => item.id === id);
    if (!match) return;
    onChange({
      scopeRefId: id,
      scopeLabel: match.name,
      estimatedEligibleVoters:
        match.name == "Faculty of Engineering"
          ? 640
          : match.name == "Faculty of Arts"
            ? 510
            : match.name == "Faculty of Humanities and Social Science"
              ? 380
              : match.name == "Department of Computer Science"
                ? 420
                : match.name == "Department of Mathematics"
                  ? 270
                  : match.name == "Department of Accounting"
                    ? 136
                    : 0,
    });
  }

  function handleonRetry() {}

  if (isLoading || loadingDepartment) {
    return (
      <div className="flex w-full h-full item-center justify-center gap-2">
        <Loader2Icon className="size-4 animate-spin text-primary-col" />
        <p className="text-sm">Loading faculties and departments...</p>
      </div>
    );
  }
  if (!faculties || !departments) {
    return (
      <div className="flex flex-col h-full items-center text-center justify-center gap-2">
        <div className="flex items-center justify-center gap-2">
          <AlertCircle className="size-6 text-amber-600" />
          <p className="text-sm">Something went wrong</p>
        </div>
        <button
          type="button"
          onClick={handleonRetry}
          className="text-center w-fit inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-700"
        >
          Try Again
        </button>
      </div>
    );
  }
  const list =
    form.scopeType === "FACULTY"
      ? faculties
      : form.scopeType === "DEPARTMENT"
        ? departments
        : [];

  return (
    <div className="space-y-5">
      <div>
        <span className="mb-1.5 block text-sm font-medium text-neutral-700">
          Who is eligible?
        </span>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {(
            [
              { type: "UNIVERSITY", value: "Entire school" },
              { type: "FACULTY", value: "Faculty" },
              { type: "DEPARTMENT", value: "Department" },
            ] as { type: ScopeType; value: string }[]
          ).map((option) => (
            <label
              key={option.value}
              className={`flex cursor-pointer items-center justify-center rounded-lg border p-3 text-sm font-medium transition ${
                form.scopeType === option.type
                  ? "border-primary-col bg-primary-col text-white"
                  : "border-neutral-300 text-neutral-700 hover:bg-neutral-50"
              }`}
            >
              <input
                type="radio"
                name="scope-type"
                value={option.value}
                checked={form.scopeType === option.value}
                onChange={() => handleScopeType(option.type)}
                className="sr-only"
              />
              {option.value}
            </label>
          ))}
        </div>
      </div>

      {list.length > 0 && (
        <div>
          <label
            className="mb-1.5 block text-sm font-medium text-neutral-700"
            htmlFor="scope-ref"
          >
            Select {form.scopeType == "FACULTY" ? "Faculty" : "Department"}
          </label>
          <select
            id="scope-ref"
            value={form.scopeRefId ?? ""}
            onChange={(e) => handleRefSelect(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200"
          >
            <option value="" disabled>
              Choose a {form.scopeType == "FACULTY" ? "Faculty" : "Department"}…
            </option>
            {list.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {form.scopeLabel && (
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Eligibility
          </p>
          <p className="mt-1 text-sm font-medium text-neutral-900">
            {form.scopeLabel}
          </p>
          <p className="mt-0.5 text-sm text-neutral-500">
            Estimated eligible voters:{" "}
            {formatNumber(form.estimatedEligibleVoters)}
          </p>
        </div>
      )}
    </div>
  );
}
