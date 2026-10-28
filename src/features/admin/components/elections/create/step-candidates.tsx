// "use client";

// import { useState } from "react";
// import { Plus, Trash2 } from "lucide-react";
// import type { CandidateDraft, PositionDraft } from "@/types/election";

// interface StepCandidatesProps {
//   positions: PositionDraft[];
//   candidates: CandidateDraft[];
//   onAdd: (candidate: Omit<CandidateDraft, "localId">) => void;
//   onRemove: (localId: string) => void;
// }

// export function StepCandidates({ positions, candidates, onAdd, onRemove }: StepCandidatesProps) {
//   const [selectedPositionId, setSelectedPositionId] = useState(positions[0]?.localId ?? "");
//   const [name, setName] = useState("");

//   if (positions.length === 0) {
//     return (
//       <p className="rounded-lg border border-dashed border-neutral-300 p-4 text-sm text-neutral-500">
//         Add positions in the previous step before adding candidates.
//       </p>
//     );
//   }

//   function handleAdd() {
//     if (!name.trim() || !selectedPositionId) return;
//     onAdd({ name: name.trim(), positionLocalId: selectedPositionId });
//     setName("");
//   }

//   return (
//     <div className="space-y-5">
//       <div className="rounded-lg border border-neutral-200 p-4">
//         <p className="mb-3 text-sm font-medium text-neutral-700">Add a candidate</p>
//         <div className="flex flex-col gap-3 sm:flex-row">
//           <select
//             value={selectedPositionId}
//             onChange={(e) => setSelectedPositionId(e.target.value)}
//             className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200 sm:w-56"
//           >
//             {positions.map((p) => (
//               <option key={p.localId} value={p.localId}>
//                 {p.name}
//               </option>
//             ))}
//           </select>
//           <input
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//             placeholder="Candidate full name"
//             className="flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200"
//           />
//           <button
//             type="button"
//             onClick={handleAdd}
//             disabled={!name.trim()}
//             className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-neutral-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
//           >
//             <Plus className="h-4 w-4" aria-hidden="true" />
//             Add
//           </button>
//         </div>
//       </div>

//       <div className="space-y-4">
//         {positions.map((position) => {
//           const positionCandidates = candidates.filter((c) => c.positionLocalId === position.localId);
//           return (
//             <div key={position.localId}>
//               <p className="mb-2 text-sm font-semibold text-neutral-900">{position.name}</p>
//               {positionCandidates.length === 0 ? (
//                 <p className="text-sm text-neutral-400">No candidates added yet.</p>
//               ) : (
//                 <ul className="divide-y divide-neutral-100 rounded-lg border border-neutral-200">
//                   {positionCandidates.map((c) => (
//                     <li key={c.localId} className="flex items-center justify-between px-4 py-2.5">
//                       <span className="text-sm text-neutral-700">{c.name}</span>
//                       <button
//                         type="button"
//                         onClick={() => onRemove(c.localId)}
//                         aria-label={`Remove ${c.name}`}
//                         className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-400 transition hover:bg-red-50 hover:text-red-600"
//                       >
//                         <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
//                       </button>
//                     </li>
//                   ))}
//                 </ul>
//               )}
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }
