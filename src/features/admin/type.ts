import { ScopeType } from "@/generated/enums";
import { fetchProjectDetailType } from "./hooks/elections/use-election";
import { DEFAULT_LIMIT, DEFAULT_PAGE } from "./schema";

export type ElectionType = "school-wide" | "departmental";

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

export interface ElectionScope {
    type: ElectionScopeType;
    /** e.g. "Faculty of Engineering" or "Computer Science Department" */
    value: string;
    /** Stable id of the faculty/department, absent when scope type is "school" */
    refId?: string;
}

export interface ElectionSchedule {
    startDate: string; // ISO date, e.g. "2026-09-10"
    startTime: string; // "09:00"
    endDate: string;
    endTime: string; // "16:00"
    timezone: string; // IANA tz, e.g. "Africa/Lagos"
}

export interface PositionSummary {
    id: string;
    name: string;
    description?: string;
    numberOfWinners: number;
    maxSelections: number;
    candidateCount: number;
}

export interface CandidateSummary {
    id: string;
    name: string;
    positionId: string;
    photoUrl?: string;
}

export interface EligibilityRule {
    id: string;
    label: string;
    description?: string;
}

export interface EligibilitySummary {
    scope: ElectionScope;
    rules: EligibilityRule[];
    eligibleVoterCount: number;
}

export interface AuditLogEntry {
    id: string;
    action: string;
    administrator: string;
    timestamp: string; // ISO datetime
}

export type DateFilterPreset = "TODAY" | "THIS_WEEK" | "THIS_MONTH" | "CUSTOM" | "UPCOMING" | "PAST"

/** Payload for creating a new position within the create-election wizard. */


export interface CandidateDraft {
    localId: string;
    name: string;
    positionLocalId: string;
}

export interface CreateElectionInputsa {
    title: string;
    description: string;
    coverImage: string;
    startsAt: Date
    endsAt: Date
    status: ElectionStatus;
    scope: ElectionScope;
    schedule: ElectionSchedule;
    positions: PositionDraft[];
    candidates: CandidateDraft[];
    saveAsDraft: boolean;
}

export interface PositionDraft {
    id: string;
    name: string;
}

interface CreateElectionInputScope {
    type: ScopeType
    value: string
}
export interface CreateElectionInput {
    election: {
        title: string;
        description?: string;
        coverImage?: string;
        academicSessionId: string;
        schedule: ElectionSchedule;
    }
    scope: CreateElectionInputScope;
    positions: PositionDraft[];
    saveAsDraft: boolean;
}

/** Full election record used on the detail page. */
export interface ElectionDetail extends ElectionListItem {
    positions: PositionSummary[];
    candidates: CandidateSummary[];
    eligibility: EligibilitySummary;
    auditLog: AuditLogEntry[];
    createdAt: string;
    updatedAt: string;
}

export type ElectionDetailType = fetchProjectDetailType["data"]
export type ElectionDetailPositionType = fetchProjectDetailType["data"]["positions"]

export const DEFAULT_ELECTION_FILTERS: ElectionFilters = {
    page: String(DEFAULT_PAGE),
    limit: String(DEFAULT_LIMIT),
};


export interface ElectionFilters {
    search?: string;
    status?: ElectionStatus;
    scope?: ScopeType;
    datePreset?: DateFilterPreset;
    dateFrom?: string;
    dateTo?: string;
    page: string;
    limit: string;
}


export interface CandidateFilters {
    electionId: string;
    facultyId?: string;
    search?: string;
    departmentId?: string;
    // gender?: "Male" | "Female" | undefined;
    level?: "100" | "200" | "300" | "400" | "500" | undefined;
    page: string;
    limit: string;
}

export interface ParticipationStats {
    eligibleVoters: number,
    votesCast: number,
    turnoutPercent: number
}

/** The row/card-level shape used by the elections list. */
export interface ElectionListItem {
    id: string;
    code: string; // e.g. "ELC-2026-001"
    name: string;
    description: string;
    type: ElectionType;
    scope: ElectionScope;
    schedule: ElectionSchedule;
    status: ElectionStatus;
    participation: ParticipationStats;
    positionCount: number;
    candidateCount: number;
}

export interface ElectionScopeType {
    type: ScopeType;
    value: string;
    id: string;
    electionId: string;
}



export interface ElectionFormScope {
    type: string;
    value: string;
}

export interface AcademicSessionType {
    name: string;
    id: string;
    startDate: Date | string;
    endDate: Date | null | string;
    isCurrent: boolean;
}

export interface ElectionListType {
    id: string;
    title: string;
    code: string | null;
    description: string | null;
    coverImage: string | null;
    academicSessionId: string;
    startsAt: Date | string;
    endsAt: Date | string;
    status: ElectionStatus;
    createdAt: Date | string;
    updatedAt: Date | string;
    academicSession: AcademicSessionType
    scopes: ElectionScopeType[];
    eligibleVoters: number;
    votesCast: number;
    turnoutPercent: number;
    positionCount: number;

}

export interface ElectionStats {
    total: number;
    active: number;
    upcoming: number;
    completed: number;
}

export interface Paginated<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
}

// export type UpdateElectionInput = Partial<Pick<CreateElectionInput, "title" | "description" | "type" | "scope" | "schedule">
// > & {
//     id: string;
// };