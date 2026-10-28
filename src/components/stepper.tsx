import { cx } from "class-variance-authority";
import { Check } from "lucide-react";

export function Stepper({ current }: { current: number }) {
  const steps = ["Identity Verification", "Cast Ballot", "Confirmation"];
  return (
    <ol className="mb-6 flex" aria-label="Voting progress">
      {steps.map((s, i) => {
        const n = i + 1;
        const st = n < current ? "done" : n === current ? "cur" : "todo";
        return (
          <li
            key={s}
            aria-current={st === "cur" ? "step" : undefined}
            className={cx(
              "relative flex flex-1 flex-col items-center gap-1.5 text-center text-sm",
              st === "todo" ? "text-slate-500" : "font-semibold text-slate-900",
            )}
          >
            {i > 0 && (
              <span
                aria-hidden="true"
                className={cx(
                  "absolute right-1/2 top-4 h-0.5 w-full",
                  n <= current ? "bg-blue-700" : "bg-slate-200",
                )}
              />
            )}
            <span
              className={cx(
                "relative z-10 grid h-8 w-8 place-items-center rounded-full border-2 font-bold",
                st === "done" && "border-green-700 bg-green-700 text-white",
                st === "cur" && "border-blue-700 bg-blue-700 text-white",
                st === "todo" && "border-slate-300 bg-white text-slate-500",
              )}
            >
              {st === "done" ? (
                <Check size={18} strokeWidth={3} aria-hidden="true" />
              ) : (
                n
              )}
            </span>
            <span>
              {s}
              {st === "done" && <span className="sr-only"> (completed)</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
