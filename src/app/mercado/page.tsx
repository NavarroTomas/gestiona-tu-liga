"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { usePublicSeasons } from "@/hooks/usePublicSeasons";

type PerfilMercado = {
  id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
};

export default function MercadoPage() {
  const { seasons: temporadas, activeSeason, loading: seasonsLoading } = usePublicSeasons("Temporada 4");

  const divisiones = [
    { nombre: "Primera", icon: "🏆" },
    { nombre: "Segunda", icon: "🥈" },
  ];
  const tipos = ["Todos", "Fichaje", "Salida", "Préstamo", "Libre"];

  const [temporada, setTemporada] = useState("Temporada 4");

  useEffect(() => {
    if (!seasonsLoading) setTemporada(activeSeason);
  }, [activeSeason, seasonsLoading]);
  const [division, setDivision] = useState("Primera");
  const [tipoActivo, setTipoActivo] = useState("Todos");
  const [movimientos, setMovimientos] = useState<any[]>([]);
  const [clubesInfo, setClubesInfo] = useState<any[]>([]);
  const [perfiles, setPerfiles] = useState<PerfilMercado[]>([]);

  useEffect(() => {
    cargarMovimientos();
  }, [temporada, division]);

  async function cargarMovimientos() {
    const { data, error } = await supabase
      .from("transferencias")
      .select("id, jugador, desde, hacia, temporada, division, tipo, fecha, created_at")
      .eq("temporada", temporada)
      .eq("division", division)
      .order("fecha", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    const movimientosBase = data || [];
    setMovimientos(movimientosBase);

    const nombresJugadores = Array.from(
      new Set(
        movimientosBase
          .map((m: any) => String(m.jugador || "").trim())
          .filter(Boolean),
      ),
    );

    if (nombresJugadores.length > 0) {
      const { data: perfilesData, error: perfilesError } = await supabase
        .from("public_profiles")
        .select("id, display_name, username, avatar_url")
        .or(
          nombresJugadores
            .map(
              (nombre) =>
                `display_name.ilike.${nombre},username.ilike.${nombre}`,
            )
            .join(","),
        );

      if (perfilesError) {
        console.log(perfilesError);
        setPerfiles([]);
      } else {
        setPerfiles((perfilesData || []) as unknown as PerfilMercado[]);
      }
    } else {
      setPerfiles([]);
    }

    const nombresClubes = Array.from(
      new Set(
        movimientosBase
          .flatMap((m: any) => [m.desde, m.hacia])
          .filter(Boolean)
          .filter((nombre: string) => {
            const n = String(nombre).toLowerCase().trim();
            return n !== "libre" && n !== "sin destino" && n !== "sin club";
          }),
      ),
    );

    if (nombresClubes.length > 0) {
      const { data: clubesData, error: clubesError } = await supabase
        .from("clubes_info")
        .select("nombre, logo_url")
        .in("nombre", nombresClubes);

      if (clubesError) {
        console.log(clubesError);
      }

      setClubesInfo(clubesData || []);
    } else {
      setClubesInfo([]);
    }
  }

  function colorTipo(tipo: string) {
    if (tipo === "Fichaje")
      return "border-emerald-400/30 bg-emerald-400/10 text-emerald-300";
    if (tipo === "Salida")
      return "border-red-400/30 bg-red-400/10 text-red-300";
    if (tipo === "Préstamo")
      return "border-yellow-400/30 bg-yellow-400/10 text-yellow-300";
    if (tipo === "Libre") return "border-sky-400/30 bg-sky-400/10 text-sky-300";
    return "border-purple-400/30 bg-purple-400/10 text-purple-300";
  }

  function iconoTipo(tipo: string) {
    if (tipo === "Fichaje") return "✅";
    if (tipo === "Salida") return "🚪";
    if (tipo === "Préstamo") return "🔄";
    if (tipo === "Libre") return "🆓";
    return "⚡";
  }

  function esClubValido(nombre?: string | null) {
    if (!nombre) return false;

    const normalizado = String(nombre).toLowerCase().trim();

    return (
      normalizado !== "libre" &&
      normalizado !== "sin destino" &&
      normalizado !== "sin club"
    );
  }

  function logoEquipo(nombre?: string | null) {
    if (!nombre) return null;

    const club = clubesInfo.find(
      (c) =>
        String(c.nombre || "")
          .toLowerCase()
          .trim() ===
        String(nombre || "")
          .toLowerCase()
          .trim(),
    );

    return club?.logo_url || null;
  }

  function EscudoEquipo({
    nombre,
    size = "md",
  }: {
    nombre?: string | null;
    size?: "sm" | "md";
  }) {
    const logo = logoEquipo(nombre);

    const sizes = {
      sm: "h-9 w-9 rounded-xl text-[10px]",
      md: "h-12 w-12 rounded-2xl text-xs",
    };

    return (
      <div
        className={`flex shrink-0 items-center justify-center overflow-hidden border border-sky-400/30 bg-gradient-to-br from-sky-500 to-blue-950 font-black shadow-[0_0_15px_rgba(56,189,248,.28)] ${sizes[size]}`}
      >
        {logo ? (
          <img
            src={logo}
            alt={nombre || "Club"}
            className="h-full w-full object-contain p-1.5"
          />
        ) : (
          nombre?.slice(0, 2).toUpperCase() || "?"
        )}
      </div>
    );
  }

  function EquipoLink({
    nombre,
    variant = "normal",
  }: {
    nombre?: string | null;
    variant?: "normal" | "highlight";
  }) {
    const texto = nombre || (variant === "highlight" ? "Sin destino" : "Libre");

    const contenido = (
      <span className="inline-flex min-w-0 items-center gap-2">
        <EscudoEquipo nombre={texto} size="sm" />
        <span className="min-w-0 break-words leading-tight">{texto}</span>
      </span>
    );

    if (!esClubValido(nombre)) {
      return (
        <span className="inline-flex min-w-0 items-center gap-2 text-zinc-400">
          {contenido}
        </span>
      );
    }

    return (
      <Link
        href={`/equipos/${encodeURIComponent(String(nombre))}?temporada=${encodeURIComponent(temporada)}`}
        className={`inline-flex min-w-0 items-center gap-2 transition hover:text-sky-300 ${
          variant === "highlight" ? "font-black text-white" : ""
        }`}
      >
        {contenido}
      </Link>
    );
  }

  function normalizarTexto(valor?: string | null) {
    return String(valor || "")
      .trim()
      .toLowerCase();
  }

  function perfilJugador(nombre?: string | null) {
    const n = normalizarTexto(nombre);

    if (!n) return null;

    return (
      perfiles.find(
        (p) =>
          normalizarTexto(p.display_name) === n ||
          normalizarTexto(p.username) === n,
      ) || null
    );
  }

  function AvatarJugador({ nombre }: { nombre?: string | null }) {
    const perfil = perfilJugador(nombre);
    const inicial = String(nombre || "J")
      .slice(0, 1)
      .toUpperCase();

    const avatar = (
      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-yellow-400/25 bg-yellow-400/10 text-xl font-black text-yellow-300 shadow-[0_0_18px_rgba(250,204,21,.12)]">
        {perfil?.avatar_url ? (
          <img
            src={perfil.avatar_url}
            alt={nombre || "Jugador"}
            className="h-full w-full object-cover"
          />
        ) : (
          inicial
        )}
      </div>
    );

    if (perfil?.username) {
      return (
        <Link
          href={`/u/${perfil.username}`}
          className="transition hover:scale-105"
        >
          {avatar}
        </Link>
      );
    }

    return avatar;
  }

  function NombreJugadorLink({ nombre }: { nombre?: string | null }) {
    const perfil = perfilJugador(nombre);
    const texto = nombre || "Sin nombre";

    if (perfil?.username) {
      return (
        <Link
          href={`/u/${perfil.username}`}
          className="break-words transition hover:text-yellow-300"
        >
          {texto}
        </Link>
      );
    }

    return <span className="break-words">{texto}</span>;
  }

  const movimientosFiltrados =
    tipoActivo === "Todos"
      ? movimientos
      : movimientos.filter((m) => m.tipo === tipoActivo);

  const fichajes = movimientos.filter((m) => m.tipo === "Fichaje").length;
  const salidas = movimientos.filter((m) => m.tipo === "Salida").length;
  const prestamos = movimientos.filter((m) => m.tipo === "Préstamo").length;
  const libres = movimientos.filter((m) => m.tipo === "Libre").length;

  const movimientoDestacado = movimientosFiltrados[0];

  return (
    <main className="min-h-screen text-white bg-[radial-gradient(circle_at_top,#123a7a_0%,#081427_24%,#020714_55%,#000_100%)]">
      <div className="mx-auto max-w-[1500px] px-3 py-5 sm:px-4 md:px-8 md:py-8 space-y-6 md:space-y-8">
        <section className="relative min-h-[430px] overflow-hidden rounded-[28px] border border-sky-500/30 bg-[#020714] p-5 shadow-[0_0_55px_rgba(0,120,255,.22)] sm:rounded-[38px] md:p-10">
          <img
            src="/images/mercado/hero.png"
            alt=""
            className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-[68%] object-cover object-center opacity-70 select-none lg:block"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-[#020714] via-[#020714]/92 to-[#020714]/35" />
          <div className="absolute inset-y-0 right-0 hidden w-[58%] bg-gradient-to-r from-[#020714] via-[#020714]/15 to-transparent lg:block" />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#020714]/85 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,.18),transparent_44%)]" />
          <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />

          <div className="relative z-10 flex min-h-[360px] items-center">
            <div className="max-w-3xl">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-sky-400 sm:text-xs sm:tracking-[0.45em]">
                APA PSO ARGENTINA
              </p>

              <h1 className="mt-4 text-[clamp(2.5rem,9vw,5rem)] font-black uppercase italic leading-none">
                <span className="block bg-gradient-to-b from-white via-zinc-300 to-zinc-600 bg-clip-text text-transparent">
                  Mercado
                </span>

                <span className="block text-sky-400 drop-shadow-[0_0_18px_rgba(56,189,248,.65)]">
                  de Pases
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-zinc-300">
                Fichajes, salidas, préstamos y jugadores libres de APA PSO
                Argentina UE5. Seguimiento oficial por temporada y división.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
                <div className="rounded-2xl border border-emerald-500/20 bg-black/45 p-4 backdrop-blur-sm">
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">
                    Fichajes
                  </p>
                  <p className="mt-2 text-3xl font-black text-emerald-400">
                    {fichajes}
                  </p>
                </div>

                <div className="rounded-2xl border border-red-500/20 bg-black/45 p-4 backdrop-blur-sm">
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">
                    Salidas
                  </p>
                  <p className="mt-2 text-3xl font-black text-red-300">
                    {salidas}
                  </p>
                </div>

                <div className="rounded-2xl border border-yellow-500/20 bg-black/45 p-4 backdrop-blur-sm">
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">
                    Préstamos
                  </p>
                  <p className="mt-2 text-3xl font-black text-yellow-300">
                    {prestamos}
                  </p>
                </div>

                <div className="rounded-2xl border border-sky-500/20 bg-black/45 p-4 backdrop-blur-sm">
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">
                    Libres
                  </p>
                  <p className="mt-2 text-3xl font-black text-sky-300">
                    {libres}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-sky-500/25 bg-[#020714] p-5 sm:rounded-[34px] md:p-8 shadow-[0_0_35px_rgba(0,120,255,.12)]">
          <div className="grid gap-7">
            <div>
              <p className="text-sky-300 uppercase tracking-[0.3em] text-xs font-black mb-4">
                Temporada
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                {temporadas.map((temp) => (
                  <button
                    key={temp}
                    onClick={() => setTemporada(temp)}
                    className={`rounded-2xl border px-3 py-3 text-xs sm:text-sm font-black uppercase transition-all ${
                      temporada === temp
                        ? "border-sky-300 bg-gradient-to-b from-sky-400 to-blue-700 text-white shadow-[0_0_20px_rgba(56,189,248,.45)]"
                        : "border-sky-500/20 bg-black/35 text-zinc-400 hover:border-sky-400/40 hover:text-white"
                    }`}
                  >
                    {temp}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sky-300 uppercase tracking-[0.3em] text-xs font-black mb-4">
                División
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {divisiones.map((div) => (
                  <button
                    key={div.nombre}
                    onClick={() => setDivision(div.nombre)}
                    className={`rounded-2xl border px-3 py-3 text-xs sm:text-sm font-black uppercase transition-all ${
                      division === div.nombre
                        ? "border-yellow-300 bg-gradient-to-r from-yellow-400 to-amber-600 text-black shadow-[0_0_20px_rgba(250,204,21,.35)]"
                        : "border-sky-500/20 bg-black/35 text-zinc-400 hover:border-sky-400/40 hover:text-white"
                    }`}
                  >
                    {div.icon} {div.nombre}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sky-300 uppercase tracking-[0.3em] text-xs font-black mb-4">
                Tipo de movimiento
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                {tipos.map((tipo) => (
                  <button
                    key={tipo}
                    onClick={() => setTipoActivo(tipo)}
                    className={`rounded-2xl border px-3 py-3 text-xs sm:text-sm font-black uppercase transition-all ${
                      tipoActivo === tipo
                        ? "border-sky-300 bg-sky-400 text-black shadow-[0_0_20px_rgba(56,189,248,.35)]"
                        : "border-sky-500/20 bg-black/35 text-zinc-400 hover:border-sky-400/40 hover:text-white"
                    }`}
                  >
                    {tipo === "Todos" ? "Todos" : `${iconoTipo(tipo)} ${tipo}`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section>
          <p className="text-sky-300 uppercase tracking-[0.35em] text-xs font-black">
            Selección actual
          </p>

          <h2 className="mt-3 text-[clamp(1.8rem,7vw,3rem)] font-black uppercase">
            {temporada}
            <span className="text-sky-400"> / </span>
            {division}
          </h2>

          <p className="mt-3 text-zinc-500">
            {tipoActivo} · {movimientosFiltrados.length} movimientos visibles
          </p>
        </section>

        {movimientoDestacado && (
          <section className="relative overflow-hidden rounded-[28px] border border-yellow-400/30 bg-[#020714] p-5 sm:rounded-[34px] sm:p-6 shadow-[0_0_45px_rgba(250,204,21,.12)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,.16),transparent_40%)]" />

            <div className="relative z-10">
              <p className="text-yellow-300 text-xs uppercase tracking-[0.35em] font-black">
                Movimiento destacado
              </p>

              <div className="mt-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                  <div className="flex items-center gap-4">
                    <AvatarJugador nombre={movimientoDestacado.jugador} />

                    <h2 className="break-words text-2xl sm:text-3xl md:text-5xl font-black uppercase">
                      {iconoTipo(movimientoDestacado.tipo)}{" "}
                      <NombreJugadorLink nombre={movimientoDestacado.jugador} />
                    </h2>
                  </div>

                  <div className="mt-4 flex flex-col gap-3 text-lg font-black sm:flex-row sm:flex-wrap sm:items-center">
                    <EquipoLink
                      nombre={movimientoDestacado.desde}
                      variant="highlight"
                    />

                    <span className="text-sky-300">→</span>

                    <EquipoLink
                      nombre={movimientoDestacado.hacia}
                      variant="highlight"
                    />
                  </div>
                </div>

                <div
                  className={`rounded-2xl border px-4 py-3 sm:px-6 sm:py-4 font-black uppercase ${colorTipo(
                    movimientoDestacado.tipo,
                  )}`}
                >
                  {movimientoDestacado.tipo}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <p className="text-zinc-500 uppercase tracking-[0.18em] text-xs font-black">
                  {movimientoDestacado.temporada} ·{" "}
                  {movimientoDestacado.division}
                </p>

                {movimientoDestacado.fecha && (
                  <span className="rounded-xl border border-yellow-400/20 bg-yellow-400/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-yellow-300">
                    Movimiento #{movimientoDestacado.fecha}
                  </span>
                )}
              </div>
            </div>
          </section>
        )}

        {movimientosFiltrados.length === 0 ? (
          <section className="relative overflow-hidden rounded-[28px] border border-sky-500/20 bg-[#020714] p-6 sm:p-10 text-center shadow-[0_0_35px_rgba(0,120,255,.12)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,.14),transparent_45%)]" />

            <div className="relative z-10 max-w-2xl mx-auto">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-sky-400/30 bg-sky-400/10 text-5xl shadow-[0_0_30px_rgba(56,189,248,.18)]">
                🔁
              </div>

              <h2 className="mt-6 text-3xl sm:text-4xl font-black uppercase">
                Mercado cerrado
              </h2>

              <p className="mt-4 text-zinc-400">
                No hay movimientos visibles con el filtro actual. Probá cambiar
                temporada, división o tipo de movimiento.
              </p>

              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-emerald-300 font-black">
                  ✅ Fichajes
                </div>

                <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-4 text-yellow-300 font-black">
                  🔄 Préstamos
                </div>

                <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-red-300 font-black">
                  🚪 Salidas
                </div>

                <div className="rounded-2xl border border-sky-400/20 bg-sky-400/10 p-4 text-sky-300 font-black">
                  🆓 Libres
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
            {movimientosFiltrados.map((m) => (
              <div
                key={m.id}
                className="group relative overflow-hidden rounded-[28px] border border-sky-500/20 bg-[#020714] p-4 sm:rounded-[34px] sm:p-6 transition hover:border-sky-400/45 hover:shadow-[0_0_30px_rgba(56,189,248,.14)]"
              >
                <div className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,.12),transparent_40%)]" />

                <div className="relative z-10">
                  <div className="flex items-start justify-between gap-4">
                    <span
                      className={`rounded-2xl border px-4 py-2 text-xs font-black uppercase tracking-[0.18em] ${colorTipo(
                        m.tipo,
                      )}`}
                    >
                      {iconoTipo(m.tipo)} {m.tipo}
                    </span>

                    <p className="text-zinc-500 text-xs font-black uppercase tracking-[0.18em]">
                      {m.fecha ? `Movimiento #${m.fecha}` : "Sin registro"}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center gap-4">
                    <AvatarJugador nombre={m.jugador} />

                    <h2 className="min-w-0 break-words text-2xl sm:text-3xl font-black uppercase">
                      <NombreJugadorLink nombre={m.jugador} />
                    </h2>
                  </div>

                  <div className="mt-5 flex flex-col gap-3 md:grid md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-stretch">
                    <div className="min-w-0 rounded-2xl border border-white/10 bg-black/35 p-4">
                      <p className="text-zinc-500 text-[10px] uppercase tracking-[0.2em] font-black">
                        Desde
                      </p>
                      <div className="mt-2 min-w-0 font-black">
                        <EquipoLink nombre={m.desde} />
                      </div>
                    </div>

                    <div className="flex items-center justify-center text-2xl text-sky-300 font-black">
                      →
                    </div>

                    <div className="min-w-0 rounded-2xl border border-sky-400/20 bg-sky-400/10 p-4">
                      <p className="text-sky-300 text-[10px] uppercase tracking-[0.2em] font-black">
                        Hacia
                      </p>
                      <div className="mt-2 min-w-0 font-black">
                        <EquipoLink nombre={m.hacia} />
                      </div>
                    </div>
                  </div>

                  <p className="mt-5 text-zinc-500 uppercase tracking-[0.16em] text-xs font-black">
                    {m.temporada} · {m.division}
                  </p>
                </div>
              </div>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
