import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { errorResponse, successResponse } from "@/lib/api-response";
import {
    listElectionsQuerySchema,
    electionIdParamSchema,
    createElectionSchema,
    updateElectionSchema,
    addElectionPositionSchema,
    electionPositionParamSchema,
    addCandidateSchema,
    candidateParamSchema,
    departmentsSchema,
    listCandidatesQuerySchema,
    addManyCandidateSchema,
} from "../schema";
import { NotificationType, ScopeType } from "@/generated/enums";
import { d } from "@/lib/helpers";

const elections = new Hono()


    .get("/positions", async (c) => {
        try {
            await getSession();

            const positions = await prisma.position.findMany();

            return c.json(successResponse(positions));
        } catch {
            return c.json(errorResponse("Something went wrong. Try again"), 500);
        }
    })
    .get("/academic-sessions", async (c) => {
        try {
            await getSession();

            const academicSessions = await prisma.academicSession.findMany({
                orderBy: {
                    startDate: "asc"
                }
            });

            return c.json(successResponse(academicSessions));
        } catch {
            return c.json(errorResponse("Something went wrong. Try again"), 500);
        }
    })
    .get("/faculty", async (c) => {
        try {
            await getSession();

            const faculty = await prisma.faculty.findMany();

            return c.json(successResponse(faculty));
        } catch {
            return c.json(errorResponse("Something went wrong. Try again"), 500);
        }
    })

    .get("/departments",
        zValidator("query", departmentsSchema),
        async (c) => {
            try {
                await getSession();
                const { facultyId } = c.req.valid("query");

                const where: any = {};

                if (facultyId) where.facultyId = facultyId;

                const department = await prisma.department.findMany({
                    where
                });

                return c.json(successResponse(department));
            } catch {
                return c.json(errorResponse("Something went wrong. Try again"), 500);
            }
        })
    .get("/eligbible-voters",
        zValidator("query", listCandidatesQuerySchema),
        async (c) => {
            try {
                await getSession();
                const { facultyId, electionId, search, limit, page, departmentId, level } = c.req.valid("query");

                const where: any = {
                    electionId,
                    eligible: true, // "eligible voters" — exclude participants marked ineligible
                };

                const voterWhere: any = {};
                if (facultyId) voterWhere.facultyId = facultyId;
                if (departmentId) voterWhere.departmentId = departmentId;
                if (level) voterWhere.level = Number(level);
                if (search) voterWhere.fullName = { contains: search, mode: "insensitive" };
                if (Object.keys(voterWhere).length) where.voter = voterWhere;


                const [eligbleVoters_, total] = await Promise.all([

                    await prisma.electionParticipation.findMany({
                        where,
                        skip: (page - 1) * limit,
                        take: limit,
                        orderBy: { createdAt: "desc" },
                        select: {
                            id: true,
                            eligible: true,
                            voter: {
                                select: {
                                    id: true,
                                    fullName: true,
                                    departmentId: true,
                                    facultyId: true,
                                    idNumber: true,
                                    imageUrl: true,
                                    email: true,
                                    level: true
                                }
                            }
                        }
                    }),
                    prisma.electionParticipation.count({ where }),
                ]);

                return c.json(successResponse({ eligbleVoters: eligbleVoters_, total, page, limit }));
            } catch (e) {
                console.log(e)
                return c.json(errorResponse("Something went wrong. Try again"), 500);
            }
        })

    // ---------------------------------------------------------------------------
    // 1. GET /elections/stats
    // ---------------------------------------------------------------------------
    .get("/elections/stats", async (c) => {
        try {
            await getSession();

            const [total, active, completed, upcoming] = await Promise.all([
                prisma.election.count(),
                prisma.election.count({ where: { status: { in: ["ACTIVE"] } } }),
                prisma.election.count({ where: { status: "COMPLETED" } }),
                prisma.election.count({
                    where: { status: "SCHEDULED", startsAt: { gt: new Date() } },
                }),
            ]);
            return c.json(successResponse({ total, active, completed, upcoming }));
        } catch (e) {
            console.log(e)
            return c.json(errorResponse("Something went wrong. Try again"), 500);
        }
    })

    // ---------------------------------------------------------------------------
    // 2. GET /elections
    // ---------------------------------------------------------------------------

    .get(
        "/elections",
        zValidator("query", listElectionsQuerySchema),
        async (c) => {
            try {
                await getSession();
                const { search, status, scope, datePreset, dateTo, dateFrom, page, limit } =
                    c.req.valid("query");

                const where: any = {};

                if (search) {
                    where.OR = [
                        { title: { contains: search, mode: "insensitive" } },
                        { description: { contains: search, mode: "insensitive" } },
                        { code: { contains: search, mode: "insensitive" } },
                    ];
                }

                if (status) where.status = status;

                if (scope) {
                    where.scopes = {
                        some: {
                            ...(scope ? { type: scope } : {}),
                        },
                    };
                }
                let presetFrom: Date | undefined;
                let presetTo: Date | undefined;
                if (datePreset) {
                    const now = new Date();
                    const startOfDay = (d: Date) =>
                        new Date(d.getFullYear(), d.getMonth(), d.getDate());
                    const endOfDay = (d: Date) =>
                        new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

                    switch (datePreset) {
                        case "TODAY":
                            presetFrom = startOfDay(now);
                            presetTo = endOfDay(now);
                            break;
                        case "THIS_WEEK": {
                            const day = now.getDay(); // 0 = Sunday
                            const start = new Date(now);
                            start.setDate(now.getDate() - day);
                            const end = new Date(start);
                            end.setDate(start.getDate() + 6);
                            presetFrom = startOfDay(start);
                            presetTo = endOfDay(end);
                            break;
                        }
                        case "THIS_MONTH":
                            presetFrom = new Date(now.getFullYear(), now.getMonth(), 1);
                            presetTo = endOfDay(
                                new Date(now.getFullYear(), now.getMonth() + 1, 0)
                            );
                            break;
                        case "UPCOMING":
                            presetFrom = now;
                            break;
                        case "PAST":
                            presetTo = now;
                            break;
                    }
                }

                const effectiveFrom = dateFrom ?? presetFrom;
                const effectiveTo = dateTo ?? presetTo;

                // elections whose window overlaps [effectiveFrom, effectiveTo]
                if (effectiveFrom) where.endsAt = { gte: effectiveFrom };
                if (effectiveTo) where.startsAt = { lte: effectiveTo };



                const [elections_, total] = await Promise.all([
                    prisma.election.findMany({
                        where,
                        skip: (page - 1) * limit,
                        take: limit,
                        orderBy: { createdAt: "desc" },
                        include: { scopes: true, academicSession: true },
                    }),
                    prisma.election.count({ where }),
                ]);

                const electionIds = elections_.map((e) => e.id);
                const [eligibleGroups, votesGroups, positionGroups] = electionIds.length
                    ? await Promise.all([
                        prisma.electionParticipation.groupBy({
                            by: ["electionId"],
                            where: { electionId: { in: electionIds }, eligible: true },
                            _count: { _all: true },
                        }),
                        prisma.ballot.groupBy({
                            by: ["electionId"],
                            where: { electionId: { in: electionIds } },
                            _count: { _all: true },
                        }),
                        prisma.electionPosition.groupBy({
                            by: ["electionId"],
                            where: { electionId: { in: electionIds } },
                            _count: { _all: true },
                        }),
                    ])
                    : [[], []];

                const eligibleById = new Map(
                    eligibleGroups.map((g) => [g.electionId, g._count._all])
                );
                const votesById = new Map(
                    votesGroups.map((g) => [g.electionId, g._count._all])
                );
                const positionsByIds = new Map(
                    positionGroups?.map((g) => [g.electionId, g._count._all])
                )

                const withTurnout = elections_.map((election) => {
                    const eligibleVoters = eligibleById.get(election.id) ?? 0;
                    const votesCast = votesById.get(election.id) ?? 0;
                    const positionCount = positionsByIds.get(election.id) ?? 0;
                    const turnoutPercent =
                        eligibleVoters > 0
                            ? Number(((votesCast / eligibleVoters) * 100).toFixed(2))
                            : 0;
                    return { ...election, eligibleVoters, votesCast, turnoutPercent, positionCount };
                });

                return c.json(
                    successResponse({ elections: withTurnout, total, page, limit })
                );
            } catch (e) {
                console.log(e)
                return c.json(errorResponse("Something went wrong. Try again"), 500);
            }
        }
    )

    // ---------------------------------------------------------------------------
    // 3. GET /elections/:id
    // ---------------------------------------------------------------------------
    .get(
        "/elections/:electionId",
        zValidator("param", electionIdParamSchema),
        async (c) => {
            try {
                await getSession();
                const { electionId } = c.req.valid("param");

                const election = await prisma.election.findUnique({
                    where: { id: electionId },
                    include: {
                        academicSession: true,
                        scopes: true,
                    },
                });

                if (!election) {
                    return c.json(errorResponse("Election not found"), 404);
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
                        },
                        candidates: {
                            select: {
                                id: true,
                                voter: {
                                    select: {
                                        fullName: true,
                                        imageUrl: true,
                                        id: true
                                    }
                                }
                            }
                        }
                    }
                })

                const [eligibleVoterCount, auditLog, votesCast] = await Promise.all([
                    prisma.electionParticipation.count({
                        where: {
                            electionId,
                            eligible: true
                        }
                    }),
                    prisma.auditLog.findMany({
                        where: {
                            resource: election.id
                        },
                        // select: {
                        //     action: true,
                        //     id: true,
                        //     createdAt: true,
                        //     resource: true,
                        //     admin: {
                        //         select: {
                        //             email: true
                        //         }
                        //     }
                        // }
                    }),
                    prisma.ballot.count({ where: { electionId } }),
                ]);

                const turnoutPercent =
                    eligibleVoterCount > 0
                        ? Number(((votesCast / eligibleVoterCount) * 100).toFixed(2))
                        : 0;

                const data = {
                    election,
                    positions,
                    eligibleVoterCount,
                    turnoutPercent,
                    votesCast,
                    auditLog
                }

                return c.json(successResponse(data));
            } catch (e) {
                return c.json(errorResponse("Something went wrong. Try again"), 500);
            }
        }
    )

    // ---------------------------------------------------------------------------
    // 4. POST /elections  (create)
    // ---------------------------------------------------------------------------
    .post(
        "/elections",
        zValidator("json", createElectionSchema),
        async (c) => {
            try {
                const session = await getSession();
                const { election, scope, positions, candidates, saveAsDraft } =
                    c.req.valid("json");
                const startDate = new Date(`${election.schedule.startDate}T${election.schedule.startTime}`);
                const endDate = new Date(`${election.schedule.endDate}T${election.schedule.endTime}`)
                if (endDate < startDate) {
                    return c.json(errorResponse("End date must be higger than start date"), 400)
                }

                const code = `ELC-${new Date(startDate).getFullYear()}-${String("1").padStart(3, "0")}`;


                let eligibleVoterIds: { id: string; }[] = [];

                const created = await prisma.$transaction(async (tx) => {
                    // d. create the election itself first, so positions can reference it
                    const newElection = await tx.election.create({
                        data: {
                            title: election.title,
                            code,
                            description: election.description,
                            coverImage: election.coverImage,
                            academicSessionId: election.academicSessionId,
                            startsAt: startDate,
                            endsAt: endDate,
                            status: saveAsDraft ? "DRAFT" : "SCHEDULED",
                            scopes: {
                                create: {
                                    type: scope.type,
                                    value: scope.value
                                    // data: scope.map((s) => ({ type: s.type, value: s.value })),
                                },
                            },
                        },
                    });

                    // a. resolve/create global Position rows, then create ElectionPosition
                    const refToElectionPositionId = new Map<string, string>();

                    for (const p of positions) {
                        if (p.id) {
                            const electionPosition = await tx.electionPosition.create({
                                data: { electionId: newElection.id, positionId: p.id },
                            });
                        }

                    }

                    // c. create candidates, assigned to their resolved electionPositionId

                    if (scope.type === ScopeType.UNIVERSITY) {
                        eligibleVoterIds = await tx.voterRoll.findMany({
                            select: {
                                id: true
                            }
                        });
                    } else if (scope.type === ScopeType.DEPARTMENT) {
                        // scope.value is department name
                        const dept = await tx.department.findFirst({ where: { name: scope.value } })
                        if (dept) {
                            eligibleVoterIds = await tx.voterRoll.findMany({
                                where: {
                                    departmentId: dept.id
                                },
                                select: {
                                    id: true
                                }
                            });
                        }
                    } else if (scope.type === ScopeType.FACULTY) {
                        const facul = await tx.faculty.findFirst({ where: { name: scope.value } })
                        if (facul) {
                            eligibleVoterIds = await tx.voterRoll.findMany({
                                where: {
                                    departmentId: facul.id
                                },
                                select: {
                                    id: true
                                }
                            });
                        }
                    }

                    if (eligibleVoterIds.length > 0) {
                        const data = eligibleVoterIds.map((v) => ({ voterId: v.id, electionId: newElection.id, eligible: true }))
                        await tx.electionParticipation.createMany({
                            data
                        })
                    }
                    // d. create candidates, assigned to their resolved electionPositionId
                    // if (candidates.length) {
                    //     await tx.candidate.createMany({
                    //         data: candidates.map((cand) => ({
                    //             electionPositionId: refToElectionPositionId.get(
                    //                 cand.positionRef
                    //             )!,
                    //             voterId: cand.voterId,
                    //             manifesto: cand.manifesto,
                    //             campaignSlogan: cand.campaignSlogan,
                    //             imageUrl: cand.imageUrl,
                    //             cvUrl: cand.cvUrl,
                    //             socialLinks: cand.socialLinks,
                    //             isIndependent: cand.isIndependent,
                    //             partyAffiliation: cand.partyAffiliation,
                    //         })),
                    //     });
                    // }

                    // f. audit log
                    // await tx.auditLog.create({
                    //     data: {
                    //         adminId: session.adminId,
                    //         action: "ELECTION_CREATED",
                    //         resource: newElection.id,
                    //     },
                    // });

                    return tx.election.findUniqueOrThrow({
                        where: { id: newElection.id }
                    });
                });

                return c.json(successResponse(created), 201);
            } catch (err: any) {
                // unique constraint violations (e.g. duplicate electionId+positionId,
                // or electionPositionId+voterId) surface here
                if (err?.code === "P2002") {
                    return c.json(
                        errorResponse("Duplicate position or candidate in payload"),
                        409
                    );
                }
                return c.json(errorResponse("Something went wrong. Try again"), 500);
            }
        }
    )

    // ---------------------------------------------------------------------------
    // 5. PATCH /elections/:id (update)
    // ---------------------------------------------------------------------------
    .patch(
        "/elections/:id",
        zValidator("param", electionIdParamSchema),
        zValidator("json", updateElectionSchema),
        async (c) => {
            try {
                const session = await getSession();
                const { electionId: id } = c.req.valid("param");
                const { scope, ...rest } = c.req.valid("json");

                const existing = await prisma.election.findUnique({ where: { id } });
                if (!existing) return c.json(errorResponse("Election not found"), 404);

                const updated = await prisma.$transaction(async (tx) => {
                    const election = await tx.election.update({
                        where: { id },
                        data: rest,
                    });

                    if (scope) {
                        await tx.electionScope.deleteMany({ where: { electionId: id } });
                        // await tx.electionScope.createMany({
                        //     data: scope.map((s) => ({
                        //         electionId: id,
                        //         type: s.type,
                        //         value: s.value,
                        //     })),
                        // });
                    }

                    // await tx.auditLog.create({
                    //     data: {
                    //         adminId: session.adminId,
                    //         action: "ELECTION_UPDATED",
                    //         resource: id,
                    //     },
                    // });

                    return tx.election.findUniqueOrThrow({
                        where: { id },
                        include: { scopes: true },
                    });
                });

                return c.json(successResponse(updated));
            } catch {
                return c.json(errorResponse("Something went wrong. Try again"), 500);
            }
        }
    )

    // ---------------------------------------------------------------------------
    // 6. POST /elections/:id/cancel
    // ---------------------------------------------------------------------------
    .post(
        "/elections/:elctionId/cancel",
        zValidator("param", electionIdParamSchema),
        async (c) => {
            try {
                const session = await getSession();
                const { electionId: id } = c.req.valid("param");

                const existing = await prisma.election.findUnique({ where: { id } });
                if (!existing) return c.json(errorResponse("Election not found"), 404);

                if (["COMPLETED", "ARCHIVED", "CANCELLED"].includes(existing.status)) {
                    return c.json(
                        errorResponse(`Cannot cancel an election that is ${existing.status}`),
                        400
                    );
                }

                const [election] = await prisma.$transaction([
                    prisma.election.update({ where: { id }, data: { status: "CANCELLED" } }),
                    // prisma.auditLog.create({
                    //     data: {
                    //         adminId: session.adminId,
                    //         action: "ELECTION_CANCELLED",
                    //         resource: id,
                    //     },
                    // }),
                ]);

                return c.json(successResponse(election));
            } catch {
                return c.json(errorResponse("Something went wrong. Try again"), 500);
            }
        }
    )

    // ---------------------------------------------------------------------------
    // 7. POST /elections/:id/archive
    // ---------------------------------------------------------------------------
    .post(
        "/elections/:elctionId/archive",
        zValidator("param", electionIdParamSchema),
        async (c) => {
            try {
                const session = await getSession();
                const { electionId: id } = c.req.valid("param");

                const existing = await prisma.election.findUnique({ where: { id } });
                if (!existing) return c.json(errorResponse("Election not found"), 404);

                if (!["COMPLETED", "CANCELLED", "CLOSED"].includes(existing.status)) {
                    return c.json(
                        errorResponse(
                            "Only completed, closed or cancelled elections can be archived"
                        ),
                        400
                    );
                }

                const [election] = await prisma.$transaction([
                    prisma.election.update({ where: { id }, data: { status: "ARCHIVED" } }),
                    // prisma.auditLog.create({
                    //     data: {
                    //         adminId: session.adminId,
                    //         action: "ELECTION_ARCHIVED",
                    //         resource: id,
                    //     },
                    // }),
                ]);

                return c.json(successResponse(election));
            } catch {
                return c.json(errorResponse("Something went wrong. Try again"), 500);
            }
        }
    )

    // ---------------------------------------------------------------------------
    // 8. DELETE /elections/:id
    // ---------------------------------------------------------------------------
    .delete(
        "/elections/:electionId",
        zValidator("param", electionIdParamSchema),
        async (c) => {
            try {
                const session = await getSession();
                const { electionId: id } = c.req.valid("param");

                const existing = await prisma.election.findUnique({ where: { id } });
                if (!existing) return c.json(errorResponse("Election not found"), 404);

                // Only drafts are hard-deletable; anything published has real
                // downstream data (ballots, votes, participations) and should be
                // archived instead.
                if (existing.status !== "DRAFT") {
                    return c.json(
                        errorResponse("Only draft elections can be deleted. Archive it instead."),
                        400
                    );
                }

                await prisma.$transaction(async (tx) => {
                    const electionPositions = await tx.electionPosition.findMany({
                        where: { electionId: id },
                        select: { id: true },
                    });
                    const positionIds = electionPositions.map((p) => p.id);

                    if (positionIds.length) {
                        await tx.candidate.deleteMany({
                            where: { electionPositionId: { in: positionIds } },
                        });
                        await tx.electionPosition.deleteMany({
                            where: { id: { in: positionIds } },
                        });
                    }

                    await tx.electionScope.deleteMany({ where: { electionId: id } });
                    await tx.election.delete({ where: { id } });

                    // await tx.auditLog.create({
                    //     data: {
                    //         adminId: session.adminId,
                    //         action: "ELECTION_DELETED",
                    //         resource: id,
                    //     },
                    // });
                });

                return c.json(successResponse({ id }));
            } catch {
                return c.json(errorResponse("Something went wrong. Try again"), 500);
            }
        }
    )

    // ---------------------------------------------------------------------------
    // 9. POST /elections/:id/positions (add position)
    // ---------------------------------------------------------------------------
    .post(
        "/elections/:electionId/positions",
        zValidator("param", electionIdParamSchema),
        zValidator("json", addElectionPositionSchema),
        async (c) => {
            try {
                const session = await getSession();
                const { electionId } = c.req.valid("param");
                const { positionId } = c.req.valid("json");

                const election = await prisma.election.findUnique({ where: { id: electionId } });
                if (!election) return c.json(errorResponse("Election not found"), 404);

                const position = await prisma.position.findUnique({
                    where: { id: positionId },
                });
                if (!position) return c.json(errorResponse("Position not found"), 404);

                const [electionPosition] = await prisma.$transaction([
                    prisma.electionPosition.create({
                        data: { electionId, positionId },
                        include: { position: true },
                    }),
                    // prisma.auditLog.create({
                    //     data: {
                    //         adminId: session.adminId,
                    //         action: "ELECTION_POSITION_ADDED",
                    //         resource: id,
                    //     },
                    // }),
                ]);

                return c.json(successResponse({ id: electionId }), 201);
            } catch (err: any) {
                if (err?.code === "P2002") {
                    return c.json(
                        errorResponse("This position is already part of the election"),
                        409
                    );
                }
                return c.json(errorResponse("Something went wrong. Try again"), 500);
            }
        }
    )


    .get("/positions/:electionId", async (c) => {
        try {
            await getSession();

            const { electionId } = c.req.param();

            const positions = await prisma.electionPosition.findMany({
                where: {
                    electionId
                },
                include: {
                    position: true,
                },

            });

            return c.json(successResponse(positions));
        } catch {
            return c.json(errorResponse("Something went wrong. Try again"), 500);
        }
    })

    // ---------------------------------------------------------------------------
    // 10. DELETE /elections/:id/positions/:electionPositionId (remove position)
    // ---------------------------------------------------------------------------
    .delete(
        "/elections/:electionId/positions/:electionPositionId",
        zValidator("param", electionPositionParamSchema),
        async (c) => {
            try {
                const session = await getSession();
                const { electionId, electionPositionId } = c.req.valid("param");

                const electionPosition = await prisma.electionPosition.findFirst({
                    where: { id: electionPositionId, electionId },
                });
                if (!electionPosition) {
                    return c.json(errorResponse("Election position not found"), 404);
                }

                await prisma.$transaction(async (tx) => {
                    // removes positions and candidates that belong to the position
                    await tx.candidate.deleteMany({
                        where: { electionPositionId },
                    });
                    await tx.electionPosition.delete({ where: { id: electionPositionId } });

                    // await tx.auditLog.create({
                    //     data: {
                    //         adminId: session.adminId,
                    //         action: "ELECTION_POSITION_REMOVED",
                    //         resource: id,
                    //     },
                    // });
                });

                return c.json(successResponse({ id: electionId }));
            } catch {
                return c.json(errorResponse("Something went wrong. Try again"), 500);
            }
        }
    )

    // ---------------------------------------------------------------------------
    // 11. POST /elections/:id/positions/:electionPositionId/candidates
    // ---------------------------------------------------------------------------
    .post(
        "/elections/:electionId/positions/:electionPositionId/candidate",
        zValidator("param", electionPositionParamSchema),
        zValidator("json", addCandidateSchema),
        async (c) => {
            try {
                const session = await getSession();
                const { electionId: id, electionPositionId } = c.req.valid("param");
                const input = c.req.valid("json");

                const electionPosition = await prisma.electionPosition.findFirst({
                    where: { id: electionPositionId, electionId: id },
                });
                if (!electionPosition) {
                    return c.json(errorResponse("Election position not found"), 404);
                }

                // Rule: a voter cannot contest more than one position in this election
                const alreadyContesting = await prisma.candidate.findFirst({
                    where: {
                        voterId: input.voterId,
                        electionPosition: { electionId: id },
                    },
                });
                if (alreadyContesting) {
                    return c.json(
                        errorResponse(
                            "This voter is already contesting a position in this election"
                        ),
                        409
                    );
                }

                const [candidate] = await prisma.$transaction([
                    prisma.candidate.create({
                        data: { electionPositionId, ...input },
                    }),
                    // prisma.auditLog.create({
                    //     data: {
                    //         adminId: session.adminId,
                    //         action: "CANDIDATE_ADDED",
                    //         resource: id,
                    //     },
                    // }),
                ]);

                return c.json(successResponse(candidate), 201);
            } catch (err: any) {
                if (err?.code === "P2002") {
                    return c.json(
                        errorResponse("This voter is already a candidate for this position"),
                        409
                    );
                }
                return c.json(errorResponse("Something went wrong. Try again"), 500);
            }
        }
    )
    .post(
        "/elections/:electionId/positions/:electionPositionId/candidates",
        zValidator("param", electionPositionParamSchema),
        zValidator("json", addManyCandidateSchema),
        async (c) => {
            try {
                const session = await getSession();
                const { electionId, electionPositionId } = c.req.valid("param");
                const { votersId } = c.req.valid("json");

                const electionPosition = await prisma.electionPosition.findFirst({
                    where: { id: electionPositionId, electionId },
                });
                if (!electionPosition) {
                    return c.json(errorResponse("Election position not found"), 404);
                }

                // Rule: a voter cannot contest more than one position in this election
                const alreadyContesting = await prisma.candidate.findMany({
                    where: {
                        voterId: {
                            in: votersId
                        },
                        electionPosition: { electionId },
                    },
                });
                if (alreadyContesting.length > 0) {
                    return c.json(
                        errorResponse(
                            "One or more voters is already contesting a position in this election"
                        ),
                        409
                    );
                }

                const candidatesData = votersId.map((v) => ({ electionPositionId, voterId: v }))
                await prisma.$transaction([
                    prisma.candidate.createMany({
                        data: candidatesData
                    }),
                    // prisma.auditLog.create({
                    //     data: {
                    //         adminId: session.adminId,
                    //         action: "CANDIDATE_ADDED",
                    //         resource: id,
                    //     },
                    // }),
                ]);

                return c.json(successResponse({ electionId, electionPositionId }), 201);
            } catch (err: any) {
                if (err?.code === "P2002") {
                    return c.json(
                        errorResponse("This voter is already a candidate for this position"),
                        409
                    );
                }
                return c.json(errorResponse("Something went wrong. Try again"), 500);
            }
        }
    )
    // ---------------------------------------------------------------------------
    // 12. DELETE /elections/:id/positions/:electionPositionId/candidates/:candidateId
    // ---------------------------------------------------------------------------
    .delete(
        "/elections/:electionId/positions/:electionPositionId/candidates/:candidateId",
        zValidator("param", candidateParamSchema),
        async (c) => {
            try {
                const session = await getSession();
                const { electionId, electionPositionId, candidateId } = c.req.valid("param");

                const candidate = await prisma.candidate.findFirst({
                    where: { id: candidateId, electionPositionId },
                });
                if (!candidate) return c.json(errorResponse("Candidate not found"), 404);

                await prisma.$transaction([
                    prisma.candidate.delete({ where: { id: candidateId } }),
                    // prisma.auditLog.create({
                    //     data: {
                    //         adminId: session.adminId,
                    //         action: "CANDIDATE_REMOVED",
                    //         resource: electionId,
                    //     },
                    // }),
                ]);

                return c.json(successResponse({ electionId }));
            } catch {
                return c.json(errorResponse("Something went wrong. Try again"), 500);
            }
        }
    )


    // ---------------------------------------------------------------------------
    // GET /elections/:id/results
    // Aggregate vote totals per position -> candidate. `Vote` and `Ballot` never
    // store a voterId, so this tally is anonymous by construction — there is no
    // query path from a count back to an individual voter.
    // ---------------------------------------------------------------------------
    .get(
        "/elections/:electionId/results",
        zValidator("param", electionIdParamSchema),
        async (c) => {
            try {
                await getSession();
                const { electionId } = c.req.valid("param");

                const election = await prisma.election.findUnique({
                    where: { id: electionId },
                    select: { id: true, title: true, status: true },
                });
                if (!election) return c.json(errorResponse("Election not found"), 404);

                const electionPositions = await prisma.electionPosition.findMany({
                    where: { electionId },
                    include: {
                        position: { select: { id: true, name: true } },
                        candidates: {
                            select: {
                                id: true,
                                campaignSlogan: true,
                                partyAffiliation: true,
                                isIndependent: true,
                                imageUrl: true,
                                voter: { select: { fullName: true } },
                            },
                        },
                    },
                });

                const electionPositionIds = electionPositions.map((ep) => ep.id);

                // Single grouped query for the whole election — no per-position or
                // per-candidate round trips, and nothing here references a voter.
                const voteCounts = electionPositionIds.length
                    ? await prisma.vote.groupBy({
                        by: ["electionPositionId", "candidateId"],
                        where: { electionPositionId: { in: electionPositionIds } },
                        _count: { _all: true },
                    })
                    : [];

                const countsByPosition = new Map<string, Map<string, number>>();
                for (const row of voteCounts) {
                    if (!countsByPosition.has(row.electionPositionId)) {
                        countsByPosition.set(row.electionPositionId, new Map());
                    }
                    countsByPosition
                        .get(row.electionPositionId)!
                        .set(row.candidateId, row._count._all);
                }

                const results = electionPositions.map((ep) => {
                    const candidateCounts = countsByPosition.get(ep.id) ?? new Map();

                    const candidates = ep.candidates
                        .map((cand) => ({
                            candidateId: cand.id,
                            name: cand.voter.fullName,
                            campaignSlogan: cand.campaignSlogan,
                            partyAffiliation: cand.isIndependent
                                ? "Independent"
                                : cand.partyAffiliation,
                            imageUrl: cand.imageUrl,
                            votes: candidateCounts.get(cand.id) ?? 0,
                        }))
                        .sort((a, b) => b.votes - a.votes);

                    const totalVotes = candidates.reduce((sum, c) => sum + c.votes, 0);

                    return {
                        electionPositionId: ep.id,
                        positionId: ep.position.id,
                        positionName: ep.position.name,
                        totalVotes,
                        candidates: candidates.map((c) => ({
                            ...c,
                            percentage:
                                totalVotes > 0
                                    ? Number(((c.votes / totalVotes) * 100).toFixed(2))
                                    : 0,
                        })),
                    };
                });

                return c.json(
                    successResponse({
                        electionId: election.id,
                        electionTitle: election.title,
                        status: election.status,
                        positions: results,
                    })
                );
            } catch (e) {
                console.log(e);
                return c.json(errorResponse("Something went wrong. Try again"), 500);
            }
        }
    )


export default elections;
