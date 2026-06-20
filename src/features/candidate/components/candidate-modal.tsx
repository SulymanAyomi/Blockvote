"use client";
import { ResponsiveModal } from "@/components/responsive-modal";
import CandidateComponent from "./candidate";
import { useOpenCandidateModal } from "../hook/use-open-candidate";

export const CandidateModal = () => {
  const { isOpen, setIsOpen, close } = useOpenCandidateModal();
  return (
    <ResponsiveModal open={isOpen} onOpenChange={setIsOpen}>
      <CandidateComponent onCancel={close} />
    </ResponsiveModal>
  );
};
