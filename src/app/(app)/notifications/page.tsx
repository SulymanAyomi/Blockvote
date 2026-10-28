"use client";

import { Btn } from "@/components/btn";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/features/error/error-state";
import { PageHead } from "@/components/pageHeader";
import { Skel } from "@/components/skeleton-cards";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useGetNotifications } from "@/features/notifications/api/use-get-notifications";
import { fmtDateTime } from "@/lib/helpers";
import { cx } from "class-variance-authority";
import { Megaphone, Bell, Settings, Check } from "lucide-react";
import { useState } from "react";

function NotificationsPage() {
  const { data, isLoading } = useGetNotifications();
  const [f, setF] = useState("All");

  const tabs: {
    name: "All" | "announcement" | "reminder" | "system";
    value: string;
  }[] = [
    {
      name: "All",
      value: "All",
    },
    {
      name: "announcement",
      value: "Election announcements",
    },
    {
      name: "reminder",
      value: "Voting reminders",
    },
    {
      name: "system",
      value: "System notifications",
    },
  ];
  const unread = 3;
  const ico = {
    announcement: [Megaphone, "bg-blue-100 text-blue-900"],
    reminder: [Bell, "bg-amber-100 text-amber-900"],
    system: [Settings, "bg-slate-200 text-slate-800"],
  };
  const markRead = () => {};
  const markAllRead = () => {};
  const listFor = (name: "All" | "announcement" | "reminder" | "system") =>
    data
      ? data?.data.notifications.filter((n) => {
          if (name == "All") return n;
          return n.type == name;
        })
      : [];

  return (
    <div>
      <PageHead
        title="Notifications"
        sub="Announcements, reminders and system updates."
      >
        <Btn
          variant="secondary"
          disabled={!unread}
          onClick={markAllRead}
          icon={Check}
        >
          Mark all as read
        </Btn>
      </PageHead>
      <Tabs value={f} onValueChange={setF}>
        <TabsList
          aria-label="Notification categories"
          className="h-fit! flex-wrap justify-start gap-1 bg-slate-200 p-1"
        >
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.name}
              value={tab.name}
              className="h-10 px-4 text-sm font-semibold text-slate-800"
            >
              {tab.value}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((tab) => (
          <TabsContent key={tab.name} value={tab.name} className="mt-5">
            {isLoading && (
              <Card
                className="space-y-4 rounded-2xl p-5"
                role="status"
                aria-label="Loading"
              >
                {[0, 1, 2, 3].map((i) => (
                  <Skel key={i} className="h-12 w-full" />
                ))}
              </Card>
            )}
            {/* {notifs.status === "error" && <ErrorState onRetry={loadNotifs} />} */}
            {listFor(tab.name).length === 0 ? (
              <EmptyState icon={Bell}>You're all caught up.</EmptyState>
            ) : (
              <Card className="overflow-hidden rounded-2xl">
                <ul className="divide-y divide-slate-200">
                  {listFor(tab.name).map((n) => {
                    // @ts-ignore
                    const [I, tone] = ico[n.type];
                    return (
                      <li
                        key={n.id}
                        className={cx(
                          "flex items-start gap-3.5 px-5 py-4",
                          !n.read && "bg-blue-50",
                        )}
                      >
                        <span
                          className={cx(
                            "grid h-10 w-10 shrink-0 place-items-center rounded-xl",
                            tone,
                          )}
                        >
                          <I size={20} aria-hidden="true" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-slate-900">
                            {n.title}
                            {!n.read && (
                              <>
                                <span
                                  aria-hidden="true"
                                  className="ml-2 text-sm font-bold text-blue-800"
                                >
                                  New
                                </span>
                                <span className="sr-only"> (unread)</span>
                              </>
                            )}
                          </div>
                          <p className="text-sm text-slate-600">{n.body}</p>
                          <p className="text-sm text-slate-600">
                            {fmtDateTime(new Date(n.at))}
                          </p>
                        </div>
                        {!n.read && (
                          <Button
                            type="button"
                            variant="ghost"
                            className="h-10 shrink-0 px-3 font-semibold text-blue-800 underline hover:bg-blue-100"
                            // onClick={() => markRead(n.id)}
                            aria-label={`Mark as read: ${n.title}`}
                          >
                            Mark as read
                          </Button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

export default NotificationsPage;
