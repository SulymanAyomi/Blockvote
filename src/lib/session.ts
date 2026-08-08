// lib/session.ts
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

interface SessionData {
    id: string;
    isLoggedIn: boolean;
}

export async function getSession() {
    return getIronSession<SessionData>(await cookies(), {
        password: process.env.SESSION_SECRET!, // 32+ char random string
        cookieName: 'school_vote_session',
        cookieOptions: {
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            sameSite: 'strict',
            maxAge: 60 * 60, // 15 minutes
        },
    });
}