"use client";

import { useRouter } from "next/navigation";

interface ResultApprovedProps {
  similarity: number;
}

export function ResultApproved({ similarity }: ResultApprovedProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
        <svg viewBox="0 0 24 24" className="h-8 w-8 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-slate-900">Identity verified</h2>
      <p className="max-w-sm text-sm text-slate-600">
        Your face matched your student record ({Math.round(similarity * 100)}% confidence). You can
        now proceed to vote.
      </p>
      <button
        onClick={() => router.push("/vote")}
        className="rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
      >
        Continue to vote
      </button>
    </div>
  );
}
