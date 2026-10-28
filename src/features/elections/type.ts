import { DashboardType } from "./api/use-get-dashboard";

/** Every error the backend can return for an election flow. */
export type ErrorCode =
    | "not_found"
    | "not_eligible"
    | "not_open"
    | "closed"
    | "already_voted"
    | "not_verified"
    | "session_expired"
    | "invalid_ballot"
    | "results_unavailable"
    | "not_voted"
    | "not_loaded"
    | "election_not_loaded";

/** A single action link/button in the card. `to === null` means "call onRetry". */
export type Action = readonly [label: string, to: string | null, primary?: 1];

/** [title, body, actions] for each code. */
export type Entry = readonly [title: string, text: string, actions: readonly Action[]];

export type ErrorPayload = {
    code?: ErrorCode;
    /** Passed to `fmtDateTime` — narrow to whatever that helper accepts. */
    start?: string | Date;
    /** Passed to `fmtDateTime`. */
    publishAt?: string | Date;
};

export type ErrorStateProps = {
    error?: ErrorPayload;
    /** Called when a fallback action with no `to` is clicked. */
    onRetry?: () => void;
    /** Election id, used to build verify/ballot links. */
    id?: string;
    isLoading?: boolean;
};

export interface ElectionType {
    status: ElectionStatus;
    id: string;
    createdAt: string;
    updatedAt: string;
    title: string;
    code: string | null;
    description: string | null;
    coverImage: string | null;
    academicSessionId: string;
    startsAt: string;
    endsAt: string;
}

export enum Status {
    DRAFT = "DRAFT",
    SCHEDULED = "SCHEDULED",
    ACTIVE = "ACTIVE",
    COMPLETED = "COMPLETED",
    CLOSED = "CLOSED",
    ARCHIVED = "ARCHIVED",
    CANCELLED = "CANCELLED",
}

export const ElectionStatus = {
    DRAFT: "DRAFT",
    SCHEDULED: "SCHEDULED",
    ACTIVE: "ACTIVE",
    COMPLETED: "COMPLETED",
    CLOSED: "CLOSED",
    ARCHIVED: "ARCHIVED",
    CANCELLED: "CANCELLED",
} as const;



export type ElectionStatus = (typeof ElectionStatus)[keyof typeof ElectionStatus];

export type DashboardElectionType = DashboardType["data"]["active"][0]

export interface candidateType {
    id: string;
    imageUrl: string | null;
    manifesto: string | null;
    platform: string[];
    campaignSlogan: string | null;
    voter: {
        level: number | null;
        fullName: string;
        department: {
            name: string;
        } | null;
    };
}
