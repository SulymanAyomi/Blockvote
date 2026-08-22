import argon2 from "argon2"
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator"
import crypto, { randomBytes } from "crypto"
import prisma from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api-response";
import { RegistrationStageError, requireStage } from "@/lib/registration-session";
import { callPythonVerify } from "@/lib/verification/pythonServiceClient";
import { THRESHOLDS, VerifyApiResponse } from "@/lib/verification/types";
import { getSession } from "@/lib/session";
import { ballotSchema, FaceSchema } from "../schema";
import { VoterRollScalarFieldEnum } from "@/generated/internal/prismaNamespace";




const TOKEN_EXPIRATION_HOURS = 24

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString()
}


const app = new Hono()

    .get("/:electionId/all", async (c) => {
        try {
            const session = await getSession();
            const { id } = session;

            console.log("session: ", session)

            const account = await prisma.account.findUnique({ where: { id } });
            console.log("account: ", account)
            const voter = await prisma.voterRoll.findUnique({
                where: {
                    id: account?.voterId
                }
            })
            console.log("voter: ", voter)
            if (!voter) {
                return c.json(errorResponse("Voter not found. Try again"), 404)

            }
            const voters = await prisma.voterRoll.findMany()
            return c.json(successResponse({ VoterRollScalarFieldEnum }));
        } catch (e) {
            console.log(e)
            return c.json(errorResponse("Something went wrong. Try again"), 500)
        }
    })
    .post("/voting-session/face-verify", zValidator("json", FaceSchema), async (c) => {
        try {
            const session = await getSession();
            const { id } = session;

            const { votingSessionId, electionId, imageBase64 } = c.req.valid("json")

            const voterSession = await prisma.votingSession.findUnique({
                where: {
                    id: votingSessionId,
                    electionId
                }
            })

            if (!voterSession) {
                return c.json(errorResponse("Invalid session state"), 409)
            }


            const now = new Date()

            if (voterSession.expiresAt > now) {
                return c.json(errorResponse("Session expired. Start over again."), 409)
            }

            const voter = await prisma.voterRoll.findUnique({
                where: {
                    id: voterSession.voterId
                },

            })


            if (!voter) {
                return c.json(errorResponse("Not eligble"), 404)
            }

            const rawBase64 = imageBase64.includes(",") ? imageBase64.split(",")[1] : imageBase64;

            const result = await callPythonVerify({
                liveImageBase64: rawBase64,
                voterId: voter.id,
            });
            console.log("result ", result)

            if (!result.faceDetected) {
                const body: VerifyApiResponse = {
                    status: "no_face_detected",
                    similarity: null,
                    message: "No face was detected in the captured image. Please try again.",
                };
                return c.json(successResponse(body), { status: 200 });
            }

            let status: VerifyApiResponse["status"];
            let sessionStatus: "approved" | "manual_review" | "rejected";

            if (result.similarity >= THRESHOLDS.approve) {
                status = "approved";
                sessionStatus = "approved";
            } else if (result.similarity >= THRESHOLDS.review) {
                status = "manual_review";
                sessionStatus = "manual_review";
            } else {
                status = "rejected";
                sessionStatus = "rejected";
            }

            const messages: Record<typeof status, string> = {
                approved: "Identity verified. You may proceed to vote.",
                manual_review:
                    "We couldn't confidently confirm your identity automatically. Your submission has been sent to the election committee for manual review.",
                rejected:
                    "We couldn't verify your identity from this photo. You can retake the photo or contact the election committee.",
            };

            if (status !== "approved") {
                const data = {
                    status,
                    similarity: result.similarity,
                    message: messages[status],
                };

                return c.json(successResponse(data));
            }

            const token = crypto.randomBytes(32).toString('base64url')
            const expiresAt = voterSession.expiresAt

            if (voterSession.status == "PENDING") {
                const vt = await prisma.votingSession.update({
                    where: { id: votingSessionId, status: "PENDING" },
                    data: {
                        status: 'FACE_VERIFIED'
                    }
                })

                if (!vt) {
                    return c.json(errorResponse("Another session is opened"), 409)
                }
            }

            const issuedNonce = await prisma.issuedNonce.create({
                data: {
                    token,
                    electionId: voterSession.electionId,
                    expiresAt,
                    used: false
                }
            })

            await prisma.votingSession.update({
                where: {
                    id: votingSessionId
                },
                data: {
                    status: "TOKEN_ISSUED"
                }
            })

            const data: VerifyApiResponse = {
                status,
                similarity: result.similarity,
                message: messages[status],
                token,
                expiresAt,
                electionId
            };

            return c.json(successResponse(data));
        } catch (e) {
            console.log(e)
            return c.json(errorResponse("Something went wrong. Try again"), 500)
        }
    })
    .get("/:electionId", async (c) => {
        try {
            const session = await getSession();
            const { id } = session;

            const { electionId } = c.req.param()


            // const account = await prisma.account.findUnique({ where: { voterId: id } });
            const election = await prisma.election.findUnique({
                where: {
                    id: electionId
                }
            })
            const positions = await prisma.electionPosition.findMany({
                where: {
                    electionId
                },
                include: {
                    candidates: true,
                    position: true,
                }
            })

            const contestingPostion = await prisma.electionPosition.findMany({
                where: {
                    electionId
                },
                select: {
                    id: true,
                    position: {
                        select: {
                            name: true
                        }
                    },
                    candidates: {
                        select: {
                            id: true,
                            voterId: true,
                            voter: {
                                select: {
                                    fullName: true,
                                    level: true,
                                    imageUrl: true
                                }
                            }
                        }
                    }
                }
            })

            const candidates = await prisma.candidate.findMany({
                where: {

                }
            })

            const data = {
                election,
                positions: contestingPostion

            }

            return c.json(successResponse({ data }));
        } catch (e) {
            console.log(e)
            return c.json(errorResponse("Something went wrong. Try again"), 500)
        }
    })
    .post("/:electionId/join", async (c) => {
        try {
            const session = await getSession();
            const { id } = session;

            const { electionId } = c.req.param()


            const account = await prisma.account.findUnique({ where: { id } });

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
                        expiresAt
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
                        expiresAt
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
                        expiresAt
                    }
                })
                return c.json(successResponse({ votersessionId: voterSession.id, status: "PENDING" }));
            }

            if (existingVoterSession.status == "COMPLETED") {
                return c.json(errorResponse("Already voted"), 400);
            }

            return c.json(successResponse({ votersessionId: "", status: "PENDING" }));


        } catch (e) {
            console.log(e)
            return c.json(errorResponse("Something went wrong. Try again"), 500)
        }
    })
    .get("/:electionId/candidates/:candidateId", async (c) => {
        try {
            const session = await getSession();
            const { id } = session;

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
            console.log(e)
            return c.json(errorResponse("Something went wrong. Try again"), 500)
        }
    })
    .post("/:electionId/vote", zValidator("json", ballotSchema), async (c) => {
        try {
            const session = await getSession();
            const { id } = session;

            const { electionId } = c.req.param()
            const { ballot, anonymousToken, votingSessionId } = c.req.valid("json")


            // const account = await prisma.account.findUnique({ where: { voterId: id } });
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

            const votingSession = await prisma.votingSession.findUnique({
                where: {
                    id: votingSessionId
                }
            })

            if (!votingSession) {
                return c.json(errorResponse("Invalid session state"), 409)
            }

            const issueToken = await prisma.issuedNonce.findUnique({
                where: {
                    token: anonymousToken
                }
            })

            if (!issueToken) {
                return c.json(errorResponse("Invalid session state"), 409)
            }

            if (votingSession.expiresAt > now || issueToken.expiresAt > now) {
                return c.json(errorResponse("Session expired. Start over again."), 409)
            }

            if (votingSession.status == "COMPLETED") {
                return c.json(errorResponse("Already voted in the election."), 409)
            }

            if (votingSession.status == "PENDING" || votingSession.status == "FACE_VERIFIED") {
                return c.json(errorResponse("Voter has not completed verification."), 409)
            }

            if (votingSession.status != "TOKEN_ISSUED") {
                return c.json(errorResponse("Invalid session state. Start over again"), 409)
            }

            const voter = await prisma.electionParticipation.findFirst({
                where: {
                    voterId: votingSession?.voterId,
                    electionId,
                    eligible: true
                }
            })

            if (!voter) {
                return c.json(errorResponse("Ineligbile to vote in the election."), 400)
            }

            if (voter.hasVoted) {
                return c.json(errorResponse("Already voted in the election."), 409)
            }

            // validate ballot, postion and candidate. Make sure only one candidate per postion in the ballot

            const postionIds = ballot.map(v => v.positionId)
            const uniquePositionIds = new Set(postionIds)

            if (uniquePositionIds.size !== postionIds.length) {
                return c.json(errorResponse("A position can only be voted for once."), 400)
            }

            const positions = await prisma.electionPosition.findMany({
                where: {
                    electionId
                },
                select: {
                    id: true
                }
            })

            const validPositionIds = new Set(positions.map(p => p.id))

            for (const vote of ballot) {
                if (!validPositionIds.has(vote.positionId)) {
                    return c.json(errorResponse("Invalid postion."), 400)
                }
            }

            // Ensuring candidates belongs to the selected position


            const validPostionsIdArray = positions.map(p => p.id)
            const candidates = await prisma.candidate.findMany({
                where: {
                    electionPositionId: {
                        in: validPostionsIdArray,
                    },
                },
                select: {
                    id: true,
                    electionPositionId: true
                }
            })

            const candidateMap = new Map(candidates.map(c => [c.id, c.electionPositionId]))

            for (const vote of ballot) {
                const candidatePostion = candidateMap.get(vote.candidateId)
                if (!candidatePostion) {
                    return c.json(errorResponse("Candidate not found."), 400)
                }
                if (candidatePostion !== vote.positionId) {
                    return c.json(errorResponse("Candidate does not belong to the selected position."), 400)
                }
            }

            await prisma.$transaction(async (tx) => {
                const now = new Date
                const newBallot = await tx.ballot.create({
                    data: {
                        electionId,
                        castAt: now
                    }
                })

                const electionBallot = ballot.map(v => ({
                    ballotId: newBallot.id,
                    electionPositionId: v.positionId,
                    candidateId: v.candidateId
                }))

                await tx.vote.createMany({
                    data: electionBallot
                })

                await tx.electionParticipation.update({
                    where: {
                        id: voter.id
                    },
                    data: {
                        hasVoted: true,
                        votedAt: now
                    }
                })

                await tx.issuedNonce.update({
                    where: { token: anonymousToken },
                    data: {
                        used: true
                    }
                })

                await tx.votingSession.update({
                    where: { id: votingSessionId },
                    data: { status: "COMPLETED" }
                })
            })

            return c.json(successResponse({}));
        } catch (e) {
            console.log(e)
            return c.json(errorResponse("Something went wrong. Try again"), 500)
        }
    })




export default app;

// Voting service — verifies token, has no idea who the voter is
// import { jwtVerify } from 'jose';

// export async function POST(req: Request) {
//   const { votingToken, candidateId } = await req.json();

//   const { payload } = await jwtVerify(
//     votingToken,
//     new TextEncoder().encode(process.env.VOTING_TOKEN_SECRET!)
//   );

//   const alreadyUsed = await votesDb.usedTokens.findUnique({ where: { jti: payload.jti as string } });
//   if (alreadyUsed) return Response.json({ error: 'Token already used' }, { status: 403 });

//   await votesDb.usedTokens.create({ data: { jti: payload.jti as string } });
//   await votesDb.votes.create({ data: { candidateId, castAt: new Date() } });

//   return Response.json({ message: 'Vote recorded' });
// }