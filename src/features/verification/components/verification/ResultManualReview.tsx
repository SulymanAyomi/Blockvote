"use client";

interface ResultManualReviewProps {
  message: string;
}

export function ResultManualReview({ message }: ResultManualReviewProps) {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
        <svg viewBox="0 0 24 24" className="h-8 w-8 text-amber-600" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M12 3l9 16H3z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-slate-900">Under review</h2>
      <p className="max-w-sm text-sm text-slate-600">{message}</p>
      <p className="max-w-sm text-xs text-slate-400">
        You'll be notified once the election committee has reviewed your submission. No further
        action is needed from you right now.
      </p>
    </div>
  );
}
