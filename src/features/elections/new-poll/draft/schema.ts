import { z } from "zod";

import type {
    ResultVisibility,
    Visibility,
    VotingRestriction,
    VotingType,
} from "../types/poll";

/* -------------------------------------------------------------------------- */
/*  Shared constants                                                          */
/* -------------------------------------------------------------------------- */

export const MAX_TITLE_LENGTH = 150;
export const MIN_TITLE_LENGTH = 5;
export const MAX_DESCRIPTION_LENGTH = 5000;
export const MIN_DESCRIPTION_LENGTH = 20;
export const MIN_OPTIONS = 2;
export const MAX_OPTIONS = 50;
export const MAX_TAGS = 10;
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export const VOTING_TYPES = ["single", "multiple", "ranked", "yesno"] as const satisfies readonly VotingType[];
export const VISIBILITY_OPTIONS = ["public", "unlisted", "private"] as const satisfies readonly Visibility[];
export const VOTING_RESTRICTIONS = [
    "anyone",
    "registered",
    "invited",
    "domain",
    "wallet",
    "token",
] as const satisfies readonly VotingRestriction[];
export const RESULT_VISIBILITY_OPTIONS = [
    "realtime",
    "after_close",
    "creator_only",
] as const satisfies readonly ResultVisibility[];

/* -------------------------------------------------------------------------- */
/*  Image file validation                                                     */
/* -------------------------------------------------------------------------- */

/**
 * `File` only exists in browser environments. We guard with `typeof File`
 * so this schema can still be imported (and used for type inference) on
 * the server without throwing a ReferenceError.
 */
const isFileLike = (val: unknown): val is File =>
    typeof File !== "undefined" && val instanceof File;

export const imageFileSchema = z
    .custom<File>((val) => val === undefined || isFileLike(val), {
        message: "Please choose a valid image file.",
    })
    .refine((file) => !file || file.size <= MAX_IMAGE_SIZE_BYTES, {
        message: "Image must be 5MB or smaller.",
    })
    .refine((file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type as (typeof ACCEPTED_IMAGE_TYPES)[number]), {
        message: "Only JPG, PNG, and WEBP images are supported.",
    })
    .optional();

/* -------------------------------------------------------------------------- */
/*  Poll option                                                               */
/* -------------------------------------------------------------------------- */

export const pollOptionSchema = z.object({
    id: z.string(),
    label: z
        .string()
        .trim()
        .min(1, "Option text can't be empty.")
        .max(150, "Option text must be 150 characters or fewer."),
    image: imageFileSchema,
    imagePreviewUrl: z.string().optional(),
});

export type PollOptionFormValue = z.infer<typeof pollOptionSchema>;

const draftPollOptionSchema = z.object({
    id: z.string(),
    label: z.string().trim().max(150, "Option text must be 150 characters or fewer.").default(""),
    image: imageFileSchema,
    imagePreviewUrl: z.string().optional(),
});

/* -------------------------------------------------------------------------- */
/*  Shared field building blocks                                              */
/* -------------------------------------------------------------------------- */

const emailField = z.string().trim().email("Enter a valid email address.");

const notificationsSchema = z.object({
    notifyInvitedVoters: z.boolean(),
    notifyOnStart: z.boolean(),
    notifyOnEnd: z.boolean(),
    notifyCreatorOnVote: z.boolean(),
});

/* -------------------------------------------------------------------------- */
/*  Publish schema (strict — every rule in the spec is enforced)              */
/* -------------------------------------------------------------------------- */

const basePollShape = {
    // Basic information
    title: z
        .string()
        .trim()
        .min(MIN_TITLE_LENGTH, `Title must be at least ${MIN_TITLE_LENGTH} characters.`)
        .max(MAX_TITLE_LENGTH, `Title must be ${MAX_TITLE_LENGTH} characters or fewer.`),
    description: z
        .string()
        .trim()
        .min(MIN_DESCRIPTION_LENGTH, `Description must be at least ${MIN_DESCRIPTION_LENGTH} characters.`)
        .max(MAX_DESCRIPTION_LENGTH, `Description must be ${MAX_DESCRIPTION_LENGTH} characters or fewer.`),
    coverImage: imageFileSchema,
    coverImagePreviewUrl: z.string().optional(),

    // Options
    options: z
        .array(pollOptionSchema)
        .min(MIN_OPTIONS, `Add at least ${MIN_OPTIONS} options.`)
        .max(MAX_OPTIONS, `You can add up to ${MAX_OPTIONS} options.`),

    // Voting settings
    votingType: z.enum(VOTING_TYPES, { required_error: "Choose a voting type." }),
    maxSelections: z.coerce.number().int().min(1).max(50).optional(),
    anonymousVoting: z.boolean(),
    allowVoteChanges: z.boolean(),
    requireVoteConfirmation: z.boolean(),

    // Schedule
    startDate: z.date({ required_error: "Start date and time is required." }),
    endDate: z.date({ required_error: "End date and time is required." }),
    timezone: z.string().min(1, "Choose a timezone."),

    // Access control
    visibility: z.enum(VISIBILITY_OPTIONS, { required_error: "Choose who can see this poll." }),
    votingRestriction: z.enum(VOTING_RESTRICTIONS, { required_error: "Choose who can vote." }),
    inviteEmails: z.array(emailField).optional(),
    allowedDomains: z.array(z.string().trim().min(1)).optional(),
    tokenContractAddress: z.string().trim().optional(),
    tokenId: z.string().trim().optional(),

    // Results
    resultVisibility: z.enum(RESULT_VISIBILITY_OPTIONS, {
        required_error: "Choose when results are visible.",
    }),
    showVoteCount: z.boolean(),
    showVoterList: z.boolean(),

    // Advanced
    commentsEnabled: z.boolean(),
    tags: z.array(z.string().trim().min(1)).max(MAX_TAGS, `You can add up to ${MAX_TAGS} tags.`),
    notifications: notificationsSchema,
    blockchainVerification: z.boolean(),
};

