// Shared types for the face verification flow.
// Kept dependency-free so both client components and the API route can import them.

/** Explicit client-side capture states. Modeled as a discriminated union, not booleans. */
export type CaptureState =
  | { status: "idle" }
  | { status: "requesting_permission" }
  | { status: "permission_denied"; reason: string }
  | { status: "camera_live" }
  | { status: "no_face" }
  | { status: "face_detected" }
  | { status: "captured"; imageDataUrl: string }
  | { status: "submitting" }
  | { status: "approved"; similarity: number }
  | { status: "manual_review"; similarity: number }
  | { status: "rejected"; reason: RejectionReason }
  | { status: "error"; message: string };

export type RejectionReason =
  | "low_similarity"
  | "no_face_detected"
  | "no_reference_photo"
  | "session_already_used"
  | "server_error";

/** Events the reducer accepts. Every transition is explicit — see hooks/useVerificationMachine.ts */
export type CaptureEvent =
  | { type: "REQUEST_CAMERA" }
  | { type: "CAMERA_GRANTED" }
  | { type: "CAMERA_DENIED"; reason: string }
  | { type: "FACE_STATUS_CHANGED"; faceDetected: boolean }
  | { type: "CAPTURE"; imageDataUrl: string }
  | { type: "RETAKE" }
  | { type: "SUBMIT" }
  | { type: "SERVER_RESULT"; result: VerifyApiResponse }
  | { type: "SERVER_ERROR"; message: string }
  | { type: "RETRY" };

/** Contract for our own Next.js API route (/api/verify), not the Python service. */
export interface VerifyApiRequest {
  studentId: string;
  imageBase64: string; // data URL or raw base64, see route.ts for parsing
}

export type VerifyApiStatus =
  | "approved"
  | "manual_review"
  | "rejected"
  | "no_face_detected"
  | "no_reference_photo";

export interface VerifyApiResponse {
  status: VerifyApiStatus;
  similarity: number | null; // null when we never got as far as scoring (e.g. no reference photo)
  message: string;
}

/** Contract assumed for the external Python microservice's /verify endpoint. */
export interface PythonVerifyRequest {
  liveImageBase64: string;
  referenceDescriptor: number[];
}

export interface PythonVerifyResponse {
  similarity: number; // 0..1
  faceDetected: boolean;
}

/** Mock registrar record. Real version will come from the registrar DB. */
export interface StudentRecord {
  studentId: string;
  name: string;
  referenceDescriptor: number[] | null; // null simulates a student with no photo on file
}

/** Verification thresholds — override via env, see pythonServiceClient.ts */
export const THRESHOLDS = {
  approve: Number(process.env.VERIFY_THRESHOLD_APPROVE ?? 0.75),
  review: Number(process.env.VERIFY_THRESHOLD_REVIEW ?? 0.55),
};
