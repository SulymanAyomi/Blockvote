"use client";

interface ResultRejectedProps {
  onRetry: () => void;
}

const COMMITTEE_CONTACT_URL = process.env.NEXT_PUBLIC_COMMITTEE_CONTACT_URL ?? "mailto:elections@college.edu";

export function ResultRejected({ onRetry }: ResultRejectedProps) {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-100">
        <svg viewBox="0 0 24 24" className="h-8 w-8 text-rose-600" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-slate-900">We couldn't verify your identity</h2>
      <p className="max-w-sm text-sm text-slate-600">
        The photo didn't match closely enough with your student record. Make sure your face is
        well-lit and centered, then try again.
      </p>
      <div className="flex flex-col items-center gap-2 sm:flex-row">
        <button
          onClick={onRetry}
          className="rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-700"
        >
          Retry
        </button>
        <a
          href={COMMITTEE_CONTACT_URL}
          className="rounded-lg border border-slate-300 px-6 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
        >
          Contact election committee
        </a>
      </div>
    </div>
  );
}
