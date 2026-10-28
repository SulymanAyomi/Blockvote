"use client";

import { useState } from "react";
import { AlertCircleIcon, Loader2Icon, Plus, Trash2 } from "lucide-react";
import type { PositionDraft } from "../../../type";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePositions } from "@/features/admin/hooks/elections/use-positions";

interface StepPositionsProps {
  positions: PositionDraft[];
  onAdd: (position: PositionDraft) => void;
  onRemove: (localId: string) => void;
}

const inputClass =
  "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200";

export function StepPositions({
  positions,
  onAdd,
  onRemove,
}: StepPositionsProps) {
  const [position, setPosition] = useState("");

  const { data, isLoading, isError, refetch } = usePositions();

  function handleAdd() {
    if (!position.trim()) return;
    if (positions.some((p) => p.id == position)) return;
    const positionTo = data?.find((po) => po.id == position);
    if (!positionTo) return;
    onAdd(positionTo);
    setPosition("");
  }

  if (isLoading) {
    return (
      <div className="flex w-full h-full item-center justify-center gap-2">
        <Loader2Icon className="size-4 animate-spin text-primary-col" />
        <p className="text-sm">Loading faculties and departments...</p>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="flex flex-col h-full items-center text-center justify-center gap-2">
        <div className="flex items-center justify-center gap-2">
          <AlertCircleIcon className="size-6 text-amber-600" />
          <p className="text-sm">Something went wrong</p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          className="text-center w-fit inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-neutral-200 p-4">
        <p className="mb-3 text-sm font-medium text-neutral-700">
          Add a position
        </p>
        <div className="flex items-center justify-center gap-4">
          <Select onValueChange={(e) => setPosition(e)} value={position}>
            <SelectTrigger className="w-fit bg-brand-ash min-w-63.5">
              <SelectValue placeholder="Position" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Please Select a position</SelectLabel>
                {data.map((p) => (
                  <SelectItem value={p.id} key={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!position.trim()}
            className="flex items-center gap-1.5 rounded-lg bg-primary-col px-3 py-2 text-sm font-medium text-white transition hover:bg-primary-col/80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Position
          </button>
        </div>
      </div>

      {positions.length === 0 ? (
        <p className="text-sm text-neutral-500">No positions added yet.</p>
      ) : (
        <ul className="divide-y divide-neutral-100 rounded-lg border border-neutral-200">
          {positions.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between gap-3 px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium text-neutral-900">
                  {p?.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onRemove(p.id)}
                aria-label={`Remove ${p?.name}`}
                className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 transition hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
