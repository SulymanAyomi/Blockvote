// publisher.ts
// Phase one: one on-chain transaction per ballot, sent in shuffled order.
// Runs as its own process. It never touches voter-linked tables except one
// aggregate count (see the reconciliation check).
//
// Required env: POLYGON_RPC_URL, RELAYER_PRIVATE_KEY, BALLOT_ANCHOR_ADDRESS
// Schedule: call tick() about once a minute from a single instance.

import crypto from "node:crypto";
import { ethers } from "ethers";
import prisma from "./db"; // the workers' own Prisma client
import { computeResultHash } from "../lib/voting/voting-logic"; // shared with the API

const WINDOW = 20; // transactions in flight at once
const CONFIRMATIONS = 5; // Polygon PoS: wait a few blocks before trusting a receipt
const WAIT_TIMEOUT_MS = 5 * 60_000;
const MIN_PRIORITY_FEE = ethers.parseUnits("30", "gwei"); // Polygon enforces a minimum tip
const MIN_BALANCE = ethers.parseEther("1"); // stop and alert below this
const CLOSE_GRACE_MS = 5 * 60_000; // after endsAt, give the release worker time to finish
const CLOSED_STATUSES = ["COMPLETED", "CLOSED", "ARCHIVED"];

const ABI = [
  "function anchorBallot(bytes32 electionId, bytes32 ballotHash)",
  "function closeElection(bytes32 electionId, uint32 claimedCount, bytes32 resultHash)",
  "function anchored(bytes32, bytes32) view returns (bool)",
  "function elections(bytes32) view returns (uint32 ballotCount, bool closed, bytes32 resultHash)",
];

const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL!);
const wallet = new ethers.Wallet(process.env.RELAYER_PRIVATE_KEY!, provider);
const contract = new ethers.Contract(process.env.BALLOT_ANCHOR_ADDRESS!, ABI, wallet);

// ── helpers ──────────────────────────────────────────────────

const electionKey = (electionId: string) => ethers.keccak256(ethers.toUtf8Bytes(electionId));
const toBytes32 = (hex: string) => "0x" + hex;
const errName = (e: unknown) => (e instanceof Error ? e.name : "unknown");

// The random ballotId acts as the salt. Keep ballot ids private until the election closes.
export function leaf(
  ballotId: string,
  votes: { electionPositionId: string; candidateId: string }[],
) {
  return crypto
    .createHash("sha256")
    .update(
      ballotId +
      "|" +
      [...votes]
        .sort((a, b) => a.electionPositionId.localeCompare(b.electionPositionId))
        .map((v) => `${v.electionPositionId}:${v.candidateId}`)
        .join(","),
    )
    .digest("hex");
}

// Fisher-Yates with a CSPRNG. Submission order is public forever.
function shuffle<T>(a: T[]) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const confirmRow = (id: string, txHash: string | null) =>
  prisma.blockchainBallot.update({
    where: { id },
    data: { status: "CONFIRMED", polygonTxHash: txHash },
  });

// ── step 1: fingerprint every released ballot ────────────────

async function registerNewBallots(electionId: string) {
  for (; ;) {
    const batch = await prisma.ballot.findMany({
      where: { electionId, blockchainBallot: null },
      select: {
        id: true,
        votes: { select: { electionPositionId: true, candidateId: true } },
      },
      take: 500,
    });
    if (batch.length === 0) return;

    await prisma.blockchainBallot.createMany({
      data: batch.map((b) => ({
        ballotId: b.id,
        electionId,
        ballotHash: leaf(b.id, b.votes),
        status: "PENDING" as const,
      })),
      skipDuplicates: true,
    });
  }
}

// ── step 2: send them, shuffled, in windows ──────────────────

type Row = { id: string; ballotHash: string; polygonTxHash: string | null };

async function processWindow(key: string, rows: Row[]): Promise<boolean> {
  const inflight: { row: Row; hash: string }[] = [];
  const toSend: Row[] = [];

  // Reconcile first: already on chain, or already sent and still in flight?
  const states = await Promise.all(
    rows.map(async (r) => ({
      r,
      onChain: (await contract.anchored(key, toBytes32(r.ballotHash))) as boolean,
      known: r.polygonTxHash ? !!(await provider.getTransaction(r.polygonTxHash)) : false,
    })),
  );
  for (const { r, onChain, known } of states) {
    if (onChain) await confirmRow(r.id, r.polygonTxHash);
    else if (known) inflight.push({ row: r, hash: r.polygonTxHash! });
    else toSend.push(r);
  }

  // Send with explicit sequential nonces. Stop at the first failure so there is no nonce gap.
  let sendFailed = false;
  if (toSend.length > 0) {
    let nonce = await provider.getTransactionCount(wallet.address, "pending");
    const fee = await provider.getFeeData();
    const maxPriorityFeePerGas =
      (fee.maxPriorityFeePerGas ?? 0n) > MIN_PRIORITY_FEE ? fee.maxPriorityFeePerGas! : MIN_PRIORITY_FEE;
    const maxFeePerGas = (fee.maxFeePerGas ?? 0n) + maxPriorityFeePerGas;

    for (const r of toSend) {
      try {
        const tx = await contract.anchorBallot(key, toBytes32(r.ballotHash), {
          nonce: nonce++,
          maxFeePerGas,
          maxPriorityFeePerGas,
        });
        // Save the hash right away so a crash does not cause a duplicate send.
        await prisma.blockchainBallot.update({
          where: { id: r.id },
          data: { polygonTxHash: tx.hash },
        });
        inflight.push({ row: r, hash: tx.hash });
      } catch (e) {
        // Includes AlreadyAnchored races. The next run reconciles through anchored().
        console.error("anchor send failed", errName(e));
        sendFailed = true;
        break;
      }
    }
  }

  // Wait for receipts.
  await Promise.all(
    inflight.map(async ({ row, hash }) => {
      try {
        const receipt = await provider.waitForTransaction(hash, CONFIRMATIONS, WAIT_TIMEOUT_MS);
        if (receipt?.status === 1) {
          await confirmRow(row.id, hash);
        } else {
          // Reverted or dropped: clear the hash so the next run resends.
          await prisma.blockchainBallot.update({ where: { id: row.id }, data: { polygonTxHash: null } });
        }
      } catch (e) {
        console.error("receipt wait failed", errName(e)); // stays PENDING, retried next run
      }
    }),
  );

  return !sendFailed;
}

