"use client";
import { Btn } from "@/components/btn";
import { PageHead } from "@/components/pageHeader";
import { Skel } from "@/components/skeleton-cards";
import { Card } from "@/components/ui/card";
import { ErrorState } from "@/features/error/error-state";
import { useGetAnnouncements } from "@/features/notifications/api/use-get-announcements";
import { fmtDate } from "@/lib/helpers";
import { ChevronLeft } from "lucide-react";

function AnnouncementsPage() {
  const { data, isLoading, error, refetch } = useGetAnnouncements();
  if (isLoading) {
    <Card
      className="space-y-4 rounded-2xl p-5"
      role="status"
      aria-label="Loading"
    >
      {[0, 1, 2].map((i) => (
        <Skel key={i} className="h-10 w-full" />
      ))}
    </Card>;
  }
  if (error) {
    <ErrorState error={error} retry={refetch} />;
  }
  const announ = data?.data.announcements;
  return (
    <div>
      <div className="mb-3">
        <Btn variant="ghost" to="/dashboard" icon={ChevronLeft}>
          Back
        </Btn>
      </div>
      <PageHead
        title="Announcements"
        sub="Updates from the Election Committee."
      />

      <Card className="divide-y divide-slate-200 rounded-2xl px-5">
        {announ?.map((a) => (
          <div className="py-3.5" key={a.id}>
            <div className="text-sm text-slate-600">
              {fmtDate(new Date(a.at))}
            </div>
            <p className="text-slate-900">{a.title}</p>
          </div>
        ))}
      </Card>
    </div>
  );
}

export default AnnouncementsPage;
