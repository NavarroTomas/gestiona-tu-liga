import type { DreamTeamController } from "@/hooks/useDreamTeam";

export default function DreamTeamHero({
  fecha,
  usuarioId,
  miPerfil,
  temporada,
  competicionLabel,
  contextoLabel,
}: Pick<
  DreamTeamController,
  | "fecha"
  | "usuarioId"
  | "miPerfil"
  | "temporada"
  | "competicionLabel"
  | "contextoLabel"
>) {
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-sky-500/30 bg-[#020714] p-5 shadow-[0_0_55px_rgba(0,120,255,.22)] sm:rounded-[38px] md:p-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,.16),transparent_42%)]" />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/20" />

      <div className="relative z-10">
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-sky-400 sm:text-xs sm:tracking-[0.45em]">
          Liga PSO ARGENTINA
        </p>

        <h1 className="mt-4 text-[clamp(2.5rem,9vw,5rem)] font-black uppercase italic leading-none">
          <span className="block bg-gradient-to-b from-white via-zinc-300 to-zinc-600 bg-clip-text text-transparent">
            Dream Team
          </span>
          <span className="block text-yellow-300 drop-shadow-[0_0_18px_rgba(250,204,21,.55)]">
            Fecha {fecha}
          </span>
        </h1>

        <p className="mt-5 max-w-2xl text-zinc-400">
          Armá tu equipo ideal de la fecha. Elegí las 8 posiciones y enviá una sola
          plantilla antes de que empiece la siguiente fecha.
        </p>

        <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 md:gap-4">
          <HeroStat
            label="Votante"
            value={
              miPerfil?.display_name ||
              miPerfil?.username ||
              (usuarioId ? "Invitado" : "Modo invitado")
            }
          />
          <HeroStat label="Torneo" value={temporada} />
          <HeroStat label="Competición" value={competicionLabel} />
          <HeroStat label="Contexto" value={contextoLabel} />
        </div>
      </div>
    </section>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-sky-500/20 bg-black/35 px-5 py-4">
      <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">
        {label}
      </p>
      <p className="mt-1 truncate font-black text-sky-300">{value}</p>
    </div>
  );
}
