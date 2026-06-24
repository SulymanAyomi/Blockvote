// "use client";

// import { zodResolver } from "@hookform/resolvers/zod";
// import { useMemo } from "react";
// import { useForm } from "react-hook-form";

// import { generateId } from "../lib/generate-id";
// import {
//   createPollSchema,
//   type CreatePollFormValues,
// } from "../schemas/create-poll.schema";

// /**
//  * Default values for a brand-new poll. Two blank options are pre-seeded
//  * since `MIN_OPTIONS` is 2 — this avoids an extra "add two options" hint
//  * before the user can do anything useful.
//  */
// export function buildDefaultPollValues(): CreatePollFormValues {
//   return {
//     title: "",
//     description: "",
//     coverImage: undefined,
//     coverImagePreviewUrl: undefined,

//     options: [
//       {
//         id: generateId("opt"),
//         label: "",
//         image: undefined,
//         imagePreviewUrl: undefined,
//       },
//       {
//         id: generateId("opt"),
//         label: "",
//         image: undefined,
//         imagePreviewUrl: undefined,
//       },
//     ],

//     votingType: "single",
//     maxSelections: undefined,
//     anonymousVoting: true,
//     allowVoteChanges: false,
//     requireVoteConfirmation: true,

//     startDate: undefined as unknown as Date,
//     endDate: undefined as unknown as Date,
//     timezone: "",

//     visibility: "public",
//     votingRestriction: "anyone",
//     inviteEmails: [],
//     allowedDomains: [],
//     tokenContractAddress: "",
//     tokenId: "",

//     resultVisibility: "realtime",
//     showVoteCount: true,
//     showVoterList: false,

//     commentsEnabled: true,
//     tags: [],
//     notifications: {
//       notifyInvitedVoters: true,
//       notifyOnStart: true,
//       notifyOnEnd: true,
//       notifyCreatorOnVote: false,
//     },
//     blockchainVerification: true,
//   };
// }

// interface UseCreatePollFormOptions {
//   defaultValues?: Partial<CreatePollFormValues>;
// }

// /**
//  * Centralizes the `useForm` configuration for the create-poll flow.
//  *
//  * The resolver is always the strict "publish" schema — React Hook Form's
//  * `handleSubmit` is wired to the Publish action. Saving a draft is handled
//  * separately (see `create-poll-form.tsx`) by validating against the more
//  * lenient `draftPollSchema` and writing any issues back with `setError`,
//  * so a single `useForm` instance can power both actions without juggling
//  * dynamic resolvers.
//  */
// export function useCreatePollForm(options: UseCreatePollFormOptions = {}) {
//   const defaultValues = useMemo<CreatePollFormValues>(
//     () => ({ ...buildDefaultPollValues(), ...options.defaultValues }),
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//     [],
//   );

//   const form = useForm<CreatePollFormValues>({
//     resolver: zodResolver(createPollSchema),
//     defaultValues,
//     mode: "onBlur",
//   });

//   return form;
// }

// export type CreatePollForm = ReturnType<typeof useCreatePollForm>;
