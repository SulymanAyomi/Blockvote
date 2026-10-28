// "use client";

// import { ErrorState } from "@/components/error-state";
// import { Skel } from "@/components/skeleton-cards";
// import { Card } from "@/components/ui/card";
// import { useVotingContext } from "@/context/voting-context";
// import { useDeleteVotingSession } from "@/features/elections/api/use-delete-voting-session";
// import { useGetElectionEligibility } from "@/features/elections/api/use-get-election-verification";
// import { useElectionId } from "@/features/elections/hooks/use-get-election-id";
// import { ErrorPayload } from "@/features/elections/type";
// import { useRouter } from "next/navigation";
// import React, { useEffect } from "react";

// interface SessionWrapperProps {
//   children: React.ReactNode;
// }

// const SessionWrapper = ({ children }: SessionWrapperProps) => {
//   const router = useRouter();
//   const electionId = useElectionId();
//   const { data, isLoading, error } = useGetElectionEligibility({ electionId });
//   const deleteSession = useDeleteVotingSession();
//   const { setSession } = useVotingContext();

//   useEffect(() => {
//     // if (data) setSession(data.votersessionId);
//   }, [data]);

//   const handleDeleteSession = () => {
//     deleteSession.mutate(electionId);
//   };

//   if (isLoading)
//     return (
//       <Card className="rounded-2xl p-8" role="status" aria-label="Loading">
//         <Skel className="mx-auto h-24 w-24 rounded-full" />
//         <Skel className="mx-auto mt-5 h-7 w-1/2" />
//         <Skel className="mx-auto mt-4 h-4 w-4/5" />
//       </Card>
//     );
//   if (error) {
//     const err: ErrorPayload = {
//       code: "closed",
//     };
//     return <ErrorState error={err} id={electionId} onRetry={() => {}} />;
//   }

//   if (!data?.eligibility) {
//     const err: ErrorPayload = {
//       code: "not_eligible",
//     };
//     return <ErrorState error={err} id={electionId} onRetry={() => {}} />;
//   }

//   if (data?.status == "EXPIRED") {
//     const err: ErrorPayload = {
//       code: "session_expired",
//     };
//     return (
//       <ErrorState
//         error={err}
//         id={electionId}
//         onRetry={handleDeleteSession}
//         isLoading={deleteSession.isPending}
//       />
//     );
//   }

//   if (data?.status == "COMPLETED") {
//     const err: ErrorPayload = {
//       code: "already_voted",
//     };
//     return <ErrorState error={err} id={electionId} onRetry={() => {}} />;
//   }

//   return <div>{children}</div>;
// };

// export default SessionWrapper;
