// "use client";

// import { Eye, Loader2, Save, Send } from "lucide-react";
// import * as React from "react";
// import type { FieldPath } from "react-hook-form";
// import { toast } from "sonner";

// import {
//   Accordion,
//   AccordionContent,
//   AccordionItem,
//   AccordionTrigger,
// } from "@/components/ui/accordion";
// import { Button } from "@/components/ui/button";
// import { Form } from "@/components/ui/form";

// import { useCreatePollForm } from "../hooks/use-create-poll-form";
// import {
//   draftPollSchema,
//   type CreatePollFormValues,
//   type DraftPollFormValues,
//   type PublishPollFormValues,
// } from "../schemas/create-poll.schema";
// import type { Poll } from "../types/poll";
// import {
//   ACCESS_CONTROL_FIELDS,
//   AccessControlSection,
// } from "./access-control-section";
// import {
//   ADVANCED_SETTINGS_FIELDS,
//   AdvancedSettingsSection,
// } from "./advanced-settings-section";
// import {
//   BASIC_INFORMATION_FIELDS,
//   BasicInformationSection,
// } from "./basic-information-section";
// import {
//   POLL_OPTIONS_FIELDS,
//   PollOptionsSection,
// } from "./poll-options-section";
// import { PollPreviewModal } from "./poll-preview-modal";
// import { RESULTS_FIELDS, ResultsSection } from "./results-section";
// import { SCHEDULE_FIELDS, ScheduleSection } from "./schedule-section";
// import {
//   countErrorsForFields,
//   SectionErrorBadge,
// } from "./shared/section-error-badge";
// import {
//   VOTING_SETTINGS_FIELDS,
//   VotingSettingsSection,
// } from "./voting-settings-section";

// export interface CreatePollFormProps {
//   /** Called when the user clicks "Save draft". Replace with a real API call. */
//   onSaveDraft?: (
//     values: DraftPollFormValues,
//   ) => Promise<Pick<Poll, "id"> | void>;
//   /** Called when the user clicks "Publish poll". Replace with a real API call. */
//   onPublish?: (
//     values: PublishPollFormValues,
//   ) => Promise<Pick<Poll, "id"> | void>;
// }

// const SECTIONS = [
//   {
//     value: "basic-information",
//     title: "Basic Information",
//     Component: BasicInformationSection,
//     fields: BASIC_INFORMATION_FIELDS,
//   },
//   {
//     value: "poll-options",
//     title: "Poll Options",
//     Component: PollOptionsSection,
//     fields: POLL_OPTIONS_FIELDS,
//   },
//   {
//     value: "voting-settings",
//     title: "Voting Settings",
//     Component: VotingSettingsSection,
//     fields: VOTING_SETTINGS_FIELDS,
//   },
//   {
//     value: "schedule",
//     title: "Schedule",
//     Component: ScheduleSection,
//     fields: SCHEDULE_FIELDS,
//   },
//   {
//     value: "access-control",
//     title: "Access Control",
//     Component: AccessControlSection,
//     fields: ACCESS_CONTROL_FIELDS,
//   },
//   {
//     value: "results",
//     title: "Results",
//     Component: ResultsSection,
//     fields: RESULTS_FIELDS,
//   },
//   {
//     value: "advanced-settings",
//     title: "Advanced Settings",
//     Component: AdvancedSettingsSection,
//     fields: ADVANCED_SETTINGS_FIELDS,
//   },
// ] as const;

// async function defaultSaveDraft(
//   values: DraftPollFormValues,
// ): Promise<Pick<Poll, "id">> {
//   // TODO: replace with a real API call, e.g. `POST /api/polls` with `status: "draft"`.
//   await new Promise((resolve) => setTimeout(resolve, 600));
//   // eslint-disable-next-line no-console
//   console.info("[create-poll] save draft", values);
//   return { id: "draft-poll" };
// }

// async function defaultPublish(
//   values: PublishPollFormValues,
// ): Promise<Pick<Poll, "id">> {
//   // TODO: replace with a real API call, e.g. `POST /api/polls` with `status: "published"`.
//   await new Promise((resolve) => setTimeout(resolve, 900));
//   // eslint-disable-next-line no-console
//   console.info("[create-poll] publish", values);
//   return { id: "published-poll" };
// }

// export function CreatePollForm({
//   onSaveDraft = defaultSaveDraft,
//   onPublish = defaultPublish,
// }: CreatePollFormProps) {
//   const form = useCreatePollForm();
//   const [isSavingDraft, setIsSavingDraft] = React.useState(false);
//   const [isPublishing, setIsPublishing] = React.useState(false);
//   const [previewOpen, setPreviewOpen] = React.useState(false);

