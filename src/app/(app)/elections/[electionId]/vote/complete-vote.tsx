import { Button } from "@/components/ui/button";
import { useElectionId } from "@/features/elections/hooks/use-get-election-id";
import { CheckCircleIcon, HomeIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

interface CompleteVoteComponentProps {
  id: string;
}
const CompleteVoteComponent = () => {
  const electionId = useElectionId();
  const router = useRouter();
  return (
    <div className="h-screen">
      <div className="flex flex-col gap-8 justify-center items-center flex-1 w-full  h-full">
        <div className="flex items-center flex-col justify-center ">
          <div className="rounded-full bg-emerald-100 p-2">
            <CheckCircleIcon className="size-24 text-emerald-600 bg-transparent" />
          </div>
          <p className="text-xl font-semibold text-slate-900 mt-5">
            Vote successfully submitted
          </p>
          <p className="text-center">
            Your ballot has been securely recorded. Thank you for participating
            in the election
          </p>
        </div>

        <p className="font-semibold">
          You have completed voting in this election.
        </p>

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
            onClick={() => router.push(`/elections/${electionId}/live-result`)}
          >
            Live Result
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CompleteVoteComponent;
