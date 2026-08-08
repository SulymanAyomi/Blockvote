"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface ResultApprovedProps {
  similarity: number;
  onNext: () => void;
}

export function ResultApproved({ similarity, onNext }: ResultApprovedProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="flex size-24 items-center justify-center rounded-full bg-emerald-100">
        <svg
          viewBox="0 0 24 24"
          className="size-12 text-emerald-600"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-slate-900">
        Identity verified
      </h2>
      <p className="max-w-sm text-sm text-slate-600">
        Your face matched your NIN record.
        <br /> You can now proceed to vote.
      </p>
      <Button onClick={() => onNext()} className="w-full" size={"lg"}>
        Continue
      </Button>
    </div>
  );
}
