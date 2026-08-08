"use client";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { LoaderCircleIcon, MessageCircleMoreIcon } from "lucide-react";
import { FormEvent, useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";
import { useVerifyLoginOtp } from "../api/use-login-otp";

interface OTPFormProps {
  vid: string;
}
export function OTPForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const vid = searchParams.get("vid");
  const email = searchParams.get("email");

  const [verId, setVerId] = useState(vid ?? "");
  const [value, setValue] = useState("");

  const [errors, setErrors] = useState("");
  const { mutate, isPending } = useVerifyLoginOtp();
  const changeVerId = (id: string) => {
    setVerId(id);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!verId) {
      setErrors("Invalid code.");
      return;
    }
    setErrors("");
    mutate(
      {
        json: {
          vid: verId,
          otp: value,
        },
      },
      {
        onError: async (error) => {
          setErrors(error.message);
        },
      },
    );
  };
  return (
    <div className="min-h-screen w-full max-w-md mx-auto flex justify-center p-4 font-serif">
      <div className="flex flex-col justify-between flex-1 w-full  h-[90%]">
        <div className="flex-2/3">
          <div className="font-semibold text-2xl mb-2">
            Verify Your Identity
          </div>
          <p className="text-muted-foreground">
            Enter the 6-digits sent to email
          </p>
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
                  <>Verify</>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
