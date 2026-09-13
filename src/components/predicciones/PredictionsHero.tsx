import Link from "next/link";
import type { PrediccionesController } from "@/hooks/usePredicciones";

/** Cabecera visual de Predicciones. No contiene lógica de negocio. */
export default function PredictionsHero({ resumen }: Pick<PrediccionesController, "resumen">) {
  return (
    <section className="rounded-2xl border border-[#c9e3f1] bg-white p-6 md:p-8">
      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#2d98d4]">APA PSO ARGENTINA</p>
      <h1 className="mt-3 text-[clamp(2.6rem,7vw,5rem)] font-black uppercase leading-[.88] tracking-[-.045em] text-[#102f55]">
        <span className="block">Predicciones</span>
        <span className="mt-1 block text-[#2d98d4]">Marcador exacto</span>
      </h1>
      <p className="mt-5 max-w-2xl text-sm leading-6 text-[#607b90]">
        Pronosticá antes del inicio de cada partido. Ganador correcto suma 1 punto y marcador exacto suma 3.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Link
          href="/entretenimiento/predicciones/ranking"
          className="inline-flex items-center rounded-lg bg-[#102f55] px-5 py-3 text-xs font-black uppercase tracking-[0.12em] text-white transition hover:bg-[#173f73]"
        >
          Ver ranking de pronosticadores
        </Link>
        <span className="text-xs font-bold text-[#607b90]">Modo invitado · no hace falta iniciar sesión</span>
      </div>

      <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat label="Disponibles" value={resumen.disponibles} />
        <Stat label="Predicciones" value={resumen.predicciones} />
        <Stat label="Participantes" value={resumen.participantes} />
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-[#d8e8f0] bg-[#f8fcfe] px-4 py-3">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7d98aa]">{label}</p>
      <p className="mt-1 text-xl font-black text-[#102f55]">{value}</p>
    </div>
  );
}
