import crypto from "crypto"
const TOKEN_KEY = process.env.VOTING_TOKEN_SECRET!; // 32+ random bytes, used for nothing else

export function verifyToken(token: string) {
    const [payload, sig] = token.split(".");
    if (!payload || !sig) return null;
    const expected = crypto.createHmac("sha256", TOKEN_KEY).update(payload).digest();
    const given = Buffer.from(sig, "base64url");
    if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) return null;
    try {
        const p = JSON.parse(Buffer.from(payload, "base64url").toString());
        return typeof p.e === "string" && typeof p.j === "string" && typeof p.x === "number" ? p : null;
    } catch { return null; }
}

export function signToken(electionId: string, exp: Date) {
    const payload = Buffer.from(JSON.stringify({
        e: electionId,
        j: crypto.randomBytes(16).toString("base64url"), // jti, hashed into SpentToken at ballot time
        x: exp.getTime(),
    })).toString("base64url");
    const sig = crypto.createHmac("sha256", TOKEN_KEY).update(payload).digest("base64url");
    return `${payload}.${sig}`;
}