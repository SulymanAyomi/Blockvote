"use client";

interface FaceGuideOverlayProps {
  faceDetected: boolean;
}

// Pure presentational overlay — an SVG oval ring drawn over the video preview.
// Color communicates state: neutral while searching, green once centered.
export function FaceGuideOverlay({ faceDetected }: FaceGuideOverlayProps) {
  const ringColor = faceDetected ? "#22c55e" : "#e2e8f0";

  return (
    <svg
      viewBox="0 0 400 400"
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <ellipse
        cx="200"
        cy="200"
        rx="120"
        ry="150"
        fill="none"
        stroke={ringColor}
        strokeWidth={4}
        strokeDasharray={faceDetected ? undefined : "10 8"}
        className="transition-all duration-300"
      />
    </svg>
  );
}
