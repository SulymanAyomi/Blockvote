"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Archive,
  BarChart3,
  Copy,
  Eye,
  FileClock,
  MoreHorizontal,
  Pencil,
  ShieldCheck,
  Trash2,
  Users,
  Vote,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ElectionListType, ElectionStatus } from "../../type";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

interface ActionItem {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  destructive?: boolean;
  onSelect?: () => void;
}

/**
 * Determines which actions are valid for a given election status.
 * Centralizing this logic means the table, cards, and detail page all
 * agree on what's possible at each lifecycle stage.
 */
function getActionsForStatus(
  election: ElectionListType,
  handlers: ActionHandlers,
): ActionItem[] {
  const base = `/admin/elections/${election.id}`;
  const { onDuplicate, onArchive, onCancel, onDelete } = handlers;

  const view: ActionItem = {
    key: "view",
    label: "View Election",
    icon: Eye,
    href: base,
  };
  const edit: ActionItem = {
    key: "edit",
    label: "Edit",
    icon: Pencil,
    href: `${base}?edit=1`,
  };
  const positions: ActionItem = {
    key: "positions",
    label: "Manage Positions",
    icon: Vote,
    href: `${base}/positions`,
  };
  const candidates: ActionItem = {
    key: "candidates",
    label: "Manage Candidates",
    icon: Users,
    href: `${base}/candidates`,
  };
  const eligibility: ActionItem = {
    key: "eligibility",
    label: "Manage Eligibility",
    icon: ShieldCheck,
    href: `${base}/eligibility`,
  };
  const results: ActionItem = {
    key: "results",
    label: "View Results",
    icon: BarChart3,
    href: `${base}?tab=results`,
  };
  const auditLog: ActionItem = {
    key: "audit",
    label: "View Audit Log",
    icon: FileClock,
    href: `${base}?tab=audit`,
  };
  const duplicate: ActionItem = {
    key: "duplicate",
    label: "Duplicate",
    icon: Copy,
    onSelect: () => onDuplicate(election),
  };
  const archive: ActionItem = {
    key: "archive",
    label: "Archive",
    icon: Archive,
    onSelect: () => onArchive(election),
  };
  const cancel: ActionItem = {
    key: "cancel",
    label: "Cancel Election",
    icon: XCircle,
    destructive: true,
    onSelect: () => onCancel(election),
  };
  const del: ActionItem = {
    key: "delete",
    label: "Delete Draft",
    icon: Trash2,
    destructive: true,
    onSelect: () => onDelete(election),
  };

  const byStatus: Record<ElectionStatus, ActionItem[]> = {
    DRAFT: [edit, positions, candidates, eligibility, duplicate, del],
    SCHEDULED: [view, edit, candidates, eligibility, duplicate, cancel],
    ACTIVE: [view, positions, candidates, eligibility, auditLog],
    COMPLETED: [view, results, auditLog, duplicate, archive],
    CANCELLED: [view, auditLog, duplicate],
    ARCHIVED: [view, results, auditLog],
    CLOSED: [view, results, auditLog],
  };

  return byStatus[election.status];
}

export interface ActionHandlers {
  onDuplicate: (election: ElectionListType) => void;
  onArchive: (election: ElectionListType) => void;
  onCancel: (election: ElectionListType) => void;
  onDelete: (election: ElectionListType) => void;
}

interface ElectionActionsMenuProps {
  election: ElectionListType;
  handlers: ActionHandlers;
}

export function ElectionActionsMenu({
  election,
  handlers,
}: ElectionActionsMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const actions = getActionsForStatus(election, handlers);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={open}
            aria-label={`Actions for ${election.title}`}
            onClick={() => setOpen((v) => !v)}
            className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900"
          >
            <MoreHorizontal className="h-4.5 w-4.5" aria-hidden="true" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-fit">
          {actions.map((action) => {
            const Icon = action.icon;
            const content = (
              <>
                <Icon className="h-4 w-4" aria-hidden="true" />
                {action.label}
              </>
            );
            const itemClass = cn(
              "flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition",
              action.destructive
                ? "text-red-600 hover:bg-red-50"
                : "text-neutral-700 hover:bg-neutral-50",
            );

            if (action.href) {
              return (
                <DropdownMenuItem
                  key={action.key}
                  onClick={() => router.push(action.href!)}
                  disabled={false}
                  className={itemClass}
                >
                  {content}
                </DropdownMenuItem>
              );
            }
            return (
              <DropdownMenuItem
                key={action.key}
                role="menuitem"
                className={itemClass}
                onClick={() => {
                  setOpen(false);
                  action.onSelect?.();
                }}
              >
                {content}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
      {/* <div className="relative inline-block text-left" ref={menuRef}>
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label={`Actions for ${election.title}`}
          onClick={() => setOpen((v) => !v)}
          className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900"
        >
          <MoreHorizontal className="h-4.5 w-4.5" aria-hidden="true" />
        </button>

        {open && (
          <div
            role="menu"
            className="absolute right-0 z-20 mt-1 w-56 origin-top-right rounded-lg border border-neutral-200 bg-white py-1 shadow-lg"
          >
            {actions.map((action) => {
              const Icon = action.icon;
              const content = (
                <>
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {action.label}
                </>
              );
              const itemClass = cn(
                "flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition",
                action.destructive
                  ? "text-red-600 hover:bg-red-50"
                  : "text-neutral-700 hover:bg-neutral-50",
              );

              if (action.href) {
                return (
                  <Link
                    key={action.key}
                    href={action.href}
                    role="menuitem"
                    className={itemClass}
                    onClick={() => setOpen(false)}
                  >
                    {content}
                  </Link>
                );
              }
              return (
                <button
                  key={action.key}
                  type="button"
                  role="menuitem"
                  className={itemClass}
                  onClick={() => {
                    setOpen(false);
                    action.onSelect?.();
                  }}
                >
                  {content}
                </button>
              );
            })}
          </div>
        )}
      </div> */}
    </>
  );
}
