"use client";

import type { WizardFormState } from "./use-create-election-wizard";
import type { ElectionType } from "../../../type";
import { Input } from "@/components/ui/input";
import { Loader2Icon, AlertCircle, ImageIcon } from "lucide-react";
import { useAcademicSession } from "@/features/admin/hooks/elections/use-academic-sessions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRef, useState } from "react";

interface StepBasicInfoProps {
  form: WizardFormState;
  onChange: (patch: Partial<WizardFormState>) => void;
}

const inputClass =
  "w-full rounded-lg border border-primary-col bg-white px-3 py-2 text-sm text-neutral-900 placeholder:border-primary-col focus:border-primary-col focus:border-none focus:outline-none focus:ring-2 focus:ring-primary-col/40";
const labelClass = "mb-1.5 block text-sm font-medium text-neutral-700";

export function StepBasicInfo({ form, onChange }: StepBasicInfoProps) {
  const { data, isLoading, refetch } = useAcademicSession();
  const [image, setImage] = useState<File | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const url = URL.createObjectURL(file);
      onChange({ coverImage: url });
    } else {
      setImage(undefined);
    }
  };
  if (isLoading) {
    return (
      <div className="flex w-full h-full item-center justify-center gap-2">
        <Loader2Icon className="size-4 animate-spin text-primary-col" />
        <p className="text-sm">Loading...</p>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="flex flex-col h-full items-center text-center justify-center gap-2">
        <div className="flex items-center justify-center gap-2">
          <AlertCircle className="size-6 text-amber-600" />
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
    <div className="space-y-5 ">
      <div>
        <label className={labelClass} htmlFor="election-name">
          Election Name
        </label>
        <Input
          id="election-name"
          type="text"
          value={form.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="e.g. 2026 Student Union Election"
          className={inputClass}
          required
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="election-description">
          Description
        </label>
        <textarea
          id="election-description"
          value={form.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Briefly describe the purpose of this election"
          rows={3}
          className={inputClass}
          required
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="election-description">
          Academic session
        </label>
        <select
          id="scope-ref"
          value={form.academicSessionId ?? ""}
          onChange={(e) => onChange({ academicSessionId: e.target.value })}
          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200"
        >
          <option value="" disabled>
            Choose a session
          </option>
          {data.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}{" "}
              {item.isCurrent && (
                <div className="ml-3 text-xs p-2 bg-green-200 text-green-800">
                  Current
                </div>
              )}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-y-2">
        <div className="flex items-center gap-x-5">
          {image ? (
            <div className="size-18 relative rounded-md overflow-hidden">
              <Image
                src={image instanceof File ? URL.createObjectURL(image) : image}
                fill
                alt="logo"
                className="object-cover"
              />
            </div>
          ) : (
            <Avatar className="size-18">
              <AvatarFallback>
                <ImageIcon className="size-9 text-neutral-400" />
              </AvatarFallback>
            </Avatar>
          )}
          <div className="flex flex-col">
            <p className="text-sm">Election Cover Image</p>
            <p className="text-sm text-muted-foreground">
              JPG, PNG, SVG or JPEG, max 1mb
            </p>
            <input
              className="hidden"
              type="file"
              accept=".jpg, .png, .jpeg, .svg"
              ref={inputRef}
              disabled={isLoading}
              onChange={handleImageChange}
            />
            {image ? (
              <Button
                type="button"
                disabled={isLoading}
                variant="destructive"
                size="xs"
                className="w-fit mt-2"
                onClick={() => {
                  setImage(undefined);
                  onChange({ coverImage: undefined });
                  if (inputRef.current) {
                    inputRef.current.value = "";
                  }
                }}
              >
                Remove image
              </Button>
            ) : (
              <Button
                type="button"
                disabled={isLoading}
                variant="teritary"
                size="xs"
                className="w-fit mt-2"
                onClick={() => inputRef.current?.click()}
              >
                Upload image
              </Button>
            )}
          </div>
        </div>
      </div>

      <div>
        <span className={labelClass}>Election Type</span>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {(
            [
              {
                value: "school-wide",
                title: "School-wide",
                desc: "Every eligible student across the school can vote.",
              },
              {
                value: "departmental",
                title: "Departmental",
                desc: "Limited to a specific faculty or department.",
              },
            ] as { value: ElectionType; title: string; desc: string }[]
          ).map((option) => (
            <label
              key={option.value}
              className={`flex cursor-pointer flex-col rounded-lg border p-3 text-sm transition ${
                form.type === option.value
                  ? "border-primary-col ring-1 ring-primary-col"
                  : "border-neutral-300 hover:bg-neutral-50"
              }`}
            >
              <input
                type="radio"
                name="election-type"
                value={option.value}
                checked={form.type === option.value}
                onChange={() => onChange({ type: option.value })}
                className="sr-only"
              />
              <span className="font-medium text-neutral-900">
                {option.title}
              </span>
              <span className="mt-0.5 text-xs text-neutral-500">
                {option.desc}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
