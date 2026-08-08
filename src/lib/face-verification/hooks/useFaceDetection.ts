"use client";

import { useEffect, useRef, useState } from "react";

// Wraps @mediapipe/tasks-vision FaceLandmarker. Runs entirely client-side —
// no frames are sent anywhere until the user explicitly hits Capture.
//
// Install: npm install @mediapipe/tasks-vision

export interface FaceDetectionResult {
  faceDetected: boolean;
  centered: boolean;
}

const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";
const WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm";

// How close to center (as a fraction of frame width/height) a face must be.
const CENTER_TOLERANCE = 0.18;

export function useFaceDetection(
  videoRef: React.RefObject<HTMLVideoElement>,
  active: boolean
): FaceDetectionResult {
  const [result, setResult] = useState<FaceDetectionResult>({
    faceDetected: false,
    centered: false,
  });
  const rafRef = useRef<number | null>(null);
  const landmarkerRef = useRef<any>(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    if (!active) return;
    cancelledRef.current = false;

    let animationFrameId: number;

    async function init() {
      const { FaceLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");
      const filesetResolver = await FilesetResolver.forVisionTasks(WASM_URL);

      if (cancelledRef.current) return;

      landmarkerRef.current = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: { modelAssetPath: MODEL_URL, delegate: "GPU" },
        runningMode: "VIDEO",
        numFaces: 1,
      });

      const detect = () => {
        if (cancelledRef.current) return;
        const video = videoRef.current;
        const landmarker = landmarkerRef.current;

        if (video && landmarker && video.readyState >= 2) {
          const detection = landmarker.detectForVideo(video, performance.now());
          const landmarks = detection?.faceLandmarks?.[0];

          if (landmarks && landmarks.length > 0) {
            // Nose tip is landmark index 1 in the MediaPipe face mesh topology.
            const nose = landmarks[1];
            const dx = Math.abs(nose.x - 0.5);
            const dy = Math.abs(nose.y - 0.5);
            const centered = dx < CENTER_TOLERANCE && dy < CENTER_TOLERANCE;
            setResult({ faceDetected: true, centered });
          } else {
            setResult({ faceDetected: false, centered: false });
          }
        }

        animationFrameId = requestAnimationFrame(detect);
        rafRef.current = animationFrameId;
      };

      animationFrameId = requestAnimationFrame(detect);
      rafRef.current = animationFrameId;
    }

    init().catch((err) => {
      console.error("Face detection failed to initialize:", err);
      setResult({ faceDetected: false, centered: false });
    });

    return () => {
      cancelledRef.current = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      landmarkerRef.current?.close?.();
      landmarkerRef.current = null;
      setResult({ faceDetected: false, centered: false });
    };
  }, [active, videoRef]);

  return result;
}
