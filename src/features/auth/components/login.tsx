"use client";
import { useState, useMemo } from "react";
import { z } from "zod";
import { Eye, EyeOff, Check, X, Vote, LoaderCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataType } from "../type";
import { usePassword } from "../api/use-password";
import { useRouter } from "next/navigation";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { Controller, useForm } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoginSchema } from "../schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLogin } from "../api/use-login";

export default function SignInComponent() {
  const router = useRouter();
  const [showPw, setShowPw] = useState(false);
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState("");

  const { mutate, isPending } = useLogin();

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      id: "NIN",
      idNumber: "",
      password: "",
    },
  });

  function handleSubmit(data: z.infer<typeof LoginSchema>) {
    setError("");
    setTouched(true);
    mutate(
      {
        json: data,
      },
      {
        onError: (error) => {
          setError(error.message);
        },
      },
    );
  }

  return (
    <div className="min-h-screen w-full flex justify-center p-4 font-serif">
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        noValidate
        className="w-full max-w-md bg-white rounded-sm p-7 pt-0"
      >
        {/* Header */}
        <div className="flex items-start gap-3 mb-5">
          <div className="w-9.5 h-9.5 rounded-full bg-[#FBEAE7] flex items-center justify-center shrink-0 mt-0.5">
            <Vote size={20} className="text-[#B23A2E]" strokeWidth={2.25} />
          </div>
          <div>
            <div className="font-mono text-[11px] tracking-wider uppercase text-[#B23A2E] font-semibold mb-1">
              Student Voting Platform
            </div>
            <h1 className="text-xl font-semibold text-[#1B2A41] leading-tight">
              Login to your account
            </h1>
          </div>
        </div>
        <FieldGroup>
          <Controller
            name="id"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="gap-1.5">
                <label
                  htmlFor="id"
                  className="block font-sans text-xs font-semibold text-[#1B2A41]"
                >
                  Identification Type
                </label>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-full bg-brand-ash">
                    <SelectValue placeholder="Identification Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>
                        Please Select an identification type
                      </SelectLabel>
                      <SelectItem value={"NIN"}>
                        National Identification Number (NIN)
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="idNumber"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="gap-1.5">
                <label
                  htmlFor="pwa"
                  className="block font-sans text-xs font-semibold text-[#1B2A41]"
                >
                  Identification number
                </label>
                <div className="relative flex items-center">
                  <Input
                    {...field}
                    id={field.name}
                    type="text"
                    inputMode="numeric"
                    maxLength={11}
                    onBlur={() => setTouched(true)}
                    placeholder="Enter Identification number"
                    aria-describedby="pw-requirements"
                    className={`w-full font-sans text-[15px] text-[#1B2A41] bg-white rounded-sm border-[1.5px] outline-none pl-3 pr-10 py-2.5 transition-colors`}
                  />
                </div>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="gap-1.5">
                <label
                  htmlFor="password"
                  className="block font-sans text-xs font-semibold text-[#1B2A41]"
                >
                  Password
                </label>
                <div className="relative flex items-center">
                  <Input
                    {...field}
                    id={field.name}
                    type={showPw ? "text" : "password"}
                    placeholder="Type password"
                    className={`w-full font-sans text-[15px] text-[#1B2A41] bg-white rounded-sm border-[1.5px] outline-none pl-3 pr-10 py-2.5 transition-colors`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((s) => !s)}
                    aria-label={showPw ? "Hide password" : "Show password"}
                    className="absolute right-3 flex items-center justify-center text-[#6B6656] hover:text-[#1B2A41]"
                  >
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>

        {error && (
          <div className="flex items-center font-sans text-[12.5px] text-[#B23A2E] mt-2">
            <X size={13} className="mr-1.5 shrink-0" />
            {error}
          </div>
        )}

        <Button
          type="submit"
          className={
            "w-full mt-7 py-3 font-sans text-[14.5px] font-semibold tracking-wide transition-opacity"
          }
        >
          {isPending ? (
            <LoaderCircleIcon className="animate-spin text-white size-4" />
          ) : (
            <>Login</>
          )}
        </Button>
      </form>
    </div>
  );
}
