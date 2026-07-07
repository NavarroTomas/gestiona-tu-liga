"use client";

type Competicion = "liga" | "copa_clasificatoria" | "copa_argentina" | "copa_apa" | "copa_campeones";

type Props = {
  competicion: Competicion;
  subcategoria: string;
  onChange: (competicion: Competicion, subcategoria: string) => void;
};

const competiciones: { id: Competicion; label: string; accent: string }[] = [
  { id: "liga", label: "Liga", accent: "text-sky-300" },
  { id: "copa_clasificatoria", label: "Clasificación a Copas", accent: "text-yellow-300" },
  { id: "copa_argentina", label: "Copa Argentina", accent: "text-yellow-300" },
  { id: "copa_apa", label: "Copa APA", accent: "text-cyan-300" },
  { id: "copa_campeones", label: "Copa de Campeones", accent: "text-cyan-200" },
];

const opciones: Record<Competicion, { id: string; label: string }[]> = {
  liga: [
    { id: "primera", label: "Primera" },
    { id: "segunda", label: "Segunda" },
  ],
  copa_clasificatoria: [
    { id: "A", label: "Grupo A" },
    { id: "B", label: "Grupo B" },
    { id: "C", label: "Grupo C" },
    { id: "D", label: "Grupo D" },
  ],
  copa_argentina: [
    { id: "octavos", label: "Octavos" },
    { id: "cuartos", label: "Cuartos" },
    { id: "semifinal", label: "Semifinal" },
    { id: "final", label: "Final" },
  ],
  copa_apa: [
    { id: "octavos", label: "Octavos" },
    { id: "cuartos", label: "Cuartos" },
    { id: "semifinal", label: "Semifinal" },
    { id: "final", label: "Final" },
  ],
  copa_campeones: [
    { id: "semifinal", label: "Semifinal" },
    { id: "final", label: "Final" },
  ],
};

function defaultSubcategoria(competicion: Competicion) {
  return opciones[competicion][0]?.id || "";
}

export default function CompetitionSelector({ competicion, subcategoria, onChange }: Props) {
  const opcionesActuales = opciones[competicion] || [];

  return (
    <div className="grid gap-7">
      <div>
        <p className="mb-4 text-xs font-black uppercase tracking-[0.3em] text-yellow-300">
          Competición
        </p>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          {competiciones.map((item) => {
            const active = competicion === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChange(item.id, defaultSubcategoria(item.id))}
                className={`rounded-2xl border px-4 py-4 text-sm font-black uppercase transition-all ${
                  active
                    ? "border-yellow-300 bg-gradient-to-r from-yellow-400 to-amber-600 text-black shadow-[0_0_20px_rgba(250,204,21,.35)]"
                    : "border-sky-500/20 bg-black/35 text-zinc-400 hover:border-sky-400/40 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-4 text-xs font-black uppercase tracking-[0.3em] text-sky-300">
          {competicion === "liga"
            ? "División"
            : competicion === "copa_clasificatoria"
              ? "Grupo"
              : "Fase"}
        </p>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {opcionesActuales.map((item) => {
            const active = subcategoria === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChange(competicion, item.id)}
                className={`rounded-2xl border px-4 py-4 text-sm font-black uppercase transition-all ${
                  active
                    ? "border-sky-300 bg-gradient-to-b from-sky-400 to-blue-700 text-white shadow-[0_0_20px_rgba(56,189,248,.45)]"
                    : "border-sky-500/20 bg-black/35 text-zinc-400 hover:border-sky-400/40 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
