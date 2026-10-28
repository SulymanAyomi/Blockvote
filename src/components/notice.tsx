import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cx } from "class-variance-authority";
import { AlertTriangle, LucideIcon } from "lucide-react";
import { ComponentProps } from "react";

interface NoticeProps extends ComponentProps<"div"> {
  tone?: "warn" | "error" | "info" | "ok";
  icon?: LucideIcon;
  className?: string;
  title?: string;
  children: React.ReactNode;
}

export function Notice({
  tone = "warn",
  icon: Icon = AlertTriangle,
  title,
  children,
  className,
  ...p
}: NoticeProps) {
  const t = {
    warn: "border-amber-300 bg-amber-50 text-amber-950",
    error: "border-red-300 bg-red-50 text-red-900",
    info: "border-blue-200 bg-blue-50 text-blue-950",
    ok: "border-green-300 bg-green-50 text-green-900",
  }[tone];
  return (
    <Alert className={cx("rounded-xl px-4 py-3", t, className)} {...p}>
      <div className="flex items-start gap-3">
        <Icon size={20} aria-hidden="true" className="mt-0.5 shrink-0" />
        <div>
          {title && (
            <AlertTitle className="mb-0.5 font-semibold">{title}</AlertTitle>
          )}
          <AlertDescription className="font-medium">
            {children}
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
}
