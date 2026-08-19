import argon2 from "argon2"
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator"
import crypto, { randomBytes } from "crypto"
import prisma from "@/lib/prisma";
import { faceVerificationSchema, getInfoConfirmationSchema, informationConfirmationSchema, LoginOtpSchema, LoginSchema, setPasswordSchema, verifyNINSchema, verifyOTPSchema } from "../schema";
import { errorResponse, successResponse } from "@/lib/api-response";
import { RegistrationStageError, requireStage } from "@/lib/registration-session";
import { callPythonVerify } from "@/lib/verification/pythonServiceClient";
import { THRESHOLDS, VerifyApiResponse } from "@/lib/verification/types";
import { getSession } from "@/lib/session";
import { ElectionStatus, ScopeType } from "@/generated/enums";
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

    .post("/verify-nin", zValidator("json", verifyNINSchema), async (c) => {
        try {
            const { idType, idNumber } = c.req.valid("json")

            const voter = await prisma.voterRoll.findFirst({
                where: {
                    idType,
                    idNumber
                }
            });
            if (!voter) return c.json(errorResponse('Id not found on eligible roll'), { status: 404 })

            if (voter.isRegistered) return c.json(errorResponse('Already registered'), { status: 409 });

            const regSession = await prisma.registrationSession.create({
                data: { voterId: voter.id, idVerified: true, expiresAt: new Date(Date.now() + 30 * 60_000) },
            });

            const otp = generateOTP();
            await prisma.otp.create({
                data: { voterId: voter.id, otpHash: await argon2.hash(otp), purpose: 'REGISTER', expiresAt: new Date(Date.now() + 10 * 60_000) },
            });
            // await sendEmail(voter.email, `Your registration code: ${otp}`);
            console.log("otp:", otp)

            return c.json(successResponse({ message: 'OTP sent to registered email', regSessionId: regSession.id, otp }));
        } catch (e) {
            console.log(e)
            return c.json(errorResponse("Something went wrong. Try again"), 500)
        }
    })
    .post("/verify-otp", zValidator("json", verifyOTPSchema), async (c) => {
        try {
            const { regSessionId, otp } = c.req.valid("json")

            const regSession = await requireStage(regSessionId, { idVerified: true });

            const record = await prisma.otp.findFirst({
                where: { voterId: regSession.voterId, purpose: 'REGISTER', used: false, expiresAt: { gt: new Date() } },
                orderBy: { id: 'desc' },
            });

            if (!record || !(await argon2.verify(record.otpHash, otp))) {
                return c.json(errorResponse('Invalid or expired OTP'), { status: 400 });
            }
            await prisma.otp.update({ where: { id: record.id }, data: { used: true } });
            await prisma.registrationSession.update({ where: { id: regSessionId }, data: { otpVerified: true } });

            return c.json(successResponse({ message: 'OTP verified, proceed to face verification' }));

        } catch (e) {
            console.log(e)
            return c.json(errorResponse("Something went wrong. Try again"), 500)
        }
    })
    .post("/verify-face", zValidator("json", faceVerificationSchema), async (c) => {
        try {
            const { regSessionId, imageBase64 } = c.req.valid("json")
            const regSession = await requireStage(regSessionId, { otpVerified: true });
            const voter = await prisma.faceReference.findFirst({
                where: {
                    voterId: regSession.voterId
                },
                include: {
                    faceEmbedding: true
                }
            })

            // if (!voter || !voter.faceEmbeddings) {
            //     const body: VerifyApiResponse = {
            //         status: "no_reference_photo",
            //         similarity: null,
            //         message:
            //             "We couldn't find a reference photo on file for this student ID. This has been flagged for manual review by the election committee.",
            //     };
            //     return c.json(successResponse(body), { status: 200 });
            // }

            // Strip a data URL prefix if the client sent one (e.g. "data:image/jpeg;base64,...").
            const rawBase64 = imageBase64.includes(",") ? imageBase64.split(",")[1] : imageBase64;

            const result = await callPythonVerify({
                liveImageBase64: rawBase64,
                voterId: regSession.voterId,
            });

            console.log("result: ", result)

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

            await prisma.registrationSession.update({ where: { id: regSessionId }, data: { faceVerified: true } });

            const messages: Record<typeof status, string> = {
                approved: "Identity verified. You may proceed to vote.",
                manual_review:
                    "We couldn't confidently confirm your identity automatically. Your submission has been sent to the election committee for manual review.",
                rejected:
                    "We couldn't verify your identity from this photo. You can retake the photo or contact the election committee.",
            };

            const body: VerifyApiResponse = {
                status,
                similarity: result.similarity,
                message: messages[status],
            };

            return c.json(successResponse(body), { status: 200 });

        } catch (e) {
            console.error("Face verification service error:", e);
            // Fail toward manual review rather than silently blocking a voter on an infra hiccup.
            const body: VerifyApiResponse = {
                status: "manual_review",
                similarity: null,
                message:
                    "We hit a technical issue while verifying your photo. Your submission has been queued for manual review.",
            };
            return c.json(successResponse(body), { status: 200 });
        }
    })
    .post("/confirm-info", zValidator("json", informationConfirmationSchema), async (c) => {
        try {
            const { regSessionId, confirmed } = c.req.valid("json")
            const regSession = await requireStage(regSessionId, { faceVerified: true });

            if (!confirmed) {
                return c.json(successResponse({ message: 'Please contact school admin to correct your record' }));
            }
            await prisma.registrationSession.update({ where: { id: regSessionId }, data: { infoConfirmed: true } });

            return c.json(successResponse({ message: 'Confirmed, proceed to set password' }));

        } catch (e) {
            console.log(e)
            return c.json(errorResponse("Something went wrong. Try again"), 500)
        }
    })
    .post("/set-password", zValidator("json", setPasswordSchema), async (c) => {
        try {

            const { regSessionId, password, } = c.req.valid("json")
            const regSession = await requireStage(regSessionId, { infoConfirmed: true });
            const account = await prisma.account.findUnique({
                where: {
                    voterId: regSession.voterId
                }
            })
            console.log("Account:", account)

            if (account) {
                await prisma.account.update({
                    where: {
                        voterId: regSession.voterId
                    },
                    data: { passwordHash: await argon2.hash(password) },
                });
            } else {
                await prisma.account.create({
                    data: { voterId: regSession.voterId, passwordHash: await argon2.hash(password) },
                });
            }

            await prisma.voterRoll.update({ where: { id: regSession.voterId }, data: { isRegistered: true } });

            return c.json(successResponse({ message: 'Registration complete' }), 200);

        } catch (e) {
            console.log(e)
            // if (e instanceof RegistrationStageError) {
            //     return c.json(errorResponse(e.message), e.status)
            // }
            return c.json(errorResponse("Something went wrong. Try again"), 500)
        }
    })
    .get("/confirm-info", zValidator("query", getInfoConfirmationSchema), async (c) => {
        try {

            const { regSessionId } = c.req.valid("query")
            const regSession = await requireStage(regSessionId, { faceVerified: true });
            const voter = await prisma.voterRoll.findFirst({
                where: {
                    id: regSession.voterId
                },
                include: {
                    department: {
                        select: {
                            name: true
                        }
                    }
                }
            })
            const voterInfo = {
                fullName: voter?.fullName as string,
                dateOfBirth: voter?.dateOfBirth as Date,
                email: voter?.email as string,
                phone: voter?.phone,
                studentId: voter?.studentId,
                imageUrl: voter?.imageUrl,
                level: voter?.level,
                department: voter?.department?.name,
            }

            return c.json(successResponse(voterInfo));

        } catch (e) {
            console.log(e)
            return c.json(errorResponse("Something went wrong. Try again"), 500)
        }
    }).post("/login", zValidator("json", LoginSchema), async (c) => {
        try {

            const { id, idNumber, password } = c.req.valid("json")

            // const { success } = await ratelimit.limit(nin);

            // if (!success) return c.json(errorResponse('Too many attempts, try later'), { status: 429 });

            const voter = await prisma.voterRoll.findFirst({
                where: {
                    idNumber,
                    idType: id
                }
            });

            if (!voter) {
                return c.json(errorResponse('Id not found on roster list'), { status: 401 });
            }

            const account = await prisma.account.findFirst({ where: { voterId: voter?.id } });
            if (!account) return c.json(errorResponse('Invalid credentials'), { status: 401 });

            if (account.lockedUntil && account.lockedUntil > new Date()) {
                return c.json(errorResponse('Account temporarily locked'), { status: 423 });
            }
            const valid = await argon2.verify(account.passwordHash, password);
            if (!valid) {
                const attempts = account.failedAttempts + 1;
                await prisma.account.update({
                    where: { voterId: voter?.id },
                    data: {
                        failedAttempts: attempts,
                        lockedUntil: attempts >= 5 ? new Date(Date.now() + 15 * 60_000) : null,
                    },
                });
                return c.json(errorResponse('Invalid credentials'), { status: 401 });
            }
            await prisma.account.update({ where: { voterId: voter?.id }, data: { failedAttempts: 0 } });

            const otp = generateOTP();
            console.log("otp:", otp)
            const vOtp = await prisma.otp.create({
                data: { voterId: voter?.id, otpHash: await argon2.hash(otp), purpose: "LOGIN", expiresAt: new Date(Date.now() + 5 * 60_000) },
            });
            // await sendEmail(voter!.email, `Your login code: ${otp}`);
            const data = {
                vid: vOtp.id,
                email: voter?.email,
                otp
            }
            return c.json(successResponse(data, 'Registration complete'), 200);

        } catch (e) {
            console.log(e)
            return c.json(errorResponse("Something went wrong. Try again"), 500)
        }
    })
    .post("/login/confirm-otp", zValidator("json", LoginOtpSchema), async (c) => {
        try {
            const { vid, otp } = c.req.valid("json")

            const record = await prisma.otp.findFirst({
                where: { id: vid, purpose: 'LOGIN', used: false, expiresAt: { gt: new Date() } },
                orderBy: { id: 'desc' },
            });
            if (!record || !(await argon2.verify(record.otpHash, otp))) {
                return c.json(errorResponse('Invalid or expired OTP'), { status: 400 });
            }
            await prisma.otp.update({ where: { id: record.id }, data: { used: true } });
            const voter = await prisma.voterRoll.findUnique({
                where: {
                    id: record.voterId
                },
                select: {
                    account: {
                        select: {
                            id: true
                        }
                    }
                }
            });
            if (!voter || !voter.account?.id) {
                return c.json(errorResponse('Invalid or expired OTP'), { status: 400 });
            }

            const session = await getSession();
            // set session id to account id
            session.id = voter.account.id;
            session.isLoggedIn = true;
            await session.save();

            return c.json(successResponse({ message: 'Logged in' }));
        } catch (e) {
            console.log(e)
            // if (e instanceof RegistrationStageError) {
            //     return c.json(errorResponse(e.message), e.status)
            // }
            return c.json(errorResponse("Something went wrong. Try again"), 500)
        }
    })
    .get("/main", async (c) => {
        try {
            const campus = await prisma.campus.findFirst()
            const csDept = await prisma.department.findFirst({
                where: {
                    name: "Department of Computer Science"
                }
            })
            const csProgramme = await prisma.programme.findFirst({
                where: {
                    departmentId: csDept?.id
                }
            })

            const voterInfo = await prisma.voterRoll.create({
                data: {
                    idType: 'NIN',
                    idNumber: "25777399054",
                    studentId: "STU/2023/5724",
                    fullName: 'Muhammad Jamiu Soliu',
                    email: 'muhammadsoliu@university.edu',
                    imageUrl: '/soliu.png',
                    phone: "09060923345",
                    campusId: campus!.id,
                    facultyId: csDept?.facultyId,
                    departmentId: csDept?.id,
                    programmeId: csProgramme?.id,
                    level: 400,
                    dateOfBirth: randomDateOfBirth(),
                },
            });

            const positionNames = [
                'President',
                'Vice President',
                'Speaker',
                'Treasurer',
                'Social Director',
                'Public Relations Officer (PRO)',
                'Deputy Speaker',
            ];
            const positions = await Promise.all(
                positionNames.map(name => prisma.position.create({ data: { name } }))
            );

            const sessions = await Promise.all([
                prisma.academicSession.create({
                    data: {
                        name: '2026/2027',
                        startDate: new Date('2026-09-01'),
                        endDate: new Date('2027-07-31'),
                        isCurrent: true,
                    },
                }),
                prisma.academicSession.create({
                    data: {
                        name: '2027/2028',
                        startDate: new Date('2027-09-01'),
                        endDate: new Date('2028-07-31'),
                        isCurrent: false,
                    },
                }),
            ]);
            return c.json(successResponse(voterInfo));

        } catch (e) {
            console.log(e)
            return c.json(errorResponse("Something went wrong. Try again"), 500)
        }
    })
    .get("/election-m", async (c) => {
        try {
            const departments = await prisma.department.findMany({
                where: {
                    name: {
                        in: ["Department of Computer Science", "Department of Accounting"]
                    }
                }
            })
            const positionNames = [
                'President',
                'Vice President',
                'Speaker',
                'Treasurer',
                'Social Director',
                'Public Relations Officer (PRO)',
                'Deputy Speaker',
            ];
            const positions = await Promise.all(
                positionNames.map(name => prisma.position.create({ data: { name } }))
            );

            const positionMap: Record<string, string> = {};
            positions.forEach(p => { positionMap[p.name] = p.id; });

            const sessions = await Promise.all([
                prisma.academicSession.create({
                    data: {
                        name: '2026/2027',
                        startDate: new Date('2026-09-01'),
                        endDate: new Date('2027-07-31'),
                        isCurrent: true,
                    },
                }),
                prisma.academicSession.create({
                    data: {
                        name: '2027/2028',
                        startDate: new Date('2027-09-01'),
                        endDate: new Date('2028-07-31'),
                        isCurrent: false,
                    },
                }),
            ]);
            const [session2026, session2027] = sessions;
            const electionConfigs = [
                {
                    title: 'Student Union Election 2026/2027',
                    description: 'University wide student government election.',
                    session: session2026,
                    scopeType: ScopeType.UNIVERSITY,
                    scopeValue: 'all',
                    positionNames: ['President', 'Vice President', 'Speaker', 'Treasurer', 'Social Director', 'Public Relations Officer (PRO)'],
                    startsAt: new Date('2026-10-10T08:00:00'),
                    endsAt: new Date('2026-10-12T17:00:00'),
                    status: ElectionStatus.OPEN,
                },
                {
                    title: 'NACOS Election 2026/2027',
                    description: 'National Association of Computer Science Students election.',
                    session: session2026,
                    scopeType: ScopeType.DEPARTMENT,
                    scopeValue: 'Department of Computer Science',
                    positionNames: ['President', 'Vice President', 'Speaker', 'Treasurer', 'Social Director'],
                    startsAt: new Date('2026-11-01T08:00:00'),
                    endsAt: new Date('2026-11-02T17:00:00'),
                    status: ElectionStatus.PUBLISHED,
                },
                {
                    title: 'Accounting Department Election 2026/2027',
                    description: 'Election for the Accounting Department student leaders.',
                    session: session2026,
                    scopeType: ScopeType.DEPARTMENT,
                    scopeValue: 'Department of Accounting',
                    positionNames: ['President', 'Vice President', 'Treasurer'],
                    startsAt: new Date('2026-11-10T08:00:00'),
                    endsAt: new Date('2026-11-11T17:00:00'),
                    status: ElectionStatus.DRAFT,
                },
            ];

            const createdElections: any[] = [];

            for (const cfg of electionConfigs) {
                let departmentId: string | undefined;
                if (cfg.scopeType === ScopeType.DEPARTMENT) {
                    const dept = departments.find(d => d.name === cfg.scopeValue);
                    if (dept) departmentId = dept.id;
                }

                const election = await prisma.election.create({
                    data: {
                        title: cfg.title,
                        description: cfg.description,
                        academicSessionId: cfg.session.id,
                        startsAt: cfg.startsAt,
                        endsAt: cfg.endsAt,
                        status: cfg.status,
                        scopes: {
                            create: {
                                type: cfg.scopeType,
                                value: cfg.scopeValue,
                            },
                        },
                    },
                });

                createdElections.push(election);

                for (const posName of cfg.positionNames) {
                    const positionId = positionMap[posName];
                    if (!positionId) continue;
                    await prisma.electionPosition.create({
                        data: {
                            electionId: election.id,
                            positionId: positionId,
                        },
                    });
                }
            }


            return c.json(successResponse(session2026));

        } catch (e) {
            console.log(e)
            return c.json(errorResponse("Something went wrong. Try again"), 500)
        }
    })
// .onError((err, c) => {
//     if (err instanceof RegistrationStageError) {
//         return c.json(errorResponse(err.message), err.status)
//     }
// })


export default app;

function randomDateOfBirth(): Date {
    const now = new Date();
    const yearsAgo = 18 + Math.floor(Math.random() * 8); // 18–25
    const date = new Date(now);
    date.setFullYear(now.getFullYear() - yearsAgo);
    date.setMonth(Math.floor(Math.random() * 12));
    date.setDate(Math.floor(Math.random() * 28) + 1);
    return date;
}