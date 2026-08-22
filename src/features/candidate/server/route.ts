import { Hono } from "hono";
import prisma from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api-response";
import { getSession } from "@/lib/session";
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
            return c.json(successResponse({ voters }));
        } catch (e) {
            console.log(e)
            return c.json(errorResponse("Something went wrong. Try again"), 500)
        }
    })

export default app;
