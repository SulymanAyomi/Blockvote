import z from "zod";
import { IDTypes } from "./type";

export const idSelectionSchema = z.object({
    id: z.enum(IDTypes, { error: "Required" }),
    idNumber: z.string().length(11, "Identification number must be exactly 11 digits")
});

export const verifyNINSchema = z.object({
    idType: z.enum(IDTypes, { error: "Required" }),
    idNumber: z.string().length(11), // adjust to your country's NIN format
});

export const verifyOTPSchema = z.object({
    regSessionId: z.string(),
    otp: z.string()
});

export const faceVerificationSchema = z.object({
    regSessionId: z.string(),
    imageBase64: z.string()
});

export const informationConfirmationSchema = z.object({
    regSessionId: z.string(),
    confirmed: z.boolean()
});

export const getInfoConfirmationSchema = z.object({
    regSessionId: z.string(),
});

export const setPasswordSchema = z.object({
    regSessionId: z.string(),
    password: z.string()
});

export const LoginSchema = z.object({
    id: z.enum(IDTypes, { error: "Required" }),
    idNumber: z.string({ error: "Id number required" }).length(11, "Identification number must be exactly 11 digits"),
    password: z.string({ error: "Password required" })
});

export const LoginOtpSchema = z.object({
    vid: z.string(),
    otp: z.string()
});