import { Btn } from "@/components/btn";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/features/error/error-state";
import { SkelCards } from "@/components/skeleton-cards";
import { Card } from "@/components/ui/card";
import { useGetDashboard } from "@/features/elections/api/use-get-dashboard";
import { H2, fmtDate } from "@/lib/helpers";
import { cx } from "class-variance-authority";
import { Vote, Clock, CheckCircle2, Calendar, Megaphone } from "lucide-react";
import { ElectionCard } from "@/features/elections/components/election-card";

const DashboardClient = () => {
  const { data: dashboard, error, isLoading, refetch } = useGetDashboard();
  if (isLoading) {
    return (
      <div className="mt-7">
        <SkelCards n={2} />
      </div>
    );
  }
  if (error || !dashboard) {
    return <ErrorState error={error} retry={() => refetch()} />;
  }

  const data = dashboard?.data;

  const stats = [
    {
      name: "Active Elections",
      count: data?.counts.active,
      icon: Vote,
      tone: "bg-green-100 text-green-800",
    },
    {
      name: "Upcoming Elections",
      count: data?.counts.upcoming,
      icon: Clock,
      tone: "bg-amber-100 text-amber-900",
    },
    {
      name: "Elections Participated",
      count: data?.counts.participated,
      icon: CheckCircle2,
      tone: "bg-blue-100 text-blue-900",
    },
  ];
  return (
    <>
      <ul
        aria-label="Election summary"
        className="mt-4 grid gap-3 sm:grid-cols-3"
      >
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <li key={s.name}>
              <Card className="flex items-center gap-4 rounded-2xl p-4">
                <span
                  className={cx(
                    "grid h-11 w-11 shrink-0 place-items-center rounded-xl",
                    s.tone,
                  )}
                >
                  <Icon size={22} aria-hidden="true" />
                </span>
                <div>
                  <div className="font-serif text-3xl font-bold leading-none text-slate-900">
                    {s.count}
                  </div>
                  <div className="mt-1 text-sm text-slate-600">{s.name}</div>
                </div>
              </Card>
            </li>
          );
        })}
      </ul>

      <section className="mt-9" aria-labelledby="act">
        <h2 id="act" className={cx(H2, "mb-3")}>
          Active Elections
        </h2>
        {data?.active.length ? (
          <div className="space-y-4">
            {data?.active.map((e) => (
              <ElectionCard key={e.id} election={e} cta="vote" />
            ))}
          </div>
        ) : (
          <EmptyState icon={Vote}>
            No elections are currently open for voting.
          </EmptyState>
        )}
      </section>

      <section className="mt-9" aria-labelledby="up">
        <h2 id="up" className={cx(H2, "mb-3")}>
          Upcoming Elections
        </h2>
        {data?.upcoming.length ? (
          <div className="space-y-4">
            {data?.upcoming.map((e) => (
              <ElectionCard key={e.id} election={e} cta="vote" />
            ))}
          </div>
        ) : (
          <EmptyState icon={Calendar}>No upcoming elections.</EmptyState>
        )}
      </section>

      <section className="mt-9" aria-labelledby="ann">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 id="ann" className={H2}>
            Recent announcements
          </h2>
          <Btn variant="ghost" to="/announcements" icon={Megaphone}>
            View All Announcements
          </Btn>
        </div>
        <Card className="divide-y divide-slate-200 rounded-2xl px-5">
          {data.announcements.map((a) => (
            <div className="py-3.5" key={a.id}>
              <div className="text-sm text-slate-600">
                {fmtDate(new Date(a.createdAt))}
              </div>
              <p className="text-slate-900">{a.title}</p>
            </div>
          ))}
        </Card>
      </section>
    </>
  );
};

export default DashboardClient;
