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
import { onInvalid } from "@/lib/validation";




const TOKEN_EXPIRATION_HOURS = 24
const MAX_OTP_ATTEMPTS = 5;
const MAX_FAILED_LOGINS = 5;          // match the password step
const LOCK_MS = 15 * 60_000;           // match the password step
const OTP_TTL_MS = 5 * 60_000;
const OTP_WINDOW_MS = 15 * 60_000;
const MAX_OTPS_PER_WINDOW = 3;

const generateOTP = () => crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");


// const ratelimit = new Ratelimit({
//   redis: Redis.fromEnv(),
//   limiter: Ratelimit.slidingWindow(5, '15 m'),
// });

let dummyHash: string | undefined;
const getDummyHash = async () => (dummyHash ??= await argon2.hash(crypto.randomUUID()));

const maskEmail = (e: string) => {
    const [user, domain] = e.split("@");
    return `${user.slice(0, 1)}***@${domain}`;
};

async function deliverOtp(email: string, otp: string) {
    if (process.env.NODE_ENV !== "production") {
        console.log(`[dev] login code for ${maskEmail(email)}: ${otp}`);
        return;
    }
    // await sendEmail(email, `Your login code: ${otp}`);
}


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

            return c.json(successResponse({ message: 'OTP sent to registered email', regSessionId: regSession.id, otp }), 200);
        } catch (e) {
            return c.json(errorResponse("INTERNAL_ERROR"), 500);
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
            });


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
            const rawBase64 = imageBase64.replace(/^data:image\/(jpeg|png);base64,/, "");
            const voterId = voter?.voterId as string
            let result;
            try {
                result = await callPythonVerify({ liveImageBase64: rawBase64, voterId });
            } catch (err) {
                console.error("face-verify: service failure");
                return c.json(errorResponse("FACE_SERVICE_UNAVAILABLE"), 503);
            }

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
                return c.json(errorResponse('Please contact school admin to correct your record'));
            }
            await prisma.registrationSession.update({ where: { id: regSessionId }, data: { infoConfirmed: true } });

            return c.json(successResponse({ message: 'Confirmed, proceed to set password' }));

        } catch (e) {
            console.error("Confirmation failed", e instanceof Error ? e.name : "unknown", (e as any)?.code);
            return c.json(errorResponse("INTERNAL_ERROR"), 500);
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
            console.error("password creation failed", e instanceof Error ? e.name : "unknown", (e as any)?.code);
            return c.json(errorResponse("INTERNAL_ERROR"), 500);

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

            const { id: idType, idNumber, password } = c.req.valid("json")

            //   const ip = c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
            //   const [byIp, byId] = await Promise.all([
            //     ratelimit.limit(`login:ip:${ip}`),
            //     ratelimit.limit(`login:id:${idType}:${idNumber}`),
            //   ]);
            //   if (!byIp.success || !byId.success) return c.json(errorResponse("RATE_LIMITED"), 429);

            const voter = await prisma.voterRoll.findUnique({
                where: { idType_idNumber: { idType, idNumber } },
                select: { id: true, email: true },
            });

            const account = voter ? await prisma.account.findUnique({ where: { voterId: voter.id } }) : null;


            if (!voter || !account) {
                await argon2.verify(await getDummyHash(), password);
                return c.json(errorResponse("INVALID_CREDENTIALS"), 401);
            }

            if (!(await argon2.verify(account.passwordHash, password))) {
                const a = await prisma.account.update({
                    where: { id: account.id },
                    data: { failedAttempts: { increment: 1 } },
                    select: { failedAttempts: true },
                });
                if (a.failedAttempts >= MAX_FAILED_LOGINS) {
                    await prisma.account.update({
                        where: { id: account.id },
                        data: { lockedUntil: new Date(Date.now() + LOCK_MS), failedAttempts: 0 },
                    });
                    return c.json(errorResponse("ACCOUNT_LOCKED"), 401);

                }
                return c.json(errorResponse("INVALID_CREDENTIALS"), 401);
            }
            if (!voter.email) return c.json(errorResponse("NO_EMAIL_ON_FILE"), 409);

            const recent = await prisma.otp.count({
                where: {
                    voterId: voter.id,
                    purpose: "LOGIN",
                    createdAt: { gt: new Date(Date.now() - OTP_WINDOW_MS) },
                },
            });
            if (recent >= MAX_OTPS_PER_WINDOW) return c.json(errorResponse("TOO_MANY_OTP_REQUESTS"), 429);



            const otp = generateOTP();
            const otpHash = await argon2.hash(otp);

            const [, vOtp] = await prisma.$transaction([
                prisma.otp.updateMany({
                    where: { voterId: voter.id, purpose: "LOGIN", used: false },
                    data: { used: true },
                }),
                prisma.otp.create({
                    data: { voterId: voter.id, otpHash, purpose: "LOGIN", expiresAt: new Date(Date.now() + OTP_TTL_MS) },
                    select: { id: true },
                }),
            ]);

            try {
                await deliverOtp(voter.email, otp);
            } catch {
                // Don't claim a code was sent when it wasn't. Retire it so it can't be guessed.
                await prisma.otp.updateMany({ where: { id: vOtp.id }, data: { used: true } });
                return c.json(errorResponse("EMAIL_UNAVAILABLE"), 503);
            }

            c.header("Cache-Control", "no-store");
            return c.json(successResponse({ vid: vOtp.id, emailHint: maskEmail(voter.email), otp }, "Verification code sent"));

        } catch (e) {
            console.error("login failed", e instanceof Error ? e.name : "unknown", (e as any)?.code); // never the body
            return c.json(errorResponse("INTERNAL_ERROR"), 500);
        }
    })
    .post("/login/confirm-otp", zValidator("json", LoginOtpSchema), async (c) => {
        try {
            const { vid, otp } = c.req.valid("json")
            const now = new Date();

            // Atomically claim one guess. This also rejects used, expired and exhausted codes.
            const claim = await prisma.otp.updateMany({
                where: {
                    id: vid, purpose: "LOGIN", used: false,
                    expiresAt: { gt: now }, attempts: { lt: MAX_OTP_ATTEMPTS },
                },
                data: { attempts: { increment: 1 } },
            });

            if (claim.count !== 1) return c.json(errorResponse("OTP_EXPIRED"), 400);
            const record = await prisma.otp.findUnique({
                where: { id: vid },
                select: { otpHash: true, voterId: true },
            });

            if (!record) return c.json(errorResponse("OTP_EXPIRED"), 400);
            const account = await prisma.account.findUnique({
                where: { voterId: record.voterId },
                select: { id: true, lockedUntil: true },
            });

            if (!account) return c.json(errorResponse("OTP_EXPIRED"), 400);

            if (account.lockedUntil && account.lockedUntil > now)
                return c.json(errorResponse("ACCOUNT_LOCKED"), 423);
            const verify = await argon2.verify(record.otpHash, otp)
            if (!verify) {
                const a = await prisma.account.update({
                    where: { id: account.id },
                    data: { failedAttempts: { increment: 1 } },
                    select: { failedAttempts: true },
                });
                if (a.failedAttempts >= MAX_FAILED_LOGINS) {
                    await prisma.account.update({
                        where: { id: account.id },
                        data: { lockedUntil: new Date(Date.now() + LOCK_MS), failedAttempts: 0 },
                    });
                }
                return c.json(errorResponse("OTP_INVALID"), 400);
            }

            // Compare-and-set: only one concurrent request can consume the code
            const consumed = await prisma.otp.updateMany({
                where: { id: vid, used: false },
                data: { used: true },
            });
            if (consumed.count !== 1) return c.json(errorResponse("OTP_EXPIRED"), 400);

            // Retire every other outstanding login code and reset the counters
            await prisma.otp.updateMany({
                where: { voterId: record.voterId, purpose: "LOGIN", used: false },
                data: { used: true },
            });
            await prisma.account.update({
                where: { id: account.id },
                data: { failedAttempts: 0, lockedUntil: null, lastLogin: now },
            });

            const session = await getSession();
            session.id = account.id;
            session.sid = crypto.randomUUID();   // new per login, binds voting sessions to this login
            session.isLoggedIn = true;
            await session.save();

            c.header("Cache-Control", "no-store");
            return c.json(successResponse({ message: "Logged in" }));

        } catch (e) {
            console.error("login-otp failed", e instanceof Error ? e.name : "unknown", (e as any)?.code);
            return c.json(errorResponse("INTERNAL_ERROR"), 500);
        }
    })
    .get("/user", async (c) => {
        try {
            const auth = await getSession();
            if (!auth.isLoggedIn) return c.json(errorResponse("UNAUTHENTICATED"), 401);

            const account = await prisma.account.findUnique({
                where: { id: auth.id },
                select: { voterId: true },
            });
            if (!account) return c.json(errorResponse("UNAUTHENTICATED"), 401);

            const voter = await prisma.voterRoll.findUnique({
                where: { id: account.voterId },
                select: {
                    fullName: true,
                    phone: true,
                    email: true,
                    imageUrl: true,
                    studentId: true,
                    level: true,
                    department: {
                        select: {
                            name: true
                        },
                    },
                    faculty: {
                        select: {
                            name: true
                        },
                    }

                },
            });

            const voterInfo = {
                ...voter

            }

            return c.json(successResponse(voterInfo));

        } catch (e) {
            console.log(e)
            return c.json(errorResponse("Something went wrong. Try again"), 500)
        }
    })
    .get("/main", async (c) => {
        try {
            // await prisma.voterRoll.deleteMany();              // child of Campus + Faculty + Department, NOT cascaded

            const voters = await prisma.voterRoll.count()
            if (voters >= 50) {
                return c.json(successResponse("You have enough voters"))
            }
            // const campus = await prisma.campus.findFirst()

            // const departments = await prisma.department.findMany()
            // const programmeRecords = await prisma.programme.findMany()
            // const csDept = await prisma.department.findFirst({
            //     where: {
            //         name: "Department of Computer Science"
            //     }
            // })
            // const csProgramme = await prisma.programme.findFirst({
            //     where: {
            //         departmentId: csDept?.id
            //     }
            // })
            // const idType = 'NIN' // adjust to your enum values

            // const studentNames = [
            //     "Abdulrahman Ibrahim Bello",
            //     "Chiamaka Grace Okafor",
            //     "Oluwaseun David Adeyemi",
            //     "Maryam Aisha Suleiman",
            //     "Emeka Chinedu Nwosu",
            //     "Esther Oluwatoyin Akinwale",
            //     "Daniel Chukwuemeka Eze",
            //     "Zainab Rukayat Lawal",
            //     "Samuel Olumide Ogunleye",
            //     "Blessing Efe Oghenekaro",
            //     "Yusuf Abdulazeez Musa",
            //     "Mercy Nkem Obi",
            //     "Michael Tobi Ojo",
            //     "Fatimah Aminat Mohammed",
            //     "Precious Ifeoma Ezeani",
            //     "Victor Ebuka Okoro",
            //     "Deborah Tolulope Ajayi",
            //     "Ibrahim Sani Abdullahi",
            //     "Cynthia Amarachi Umeh",
            //     "Emmanuel Ayomide Adebayo",
            //     "Abdulrahman Musa Yusuf",
            //     "Chidera Joy Okafor",
            //     "Oluwaseun David Adeyemi",
            //     "Aisha Zainab Ibrahim",
            //     "Chukwuebuka Daniel Eze",
            //     "Temiloluwa Grace Adebayo",
            //     "Fatima Hauwa Bello",
            //     "Emmanuel Chinedu Okoro",
            //     "Esther Oluwatoyin Olamide",
            //     "Ibrahim Sani Musa",
            //     "Precious Amarachi Nwankwo",
            //     "Daniel Etim Akpan",
            //     "Zainab Maryam Abdullahi",
            //     "Favour Chisom Eze",
            //     "Samuel Oluwadamilare Oladipo",
            //     "Maryam Aisha Sani",
            //     "David Ekong Udo",
            //     "Grace Ifeoma Nwachukwu",
            //     "Abdulaziz Ahmed Lawal",
            //     "Victory Iniobong Ekanem",
            //     "Abdulrahman Musa Yusuf",
            //     "Chidera Joy Okafor",
            //     "Oluwaseun David Adeyemi",
            //     "Aisha Zainab Ibrahim",
            //     "Chukwuebuka Daniel Eze",
            //     "Temiloluwa Grace Adebayo",
            //     "Fatima Hauwa Bello",
            //     "Emmanuel Chinedu Okoro",
            //     "Esther Oluwatoyin Olamide",
            //     "Ibrahim Sani Musa",
            //     "Precious Amarachi Nwankwo",
            //     "Daniel Etim Akpan",
            //     "Zainab Maryam Abdullahi",
            //     "Favour Chisom Eze",
            //     "Samuel Oluwadamilare Oladipo",
            //     "Maryam Aisha Sani",
            //     "David Ekong Udo",
            //     "Grace Ifeoma Nwachukwu",
            //     "Abdulaziz Ahmed Lawal",
            //     "Victory Iniobong Ekanem",
            // ];

            // function getStudentName(count: number) {

            //     return studentNames[count]
            // }

            // const voterAllocationPlan: { department: string; level: number; count: number }[] = [
            //     // 400-level (13 total: CS 5 + Soliu = 6, Accounting 4, others 3)
            //     { department: 'Department of Computer Science', level: 400, count: 9 },
            //     { department: 'Department of Accounting', level: 400, count: 9 },
            //     { department: 'Department of Mechanical Engineering', level: 400, count: 2 },
            //     { department: 'Department of Economics', level: 400, count: 1 },
            //     { department: 'Department of Physics', level: 400, count: 1 },
            //     { department: 'Department of English', level: 400, count: 1 },


            //     // 300-level (10 total: CS 4, Accounting 2, others 4)
            //     { department: 'Department of Computer Science', level: 300, count: 9 },
            //     { department: 'Department of Accounting', level: 300, count: 9 },
            //     { department: 'Department of Mass Communication', level: 300, count: 1 },
            //     { department: 'Department of Civil Engineering', level: 300, count: 1 },
            //     { department: 'Department of Sociology', level: 300, count: 1 },
            //     { department: 'Department of English', level: 300, count: 1 },
            //     { department: 'Department of Chemistry', level: 300, count: 1 },


            //     // 200-level (10 total: CS 1, Accounting 1, others 8)
            //     { department: 'Department of Computer Science', level: 200, count: 3 },
            //     { department: 'Department of Accounting', level: 200, count: 3 },
            //     { department: 'Department of Mathematics', level: 200, count: 1 },
            //     { department: 'Department of Chemistry', level: 200, count: 1 },
            //     { department: 'Department of Biology', level: 200, count: 1 },
            //     { department: 'Department of Cybersecurity', level: 200, count: 1 },
            //     { department: 'Department of Electrical Engineering', level: 200, count: 1 },
            //     { department: 'Department of Chemical Engineering', level: 200, count: 1 },
            //     { department: 'Department of Architecture', level: 200, count: 1 },
            //     { department: 'Department of Urban Planning', level: 200, count: 1 },
            // ];

            // let count = 0
            // let ss = []

            // for (const entry of voterAllocationPlan) {
            //     const dept = departments.find((d) => d.name === entry.department);
            //     if (!dept) {
            //         console.warn(`⚠️ Department not found in allocation plan: ${entry.department}`);
            //         continue;
            //     }
            //     const deptProgrammes = programmeRecords.filter((p) => p.departmentId === dept.id);
            //     if (deptProgrammes.length === 0) continue;

            //     for (let i = 0; i < entry.count; i++) {
            //         const fullName = getStudentName(count);
            //         const parts = fullName.split(" ")
            //         const firstName = parts[0];
            //         const lastName = parts[2];
            //         const imageUrl = `/${firstName.toLowerCase()}.png`
            //         const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 10000)}@university.edu`;
            //         const phone = randomPhone();
            //         const level = entry.level;
            //         const dateOfBirth = randomDateOfBirth();
            //         const idType = "NIN"
            //         const idNumber = randomIdNumber();
            //         const studentId = randomStudentId()

            //         // Randomly assign a programme from this department
            //         const programme = randomItem(deptProgrammes);
            //         ss.push(fullName)
            //         await prisma.voterRoll.create({
            //             data: {
            //                 idType,
            //                 idNumber,
            //                 studentId,
            //                 fullName,
            //                 email,
            //                 imageUrl,
            //                 phone,
            //                 campusId: campus?.id,
            //                 facultyId: dept.facultyId,
            //                 departmentId: dept.id,
            //                 programmeId: programme.id,
            //                 level,
            //                 dateOfBirth,
            //             },
            //         });
            //         count++
            //     }
            // }
            // const data = {
            //     ss,
            //     length: ss.length
            // }
            // const voterInfo = await prisma.voterRoll.create({
            //     data: {
            //         idType: 'NIN',
            //         idNumber: "25777399054",
            //         studentId: "STU/2023/5724",
            //         fullName: 'Muhammad Jamiu Soliu',
            //         email: 'muhammadsoliu@university.edu',
            //         imageUrl: '/soliu.png',
            //         phone: "09060923345",
            //         campusId: campus!.id,
            //         facultyId: csDept?.facultyId,
            //         departmentId: csDept?.id,
            //         programmeId: csProgramme?.id,
            //         level: 400,
            //         dateOfBirth: randomDateOfBirth(),
            //     },
            // });

            // const positionNames = [
            //     'President',
            //     'Vice President',
            //     'Speaker',
            //     'Treasurer',
            //     'Social Director',
            //     'Public Relations Officer (PRO)',
            //     'Deputy Speaker',
            // ];
            // const positions = await Promise.all(
            //     positionNames.map(name => prisma.position.create({ data: { name } }))
            // );

            // const sessions = await Promise.all([
            //     prisma.academicSession.create({
            //         data: {
            //             name: '2026/2027',
            //             startDate: new Date('2026-09-01'),
            //             endDate: new Date('2027-07-31'),
            //             isCurrent: true,
            //         },
            //     }),
            //     prisma.academicSession.create({
            //         data: {
            //             name: '2027/2028',
            //             startDate: new Date('2027-09-01'),
            //             endDate: new Date('2028-07-31'),
            //             isCurrent: false,
            //         },
            //     }),
            // ]);
            return c.json(successResponse("success"));

        } catch (e) {
            console.log(e)
            return c.json(errorResponse("Something went wrong. Try again"), 500)
        }
    })
    .get("/election-create", async (c) => {
        try {





            return c.json(successResponse({}));

        } catch (e) {
            console.log(e)
            return c.json(errorResponse("Something went wrong. Try again"), 500)
        }
    })
    .get("/election-candidates", async (c) => {
        try {
            const positionLevelRequirement: Record<string, number> = {
                'President': 400,
                'Speaker': 400,
                'Treasurer': 400,
                'Vice President': 300,
                'Deputy Speaker': 300,
                'Social Director': 300,
                'Public Relations Officer (PRO)': 200,
            };
            const allElections = await prisma.election.findMany({
                include: {
                    scopes: true,
                    positions: {
                        include: {
                            position: true,
                        },
                    },
                },
            });

            const voters = await prisma.voterRoll.findMany()
            const departments = await prisma.department.findMany()

            for (const election of allElections) {
                let eligibleVoterIds: string[] = [];
                const scope = election.scopes[0];

                if (scope.type === ScopeType.UNIVERSITY) {
                    eligibleVoterIds = voters.map(v => v.id);
                } else if (scope.type === ScopeType.DEPARTMENT) {
                    const dept = departments.find(d => d.name === scope.value);
                    if (dept) {
                        eligibleVoterIds = voters.filter(v => v.departmentId === dept.id).map(v => v.id);
                    }
                } else {
                    eligibleVoterIds = voters.map(v => v.id);
                }

                // Register all eligible voters as participants
                for (const vt of eligibleVoterIds) {
                    await prisma.electionParticipation.create({
                        data: {
                            electionId: election.id,
                            voterId: vt,
                            eligible: true,
                        }
                    })
                }

                // Track voters already used as a candidate in this election so the
                // same person doesn't end up contesting two positions at once.
                const usedInThisElection = new Set<string>();

                const MAX_CANDIDATES_PER_POSITION = 4; // "up to 3 where the pool allows"

                for (const ep of election.positions) {
                    const requiredLevel = positionLevelRequirement[ep.position.name];

                    const candidatePool = eligibleVoterIds.filter((id) => {
                        if (usedInThisElection.has(id)) return false;
                        if (!requiredLevel) return true;
                        return voters.find((v) => v.id === id)?.level === requiredLevel;
                    });

                    if (candidatePool.length === 0) continue;

                    const shuffled = [...candidatePool].sort(() => 0.5 - Math.random());

                    // For the university-wide election, no two candidates for the
                    // SAME position may come from the same department — this is
                    // moot for NACOS/Accounting since those are single-department
                    // scopes to begin with, so we only enforce it here.
                    const isUniversityScope = scope.type === ScopeType.UNIVERSITY;
                    const departmentsUsedForPosition = new Set<string>();
                    const selected: string[] = [];

                    for (const voterId of shuffled) {
                        if (selected.length >= MAX_CANDIDATES_PER_POSITION) break;

                        if (isUniversityScope) {
                            const voterDeptId = voters.find((v) => v.id === voterId)?.departmentId;
                            if (voterDeptId) {
                                if (departmentsUsedForPosition.has(voterDeptId)) continue;
                                departmentsUsedForPosition.add(voterDeptId);
                            }
                        }

                        selected.push(voterId);
                    }

                    for (const voterId of selected) {
                        usedInThisElection.add(voterId);
                        const imageUrl = voters.find((v) => v.id == voterId)?.imageUrl
                        await prisma.candidate.create({
                            data: {
                                electionPositionId: ep.id,
                                voterId: voterId,
                                manifesto: "I am committed to serving the student body. My vision is to improve welfare and academic excellence.",
                                imageUrl
                            },
                        });
                    }
                }
            }



            return c.json(successResponse("sucess"));

        } catch (e) {
            console.log(e)
            return c.json(errorResponse("Something went wrong. Try again"), 500)
        }
    })


