"use client";
import Link from "next/link";
import { matchRoute, TITLES } from "@/lib/helpers";
import { usePathname, useRouter } from "next/navigation";
import { ChevronRight, Bell } from "lucide-react";
import { Logo } from "./logo";
import { Av } from "./user-avatar";
import { useGetUserInformation } from "@/features/auth/api/use-get-user";

const Header = () => {
  const { data } = useGetUserInformation();

  const router = useRouter();
  const pathname = usePathname();
  const r = matchRoute(pathname);
  const name = r.name as keyof typeof TITLES;
  const title = TITLES[name];
  const unread = 3;
  const parent = ["election", "confirmation", "results"].includes(r.name)
    ? ["Elections", "/elections"]
    : r.name === "announcements"
      ? ["Dashboard", "/dashboard"]
      : r.name === "how"
        ? ["Help", "/help"]
        : null;
  const student = data?.data;
  const photo = student?.imageUrl ?? null;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 bg-white px-4 lg:justify-end lg:px-8">
      <Link href="/dashboard" className="lg:hidden" aria-label="Dashboard">
        <Logo className="h-9 w-9" />
      </Link>
      <div className="min-w-0 flex-1 truncate font-serif text-lg font-bold text-slate-900 lg:hidden">
        {title}
      </div>
      <nav
        aria-label="Breadcrumb"
        className="hidden min-w-0 flex-1 items-center gap-1.5 text-sm lg:flex"
      >
        {parent && (
          <>
            <Link href={parent[1]} className="text-slate-600 hover:underline">
              {parent[0]}
            </Link>
            <ChevronRight
              size={16}
              aria-hidden="true"
              className="text-slate-400"
            />
          </>
        )}
        <span aria-current="page" className="font-semibold text-slate-900">
          {title}
        </span>
      </nav>
      <button
        type="button"
        className="relative grid h-11 w-11 place-items-center rounded-lg text-slate-900 hover:bg-slate-100"
        aria-label={
          unread ? `Notifications, ${unread} unread` : "Notifications"
        }
        onClick={() => router.push("/notifications")}
      >
        <Bell size={22} />
        {unread > 0 && (
          <span
            aria-hidden="true"
            className="absolute right-0.5 top-0.5 grid h-5 place-items-center rounded-full bg-blue-700 px-1.5 text-xs font-bold text-white"
          >
            {unread}
          </span>
        )}
      </button>
      {student && (
        <Link
          href="/profile"
          aria-label="Your profile"
          className="hidden items-center gap-2.5 lg:flex"
        >
          <Av name={student?.fullName!} size="sm" src={photo} />
          <div>
            <div className="text-sm font-semibold leading-tight text-slate-900">
              {student?.fullName}
            </div>
            <div className="text-xs text-slate-600">{student?.studentId}</div>
          </div>
        </Link>
      )}
    </header>
  );
};

export default Header;
