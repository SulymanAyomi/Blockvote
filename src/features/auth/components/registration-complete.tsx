import { Button } from "@/components/ui/button";
import { CheckCircle, CheckCircleIcon } from "lucide-react";
import React from "react";
import { useParams, useRouter } from "next/navigation";

const RegistrationComplete = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col justify-between flex-1 w-full  h-full">
      <div className="flex items-center flex-col justify-center flex-2/3">
        <CheckCircleIcon className="size-40 text-primary-col" />
        <p className="font-semibold text-xl mt-5">Registration successful</p>
      </div>
      <Button
        className="w-full my-5"
        size={"lg"}
        onClick={() => router.push("/home")}
      >
        Complete
      </Button>
    </div>
  );
};

export default RegistrationComplete;
