"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function PartidoDetallePage() {
  const params = useParams();
  const id = params.id as string;

  const [partido, setPartido] = useState<any>(null);

  useEffect(() => {
    if (id) cargarPartido();
  }, [id]);

  async function cargarPartido() {
    const { data, error } = await supabase
      .from("partidos")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.log(error);
      return;
    }

    setPartido(data);
  }

  if (!partido) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        Cargando partido...
      </main>
    );
  }

  return (
    <main className="min-h-screen text-white bg-[radial-gradient(circle_at_top,#123a7a_0%,#081427_24%,#020714_55%,#000_100%)] px-4 py-10">
      <section className="max-w-[1100px] mx-auto rounded-[34px] border border-sky-500/40 bg-[#020714] p-6 md:p-10 shadow-[0_0_55px_rgba(0,120,255,.28)]">
        <p className="text-sky-300 uppercase tracking-[0.35em] text-xs font-black">
          Estadísticas del partido
        </p>

        <h1 className="mt-3 text-4xl md:text-6xl font-black uppercase">
          Partido #{partido.id}
        </h1>

        <div className="mt-8 grid grid-cols-[1fr_130px_1fr] items-center gap-4">
          <div className="rounded-3xl border border-sky-500/30 bg-black/35 p-5 text-center">
            <img
              src="/logo-apa.png"
              alt={partido.local}
              className="mx-auto h-20 w-20 rounded-full border border-sky-400/40 object-cover"
            />

            <h2 className="mt-4 text-xl font-black uppercase">
              {partido.local}
            </h2>
          </div>

          <div className="text-center">
            <p className="text-[11px] uppercase tracking-[0.25em] text-zinc-500 font-black">
              Resultado
            </p>

            <div className="mt-2 rounded-2xl border border-yellow-400/40 bg-yellow-400/10 px-4 py-5">
              <span className="text-4xl font-black text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,.65)]">
                {partido.resultado}
              </span>
            </div>
          </div>

          <div className="rounded-3xl border border-sky-500/30 bg-black/35 p-5 text-center">
            <img
              src="/logo-apa.png"
              alt={partido.visitante}
              className="mx-auto h-20 w-20 rounded-full border border-sky-400/40 object-cover"
            />

            <h2 className="mt-4 text-xl font-black uppercase">
              {partido.visitante}
            </h2>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-sky-500/25 bg-black/35 p-4">
            <p className="text-zinc-500 text-xs uppercase font-black">
              Temporada
            </p>
            <b className="text-sky-300">{partido.temporada || "Sin temporada"}</b>
          </div>

          <div className="rounded-2xl border border-sky-500/25 bg-black/35 p-4">
            <p className="text-zinc-500 text-xs uppercase font-black">
              División
            </p>
            <b className="text-sky-300">{partido.division || "Sin división"}</b>
          </div>

          <div className="rounded-2xl border border-sky-500/25 bg-black/35 p-4">
            <p className="text-zinc-500 text-xs uppercase font-black">
              Fecha
            </p>
            <b className="text-sky-300">{partido.fecha || "Sin fecha"}</b>
          </div>
        </div>
      </section>
    </main>
  );
}