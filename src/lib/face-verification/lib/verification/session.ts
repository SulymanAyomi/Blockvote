import { cookies } from "next/headers";
import crypto from "crypto";

// Minimal signed-cookie session, no external deps.
// Good enough for an MVP; swap for iron-session/next-auth when real accounts exist.
// The important behavioral guarantee: once a session is marked "approved",
// /api/verify refuses to run verification again for that session.

const COOKIE_NAME = "election_verify_session";
const SECRET = process.env.SESSION_SECRET ?? "dev-only-insecure-secret-change-me";

export type SessionStatus = "pending" | "approved" | "manual_review" | "rejected";

export interface SessionPayload {
  sessionId: string;
  studentId: string | null;
  status: SessionStatus;
  issuedAt: number;
}

function sign(value: string): string {
  return crypto.createHmac("sha256", SECRET).update(value).digest("hex");
}

function serialize(payload: SessionPayload): string {
  const json = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = sign(json);
  return `${json}.${signature}`;
}

function deserialize(raw: string): SessionPayload | null {
  const [json, signature] = raw.split(".");
  if (!json || !signature) return null;
  if (sign(json) !== signature) return null; // tampered or wrong secret
  try {
    return JSON.parse(Buffer.from(json, "base64url").toString()) as SessionPayload;
  } catch {
    return null;
  }
}

/** Reads the current session from cookies, if any. Server-side only. */
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  return deserialize(raw);
}

/** Creates a fresh pending session (called when the verify page first loads). */
export async function ensureSession(): Promise<SessionPayload> {
  const existing = await getSession();
  if (existing) return existing;

  const payload: SessionPayload = {
    sessionId: crypto.randomUUID(),
    studentId: null,
    status: "pending",
    issuedAt: Date.now(),
  };
  const store = await cookies();
  store.set(COOKIE_NAME, serialize(payload), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 30, // 30 minutes — long enough for one voting session
  });
  return payload;
}

/** Updates the session's status/studentId after a verification attempt. */
export async function updateSession(
  update: Partial<Pick<SessionPayload, "studentId" | "status">>
): Promise<SessionPayload> {
  const current = (await getSession()) ?? {
    sessionId: crypto.randomUUID(),
    studentId: null,
    status: "pending" as const,
    issuedAt: Date.now(),
  };
  const next: SessionPayload = { ...current, ...update };
  const store = await cookies();
  store.set(COOKIE_NAME, serialize(next), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 30,
  });
  return next;
}
