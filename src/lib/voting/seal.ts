import crypto from "crypto"

export function seal(publicPem: string, data: unknown) {
    const key = crypto.randomBytes(32), iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
    const ct = Buffer.concat([cipher.update(JSON.stringify(data)), cipher.final()]);
    const wrapped = crypto.publicEncrypt(
        { key: publicPem, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash: "sha256" }, key);
    return Buffer.concat([wrapped, iv, cipher.getAuthTag(), ct]).toString("base64");
}