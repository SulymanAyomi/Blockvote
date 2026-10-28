import prisma, { errInfo } from "./db";
import { z } from "zod";
import crypto from "crypto"

const PRIVATE_PEM = process.env.BALLOT_SEAL_PRIVATE_KEY!;
const MIN_BATCH = 10;              // anonymity set: don't release fewer than this mid-election
const CLOSE_GRACE_MS = 60_000;     // let in-flight ballot transactions finish before the final release
const RSA_BYTES = 256;             // 2048-bit key; must match seal()
const CLOSED = ["COMPLETED", "CLOSED", "ARCHIVED"];

const selectionsSchema = z.array(z.object({
    positionId: z.string().uuid(),
    candidateId: z.string().uuid(),
})).min(1).max(50);

// Inverse of seal(): wrapped key | iv (12) | auth tag (16) | ciphertext
function open(sealedB64: string) {
    const buf = Buffer.from(sealedB64, "base64");
    const wrapped = buf.subarray(0, RSA_BYTES);
    const iv = buf.subarray(RSA_BYTES, RSA_BYTES + 12);
    const tag = buf.subarray(RSA_BYTES + 12, RSA_BYTES + 28);
    const ct = buf.subarray(RSA_BYTES + 28);
    const key = crypto.privateDecrypt(
        { key: PRIVATE_PEM, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash: "sha256" }, wrapped);
    const d = crypto.createDecipheriv("aes-256-gcm", key, iv);
    d.setAuthTag(tag);
    return JSON.parse(Buffer.concat([d.update(ct), d.final()]).toString());
}

// Fisher-Yates with a CSPRNG. Math.random() would be predictable.
function shuffle<T>(a: T[]) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = crypto.randomInt(i + 1);
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

export async function releaseElection(electionId: string) {
    const election = await prisma.election.findUnique({
        where: { id: electionId }, select: { status: true, endsAt: true },
    });
    if (!election) return 0;

    const closed = CLOSED.includes(election.status) || Date.now() >= election.endsAt.getTime() + CLOSE_GRACE_MS;
    const pending = await prisma.pendingBallot.count({ where: { electionId } });
    if (pending === 0 || (!closed && pending < MIN_BATCH)) return 0;

    return prisma.$transaction(async (tx) => {
        // One worker per election at a time
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${electionId}))`;

        const rows = await tx.pendingBallot.findMany({
            where: { electionId }, select: { id: true, sealed: true },
        });
        if (rows.length === 0 || (!closed && rows.length < MIN_BATCH)) return 0;

        const ballots = shuffle(rows.map(r => selectionsSchema.parse(open(r.sealed))));

        // Defense in depth: every candidate must belong to the position it was cast for, in this election
        const cands = await tx.candidate.findMany({
            where: { electionPosition: { electionId } }, select: { id: true, electionPositionId: true },
        });
        const positionOf = new Map(cands.map(c => [c.id, c.electionPositionId]));
        for (const sel of ballots)
            for (const v of sel)
                if (positionOf.get(v.candidateId) !== v.positionId) throw new Error("BALLOT_INTEGRITY");

        const batchId = crypto.randomUUID();
        const ids = ballots.map(() => crypto.randomUUID());

        await tx.ballot.createMany({ data: ids.map(id => ({ id, electionId, batchId })) });
        await tx.vote.createMany({
            data: ballots.flatMap((sel, i) =>
                sel.map(v => ({ ballotId: ids[i], electionPositionId: v.positionId, candidateId: v.candidateId }))),
        });
        // Delete by the ids we read, so a ballot that arrived mid-transaction is not lost
        await tx.pendingBallot.deleteMany({ where: { id: { in: rows.map(r => r.id) } } });

        return rows.length;
    }, { timeout: 60_000 });
}

// Run every minute from cron or a scheduler
export async function tick() {
    const firstElection = await prisma.election.findFirst();
    console.log("first election :", firstElection);
    const groups = await prisma.pendingBallot.groupBy({ by: ["electionId"] });
    for (const { electionId } of groups) {
        try {
            await releaseElection(electionId);
        } catch (e) {
            // Never log the error object or the sealed rows. Alert a human here.
            console.error("release failed", electionId, errInfo(e));
        }
    }
}