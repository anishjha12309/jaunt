interface LogoProps {
  className?: string
}

/** The Jaunt mark — a paper plane, matching the app's thin stroke-icon language. */
export function Logo({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className={className}>
      <path
        d="M14.5 1.5 7 8.5M14.5 1.5 10 14.5 7 8.5 1.5 6z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}
