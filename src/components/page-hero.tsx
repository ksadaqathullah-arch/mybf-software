import { PhotoCycle } from "@/components/photo-cycle";
import { forumPhotos } from "@/lib/photos";

const themes = {
  blue: { section: "bg-blue text-paper", strip: "bg-ink text-paper", tone: "on-dark" },
  magenta: { section: "bg-magenta text-paper", strip: "bg-ink text-paper", tone: "on-dark" },
  cyan: { section: "bg-cyan text-ink", strip: "bg-ink text-paper", tone: "on-light" },
  yellow: { section: "bg-yellow text-ink", strip: "bg-ink text-paper", tone: "on-light" },
} as const;

type PageHeroProps = {
  index: string;
  eyebrow: string;
  title: string;
  lead: string;
  theme: keyof typeof themes;
  imageLabel: string;
  photoStart?: number;
  strip: readonly string[];
  children?: React.ReactNode;
};

export function PageHero({
  index,
  eyebrow,
  title,
  lead,
  theme,
  imageLabel,
  photoStart = 0,
  strip,
  children,
}: PageHeroProps) {
  const colors = themes[theme];
  const loop = [...strip, ...strip];

  return (
    <section className={`${colors.section} max-sm:overflow-x-clip`}>
      <div className="mx-auto grid max-w-[1440px] items-center gap-10 px-5 pt-10 pb-14 sm:px-8 lg:grid-cols-12 lg:gap-12 lg:pt-14 lg:pb-16 max-sm:gap-8 max-sm:pt-8 max-sm:pb-12">
        <div className="lg:col-span-7">
          <p className="flex items-center gap-3 font-display text-[0.72rem] font-bold tracking-[0.22em] uppercase">
            <span>{index}</span>
            <span aria-hidden="true" className="h-px w-10 bg-current opacity-50" />
            <span>{eyebrow}</span>
          </p>
          <h1 className="mt-6 max-w-[13ch] text-5xl sm:text-7xl lg:text-[5.4rem] max-sm:text-[2.6rem]">{title}</h1>
          <p className="mt-6 max-w-lg text-xl leading-snug opacity-90 sm:text-2xl max-sm:text-lg">{lead}</p>
          {children ? (
            <div className="mt-8 flex flex-wrap gap-3 max-sm:flex-col max-sm:[&>a]:w-full max-sm:[&>a]:justify-center">{children}</div>
          ) : null}
        </div>
        <div className="lg:col-span-5">
          <PhotoCycle
            slides={forumPhotos}
            start={photoStart}
            label={imageLabel}
            tone={colors.tone}
            shadow="12px 12px 0 #14161c"
            sizes="(max-width: 1024px) 100vw, 40vw"
            priority
          />
        </div>
      </div>

      <div className={`overflow-hidden border-y border-black/30 ${colors.strip}`}>
        <ul aria-hidden="true" className="marquee-track flex w-max py-3">
          {loop.map((word, i) => (
            <li
              key={`${word}-${i}`}
              className="flex items-center gap-6 px-6 font-display text-sm font-bold tracking-[0.18em] whitespace-nowrap uppercase"
            >
              {word}
              <span className="size-1.5 rotate-45 bg-yellow" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
