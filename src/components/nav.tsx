"use client";
import { usePathname } from "next/navigation";

import {
  Bell,
  ChevronRight,
  HelpCircle,
  History,
  LayoutDashboard,
  LogOut,
  MoreHorizontal,
  ShieldCheck,
  User,
  Vote,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { matchRoute } from "@/lib/helpers";
import { cx } from "class-variance-authority";
import { Logo } from "./logo";

function Nav() {
  const NAV = [
    {
      to: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      m: ["dashboard", "announcements"],
    },
    {
      to: "/elections",
      label: "Elections",
      icon: Vote,
      m: ["elections", "election", "confirmation", "results"],
    },
    {
      to: "/votes",
      label: "My Voting Activity",
      icon: History,
      m: ["votes"],
    },
    {
      to: "/notifications",
      label: "Notifications",
      icon: Bell,
      m: ["notifications"],
    },
    { to: "/profile", label: "Profile", icon: User, m: ["profile"] },
    { to: "/help", label: "Help", icon: HelpCircle, m: ["help", "how"] },
  ];

  const pathname = usePathname();
  const r = matchRoute(pathname);

  const navCls = (on: boolean) =>
    cx(
      "flex h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-medium",
      on
        ? "border-l-4 border-blue-700 bg-blue-50 font-semibold text-blue-900"
        : "text-slate-700 hover:bg-slate-100",
    );
  const unread = 3;
  const signOut = () => {};

  return (
    <aside
      aria-label="Sidebar"
      className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white p-4 lg:flex"
    >
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
      <nav aria-label="Main" className="mt-7 flex flex-1 flex-col gap-0.5">
        {NAV.map((n) => {
          const Icon = n.icon;
          return (
            <Link
              key={n.to}
              href={n.to}
              className={navCls(n.m.includes(r.name))}
              aria-current={n.m.includes(r.name) ? "page" : undefined}
            >
              <Icon size={20} aria-hidden="true" />
              {n.label}
              {n.to === "/notifications" && unread > 0 && (
                <span
                  className="ml-auto rounded-full bg-blue-700 px-2 text-xs font-bold text-white"
                  aria-label={`${unread} unread`}
                >
                  {unread}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <Separator className="mb-3" />
      <button type="button" className={navCls(false)} onClick={signOut}>
        <LogOut size={20} aria-hidden="true" />
        Logout
      </button>
    </aside>
  );
}

export default Nav;
