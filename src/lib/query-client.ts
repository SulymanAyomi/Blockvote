// query-client.ts
// Create this once per browser (inside useState in your Providers component).
import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { shouldRetry } from "./api";
import { toAppError } from "@/features/error/app-error";

// A login that expired mid-flow should send the voter to sign in, from any query or mutation.
function onGlobalError(error: unknown) {
    if (typeof window === "undefined") return;
    if (toAppError(error).code === "UNAUTHENTICATED" && !window.location.pathname.startsWith("/login"))
        window.location.assign("/login");
}

export const makeQueryClient = () =>
    new QueryClient({
        defaultOptions: { queries: { retry: shouldRetry } },
        queryCache: new QueryCache({ onError: onGlobalError }),
        mutationCache: new MutationCache({ onError: onGlobalError }),
    });
