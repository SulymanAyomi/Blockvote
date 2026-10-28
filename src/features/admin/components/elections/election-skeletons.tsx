import { cn } from "@/lib/utils";

function Shimmer({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-neutral-200", className)} />;
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-neutral-200 bg-white p-4">
          <Shimmer className="mb-3 h-3.5 w-24" />
          <Shimmer className="h-7 w-14" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
      <div className="border-b border-neutral-200 bg-neutral-50 px-4 py-3">
        <Shimmer className="h-4 w-40" />
      </div>
      <div className="divide-y divide-neutral-100">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-4">
            <Shimmer className="h-4 w-1/4" />
            <Shimmer className="h-4 w-1/6" />
            <Shimmer className="h-4 w-1/6" />
            <Shimmer className="h-4 w-1/6" />
            <Shimmer className="h-4 w-1/12" />
            <Shimmer className="h-4 w-1/12 ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardListSkeleton({ cards = 4 }: { cards?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {Array.from({ length: cards }).map((_, i) => (
        <div key={i} className="space-y-3 rounded-xl border border-neutral-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <Shimmer className="h-4 w-32" />
            <Shimmer className="h-5 w-16 rounded-full" />
          </div>
          <Shimmer className="h-3 w-24" />
          <Shimmer className="h-3 w-full" />
          <Shimmer className="h-3 w-2/3" />
        </div>
      ))}
    </div>
  );
}

export function DetailPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Shimmer className="h-7 w-72" />
        <Shimmer className="h-4 w-40" />
      </div>
      <StatsSkeleton />
      <TableSkeleton rows={3} />
    </div>
  );
}
