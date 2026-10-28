import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Dialog,
} from "@/components/ui/dialog";
import { cx } from "class-variance-authority";
import { ReactNode } from "react";
type ModalProps = {
  /** Dialog heading — rendered as the accessible title. */
  title: ReactNode;
  /** Optional supporting text. Also enables the a11y description wiring. */
  description?: ReactNode;
  /** Called when the user dismisses the dialog (Esc, overlay, close button). */
  onClose: () => void;
  /** Main body of the modal. */
  children: ReactNode;
  /** Optional footer, typically actions. */
  footer?: ReactNode;
  /** Extra classes merged onto the DialogContent. */
  className?: string;
};
export function Modal({
  title,
  description,
  onClose,
  children,
  footer,
  className,
}: ModalProps) {
  return (
    <Dialog
      open
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent
        className={cx(
          "max-h-screen max-w-md overflow-y-auto rounded-2xl",
          className,
        )}
        {...(description ? {} : { "aria-describedby": undefined })}
      >
        <DialogHeader>
          <DialogTitle className="font-serif text-xl font-bold text-slate-900">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-slate-600">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        {children}
        {footer && (
          <DialogFooter className="gap-2 sm:gap-2">{footer}</DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
