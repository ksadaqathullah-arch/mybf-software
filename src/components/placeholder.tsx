const tones = {
  blue: "bg-blue-deep text-paper",
  yellow: "bg-yellow text-ink",
  magenta: "bg-magenta text-paper",
  cyan: "bg-cyan text-ink",
  ink: "bg-ink text-paper",
  paper: "bg-paper-2 text-ink",
} as const;

export type PlaceholderTone = keyof typeof tones;

type PlaceholderProps = {
  label: string;
  ratio?: string;
  tone?: PlaceholderTone;
  labelTop?: boolean;
  className?: string;
};

export function Placeholder({
  label,
  ratio = "4/3",
  tone = "blue",
  labelTop = false,
  className = "",
}: PlaceholderProps) {
  return (
    <div
      role="img"
      aria-label={`Image placeholder: ${label}`}
      style={{ aspectRatio: ratio }}
      className={`relative flex w-full justify-between overflow-hidden p-5 ${
        labelTop ? "flex-col-reverse" : "flex-col"
      } ${tones[tone]} ${className}`}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.14] [background-image:repeating-linear-gradient(135deg,currentColor_0_1px,transparent_1px_14px)]"
      />
      <span className="relative font-display text-[0.65rem] font-bold tracking-[0.22em] uppercase opacity-80">
        Photo · {ratio.replace("/", ":")}
      </span>
      <span className="relative max-w-[18ch] font-display text-xl leading-tight font-extrabold tracking-tight sm:text-2xl">
        {label}
      </span>
    </div>
  );
}
