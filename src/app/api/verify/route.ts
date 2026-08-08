import { NextRequest, NextResponse } from "next/server";
import { getStudentRecord } from "@/lib/verification/mockStudentDb";
import { callPythonVerify } from "@/lib/verification/pythonServiceClient";
import { ensureSession, updateSession } from "@/lib/verification/session";
import { THRESHOLDS, type VerifyApiRequest, type VerifyApiResponse } from "@/lib/verification/types";

export async function POST(request: NextRequest) {
  const session = await ensureSession();
  // console.log(session)

  // Guard: an already-approved session can never trigger verification again.
  if (session.status === "approved") {
    const body: VerifyApiResponse = {
      status: "approved",
      similarity: null,
      message: "This session was already verified. Continuing to voting.",
    };
    return NextResponse.json(body, { status: 409 });
  }

  let payload: VerifyApiRequest;
  try {
    payload = (await request.json()) as VerifyApiRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { studentId, imageBase64 } = payload;
  if (!studentId || !imageBase64) {
    return NextResponse.json(
      { error: "studentId and imageBase64 are required" },
      { status: 400 }
    );
  }

  const student = await getStudentRecord(studentId);

  if (!student || !student.referenceDescriptor) {
    await updateSession({ studentId, status: "manual_review" });
    const body: VerifyApiResponse = {
      status: "no_reference_photo",
      similarity: null,
      message:
        "We couldn't find a reference photo on file for this student ID. This has been flagged for manual review by the election committee.",
    };
    return NextResponse.json(body, { status: 200 });
  }

  // Strip a data URL prefix if the client sent one (e.g. "data:image/jpeg;base64,...").
  const rawBase64 = imageBase64.includes(",") ? imageBase64.split(",")[1] : imageBase64;

  try {
    const result = await callPythonVerify({
      liveImageBase64: rawBase64,
      referenceDescriptor: student.referenceDescriptor,
    });

    console.log("result: ", result)

    if (!result.faceDetected) {
      const body: VerifyApiResponse = {
        status: "no_face_detected",
        similarity: null,
        message: "No face was detected in the captured image. Please try again.",
      };
      return NextResponse.json(body, { status: 200 });
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

    await updateSession({ studentId, status: sessionStatus });

    const messages: Record<typeof status, string> = {
      approved: "Identity verified. You may proceed to vote.",
      manual_review:
        "We couldn't confidently confirm your identity automatically. Your submission has been sent to the election committee for manual review.",
      rejected:
        "We couldn't verify your identity from this photo. You can retake the photo or contact the election committee.",
      // no_face_detected: "",
      // no_reference_photo: "",
    };

    const body: VerifyApiResponse = {
      status,
      similarity: result.similarity,
      message: messages[status],
    };
    return NextResponse.json(body, { status: 200 });
  } catch (err) {
    console.error("Face verification service error:", err);
    // Fail toward manual review rather than silently blocking a voter on an infra hiccup.
    await updateSession({ studentId, status: "manual_review" });
    const body: VerifyApiResponse = {
      status: "manual_review",
      similarity: null,
      message:
        "We hit a technical issue while verifying your photo. Your submission has been queued for manual review.",
    };
    return NextResponse.json(body, { status: 200 });
  }
}
