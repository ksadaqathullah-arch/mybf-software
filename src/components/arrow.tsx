export function Arrow({ className = "size-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="square"
      aria-hidden="true"
      className={className}
    >
      <path d="M3 10h13M11 4.5 16.5 10 11 15.5" />
    </svg>
  );
}
