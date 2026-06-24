"use client";
import { ResponsiveModal } from "@/components/responsive-modal";
import CandidateComponent from "./candidate";
import { useOpenCandidateModal } from "../hook/use-open-candidate";
import { CandidateType } from "../type";

interface CandidateModalProps {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  close: () => void;
  data: CandidateType | undefined;
}
export const CandidateModal = ({
  isOpen,
  setIsOpen,
  close,
  data,
}: CandidateModalProps) => {
  return (
    <ResponsiveModal open={isOpen} onOpenChange={setIsOpen}>
      <CandidateComponent onCancel={close} data={data} />
    </ResponsiveModal>
  );
};
