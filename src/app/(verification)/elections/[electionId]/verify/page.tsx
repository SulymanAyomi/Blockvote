"use client";
import {
  Info,
  Camera,
  ChevronLeft,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  HelpCircle,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Btn } from "@/components/btn";
import { ErrorState } from "@/features/error/error-state";
import { Stepper } from "@/components/stepper";
import { Card } from "@/components/ui/card";
import { useVotingContext } from "@/context/voting-context";
import { useElectionId } from "@/features/elections/hooks/use-get-election-id";
import {
  CameraCapture,
  CameraCaptureHandle,
} from "@/features/verification/components/verification/CameraCapture";
import { FaceGuideOverlay } from "@/features/verification/components/verification/FaceGuideOverlay";
import { useVerificationMachine } from "@/features/verification/hooks/useVerificationMachine";
import { H1, H2 } from "@/lib/helpers";
import { VerifyApiResponse } from "@/lib/verification/types";
import { cx } from "class-variance-authority";
import { useFaceVerification } from "@/features/elections/api/use-face-verification";
import {
  useGetVottingSession,
  useGetVottingSessionResponse,
} from "@/features/elections/api/use-get-election-verification";
import { Skel } from "@/components/skeleton-cards";
import { useDeleteVotingSession } from "@/features/elections/api/use-delete-voting-session";
import { ErrorCode } from "@/features/error/app-error";

