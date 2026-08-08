// lib/registration-session.ts
import prisma from './prisma';

type StageFlags = {
    idVerified?: boolean;
    otpVerified?: boolean;
    faceVerified?: boolean;
    infoConfirmed?: boolean;
};

export class RegistrationStageError extends Error {
    status: number;
    constructor(message: string, status = 400) {
        super(message);
        this.status = status;
    }
}

/**
 * Loads a registration_sessions row and verifies:
 *  1. It exists
 *  2. It hasn't expired
 *  3. Every flag in `requiredFlags` is true on that row
 *
 * Throws RegistrationStageError if any check fails.
 */
export async function requireStage(
    regSessionId: string,
    requiredFlags: StageFlags
) {
    const regSession = await prisma.registrationSession.findUnique({
        where: { id: regSessionId },
    });

    if (!regSession) {
        throw new RegistrationStageError('Registration session not found', 404);
    }

    if (regSession.expiresAt < new Date()) {
        throw new RegistrationStageError('Registration session expired, please start again', 410);
    }

    for (const [flag, required] of Object.entries(requiredFlags)) {
        if (required && !regSession[flag as keyof typeof regSession]) {
            throw new RegistrationStageError(
                `Cannot proceed: ${flag} has not been completed`,
                403
            );
        }
    }

    return regSession;
}

/**
 * Wraps a route handler so RegistrationStageError is automatically turned
 * into a Response — avoids repeating try/catch in every registration route.
 */
export function withStage(
    handler: (req: Request) => Promise<Response>
) {
    return async (req: Request) => {
        try {
            return await handler(req);
        } catch (err) {
            if (err instanceof RegistrationStageError) {
                return Response.json({ error: err.message }, { status: err.status });
            }
            throw err;
        }
    };
}