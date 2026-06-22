import { zodResolver } from "@hookform/resolvers/zod";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { ImageIcon, MoveRight } from "lucide-react";
import Image from "next/image";
import React, { useRef, useState } from "react";
import { toast } from "sonner";
import z from "zod";
import {
  pollSection1Schema,
  pollSection2Schema,
  pollSection3Schema,
  VOTING_TYPES,
} from "@/features/elections/new-poll/schema";
import { Controller, useForm } from "react-hook-form";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { DatePicker } from "@/components/date-picker";
import TimePicker from "@/components/time-picker";
import { usePollData } from "@/context/pollData";

interface Section2Props {
  onNext: () => void;
}
const Section3 = ({ onNext }: Section2Props) => {
  const { pollData, setPollData } = usePollData();

  const form = useForm<z.infer<typeof pollSection3Schema>>({
    resolver: zodResolver(pollSection3Schema),
    defaultValues: {},
  });

  function onSubmit(data: z.infer<typeof pollSection3Schema>) {
    setPollData((prev) => ({
      ...prev,
      ...data,
    }));

    toast("You submitted the following values:", {
      description: (
        <pre className="mt-2 w-[320px] overflow-x-auto rounded-md bg-code p-4 text-code-foreground">
          <code>{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
      position: "bottom-right",
      classNames: {
        content: "flex flex-col gap-2",
      },
      style: {
        "--border-radius": "calc(var(--radius)  + 4px)",
      } as React.CSSProperties,
    });

    onNext();
  }

  return (
    <form id="form-rhf-demo" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <div className="flex gap-4 items-start justify-between">
          <Controller
            name="startDate"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <div className="space-y-1 w-full">
                  <label className="text-sm text-neutral-600 ml-2">
                    Start Date
                  </label>
                  <DatePicker
                    className="bg-bg-color1 hover:bg-muted active:bg-transparent"
                    placeholder="dd/mm/yy"
                    {...field}
                  />
                </div>

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="startTime"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <div className="space-y-1 w-full">
                  <label className="text-sm text-neutral-600 ml-2">
                    Start Time
                  </label>
                  <TimePicker {...field} />
                </div>

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {/* <div className="w-full">
            <div className="space-y-1 w-full">
              <label className="text-sm text-neutral-600 ml-2">Time</label>
              <TimePicker onChange={(e) => setStartTime(e.period)} />
              {error.startTime && <div>{error.startTime}</div>}
            </div>
          </div> */}
        </div>
        <div className="flex gap-4 items-start justify-between">
          <Controller
            name="endDate"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <div className="space-y-1 w-full">
                  <label className="text-sm text-neutral-600 ml-2">
                    End Date
                  </label>
                  <DatePicker
                    className="hover:bg-muted active:bg-transparent"
                    placeholder="dd/mm/yy"
                    {...field}
                  />
                </div>

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="endTime"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <div className="space-y-1 w-full">
                  <label className="text-sm text-neutral-600 ml-2">
                    End Time
                  </label>
                  <TimePicker {...field} />
                </div>

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>
      </FieldGroup>
      <div className="w-full mt-6">
        <Button
          type="submit"
          className="w-full flex items-center gap-3"
          size={"lg"}
        >
          Continue <MoveRight />
        </Button>
      </div>
    </form>
  );
};

export default Section3;

const NotifRow = ({
  label,
  desc,
  field,
}: {
  label: string;
  desc: string;
  field: string;
}) => (
  <div>
    <div>
      <p
        style={{
          fontSize: 12,
          color: "var(--color-text-secondary, #666)",
          margin: "2px 0 0",
        }}
        className="text-xs text-muted-foreground mt-0.5"
      >
        {desc}
      </p>
    </div>
  </div>
);

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      role="switch"
      type="button"
      aria-checked={on}
      onClick={onToggle}
      className={cn(
        "w-9 h-5 rounded-lg border-none cursor-pointer relative shrink-0 transition-all bg-[#d1d0cc]",
        on && "bg-primary-col",
      )}
    >
      <span
        style={{
          position: "absolute",
          top: 3,
          left: on ? 19 : 3,
          width: 14,
          height: 14,
          borderRadius: "50%",
          background: "#fff",
          transition: "left 0.2s",
        }}
      />
    </button>
  );
}
