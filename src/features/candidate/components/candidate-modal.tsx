"use client";
import { ResponsiveModal } from "@/components/responsive-modal";
import CandidateComponent from "./candidate";
import { useOpenCandidateModal } from "../hook/use-open-candidate";
import { CandidateType } from "../type";
import { CandidateWrapper } from "./candidate-wrapper";

interface CandidateModalProps {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  close: () => void;
  candidateId: string;
  electionId: string;
}
export const CandidateModal = ({
  isOpen,
  setIsOpen,
  close,
  electionId,
  candidateId,
}: CandidateModalProps) => {
  return (
    <ResponsiveModal open={isOpen} onOpenChange={setIsOpen}>
      <CandidateWrapper
        onCancel={close}
        candidateId={candidateId}
        electionId={electionId}
      />
    </ResponsiveModal>
  );
};
