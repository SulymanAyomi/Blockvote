import { CheckCircle2, Clock, LucideIcon, Vote } from "lucide-react";
import { cx } from "@/lib/helpers";
import { ElectionStatus } from "@/features/elections/type";
import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: ElectionStatus }) {
  if (status === "ACTIVE")
    return (
      <Tag kind="open" icon={Vote}>
        Voting Open
      </Tag>
    );
  if (status === "SCHEDULED")
    return (
      <Tag kind="upcoming" icon={Clock}>
        Upcoming
      </Tag>
    );
  return (
    <Tag kind="closed" icon={CheckCircle2}>
      Completed
    </Tag>
  );
}

const TONE = {
  open: "bg-green-100 text-green-800",
  done: "bg-green-100 text-green-800",
  upcoming: "bg-amber-100 text-amber-900",
  closed: "bg-slate-200 text-slate-800",
  info: "bg-blue-100 text-blue-900",
  error: "bg-red-100 text-red-800",
};

interface TagProps {
  kind: "open" | "done" | "upcoming" | "closed" | "info" | "error";
  icon?: LucideIcon;
  className?: string;
  children: React.ReactNode;
}
export function Tag({ kind, icon: Icon, children, className }: TagProps) {
  return (
    <Badge
      variant="outline"
      className={cx(
        "gap-1.5 whitespace-nowrap rounded-full border-transparent px-2.5 py-0.5 text-sm font-semibold",
        TONE[kind],
        className ? className : "",
      )}
    >
      {Icon && <Icon size={15} aria-hidden="true" />}
      {children}
    </Badge>
  );
}
