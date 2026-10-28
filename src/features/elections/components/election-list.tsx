"use client";
import { useState } from "react";
import { useGetElections } from "../api/use-get-elections";
import { Vote } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/features/error/error-state";
import { SkelCards } from "@/components/skeleton-cards";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ElectionCard } from "./election-card";
import { PageHead } from "@/components/pageHeader";

function ElectionList() {
  const [status, setStatus] = useState<string>("ALL");
  const {
    data: response,
    isLoading,
    refetch,
    error,
  } = useGetElections({
    limit: "10",
    page: "1",
    status,
  });

  const tabs: { name: keyof typeof emptyMsg; value: string }[] = [
    {
      name: "All",
      value: "ALL",
    },
    {
      name: "Active",
      value: "ACTIVE",
    },
    {
      name: "Upcoming",
      value: "SCHEDULED",
    },
    {
      name: "Completed",
      value: "COMPLETED",
    },
  ];

  const emptyMsg = {
    All: "No elections to show yet.",
    Active: "No elections are currently open for voting.",
    Upcoming: "No upcoming elections.",
    Completed: "No completed elections yet.",
  };

  if (error) {
    return <ErrorState error={error} retry={() => refetch()} />;
  }
  const data = response?.data;

  return (
    <div>
      <PageHead
        title="Elections"
        sub="View current, upcoming, and previous elections."
      />

      <Tabs
        value={status}
        onValueChange={(e) => {
          setStatus(e);
        }}
      >
        <TabsList
          aria-label="Filter elections"
          className="h-fit! flex-wrap justify-start gap-1 bg-slate-200 p-1"
        >
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.name}
              value={tab.value}
              className="h-10 px-4 text-sm font-semibold text-slate-800"
            >
              {tab.name}
              {data && (
                <span className="ml-1.5 font-normal text-slate-600">
                  ({data.counts[tab.name]})
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((k) => (
          <TabsContent key={k.name} value={k.value} className="mt-5">
            {isLoading ? (
              <SkelCards n={3} />
            ) : data?.elections.length ? (
              <div className="space-y-4">
                {data?.elections.map((e) => (
                  <ElectionCard key={e.id} election={e} />
                ))}
              </div>
            ) : (
              <EmptyState icon={Vote}>{emptyMsg[k.name]}</EmptyState>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

export default ElectionList;
