"use client";

import { Btn } from "@/components/btn";
import { PageHead } from "@/components/pageHeader";
import { Card } from "@/components/ui/card";
import { H3, H2 } from "@/lib/helpers";
import { ChevronLeft, Lock } from "lucide-react";

function HowPage() {
  const steps = [
    [
      "Check the election",
      "Open an election to see its dates, positions and candidates.",
    ],
    [
      "Verify your identity",
      "We confirm you're an eligible student. Only then do you get a short voting session.",
    ],
    [
      "Choose your candidates",
      "Pick one candidate for each position, then review before you submit.",
    ],
    [
      "Get your confirmation",
      "You'll see that your vote was submitted, with a reference number.",
    ],
  ];
  return (
    <div className="max-w-3xl">
      <div className="mb-3">
        <Btn variant="ghost" to="/help" icon={ChevronLeft}>
          Back
        </Btn>
      </div>
      <PageHead
        title="How voting works"
        sub="What happens, and what stays private."
      />
      <ol className="space-y-3">
        {steps.map(([t, p], i) => (
          <li key={t}>
            <Card className="flex items-start gap-4 rounded-2xl p-5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-blue-100 font-bold text-blue-900">
                {i + 1}
              </span>
              <div>
                <h2 className={H3}>{t}</h2>
                <p className="text-slate-600">{p}</p>
              </div>
            </Card>
          </li>
        ))}
      </ol>
      <Card className="mt-5 rounded-2xl border-blue-200 bg-blue-50 p-6">
        <div className="mb-2 flex items-center gap-2">
          <Lock size={20} aria-hidden="true" className="text-blue-800" />
          <h2 className={H2}>Your ballot is private</h2>
        </div>
        <ul className="ml-5 list-disc space-y-2 text-slate-800">
          <li>
            Your eligibility is checked before you vote. Your name is never
            shown next to your choices.
          </li>
          <li>
            The system records <em>that</em> you voted, separately from{" "}
            <em>what</em> you chose.
          </li>
          <li>
            Once submitted, a ballot can't be changed, and you can't vote twice.
          </li>
          <li>
            Submitted ballots are kept in a tamper-evident record so official
            results can be checked independently.
          </li>
          <li>
            Your voting session is short. If it expires, your selections are
            cleared and you verify again.
          </li>
        </ul>
      </Card>
    </div>
  );
}

export default HowPage;
