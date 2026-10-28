// api.ts
// Turns a Hono RPC response into either typed success data or a thrown ApiError,
// so useQuery/useMutation hand ErrorState something it can read.
import { ApiError, toAppError, type ErrorCode } from "@/features/error/app-error";

type AnyRes = { ok: boolean; status: number; json(): Promise<any> };
type BodyOf<R extends AnyRes> = Awaited<ReturnType<R["json"]>>;

/**
 * Usage:  return unwrap(await client.api.election[":electionId"]["$get"]({ param: { electionId } }));
 *
 * Throws ApiError (status + code + body) when:
 *  - the response is not 2xx, or the body isn't JSON (proxy error pages, empty bodies),
 *  - or the body says success: false.
 * With { dataErrorCode: true } it also throws when a 2xx body carries data.errorCode,
 * which your eligibility and authorization endpoints use for "voted" or "session_expired".
 * Returns only the success variants of the body.
 */
export async function unwrap<R extends AnyRes>(
    res: R,
    opts: { dataErrorCode?: boolean } = {},
): Promise<Exclude<BodyOf<R>, { success: false }>> {
    let body: unknown;
    try {
        body = await res.json();
    } catch {
        body = undefined; // non-JSON body: fall through with status only
    }

    const b = body as
        | { success?: boolean; error?: unknown; data?: { errorCode?: unknown } }
        | undefined;

    if (!res.ok || !b || b.success !== true) {
        const e = b?.error;
        const code = typeof e === "string" ? e : (e as { code?: string } | undefined)?.code;
        throw new ApiError({ status: res.status, code, body });
    }

    if (opts.dataErrorCode) {
        const ec = b.data?.errorCode;
        if (typeof ec === "string" && ec) throw new ApiError({ status: res.status, code: ec, body });
    }

    return body as Exclude<BodyOf<R>, { success: false }>;
}

/** React Query `retry`: only transient failures. 4xx and business errors never retry. */
export function shouldRetry(failureCount: number, error: unknown) {
    if (failureCount >= 2) return false;
    const { code, status } = toAppError(error);
    return code === "NETWORK_ERROR" || (status !== undefined && status >= 500);
}

const RESYNC: ReadonlySet<ErrorCode> = new Set<ErrorCode>([
    "SESSION_EXPIRED",
    "SESSION_NOT_FOUND",
    "SESSION_CONFLICT",
    "INVALID_SESSION_STATE",
    "TOKEN_INVALID",
    "ALREADY_VOTED",
    "ELECTION_NOT_OPEN",
    "ELECTION_ENDED",
    "NOT_ELIGIBLE",
    "UNAUTHENTICATED",
]);

/** True when the server-side session state changed, so cached eligibility is stale. */
export const shouldResync = (error: unknown) => RESYNC.has(toAppError(error).code);
