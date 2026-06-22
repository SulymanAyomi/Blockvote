"use client";
import { pollDataType } from "@/features/elections/new-poll/types";
import { createContext, useContext, useEffect, useState } from "react";

interface PollDataContextProps {
  pollData: pollDataType;
  setPollData: React.Dispatch<React.SetStateAction<pollDataType>>;
  resetPollData: () => void;
}

const PollContext = createContext<PollDataContextProps | null>(null);

export function PollDataProvider({ children }: { children: React.ReactNode }) {
  const [pollData, setPollData] = useState<pollDataType>({
    title: "",
    pollType: "Candidate",
    description: "",
    coverImage: null,
    visibility: "public",
    votingRestriction: "anyone",
    anonymousVoting: false,
    allowVoteChanges: false,
    startDate: undefined,
    endDate: undefined,
  });

  // Load persisted data (exclude payment)
  useEffect(() => {
    const saved = localStorage.getItem("pollData");
    if (saved) {
      const parsed: pollDataType = JSON.parse(saved);
      setPollData(parsed);
    }
  }, []);

  // Persist updates (excluding payment)
  useEffect(() => {
    const { ...safeData } = pollData;
    localStorage.setItem("pollData", JSON.stringify(safeData));
  }, [pollData]);

  const resetPollData = () => {
    setPollData({
      title: "",
      pollType: "Candidate",
      description: "",
      coverImage: null,
      visibility: "public",
      votingRestriction: "anyone",
      anonymousVoting: false,
      allowVoteChanges: false,
      startDate: undefined,
      endDate: undefined,
    });
    localStorage.removeItem("pollData");
  };

  return (
    <PollContext.Provider value={{ pollData, setPollData, resetPollData }}>
      {children}
    </PollContext.Provider>
  );
}

export function usePollData() {
  const ctx = useContext(PollContext);
  if (!ctx) throw new Error("usePollData must be used inside PollDataProvider");
  return ctx;
}
