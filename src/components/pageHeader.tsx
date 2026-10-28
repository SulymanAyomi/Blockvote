import { H1 } from "@/lib/helpers";

interface PageHeadProps {
  title: string;
  sub?: string;
  children?: React.ReactNode;
}

export function PageHead({ title, sub, children }: PageHeadProps) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className={H1}>{title}</h1>
        {sub && <p className="mt-1.5 max-w-prose text-slate-600">{sub}</p>}
      </div>
      {children}
    </div>
  );
}
