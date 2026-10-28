"use client";

import { useCallback, useMemo, useState } from "react";
import type {
  CandidateDraft,
  ElectionScopeType,
  ElectionType,
  PositionDraft,
} from "../../../type";

export const WIZARD_STEPS = [
  { key: "basic", label: "Basic Information" },
  { key: "scope", label: "Scope" },
  { key: "schedule", label: "Schedule" },
  { key: "positions", label: "Positions" },
  // { key: "candidates", label: "Candidates" },
  { key: "eligibility", label: "Eligibility" },
  { key: "review", label: "Review" },
] as const;

export type WizardStepKey = (typeof WIZARD_STEPS)[number]["key"];

type ScopeType = "UNIVERSITY" | "CAMPUS" | "FACULTY" | "DEPARTMENT" | "PROGRAMME" | "LEVEL"

export interface ElectionScope {
  type: ScopeType;
  /** e.g. "Faculty of Engineering" or "Computer Science Department" */
  value: string;
  /** Stable id of the faculty/department, absent when scope type is "school" */
  refId?: string;
}

export interface WizardFormState {
  title: string;
  description: string;
  type: ElectionType;
  scopeType: ScopeType;
  scopeRefId?: string;
  scopeLabel: string;
  estimatedEligibleVoters: number;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  timezone: string;
  academicSessionId: string;
  coverImage?: string;
  positions: PositionDraft[];
  candidates: CandidateDraft[];
}

const INITIAL_STATE: WizardFormState = {
  title: "",
  description: "",
  type: "school-wide",
  scopeType: "UNIVERSITY",
  scopeLabel: "Entire School",
  estimatedEligibleVoters: 200,
  startDate: "",
  startTime: "09:00",
  endDate: "",
  endTime: "16:00",
  academicSessionId: "",
  coverImage: "",
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
  positions: [],
  candidates: [],
};

let localIdCounter = 0;
export function nextLocalId(prefix: string) {
  localIdCounter += 1;
  return `${prefix}-${localIdCounter}`;
}

/**
 * All state here is local UI/form state, intentionally kept out of React
 * Query — it only becomes server state once the wizard submits via
 * `useCreateElection` (see hooks/elections/use-create-election.ts).
 */
export function useCreateElectionWizard() {
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState<WizardFormState>(INITIAL_STATE);

  const step = WIZARD_STEPS[stepIndex].key;

  const goNext = useCallback(() => setStepIndex((i) => Math.min(i + 1, WIZARD_STEPS.length - 1)), []);
  const goBack = useCallback(() => setStepIndex((i) => Math.max(i - 1, 0)), []);
  const goToStep = useCallback((key: WizardStepKey) => {
    const idx = WIZARD_STEPS.findIndex((s) => s.key === key);
    if (idx !== -1) setStepIndex(idx);
  }, []);

  const update = useCallback((patch: Partial<WizardFormState>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  }, []);

  const addPosition = useCallback((position: PositionDraft) => {
    setForm((prev) => ({
      ...prev,
      positions: [...prev.positions, { ...position }],
    }));
  }, []);

  const removePosition = useCallback((id: string) => {
    setForm((prev) => ({
      ...prev,
      positions: prev.positions.filter((p) => p.id !== id),
      candidates: prev.candidates.filter((c) => c.positionLocalId !== id),
    }));
  }, []);

  const addCandidate = useCallback((candidate: Omit<CandidateDraft, "localId">) => {
    setForm((prev) => ({
      ...prev,
      candidates: [...prev.candidates, { ...candidate, localId: nextLocalId("cand") }],
    }));
  }, []);

  const removeCandidate = useCallback((localId: string) => {
    setForm((prev) => ({ ...prev, candidates: prev.candidates.filter((c) => c.localId !== localId) }));
  }, []);

  const scope: ElectionScope = useMemo(
    () => ({ type: form.scopeType, value: form.scopeLabel, refId: form.scopeRefId }),
    [form.scopeType, form.scopeLabel, form.scopeRefId]
  );

  const isStepValid = useMemo((): boolean => {
    switch (step) {
      case "basic":
        return form.title.trim().length > 0 && form.description.trim().length > 0 && form.academicSessionId.length > 0;
      case "scope":
        return form.scopeType === "UNIVERSITY" || Boolean(form.scopeRefId);
      case "schedule":
        return Boolean(form.startDate && form.startTime && form.endDate && form.endTime);
      case "positions":
        return form.positions.length > 0;
      // case "candidates":
      //   return form.candidates.length > 0;
      case "eligibility":
        return true;
      case "review":
        return true;
      default:
        return true;
    }
  }, [step, form]);

  return {
    step,
    stepIndex,
    totalSteps: WIZARD_STEPS.length,
    form,
    scope,
    isStepValid,
    goNext,
    goBack,
    goToStep,
    update,
    addPosition,
    removePosition,
    addCandidate,
    removeCandidate,
  };
}
