"use client";

import { ElectionStatus } from "@/generated/enums";
import { createContext, useContext, useMemo, useState, ReactNode } from "react";

export interface Candidate {
  id: string;
  voterId: string;
  voter: {
    level: number | null;
    fullName: string;
    imageUrl: string | null;
    department: {
      name: string;
    } | null;
  };
}

export interface Election {
  status: ElectionStatus;
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  description: string | null;
  academicSessionId: string;
  startsAt: string;
  endsAt: string;
}

export interface Position {
  id: string;
  position: {
    name: string;
  };
  candidates: Candidate[];
}

type Ballot = Record<string, string>;

interface VoteContextType {
  election: Election;
  positions: Position[];

  openReview: boolean;

  currentStep: number;

  ballot: Ballot;

  progress: number;

  completedPositions: number;

  totalPositions: number;

  currentPosition: Position;

  open: () => void;

  close: () => void;

  next: () => void;

  previous: () => void;

  goTo: (index: number) => void;

  selectCandidate: (positionId: string, candidateId: string) => void;

  getSelectedCandidate: (positionId: string) => string | undefined;

  hasCompleted: (positionId: string) => boolean;

  clearBallot: () => void;

  submit: () => {
    votes: {
      positionId: string;
      candidateId: string;
    }[];
  };
}

const VoteContext = createContext<VoteContextType | null>(null);

interface Props {
  children: ReactNode;
  positions: Position[];
  election: Election;
}

export function VoteProvider({ positions, children, election }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [openReview, setOpenReview] = useState(false);

  const [ballot, setBallot] = useState<Ballot>({});

  const currentPosition = positions[currentStep];

  const totalPositions = positions.length;

  const completedPositions = Object.keys(ballot).length;

  const progress = (completedPositions / totalPositions) * 100;

  function open() {
    setOpenReview(true);
  }
  function close() {
    setOpenReview(false);
  }

  function selectCandidate(positionId: string, candidateId: string) {
    setBallot((previous) => ({
      ...previous,
      [positionId]: candidateId,
    }));
  }

  function getSelectedCandidate(positionId: string) {
    return ballot[positionId];
  }

  function hasCompleted(positionId: string) {
    return Boolean(ballot[positionId]);
  }

  function next() {
    if (currentStep < positions.length - 1) {
      setCurrentStep((step) => step + 1);
    }
  }

  function previous() {
    if (currentStep > 0) {
      setCurrentStep((step) => step - 1);
    }
  }

  function goTo(index: number) {
    if (index >= 0 && index < positions.length) {
      setCurrentStep(index);
    }
  }

  function clearBallot() {
    setBallot({});
    setCurrentStep(0);
  }

  function submit() {
    const payload = {
      votes: Object.entries(ballot).map(([positionId, candidateId]) => ({
        positionId,
        candidateId,
      })),
    };
    console.log(payload);
    return payload;

    // await api.vote.submit(payload);
  }

  const value = useMemo(
    () => ({
      openReview,
      election,
      positions,
      ballot,
      currentStep,
      totalPositions,
      progress,
      completedPositions,
      currentPosition,
      next,
      previous,
      goTo,
      selectCandidate,
      getSelectedCandidate,
      hasCompleted,
      clearBallot,
      submit,
      open,
      close,
    }),
    [
      openReview,
      election,
      ballot,
      currentStep,
      progress,
      completedPositions,
      currentPosition,
      positions,
    ],
  );

  return <VoteContext.Provider value={value}>{children}</VoteContext.Provider>;
}

export function useVote() {
  const context = useContext(VoteContext);

  if (!context) {
    throw new Error("useVote must be used inside VoteProvider");
  }

  return context;
}
