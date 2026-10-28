export function Logo({ className = "h-10 w-10" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 40 40"
      role="img"
      aria-label="Hartwell University crest"
    >
      <path
        d="M20 2 4 8v11c0 10 6.6 16.6 16 19 9.4-2.4 16-9 16-19V8L20 2Z"
        fill="#0f1f45"
      />
      <path
        d="M14 27V13m12 14V13M14 20h12"
        stroke="#fff"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
