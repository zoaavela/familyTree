export function BranchPattern({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 800 200"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
    >
      <g stroke="var(--color-border)" strokeWidth="1">
        <path d="M60 200V140C60 120 80 120 80 100" />
        <path d="M80 100C80 80 100 80 100 60" />
        <path d="M80 100C80 80 60 80 60 60" />
        <path d="M220 200V150C220 130 245 130 245 105" />
        <path d="M245 105C245 85 270 85 270 60" />
        <path d="M245 105C245 85 220 85 220 60" />
        <path d="M420 200V130C420 105 450 105 450 75" />
        <path d="M450 75C450 50 480 50 480 20" />
        <path d="M450 75C450 50 420 50 420 20" />
        <path d="M600 200V145C600 122 628 122 628 95" />
        <path d="M628 95C628 72 655 72 655 45" />
        <path d="M628 95C628 72 600 72 600 45" />
        <path d="M740 200V155C740 133 760 133 760 108" />
      </g>
      <g fill="var(--color-border-strong)">
        <circle cx="60" cy="60" r="2.5" />
        <circle cx="100" cy="60" r="2.5" />
        <circle cx="220" cy="60" r="2.5" />
        <circle cx="270" cy="60" r="2.5" />
        <circle cx="420" cy="20" r="2.5" />
        <circle cx="480" cy="20" r="2.5" />
        <circle cx="600" cy="45" r="2.5" />
        <circle cx="655" cy="45" r="2.5" />
        <circle cx="760" cy="108" r="2.5" />
      </g>
    </svg>
  );
}
