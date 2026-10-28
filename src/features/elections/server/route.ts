import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator"
import crypto from "crypto"
import prisma from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api-response";
import { callPythonVerify } from "@/lib/verification/pythonServiceClient";
import { THRESHOLDS } from "@/lib/verification/types";
import { getSession } from "@/lib/session";
import { ballotSchema, FaceSchema, listElectionsQuerySchema } from "../schema";
import { Prisma, VotingSession } from "@/generated/client";
import { signToken, verifyToken } from "@/lib/voting/token";
import { seal } from "@/lib/voting/seal";
import z from "zod";
import { buildResults, computeResultHash, percentOf } from "@/lib/voting/voting-logic";


const MAX_FACE_ATTEMPTS = 5;

const SESSION_TTL_MS = 10 * 60_000; // confirm: pre-token phase
const TOKEN_TTL_MS = 10 * 60_000;



const LIVE = ["PENDING", "FACE_VERIFIED", "TOKEN_ISSUED"] as const;

const toDto = (s: VotingSession, now: Date) => {
    if (s.status === "COMPLETED")
        return { voterSessionId: s.id, status: "COMPLETED", errorCode: "voted" };
    if (s.status === "EXPIRED" || s.status === "ABANDONED" || s.expiresAt <= now)
        return { voterSessionId: s.id, status: "EXPIRED", errorCode: "session_expired" };
    return { voterSessionId: s.id, status: s.status, errorCode: null };
};

