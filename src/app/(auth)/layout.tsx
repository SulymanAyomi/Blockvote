"use client";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { CheckIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  const pathname = usePathname();
  const isSignIn = pathname === "/login";
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-screen-2xl p-4">
        <nav className="flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-3">
            <Logo />
            <div>
              <b className="block font-serif text-base leading-tight text-slate-900">
                Al-Hikmah University
              </b>
              <span className="block text-xs text-slate-600">
                Student Election Portal
              </span>
            </div>
          </Link>
          <Button variant="secondary">
            <Link href={isSignIn ? "/register" : "/login"}>
              {isSignIn ? "Register" : "Login"}
            </Link>
          </Button>
        </nav>
        <div className="">{children}</div>
      </div>
    </main>
  );
};

export default AuthLayout;
