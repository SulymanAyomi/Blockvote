"use client";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  MessageCircleMoreIcon,
  LoaderCircleIcon,
  MoveRightIcon,
  Vote,
} from "lucide-react";
import { FormEvent, useState } from "react";
import { useVerifyOtp } from "../api/use-otp";
import { DataType } from "../type";

interface LoginFormProps {
  data: DataType;
  prevStep: () => void;
  onNext: () => void;
}
export function OTPForm({ data, prevStep, onNext }: LoginFormProps) {
  const [value, setValue] = useState("");
  const [errors, setErrors] = useState("");

  const { mutate, isPending } = useVerifyOtp();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setErrors("");
    mutate(
      {
        json: {
          regSessionId: data.regSessionId,
          otp: value,
        },
      },
      {
        onSuccess(data) {
          if (data.success) {
            onNext();
          }
        },
        onError(data) {
          setErrors(data.message);
        },
      },
    );
  };
  return (
    <div className="w-full h-full">
      <div className="flex flex-col justify-between flex-1 w-full  h-[90%]">
        <div className="flex-2/3">
          <div className="flex items-start gap-3 mb-5">
            <div className="w-9.5 h-9.5 rounded-full bg-[#FBEAE7] flex items-center justify-center shrink-0 mt-0.5">
              <Vote size={20} className="text-[#B23A2E]" strokeWidth={2.25} />
            </div>
            <div>
              <div className="font-mono text-[11px] tracking-wider uppercase text-[#B23A2E] font-semibold mb-1">
                Student Voting Platform
              </div>
              <h1 className="text-xl font-semibold text-[#1B2A41] leading-tight">
                Verify Your Identity
              </h1>
              <p className="text-muted-foreground">
                Enter the 6-digits sent to your mail
              </p>
            </div>
          </div>

          <div className="mt-10 space-y-9">
            <div className="space-y-1 w-full flex items-center justify-center text-center">
              <MessageCircleMoreIcon className="size-40 text-primary-col" />
            </div>
            <form
              onSubmit={(e) => handleSubmit(e)}
              className="space-y-1 w-full mb-2.5"
            >
              <FieldGroup>
                <Field>
                  <InputOTP
                    maxLength={6}
                    id="otp"
                    required
                    value={value}
                    onChange={(value) => setValue(value)}
                    className="w-full flex items-center justify-center"
                  >
                    <InputOTPGroup className="gap-2.5 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border *:data-[slot=input-otp-slot]:border-primary-col *:data-[slot=input-otp-slot]:text-primary-col *:data-[slot=input-otp-slot]:bg-transparent w-full flex items-center justify-center">
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                  {errors && (
                    <p className="text-center text-xs text-red-500">{errors}</p>
                  )}
                </Field>
              </FieldGroup>

              <Button className="w-full mt-4" size={"lg"}>
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
    </div>
  );
}
