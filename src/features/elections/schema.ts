import z from "zod";

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
