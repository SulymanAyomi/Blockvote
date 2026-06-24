import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOpenCandidateModal } from "@/features/candidate/hook/use-open-candidate";
import { useConfirm } from "@/hooks/use-confirm";
import {
  ArrowRightIcon,
  ChevronRightIcon,
  FingerprintIcon,
  MoveRightIcon,
  SearchIcon,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import mockPolls from "@/lib/data";

interface VoteComponentProps {
  changeCompleteVote: () => void;
}
const VoteComponent = ({ changeCompleteVote }: VoteComponentProps) => {
  const { open } = useOpenCandidateModal();
  const router = useRouter();
  const params = useParams();
  const electionId = params.electionId as string;
  const election = mockPolls.find((election) => election.id == electionId);

  const [ConfirmDialog, confirm] = useConfirm(
    "Confirmation",
    "Are you sure you want to vote for Ademola Tolu. Your vote cannot be changed.",
    "default",
    "text-primary-col font-bold",
    "text-black",
  );
  const onVote = async () => {
    const ok = await confirm();
    changeCompleteVote();
  };

  if (!election) {
    return (
      <div className="max-w-3xl mx-auto py-10 p-4 w-full h-full bg-white rounded-md">
        No election data
      </div>
    );
  }

  return (
    <div>
      <ConfirmDialog />
      <div className="p-4 w-full h-full bg-white rounded-md">
        <div className="mb-3 space-y-3">
          <h1 className="text-2xl font-semibold mb-3">{election.title}</h1>
        </div>
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <p className="font-semibold py-3">
              {election?.pollType == "Candidate" ? "Contestants" : "Options"}
            </p>
            <div className="relative hidden">
              <div className="absolute pl-1 text-neutral-500 top-1/2 transform -translate-y-1/2 ">
                <SearchIcon className="size-4 text-text-color" />
              </div>
              <Input
                placeholder="Search Candidate"
                className="pl-7 focus-visible:ring-blue-500 focus-visible:border-none bg-muted"
              />
            </div>
            <div>
              <SearchIcon className="size-4 text-text-color mr-4" />
            </div>
          </div>
          <div className="rounded-md space-y-3 grid grid-cols-1 md:grid-cols-2 gap-4 ">
            {election?.pollType == "Candidate"
              ? election.candidates?.map((candidate) => (
                  <div className="flex items-center p-3 rounded-md gap-4 border shadow-sm">
                    <div className="flex-1/3 w-full h-20 border rounded-sm bg-yellow-100">
                      <img
                        src={candidate.candidateImage}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex flex-2/3 flex-col">
                      <p className="font-semibold">{candidate.name}</p>
                      <div className="flex gap-2 items-center text-xs">
                        <img
                          src={candidate.partyImage}
                          className="size-10 object-cover rounded-full"
                        />
                        <p className="text-muted-foreground text-xs">
                          {candidate.partyName}
                        </p>
                      </div>
                      <Button
                        size={"xs"}
                        className="w-1/2 flex text-center items-center justify-center gap-2"
                        onClick={onVote}
                      >
                        <FingerprintIcon /> Vote <ChevronRightIcon />
                      </Button>
                    </div>
                  </div>
                ))
              : election?.options?.map((option) => (
                  <div className="flex items-center p-3 rounded-md gap-4 border shadow-sm">
                    <div className="flex-1/3 w-full h-20 border rounded-sm bg-yellow-100">
                      <img
                        src={option.image}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex flex-2/3 flex-col">
                      <p className="font-semibold">{option.label}</p>
                      <Button
                        size={"xs"}
                        className="w-1/2 flex text-center items-center justify-center gap-2"
                        onClick={onVote}
                      >
                        <FingerprintIcon /> Vote <ChevronRightIcon />
                      </Button>
                    </div>
                  </div>
                ))}
          </div>
          <div className="mt-6 w-full">
            <Button
              className="w-full shadow-none text-primary-col hover:text-primary-col/80"
              variant={"outline"}
              onClick={() =>
                router.push(`/elections/${electionId}/live-result`)
              }
            >
              Check Live Result <MoveRightIcon className="size-6" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoteComponent;
