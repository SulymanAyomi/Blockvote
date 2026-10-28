import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  children,
  action,
}: {
  icon: LucideIcon;
  children: any;
  action?: string;
}) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white px-5 py-8 text-center">
      <Icon size={28} aria-hidden="true" className="mx-auto text-slate-400" />
      <p className="mt-2 font-semibold text-slate-900">{children}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
