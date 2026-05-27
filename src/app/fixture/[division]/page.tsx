"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";

function Escudo({ nombre }: { nombre: string }) {
  return (
    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-950 border border-blue-300 flex items-center justify-center font-black text-sm shadow-[0_0_18px_rgba(0,140,255,.8)]">
      {nombre?.slice(0, 2).toUpperCase()}
    </div>
  );
}

export default function FixtureDivisionPage() {
  const params = useParams();
  const division = params.division as string;

  const [partidos, setPartidos] = useState<any[]>([]);
  const [fechaActiva, setFechaActiva] = useState("1");

  useEffect(() => {
    cargarPartidos();
  }, [division]);

  async function cargarPartidos() {
    const { data, error } = await supabase
      .from("partidos")
      .select("*")
      .eq("division", division)
      .order("fecha", { ascending: true });

    if (error) {
      console.log(error);
      return;
    }

    const partidosLimpios = data || [];
    setPartidos(partidosLimpios);

    const primeraFecha = partidosLimpios[0]?.fecha;
    if (primeraFecha) setFechaActiva(String(primeraFecha));
  }

  const fechas = Array.from(
    new Set(partidos.map((p) => String(p.fecha || "1")))
  ).sort((a, b) => Number(a) - Number(b));

  const partidosFecha = partidos.filter(
    (p) => String(p.fecha || "1") === fechaActiva
  );

  return (
    <main className="min-h-screen bg-[#020714] text-white px-6 py-8">
      <section className="max-w-[1250px] mx-auto">

        <Link
          href="/fixture"
          className="text-blue-300 font-black text-sm uppercase"
        >
          ← Volver a fixture
        </Link>

        <div className="flex items-center justify-between mt-8 mb-8">
          <div>
            <h1 className="text-5xl font-black uppercase">
              Fixture {division}
            </h1>
            <p className="text-blue-400 text-2xl font-black mt-2">
              Temporada 1
            </p>
          </div>

          <div className="w-28 h-28 rounded-3xl border border-blue-500 bg-blue-950 flex items-center justify-center text-center font-black text-2xl shadow-[0_0_25px_rgba(0,120,255,.6)]">
            APA<br />PSO
          </div>
        </div>

        <div className="flex gap-4 mb-10 overflow-x-auto pb-2">
          {fechas.map((f) => (
            <button
              key={f}
              onClick={() => setFechaActiva(f)}
              className={`min-w-[130px] px-6 py-4 rounded-xl border font-black ${
                fechaActiva === f
                  ? "bg-blue-600 border-blue-400 text-white shadow-[0_0_20px_rgba(0,120,255,.8)]"
                  : "bg-[#061226] border-blue-900 text-blue-200"
              }`}
            >
              FECHA {f}
            </button>
          ))}
        </div>

        <div className="rounded-3xl overflow-hidden border border-blue-500/70 bg-[#050b18] shadow-[0_0_35px_rgba(0,120,255,.35)]">

          <div className="flex items-center justify-between bg-gradient-to-r from-blue-900 via-blue-950 to-black px-8 py-5 border-b border-blue-500/50">
            <h2 className="text-4xl font-black text-blue-100">
              📅 FECHA {fechaActiva}
            </h2>

            <div className="bg-black/60 border border-blue-500/40 rounded-2xl px-6 py-3 text-right">
              <p className="text-blue-200 font-black">
                APA PSO
              </p>
              <p className="text-blue-400 text-sm">
                Argentina
              </p>
            </div>
          </div>

          <div className="p-5 space-y-2">
            {partidosFecha.length === 0 && (
              <div className="p-10 text-zinc-500">
                No hay partidos cargados para esta fecha.
              </div>
            )}

            {partidosFecha.map((p, index) => (
              <div
                key={index}
                className="grid grid-cols-[1fr_110px_1fr_150px] min-h-[82px] rounded-2xl overflow-hidden border border-blue-500/40 bg-gradient-to-r from-[#020814] via-[#071b36] to-[#020814]"
              >
                <div className="flex items-center justify-end gap-5 px-6">
                  <p className="text-2xl font-black uppercase text-right">
                    {p.local}
                  </p>
                  <Escudo nombre={p.local} />
                </div>

                <div className="bg-gradient-to-b from-blue-500 to-blue-900 flex items-center justify-center shadow-[0_0_25px_rgba(0,120,255,.9)]">
                  <p className="text-3xl font-black">
                    {p.resultado ? p.resultado : "VS"}
                  </p>
                </div>

                <div className="flex items-center gap-5 px-6">
                  <Escudo nombre={p.visitante} />
                  <p className="text-2xl font-black uppercase">
                    {p.visitante}
                  </p>
                </div>

                <div className="flex items-center justify-center bg-black/50 border-l border-blue-500/40">
                  <div className="text-center">
                    <p className="text-blue-200 font-black">
                      {p.dia || "SÁB"} {p.fecha || fechaActiva}
                    </p>
                    <p className="text-blue-400 font-black text-lg">
                      {p.hora || "21:00"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </section>
    </main>
  );
}