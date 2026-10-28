import { mmss } from "@/lib/helpers";
import { cn } from "cn";
import { Timer } from "lucide-react";
import { useState, useEffect } from "react";

function SessionBar({
  expiresAt,
  paused,
  onExpire,
}: {
  expiresAt: any;
  paused?: boolean;
  onExpire: () => void;
}) {
  const [left, setLeft] = useState(() => Math.max(0, expiresAt - Date.now()));
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (paused) return;
    const t = setInterval(
      () => setLeft(Math.max(0, expiresAt - Date.now())),
      250,
    );
    return () => clearInterval(t);
  }, [expiresAt, paused]);

  useEffect(() => {
    if (left <= 0 && !paused) onExpire();
  }, [left, paused]); // eslint-disable-line

  const warn = left <= 60000;

  useEffect(() => {
    if (warn && left > 0)
      setMsg("Less than one minute left in your voting session.");
  }, [warn]); // eslint-disable-line

  useEffect(() => {
    if (Math.ceil(left / 1000) === 300)
      setMsg("Five minutes left in your voting session.");
  }, [left]);

  return (
    <div
      className={cn(
        "sticky top-20 z-20 mb-5 rounded-xl border px-4 py-2.5 text-sm",
        warn ? "border-amber-300 bg-amber-50" : "border-slate-200 bg-white",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-slate-900">
          <Timer size={18} aria-hidden="true" />
          Voting session:{" "}
          <span
            className={cn("font-bold tabular-nums", warn && "text-amber-900")}
          >
            {mmss(left)}
          </span>{" "}
          remaining
        </span>
        {warn ? (
          <span className="text-amber-900">
            <strong>Less than 1 minute left.</strong> Submit soon or you'll need
            to verify again.
          </span>
        ) : paused ? (
          <span className="text-slate-600">Timer paused while submitting</span>
        ) : null}
      </div>
      <div className="sr-only" role="status" aria-live="assertive">
        {msg}
      </div>
    </div>
  );
}

export default SessionBar;