export default app;
export const errInfo = (e: unknown) => e instanceof Error ? `${e.name} ${(e as any).code ?? ""}`.trim() : "unknown"


function randomItem<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomDateOfBirth(): Date {
    const now = new Date();
    const yearsAgo = 18 + Math.floor(Math.random() * 8); // 18–25
    const date = new Date(now);
    date.setFullYear(now.getFullYear() - yearsAgo);
    date.setMonth(Math.floor(Math.random() * 12));
    date.setDate(Math.floor(Math.random() * 28) + 1);
    return date;
}

function randomStudentId(): string {
    const year = 2020 + Math.floor(Math.random() * 6); // 2020–2025
    const seq = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    return `STU/${year}/${seq}`;
}

function randomLevel(): number {
    return randomItem([200, 300, 400]);
}

function randomDate(start: Date, end: Date): Date {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomPhone(): string {
    const prefixes = ['080', '081', '090', '091', '070', '0803', '0806', '0813'];
    const prefix = randomItem(prefixes);
    const rest = Array.from({ length: 8 }, () => Math.floor(Math.random() * 10)).join('');
    return prefix + rest;
}
function randomIdNumber(): string {
    const digits = Array.from({ length: 11 }, () => Math.floor(Math.random() * 10)).join('');
    return `${digits}`;
}