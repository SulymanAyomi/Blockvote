import { formatNumber } from "@/lib/utils";
import type { ElectionDetailType } from "../../../type";

interface ElectionDetailStatsProps {
  data: ElectionDetailType;
}

export function ElectionDetailStats({ data }: ElectionDetailStatsProps) {
  const totalCandidates = data.positions.reduce((acc, p) => {
    let sum = p.candidates.length + acc;
    return sum;
  }, 0);

  const cards = [
    {
      label: "Eligible Voters",
      value: formatNumber(data.eligibleVoterCount),
    },
    {
      label: "Votes Cast",
      value: formatNumber(data.votesCast),
    },
    {
      label: "Turnout",
      value: `${data.turnoutPercent}%`,
    },
    { label: "Positions", value: String(data.positions.length) },
    { label: "Candidates", value: String(totalCandidates) },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border border-neutral-200 bg-white p-4"
        >
          <p className="text-xs font-medium text-neutral-500">{card.label}</p>
          <p className="mt-1.5 text-xl font-semibold tracking-tight text-neutral-900">
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}