const app = new Hono()

    .get("/dashboard", async (c) => {
        try {
            const auth = await getSession();

            if (!auth.isLoggedIn || !auth.sid) return c.json(errorResponse("UNAUTHENTICATED"), 401);

            const account = await prisma.account.findUnique({ where: { id: auth.id } });

            const voter = await prisma.voterRoll.findUnique({
                where: {
                    id: account?.voterId
                }
            })

            if (!voter) {
                return c.json(errorResponse("ACCOUNT_LOCKED"), 404)
            }

            const [el, votedEl] = await Promise.all([
                prisma.electionParticipation.findMany({
                    where: { voterId: voter?.id }, select: { electionId: true }
                }),
                prisma.electionParticipation.findMany({
                    where: {
                        voterId: voter?.id, hasVoted: true
                    }, select: { electionId: true }
                })
            ]);

            const eligbileElectionsId = el.map((e) => e.electionId)
            const votedElections = votedEl.map((e) => e.electionId)

            const [active, participated, upcoming, positionGroups] = await Promise.all([
                prisma.election.count({ where: { id: { in: eligbileElectionsId }, status: { in: ["ACTIVE"] } } }),
                prisma.election.count({ where: { id: { in: votedElections }, status: "COMPLETED" } }),
                prisma.election.count({
                    where: { id: { in: eligbileElectionsId }, status: "SCHEDULED", startsAt: { gt: new Date() } },
                }),
                prisma.electionPosition.groupBy({
                    by: ["electionId"],
                    where: { electionId: { in: eligbileElectionsId } },
                    _count: { _all: true },
                }),

            ]);

            const positionsByIds = new Map(
                positionGroups?.map((g) => [g.electionId, g._count._all])
            )

            const [activeElection, upcomingElection, candidatesCount, accouncement] = await Promise.all([
                prisma.election.findMany({
                    where: { id: { in: eligbileElectionsId }, status: { in: ["ACTIVE"] } },
                    include: { scopes: true },
                    orderBy: { startsAt: "desc" }
                }),
                prisma.election.findMany({
                    where: { id: { in: eligbileElectionsId }, status: "SCHEDULED", startsAt: { gt: new Date() } },
                    include: { scopes: true },
                    orderBy: { startsAt: "desc" }
                }),
                prisma.electionPosition.findMany({
                    where: { electionId: { in: eligbileElectionsId } },
                    select: {
                        id: true, electionId: true, _count: {
                            select: { candidates: true }
                        }
                    },
                }),
                prisma.announcement.findMany(),
            ]);

            const data = {
                counts: {
                    active,
                    upcoming,
                    participated
                },
                active: activeElection.map((e) => {
                    const candidateCount = candidatesCount.find((c) => c.electionId == e.id)?._count.candidates ?? 0
                    const positionCount = positionsByIds.get(e.id) ?? 0;
                    const voted = votedElections.find((v) => e.id == v) ? true : false // if id is in votedelection list, voter already voted
                    const eligible = true
                    return { ...e, candidateCount, positionCount, eligible, voted }
                }),
                upcoming: upcomingElection.map((e) => {
                    const candidateCount = candidatesCount.find((c) => c.electionId == e.id)?._count.candidates ?? 0
                    const positionCount = positionsByIds.get(e.id) ?? 0;
                    const voted = votedElections.find((v) => e.id == v) ? true : false // if id is in votedelection list, voter already voted
                    const eligible = true
                    return { ...e, candidateCount, positionCount, voted, eligible }
                }),
                announcements: accouncement,
            }

            return c.json(successResponse({ ...data }));
        } catch (e) {
            console.error("dashboard failed", e instanceof Error ? e.name : "unknown", (e as any)?.code);
            return c.json(errorResponse("INTERNAL_ERROR"), 500);
        }
    })
    .get("/all",
        zValidator("query", listElectionsQuerySchema),
        async (c) => {
            try {
                const auth = await getSession();

                if (!auth.isLoggedIn || !auth.sid) return c.json(errorResponse("UNAUTHENTICATED"), 401);

                const { limit, page, status } = c.req.valid("query");

                const account = await prisma.account.findUnique({ where: { id: auth.id } });

                const voter = await prisma.voterRoll.findUnique({
                    where: {
                        id: account?.voterId
                    }
                })

                if (!voter) {
                    return c.json(errorResponse("Voter not found. Try again"), 404)
                }

                const [el, votedEl] = await Promise.all([
                    prisma.electionParticipation.findMany({
                        where: { voterId: voter?.id }, select: { electionId: true }
                    }),
                    prisma.electionParticipation.findMany({
                        where: {
                            voterId: voter?.id, hasVoted: true
                        }, select: { electionId: true }
                    })
                ]);

                const eligbileElectionsId = el.map((e) => e.electionId)
                const votedElections = votedEl.map((e) => e.electionId)

                const [all, active, completed, upcoming] = await Promise.all([
                    prisma.election.count(),
                    prisma.election.count({ where: { status: { in: ["ACTIVE"] } } }),
                    prisma.election.count({ where: { status: "COMPLETED" } }),
                    prisma.election.count({
                        where: { status: "SCHEDULED", startsAt: { gt: new Date() } },
                    }),
                ]);

                const positionGroups = await prisma.electionPosition.groupBy({
                    by: ["electionId"],
                    where: { electionId: { in: eligbileElectionsId } },
                    _count: { _all: true },
                });

                const positionsByIds = new Map(
                    positionGroups?.map((g) => [g.electionId, g._count._all])
                )

                const where: any = {};
                if (status == "ACTIVE" || status == "SCHEDULED" || status == "COMPLETED") {
                    where.status = status
                }
                const [elections, candidatesCount] = await Promise.all([
                    prisma.election.findMany({
                        where: where,
                        include: { scopes: true },
                        orderBy: { startsAt: "desc" }
                    }),
                    prisma.electionPosition.findMany({
                        where: { electionId: { in: eligbileElectionsId } },
                        select: {
                            id: true, electionId: true, _count: {
                                select: { candidates: true }
                            }
                        },
                    }),

                ]);

                const data = {
                    counts: {
                        All: all,
                        Active: active,
                        Upcoming: upcoming,
                        Completed: completed
                    },
                    elections: elections.map((e) => {
                        const candidateCount = candidatesCount.find((c) => c.electionId == e.id)?._count.candidates ?? 0
                        const positionCount = positionsByIds.get(e.id) ?? 0;
                        const voted = votedElections.find((v) => e.id == v) ? true : false // if id is in votedelection list, voter already voted
                        const eligible = eligbileElectionsId.find(v => v == e.id) ? true : false // if id is in eligbile list, voter is eligble
                        return { ...e, candidateCount, positionCount, voted, eligible }
                    })
                }

                return c.json(successResponse({ ...data }));
            } catch (e) {
                console.error("elections fetch failed", e instanceof Error ? e.name : "unknown", (e as any)?.code);
                return c.json(errorResponse("INTERNAL_ERROR"), 500);
            }
        })
    .get("/ongoing", async (c) => {
        try {
            const auth = await getSession();

            if (!auth.isLoggedIn || !auth.sid) return c.json(errorResponse("UNAUTHENTICATED"), 401);

            const account = await prisma.account.findUnique({ where: { id: auth.id } });

            const voter = await prisma.voterRoll.findUnique({
                where: {
                    id: account?.voterId
                }
            })

            if (!voter) {
                return c.json(errorResponse("Voter not found. Try again"), 404)

            }

            const el = await prisma.electionParticipation.findMany({
                where: {
                    voterId: voter?.id
                },
                select: {
                    electionId: true
                }
            })

            const eligbileElectionsId = el.map((e) => e.electionId)

            const election = await prisma.election.findMany({
                where: {
                    id: {
                        in: eligbileElectionsId
                    }
                }
            })
            return c.json(successResponse({ election }));
        } catch (e) {
            console.log(e)
            return c.json(errorResponse("Something went wrong. Try again"), 500)
        }
    })
    .get("/activities", async (c) => {
        try {
            const auth = await getSession();
            if (!auth.isLoggedIn) return c.json(errorResponse("UNAUTHENTICATED"), 401);

            const account = await prisma.account.findUnique({ where: { id: auth.id } });

            const voter = await prisma.voterRoll.findUnique({
                where: {
                    id: account?.voterId
                }
            })

            if (!voter) {
                return c.json(errorResponse("Voter not found. Try again"), 404)

            }

            const el = await prisma.electionParticipation.findMany({
                where: {
                    voterId: voter?.id
                },
                select: {
                    electionId: true,
                    hasVoted: true,
                    votedAt: true
                }
            })

            const eligbileElectionsId = el.map((e) => e.electionId)

            const elections = await prisma.election.findMany({
                where: {
                    id: {
                        in: eligbileElectionsId
                    }
                },
            })

            const data = elections.map((e) => {
                const voted = el.find((v) => e.id == v.electionId)?.hasVoted ?? false
                const votedAt = el.find((v) => e.id == v.electionId)?.votedAt ?? null
                const eligible = eligbileElectionsId.find(v => v == e.id) ? true : false
                return { ...e, voted, eligible, votedAt }
            })
            return c.json(successResponse(data));
        } catch (e) {
            console.error("activities failed", e instanceof Error ? e.name : "unknown", (e as any)?.code);
            return c.json(errorResponse("INTERNAL_ERROR"), 500);
        }
    })
    .post("/voting-session/face-verify", zValidator("json", FaceSchema), async (c) => {
        try {
            const auth = await getSession();
            if (!auth.isLoggedIn) return c.json(errorResponse("UNAUTHENTICATED"), 401);

            const account = await prisma.account.findUnique({
                where: { id: auth.id },
                select: { voterId: true },
            });
            if (!account) return c.json(errorResponse("UNAUTHENTICATED"), 401);

            const { voterId } = account;

            const { votingSessionId, electionId, imageBase64 } = c.req.valid("json")

            // Ownership enforced in the lookup itself
            const session = await prisma.votingSession.findFirst({
                where: { id: votingSessionId, electionId, voterId },
            });
            if (!session) return c.json(errorResponse("SESSION_NOT_FOUND"), 404);

            const now = new Date();

            if (session.status === "COMPLETED")
                return c.json(errorResponse("ALREADY_VOTED"), 409);
            if (session.status === "FACE_VERIFIED")
                return c.json(successResponse({ status: "approved", message: "Identity verified." }));
            if (session.status === "EXPIRED" || session.status === "ABANDONED" || session.expiresAt <= now)
                return c.json(errorResponse("SESSION_EXPIRED"), 409);
            if (session.status !== "PENDING")
                return c.json(errorResponse("INVALID_SESSION_STATE"), 409);

            const election = await prisma.election.findUnique({
                where: { id: electionId },
                select: { status: true, endsAt: true },
            });
            if (!election || election.status !== "ACTIVE" || now >= election.endsAt)
                return c.json(errorResponse("ELECTION_NOT_OPEN"), 409);

            // Atomically claim an attempt BEFORE calling the verifier.
            // eligible/hasVoted in the where are a backstop, so count 0 means "blocked".
            const claim = await prisma.electionParticipation.updateMany({
                where: {
                    electionId, voterId, eligible: true, hasVoted: false,
                    faceAttempts: { lt: MAX_FACE_ATTEMPTS },
                },
                data: { faceAttempts: { increment: 1 } },
            });
            // if (claim.count !== 1)
            // return c.json(errorResponse("FACE_ATTEMPTS_EXCEEDED"), 429);

            const rawBase64 = imageBase64.replace(/^data:image\/(jpeg|png);base64,/, "");

            let result;
            try {
                result = await callPythonVerify({ liveImageBase64: rawBase64, voterId });
            } catch (err) {
                console.error("face-verify: service failure", { sessionId: session.id });
                await prisma.electionParticipation.updateMany({   // refund the attempt
                    where: { electionId, voterId, faceAttempts: { gt: 0 } },
                    data: { faceAttempts: { decrement: 1 } },
                });
                return c.json(errorResponse("FACE_SERVICE_UNAVAILABLE"), 503);
            }

            const p = await prisma.electionParticipation.findUnique({
                where: { electionId_voterId: { electionId, voterId } },
                select: { faceAttempts: true },
            });
            const attemptsRemaining = Math.max(0, MAX_FACE_ATTEMPTS - (p?.faceAttempts ?? MAX_FACE_ATTEMPTS));

            if (!result.faceDetected) {
                return c.json(successResponse({
                    status: "no_face_detected", attemptsRemaining,
                    message: "No face was detected. Please try again.",
                }));
            }

            const approved =
                Number.isFinite(result.similarity) && result.similarity >= THRESHOLDS.approve;

            if (!approved) {   // manual_review is treated as rejected until a review flow exists
                return c.json(successResponse({
                    status: "rejected", attemptsRemaining,
                    message: "We couldn't verify your identity. Retake the photo or contact the election committee.",
                }));
            }

            // Compare-and-set: only PENDING, unexpired, owned sessions advance
            const cas = await prisma.votingSession.updateMany({
                where: {
                    id: session.id, voterId, electionId,
                    status: "PENDING", expiresAt: { gt: new Date() },
                },
                data: { status: "FACE_VERIFIED" },
            });
            if (cas.count !== 1)
                return c.json(errorResponse("INVALID_SESSION_STATE"), 409);

            return c.json(successResponse({
                status: "approved", attemptsRemaining,
                message: "Identity verified. You may proceed to vote.",
            }));
        } catch (e) {
            console.error("face-verify failed", e);
            return c.json(errorResponse("INTERNAL_ERROR"), 500);
        }
    })
    .get("/:electionId", async (c) => {
        try {
            const auth = await getSession();
            if (!auth.isLoggedIn || !auth.sid) return c.json(errorResponse("UNAUTHENTICATED"), 401);
            const { electionId } = c.req.param();

            const account = await prisma.account.findUnique({ where: { id: auth.id }, select: { voterId: true } });
            if (!account) return c.json(errorResponse("UNAUTHENTICATED"), 401);

            const election = await prisma.election.findFirst({
                where: { id: electionId, status: { not: "DRAFT" } },
                select: {
                    id: true, title: true, code: true, description: true, about: true, coverImage: true,
                    status: true, startsAt: true, endsAt: true,
                    scopes: { select: { type: true, value: true } },
                    positions: {
                        select: {
                            id: true, description: true,
                            position: { select: { name: true } },
                            candidates: {
                                orderBy: { voter: { fullName: "asc" } },
                                select: {
                                    id: true, manifesto: true, platform: true,
                                    campaignSlogan: true, imageUrl: true,
                                    voter: { select: { fullName: true, level: true, department: { select: { name: true } } } },
                                },
                            },
                        },
                    },
                },
            });
            if (!election) return c.json(errorResponse("ELECTION_NOT_FOUND"), 404);

            const participation = await prisma.electionParticipation.findUnique({
                where: { electionId_voterId: { electionId, voterId: account.voterId } },
                select: { eligible: true, hasVoted: true },
            });

            const { positions, ...rest } = election;
            return c.json(successResponse({
                election: {
                    ...rest, voted: participation?.hasVoted ?? false, eligible: participation?.eligible ?? false, submittedAt: new Date(),
                    resultsPublished: false,
                    publishAt: new Date(),
                },
                positions,
            }));
        } catch (e) {
            console.error("get-election failed", e);
            return c.json(errorResponse("INTERNAL_ERROR"), 500);
        }
    })
    .post("/:electionId/eligibility", async (c) => {
        try {

            const auth = await getSession();
            if (!auth.isLoggedIn || !auth.sid) return c.json(errorResponse("UNAUTHENTICATED"), 401);

            const { electionId } = c.req.param()

            const account = await prisma.account.findUnique({
                where: { id: auth.id },
                select: { voterId: true },
            });

            if (!account) return c.json(errorResponse("UNAUTHENTICATED"), 401);
            const { voterId } = account;

            const election = await prisma.election.findUnique({ where: { id: electionId } });
            if (!election) return c.json(errorResponse("ELECTION_NOT_FOUND"), 404);

            const now = new Date();
            if (election.status !== "ACTIVE" || now < election.startsAt)
                return c.json(errorResponse("ELECTION_NOT_OPEN"), 409);
            if (now >= election.endsAt)
                return c.json(errorResponse("ELECTION_ENDED"), 409);

            const participation = await prisma.electionParticipation.findUnique({
                where: { electionId_voterId: { electionId, voterId } },
            });
            if (!participation || !participation.eligible)
                return c.json(errorResponse("NOT_ELIGIBLE"), 403);
            if (participation.hasVoted)
                return c.json(successResponse({ voterSessionId: null, status: "COMPLETED", errorCode: "voted" }));

            const load = () =>
                prisma.votingSession.findFirst({
                    where: { voterId, electionId },
                    orderBy: { createdAt: "desc" },
                });

            let session = await load();

            // A session created by a different login never carries over: that login must verify its own face.
            if (session && session.status !== "COMPLETED" && session.authSessionId !== auth.sid) {
                await prisma.votingSession.deleteMany({
                    where: {
                        id: session.id, voterId, electionId,
                        authSessionId: { not: auth.sid },
                        status: { not: "COMPLETED" },
                    },
                });
                session = null;   // fall through to create
            }

            if (!session) {
                const expiresAt = new Date(
                    Math.min(now.getTime() + SESSION_TTL_MS, election.endsAt.getTime())
                );
                try {
                    session = await prisma.votingSession.create({
                        data: { voterId, electionId, status: "PENDING", expiresAt, authSessionId: auth.sid },
                    });
                } catch (e: any) {
                    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
                        session = await load(); // lost the race, use the winner's row
                    } else throw e;
                }
            }

            if (!session) throw new Error("SESSION_NOT_FOUND");
            return c.json(successResponse(toDto(session, now)));

        } catch (e) {
            console.error("create-session failed", e);
            return c.json(errorResponse("INTERNAL_ERROR"), 500);
        }
    })
    .post("/:electionId/authourization", async (c) => {
        try {
            const auth = await getSession();
            if (!auth.isLoggedIn || !auth.sid) return c.json(errorResponse("UNAUTHENTICATED"), 401);

            const { electionId } = c.req.param();

            const account = await prisma.account.findUnique({
                where: { id: auth.id },
                select: { voterId: true },
            });
            if (!account) return c.json(errorResponse("UNAUTHENTICATED"), 401);
            const { voterId } = account;

            const election = await prisma.election.findUnique({
                where: { id: electionId },
                select: { status: true, startsAt: true, endsAt: true },
            });
            if (!election) return c.json(errorResponse("ELECTION_NOT_FOUND"), 404);

            const now = new Date();
            if (election.status !== "ACTIVE" || now < election.startsAt || now >= election.endsAt)
                return c.json(errorResponse("ELECTION_NOT_OPEN"), 409);

            const participation = await prisma.electionParticipation.findUnique({
                where: { electionId_voterId: { electionId, voterId } },
            });
            if (!participation || !participation.eligible)
                return c.json(errorResponse("NOT_ELIGIBLE"), 403);
            if (participation.hasVoted)
                return c.json(errorResponse("ALREADY_VOTED"), 409);

            const session = await prisma.votingSession.findFirst({
                where: { voterId, electionId, authSessionId: auth.sid },
                orderBy: { createdAt: "desc" },
            });
            if (!session) return c.json(errorResponse("SESSION_NOT_FOUND"), 404);

            if (session.status === "COMPLETED")
                return c.json(errorResponse("ALREADY_VOTED"), 409);

            if (session.status === "EXPIRED" || session.status === "ABANDONED" || session.expiresAt <= now) {
                // lazily persist, guarded so a just-completed session is never overwritten
                await prisma.votingSession.updateMany({
                    where: { id: session.id, status: { in: [...LIVE] }, expiresAt: { lte: now } },
                    data: { status: "EXPIRED" },
                });
                return c.json(errorResponse("SESSION_EXPIRED"), 409);
            }

            if (session.status === "PENDING")
                return c.json(errorResponse("FACE_NOT_VERIFIED"), 409);

            let expiresAt: Date;
            if (session.status === "FACE_VERIFIED") {
                expiresAt = new Date(Math.min(now.getTime() + TOKEN_TTL_MS, election.endsAt.getTime()));

                const cas = await prisma.votingSession.updateMany({
                    where: {
                        id: session.id, voterId, electionId,
                        status: "FACE_VERIFIED", expiresAt: { gt: now },
                    },
                    data: { status: "TOKEN_ISSUED", expiresAt },   // session expiry now equals token expiry
                });

                if (cas.count !== 1) {
                    // lost a race (double-click, second tab): fall back to the winner's state
                    const fresh = await prisma.votingSession.findUnique({ where: { id: session.id } });
                    if (!fresh || fresh.status !== "TOKEN_ISSUED" || fresh.expiresAt <= new Date())
                        return c.json(errorResponse("INVALID_SESSION_STATE"), 409);
                    expiresAt = fresh.expiresAt;
                }
            } else {
                // TOKEN_ISSUED: idempotent re-issue, same expiry, never extended
                expiresAt = session.expiresAt;
            }

            const token = signToken(electionId, expiresAt);

            c.header("Cache-Control", "no-store");
            return c.json(successResponse({ status: "TOKEN_ISSUED", token, expiresAt }));
        } catch (e) {
            console.error("authorization failed", e);   // no token, no body
            return c.json(errorResponse("INTERNAL_ERROR"), 500);
        }
    })
    .delete("/:electionId/voting-session", async (c) => {
        try {
            const auth = await getSession();

            if (!auth.isLoggedIn || !auth.sid) return c.json(errorResponse("UNAUTHENTICATED"), 401);


            const { electionId } = c.req.param()

            const account = await prisma.account.findUnique({
                where: { id: auth.id },
                select: { voterId: true },
            });
            if (!account) return c.json(errorResponse("UNAUTHENTICATED"), 401);
            const { voterId } = account;


            const voter = await prisma.electionParticipation.findFirst({
                where: {
                    voterId: account.voterId
                }
            })

            if (!voter) {
                return c.json(errorResponse("NOT_ELIGIBLE"), 403)
            }

            const { count } = await prisma.votingSession.deleteMany({
                where: {
                    voterId: voter.voterId,
                    electionId
                }
            })

            if (!count) {
                return c.json(errorResponse("Invalid session state"), 409)
            }
            return c.json(successResponse({ success: true, electionId }));
        } catch (e) {
            console.log(e)
            return c.json(errorResponse("Something went wrong. Try again"), 500)
        }
    })
    .post("/:electionId/join", async (c) => {
        try {
            const auth = await getSession();

            if (!auth.isLoggedIn || !auth.sid) return c.json(errorResponse("UNAUTHENTICATED"), 401);


            const { electionId } = c.req.param()

            const account = await prisma.account.findUnique({ where: { id: auth.id } });

            if (!account) {
                return c.json(errorResponse("Voter not found"), 404)
            }

            const election = await prisma.election.findUnique({
                where: {
                    id: electionId
                }
            })

            if (!election) {
                return c.json(errorResponse("Election not found"), 404)
            }

            const now = new Date()

            if (!election) {
                return c.json(errorResponse("Election is not active."), 404)
            }

            if (now < election.startsAt) {
                return c.json(errorResponse("Voting not started."), 404)
            }

            if (now > election.endsAt) {
                return c.json(errorResponse("Voting has ended."), 404)
            }

            const voter = await prisma.electionParticipation.findFirst({
                where: {
                    voterId: account.voterId
                }
            })

            if (!voter) {
                return c.json(errorResponse("Not eligble"), 404)
            }

            const expiresAt = new Date(Date.now() + 30 * 60_000)

            const existingVoterSession = await prisma.votingSession.findFirst({
                where: {
                    voterId: voter.voterId,

                }
            })

            // existing token does not exist or expired

            if (!existingVoterSession || existingVoterSession.status == "EXPIRED" || existingVoterSession.status == "ABANDONED") {
                const voterSession = await prisma.votingSession.create({
                    data: {
                        voterId: voter.voterId,
                        electionId: election.id,
                        status: "PENDING",
                        expiresAt,
                        authSessionId: auth.sid
                    }
                })
                return c.json(successResponse({ votersessionId: voterSession.id, status: "PENDING" }));

            }

            // existing token is pending or face verified

            if (existingVoterSession?.status == "PENDING" || existingVoterSession.status == "FACE_VERIFIED") {

                const now = new Date()
                if (existingVoterSession.expiresAt < now) {
                    return c.json(successResponse({ votersessionId: existingVoterSession.id, status: "PENDING" }));

                }
                await prisma.votingSession.update({
                    where: {
                        id: existingVoterSession.id
                    },
                    data: {
                        status: "EXPIRED"
                    }
                })
                const voterSession = await prisma.votingSession.create({
                    data: {
                        voterId: voter.voterId,
                        electionId: election.id,
                        status: "PENDING",
                        expiresAt,
                        authSessionId: auth.sid
                    }
                })
                return c.json(successResponse({ votersessionId: voterSession.id, status: "PENDING" }));
            }

            if (existingVoterSession?.status == "TOKEN_ISSUED") {

                const now = new Date()
                if (existingVoterSession.expiresAt < now) {

                    return c.json(successResponse({ votersessionId: existingVoterSession.id, status: "PENDING" }));

                }

                await prisma.votingSession.update({
                    where: {
                        id: existingVoterSession.id
                    },
                    data: {
                        status: "EXPIRED"
                    }
                })
                const voterSession = await prisma.votingSession.create({
                    data: {
                        voterId: voter.voterId,
                        electionId: election.id,
                        status: "PENDING",
                        expiresAt,
                        authSessionId: auth.sid
                    }
                })
                return c.json(successResponse({ votersessionId: voterSession.id, status: "PENDING" }));
            }

            if (existingVoterSession.status == "COMPLETED") {
                return c.json(successResponse({ votersessionId: "", status: "PENDING" }));
            }

            return c.json(successResponse({ votersessionId: "", status: "PENDING" }));


        } catch (e) {
            console.log(e)
            return c.json(errorResponse("Something went wrong. Try again"), 500)
        }
    })
    .get("/:electionId/candidates/:candidateId", async (c) => {
        try {
            const auth = await getSession();

            if (!auth.isLoggedIn || !auth.sid) return c.json(errorResponse("UNAUTHENTICATED"), 401);

            const { electionId, candidateId } = c.req.param()

            // const account = await prisma.account.findUnique({ where: { voterId: id } });
            const election = await prisma.election.findUnique({
                where: {
                    id: electionId
                }
            })

            const candidate = await prisma.candidate.findUnique({
                where: {
                    id: candidateId
                }

            })

            const contestingPosition = await prisma.electionPosition.findUnique({
                where: {
                    id: candidate?.electionPositionId
                },
                select: {
                    electionId: true,
                    position: {
                        select: {
                            name: true
                        }
                    }
                }
            })
            // check election id 

            const candidateInfo = await prisma.voterRoll.findUnique({
                where: {
                    id: candidate?.voterId
                },
                select: {
                    fullName: true,
                    dateOfBirth: true,
                    imageUrl: true,
                    level: true,
                    department: {
                        select: {
                            name: true
                        }
                    },
                    faculty: {
                        select: {
                            name: true
                        }
                    }
                }
            })

            const data = {
                ...candidateInfo,
                ...candidate,
                position: contestingPosition?.position.name,
            }

            return c.json(successResponse({ data }));
        } catch (e) {
            // Never log the error object: Prisma errors can embed query arguments (selections)
            console.error("ballot failed", e instanceof Error ? e.name : "unknown", (e as any)?.code);
            return c.json(errorResponse("INTERNAL_ERROR"), 500);
        }
    })
    .get("/:electionId/confirmation", async (c) => {
        try {
            const auth = await getSession();

            if (!auth.isLoggedIn || !auth.sid) return c.json(errorResponse("UNAUTHENTICATED"), 401);

            const { electionId } = c.req.param()

            const account = await prisma.account.findUnique({
                where: { id: auth.id },
                select: { voterId: true },
            });
            if (!account) return c.json(errorResponse("UNAUTHENTICATED"), 401);
            const { voterId } = account;

            const election = await prisma.election.findUnique({
                where: {
                    id: electionId
                },
                select: {
                    title: true
                }
            })
            if (!election) return c.json(errorResponse("ELECTION_NOT_FOUND"), 404);

            const participation = await prisma.electionParticipation.findUnique({
                where: { electionId_voterId: { electionId, voterId } },
            });
            if (!participation || !participation.eligible)
                return c.json(errorResponse("NOT_ELIGIBLE"), 403);

            const data = {
                ...election,
                voted: participation.hasVoted
            }

            return c.json(successResponse(data));
        } catch (e) {
            // Never log the error object: Prisma errors can embed query arguments (selections)
            console.error("ballot failed", e instanceof Error ? e.name : "unknown", (e as any)?.code);
            return c.json(errorResponse("INTERNAL_ERROR"), 500);
        }
    })
    .get("/:electionId/results", async (c) => {
        try {
            const auth = await getSession();
            if (!auth.isLoggedIn || !auth.sid) return c.json(errorResponse("UNAUTHENTICATED"), 401);

            const { electionId } = c.req.param();
            if (!z.string().uuid().safeParse(electionId).success)
                return c.json(errorResponse("ELECTION_NOT_FOUND"), 404); // a malformed id would otherwise be a Prisma 500

            const election = await prisma.election.findFirst({
                where: { id: electionId, status: { not: "DRAFT" } },
                select: {
                    id: true,
                    title: true,
                    status: true,
                    resultsPublishAt: true,
                    positions: {
                        orderBy: { position: { name: "asc" } },
                        select: {
                            id: true,
                            position: { select: { name: true } },
                            candidates: {
                                select: { id: true, imageUrl: true, voter: { select: { fullName: true } } }, // Candidate.imageUrl, never the voter's enrolment photo
                            },
                        },
                    },
                },
            });
            if (!election) return c.json(errorResponse("ELECTION_NOT_FOUND"), 404);

            // Results exist only once the election is sealed on-chain AND an officer has set a publish time that has passed.
            const sealed = await prisma.blockchainResult.findUnique({
                where: { electionId },
                select: { resultHash: true, polygonTxHash: true },
            });
            const now = new Date();
            const publishAt = election.resultsPublishAt;

            if (!sealed || !publishAt || publishAt > now) {
                const future = publishAt && publishAt > now ? publishAt.toISOString() : null; // never show a past date
                return c.json({ ...errorResponse("RESULTS_UNAVAILABLE"), details: { publishAt: future } }, 409);
            }

            const [rows, voted, eligible] = await Promise.all([
                prisma.electionTally.findMany({
                    where: { electionId },
                    select: { electionPositionId: true, candidateId: true, votes: true },
                }),
                prisma.electionParticipation.count({ where: { electionId, hasVoted: true } }),
                prisma.electionParticipation.count({ where: { electionId, eligible: true } }),
            ]);

            // Integrity gate: the stored tally must reproduce the hash that was sealed on-chain.
            if (computeResultHash(electionId, voted, rows) !== sealed.resultHash) {
                console.error("ALERT: tally does not match sealed result hash", electionId);
                return c.json({ ...errorResponse("RESULTS_UNAVAILABLE"), details: { publishAt: null } }, 409);
            }

            const positions = buildResults(election.positions, new Map(rows.map((r) => [r.candidateId, r.votes])));

            c.header("Cache-Control", "private, max-age=60"); // results are immutable once sealed

            return c.json(
                successResponse({
                    election: { id: election.id, title: election.title, status: election.status, resultsPublishAt: election.resultsPublishAt },
                    turnout: { voted, eligible, percent: percentOf(voted, eligible) },
                    positions,
                    verification: { resultHash: sealed.resultHash, txHash: sealed.polygonTxHash },
                }),
            );

        } catch (e) {
            console.error("results failed", e instanceof Error ? e.name : "unknown", (e as any)?.code);
            return c.json(errorResponse("INTERNAL_ERROR"), 500);
        }
    })
    .post("/:electionId/vote", zValidator("json", ballotSchema), async (c) => {
        try {
            const auth = await getSession();
            if (!auth.isLoggedIn || !auth.sid) return c.json(errorResponse("UNAUTHENTICATED"), 401);

            const { electionId } = c.req.param();
            const { ballot, anonymousToken, votingSessionId } = c.req.valid("json");

            // 1. Token: signature, election binding, expiry (no DB needed)
            const tok = verifyToken(anonymousToken);
            if (!tok || tok.e !== electionId) return c.json(errorResponse("TOKEN_INVALID"), 409);
            if (tok.x <= Date.now()) return c.json(errorResponse("SESSION_EXPIRED"), 409);

            // 2. Voter comes from the login, never from the request
            const account = await prisma.account.findUnique({ where: { id: auth.id }, select: { voterId: true } });
            if (!account) return c.json(errorResponse("UNAUTHENTICATED"), 401);
            const { voterId } = account;

            // 3. Election open
            const election = await prisma.election.findUnique({
                where: { id: electionId }, select: { status: true, startsAt: true, endsAt: true },
            });
            if (!election) return c.json(errorResponse("ELECTION_NOT_FOUND"), 404);
            const now = new Date();
            if (election.status !== "ACTIVE" || now < election.startsAt || now >= election.endsAt)
                return c.json(errorResponse("ELECTION_NOT_OPEN"), 409);

            // 4. Session: ownership, election and login binding are all part of the lookup
            const session = await prisma.votingSession.findFirst({
                where: { id: votingSessionId, electionId, voterId, authSessionId: auth.sid },
            });
            if (!session) return c.json(errorResponse("SESSION_NOT_FOUND"), 404);
            if (session.status === "COMPLETED") return c.json(errorResponse("ALREADY_VOTED"), 409);
            if (session.status === "EXPIRED" || session.status === "ABANDONED" || session.expiresAt <= now)
                return c.json(errorResponse("SESSION_EXPIRED"), 409);
            if (session.status !== "TOKEN_ISSUED") return c.json(errorResponse("INVALID_SESSION_STATE"), 409);

            // 5. Ballot content: one pick per position, and every candidate belongs to that position in THIS election
            const positions = await prisma.electionPosition.findMany({
                where: { electionId, candidates: { some: {} } },   // positions nobody is running for can't be voted on
                select: { id: true },
            });
            const required = new Set(positions.map(p => p.id));
            const submitted = new Set(ballot.map(v => v.positionId));

            if (
                submitted.size !== ballot.length ||                    // no duplicate positions
                submitted.size !== required.size ||                    // none missing, none extra
                ![...required].every(id => submitted.has(id))
            ) return c.json(errorResponse("INVALID_BALLOT"), 400);

            const found = await prisma.candidate.findMany({
                where: { id: { in: ballot.map(v => v.candidateId) }, electionPosition: { electionId } },
                select: { id: true, electionPositionId: true },
            });
            const positionOf = new Map(found.map(x => [x.id, x.electionPositionId]));
            if (!ballot.every(v => positionOf.get(v.candidateId) === v.positionId))
                return c.json(errorResponse("INVALID_BALLOT"), 400);

            // 6. Transaction A: voter-linked writes plus a SEALED pending ballot. No Ballot or Vote rows, no timestamps.
            const jtiHash = crypto.createHash("sha256").update(tok.j).digest("hex");
            const sealed = seal(process.env.BALLOT_SEAL_PUBLIC_KEY!, ballot);
            try {
                await prisma.$transaction(async (tx) => {
                    const t = new Date();

                    const s = await tx.votingSession.updateMany({
                        where: {
                            id: session.id, voterId, electionId, authSessionId: auth.sid,
                            status: "TOKEN_ISSUED", expiresAt: { gt: t },
                        },
                        data: { status: "COMPLETED" },
                    });
                    if (s.count !== 1) throw new TxAbort("INVALID_SESSION_STATE");

                    const p = await tx.electionParticipation.updateMany({
                        where: { electionId, voterId, eligible: true, hasVoted: false },
                        data: { hasVoted: true },
                    });
                    if (p.count !== 1) throw new TxAbort("ALREADY_VOTED");

                    const open = await tx.election.count({
                        where: { id: electionId, status: "ACTIVE", startsAt: { lte: t }, endsAt: { gt: t } },
                    });
                    if (open !== 1) throw new TxAbort("ELECTION_NOT_OPEN");
                    await tx.spentToken.create({ data: { tokenHash: jtiHash, electionId } });
                    await tx.pendingBallot.create({ data: { electionId, sealed } });
                });
            } catch (e: any) {
                if (e instanceof TxAbort) return c.json(errorResponse(e.code), 409);
                if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")
                    return c.json(errorResponse("TOKEN_ALREADY_USED"), 409);
                throw e;
            }

            c.header("Cache-Control", "no-store");
            return c.json(successResponse({ voted: true }));

        } catch (e) {
            // Never log the error object: Prisma errors can embed query arguments (selections)
            console.error("ballot failed", e instanceof Error ? e.name : "unknown", (e as any)?.code);
            return c.json(errorResponse("INTERNAL_ERROR"), 500);
        }
    })




export default app;


class TxAbort extends Error { constructor(public code: string) { super(code); } }

