"use client";
import { Button } from "@/components/ui/button";
import { useOpenCandidateModal } from "@/features/candidate/hook/use-open-candidate";
import { ClockFadingIcon, Infinity, MoveRightIcon } from "lucide-react";
import { useRouter } from "next/navigation";

const LiveResultPage = () => {
  const { open } = useOpenCandidateModal();
  const router = useRouter();
  return (
    <div className="max-w-3xl mx-auto min-h-full bg-white rounded-md">
      <div className="p-4 w-full h-full bg-white rounded-md">
        <div className="mb-3 space-y-3">
          <h1 className="text-2xl font-semibold mb-3">Live Result</h1>
          <h1 className="text-lg font-semibold mb-3">Presidential Election</h1>
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 text-text-color2">
                <Infinity className="size-4" />
                <p className="text-sm">Total votes</p>
              </div>
              <div className="font-semibold text-2xl">23,456,980</div>
            </div>
            <div className="text-sm text-text-color2 flex items-center gap-2">
              <ClockFadingIcon className="size-4" />
              <p>Voting ends in 8hrs</p>
            </div>
          </div>
        </div>

        <div className="">
          <div className="rounded-md space-y-3 grid grid-cols-1 md:grid-cols-2 gap-4 ">
            <div className="flex items-center p-3 rounded-md gap-4 border shadow-sm ">
              <div className="flex-1/3 w-full h-20 border rounded-sm bg-yellow-100">
                <img
                  src={"/img-1.png"}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-2/3 flex-col">
                <p className="font-semibold">John Doe</p>
                <p className="text-xs text-text-color2">
                  Votes:{" "}
                  <span className="text-base text-text-color font-semibold">
                    30,000
                  </span>
                </p>
              </div>
            </div>
            <div className="flex items-center p-3 rounded-md gap-4 border shadow-sm ">
              <div className="flex-1/3 w-full h-20 border rounded-sm bg-yellow-100">
                <img
                  src={"/img-1.png"}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-2/3 flex-col">
                <p className="font-semibold">John Doe</p>
                <p className="text-xs text-text-color2">
                  Votes:{" "}
                  <span className="text-base text-text-color font-semibold">
                    30,000
                  </span>
                </p>
              </div>
            </div>
            <div className="flex items-center p-3 rounded-md gap-4 border shadow-sm ">
              <div className="flex-1/3 w-full h-20 border rounded-sm bg-yellow-100">
                <img
                  src={"/img-1.png"}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-2/3 flex-col">
                <p className="font-semibold">John Doe</p>
                <p className="text-xs text-text-color2">
                  Votes:{" "}
                  <span className="text-base text-text-color font-semibold">
                    30,000
                  </span>
                </p>
              </div>
            </div>
          </div>
          <div className="mt-6 w-full flex items-center justify-center">
            <Button className="w-1/2" onClick={() => router.push("/home")}>
              Exit <MoveRightIcon className="size-6" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveResultPage;
