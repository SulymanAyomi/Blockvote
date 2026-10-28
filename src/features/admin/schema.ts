import { z } from "zod";

// ---------------------------------------------------------------------------
// Shared enum schemas (mirror the Prisma enums)
// ---------------------------------------------------------------------------

export const genderEnum = z.enum([
    "Male", "Female"
]);

export const levelEnum = z.enum([
    "100", "200", "300", "400", "500"]);

export const scope1TypeEnum = z.enum([
    "UNIVERSITY",
    "CAMPUS",
    "FACULTY",
    "DEPARTMENT",
    "PROGRAMME",
    "LEVEL",
]);


export const scopeTypeEnum = z.enum([
    "UNIVERSITY", "CAMPUS", "FACULTY", "DEPARTMENT", "PROGRAMME", "LEVEL",
]);

export const electionStatusEnum = z.enum([
    "DRAFT", "SCHEDULED", "ACTIVE", "COMPLETED", "CLOSED", "ARCHIVED", "CANCELLED",
]);

export const DateFilterPreset = z.enum([
    "TODAY", "THIS_WEEK", "THIS_MONTH", "CUSTOM", "UPCOMING", "PAST",
]);

export type ScopeType = z.infer<typeof scopeTypeEnum>;
export type ElectionStatus = z.infer<typeof electionStatusEnum>;
export type DateFilterPresetType = z.infer<typeof DateFilterPreset>;

// ---------------------------------------------------------------------------
// 2. List elections (query params)
// ---------------------------------------------------------------------------

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;

export const listElectionsQuerySchema = z.object({
    search: z.string().trim().optional().transform((v) => v || undefined),
    status: electionStatusEnum.optional(),
    scope: scopeTypeEnum.optional(),
    datePreset: DateFilterPreset.optional(),
    dateFrom: z.coerce.date().optional(),
    dateTo: z.coerce.date().optional(),
    page: z.coerce.number().int().min(1).default(DEFAULT_PAGE),
    limit: z.coerce.number().int().min(1).max(100).default(DEFAULT_LIMIT),
});



export type ListElectionsQuery = z.infer<typeof listElectionsQuerySchema>;

export const listCandidatesQuerySchema = z.object({
    electionId: z.string(),
    search: z.string().optional(),
    facultyId: z.string().uuid().optional(),
    departmentId: z.string().uuid().optional(),
    // gender: genderEnum.optional(),
    level: levelEnum.optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type listCandidatesQuery = z.infer<typeof listCandidatesQuerySchema>;

// ---------------------------------------------------------------------------
// 3. Single election param
// ---------------------------------------------------------------------------

export const electionIdParamSchema = z.object({
    electionId: z.string().uuid(),
});

export const departmentsSchema = z.object({
    facultyId: z.string().uuid().optional(),
});

// ---------------------------------------------------------------------------
// 4. Create election
// ---------------------------------------------------------------------------

const scopeInputSchema = z.object({
    type: scope1TypeEnum,
    value: z.string().trim().min(1),
});

const positionInputSchema = z
    .object({
        // reference used purely inside the payload to link candidates -> position
        ref: z.string().trim().optional(),
        // either reuse an existing global Position, or create a new one by name
        id: z.string().uuid().optional(),
        name: z.string().trim().min(1).optional(),
    })
    .refine((p) => p.id || p.name, {
        message: "Either positionId or name must be provided for a position",
    });

const candidateInputSchema = z.object({
    positionRef: z.string().trim().min(1), // matches positionInputSchema.ref
    voterId: z.string().uuid(),
    manifesto: z.string().optional(),
    campaignSlogan: z.string().max(255).optional(),
    imageUrl: z.string().url().optional(),
    cvUrl: z.string().url().optional(),
    socialLinks: z.record(z.string(), z.string()).optional(),
    isIndependent: z.boolean().default(true),
    partyAffiliation: z.string().max(100).optional(),
});
const electionSchedule = z.object({
    startDate: z.coerce.string(),
    startTime: z.string().trim().min(1),
    endDate: z.coerce.string(),
    endTime: z.string().trim().min(1),
    timezone: z.string().trim().min(1),
});

export const createElectionSchema = z
    .object({
        election: z.object({
            title: z.string().trim().min(1),
            description: z.string().optional(),
            coverImage: z.string().url().optional(),
            academicSessionId: z.string().uuid(),
            schedule: electionSchedule
        }),
        scope: scopeInputSchema,
        positions: z.array(positionInputSchema).min(1),
        candidates: z.array(candidateInputSchema).default([]),
        saveAsDraft: z.boolean().default(true),
    })
// .refine((data) => data.election.schedule.endsAt > data.election.schedule.startsAt, {
//     message: "endsAt must be after startsAt",
//     path: ["election", "endsAt"],
// })
// .refine(
//     (data) => {
//         const refs = new Set(data.positions.map((p) => p.ref));
//         return refs.size === data.positions.length;
//     },
//     { message: "Duplicate position ref in positions[]", path: ["positions"] }
// )
// .refine(
//     (data) => {
//         const refs = new Set(data.positions.map((p) => p.ref));
//         return data.candidates.every((c) => refs.has(c.positionRef));
//     },
//     {
//         message: "candidate.positionRef must match a ref in positions[]",
//         path: ["candidates"],
//     }
// )
// .refine(
//     (data) => {
//         // Rule: a candidate (voter) cannot contest two positions in one election
//         const seen = new Set<string>();
//         for (const c of data.candidates) {
//             if (seen.has(c.voterId)) return false;
//             seen.add(c.voterId);
//         }
//         return true;
//     },
//     {
//         message: "A voter cannot contest more than one position in the same election",
//         path: ["candidates"],
//     }
// );

export type CreateElectionInput = z.infer<typeof createElectionSchema>;

// ---------------------------------------------------------------------------
// 5. Update election
// ---------------------------------------------------------------------------

export const updateElectionSchema = z
    .object({
        title: z.string().trim().min(1).optional(),
        description: z.string().optional(),
        coverImage: z.string().url().optional(),
        academicSessionId: z.string().uuid().optional(),
        startsAt: z.coerce.date().optional(),
        endsAt: z.coerce.date().optional(),
        scope: z.array(scopeInputSchema).min(1).optional(),
    })
    .refine(
        (data) =>
            !(data.startsAt && data.endsAt) || data.endsAt > data.startsAt,
        { message: "endsAt must be after startsAt", path: ["endsAt"] }
    );

export type UpdateElectionInput = z.infer<typeof updateElectionSchema>;

// ---------------------------------------------------------------------------
// 9. Add election position
// ---------------------------------------------------------------------------

export const addElectionPositionSchema = z.object({
    positionId: z.string().uuid(),
});

export const electionPositionParamSchema = z.object({
    electionId: z.string().uuid(), // electionId
    electionPositionId: z.string().uuid(),
});

// ---------------------------------------------------------------------------
// 11. Add candidate to an election position
// ---------------------------------------------------------------------------

export const addCandidateSchema = z.object({
    voterId: z.string().uuid(),
    manifesto: z.string().optional(),
    campaignSlogan: z.string().max(255).optional(),
    imageUrl: z.string().url().optional(),
    cvUrl: z.string().url().optional(),
    socialLinks: z.record(z.string(), z.string()).optional(),
    isIndependent: z.boolean().default(true),
    partyAffiliation: z.string().max(100).optional(),
});

export const addManyCandidateSchema = z.object({
    votersId: z.array(z.string().uuid()).min(1),

});

export const candidateParamSchema = z.object({
    electionId: z.string().uuid(), // electionId
    electionPositionId: z.string().uuid(),
    candidateId: z.string().uuid(),
});