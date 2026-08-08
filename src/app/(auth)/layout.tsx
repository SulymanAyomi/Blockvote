"use client";
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
          <Link href="/" className="flex items-center gap-1">
            <div className="rounded-full p-1 bg-primary-col w-fit">
              <CheckIcon className="size-3 text-white" />
            </div>
            <p className="text-brand1 font-semibold hidden lg:block">
              BlockVote
            </p>
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
