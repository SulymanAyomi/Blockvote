import { Button } from "@/components/ui/button";
import { CheckCircleIcon, HomeIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

interface CompleteVoteComponentProps {
  id: string;
}
const CompleteVoteComponent = ({ id }: CompleteVoteComponentProps) => {
  const router = useRouter();
  return (
    <div className="flex flex-col my-auto justify-evenly flex-1 w-full  h-full">
      <div className="flex items-center flex-col justify-center flex-2/3">
        <CheckCircleIcon className="size-40 text-primary-col" />
        <p className="font-semibold text-xl mt-5">Your vote successful</p>
      </div>
      <div className="w-full flex items-center justify-evenly">
        <Button
          className="my-5"
          size={"lg"}
          variant={"outline"}
          onClick={() => router.push("/home")}
        >
          Home <HomeIcon />
        </Button>
        <Button
          className="my-5"
          size={"lg"}
          onClick={() => router.push(`/elections/${id}/live-result`)}
        >
          Live Result
        </Button>
      </div>
    </div>
  );
};

export default CompleteVoteComponent;
