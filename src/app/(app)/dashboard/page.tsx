"use client";
import { H1, STUDENT } from "@/lib/helpers";
import { Btn } from "@/components/btn";
import DashboardClient from "./dashboard-client";
import { useGetUserInformation } from "@/features/auth/api/use-get-user";
import { SkelCards } from "@/components/skeleton-cards";
import { ErrorState } from "@/features/error/error-state";

function DashboardPage() {
  const { data, isLoading, error, refetch } = useGetUserInformation();

  if (isLoading) {
    return (
      <div className="mt-7">
        <SkelCards n={2} />
      </div>
    );
  }

  if (error) return <ErrorState error={error} retry={() => refetch()} />;
  const student = data?.data;
  if (!student) return <ErrorState error={error} retry={() => refetch()} />;
  return (
    <div>
      <section
        aria-labelledby="wl"
        className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 md:p-9"
      >
        <span
          aria-hidden="true"
          className="absolute -right-12 -top-12 h-56 w-56 rounded-full border-8 border-blue-100"
        />
        <div className="relative">
          <h1 id="wl" className={H1}>
            Welcome back, {student.fullName}
          </h1>
          <p className="mb-5 mt-2 max-w-prose text-slate-600">
            Stay informed about your school elections and make your voice count.
          </p>
          <Btn to="/elections?filter=active" size="lg">
            View Active Elections
          </Btn>
        </div>
      </section>
      <DashboardClient />
    </div>
  );
}

export default DashboardPage;