//   const busy = isSavingDraft || isPublishing;
//   const errors = form.formState.errors;

//   const handlePublish = form.handleSubmit(
//     async (values) => {
//       setIsPublishing(true);
//       try {
//         await onPublish(values);
//         toast.success("Poll published", {
//           description: "Your poll is now live for voters.",
//         });
//       } catch (error) {
//         toast.error("Couldn't publish poll", {
//           description:
//             error instanceof Error
//               ? error.message
//               : "Something went wrong. Please try again.",
//         });
//       } finally {
//         setIsPublishing(false);
//       }
//     },
//     () => {
//       toast.error("Check the highlighted fields", {
//         description: "Some required information is missing or invalid.",
//       });
//     },
//   );

//   const handleSaveDraft = async () => {
//     const result = draftPollSchema.safeParse(form.getValues());

//     if (!result.success) {
//       result.error.issues.forEach((issue) => {
//         const path = issue.path.join(".") as FieldPath<CreatePollFormValues>;
//         form.setError(path, { type: "manual", message: issue.message });
//       });
//       toast.error("Check the highlighted fields", {
//         description: "Fix the issues below before saving this draft.",
//       });
//       return;
//     }

//     setIsSavingDraft(true);
//     try {
//       await onSaveDraft(result.data);
//       toast.success("Draft saved", {
//         description: "Pick up where you left off any time.",
//       });
//     } catch (error) {
//       toast.error("Couldn't save draft", {
//         description:
//           error instanceof Error
//             ? error.message
//             : "Something went wrong. Please try again.",
//       });
//     } finally {
//       setIsSavingDraft(false);
//     }
//   };

//   return (
//     <>
//       <div className="mb-6 space-y-1.5">
//         <h1 className="text-2xl font-semibold tracking-tight">Create poll</h1>
//         <p className="text-sm text-muted-foreground">
//           Configure every detail below, then save a draft or publish when you're
//           ready.
//         </p>
//       </div>

//       <Form {...form}>
//         <form
//           className="space-y-4 pb-28"
//           onSubmit={(e) => e.preventDefault()}
//           noValidate
//         >
//           <Accordion
//             type="multiple"
//             defaultValue={SECTIONS.map((section) => section.value)}
//             className="space-y-4"
//           >
//             {SECTIONS.map(({ value, title, Component, fields }) => {
//               const errorCount = countErrorsForFields(
//                 errors,
//                 fields as unknown as Array<keyof CreatePollFormValues>,
//               );
//               return (
//                 <AccordionItem
//                   key={value}
//                   value={value}
//                   className="rounded-xl border border-border bg-card px-3 shadow-sm sm:px-5"
//                 >
//                   <AccordionTrigger className="py-4 text-base font-semibold hover:no-underline">
//                     <span className="flex flex-1 items-center">
//                       {title}
//                       <SectionErrorBadge count={errorCount} />
//                     </span>
//                   </AccordionTrigger>
//                   <AccordionContent className="pb-5 pt-1">
//                     <Component />
//                   </AccordionContent>
//                 </AccordionItem>
//               );
//             })}
//           </Accordion>
//         </form>
//       </Form>

//       <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
//         <div className="mx-auto flex max-w-3xl flex-col-reverse gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-end">
//           <Button
//             type="button"
//             variant="outline"
//             disabled={busy}
//             onClick={handleSaveDraft}
//             className="gap-2"
//           >
//             {isSavingDraft ? (
//               <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
//             ) : (
//               <Save className="h-4 w-4" aria-hidden="true" />
//             )}
//             Save draft
//           </Button>
//           <Button
//             type="button"
//             variant="secondary"
//             disabled={busy}
//             onClick={() => setPreviewOpen(true)}
//             className="gap-2"
//           >
//             <Eye className="h-4 w-4" aria-hidden="true" />
//             Preview poll
//           </Button>
//           <Button
//             type="button"
//             disabled={busy}
//             onClick={handlePublish}
//             className="gap-2"
//           >
//             {isPublishing ? (
//               <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
//             ) : (
//               <Send className="h-4 w-4" aria-hidden="true" />
//             )}
//             Publish poll
//           </Button>
//         </div>
//       </div>

//       <PollPreviewModal
//         open={previewOpen}
//         onOpenChange={setPreviewOpen}
//         values={form.watch()}
//       />
//     </>
//   );
// }
