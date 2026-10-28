import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cx } from "class-variance-authority";

export function Skel({ className }: { className: string }) {
  return (
    <Skeleton className={cx("bg-slate-200", className)} aria-hidden="true" />
  );
}

export function SkelCards({ n = 2 }) {
  return (
    <div className="space-y-4" role="status" aria-label="Loading">
      {Array.from({ length: n }).map((_, i) => (
        <Card key={i} className="rounded-2xl p-5">
          <Skel className="h-6 w-3/5" />
          <Skel className="mt-4 h-4 w-5/6" />
          <Skel className="mt-3 h-4 w-2/5" />
          <Skel className="mt-5 h-11 w-40 rounded-lg" />
        </Card>
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  );
}
