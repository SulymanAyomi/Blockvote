import { z } from "zod";
import { ResultVisibility, Visibility, VotingRestriction, VotingType } from "./types";


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

export const pollSection1Schema = z.object({
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
});

export const pollSection2Schema = z.object({
    votingType: z.enum(VOTING_TYPES, { error: "Choose a voting type." }),
    maxSelections: z.coerce.number().int().min(1).max(50).optional(),
    visibility: z.enum(VISIBILITY_OPTIONS, { error: "Choose who can see this poll." }),
    votingRestriction: z.enum(VOTING_RESTRICTIONS, { error: "Choose who can vote." }),
    anonymousVoting: z.boolean(),
    allowVoteChanges: z.boolean(),
});


export const pollSection3Schema = z.object({
    startDate: z.date({ error: "Start date and time is required." }),
    endDate: z.date({ error: "End date and time is required." }),
    // timezone: z.string().min(1, "Choose a timezone."),
});

export const candidateSchema = z.object({
    name: z
        .string()
        .trim()
        .min(MIN_TITLE_LENGTH, `Title must be at least ${MIN_TITLE_LENGTH} characters.`)
        .max(MAX_TITLE_LENGTH, `Title must be ${MAX_TITLE_LENGTH} characters or fewer.`),
    profile: z
        .string()
        .trim()
        .min(MIN_DESCRIPTION_LENGTH, `Candidate profile must be at least ${MIN_DESCRIPTION_LENGTH} characters.`)
        .max(MAX_DESCRIPTION_LENGTH, `Candidate profile must be ${MAX_DESCRIPTION_LENGTH} characters or fewer.`),
    candidateImage: imageFileSchema,
    candidatePreviewUrl: z.string().optional(),
    DOB: z.date({ error: "Date of birth is required." }),
    partyName: z
        .string()
        .trim()
        .min(3, `Title must be at least ${3} characters.`)
        .max(10, `Title must be ${10} characters or fewer.`),
    partyImage: imageFileSchema,
});