function VerifyPage() {
  const electionId = useElectionId();
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

  const { votingSessionId, setSession } = useVotingContext();
  const { mutate, isPending } = useFaceVerification();
  const fetchSession = useGetVottingSession();
  const deleteSession = useDeleteVotingSession();

  const [stage, setStage] = useState(0);
  const [isExpired, setIsExpired] = useState(false);
  const [error, setError] = useState<ErrorCode | null | Error>(null);
  const lock = useRef(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  const cameraHandleRef = useRef<CameraCaptureHandle>(null);

  const cameraActive =
    state.status === "camera_live" ||
    state.status === "no_face" ||
    state.status === "face_detected";
  // Feed live detection results intogit  the state machine as they change.
  // const readyToCapture = faceDetected && centered;
  const readyToCapture = true;

  if (cameraActive) {
    const shouldBeFaceDetected = state.status === "face_detected";
    if (readyToCapture !== shouldBeFaceDetected) {
      faceStatusChanged(readyToCapture);
    }
  }
  async function fetchVoteSession() {
    fetchSession.mutate(
      {
        param: { electionId },
      },
      {
        onSuccess: (data: useGetVottingSessionResponse) => {
          if (data.data.status == "COMPLETED") {
            setError("ALREADY_VOTED");
            return;
          }
          if (data.data.status == "EXPIRED") {
            setError("SESSION_EXPIRED");
            setSession("");
            return;
          }
          if (data.success && data.data.voterSessionId) {
            setSession(data.data.voterSessionId);
            return;
          }
        },
        onError: (error) => {
          setError(error);
        },
      },
    );
  }

  async function deleteVoteSession() {
    deleteSession.mutate(electionId);
  }

  async function handleSubmit() {
    if (lock.current) return;
    lock.current = true;
    if (state.status !== "captured") return;
    submit();
    setStage(0);
    const t = setInterval(() => setStage((x) => Math.min(x + 1, 2)), 1100);
    try {
      mutate(
        {
          json: {
            imageBase64: state.imageDataUrl,
            votingSessionId: votingSessionId,
            electionId,
          },
        },
        {
          onSuccess: (data) => {
            const result = data.data as VerifyApiResponse;
            console.log("result ", result);
            dispatch({ type: "SERVER_RESULT", result });
          },
          onError: (err) => {
            console.log(err.message);
            const message = err.message;
            dispatch({ type: "SERVER_ERROR", message });
          },
        },
      );
    } catch (err) {
      dispatch({
        type: "SERVER_ERROR",
        message:
          err instanceof Error ? err.message : "Verification request failed.",
      });
    } finally {
      clearInterval(t);
      lock.current = false;
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

  useEffect(() => {
    if (votingSessionId) return;
    fetchVoteSession();
  }, [votingSessionId, setSession]);

  const steps = [
    "Checking your camera…",
    "Matching you to your student record…",
    "Finishing up…",
  ];

  const Tip = ({ children }: { children: any }) => (
    <li className="flex items-start gap-2.5">
      <Info
        size={18}
        aria-hidden="true"
        className="mt-0.5 shrink-0 text-blue-700"
      />
      <span>{children}</span>
    </li>
  );

  if (error) {
    let errorLoading = deleteSession.isPending;
    let onRetry = () =>
      error == "SESSION_EXPIRED"
        ? () => deleteSession.mutate(electionId)
        : () => {};
    const loading = deleteSession.isPending;
    const onRestart = () => deleteSession.mutate(electionId);
    return (
      <ErrorState
        error={error}
        id={electionId}
        onRestart={onRestart}
        isLoading={loading}
      />
    );
  }

  if (fetchSession.isPending) {
    return (
      <Card className="rounded-2xl p-8" role="status" aria-label="Loading">
        <Skel className="mx-auto h-24 w-24 rounded-full" />
        <Skel className="mx-auto mt-5 h-7 w-1/2" />
        <Skel className="mx-auto mt-4 h-4 w-4/5" />
      </Card>
    );
  }

  return (
    <div>
      <Stepper current={1} />
      <Card className="mx-auto max-w-xl rounded-2xl p-6 text-center md:p-8">
        {state.status === "idle" && (
          <>
            <div
              className={cx(
                FRAME,
                "border-dashed border-blue-300 bg-slate-100 text-slate-500",
              )}
            >
              <Camera size={64} aria-hidden="true" />
            </div>
            <h1 className={H1}>Verify Your Identity</h1>
            <p className="mt-2 text-slate-600">
              We need to confirm that you are an eligible student before you can
              vote.
            </p>
            <h2 className={cx(H2, "mt-6")}>Ready to verify</h2>
            <p className="mt-1 text-sm text-slate-600">
              Follow the instructions to complete identity verification.
            </p>
            <ul className="mx-auto mt-4 max-w-sm space-y-2 text-left text-sm text-slate-800">
              <Tip>Find a well-lit spot and face the light.</Tip>
              <Tip>Remove sunglasses, hats or face coverings.</Tip>
              <Tip>Hold your device at eye level and look straight ahead.</Tip>
            </ul>
            <p className="mt-4 text-sm text-slate-600">
              Your photo is used only to confirm it's you.
            </p>
            <div className="mt-6 space-y-2">
              <Btn
                size="lg"
                icon={Camera}
                onClick={() => requestCamera()}
                className="w-full"
              >
                Start Verification
              </Btn>
              <Btn
                variant="ghost"
                to={`/elections/${electionId}`}
                icon={ChevronLeft}
              >
                Back
              </Btn>
            </div>
          </>
        )}

        {state.status === "requesting_permission" && (
          <StatusMessage text="Requesting camera access…" />
        )}

        {state.status === "permission_denied" && (
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="text-sm text-rose-600">
              Camera access was denied ({state.reason}). Enable camera
              permissions for this site and try again.
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
          <div role="status" aria-live="polite">
            <div
              className={cx(FRAME, "border-blue-700 bg-blue-50 text-blue-700")}
            >
              <Loader2 size={64} className="animate-spin" aria-hidden="true" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-slate-900">
              Verifying your identity...
            </h1>
            <div
              className="mt-5 h-2.5 overflow-hidden rounded-full bg-slate-200"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(((stage + 1) / 3) * 100)}
              aria-label="Verification progress"
            >
              <div
                className="h-full rounded-full bg-blue-700 transition-all duration-500"
                style={{ width: `${((stage + 1) / 3) * 100}%` }}
              />
            </div>
            <p className="mt-3 text-slate-700">{steps[stage]}</p>
            <p className="mt-2 text-sm text-slate-600">
              This usually takes a few seconds. Please keep this page open.
            </p>
          </div>
        )}

        {state.status === "approved" && (
          <div role="status">
            <div
              className={cx(
                FRAME,
                "border-green-700 bg-green-50 text-green-700",
              )}
            >
              <CheckCircle2 size={72} aria-hidden="true" />
            </div>
            <h1 className="font-serif text-3xl font-bold text-slate-900">
              Identity verified
            </h1>
            <p className="mb-6 mt-2 text-slate-600">
              You can now continue to voting.
            </p>
            <Btn
              size="lg"
              to={`/elections/${electionId}/authorization`}
              className="w-full"
            >
              Continue to Voting
            </Btn>
          </div>
        )}

        {state.status === "rejected" && (
          <div role="alert">
            <div className={cx(FRAME, "border-red-600 bg-red-50 text-red-700")}>
              <AlertTriangle size={64} aria-hidden="true" />
            </div>
            <h1 className="font-serif text-3xl font-bold text-slate-900">
              Verification unsuccessful
            </h1>
            <p className="mt-2 text-slate-600">
              We couldn't confirm your identity this time. Nothing has been
              recorded against your account.
            </p>
            <ul className="mx-auto mt-4 max-w-sm space-y-2 text-left text-sm text-slate-800">
              <Tip>
                Move to a brighter place and remove anything covering your face.
              </Tip>
              <Tip>
                Look straight at the camera and keep still for a few seconds.
              </Tip>
              <Tip>
                Still stuck? Election Support can help you verify another way.
              </Tip>
            </ul>
            <div className="mt-6 space-y-2">
              <Btn
                size="lg"
                icon={RefreshCw}
                onClick={() => {
                  dispatch({ type: "RETRY" });
                }}
                className="w-full"
              >
                Try Again
              </Btn>
              <Btn
                variant="secondary"
                to="/help"
                icon={HelpCircle}
                className="w-full"
              >
                Get Help
              </Btn>
            </div>
          </div>
        )}

        {state.status === "error" && (
          // <div className="flex flex-col items-center gap-3 text-center">
          //   <p className="text-sm text-rose-600">{state.message}</p>
          //   <button
          //     onClick={() => dispatch({ type: "RETRY" })}
          //     className="rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
          //   >
          //     Retry
          //   </button>
          // </div>
          <ErrorState
            error={state.message}
            id={electionId}
            onRestart={() => dispatch({ type: "RETRY" })}
          />
        )}
      </Card>
    </div>
  );
}

const FRAME =
  "mx-auto mb-5 grid h-48 w-48 place-items-center rounded-full border-4";

export default VerifyPage;

function StatusMessage({ text }: { text: string }) {
  return <p className="text-sm text-slate-500 text-center">{text}</p>;
}
