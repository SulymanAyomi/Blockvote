"use client";

import { useState } from "react";
import { LoaderCircleIcon, Plus, Trash2 } from "lucide-react";
import { useElection } from "../../../hooks/elections/use-election";
import {
  useAddPosition,
  useRemovePosition,
} from "../../../hooks/elections/use-manage-positions";
import { DetailPageSkeleton } from "../election-skeletons";
import { ElectionsErrorState } from "../election-empty-error-states";
import { ConfirmDialog } from "@/components/confirm-dialog";
import type { PositionSummary } from "../../../type";
import { Button } from "@/components/ui/button";
import { Controller, useForm } from "react-hook-form";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useElectionPositions,
  usePositions,
} from "@/features/admin/hooks/elections/use-positions";
import { addElectionPositionSchema } from "@/features/admin/schema";
import { toast } from "sonner";

interface pType {
  id: string;
  name: string;
}

export function ManagePositionsView({ electionId }: { electionId: string }) {
  const {
    data: election,
    isLoading,
    isError,
    refetch,
  } = useElectionPositions(electionId);
  const {
    data: positions,
    isLoading: isLoadingPositions,
    isError: isErrorPositions,
    refetch: refetchPositions,
  } = usePositions();

  const addPosition = useAddPosition();
  const removePosition = useRemovePosition();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [numberOfWinners, setNumberOfWinners] = useState(1);
  const [maxSelections, setMaxSelections] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<pType | null>(null);
  const [error, setError] = useState("");

  const form = useForm<z.infer<typeof addElectionPositionSchema>>({
    resolver: zodResolver(addElectionPositionSchema),
    defaultValues: {
      positionId: undefined,
    },
  });
  function onSubmit(data: z.infer<typeof addElectionPositionSchema>) {
    setError("");
    const existingPosition = election?.find(
      (p) => p.position.id == data.positionId,
    );
    if (existingPosition) {
      toast.error("Position exist in election");
      return;
    }
    if (!data.positionId) {
      return;
    }

    addPosition.mutate(
      {
        electionId,
        positionId: data.positionId,
      },
      {
        onError: async (error) => {
          setError(error.message);
        },
      },
    );
  }

  function setDeleteId(id: string) {
    const position = election?.find((p) => p.id == id);

    if (position)
      setPendingDelete({
        id: position?.id,
        name: position?.position.name,
      });
  }

  if (isLoading || isLoadingPositions) return <DetailPageSkeleton />;
  if (isError || !election || !positions || isErrorPositions)
    return (
      <ElectionsErrorState
        onRetry={() => {
          refetch();
          refetchPositions();
        }}
      />
    );

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-neutral-200 bg-white p-4">
        <form className="" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex items-center justify-center gap-4 w-fit m-auto">
            <Controller
              name="positionId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full bg-brand-ash min-w-63.5">
                      <SelectValue placeholder="Position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Please Select a position</SelectLabel>
                        {positions.map((p) => (
                          <SelectItem value={p.id} key={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Button
              type="submit"
              disabled={addPosition.isPending}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium"
            >
              {addPosition.isPending ? (
                <LoaderCircleIcon className="animate-spin text-white size-4" />
              ) : (
                <Plus className="h-4 w-4" aria-hidden="true" />
              )}
              Add Position
            </Button>
          </div>
          {error && <p className="text-xs text-center text-red-500">{error}</p>}
        </form>
      </div>

      <ul className="max-w-xl m-auto divide-y divide-neutral-100 rounded-xl border border-neutral-200 bg-white">
        <div className="bg-primary-col text-white rounded-t-xl">
          <p className="text-xs py-3 px-4">Avilable positions</p>
        </div>
        {election.map((p) => (
          <li
            key={p.id}
            className="flex items-center justify-between gap-3 px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium text-neutral-900">
                {p.position.name}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setDeleteId(p.id)}
              aria-label={`Remove ${p.position.name}`}
              className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 transition hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Remove Position?"
        description={`This will remove "${pendingDelete?.name}" and any candidates assigned to it. This action may not be reversible.`}
        confirmLabel="Remove Position"
        cancelLabel="Keep Position"
        isLoading={removePosition.isPending}
        onConfirm={() => {
          if (!pendingDelete) return;
          removePosition.mutate(
            { electionId, positionId: pendingDelete.id },
            { onSettled: () => setPendingDelete(null) },
          );
        }}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
