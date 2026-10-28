import { errorResponse, successResponse } from "@/lib/api-response";
import { d } from "@/lib/helpers";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { Hono } from "hono";


const app = new Hono()

    .get("/", async (c) => {
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

            const notifications = [
                {
                    id: "n1",
                    type: "reminder",
                    title: "You have not yet voted in the SUG Election.",
                    body: "Voting closes Friday, September 25 at 5:00 PM.",
                    at: d(2026, 9, 24, 9),
                    read: false,
                },
                {
                    id: "n2",
                    type: "announcement",
                    title: "Voting for SUG Election 2026 is now open.",
                    body: "Open the election page to review candidates and vote.",
                    at: d(2026, 9, 21, 8),
                    read: false,
                },
                {
                    id: "n3",
                    type: "reminder",
                    title: "Voting closes tomorrow at 5:00 PM.",
                    body: "Student Union Government Election 2026.",
                    at: d(2026, 9, 23, 17),
                    read: false,
                },
                {
                    id: "n4",
                    type: "announcement",
                    title: "Faculty of Sciences voting begins September 28.",
                    body: "You are eligible to vote in this election.",
                    at: d(2026, 9, 18, 9),
                    read: true,
                },
                {
                    id: "n5",
                    type: "system",
                    title: "Scheduled maintenance on Sunday, 2:00–3:00 AM.",
                    body: "The portal will be briefly unavailable. Voting is not affected.",
                    at: d(2026, 9, 17, 15),
                    read: true,
                },
                {
                    id: "n6",
                    type: "announcement",
                    title: "Library Advisory Committee results will be published September 30.",
                    body: "You will get a notification when they are available.",
                    at: d(2026, 9, 17, 9),
                    read: true,
                },
            ];

            return c.json(successResponse({ notifications }));
        } catch (e) {
            console.log(e)
            return c.json(errorResponse("Something went wrong. Try again"), 500)
        }
    })
    .get("/announcement", async (c) => {
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



            const announcements = [
                {
                    id: "an1",
                    at: d(2026, 9, 21, 8),
                    title:
                        "Voting for the 2026 Student Union Election is open until Friday, September 25 at 5:00 PM.",
                },
                {
                    id: "an2",
                    at: d(2026, 9, 20, 17),
                    title:
                        "Candidate campaign period ended September 20. Manifestos are on each election page.",
                },
                {
                    id: "an3",
                    at: d(2026, 9, 18, 9),
                    title: "Faculty of Sciences Representative voting begins September 28.",
                },
                {
                    id: "an4",
                    at: d(2026, 9, 17, 9),
                    title:
                        "Library Advisory Committee results will be published September 30 at 9:00 AM.",
                },
                {
                    id: "an5",
                    at: d(2026, 9, 10, 12),
                    title:
                        "Nominations for the Graduate Students Association election are now closed.",
                },
            ];
            return c.json(successResponse({ announcements }));
        } catch (e) {
            console.log(e)
            return c.json(errorResponse("Something went wrong. Try again"), 500)
        }
    })


export default app;
