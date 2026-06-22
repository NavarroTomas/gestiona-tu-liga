type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
};

export default function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  className = "",
}: Props) {
  const isCenter = align === "center";

  return (
    <div className={`${isCenter ? "mx-auto text-center" : ""} max-w-3xl ${className}`}>
      {eyebrow ? (
        <p
          className={`mb-4 inline-flex items-center gap-3 rounded-full border border-amber-200/25 bg-white/[0.06] px-4 py-2 text-[11px] font-black uppercase tracking-[0.28em] text-amber-200 shadow-[0_12px_36px_rgba(0,0,0,.2)] backdrop-blur ${
            isCenter ? "mx-auto" : ""
          }`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-amber-200" />
          {eyebrow}
        </p>
      ) : null}

      <h2 className="text-balance text-4xl font-black uppercase leading-[0.92] tracking-[-0.045em] text-white md:text-6xl">
        {title}
      </h2>

      {description ? (
        <p className="mt-5 text-pretty text-base leading-8 text-slate-300 md:text-lg">
          {description}
        </p>
      ) : null}
    </div>
  );
}
