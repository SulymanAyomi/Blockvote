"use client";

import { useRef, useState } from "react";
import { CameraCapture, type CameraCaptureHandle } from "./CameraCapture";
import { FaceGuideOverlay } from "./FaceGuideOverlay";
import { StudentIdForm } from "./StudentIdForm";
import { ResultApproved } from "./ResultApproved";
import { ResultManualReview } from "./ResultManualReview";
import { ResultRejected } from "./ResultRejected";
import { useVerificationMachine } from "@/hooks/useVerificationMachine";
import { useFaceDetection } from "@/hooks/useFaceDetection";
import type { VerifyApiResponse } from "@/lib/verification/types";

// This component owns orchestration only — no camera or face-detection logic lives here directly,
// it composes the pieces in components/verification/* and hooks/*.

export function VerificationFlow() {
  const {
    state,
    dispatch,
    requestCamera,
    cameraGranted,
    cameraDenied,
    faceStatusChanged,
    capture,
    retake,
    submit,
  } = useVerificationMachine();

  const [studentId, setStudentId] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraHandleRef = useRef<CameraCaptureHandle>(null);

  const cameraActive =
    state.status === "camera_live" ||
    state.status === "no_face" ||
    state.status === "face_detected";
  const { faceDetected, centered } = useFaceDetection(videoRef, cameraActive);

  // Feed live detection results into the state machine as they change.
  const readyToCapture = faceDetected && centered;
  if (cameraActive) {
    const shouldBeFaceDetected = state.status === "face_detected";
    if (readyToCapture !== shouldBeFaceDetected) {
      faceStatusChanged(readyToCapture);
    }
  }

  async function handleSubmit() {
    if (state.status !== "captured" || !studentId) return;
    submit();

    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, imageBase64: state.imageDataUrl }),
      });
      const result = (await res.json()) as VerifyApiResponse;
      dispatch({ type: "SERVER_RESULT", result });
    } catch (err) {
      dispatch({
        type: "SERVER_ERROR",
        message:
          err instanceof Error ? err.message : "Verification request failed.",
      });
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-6 px-4 py-10">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-slate-900">
          Verify your identity
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Required once before you can vote.
        </p>
      </div>

      {state.status === "idle" && (
        <StudentIdForm
          onSubmit={(id) => {
            setStudentId(id);
            requestCamera();
          }}
        />
      )}

      {state.status === "requesting_permission" && (
        <StatusMessage text="Requesting camera access…" />
      )}

      {state.status === "permission_denied" && (
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-rose-600">
            Camera access was denied ({state.reason}). Enable camera permissions
            for this site and try again.
          </p>
          <button
            onClick={requestCamera}
            className="rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Try again
          </button>
        </div>
      )}

      {cameraActive && (
        <div className="flex w-full flex-col items-center gap-4">
          <div className="relative aspect-4/5 w-full max-w-xs overflow-hidden rounded-2xl bg-slate-900">
            <CameraCapture
              ref={cameraHandleRef}
              videoRef={videoRef}
              onPermissionGranted={cameraGranted}
              onPermissionDenied={cameraDenied}
            />
            <FaceGuideOverlay faceDetected={readyToCapture} />
          </div>
          <p className="text-sm text-slate-500">
            {readyToCapture
              ? "Face centered — you're good to capture."
              : "Center your face in the oval."}
          </p>
          <button
            disabled={!readyToCapture}
            onClick={() => {
              const frame = cameraHandleRef.current?.captureFrame();
              if (frame) capture(frame);
            }}
            className="rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Capture
          </button>
        </div>
      )}

      {state.status === "captured" && (
        <div className="flex w-full flex-col items-center gap-4">
          <img
            src={state.imageDataUrl}
            alt="Captured selfie preview"
            className="aspect-4/5 w-full max-w-xs rounded-2xl object-cover"
          />
          <div className="flex gap-3">
            <button
              onClick={retake}
              className="rounded-lg border border-slate-300 px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Retake
            </button>
            <button
              onClick={handleSubmit}
              className="rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
            >
              Submit
            </button>
          </div>
        </div>
      )}

      {state.status === "submitting" && (
        <StatusMessage text="Verifying your identity…" />
      )}

      {state.status === "approved" && (
        <ResultApproved similarity={state.similarity} />
      )}

      {state.status === "manual_review" && (
        <ResultManualReview message="We couldn't confidently confirm your identity automatically. Your submission has been sent to the election committee for manual review." />
      )}

      {state.status === "rejected" && (
        <ResultRejected
          onRetry={() => {
            dispatch({ type: "RETRY" });
          }}
        />
      )}

      {state.status === "error" && (
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-rose-600">{state.message}</p>
          <button
            onClick={() => dispatch({ type: "RETRY" })}
            className="rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}

function StatusMessage({ text }: { text: string }) {
  return <p className="text-sm text-slate-500">{text}</p>;
}
