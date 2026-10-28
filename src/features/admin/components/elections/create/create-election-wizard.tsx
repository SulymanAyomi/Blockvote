"use client";

import { useRouter } from "next/navigation";
import { useCreateElectionWizard } from "./use-create-election-wizard";
import { useCreateElection } from "../../../hooks/elections/use-create-election";
import { WizardStepper } from "./wizard-stepper";
import { StepBasicInfo } from "./step-basic-info";
import { StepScope } from "./step-scope";
import { StepSchedule } from "./step-schedule";
import { StepPositions } from "./step-positions";
import { StepEligibility } from "./step-eligibility";
import { StepReview } from "./step-review";
import type { CreateElectionInput } from "../../../type";
import { Button } from "@/components/ui/button";

// Mathematics Department Election
// Department of mathematics, annual student departmental election.

export function CreateElectionWizard() {
  const router = useRouter();
  const wizard = useCreateElectionWizard();
  const createMutation = useCreateElection();

  function buildInput(saveAsDraft: boolean): CreateElectionInput {
    const { form, scope } = wizard;
    return {
      election: {
        title: form.title,
        description: form.description,
        coverImage: form.coverImage,
        academicSessionId: form.academicSessionId,
        schedule: {
          startDate: form.startDate,
          startTime: form.startTime,
          endDate: form.endDate,
          endTime: form.endTime,
          timezone: form.timezone,
        },
      },
      scope,
      positions: form.positions.map((p) => ({ id: p.id, name: p.name })),
      saveAsDraft,
    };
  }

  function handleSubmit(saveAsDraft: boolean) {
    console.log(buildInput(saveAsDraft));
    createMutation.mutate(buildInput(saveAsDraft), {
      onSuccess: (election) =>
        router.push(`/admin/elections/${election.data.id}`),
    });
  }

  const isReview = wizard.step === "review";

  return (
    <div className="space-y-6 mx-auto max-w-4xl">
      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white p-3">
        <WizardStepper
          currentStep={wizard.step}
          onStepClick={wizard.goToStep}
          maxReachedIndex={wizard.stepIndex}
        />
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-5 sm:p-6">
        {wizard.step === "basic" && (
          <StepBasicInfo form={wizard.form} onChange={wizard.update} />
        )}
        {wizard.step === "scope" && (
          <StepScope form={wizard.form} onChange={wizard.update} />
        )}
        {wizard.step === "schedule" && (
          <StepSchedule form={wizard.form} onChange={wizard.update} />
        )}
        {wizard.step === "positions" && (
          <StepPositions
            positions={wizard.form.positions}
            onAdd={wizard.addPosition}
            onRemove={wizard.removePosition}
          />
        )}
        {/* {wizard.step === "candidates" && (
          <StepCandidates
            positions={wizard.form.positions}
            candidates={wizard.form.candidates}
            onAdd={wizard.addCandidate}
            onRemove={wizard.removeCandidate}
          />
        )} */}
        {wizard.step === "eligibility" && (
          <StepEligibility form={wizard.form} />
        )}
        {wizard.step === "review" && <StepReview form={wizard.form} />}
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={wizard.goBack}
          disabled={wizard.stepIndex === 0}
          className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Back
        </button>

        {isReview ? (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={createMutation.isPending}
              className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-60"
            >
              Save as Draft
            </button>
            <Button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={createMutation.isPending}
              className="rounded-lg px-4 py-2 text-sm font-medium transition"
            >
              {createMutation.isPending ? "Creating…" : "Create Election"}
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            onClick={wizard.goNext}
            disabled={!wizard.isStepValid}
            className="rounded-lg  px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40"
          >
            Continue
          </Button>
        )}
      </div>
    </div>
  );
}
