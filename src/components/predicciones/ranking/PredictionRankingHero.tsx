import Link from "next/link";
import type { PredictionRankingController } from "@/hooks/usePredictionRanking";

/** Cabecera del ranking. Solo presentación. */
export default function PredictionRankingHero({
  resumen,
  filtroTexto,
}: Pick<PredictionRankingController, "resumen" | "filtroTexto">) {
  return (
    <section className="rounded-2xl border border-[#c9e3f1] bg-white p-6 md:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#2d98d4]">Comunidad Liga</p>
          <h1 className="mt-3 text-[clamp(2.6rem,7vw,5rem)] font-black uppercase leading-[.9] tracking-[-.045em] text-[#102f55]">
            Ranking de
            <span className="block text-[#2d98d4]">Predicciones</span>
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-6 text-[#607b90]">
            Marcador exacto suma 3 puntos. Ganador correcto suma 1 punto.
          </p>
          <p className="mt-3 text-xs font-black uppercase tracking-[0.16em] text-[#2d98d4]">{filtroTexto}</p>
          <Link
            href="/entretenimiento/predicciones"
            className="mt-5 inline-flex rounded-lg bg-[#102f55] px-4 py-3 text-xs font-black uppercase tracking-[0.12em] !text-white transition hover:bg-[#173f73]"
          >
            Volver a predicciones
          </Link>
        </div>

        <div className="grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-4 lg:w-[560px]">
          <Stat label="Participantes" value={resumen.participantes} />
          <Stat label="Predicciones" value={resumen.predicciones} />
          <Stat label="Resueltas" value={resumen.resueltas} />
          <Stat label="Exactos" value={resumen.exactos} />
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-[#d8e8f0] bg-[#f8fcfe] px-4 py-3">
      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#7d98aa]">{label}</p>
      <p className="mt-1 text-2xl font-black text-[#102f55]">{value}</p>
    </div>
  );
}
