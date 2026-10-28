
// Pure functions shared by the publisher (computes the hash at seal time), the results
// endpoint (re-checks it before serving) and any public verification script.
// Keep this file free of Next.js and Prisma imports so workers can import it too.
import crypto from "node:crypto";

export type TallyRow = { electionPositionId: string; candidateId: string; votes: number };

/**
 * sha256(electionId | ballotCount | sorted "position:candidate:votes" rows), as a 0x-prefixed bytes32.
 * Rows with zero votes are never included, so the table and the hash always describe the same data.
 */
export function computeResultHash(electionId: string, ballotCount: number, rows: TallyRow[]) {
    const canonical = rows
        .map((r) => `${r.electionPositionId}:${r.candidateId}:${r.votes}`)
        .sort()
        .join(";");
    return (
        "0x" +
        crypto.createHash("sha256").update(`${electionId}|${ballotCount}|${canonical}`).digest("hex")
    );
}

export type PositionIn = {
    id: string;
    position: { name: string };
    candidates: { id: string; imageUrl: string | null; voter: { fullName: string } }[];
};

const pct = (n: number, d: number) => (d > 0 ? Math.round((n / d) * 1000) / 10 : 0);

/** Ranks candidates per position. A tie for first marks every leader as a winner and sets tied: true. */
export function buildResults(positions: PositionIn[], votesFor: Map<string, number>) {
    return positions.map((p) => {
        const cands = p.candidates.map((c) => ({
            id: c.id,
            fullName: c.voter.fullName,
            imageUrl: c.imageUrl,
            votes: votesFor.get(c.id) ?? 0, // candidates with no rows got zero votes
        }));

        const total = cands.reduce((s, c) => s + c.votes, 0);
        const top = Math.max(0, ...cands.map((c) => c.votes));
        const leaders = top > 0 ? cands.filter((c) => c.votes === top).length : 0;

        cands.sort((a, b) => b.votes - a.votes || a.fullName.localeCompare(b.fullName));

        return {
            id: p.id,
            name: p.position.name,
            totalVotes: total,
            tied: leaders > 1, // the UI must not name a single winner when this is true
            candidates: cands.map((c) => ({
                ...c,
                percent: pct(c.votes, total),
                isWinner: top > 0 && c.votes === top,
            })),
        };
    });
}

export const percentOf = pct;
