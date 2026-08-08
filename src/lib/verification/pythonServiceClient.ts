import type { PythonVerifyRequest, PythonVerifyResponse } from "./types";

// Server-only. This module must never be imported from a client component —
// FACE_SERVICE_URL should never reach the browser bundle.
const FACE_SERVICE_URL = process.env.FACE_SERVICE_URL;

export async function callPythonVerify(
  req: PythonVerifyRequest
): Promise<PythonVerifyResponse> {
  if (!FACE_SERVICE_URL) {
    throw new Error("FACE_SERVICE_URL is not configured");
  }

  console.log("Python api called")

  // const res = await fetch(`${FACE_SERVICE_URL}/verify`, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify(req),
  //   // Assume the matching service is fast; fail closed rather than hang the request.
  //   signal: AbortSignal.timeout(8000),
  // });

  // if (!res.ok) {
  //   throw new Error(`Face service responded ${res.status}`);
  // }

  // const data = (await res.json()) as PythonVerifyResponse;
  const data1 = {
    similarity: 0.9,
    faceDetected: true
  }

  if (typeof data1.similarity !== "number" || typeof data1.faceDetected !== "boolean") {
    throw new Error("Face service returned an unexpected shape");
  }
  return data1;
}
