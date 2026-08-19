"use client";

import { useEffect, useRef, useState } from "react";
import { CameraCapture, type CameraCaptureHandle } from "./CameraCapture";
import { FaceGuideOverlay } from "./FaceGuideOverlay";
import { StudentIdForm } from "./StudentIdForm";
import { ResultApproved } from "./ResultApproved";
import { ResultManualReview } from "./ResultManualReview";
import { ResultRejected } from "./ResultRejected";
import { useVerificationMachine } from "../../hooks/useVerificationMachine";
import { useFaceDetection } from "../../hooks/useFaceDetection";
import type { VerifyApiResponse } from "@/lib/verification/types";
import { Button } from "@/components/ui/button";
import { useFaceVerification } from "@/features/auth/api/use-face-verification";
import { Vote } from "lucide-react";

// This component owns orchestration only — no camera or face-detection logic lives here directly,
// it composes the pieces in components/verification/* and hooks/*.

interface VerificationFlowProps {
  onNext: () => void;
  regSessionId: string;
}
export function VerificationFlow({
  onNext,
  regSessionId,
}: VerificationFlowProps) {
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

  const { mutate, isPending } = useFaceVerification();
  const [studentId, setStudentId] = useState<string | null>("S1001");
  const videoRef = useRef<HTMLVideoElement>(null);

  const cameraHandleRef = useRef<CameraCaptureHandle>(null);

  const cameraActive =
    state.status === "camera_live" ||
    state.status === "no_face" ||
    state.status === "face_detected";
  const { faceDetected, centered } = useFaceDetection(videoRef, cameraActive);

  // Feed live detection results into the state machine as they change.
  // const readyToCapture = faceDetected && centered;
  const readyToCapture = true;
  if (cameraActive) {
    const shouldBeFaceDetected = state.status === "face_detected";
    if (readyToCapture !== shouldBeFaceDetected) {
      faceStatusChanged(readyToCapture);
    }
  }

  async function handleSubmit() {
    if (state.status !== "captured") return;
    submit();
    try {
      // const res = await fetch("/api/verify", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ studentId, imageBase64: state.imageDataUrl }),
      // });
      // const result = (await res.json()) as VerifyApiResponse;
      // dispatch({ type: "SERVER_RESULT", result }); 772092
      mutate(
        {
          json: {
            imageBase64: state.imageDataUrl,
            regSessionId,
          },
        },
        {
          onSuccess: (data) => {
            console.log(data);
            const result = data.data as VerifyApiResponse;
            dispatch({ type: "SERVER_RESULT", result });
          },
          onError: () => {},
        },
      );
    } catch (err) {
      dispatch({
        type: "SERVER_ERROR",
        message:
          err instanceof Error ? err.message : "Verification request failed.",
      });
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
          audio: false,
        });

        if (cancelled) {
          // Component unmounted while permission dialog was open — clean up immediately.
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        // streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        cameraGranted();
      } catch (err) {
        if (cancelled) return;
        const reason =
          err instanceof DOMException
            ? err.message
            : "Camera access failed unexpectedly.";
        cameraDenied(reason);
      }
    }

    if (state.status == "requesting_permission") {
      start();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex items-start gap-3 mb-5">
        <div className="w-9.5 h-9.5 rounded-full bg-[#FBEAE7] flex items-center justify-center shrink-0 mt-0.5">
          <Vote size={20} className="text-[#B23A2E]" strokeWidth={2.25} />
        </div>
        <div>
          <div className="font-mono text-[11px] tracking-wider uppercase text-[#B23A2E] font-semibold mb-1">
            Student Voting Platform
          </div>
          <h1 className="text-xl font-semibold text-[#1B2A41] leading-tight">
            Verify Your Identity
          </h1>
          <p className="text-muted-foreground text-sm">
            Required once before you can vote.
          </p>
        </div>
      </div>

      {state.status === "idle" && (
        <Button
          type="submit"
          disabled={false}
          onClick={() => requestCamera()}
          size={"lg"}
          className="text-sm w-full font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          Start face verification
        </Button>
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
        <ResultApproved similarity={state.similarity} onNext={onNext} />
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
  return <p className="text-sm text-slate-500 text-center">{text}</p>;
}
