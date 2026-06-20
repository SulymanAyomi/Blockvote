import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LucideArrowRight } from "lucide-react";
import React, { useState } from "react";

interface PersonalInfoProps {
  onNext: () => void;
}
const PersonalInfo = ({ onNext }: PersonalInfoProps) => {
  const [data, setData] = useState({
    name: "Sulyman Ayo",
    DOB: "12-12-2026",
    number: "08098765432",
    state: "Kwara state",
    LGA: "Ilorin-west",
    Address: "27, Gaa-akanbi ilorin ",
  });
  const disabled = true;
  return (
    <div className="flex flex-col justify-between flex-1 w-full  h-[90%]">
      <div className="">
        <div className="font-semibold text-2xl mb-2">
          Confirm your personal Information
        </div>
        <div className="space-y-3">
          <div className="flex w-full items-center justify-center">
            <div className="flex items-center justify-center size-16 rounded-full overflow-hidden transition border border-neutral-300">
              <img
                className="w-fit h-fit rounded-full object-cover"
                src="/img-1.png"
              />
            </div>
          </div>

          <div className="space-y-3 w-full">
            <Input
              className="w-full bg-accent disabled:opacity-100"
              // onBlur={() => validateField("firstName")}
              disabled={disabled}
              value={data.name}
            />
            <Input
              className="w-full bg-accent disabled:opacity-100"
              // onBlur={() => validateField("firstName")}
              disabled={disabled}
              value={data.DOB}
            />
            <Input
              className="w-full bg-accent disabled:opacity-100"
              // onBlur={() => validateField("firstName")}
              disabled={disabled}
              value={data.number}
            />
            <Input
              className="w-full bg-accent disabled:opacity-100"
              disabled={disabled}
              value={data.state}
            />
            <Input
              className="w-full bg-accent disabled:opacity-100"
              disabled={disabled}
              value={data.LGA}
            />
            <Input
              className="w-full bg-accent disabled:opacity-100"
              disabled={disabled}
              value={data.Address}
            />
          </div>
        </div>
      </div>
      <Button className="w-full my-5" size={"lg"} onClick={onNext}>
        Confirm <LucideArrowRight className="size-4" />
      </Button>
    </div>
  );
};

export default PersonalInfo;
