import z from "zod";
import { electionStatusEnum } from "../admin/schema";

export const ballotSchema = z.object({
    ballot: z.array(z.object({
        positionId: z.uuid(),
        candidateId: z.uuid()
    })
    ).min(1, "Ballot cannot be empty"),
    votingSessionId: z.string(),
    anonymousToken: z.string(),
});
export const FaceSchema = z.object({
    votingSessionId: z.string(),
    electionId: z.uuid(),
    imageBase64: z.string()
});
export const listElectionsQuerySchema = z.object({
    status: z.string().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
});

type status = "ALL" | "ACTIVE" | "SCHEDULED" | "COMPLETED"