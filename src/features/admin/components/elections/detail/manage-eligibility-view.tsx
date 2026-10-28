// "use client";

// import { useState } from "react";
// import { Plus, ShieldCheck, Trash2 } from "lucide-react";
// import { useElection } from "../../../hooks/elections/use-election";
// import { useUpdateEligibility } from "../../../hooks/elections/use-manage-eligibility";
// import { DetailPageSkeleton } from "../election-skeletons";
// import { ElectionsErrorState } from "../election-empty-error-states";
// import { formatNumber } from "@/lib/utils";
// import type { EligibilityRule } from "../../../type";

// export function ManageEligibilityView() {

//   const { data: election, isLoading, isError, refetch } = useElection("2");
//   const updateEligibility = useUpdateEligibility();
//   const [label, setLabel] = useState("");
//   const [description, setDescription] = useState("");

//   if (isLoading) return <DetailPageSkeleton />;
//   if (isError || !election)
//     return <ElectionsErrorState onRetry={() => refetch()} />;

//   function handleAddRule() {
//     if (!label.trim() || !election) return;
//     const newRule: EligibilityRule = {
//       id: `rule-${Date.now()}`,
//       label: label.trim(),
//       description: description.trim() || undefined,
//     };
//     updateEligibility.mutate(
//       { electionId, rules: [...election.eligibility.rules, newRule] },
//       {
//         onSuccess: () => {
//           setLabel("");
//           setDescription("");
//         },
//       },
//     );
//   }

//   function handleRemoveRule(ruleId: string) {
//     if (!election) return;
//     updateEligibility.mutate({
//       electionId,
//       rules: election.eligibility.rules.filter((r) => r.id !== ruleId),
//     });
//   }

//   return (
//     <div className="space-y-5">
//       <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
//         <div className="rounded-xl border border-neutral-200 bg-white p-4">
//           <dt className="text-xs font-medium text-neutral-500">Scope</dt>
//           <dd className="mt-1 text-sm font-semibold text-neutral-900">
//             {election.eligibility.scope.label}
//           </dd>
//         </div>
//         <div className="rounded-xl border border-neutral-200 bg-white p-4">
//           <dt className="text-xs font-medium text-neutral-500">Scope type</dt>
//           <dd className="mt-1 text-sm font-semibold capitalize text-neutral-900">
//             {election.eligibility.scope.type}
//           </dd>
//         </div>
//         <div className="rounded-xl border border-neutral-200 bg-white p-4">
//           <dt className="text-xs font-medium text-neutral-500">
//             Eligible Voters
//           </dt>
//           <dd className="mt-1 text-sm font-semibold text-neutral-900">
//             {formatNumber(election.eligibility.eligibleVoterCount)}
//           </dd>
//         </div>
//       </dl>

//       <div className="rounded-xl border border-neutral-200 bg-white p-4">
//         <p className="mb-3 text-sm font-medium text-neutral-700">
//           Add an eligibility rule
//         </p>
//         <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
//           <input
//             value={label}
//             onChange={(e) => setLabel(e.target.value)}
//             placeholder="Rule label (e.g. Must be in final year)"
//             className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200"
//           />
//           <input
//             value={description}
//             onChange={(e) => setDescription(e.target.value)}
//             placeholder="Description (optional)"
//             className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200"
//           />
//         </div>
//         <button
//           type="button"
//           onClick={handleAddRule}
//           disabled={!label.trim() || updateEligibility.isPending}
//           className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
//         >
//           <Plus className="h-4 w-4" aria-hidden="true" />
//           Add Rule
//         </button>
//       </div>

//       <ul className="space-y-2">
//         {election.eligibility.rules.map((rule) => (
//           <li
//             key={rule.id}
//             className="flex items-start justify-between gap-3 rounded-xl border border-neutral-200 bg-white p-3"
//           >
//             <div className="flex items-start gap-2.5">
//               <ShieldCheck
//                 className="mt-0.5 h-4 w-4 shrink-0 text-neutral-500"
//                 aria-hidden="true"
//               />
//               <div>
//                 <p className="text-sm font-medium text-neutral-900">
//                   {rule.label}
//                 </p>
//                 {rule.description && (
//                   <p className="mt-0.5 text-xs text-neutral-500">
//                     {rule.description}
//                   </p>
//                 )}
//               </div>
//             </div>
//             <button
//               type="button"
//               onClick={() => handleRemoveRule(rule.id)}
//               aria-label={`Remove rule: ${rule.label}`}
//               className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md text-neutral-400 transition hover:bg-red-50 hover:text-red-600"
//             >
//               <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
//             </button>
//           </li>
//         ))}
//       </ul>

//       <p className="rounded-lg bg-neutral-50 p-3 text-xs text-neutral-500">
//         No table, log, or view in this system ever associates a voter&apos;s
//         identity with their individual vote choice. Eligibility rules only
//         affect who may vote — not how votes are recorded.
//       </p>
//     </div>
//   );
// }
