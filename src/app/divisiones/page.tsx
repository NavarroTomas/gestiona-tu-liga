"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import TablaDivision from "@/components/TablaDivision";
import { supabase } from "@/lib/supabase";

function normalizarDivision(division: string) {
  const valor = String(division || "").toLowerCase();
  if (valor.includes("primera")) return "primera";
  if (valor.includes("segunda")) return "segunda";
  return valor;
}

export default function DivisionesPage() {
  const [temporada, setTemporada] = useState("Temporada 4");
  const [division, setDivision] = useState("Primera");
  const [ultimosResultados, setUltimosResultados] = useState<any[]>([]);
  const [proximosPartidos, setProximosPartidos] = useState<any[]>([]);
  const [clubesInfo, setClubesInfo] = useState<any[]>([]);

  const temporadas = ["Temporada 4"];
  const divisiones = ["Primera", "Segunda"];

  useEffect(() => {
    cargarPartidos();
  }, [temporada, division]);

  function logoEquipo(nombre?: string) {
    if (!nombre) return null;

    const club = clubesInfo.find(
      (c) =>
        String(c.nombre || "").toLowerCase().trim() ===
        String(nombre || "").toLowerCase().trim(),
    );

    return club?.logo_url || null;
  }

  function EscudoMini({ nombre }: { nombre: string }) {
    const logo = logoEquipo(nombre);

    return (
      <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden">
        {logo ? (
          <img
            src={logo}
            alt={nombre}
            className="h-full w-full object-contain"
          />
        ) : (
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#e8f3fa] text-[8px] font-black text-[#55738f]">
            {nombre?.slice(0, 2).toUpperCase()}
          </span>
        )}
      </span>
    );
  }

  function textoFecha(partido: any) {
    if (partido?.dia) return String(partido.dia);
    if (!partido?.fecha) return "Próximo";

    const fecha = new Date(partido.fecha);
    if (Number.isNaN(fecha.getTime())) return String(partido.fecha);

    return new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "2-digit",
    }).format(fecha);
  }

  async function cargarPartidos() {
    const { data, error } = await supabase
      .from("partidos")
      .select(
        "id, partido_id, local, visitante, resultado, fecha, temporada, division, dia, hora",
      )
      .eq("temporada", temporada)
      .order("id", { ascending: true });

    if (error) {
      console.log(error);
      setUltimosResultados([]);
      setProximosPartidos([]);
      return;
    }

    const divisionKey = normalizarDivision(division);
    const partidosDivision = (data || []).filter(
      (p: any) => normalizarDivision(p.division) === divisionKey,
    );

    const jugados = partidosDivision
      .filter((p: any) => String(p.resultado || "").trim() !== "")
      .slice(-5)
      .reverse();

    const pendientes = partidosDivision
      .filter((p: any) => String(p.resultado || "").trim() === "")
      .slice(0, 5);

    setUltimosResultados(jugados);
    setProximosPartidos(pendientes);

    const nombresEquipos = Array.from(
      new Set(
        [...jugados, ...pendientes]
          .flatMap((p: any) => [p.local, p.visitante])
          .filter(Boolean),
      ),
    );

    if (nombresEquipos.length === 0) {
      setClubesInfo([]);
      return;
    }

    const { data: clubesData, error: clubesError } = await supabase
      .from("clubes_info")
      .select("nombre, logo_url")
      .in("nombre", nombresEquipos);

    if (clubesError) console.log(clubesError);
    setClubesInfo(clubesData || []);
  }

  return (
    <main className="min-h-screen bg-[#f4f9fd] text-[#102f55]">
      <section className="relative min-h-[190px] overflow-hidden border-b border-[#c9e3f1]">
        <img
          src="/themes/worldcup/backgrounds/FotoCancha.png"
          alt="Cancha de Pro Soccer Online"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(244,249,253,.72)_0%,rgba(236,247,253,.58)_30%,rgba(205,235,250,.38)_58%,rgba(86,175,226,.18)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,.08),rgba(255,255,255,.02))]" />

        <div className="relative z-10 mx-auto flex min-h-[190px] w-full max-w-[1480px] items-center gap-8 px-5 py-8 sm:px-8 lg:px-12">
          <div className="min-w-0">
            <h1 className="m-0 text-[clamp(34px,4vw,64px)] font-black uppercase leading-[.92] tracking-[-.055em] text-[#102f55]">
              Torneo de Liga APA
            </h1>
            <p className="mt-4 text-[clamp(15px,1.45vw,22px)] font-semibold text-[#214b77]">
              {division} División · {temporada}
            </p>
          </div>
        </div>
      </section>

      <div className="border-b border-[#d7e6f0] bg-white/95">
        <nav
          className="mx-auto flex w-full max-w-[1480px] items-end gap-7 overflow-x-auto px-5 sm:px-8 lg:px-12"
          aria-label="Secciones de Liga"
        >
          <Link
            href="/divisiones"
            className="whitespace-nowrap border-b-[3px] border-transparent px-1 py-4 text-sm font-bold text-[#5c7693] transition hover:text-[#102f55]"
          >
            Resumen
          </Link>
          <Link
            href="/divisiones"
            className="whitespace-nowrap border-b-[3px] border-[#56afe2] px-1 py-4 text-sm font-black text-[#102f55]"
          >
            Tabla
          </Link>
          <Link
            href="/fixture"
            className="whitespace-nowrap border-b-[3px] border-transparent px-1 py-4 text-sm font-bold text-[#5c7693] transition hover:text-[#102f55]"
          >
            Partidos
          </Link>
          <Link
            href="/estadisticas"
            className="whitespace-nowrap border-b-[3px] border-transparent px-1 py-4 text-sm font-bold text-[#5c7693] transition hover:text-[#102f55]"
          >
            Estadísticas
          </Link>
          <Link
            href="/clubes"
            className="whitespace-nowrap border-b-[3px] border-transparent px-1 py-4 text-sm font-bold text-[#5c7693] transition hover:text-[#102f55]"
          >
            Equipos
          </Link>
        </nav>
      </div>

      <section className="mx-auto w-full max-w-[1480px] px-5 py-6 sm:px-8 lg:px-12">
        <div className="flex flex-wrap items-center gap-3 pb-5">
          <label className="relative">
            <span className="sr-only">Temporada</span>
            <select
              value={temporada}
              onChange={(e) => setTemporada(e.target.value)}
              className="h-11 min-w-[170px] cursor-pointer rounded-lg border border-[#c9deec] bg-[#edf6fc] px-4 pr-10 text-sm font-bold text-[#173e68] outline-none transition focus:border-[#56afe2]"
            >
              {temporadas.map((temp) => (
                <option key={temp} value={temp}>
                  {temp}
                </option>
              ))}
            </select>
          </label>

          <label className="relative">
            <span className="sr-only">División</span>
            <select
              value={division}
              onChange={(e) => setDivision(e.target.value)}
              className="h-11 min-w-[190px] cursor-pointer rounded-lg border border-[#c9deec] bg-[#edf6fc] px-4 pr-10 text-sm font-bold text-[#173e68] outline-none transition focus:border-[#56afe2]"
            >
              {divisiones.map((div) => (
                <option key={div} value={div}>
                  {div} División
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-1 gap-7 xl:grid-cols-[minmax(0,1fr)_390px]">
          <section className="min-w-0">
            <div className="mb-3 flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[.2em] text-[#6c88a2]">
                  Clasificación
                </p>
                <h2 className="mt-1 text-[clamp(21px,2vw,30px)] font-black uppercase tracking-[-.035em] text-[#102f55]">
                  Tabla de posiciones
                </h2>
              </div>

              <span className="hidden text-xs font-bold text-[#708ba4] sm:block">
                {division} División · {temporada}
              </span>
            </div>

            <TablaDivision temporada={temporada} division={division} />
          </section>

          <aside className="space-y-4">
            <section className="overflow-hidden rounded-[14px] border border-[#d8e7f0] bg-white">
              <header className="flex items-center justify-between border-b border-[#e1edf4] bg-[#f8fbfd] px-5 py-4">
                <h3 className="text-[17px] font-black uppercase tracking-[-.025em] text-[#102f55]">
                  Próxima fecha
                </h3>
                <Link
                  href="/fixture"
                  className="text-[11px] font-bold text-[#5d7893] transition hover:text-[#2498d8]"
                >
                  Ver fixture →
                </Link>
              </header>

              <div className="px-4">
                {proximosPartidos.length === 0 ? (
                  <p className="py-8 text-center text-sm text-[#7890a7]">
                    No hay próximos partidos cargados.
                  </p>
                ) : (
                  proximosPartidos.map((partido) => (
                    <Link
                      key={partido.id}
                      href="/fixture"
                      className="grid grid-cols-[58px_minmax(0,1fr)_30px_minmax(0,1fr)] items-center gap-2 border-b border-[#e7eff5] py-3.5 last:border-b-0"
                    >
                      <div className="text-[10px] font-bold leading-4 text-[#64809a]">
                        <span className="block">{textoFecha(partido)}</span>
                        <span className="block text-[#8ca0b3]">
                          {partido.hora || "—"}
                        </span>
                      </div>

                      <div className="flex min-w-0 items-center gap-2">
                        <EscudoMini nombre={partido.local} />
                        <span className="truncate text-[11px] font-bold text-[#173e68]">
                          {partido.local}
                        </span>
                      </div>

                      <span className="text-center text-[10px] font-black text-[#668099]">
                        vs
                      </span>

                      <div className="flex min-w-0 items-center justify-end gap-2">
                        <span className="truncate text-right text-[11px] font-bold text-[#173e68]">
                          {partido.visitante}
                        </span>
                        <EscudoMini nombre={partido.visitante} />
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </section>

            <section className="overflow-hidden rounded-[14px] border border-[#d8e7f0] bg-white">
              <header className="flex items-center justify-between border-b border-[#e1edf4] bg-[#f8fbfd] px-5 py-4">
                <h3 className="text-[17px] font-black uppercase tracking-[-.025em] text-[#102f55]">
                  Últimos resultados
                </h3>
                <Link
                  href="/estadisticas"
                  className="text-[11px] font-bold text-[#5d7893] transition hover:text-[#2498d8]"
                >
                  Ver todos →
                </Link>
              </header>

              <div className="px-4">
                {ultimosResultados.length === 0 ? (
                  <p className="py-8 text-center text-sm text-[#7890a7]">
                    No hay resultados cargados.
                  </p>
                ) : (
                  ultimosResultados.map((partido) => (
                    <Link
                      key={partido.id}
                      href={
                        partido.partido_id
                          ? `/estadisticas/${encodeURIComponent(partido.partido_id)}`
                          : "/estadisticas"
                      }
                      className="grid grid-cols-[46px_minmax(0,1fr)_54px_minmax(0,1fr)] items-center gap-2 border-b border-[#e7eff5] py-3.5 last:border-b-0"
                    >
                      <span className="text-[10px] font-bold text-[#7890a7]">
                        {textoFecha(partido)}
                      </span>

                      <div className="flex min-w-0 items-center gap-2">
                        <EscudoMini nombre={partido.local} />
                        <span className="truncate text-[11px] font-bold text-[#173e68]">
                          {partido.local}
                        </span>
                      </div>

                      <strong className="text-center text-[15px] font-black text-[#102f55]">
                        {partido.resultado}
                      </strong>

                      <div className="flex min-w-0 items-center justify-end gap-2">
                        <span className="truncate text-right text-[11px] font-bold text-[#173e68]">
                          {partido.visitante}
                        </span>
                        <EscudoMini nombre={partido.visitante} />
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
