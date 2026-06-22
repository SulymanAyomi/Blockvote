"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { CandidateModal } from "@/features/candidate/components/candidate-modal";
import { CandidateType } from "@/features/candidate/type";
import { MoveRightIcon } from "lucide-react";
import { useRouter } from "next/navigation";

const SingleVotePage = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const candidates: CandidateType[] = [];
  const [data, setData] = useState<CandidateType>();

  const open = (id: string) => {
    const dd = candidates.find((c) => id === c.id);
    setData(dd);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
  };

  return (
    <div className="max-w-3xl mx-auto py-10 p-4 w-full h-full bg-white rounded-md">
      <CandidateModal
        close={close}
        data={data}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />

      <div className="mb-3">
        <h1 className="text-2xl font-semibold mb-3">Presidential Election</h1>
        <p className="text-sm text-text-color2">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quaerat,
          natus sit molestias aut, dolorum unde in distinctio impedit nemo
          pariatur possimus? Ducimus molestias dolores corrupti aspernatur, esse
          nulla pariatur deserunt?
        </p>
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Status</p>
          <p className="py-2 text-sm px-2 bg-yellow-200 text-yellow-700 rounded-md">
            Ongoing
          </p>
        </div>
        <div className="flex flex-col items-start gap-2">
          <p className="text-sm font-semibold">Countdown</p>
          <div className="flex flex-col gap-2 items-start">
            <div className="h-2 w-90 rounded-xl bg-green-500"></div>
            {/* <Progress
                    value={project.stats.completionPercentage}
                    className="bg-neutral-400 text-blue-500"
                  ></Progress> */}
            <p className="text-xs text-green-900">8hrs of 9hrs</p>
          </div>
        </div>
      </div>
      <div className="border-t">
        <p className="font-semibold py-3">Contestants</p>
        <div className="rounded-md space-y-3 grid gap-4 grid-cols-1 md:grid-cols-2">
          <div className="flex items-center p-3 rounded-md gap-4 border shadow-sm">
            <div className="flex-1/3 w-full h-20 border rounded-sm bg-yellow-100">
              <img
                src={"/img-1.png"}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-2/3 flex-col">
              <p className="font-semibold">John Doe</p>
              <div className="flex gap-2 items-center text-xs">
                <img
                  src={"/img-3.jpg"}
                  className="size-10 object-cover rounded-full"
                />
                <p className="text-muted-foreground text-xs">APC party</p>
              </div>
              <Button size={"xs"} className="w-fit" onClick={() => open("id")}>
                View details
              </Button>
            </div>
          </div>
          <div className="flex items-center p-3 rounded-md gap-4 border shadow-sm">
            <div className="flex-1/3 w-full h-20 border rounded-sm bg-yellow-100">
              <img
                src={"/img-1.png"}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-2/3 flex-col">
              <p className="font-semibold">John Doe</p>
              <div className="flex gap-2 items-center text-xs">
                <img
                  src={"/img-3.jpg"}
                  className="size-10 object-contain rounded-xs"
                />
                <p className="text-muted-foreground text-xs">APC1 party</p>
              </div>
              <Button size={"xs"} className="w-fit" onClick={() => open()}>
                View details
              </Button>
            </div>
          </div>
          <div className="flex items-center p-3 rounded-md gap-4 border shadow-sm">
            <div className="flex-1/3 w-full h-20 border rounded-sm bg-yellow-100">
              <img
                src={"/img-1.png"}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-2/3 flex-col">
              <p className="font-semibold">John Doe</p>
              <div className="flex gap-2 items-center text-xs">
                <img
                  src={"/img-3.jpg"}
                  className="size-10 object-contain rounded-xs"
                />
                <p className="text-muted-foreground text-xs">APC party</p>
              </div>
              <Button size={"xs"} className="w-fit">
                View details
              </Button>
            </div>
          </div>
          <div className="flex items-center p-3 rounded-md gap-4 border shadow-sm">
            <div className="flex-1/3 w-full h-20 border rounded-sm bg-yellow-100">
              <img
                src={"/img-1.png"}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-2/3 flex-col">
              <p className="font-semibold">John Doe</p>
              <div className="flex gap-2 items-center text-xs">
                <img
                  src={"/img-3.jpg"}
                  className="size-10 object-contain rounded-xs"
                />
                <p className="text-muted-foreground text-xs">APC party</p>
              </div>
              <Button size={"xs"} className="w-fit">
                View details
              </Button>
            </div>
          </div>
        </div>
        <div className="mt-6 w-full">
          <Button
            className="w-full"
            onClick={() => router.push("/elections/123d/vote")}
          >
            Join Online Vote <MoveRightIcon className="size-6" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SingleVotePage;
