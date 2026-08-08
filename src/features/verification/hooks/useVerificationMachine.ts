import { useReducer, useCallback } from "react";
import type { CaptureState, CaptureEvent } from "@/lib/verification/types";

// Explicit finite state machine. Every transition below is intentional —
// resist the urge to add booleans elsewhere in the app to track "are we submitting" etc.
// If a new state is needed, add it to CaptureState/CaptureEvent in types.ts first.

function reducer(state: CaptureState, event: CaptureEvent): CaptureState {
  switch (event.type) {
    case "REQUEST_CAMERA":
      return { status: "requesting_permission" };

    case "CAMERA_GRANTED":
      return { status: "camera_live" };

    case "CAMERA_DENIED":
      return { status: "permission_denied", reason: event.reason };

    case "FACE_STATUS_CHANGED":
      // Only meaningful while the camera is live and we haven't captured yet.
      if (state.status !== "camera_live" && state.status !== "no_face" && state.status !== "face_detected") {
        return state;
      }
      return event.faceDetected ? { status: "face_detected" } : { status: "no_face" };

    case "CAPTURE":
      // Only allowed from face_detected — the UI should disable the button otherwise,
      // but the reducer enforces it too.
      if (state.status !== "face_detected") return state;
      return { status: "captured", imageDataUrl: event.imageDataUrl };

    case "RETAKE":
      return { status: "camera_live" };

    case "SUBMIT":
      if (state.status !== "captured") return state;
      return { status: "submitting" };

    case "SERVER_RESULT": {
      if (state.status !== "submitting") return state;
      const { result } = event;
      switch (result.status) {
        case "approved":
          return { status: "approved", similarity: result.similarity ?? 0 };
        case "manual_review":
          return { status: "manual_review", similarity: result.similarity ?? 0 };
        case "rejected":
          return { status: "rejected", reason: "low_similarity" };
        case "no_face_detected":
          return { status: "rejected", reason: "no_face_detected" };
        case "no_reference_photo":
          return { status: "manual_review", similarity: 0 };
      }
    }

    case "SERVER_ERROR":
      return { status: "error", message: event.message };

    case "RETRY":
      return { status: "idle" };

    default:
      return state;
  }
}

export function useVerificationMachine() {
  const [state, dispatch] = useReducer(reducer, { status: "idle" } as CaptureState);

  // Convenience wrappers so components don't construct event objects inline everywhere.
  const requestCamera = useCallback(() => dispatch({ type: "REQUEST_CAMERA" }), []);
  const cameraGranted = useCallback(() => dispatch({ type: "CAMERA_GRANTED" }), []);
  const cameraDenied = useCallback((reason: string) => dispatch({ type: "CAMERA_DENIED", reason }), []);
  const faceStatusChanged = useCallback(
    (faceDetected: boolean) => dispatch({ type: "FACE_STATUS_CHANGED", faceDetected }),
    []
  );
  const capture = useCallback((imageDataUrl: string) => dispatch({ type: "CAPTURE", imageDataUrl }), []);
  const retake = useCallback(() => dispatch({ type: "RETAKE" }), []);
  const submit = useCallback(() => dispatch({ type: "SUBMIT" }), []);
  const serverError = useCallback((message: string) => dispatch({ type: "SERVER_ERROR", message }), []);

  return {
    state,
    dispatch,
    requestCamera,
    cameraGranted,
    cameraDenied,
    faceStatusChanged,
    capture,
    retake,
    submit,
  };
}
