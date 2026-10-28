"use client";

import { ElectionStatus } from "@/generated/enums";
import {
  createContext,
  useContext,
  useMemo,
  useState,
  ReactNode,
  useCallback,
} from "react";

type ballotType = Record<string, string>;
interface VotingContextProps {
  anonymousToken: string;
  votingSessionId: string;
  expiresAt: Date | undefined;
  ballots: ballotType;
  focusPos: null | string;
  setVotinData: (token: string, expires: Date) => void;
  setSession: (session: string) => void;
  handleFocusPos: (x: string | null) => void;
  clearBallot: () => void;
  setChoice: (eid: string, pid: string, cid: string) => void;
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
  const [ballots, setBallots] = useState<ballotType>({});
  const [focusPos, setFocusPos] = useState<null | string>(null);

  const setVotinData = (token: string, expires: Date) => {
    setAnonymousToken(token);
    setExpiresAt(expires);
  };

  const setSession = (session: string) => {
    setVotingSessionId(session);
  };

  const handleFocusPos = (x: null | string) => setFocusPos(x);

  const handleBallots = () => {};

  const clearBallot = () => setBallots({});

  // const setChoice = useCallback((eid: string, pid: string, cid: string) => {
  //   console.log("ballot", ballots);
  //   setBallots((b) => ({ ...b, [pid]: cid }));
  // }, []);

  function setChoice(eid: string, pid: string, cid: string) {
    console.log("expires", expiresAt, anonymousToken);
    setBallots((b) => ({ ...b, [pid]: cid }));
  }

  const value = useMemo(
    () => ({
      anonymousToken,
      votingSessionId,
      expiresAt,
      ballots,
      focusPos,
      setVotinData,
      setSession,
      handleFocusPos,
      clearBallot,
      setChoice,
    }),
    [anonymousToken, votingSessionId, expiresAt, ballots, focusPos],
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
