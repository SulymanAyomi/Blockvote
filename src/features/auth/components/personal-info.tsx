import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  LoaderCircleIcon,
  LucideArrowRight,
  MoveRightIcon,
  Vote,
} from "lucide-react";
import React, { useState } from "react";
import { useInfoConfirmation } from "../api/use-info-confirmation";
import { useGetInfo } from "../api/use-get-info";
import PageLoading from "./loading";

interface PersonalInfoProps {
  onNext: () => void;
  regSessionId: string;
}
const PersonalInfo = ({ onNext, regSessionId }: PersonalInfoProps) => {
  // const [data, setData] = useState({
  //   name: "Sulyman Ayo",
  //   DOB: "12-12-2026",
  //   number: "08098765432",
  //   state: "Kwara state",
  //   LGA: "Ilorin-west",
  //   Address: "27, Gaa-akanbi ilorin ",
  // });
  const { data, isLoading } = useGetInfo({ regSessionId });
  const { mutate, isPending } = useInfoConfirmation();
  const disabled = true;
  const handleConfimed = () => {
    mutate(
      {
        json: {
          confirmed: true,
          regSessionId,
        },
      },
      {
        onSuccess: () => {
          onNext();
        },
      },
    );
  };

  return (
    <div className="flex flex-col justify-between flex-1 w-full  h-[90%]">
      <div className="">
        <div className="flex items-start gap-3 mb-5">
          <div className="w-9.5 h-9.5 rounded-full bg-[#FBEAE7] flex items-center justify-center shrink-0 mt-0.5">
            <Vote size={20} className="text-[#B23A2E]" strokeWidth={2.25} />
          </div>
          <div>
            <div className="font-mono text-[11px] tracking-wider uppercase text-[#B23A2E] font-semibold mb-1">
              Student Voting Platform
            </div>
            <h1 className="text-xl font-semibold text-[#1B2A41] leading-tight">
              Confirm your personal Information
            </h1>
          </div>
        </div>

        {isLoading ? (
          <PageLoading />
        ) : (
          <div className="space-y-3">
            <div className="flex w-full items-center justify-center">
              <div className="flex items-center justify-center size-16 rounded-full overflow-hidden transition border border-neutral-300">
                <img
                  className="w-fit h-fit rounded-full object-cover"
                  src={data?.imageUrl ?? ""}
                />
              </div>
            </div>

            <div className="space-y-3 w-full">
              <div className="space-y-2">
                <label
                  htmlFor="id"
                  className="block font-sans text-xs font-semibold text-[#1B2A41]"
                >
                  Full Name
                </label>
                <Input
                  className="w-full bg-accent disabled:opacity-100"
                  // onBlur={() => validateField("firstName")}
                  disabled={disabled}
                  value={data?.fullName}
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="id"
                  className="block font-sans text-xs font-semibold text-[#1B2A41]"
                >
                  Matric no
                </label>
                <Input
                  className="w-full bg-accent disabled:opacity-100"
                  // onBlur={() => validateField("firstName")}
                  disabled={disabled}
                  value={data?.studentId ?? "NULL"}
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="id"
                  className="block font-sans text-xs font-semibold text-[#1B2A41]"
                >
                  Department
                </label>
                <Input
                  className="w-full bg-accent disabled:opacity-100"
                  // onBlur={() => validateField("firstName")}
                  disabled={disabled}
                  value={data?.department ?? "NULL"}
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="id"
                  className="block font-sans text-xs font-semibold text-[#1B2A41]"
                >
                  Level
                </label>
                <Input
                  className="w-full bg-accent disabled:opacity-100"
                  // onBlur={() => validateField("firstName")}
                  disabled={disabled}
                  value={data?.level ?? "NULL"}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="id"
                  className="block font-sans text-xs font-semibold text-[#1B2A41]"
                >
                  Date of birth
                </label>
                <Input
                  className="w-full bg-accent disabled:opacity-100"
                  // onBlur={() => validateField("firstName")}
                  disabled={disabled}
                  value={new Date(data?.dateOfBirth!).toLocaleDateString()}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="id"
                  className="block font-sans text-xs font-semibold text-[#1B2A41]"
                >
                  Email
                </label>
                <Input
                  className="w-full bg-accent disabled:opacity-100"
                  // onBlur={() => validateField("firstName")}
                  disabled={disabled}
                  value={data?.email}
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="id"
                  className="block font-sans text-xs font-semibold text-[#1B2A41]"
                >
                  Phone number
                </label>
                <Input
                  className="w-full bg-accent disabled:opacity-100"
                  // onBlur={() => validateField("firstName")}
                  disabled={disabled}
                  value={data?.phone ?? "NULL"}
                />
              </div>
            </div>
            <Button
              className="w-full my-5"
              size={"lg"}
              onClick={handleConfimed}
            >
              {isPending ? (
                <LoaderCircleIcon className="animate-spin text-white size-4" />
              ) : (
                <>
                  Confirm <MoveRightIcon className="size-4" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalInfo;
