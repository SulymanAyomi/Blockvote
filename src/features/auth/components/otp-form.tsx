"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { cn } from "@/lib/utils";
import {
  Loader2Icon,
  LucideArrowRight,
  PencilIcon,
  MessageCircleMoreIcon,
} from "lucide-react";
import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
// import { useVerifyOTP } from "../api/use-verify-otp";
// import { useOpenLoginModal } from "../hook/use-login";
// import { signIn, useSession } from "next-auth/react";
// import { useAuthUser } from "@/context/Auth-context";
// import { useQueryClient } from "@tanstack/react-query";

interface LoginFormProps {
  className?: string;
  email?: string;
  prevStep: () => void;
  onNext: () => void;
}
export function OTPForm({
  className,
  prevStep,
  email,
  onNext,
}: LoginFormProps) {
  // const queryClient = useQueryClient();
  const [value, setValue] = useState("");
  const [errors, setErrors] = useState("");
  // const { close } = useOpenLoginModal();
  // const { data: session } = useSession();
  // const { mutate, isPending } = useVerifyOTP();

  // useEffect(() => {
  //   if (session) {
  //     close();
  //   }
  // }, [close, session]);
  // const loginCall = async () => {
  //   const res = await signIn("credentials", {
  //     email,
  //     otpVerified: "true",
  //     redirect: false,
  //   });
  //   queryClient.invalidateQueries({ queryKey: ["my-profile"] });
  //   if (res.error) {
  //     setErrors("Something went wrong. Please try again.");
  //   }
  // };
  // const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   setErrors("");
  //   mutate(
  //     {
  //       json: {
  //         email,
  //         otp: value,
  //       },
  //     },
  //     {
  //       async onSuccess(data) {
  //         if (data.success) {
  //           await loginCall();
  //         }
  //       },
  //       onError(data) {
  //         setErrors(data.message);
  //       },
  //     }
  //   );
  // };
  return (
    <div className="w-full h-full">
      <div className="flex flex-col justify-between flex-1 w-full  h-[90%]">
        <div className="flex-2/3">
          <div className="font-semibold text-2xl mb-2">
            Verify Your Identity
          </div>
          <p className="text-muted-foreground">
            Enter the 6-digits sent to 080******94
          </p>
          <div className="mt-10 space-y-9">
            <div className="space-y-1 w-full flex items-center justify-center text-center">
              <MessageCircleMoreIcon className="size-40 text-primary-col" />
            </div>
            <div className="space-y-1 w-full mb-2.5">
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
            </div>
          </div>
        </div>

        <Button className="w-full" size={"lg"} onClick={onNext}>
          Proceed <LucideArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
