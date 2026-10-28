import type { ElectionDetail, ElectionDetailType } from "../../../type";

export function AuditLogTab({ election }: { election: ElectionDetailType }) {
  if (election.auditLog.length === 0) {
    return (
      <p className="text-sm text-neutral-500">
        No administrative events recorded yet.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {election.auditLog.map((entry) => (
        <li
          key={entry.id}
          className="flex items-start justify-between gap-4 rounded-lg border border-neutral-200 p-3"
        >
          <div>
            <p className="text-sm font-medium text-neutral-900">
              {entry.action}
            </p>
            {/* <p className="text-xs text-neutral-500">{entry.admin.email}</p> */}
          </div>
          <time
            dateTime={entry.createdAt}
            className="whitespace-nowrap text-xs text-neutral-400"
          >
            {new Date(entry.createdAt).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </time>
        </li>
      ))}
    </ul>
  );
}
