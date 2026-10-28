// ErrorState.tsx
// Usage:
//   const { data, error, refetch, isFetching } = useGetElection({ electionId });
//   if (error) return <ErrorState error={error} id={electionId} retry={() => refetch()} isLoading={isFetching} />;
import { useState } from "react";
import { AlertTriangle, CheckCircle2, Clock, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { fmtDateTime, H2 } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import { Btn } from "../../components/btn";
import { toAppError, type ErrorCode } from "./app-error";

type Tone = "error" | "warn" | "success";
type Action = {
  label: string;
  to?: string; // a link; otherwise the action calls a handler
  kind?: "retry" | "restart";
  primary?: boolean;
};
type Entry = { title: string; text: string; tone?: Tone; actions: Action[] };
type Ctx = { id?: string; start?: Date; publishAt?: Date };

const back = (primary = false): Action => ({
  label: "Return to Elections",
  to: "/elections",
  primary,
});
const dashboard = (primary = false): Action => ({
  label: "Return to Dashboard",
  to: "/dashboard",
  primary,
});
const support: Action = { label: "Contact Support", to: "/help" };
const tryAgain = (primary = true): Action => ({
  label: "Try Again",
  kind: "retry",
  primary,
});

const verifyPath = (c: Ctx) =>
  c.id ? `/elections/${c.id}/verify` : "/elections";
const ballotPath = (c: Ctx) =>
  c.id ? `/elections/${c.id}/ballot` : "/elections";

const sessionInvalid = (): Entry => ({
  title: "Your voting session has expired.",
  text: "For your security, your selections were cleared. Verify your identity again to start a new voting session.",
  tone: "warn",
  actions: [{ label: "Verify Again", kind: "restart", primary: true }, back()],
});

const submitted = (): Entry => ({
  title: "You have already voted in this election.",
  text: "Your ballot was submitted and can't be changed or submitted again.",
  tone: "success",
  actions: [
    dashboard(true),
    { label: "View My Voting Activity", to: "/my-votes" },
  ],
});

const generic = (title: string): Entry => ({
  title,
  text: "Something went wrong. Please try again.",
  actions: [tryAgain()],
});

/** One entry per code. `Record<ErrorCode, ...>` makes TypeScript fail if a code is missing. */
const ENTRIES: Record<ErrorCode, (c: Ctx) => Entry> = {
  UNAUTHENTICATED: () => ({
    title: "Please sign in again.",
    text: "Your login has expired.",
    tone: "warn",
    actions: [{ label: "Sign In", to: "/login", primary: true }],
  }),
  ACCOUNT_LOCKED: () => ({
    title: "Your account is temporarily locked.",
    text: "Too many failed attempts. Please wait a few minutes before trying again.",
    tone: "warn",
    actions: [{ label: "Back to Sign In", to: "/login", primary: true }],
  }),

  ELECTION_NOT_FOUND: () => ({
    title: "We couldn't load this election.",
    text: "It may have been removed, or the link may be wrong.",
    actions: [back(true)],
  }),
  ELECTION_NOT_OPEN: (c) => ({
    title: "This election isn't open yet.",
    text: c.start
      ? `Voting opens ${fmtDateTime(c.start)}.`
      : "Check the election page for the voting dates.",
    tone: "warn",
    actions: [back(true)],
  }),
  ELECTION_ENDED: () => ({
    title: "The election is no longer open.",
    text: "Voting has ended for this election.",
    actions: [back(true)],
  }),
  NOT_ELIGIBLE: () => ({
    title: "You are not eligible to vote in this election.",
    text: "Your enrollment record doesn't match this election's voter list. If you think this is a mistake, contact Election Support.",
    actions: [back(true), support],
  }),
  ALREADY_VOTED: submitted,

  FACE_NOT_ENROLLED: () => ({
    title: "Your face isn't registered yet.",
    text: "Contact Election Support to complete face enrollment before you vote.",
    actions: [{ ...support, primary: true }, back()],
  }),
  FACE_NOT_VERIFIED: (c) => ({
    title: "Verify your identity to continue.",
    text: "You need to complete identity verification before you can open the ballot.",
    tone: "warn",
    actions: [
      { label: "Start Verification", to: verifyPath(c), primary: true },
      back(),
    ],
  }),
  FACE_ATTEMPTS_EXCEEDED: () => ({
    title: "Too many verification attempts.",
    text: "For security, face verification is locked for this election. Contact the election committee to have it reset.",
    actions: [{ ...support, primary: true }, back()],
  }),
  FACE_SERVICE_UNAVAILABLE: () => ({
    title: "Face verification is temporarily unavailable.",
    text: "That attempt wasn't counted. Please try again in a moment.",
    tone: "warn",
    actions: [tryAgain()],
  }),
  NO_FACE_DETECTED: () => ({
    title: "We couldn't see your face.",
    text: "Make sure your face is well lit and centered, then retake the photo.",
    tone: "warn",
    actions: [{ label: "Retake Photo", kind: "retry", primary: true }],
  }),
  FACE_MISMATCH: () => ({
    title: "We couldn't verify your identity.",
    text: "Retake the photo, or contact the election committee if this keeps happening.",
    actions: [{ label: "Retake Photo", kind: "retry", primary: true }, support],
  }),

  SESSION_EXPIRED: sessionInvalid,
  SESSION_NOT_FOUND: sessionInvalid,
  INVALID_SESSION_STATE: sessionInvalid,
  TOKEN_INVALID: sessionInvalid,
  SESSION_CONFLICT: () => ({
    title: "Your session changed.",
    text: "Another sign-in may be using this election. Please try again.",
    tone: "warn",
    actions: [tryAgain()],
  }),
  SESSION_STILL_ACTIVE: (c) => ({
    title: "Your voting session is still active.",
    text: "You can continue where you left off.",
    tone: "warn",
    actions: [{ label: "Continue", to: verifyPath(c), primary: true }, back()],
  }),

  INVALID_BALLOT: (c) => ({
    title: "Your vote could not be submitted.",
    text: "Some selections weren't valid. Go back to the ballot and check every position.",
    actions: [{ label: "Back to Ballot", to: ballotPath(c), primary: true }],
  }),

  RESULTS_UNAVAILABLE: (c) => ({
    title: "Results aren't published yet.",
    text: c.publishAt
      ? `Official results will be available on ${fmtDateTime(c.publishAt)}.`
      : "Check back later.",
    tone: "warn",
    actions: [back(true)],
  }),
  NOT_VOTED: () => ({
    title: "No confirmation to show.",
    text: "We don't have a submitted ballot for you in this election.",
    actions: [back(true)],
  }),
  NOT_LOADED: () => generic("Couldn't load election stats"),
  ELECTION_NOT_LOADED: () => generic("Couldn't load election."),

  NETWORK_ERROR: () => ({
    title: "You appear to be offline.",
    text: "Check your connection and try again.",
    tone: "warn",
    actions: [tryAgain()],
  }),
  RATE_LIMITED: () => ({
    title: "Too many requests.",
    text: "Please wait a moment, then try again.",
    tone: "warn",
    actions: [tryAgain()],
  }),
  SERVER_ERROR: () => ({
    title: "Something went wrong on our side.",
    text: "Please try again. If it keeps happening, contact support.",
    actions: [tryAgain(), dashboard()],
  }),
  UNKNOWN: () => ({
    title: "Something went wrong.",
    text: "We couldn't complete that. Check your connection and try again.",
    actions: [tryAgain(), dashboard()],
  }),
};

const TONES: Record<Tone, { box: string; Icon: typeof Clock }> = {
  error: { box: "bg-red-100 text-red-700", Icon: AlertTriangle },
  warn: { box: "bg-amber-100 text-amber-800", Icon: Clock },
  success: { box: "bg-green-100 text-green-700", Icon: CheckCircle2 },
};

export type ErrorStateProps = {
  /** Pass the error from useQuery/useMutation directly. Anything is accepted. */
  error?: unknown;
  /** "Try Again" actions. Usually () => refetch(). */
  retry?: () => void | Promise<unknown>;
  /** "Verify Again" on an expired session: your delete-session mutation, then reload. Falls back to retry. */
  onRestart?: () => void | Promise<unknown>;
  /** Election id, used to build verify and ballot links. */
  id?: string;
  /** Disables the buttons while refetching. Pass isFetching. */
  isLoading?: boolean;
};

export function ErrorState({
  error,
  retry,
  onRestart,
  id,
  isLoading,
}: ErrorStateProps) {
  const [busy, setBusy] = useState(false);

  const app = toAppError(error);
  const entry = ENTRIES[app.code]({
    id,
    start: app.start,
    publishAt: app.publishAt,
  });
  const { box, Icon } = TONES[entry.tone ?? "error"];

  const handlerFor = (a: Action) =>
    a.kind === "restart" ? (onRestart ?? retry) : retry;

  const run = async (fn: () => void | Promise<unknown>) => {
    setBusy(true);
    try {
      await fn();
    } finally {
      setBusy(false); // a restart that reloads the page never reaches here, which is fine
    }
  };

  return (
    <Card
      role={entry.tone === "success" ? "status" : "alert"}
      className="mx-auto my-6 max-w-lg rounded-2xl p-8 text-center"
    >
      <div
        className={cn(
          "mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full",
          box,
        )}
      >
        <Icon size={30} aria-hidden="true" />
      </div>
      <h2 className={H2}>{entry.title}</h2>
      <p className="mb-6 mt-2 text-slate-600">{entry.text}</p>
      <div className="flex flex-wrap justify-center gap-3">
        {entry.actions.map((a) => {
          const variant = a.primary ? "primary" : "secondary";
          if (a.to)
            return (
              <Btn key={a.label} to={a.to} variant={variant}>
                {a.label}
              </Btn>
            );
          const fn = handlerFor(a);
          if (!fn) return null; // no handler supplied, so no dead button
          return (
            <Btn
              key={a.label}
              onClick={() => run(fn)}
              icon={RefreshCw}
              variant={variant}
              disabled={isLoading || busy}
            >
              {a.label}
            </Btn>
          );
        })}
      </div>
    </Card>
  );
}
