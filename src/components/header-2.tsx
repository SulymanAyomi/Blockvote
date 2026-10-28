"use client";
import { Link, X } from "lucide-react";
import React from "react";
import { Btn } from "./btn";
import { Logo } from "./logo";

const Header2 = () => {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 lg:px-8">
      <Link href="/dashboard" className="flex items-center gap-3">
        <Logo className="h-9 w-9" />
        <div>
          <b className="block font-serif text-base leading-tight text-slate-900">
            Student Election Portal
          </b>
          <span className="block text-xs text-slate-600">
            Hartwell University
          </span>
        </div>
      </Link>
      <Btn variant="ghost" to={`/elections/`} icon={X}>
        Exit voting
      </Btn>
    </header>
  );
};

export default Header2;
