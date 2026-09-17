import Link from "next/link";
import { awardIcon, awardLabel, type HomeAward } from "@/lib/homePortal";
import { DEFAULT_HOME_EDITOR_DOCUMENT, type HomeEditorDocument } from "@/lib/siteEditor";

type Props = {
  awards: HomeAward[];
  logoEquipo: (club: string) => string | null;
  editor?: HomeEditorDocument["awards"];
};

export default function HomeAwards({ awards, logoEquipo, editor = DEFAULT_HOME_EDITOR_DOCUMENT.awards }: Props) {
  const visible = awards.slice(0, 4);
  if (!visible.length) return null;

  return (
    <section
      className="relative overflow-hidden shadow-[0_18px_50px_rgba(11,39,71,.16)]"
      style={{
        background: editor.background,
        color: editor.textColor,
        borderRadius: editor.radius.desktop,
        padding: editor.padding.desktop,
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(36,95,142,.65),transparent_26%),linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px)] [background-size:auto,72px_72px]" />
      <div className="relative z-10">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/55">{editor.eyebrow}</p>
            <h2 className="mt-1 text-3xl font-black uppercase">{editor.title}</h2>
          </div>
          <Link href="/historia" className="text-xs font-black text-white/75">{editor.linkLabel}</Link>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {visible.map((award, index) => {
            const logo = award.equipo ? logoEquipo(award.equipo) : null;
            return (
              <article
                key={award.id}
                className="relative overflow-hidden border border-white/10 bg-white/[0.07] backdrop-blur-sm"
                style={{
                  borderRadius: editor.cardRadius,
                  padding: editor.cardPadding,
                  minHeight: editor.cardMinHeight || undefined,
                }}
              >
                <div className="absolute right-3 top-2 text-7xl font-black text-white/[0.04]">{String(index + 1).padStart(2, "0")}</div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-2xl font-black text-white/85">{awardIcon(award.premio)}</span>
                  <span className="text-[9px] font-black uppercase tracking-[0.16em] text-white/45">APA</span>
                </div>
                <p className="mt-8 text-[10px] font-black uppercase tracking-[0.16em] text-white/55">{awardLabel(award.premio)}</p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white">
                    {logo ? <img src={logo} alt="" className="h-10 w-10 object-contain" /> : <span className="text-xl font-black text-[#123f69]">{awardIcon(award.premio)}</span>}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-black uppercase">{award.nombre}</h3>
                    <p className="truncate text-xs font-bold text-white/58">{award.equipo || "APA"}</p>
                  </div>
                </div>
                {award.puntos != null ? <p className="mt-4 border-t border-white/10 pt-3 text-xs font-black text-white/80">{Number(award.puntos).toFixed(1)} pts</p> : null}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
