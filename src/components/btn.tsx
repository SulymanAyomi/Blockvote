"use client";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { BV, cx } from "@/lib/helpers";
import Link from "next/link";
import type { ComponentProps, ElementType } from "react";
import type { LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";

interface BtnProps extends ComponentProps<"button"> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "default" | "lg";
  to?: string;
  icon?: LucideIcon;
  loading?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function Btn({
  variant = "primary",
  size,
  to,
  icon: Icon,
  loading = false,
  className,
  children,
  ...p
}: BtnProps) {
  const router = useRouter();

  const cls = cx(
    "h-11 gap-2 rounded-lg px-5 text-base font-semibold",
    size === "lg" ? "h-12 px-7" : "",
    BV[variant],
    className ? className : "",
  );

  const inner = (
    <>
      {loading ? (
        <Loader2 size={18} className="animate-spin" aria-hidden="true" />
      ) : Icon ? (
        <Icon size={18} aria-hidden="true" />
      ) : null}

      {children}
    </>
  );

  if (to) {
    return (
      <Button asChild className={cls}>
        <Link
          href={"#" + to}
          onClick={(e) => {
            if (e.metaKey || e.ctrlKey) return;
            e.preventDefault();
            router.push(to);
          }}
        >
          {inner}
        </Link>
      </Button>
    );
  }

  return (
    <Button type="button" className={cls} {...p}>
      {inner}
    </Button>
  );
}