async function publishPending(electionId: string): Promise<boolean> {
  const key = electionKey(electionId);

  if ((await provider.getBalance(wallet.address)) < MIN_BALANCE) {
    console.error("ALERT: relayer balance low, publishing paused");
    return false;
  }

  // Shuffle the whole pending set, not just each window, so database order never leaks.
  const pending = shuffle(
    await prisma.blockchainBallot.findMany({
      where: { electionId, status: "PENDING" },
      select: { id: true, ballotHash: true, polygonTxHash: true },
    }),
  );

  for (let i = 0; i < pending.length; i += WINDOW) {
    if (!(await processWindow(key, pending.slice(i, i + WINDOW)))) return false;
  }
  return true;
}

// ── step 3: seal the election ────────────────────────────────

async function closeIfReady(electionId: string) {
  const election = await prisma.election.findUnique({
    where: { id: electionId },
    select: { status: true, endsAt: true },
  });
  if (!election) return;

  const over =
    CLOSED_STATUSES.includes(election.status) ||
    Date.now() >= election.endsAt.getTime() + CLOSE_GRACE_MS;
  if (!over) return;

  // The release worker must have emptied the queue.
  if ((await prisma.pendingBallot.count({ where: { electionId } })) > 0) return;

  // Every ballot must be confirmed on-chain.
  const ballots = await prisma.ballot.count({ where: { electionId } });
  const confirmed = await prisma.blockchainBallot.count({ where: { electionId, status: "CONFIRMED" } });
  if (ballots !== confirmed) return;

  // Reconciliation: ballots must equal voters who voted. Aggregate only, never voter ids.
  // Grant the publisher role SELECT on just ("electionId", "hasVoted") of ElectionParticipation.
  const [{ voted }] = await prisma.$queryRaw<{ voted: number }[]>`
    SELECT COUNT(*)::int AS voted FROM "ElectionParticipation"
    WHERE "electionId" = ${electionId}::uuid AND "hasVoted" = true`;
  if (voted !== ballots) {
    console.error("ALERT: ballot count does not match voted count", electionId, { ballots, voted });
    return; // never seal a mismatch; a human investigates
  }

  // Tally. Zero-vote candidates are omitted, so anyone can reproduce the hash from the published ballots.
  const tally = await prisma.vote.groupBy({
    by: ["electionPositionId", "candidateId"],
    where: { ballot: { electionId } },
    _count: { _all: true },
  });
  const rows = tally.map((g) => ({
    electionPositionId: g.electionPositionId,
    candidateId: g.candidateId,
    votes: g._count._all,
  }));
  const resultHash = computeResultHash(electionId, ballots, rows); // 0x-prefixed bytes32

  // Store the tally the hash was computed from. The results endpoint serves ONLY this table,
  // and re-checks it against the sealed hash. Idempotent: safe to re-run after a crash.
  await prisma.$transaction([
    prisma.electionTally.deleteMany({ where: { electionId } }),
    prisma.electionTally.createMany({ data: rows.map((r) => ({ electionId, ...r })) }),
  ]);

  const key = electionKey(electionId);
  const onChain = await contract.elections(key);

  let txHash: string | null = null;
  if (onChain.closed) {
    // Sealed earlier (crash before saving). Verify and record it.
    if (onChain.resultHash !== resultHash) {
      console.error("ALERT: on-chain result hash differs from database tally", electionId);
      return;
    }
  } else {
    const tx = await contract.closeElection(key, ballots, resultHash);
    await tx.wait(CONFIRMATIONS);
    txHash = tx.hash;
  }

  await prisma.blockchainResult.upsert({
    where: { electionId },
    create: { electionId, resultHash, polygonTxHash: txHash },
    update: { resultHash, ...(txHash ? { polygonTxHash: txHash } : {}) },
  });
}

// ── entry point ──────────────────────────────────────────────

let running = false;

export async function tick() {
  if (running) return; // a slow run must not overlap the next one
  running = true;
  try {
    const sealed = new Set(
      (await prisma.blockchainResult.findMany({ select: { electionId: true } })).map((r) => r.electionId),
    );
    const withBallots = await prisma.ballot.groupBy({ by: ["electionId"] });

    for (const { electionId } of withBallots) {
      if (sealed.has(electionId)) continue;
      try {
        await registerNewBallots(electionId);
        await publishPending(electionId);
        await closeIfReady(electionId);
      } catch (e) {
        // Never log error objects, hashes, ballots or keys.
        console.error("publish failed", electionId, errName(e));
      }
    }
  } finally {
    running = false;
  }
}
