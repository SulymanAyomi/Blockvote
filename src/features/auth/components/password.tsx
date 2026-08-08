"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  LoaderCircleIcon,
  LucideArrowRight,
  MoveRightIcon,
} from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import z from "zod";
import { idSelectionSchema, setPasswordSchema } from "../schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { DataType } from "../type";
import { toast } from "sonner";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { useVerifyNin } from "../api/use-verify";
import { usePassword } from "../api/use-password";

interface PasswordComponentProps {
  onNext: () => void;
  data: DataType;
}

export const PasswordComponent = ({ onNext, data }: PasswordComponentProps) => {
  const [error, setError] = useState("");
  const { mutate, isPending } = usePassword();

  const form = useForm<z.infer<typeof setPasswordSchema>>({
    resolver: zodResolver(setPasswordSchema),
    defaultValues: {
      regSessionId: data.regSessionId,
      password: undefined,
    },
  });

  function onSubmit(data: z.infer<typeof setPasswordSchema>) {
    setError("");
    mutate(
      {
        json: {
          ...data,
        },
      },
      {
        onSuccess: (data) => {
          console.log(data);
          // @ts-ignore
          value.regSessionId = data.data.regSessionId;

          onNext();
        },
        onError: async (error) => {
          setError(error.message);
        },
      },
    );
  }
  return (
    <div className="w-full h-full">
      <div className="flex flex-col justify-between flex-1 w-full  h-full">
        <div className="">
          <div className="font-semibold text-2xl mb-2">Password</div>
          <p className="text-muted-foreground">Set your password</p>
          <form
            className="mt-10 space-y-3"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FieldGroup>
              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <Input
                      {...field}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      placeholder="Enter "
                      autoComplete="off"
                      className="bg-white"
                      type="password"
                      maxLength={8}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button className="w-full mt-6" size={"lg"}>
              {isPending ? (
                <LoaderCircleIcon className="animate-spin text-white size-4" />
              ) : (
                <>
                  Proceed <MoveRightIcon className="size-4" />
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
