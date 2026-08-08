// middleware.ts
import { getSession } from '@/lib/session';
import { NextRequest, NextResponse } from 'next/server';

export async function proxy(req: NextRequest) {
    const session = await getSession();
    if (!session.isLoggedIn) {
        return NextResponse.redirect(new URL('/login', req.url));
    }
    return NextResponse.next();
}

export const config = { matcher: ['/elections/:path*', '/api/elections/:path*', "/home"] };