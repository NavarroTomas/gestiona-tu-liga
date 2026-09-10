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
      <span className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden sm:h-7 sm:w-7">
        {logo ? (
          <img src={logo} alt={nombre} className="h-full w-full object-contain" />
        ) : (
          <span className="flex h-6 w-6 items-center justify-center rounded bg-[#e8f3fa] text-[8px] font-black text-[#55738f] sm:h-7 sm:w-7">
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
      <section className="relative min-h-[170px] overflow-hidden border-b border-[#c9e3f1] sm:min-h-[190px]">
        <img
          src="/themes/worldcup/backgrounds/FotoCancha.png"
          alt="Cancha de Pro Soccer Online"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(244,249,253,.72)_0%,rgba(236,247,253,.58)_30%,rgba(205,235,250,.38)_58%,rgba(86,175,226,.18)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,.08),rgba(255,255,255,.02))]" />

        <div className="relative z-10 mx-auto flex min-h-[170px] w-full max-w-[1480px] items-center px-5 py-7 sm:min-h-[190px] sm:px-8 lg:px-12">
          <div className="min-w-0">
            <h1 className="m-0 text-[clamp(31px,4vw,64px)] font-black uppercase leading-[.92] tracking-[-.055em] text-[#102f55]">
              Torneo de Liga APA
            </h1>
            <p className="mt-3 text-[clamp(14px,1.45vw,22px)] font-semibold text-[#214b77] sm:mt-4">
              {division} División · {temporada}
            </p>
          </div>
        </div>
      </section>

      <div className="border-b border-[#d7e6f0] bg-white/95">
        <nav
          className="mx-auto flex w-full max-w-[1480px] items-end gap-6 overflow-x-auto px-5 sm:gap-7 sm:px-8 lg:px-12"
          aria-label="Secciones de Liga"
        >
          <Link href="/divisiones" className="whitespace-nowrap border-b-[3px] border-transparent px-1 py-3.5 text-[13px] font-bold text-[#5c7693] transition hover:text-[#102f55] sm:py-4 sm:text-sm">Resumen</Link>
          <Link href="/divisiones" className="whitespace-nowrap border-b-[3px] border-[#56afe2] px-1 py-3.5 text-[13px] font-black text-[#102f55] sm:py-4 sm:text-sm">Tabla</Link>
          <Link href="/fixture" className="whitespace-nowrap border-b-[3px] border-transparent px-1 py-3.5 text-[13px] font-bold text-[#5c7693] transition hover:text-[#102f55] sm:py-4 sm:text-sm">Partidos</Link>
          <Link href="/estadisticas" className="whitespace-nowrap border-b-[3px] border-transparent px-1 py-3.5 text-[13px] font-bold text-[#5c7693] transition hover:text-[#102f55] sm:py-4 sm:text-sm">Estadísticas</Link>
          <Link href="/clubes" className="whitespace-nowrap border-b-[3px] border-transparent px-1 py-3.5 text-[13px] font-bold text-[#5c7693] transition hover:text-[#102f55] sm:py-4 sm:text-sm">Equipos</Link>
        </nav>
      </div>

      <section className="mx-auto w-full max-w-[1480px] px-5 py-5 sm:px-8 sm:py-6 lg:px-12">
        <div className="mb-5 flex flex-wrap items-end gap-3 sm:mb-6">
          <label className="grid gap-1.5">
            <span className="text-[9px] font-black uppercase tracking-[.15em] text-[#7991a8]">Temporada</span>
            <span className="relative">
              <select
                value={temporada}
                onChange={(e) => setTemporada(e.target.value)}
                className="h-10 min-w-[160px] cursor-pointer appearance-none rounded-[8px] border border-[#caddea] bg-[#eef6fb] px-3.5 pr-9 text-[12px] font-bold text-[#173e68] outline-none transition hover:border-[#a8cfe6] focus:border-[#56afe2] sm:h-11 sm:min-w-[170px] sm:text-sm"
              >
                {temporadas.map((temp) => <option key={temp} value={temp}>{temp}</option>)}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#459bd0]">⌄</span>
            </span>
          </label>

          <label className="grid gap-1.5">
            <span className="text-[9px] font-black uppercase tracking-[.15em] text-[#7991a8]">División</span>
            <span className="relative">
              <select
                value={division}
                onChange={(e) => setDivision(e.target.value)}
                className="h-10 min-w-[175px] cursor-pointer appearance-none rounded-[8px] border border-[#caddea] bg-[#eef6fb] px-3.5 pr-9 text-[12px] font-bold text-[#173e68] outline-none transition hover:border-[#a8cfe6] focus:border-[#56afe2] sm:h-11 sm:min-w-[190px] sm:text-sm"
              >
                {divisiones.map((div) => <option key={div} value={div}>{div} División</option>)}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#459bd0]">⌄</span>
            </span>
          </label>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_405px] xl:gap-6">
          <section className="min-w-0">
            <TablaDivision temporada={temporada} division={division} />
          </section>

          <aside className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1 xl:self-start">
            <section className="overflow-hidden rounded-[10px] border border-[#d8e7f0] bg-white">
              <header className="flex h-[48px] items-center justify-between border-b border-[#e1edf4] bg-[#f8fbfd] px-4 sm:px-5">
                <h2 className="text-[15px] font-black uppercase tracking-[-.02em] text-[#102f55] sm:text-[16px]">Próxima fecha</h2>
                <Link href="/fixture" className="text-[10px] font-bold text-[#5d7893] transition hover:text-[#2498d8] sm:text-[11px]">Ver fixture →</Link>
              </header>

              <div className="px-3.5 sm:px-4">
                {proximosPartidos.length === 0 ? (
                  <p className="py-7 text-center text-xs text-[#7890a7] sm:text-sm">No hay próximos partidos cargados.</p>
                ) : (
                  proximosPartidos.map((partido) => (
                    <Link
                      key={partido.id}
                      href="/fixture"
                      className="grid min-h-[54px] grid-cols-[48px_minmax(0,1fr)_24px_minmax(0,1fr)] items-center gap-1.5 border-b border-[#e7eff5] py-2.5 last:border-b-0 transition hover:bg-[#f8fbfd] sm:grid-cols-[52px_minmax(0,1fr)_26px_minmax(0,1fr)] sm:gap-2"
                    >
                      <div className="text-[9px] font-bold leading-[1.45] text-[#64809a] sm:text-[10px]">
                        <span className="block truncate">{textoFecha(partido)}</span>
                        <span className="block text-[#8ca0b3]">{partido.hora || "—"}</span>
                      </div>
                      <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
                        <EscudoMini nombre={partido.local} />
                        <span className="truncate text-[10px] font-bold text-[#173e68] sm:text-[11px]">{partido.local}</span>
                      </div>
                      <span className="text-center text-[9px] font-black text-[#7890a7]">vs</span>
                      <div className="flex min-w-0 items-center justify-end gap-1.5 sm:gap-2">
                        <span className="truncate text-right text-[10px] font-bold text-[#173e68] sm:text-[11px]">{partido.visitante}</span>
                        <EscudoMini nombre={partido.visitante} />
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </section>

            <section className="overflow-hidden rounded-[10px] border border-[#d8e7f0] bg-white">
              <header className="flex h-[48px] items-center justify-between border-b border-[#e1edf4] bg-[#f8fbfd] px-4 sm:px-5">
                <h2 className="text-[15px] font-black uppercase tracking-[-.02em] text-[#102f55] sm:text-[16px]">Últimos resultados</h2>
                <Link href="/estadisticas" className="text-[10px] font-bold text-[#5d7893] transition hover:text-[#2498d8] sm:text-[11px]">Ver todos →</Link>
              </header>

              <div className="px-3.5 sm:px-4">
                {ultimosResultados.length === 0 ? (
                  <p className="py-7 text-center text-xs text-[#7890a7] sm:text-sm">No hay resultados cargados.</p>
                ) : (
                  ultimosResultados.map((partido) => (
                    <Link
                      key={partido.id}
                      href={partido.partido_id ? `/estadisticas/${encodeURIComponent(partido.partido_id)}` : "/estadisticas"}
                      className="grid min-h-[54px] grid-cols-[42px_minmax(0,1fr)_44px_minmax(0,1fr)] items-center gap-1.5 border-b border-[#e7eff5] py-2.5 last:border-b-0 transition hover:bg-[#f8fbfd] sm:grid-cols-[46px_minmax(0,1fr)_50px_minmax(0,1fr)] sm:gap-2"
                    >
                      <span className="truncate text-[9px] font-bold text-[#7890a7] sm:text-[10px]">{textoFecha(partido)}</span>
                      <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
                        <EscudoMini nombre={partido.local} />
                        <span className="truncate text-[10px] font-bold text-[#173e68] sm:text-[11px]">{partido.local}</span>
                      </div>
                      <strong className="text-center text-[13px] font-black text-[#102f55] sm:text-[14px]">{partido.resultado}</strong>
                      <div className="flex min-w-0 items-center justify-end gap-1.5 sm:gap-2">
                        <span className="truncate text-right text-[10px] font-bold text-[#173e68] sm:text-[11px]">{partido.visitante}</span>
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

      <footer className="mt-3 border-t border-[#d7e6f0] bg-white">
        <div className="mx-auto flex min-h-[72px] w-full max-w-[1480px] flex-col justify-center gap-3 px-5 py-4 text-[#102f55] sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <img src="/logo-apa.png" alt="PSO Argentina" className="h-8 w-8 object-cover" />
              <strong className="text-[12px] font-black uppercase tracking-[.15em]">PSO Argentina</strong>
            </div>
            <span className="hidden h-5 w-px bg-[#d5e4ed] sm:block" />
            <span className="hidden text-[10px] font-medium text-[#6b849d] sm:block">El fútbol virtual también nos une.</span>
          </div>

          <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] font-semibold text-[#5f7891] sm:gap-x-5" aria-label="Enlaces del pie de página">
            <Link href="/contacto" className="transition hover:text-[#2498d8]">Contacto</Link>
            <Link href="/terminos" className="transition hover:text-[#2498d8]">Términos</Link>
            <Link href="/privacidad" className="transition hover:text-[#2498d8]">Privacidad</Link>
            <Link href="/" className="transition hover:text-[#2498d8]">Redes</Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}
