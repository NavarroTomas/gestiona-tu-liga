"use client";

import Link from "next/link";

const FEATURED_MATCH_BG = "/themes/worldcup/backgrounds/Tunel.png";

type Props = {
  partido: any;
  temporada: string;
  division?: string;
  divisionLabel?: string;
  competicion?: string;
  competicionLabel?: string;
  grupo?: string;
  fase?: string;
  logoEquipo: (nombre?: string) => string | null;
  EscudoEquipo: any;
};

function getCompeticionLabel(partido: any, fallback?: string) {
  const value = String(partido?.competicion || fallback || "liga").toLowerCase();

  if (value === "liga") return "Torneo de Liga";
  if (value === "copa_clasificatoria") return "Clasificación a Copas";
  if (value === "copa_argentina") return "Copa Argentina";
  if (value === "copa_apa") return "Copa de la Liga";

  return fallback || "Competición oficial";
}

function getContextLabel(partido: any, divisionLabel?: string, grupo?: string, fase?: string) {
  const competicion = String(partido?.competicion || "").toLowerCase();

  if (competicion === "copa_clasificatoria" || partido?.grupo || grupo) {
    return `Grupo ${String(partido?.grupo || grupo || "").replace(/^grupo\s+/i, "")}`.trim();
  }

  if (competicion === "copa_argentina" || competicion === "copa_apa" || partido?.fase || fase) {
    return String(partido?.fase || fase || "Fase");
  }

  return divisionLabel || partido?.division || "División";
}

function fixtureHref(partido: any, temporada: string, division?: string) {
  const competicion = String(partido?.competicion || "liga").toLowerCase();
  const params = new URLSearchParams();
  params.set("temporada", temporada);

  if (competicion === "liga") {
    const div = String(partido?.division || division || "primera").toLowerCase();
    return `/fixture/${div}?${params.toString()}`;
  }

  params.set("competicion", competicion);
  if (partido?.grupo) params.set("grupo", String(partido.grupo));
  if (partido?.fase) params.set("fase", String(partido.fase));

  return `/fixture?${params.toString()}`;
}

export default function FeaturedMatch({
  partido,
  temporada,
  division,
  divisionLabel,
  competicionLabel,
  grupo,
  fase,
  logoEquipo,
  EscudoEquipo,
}: Props) {
  const estado = !partido ? "Sin partido" : partido.resultado ? "Finalizado" : "Programado";
  const competition = getCompeticionLabel(partido, competicionLabel);
  const context = getContextLabel(partido, divisionLabel, grupo, fase);
  const verPartidoHref = partido ? fixtureHref(partido, temporada, division) : `/fixture?temporada=${encodeURIComponent(temporada)}`;
  const allFixtureHref = `/fixture?temporada=${encodeURIComponent(temporada)}`;

  return (
    <section className="relative min-h-[560px] overflow-hidden rounded-[30px] border border-sky-300/20 bg-[#020814] shadow-[0_24px_80px_rgba(0,0,0,.42)] md:min-h-[640px]">
      <img
        src={FEATURED_MATCH_BG}
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center"
      />

      <div className="absolute inset-0 bg-gradient-to-r from-[#020814]/90 via-[#020814]/28 to-[#020814]/18" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#020814]/10 via-transparent to-[#020814]/68" />
      <div className="absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-t from-[#020814]/88 via-[#020814]/24 to-transparent" />

      <div className="relative z-10 flex min-h-[560px] flex-col p-5 md:min-h-[640px] md:p-8">
        <div className="flex flex-wrap gap-2">
          <Badge>{competition}</Badge>
          <Badge>{context}</Badge>
          <Badge>Fecha {partido?.fecha || "sin cargar"}</Badge>
          <Badge>{estado}</Badge>
        </div>

        <h2 className="mt-5 max-w-[620px] text-[clamp(2.4rem,5vw,4.8rem)] font-black uppercase italic leading-[0.9] tracking-[-0.065em] text-white drop-shadow-[0_12px_35px_rgba(0,0,0,.78)]">
          La noche del partido
        </h2>

        {partido ? (
          <div className="mt-auto pb-16 md:pb-20">
            <div className="grid items-center gap-4 md:grid-cols-[minmax(0,1fr)_150px_minmax(0,1fr)] md:gap-7">
              <TeamCard
                side="Local"
                name={partido.local}
                logo={logoEquipo(partido.local)}
                EscudoEquipo={EscudoEquipo}
                align="left"
              />

              <div className="order-2 flex justify-center md:order-none md:translate-y-[-10px]">
                <div className="flex h-[104px] w-[124px] flex-col items-center justify-center rounded-[28px] border border-sky-300/18 bg-[#020814]/72 text-center backdrop-blur-md shadow-[0_20px_55px_rgba(0,0,0,.45)]">
                  <p className="text-[10px] font-black uppercase tracking-[0.28em] text-sky-200/80">
                    Partido
                  </p>
                  <div className="mt-1 translate-x-[2px] text-[clamp(2rem,4.2vw,3.35rem)] font-black not-italic leading-none tracking-[-0.035em] text-white drop-shadow-[0_10px_18px_rgba(0,0,0,.9)]">
                    {partido.resultado || "VS"}
                  </div>
                </div>
              </div>

              <TeamCard
                side="Visitante"
                name={partido.visitante}
                logo={logoEquipo(partido.visitante)}
                EscudoEquipo={EscudoEquipo}
                align="right"
              />
            </div>
          </div>
        ) : (
          <div className="mt-10 max-w-xl rounded-[26px] border border-white/12 bg-black/30 p-5 text-sm text-slate-300 backdrop-blur-md">
            No hay partidos cargados para este contexto.
          </div>
        )}

        <div className="absolute bottom-5 left-5 right-5 z-20 flex flex-wrap items-center gap-3 md:bottom-7 md:left-8 md:right-8">
          <Meta>{partido?.dia || "Día sin cargar"}</Meta>
          <Meta>{partido?.hora || "Hora sin cargar"}</Meta>

          <div className="ml-0 flex flex-wrap gap-3 md:ml-auto">
            <Link
              href={verPartidoHref}
              className="rounded-full border border-[#B88A1B]/70 bg-[#C9981A] px-6 py-3 text-xs font-black uppercase tracking-[0.14em] text-white transition-all duration-300 hover:border-[#E2BE5A] hover:bg-[#D4A017]"
            >
              Ver partido →
            </Link>

            <Link
              href={allFixtureHref}
              className="rounded-full border border-white/15 bg-white/[0.07] px-6 py-3 text-xs font-black uppercase tracking-[0.14em] text-white backdrop-blur-md transition hover:bg-white/[0.12]"
            >
              Ver fixture
            </Link>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 rounded-[30px] ring-1 ring-inset ring-white/10" />
    </section>
  );
}

