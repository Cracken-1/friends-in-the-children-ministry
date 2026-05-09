import type { ReactNode } from "react";

type PageHeroProps = {
  eyebrow?: string;
  title: string;
  description: string;
  badges?: ReadonlyArray<{ icon?: ReactNode; label: string }>;
};

export function PageHero({ eyebrow, title, description, badges = [] }: PageHeroProps) {
  return (
    <section className="blue-hero overflow-hidden py-14 text-white">
      <div className="page-shell relative">
        <div className="max-w-4xl">
          {eyebrow ? (
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/85">{eyebrow}</p>
          ) : null}
          <h1 className="text-4xl font-semibold leading-tight text-white md:text-5xl">{title}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-white/90">{description}</p>
        </div>
        {badges.length ? (
          <div className="mt-8 flex flex-wrap gap-3">
            {badges.map((badge) => (
              <div
                key={badge.label}
                className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur"
              >
                {badge.icon}
                <span>{badge.label}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
