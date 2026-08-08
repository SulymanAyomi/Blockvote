"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

export interface CameraCaptureHandle {
  /** Grabs the current frame and returns a JPEG data URL. */
  captureFrame: () => string | null;
}

interface CameraCaptureProps {
  onPermissionGranted: () => void;
  onPermissionDenied: (reason: string) => void;
  /** Exposes the live <video> element so a sibling hook (useFaceDetection) can read frames. */
  videoRef: React.RefObject<HTMLVideoElement>;
  className?: string;
}

export const CameraCapture = forwardRef<CameraCaptureHandle, CameraCaptureProps>(
  function CameraCapture({ onPermissionGranted, onPermissionDenied, videoRef, className }, ref) {
    const streamRef = useRef<MediaStream | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
      let cancelled = false;

      async function start() {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
            audio: false,
          });

          if (cancelled) {
            // Component unmounted while permission dialog was open — clean up immediately.
            stream.getTracks().forEach((t) => t.stop());
            return;
          }

          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          onPermissionGranted();
        } catch (err) {
          if (cancelled) return;
          const reason =
            err instanceof DOMException ? err.message : "Camera access failed unexpectedly.";
          onPermissionDenied(reason);
        }
      }

      start();

      // Critical cleanup: stop every track so the camera light turns off,
      // whether the user navigates away, closes the tab, or the component
      // simply re-renders out of the tree.
      return () => {
        cancelled = true;
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useImperativeHandle(ref, () => ({
      captureFrame: () => {
        const video = videoRef.current;
        if (!video || video.readyState < 2) return null;

        const canvas = canvasRef.current ?? document.createElement("canvas");
        canvasRef.current = canvas;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext("2d");
        if (!ctx) return null;

        // Mirror the draw so the captured image matches what the user saw in the (mirrored) preview.
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        return canvas.toDataURL("image/jpeg", 0.92);
      },
    }));

    return (
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={className ?? "h-full w-full scale-x-[-1] object-cover"}
      />
    );
  }
);
