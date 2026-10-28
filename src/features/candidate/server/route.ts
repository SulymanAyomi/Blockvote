import { Hono } from "hono";
import prisma from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api-response";
import { getSession } from "@/lib/session";
import { VoterRollScalarFieldEnum } from "@/generated/internal/prismaNamespace";
import { ScopeType, VoterRoll } from "@/generated/client";


const TOKEN_EXPIRATION_HOURS = 24

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString()
}


const app = new Hono()

    .get("/:electionId/all", async (c) => {
        try {
            const session = await getSession();
            const { id } = session;

            const { electionId } = c.req.param()

            const account = await prisma.account.findUnique({ where: { id: id } });

            const voter = await prisma.voterRoll.findUnique({
                where: {
                    id: account?.voterId
                }
            })

            if (!voter) {
                return c.json(errorResponse("Voter not found. Try again"), 404)

            }
            const election = await prisma.election.findUnique({
                where: {
                    id: electionId
                },
                select: {
                    id: true,
                    scopes: true
                }
            })
            let scope = election?.scopes[0]!
            let query: Record<string, any> = {}

            if (scope.type === ScopeType.UNIVERSITY) {
            } else if (scope.type === ScopeType.DEPARTMENT) {
                const dept = await prisma.department.findFirst({
                    where: {
                        name: scope.value
                    }
                });
                if (dept) {
                    query.departments = scope.value

                }
            }
            const voters = await prisma.voterRoll.findMany({
                where: query,
                select: {
                    id: true,
                    fullName: true,
                    imageUrl: true,
                    email: true,
                    level: true,
                    phone: true,
                    department: {
                        select: {
                            name: true
                        }
                    },
                    faculty: {
                        select: {
                            name: true
                        }
                    },
                    idNumber: true
                }
            })

            return c.json(successResponse({ voters }));
        } catch (e) {
            console.log(e)
            return c.json(errorResponse("Something went wrong. Try again"), 500)
        }
    })
    .get("/:electionId/positions", async (c) => {
        try {
            const session = await getSession();
            const { id } = session;

            const { electionId } = c.req.param()

            const account = await prisma.account.findUnique({ where: { id } });

            const voter = await prisma.voterRoll.findUnique({
                where: {
                    id: account?.voterId
                }
            })
            console.log("voter: ", voter)
            if (!voter) {
                return c.json(errorResponse("Voter not found. Try again"), 404)

            }
            const positions = await prisma.electionPosition.findMany({
                where: {
                    electionId
                },
                include: {
                    position: {
                        select: {
                            name: true
                        }
                    }
                }
            })
            return c.json(successResponse({ positions }));
        } catch (e) {
            console.log(e)
            return c.json(errorResponse("Something went wrong. Try again"), 500)
        }
    })
    .get("/:electionId/candidates", async (c) => {
        try {
            const session = await getSession();
            const { id } = session;

            const { electionId } = c.req.param()

            const account = await prisma.account.findUnique({ where: { id } });

            const voter = await prisma.voterRoll.findUnique({
                where: {
                    id: account?.voterId
                }
            })
            console.log("voter: ", voter)
            if (!voter) {
                return c.json(errorResponse("Voter not found. Try again"), 404)

            }
            const positions = await prisma.electionPosition.findMany({
                where: {
                    electionId
                },
                select: {
                    id: true,

                }
            })

            const candidates = await prisma.candidate.findMany({
                where: {
                    electionPositionId: {
                        in: positions.map((p) => p.id)
                    }
                },
                // select:{
                //     id:true,
                //     voterId:true,
                //     voter:{
                //         select:{

                //         }
                //     }
                // }

            })
            return c.json(successResponse({ candidates }));
        } catch (e) {
            console.log(e)
            return c.json(errorResponse("Something went wrong. Try again"), 500)
        }
    })
    .get("/:electionId/departments", async (c) => {
        try {
            const session = await getSession();
            const { id } = session;

            const { electionId } = c.req.param()

            const account = await prisma.account.findUnique({ where: { id } });

            const voter = await prisma.voterRoll.findUnique({
                where: {
                    id: account?.voterId
                }
            })
            if (!voter) {
                return c.json(errorResponse("Voter not found. Try again"), 404)

            }
            const departments = await prisma.department.findMany()
            const faculty = await prisma.faculty.findMany()
            return c.json(successResponse({ departments, faculty }));
        } catch (e) {
            console.log(e)
            return c.json(errorResponse("Something went wrong. Try again"), 500)
        }
    })

export default app;
