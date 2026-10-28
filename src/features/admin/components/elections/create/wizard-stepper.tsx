"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { WIZARD_STEPS, type WizardStepKey } from "./use-create-election-wizard";

interface WizardStepperProps {
  currentStep: WizardStepKey;
  onStepClick: (step: WizardStepKey) => void;
  /** Steps at or before this index are considered reachable/completed. */
  maxReachedIndex: number;
}

export function WizardStepper({
  currentStep,
  onStepClick,
  maxReachedIndex,
}: WizardStepperProps) {
  const currentIndex = WIZARD_STEPS.findIndex((s) => s.key === currentStep);

  return (
    <ol
      className="flex flex-wrap gap-2 sm:gap-0 sm:overflow-x-auto"
      aria-label="Create election steps"
    >
      {WIZARD_STEPS.map((s, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isReachable = index <= maxReachedIndex;

        return (
          <li key={s.key} className="flex items-center">
            <button
              type="button"
              disabled={!isReachable}
              onClick={() => isReachable && onStepClick(s.key)}
              aria-current={isCurrent ? "step" : undefined}
              className={cn(
                "flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition",
                isCurrent && "bg-primary-col text-white",
                !isCurrent && isCompleted && "bg-emerald-50 text-emerald-700",
                !isCurrent &&
                  !isCompleted &&
                  isReachable &&
                  "bg-neutral-100 text-neutral-600 hover:bg-neutral-200",
                !isReachable &&
                  "cursor-not-allowed bg-neutral-50 text-neutral-300",
              )}
            >
              <span
                className={cn(
                  "flex h-4.5 w-4.5 items-center justify-center rounded-full text-[10px]",
                  isCurrent && "bg-white/20",
                  !isCurrent && isCompleted && "bg-emerald-600 text-white",
                  !isCurrent && !isCompleted && "bg-white text-neutral-500",
                )}
              >
                {isCompleted ? (
                  <Check className="h-3 w-3" aria-hidden="true" />
                ) : (
                  index + 1
                )}
              </span>
              {s.label}
            </button>
            {index < WIZARD_STEPS.length - 1 && (
              <span
                className="mx-1 hidden h-px w-4 bg-neutral-200 sm:block"
                aria-hidden="true"
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