function applyCrossFieldRules<T extends z.ZodRawShape>(
    schema: z.ZodObject<T>,
    options: { strictScheduling: boolean },
) {
    return schema.superRefine((data: any, ctx) => {
        const now = new Date();

        /* ---- Duplicate / empty option checks -------------------------------- */
        const seen = new Map<string, number>();
        (data.options ?? []).forEach((option: { label: string }, index: number) => {
            const normalized = option.label.trim().toLowerCase();
            if (!normalized) return; // empty handled by field-level min(1) on publish
            if (seen.has(normalized)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "This option already exists. Each option must be unique.",
                    path: ["options", index, "label"],
                });
            } else {
                seen.set(normalized, index);
            }
        });

        /* ---- Multiple choice: max selections vs option count ----------------- */
        if (data.votingType === "multiple") {
            const optionCount = (data.options ?? []).length;
            if (!data.maxSelections) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Set the maximum number of selections allowed.",
                    path: ["maxSelections"],
                });
            } else if (optionCount > 0 && data.maxSelections > optionCount) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: `Maximum selections can't exceed the number of options (${optionCount}).`,
                    path: ["maxSelections"],
                });
            }
        }

        /* ---- Schedule ---------------------------------------------------------*/
        if (data.startDate && data.endDate) {
            if (data.endDate.getTime() <= data.startDate.getTime()) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "End date must be after the start date.",
                    path: ["endDate"],
                });
            }
        }
        if (options.strictScheduling && data.startDate && data.startDate.getTime() < now.getTime() - 60_000) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Start date can't be in the past.",
                path: ["startDate"],
            });
        }

        /* ---- Voting restriction specific requirements ------------------------*/
        if (data.votingRestriction === "invited") {
            if (!data.inviteEmails || data.inviteEmails.length === 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Add at least one email address to invite.",
                    path: ["inviteEmails"],
                });
            }
        }
        if (data.votingRestriction === "domain") {
            if (!data.allowedDomains || data.allowedDomains.length === 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Add at least one allowed email domain.",
                    path: ["allowedDomains"],
                });
            }
        }
        if (data.votingRestriction === "token") {
            if (!data.tokenContractAddress) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Contract address is required for token-gated polls.",
                    path: ["tokenContractAddress"],
                });
            }
            if (!data.tokenId) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Token ID is required for token-gated polls.",
                    path: ["tokenId"],
                });
            }
        }

        /* ---- Results: voter list can't be shown when voting is anonymous -----*/
        if (data.anonymousVoting && data.showVoterList) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Voter list can't be shown while anonymous voting is enabled.",
                path: ["showVoterList"],
            });
        }
    });
}

export const createPollSchema = applyCrossFieldRules(z.object(basePollShape), {
    strictScheduling: true,
});

export type PublishPollFormValues = z.infer<typeof createPollSchema>;
/** Primary form-values type used across the create-poll feature. */
export type CreatePollFormValues = PublishPollFormValues;

/* -------------------------------------------------------------------------- */
/*  Draft schema (lenient — only the title is required)                       */
/* -------------------------------------------------------------------------- */

const draftPollShape = {
    ...basePollShape,
    title: z
        .string()
        .trim()
        .min(1, "Give your draft a title so you can find it later.")
        .max(MAX_TITLE_LENGTH, `Title must be ${MAX_TITLE_LENGTH} characters or fewer.`),
    description: z
        .string()
        .trim()
        .max(MAX_DESCRIPTION_LENGTH, `Description must be ${MAX_DESCRIPTION_LENGTH} characters or fewer.`)
        .optional()
        .or(z.literal("")),
    options: z.array(draftPollOptionSchema).max(MAX_OPTIONS, `You can add up to ${MAX_OPTIONS} options.`).optional(),
    votingType: z.enum(VOTING_TYPES).optional(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    timezone: z.string().optional(),
    visibility: z.enum(VISIBILITY_OPTIONS).optional(),
    votingRestriction: z.enum(VOTING_RESTRICTIONS).optional(),
    resultVisibility: z.enum(RESULT_VISIBILITY_OPTIONS).optional(),
};

export const draftPollSchema = applyCrossFieldRules(
    z.object(draftPollShape) as unknown as z.ZodObject<typeof basePollShape>,
    { strictScheduling: false },
);

export type DraftPollFormValues = z.infer<typeof draftPollSchema>;

/** Returns the right schema for the action the user is taking. */
export function getSchemaForIntent(intent: "draft" | "publish") {
    return intent === "draft" ? draftPollSchema : createPollSchema;
}


/** Generates a reasonably unique client-side id for field array rows. */
export function generateId(prefix = "id"): string {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return `${prefix}_${crypto.randomUUID()}`;
    }
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}