function TeamCard({
  side,
  name,
  logo,
  EscudoEquipo,
  align,
}: {
  side: string;
  name: string;
  logo: string | null;
  EscudoEquipo: any;
  align: "left" | "right";
}) {
  const isRight = align === "right";

  return (
    <div
      className={[
        "relative overflow-hidden rounded-[28px] border border-white/12 bg-[#020814]/54 p-4 backdrop-blur-md shadow-[0_24px_70px_rgba(0,0,0,.45)] md:p-5 md:min-h-[136px]",
        isRight ? "md:text-right" : "md:text-left",
      ].join(" ")}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-sky-300/[0.08] via-transparent to-yellow-300/[0.05]" />
      <div className="relative z-10 flex items-center gap-4 md:gap-5">
        {!isRight && <Shield name={name} logo={logo} EscudoEquipo={EscudoEquipo} />}

        <div className="min-w-0 flex-1">
          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.24em] text-amber-200/85">
            {side}
          </p>

          <h3 className="max-w-full break-words text-[clamp(1.35rem,2.75vw,2.7rem)] font-black uppercase italic leading-[0.88] tracking-[-0.055em] text-white drop-shadow-[0_8px_16px_rgba(0,0,0,.85)]">
            {name}
          </h3>

          <div className={["mt-3 h-1 w-24 rounded-full bg-amber-200/80 shadow-[0_0_18px_rgba(250,204,21,.25)]", isRight ? "md:ml-auto" : ""].join(" ")} />
        </div>

        {isRight && <Shield name={name} logo={logo} EscudoEquipo={EscudoEquipo} />}
      </div>
    </div>
  );
}

function Shield({ name, logo, EscudoEquipo }: any) {
  return (
    <div className="flex h-[70px] w-[70px] shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-black/30 p-2 shadow-[0_12px_30px_rgba(0,0,0,.45)] md:h-[92px] md:w-[92px]">
      <EscudoEquipo nombre={name} logo={logo} size="lg" />
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/15 bg-black/38 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-white/90 backdrop-blur-md">
      {children}
    </span>
  );
}

function Meta({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/12 bg-black/48 px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-white/85 backdrop-blur-md">
      {children}
    </span>
  );
}
