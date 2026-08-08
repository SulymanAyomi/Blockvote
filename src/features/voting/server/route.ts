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
// import { getSession } from '@/lib/session';

// import { Ratelimit } from '@upstash/ratelimit';
// import { Redis } from '@upstash/redis';



const TOKEN_EXPIRATION_HOURS = 24

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString()
}

// const ratelimit = new Ratelimit({
//   redis: Redis.fromEnv(),
//   limiter: Ratelimit.slidingWindow(5, '15 m'),
// });
const app = new Hono()

// .post("/verify-nin", async (c) => {
//     try {
//         const session = await getSession();
//         const { id } = session;

//         const account = await prisma.account.findUnique({ where: { voterId: id } });
//         if (account?.hasVoted) {
//             return Response.json({ error: 'Already voted' }, { status: 403 });
//         }

//         // Mark voted BEFORE issuing token — closes the double-vote race window
//         await db.account.update({ where: { nin }, data: { hasVoted: true } });

//         // Token carries NO identity — just a random jti, proof of eligibility, short expiry
//         const votingToken = await new SignJWT({})
//             .setProtectedHeader({ alg: 'HS256' })
//             .setJti(crypto.randomUUID())
//             .setExpirationTime('10m')
//             .sign(new TextEncoder().encode(process.env.VOTING_TOKEN_SECRET!));

//         // IMPORTANT: do not log nin + votingToken together anywhere, even transiently
//         return Response.json({ votingToken })
//         return c.json(successResponse({ message: 'OTP sent to registered email', regSessionId: regSession.id }));
//     } catch (e) {
//         console.log(e)
//         return c.json(errorResponse("Something went wrong. Try again"), 500)
//     }
// })
// .post("/verify-face", zValidator("json", faceVerificationSchema), async (c) => {
//     try {
//         const { regSessionId, imageBase64 } = c.req.valid("json")
//         const regSession = await requireStage(regSessionId, { otpVerified: true });
//         const voter = await prisma.faceReference.findFirst({
//             where: {
//                 voterId: regSession.voterId
//             },
//             include: {
//                 faceEmbeddings: true
//             }
//         })

//         // if (!voter || !voter.faceEmbeddings) {
//         //     const body: VerifyApiResponse = {
//         //         status: "no_reference_photo",
//         //         similarity: null,
//         //         message:
//         //             "We couldn't find a reference photo on file for this student ID. This has been flagged for manual review by the election committee.",
//         //     };
//         //     return c.json(successResponse(body), { status: 200 });
//         // }

//         // Strip a data URL prefix if the client sent one (e.g. "data:image/jpeg;base64,...").
//         const rawBase64 = imageBase64.includes(",") ? imageBase64.split(",")[1] : imageBase64;

//         const result = await callPythonVerify({
//             liveImageBase64: rawBase64,
//             voterId: regSession.voterId,
//         });

//         console.log("result: ", result)

//         if (!result.faceDetected) {
//             const body: VerifyApiResponse = {
//                 status: "no_face_detected",
//                 similarity: null,
//                 message: "No face was detected in the captured image. Please try again.",
//             };
//             return c.json(successResponse(body), { status: 200 });
//         }

//         let status: VerifyApiResponse["status"];
//         let sessionStatus: "approved" | "manual_review" | "rejected";

//         if (result.similarity >= THRESHOLDS.approve) {
//             status = "approved";
//             sessionStatus = "approved";
//         } else if (result.similarity >= THRESHOLDS.review) {
//             status = "manual_review";
//             sessionStatus = "manual_review";
//         } else {
//             status = "rejected";
//             sessionStatus = "rejected";
//         }

//         await prisma.registrationSession.update({ where: { id: regSessionId }, data: { faceVerified: true } });

//         const messages: Record<typeof status, string> = {
//             approved: "Identity verified. You may proceed to vote.",
//             manual_review:
//                 "We couldn't confidently confirm your identity automatically. Your submission has been sent to the election committee for manual review.",
//             rejected:
//                 "We couldn't verify your identity from this photo. You can retake the photo or contact the election committee.",
//         };

//         const body: VerifyApiResponse = {
//             status,
//             similarity: result.similarity,
//             message: messages[status],
//         };

//         return c.json(successResponse(body), { status: 200 });

//     } catch (e) {
//         console.error("Face verification service error:", e);
//         // Fail toward manual review rather than silently blocking a voter on an infra hiccup.
//         const body: VerifyApiResponse = {
//             status: "manual_review",
//             similarity: null,
//             message:
//                 "We hit a technical issue while verifying your photo. Your submission has been queued for manual review.",
//         };
//         return c.json(successResponse(body), { status: 200 });
//     }
// })



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