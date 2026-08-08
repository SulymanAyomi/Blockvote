"use client";

import { ElectionStatus } from "@/generated/enums";
import { createContext, useContext, useMemo, useState, ReactNode } from "react";

interface VotingContextProps {
  anonymousToken: string;
  votingSessionId: string;
  expiresAt: Date | undefined;
  setVotinData: (token: string, expires: Date, sessionId: string) => void;
}
const VotingContext = createContext<VotingContextProps | null>(null);

export function VotingContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [anonymousToken, setAnonymousToken] = useState("");
  const [votingSessionId, setVotingSessionId] = useState("");
  const [expiresAt, setExpiresAt] = useState<Date>();

  const setVotinData = (token: string, expires: Date, sessionId: string) => {
    setAnonymousToken(token);
    setExpiresAt(expires);
    setVotingSessionId(sessionId);
  };

  const value = useMemo(
    () => ({
      anonymousToken,
      votingSessionId,
      expiresAt,
      setVotinData,
    }),
    [anonymousToken, votingSessionId, expiresAt],
  );

  return (
    <VotingContext.Provider value={value}>{children}</VotingContext.Provider>
  );
}

export function useVotingContext() {
  const context = useContext(VotingContext);

  if (!context) {
    throw new Error("useVotingContext must be used inside VoteProvider");
  }

  return context;
}
