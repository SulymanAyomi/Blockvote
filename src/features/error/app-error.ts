// app-error.ts
// Turns ANYTHING a query can throw into { code, status?, start?, publishAt? }.
// ErrorState never shows raw backend text, only copy chosen by code.

export const ERROR_CODES = [
    // auth
    "UNAUTHENTICATED",
    "ACCOUNT_LOCKED",
    // election
    "ELECTION_NOT_FOUND",
    "ELECTION_NOT_OPEN",
    "ELECTION_ENDED",
    "NOT_ELIGIBLE",
    "ALREADY_VOTED",
    // face
    "FACE_NOT_ENROLLED",
    "FACE_NOT_VERIFIED",
    "FACE_ATTEMPTS_EXCEEDED",
    "FACE_SERVICE_UNAVAILABLE",
    "NO_FACE_DETECTED",
    "FACE_MISMATCH",
    // session and token
    "SESSION_NOT_FOUND",
    "SESSION_EXPIRED",
    "SESSION_CONFLICT",
    "SESSION_STILL_ACTIVE",
    "INVALID_SESSION_STATE",
    "TOKEN_INVALID",
    // ballot
    "INVALID_BALLOT",
    // frontend-only
    "RESULTS_UNAVAILABLE",
    "NOT_VOTED",
    "NOT_LOADED",
    "ELECTION_NOT_LOADED",
    // transport
    "NETWORK_ERROR",
    "RATE_LIMITED",
    "SERVER_ERROR",
    "UNKNOWN",
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

export type AppError = {
    code: ErrorCode;
    status?: number;
    start?: Date;
    publishAt?: Date;
};

const KNOWN = new Set<string>(ERROR_CODES);

// Legacy lowercase codes, plus codes that should share another code's screen.
const ALIASES: Record<string, ErrorCode> = {
    NOT_FOUND: "ELECTION_NOT_FOUND",
    NOT_OPEN: "ELECTION_NOT_OPEN",
    CLOSED: "ELECTION_ENDED",
    NOT_VERIFIED: "FACE_NOT_VERIFIED",
    VOTED: "ALREADY_VOTED",
    TOKEN_ALREADY_USED: "ALREADY_VOTED", // a double submit whose first attempt succeeded
    INTERNAL_ERROR: "SERVER_ERROR",
};

/** Optional: throw this from your fetch wrapper so the code and status survive. */
export class ApiError extends Error {
    status: number;
    code?: string;
    body?: unknown;
    constructor(init: { status: number; code?: string; body?: unknown }) {
        super(init.code ?? `HTTP ${init.status}`);
        this.name = "ApiError";
        this.status = init.status;
        this.code = init.code;
        this.body = init.body;
    }
}

const rec = (v: unknown): Record<string, unknown> | undefined =>
    v && typeof v === "object" ? (v as Record<string, unknown>) : undefined;

function normalizeCode(raw: unknown): ErrorCode | undefined {
    if (typeof raw !== "string") return undefined;
    const k = raw.trim().toUpperCase().replace(/[\s-]+/g, "_");
    if (KNOWN.has(k)) return k as ErrorCode;
    return ALIASES[k];
}

function toDate(v: unknown): Date | undefined {
    if (typeof v !== "string" && typeof v !== "number" && !(v instanceof Date)) return undefined;
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? undefined : d;
}

/** Look for a body in the places common clients put it (ApiError, axios, Hono/fetch wrappers). */
function bodyOf(e: unknown): Record<string, unknown> | undefined {
    const o = rec(e);
    if (!o) return undefined;
    return rec(o.body) ?? rec(o.data) ?? rec(rec(o.response)?.data);
}

function isNetworkError(e: unknown) {
    if (typeof navigator !== "undefined" && navigator.onLine === false) return true;
    return e instanceof TypeError && /fetch|network|load failed/i.test(e.message);
}

export function toAppError(error: unknown): AppError {
    const o = rec(error);
    const body = bodyOf(error);

    const status =
        typeof o?.status === "number"
            ? o.status
            : typeof rec(o?.response)?.status === "number"
                ? (rec(o?.response)!.status as number)
                : undefined;

    const candidates: unknown[] =
        typeof error === "string"
            ? [error]
            : [
                o?.code,
                body?.code,
                rec(body?.error)?.code,
                body?.error,
                body?.errorCode,
                rec(o?.error)?.code,
                o?.error,
                o?.errorCode,
                o?.message, // e.g. new Error("session_expired")
            ];

    let code: ErrorCode | undefined;
    for (const c of candidates) {
        code = normalizeCode(c);
        if (code) break;
    }

    if (!code) {
        if (isNetworkError(error)) code = "NETWORK_ERROR";
        else if (status === 401) code = "UNAUTHENTICATED";
        else if (status === 429) code = "RATE_LIMITED";
        else if (status !== undefined && status >= 500) code = "SERVER_ERROR";
    }

    const details = rec(body?.details);
    return {
        code: code ?? "UNKNOWN",
        status,
        start: toDate(o?.start ?? body?.start ?? details?.start),
        publishAt: toDate(o?.publishAt ?? body?.publishAt ?? details?.publishAt),
    };
}
