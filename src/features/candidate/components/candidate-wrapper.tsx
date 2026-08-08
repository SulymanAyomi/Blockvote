import { Card, CardContent } from "@/components/ui/card";
import { Loader2Icon } from "lucide-react";
import { useGetCandidate } from "../api/use-get-election";
import CandidateComponent from "./candidate";

interface CandidateWrapperProps {
  onCancel: () => void;
  electionId: string;
  candidateId: string;
}

export const CandidateWrapper = ({
  onCancel,
  electionId,
  candidateId,
}: CandidateWrapperProps) => {
  const { data, isLoading } = useGetCandidate({
    electionId,
    candidateId,
  });

  if (isLoading) {
    return (
      <Card className="w-full h-178.5 border-none shadow-none">
        <CardContent className="flex items-center justify-center h-full">
          <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="w-full h-178.5 border-none shadow-none">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-3xl font-semibold text-center">
            No candidate data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return <CandidateComponent onCancel={onCancel} data={data?.data} />;
};
