"use client";

type ContextoCompetencia = "liga" | "copa_clasificatoria" | "copa_argentina" | "copa_apa";

type Division = {
  nombre: string;
  label: string;
  icon: string;
  competicion?: ContextoCompetencia;
  division?: string;
  divisionDb?: string;
  grupo?: string;
  fase?: string;
  badge?: string;
};

type Props = {
  temporadas: string[];
  temporada: string;
  setTemporada: (value: string) => void;
  divisiones: Division[];
  division: string;
  setDivision: (value: string) => void;
};

type CompeticionConfig = {
  id: ContextoCompetencia;
  label: string;
  shortLabel: string;
  description: string;
};

const competiciones: CompeticionConfig[] = [
  {
    id: "liga",
    label: "Liga",
    shortLabel: "Liga",
    description: "Primera y Segunda División",
  },
  {
    id: "copa_clasificatoria",
    label: "Clasificación a Copas",
    shortLabel: "Clasificación",
    description: "Grupos A, B, C y D",
  },
  {
    id: "copa_argentina",
    label: "Copa Argentina",
    shortLabel: "Copa Argentina",
    description: "Fixture por fases",
  },
  {
    id: "copa_apa",
    label: "Copa APA",
    shortLabel: "Copa APA",
    description: "Fixture por fases",
  },
];

function prettyDetalle(item: Division) {
  if (item.competicion === "liga") {
    return item.badge || item.label.replace(/^Liga\s*·\s*/i, "");
  }

  if (item.competicion === "copa_clasificatoria") {
    return item.badge || (item.grupo ? `Grupo ${item.grupo}` : item.label);
  }

  if (item.competicion === "copa_argentina" || item.competicion === "copa_apa") {
    return item.badge || item.fase || item.label;
  }

  return item.badge || item.label;
}

function getCompeticionLabel(value?: string) {
  const config = competiciones.find((item) => item.id === value);
  return config?.label || "Competición";
}

export default function WorldCupExperience({
  temporadas,
  temporada,
  setTemporada,
  divisiones,
  division,
  setDivision,
}: Props) {
  const contextoActivo =
    divisiones.find((item) => item.nombre === division) || divisiones[0];

  const competicionActiva =
    contextoActivo?.competicion || ("liga" as ContextoCompetencia);

  const opcionesDetalle = divisiones.filter(
    (item) => (item.competicion || "liga") === competicionActiva,
  );

  function seleccionarCompeticion(competicion: ContextoCompetencia) {
    const primerContexto = divisiones.find(
      (item) => (item.competicion || "liga") === competicion,
    );

    if (primerContexto) setDivision(primerContexto.nombre);
  }

  return (
    <section className="relative overflow-hidden rounded-[32px] border border-sky-300/20 bg-[#020814] shadow-[0_24px_80px_rgba(0,0,0,.42)]">
      <img
        src="/themes/worldcup/backgrounds/Competicion.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-[62%_center]"
      />

      <div className="absolute inset-0 bg-gradient-to-r from-[#020814]/96 via-[#020814]/62 to-[#020814]/12" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#020814]/62" />

      <div className="relative z-10 min-h-[400px] p-5 sm:p-7 lg:p-8">
        <div className="max-w-[720px]">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/35 bg-black/35 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-amber-100 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
            Navegador oficial
          </div>

          <h2 className="mt-5 max-w-[620px] text-[clamp(2.1rem,5vw,3.7rem)] font-black uppercase italic leading-[0.92] tracking-[-0.055em] text-white drop-shadow-[0_8px_28px_rgba(0,0,0,.55)]">
            Seleccioná tu competición
          </h2>

          <p className="mt-5 max-w-[520px] text-sm leading-6 text-slate-200/90">
            Elegí temporada, competición y luego su división, grupo o fase para actualizar estadísticas, fixture, rankings y partido destacado.
          </p>

          <div className="mt-7 space-y-5">
            <div>
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                Temporada
              </p>

              <div className="flex flex-wrap gap-2">
                {temporadas.map((item) => {
                  const active = temporada === item;

                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setTemporada(item)}
                      className={[
                        "rounded-2xl border px-5 py-3 text-xs font-black uppercase tracking-[0.12em] transition",
                        active
                          ? "border-amber-200/60 bg-amber-200 text-[#06111f] shadow-[0_12px_30px_rgba(250,204,21,.18)]"
                          : "border-white/12 bg-black/35 text-white/80 hover:border-white/25 hover:bg-white/10",
                      ].join(" ")}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                Competición
              </p>

              <div className="grid max-w-[700px] grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {competiciones.map((item) => {
                  const active = competicionActiva === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => seleccionarCompeticion(item.id)}
                      className={[
                        "rounded-2xl border px-4 py-3 text-left transition",
                        active
                          ? "border-amber-200/60 bg-amber-200 text-[#06111f] shadow-[0_12px_30px_rgba(250,204,21,.18)]"
                          : "border-white/12 bg-black/35 text-white/80 hover:border-white/25 hover:bg-white/10",
                      ].join(" ")}
                    >
                      <span className="block text-xs font-black uppercase tracking-[0.12em]">
                        {item.shortLabel}
                      </span>
                      <span
                        className={[
                          "mt-1 block text-[10px] font-bold uppercase tracking-[0.12em]",
                          active ? "text-[#06111f]/65" : "text-slate-400",
                        ].join(" ")}
                      >
                        {item.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                {competicionActiva === "liga"
                  ? "División"
                  : competicionActiva === "copa_clasificatoria"
                    ? "Grupo"
                    : "Fase"}
              </p>

              <div className="grid max-w-[680px] grid-cols-2 gap-2 sm:grid-cols-4">
                {opcionesDetalle.map((item) => {
                  const active = division === item.nombre;

                  return (
                    <button
                      key={item.nombre}
                      type="button"
                      onClick={() => setDivision(item.nombre)}
                      className={[
                        "rounded-2xl border px-4 py-3 text-xs font-black uppercase tracking-[0.12em] transition",
                        active
                          ? "border-sky-200/70 bg-sky-300 text-[#06111f] shadow-[0_12px_30px_rgba(56,189,248,.20)]"
                          : "border-white/12 bg-black/35 text-white/80 hover:border-white/25 hover:bg-white/10",
                      ].join(" ")}
                    >
                      {prettyDetalle(item)}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-6 inline-flex max-w-full flex-wrap items-center gap-2 rounded-2xl border border-sky-300/15 bg-black/30 px-4 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-slate-300 backdrop-blur-md">
            <span className="text-amber-200">Selección actual:</span>
            <span>{temporada}</span>
            <span className="text-sky-300">/</span>
            <span>{getCompeticionLabel(competicionActiva)}</span>
            <span className="text-sky-300">/</span>
            <span>{prettyDetalle(contextoActivo)}</span>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 rounded-[32px] ring-1 ring-inset ring-white/10" />
    </section>
  );
}
