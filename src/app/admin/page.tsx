"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function AdminPage() {
  const temporadas = [
    "Temporada 1",
    "Temporada 2",
    "Temporada 3",
    "Temporada 4",
  ];
  const divisiones = ["Primera", "Segunda", "Tercera", "Cuarta"];

  const [clubNombre, setClubNombre] = useState("");
  const [clubTemporada, setClubTemporada] = useState("Temporada 1");
  const [clubDivision, setClubDivision] = useState("Primera");

  const [temporadaNombre, setTemporadaNombre] = useState("");
  const [temporadaCampeon, setTemporadaCampeon] = useState("");

  const [local, setLocal] = useState("");
  const [visitante, setVisitante] = useState("");
  const [resultado, setResultado] = useState("");
  const [fecha, setFecha] = useState("");
  const [partidoTemporada, setPartidoTemporada] = useState("Temporada 1");
  const [partidoDivision, setPartidoDivision] = useState("Primera");

  const [jugadorNombre, setJugadorNombre] = useState("");
  const [jugadorEquipo, setJugadorEquipo] = useState("");
  const [goles, setGoles] = useState("0");
  const [asistencias, setAsistencias] = useState("0");
  const [mvps, setMvps] = useState("0");
  const [jugadorTemporada, setJugadorTemporada] = useState("Temporada 1");
  const [jugadorDivision, setJugadorDivision] = useState("Primera");

  const [noticiaTitulo, setNoticiaTitulo] = useState("");
  const [noticiaDescripcion, setNoticiaDescripcion] = useState("");
  const [noticiaTemporada, setNoticiaTemporada] = useState("Temporada 1");

  const [cargandoPermisos, setCargandoPermisos] = useState(true);
  const [canUploadTxt, setCanUploadTxt] = useState(false);
  const [canManualMatch, setCanManualMatch] = useState(false);
  const [canNews, setCanNews] = useState(false);
  const [canTransfers, setCanTransfers] = useState(false);
  const [canCompetitions, setCanCompetitions] = useState(false);
  const [canTitles, setCanTitles] = useState(false);
  const [canUsers, setCanUsers] = useState(false);
  const [canLists, setCanLists] = useState(false);
  const [canClubs, setCanClubs] = useState(false);

  useEffect(() => {
    cargarPermisos();
  }, []);

  async function checkPermission(permission: string) {
    const { data, error } = await supabase.rpc("has_permission", {
      requested_permission: permission,
    });

    if (error) {
      console.log(error);
      return false;
    }

    return !!data;
  }

  async function cargarPermisos() {
    setCargandoPermisos(true);

    const [
      uploadTxt,
      manualMatch,
      news,
      transfers,
      competitions,
      titles,
      users,
      lists,
      clubs,
    ] = await Promise.all([
      checkPermission("matches.upload_txt"),
      checkPermission("matches.upload_manual"),
      checkPermission("news.manage"),
      checkPermission("transfers.manage"),
      checkPermission("competitions.manage"),
      checkPermission("titles.manage"),
      checkPermission("admin.users.manage"),
      checkPermission("matches.edit"),
      checkPermission("clubs.manage"),
    ]);

    setCanUploadTxt(uploadTxt);
    setCanManualMatch(manualMatch);
    setCanNews(news);
    setCanTransfers(transfers);
    setCanCompetitions(competitions);
    setCanTitles(titles);
    setCanUsers(users);
    setCanLists(lists);
    setCanClubs(clubs);
    setCargandoPermisos(false);
  }

  async function crearClub() {
    if (!canClubs) {
      alert("No tenés permiso para crear clubes.");
      return;
    }

    const { error } = await supabase.from("equipos").insert([
  {
    nombre: clubNombre,
    temporada: clubTemporada,
    division: clubDivision,
    puntos: 0,
    pj: 0,
  },
]);

    if (error) {
      console.log(error);
      alert("Error creando club: " + error.message);
      return;
    }

    alert("Club creado");
    setClubNombre("");
  }

  async function crearTemporada() {
    if (!canCompetitions) {
      alert("No tenés permiso para crear temporadas.");
      return;
    }

    const { error } = await supabase
      .from("temporadas")
      .insert([{ nombre: temporadaNombre, campeon: temporadaCampeon }]);

    if (error) {
      console.log(error);
      alert("Error creando temporada");
      return;
    }

    alert("Temporada creada");
    setTemporadaNombre("");
    setTemporadaCampeon("");
  }

  async function crearPartido() {
    if (!canManualMatch) {
      alert("No tenés permiso para cargar partidos manuales.");
      return;
    }

    const { error } = await supabase.from("partidos").insert([
      {
        local,
        visitante,
        resultado,
        fecha,
        temporada: partidoTemporada,
        division: partidoDivision,
      },
    ]);

    if (error) {
      console.log(error);
      alert("Error creando partido");
      return;
    }

    alert("Partido cargado");
    setLocal("");
    setVisitante("");
    setResultado("");
    setFecha("");
  }

  async function crearJugador() {
    if (!canTransfers) {
      alert("No tenés permiso para cargar jugadores desde este panel.");
      return;
    }

    const { error } = await supabase.from("jugadores").insert([
      {
        nombre: jugadorNombre,
        equipo: jugadorEquipo,
        goles: Number(goles),
        asistencias: Number(asistencias),
        mvps: Number(mvps),
        temporada: jugadorTemporada,
        division: jugadorDivision,
      },
    ]);

    if (error) {
      console.log(error);
      alert("Error creando jugador");
      return;
    }

    alert("Jugador cargado");
    setJugadorNombre("");
    setJugadorEquipo("");
    setGoles("0");
    setAsistencias("0");
    setMvps("0");
    setJugadorTemporada("Temporada 1");
    setJugadorDivision("Primera");
  }

  async function crearNoticia() {
    if (!canNews) {
      alert("No tenés permiso para publicar noticias.");
      return;
    }

    const { error } = await supabase.from("noticias").insert([
      {
        titulo: noticiaTitulo,
        descripcion: noticiaDescripcion,
        temporada: noticiaTemporada,
      },
    ]);

    if (error) {
      console.log(error);
      alert("Error creando noticia");
      return;
    }

    alert("Noticia publicada");
    setNoticiaTitulo("");
    setNoticiaDescripcion("");
  }
  if (cargandoPermisos) {
    return (
      <main className="min-h-screen bg-[#0b0f14] text-white flex items-center justify-center">
        <p className="text-2xl font-black uppercase tracking-[0.18em] text-sky-300">
          Cargando permisos...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0b0f14] text-white">
      <div className="max-w-[1500px] mx-auto px-4 md:px-8 py-10 space-y-10">
        <div>
          <p className="text-sky-400 text-xs uppercase tracking-[4px] font-bold">
            PANEL ADMINISTRATIVO
          </p>

          <h1 className="mt-3 text-4xl md:text-5xl font-black">Admin Panel</h1>

          <p className="mt-4 text-zinc-400 max-w-2xl">
            Gestioná clubes, temporadas, partidos, jugadores, noticias,
            plantillas y mercado sin tocar código.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-5 mt-8">
          {canTitles && (
          <Link
            href="/admin/titulos"
            className="group rounded-3xl border border-yellow-500/20 bg-[#11151c] p-6 transition hover:border-yellow-400 hover:shadow-[0_0_25px_rgba(250,204,21,.15)]"
          >
            <p className="text-yellow-300 text-xs uppercase tracking-[0.25em] font-black">
              Historia
            </p>

            <h3 className="text-3xl font-black mt-3">🏆 Palmarés</h3>

            <p className="text-zinc-400 mt-3">
              Cargá campeones, copas y títulos oficiales.
            </p>
          </Link>
          )}

          {canTitles && (
          <Link
            href="/admin/premios"
            className="group rounded-3xl border border-amber-500/20 bg-[#11151c] p-6 transition hover:border-amber-400 hover:shadow-[0_0_25px_rgba(251,191,36,.15)]"
          >
            <p className="text-amber-300 text-xs uppercase tracking-[0.25em] font-black">
              Premios
            </p>

            <h3 className="text-3xl font-black mt-3">🏆 Premios APA</h3>

            <p className="text-zinc-400 mt-3">
              Asigná Balón de Oro, Raiko Trophy, Bota de Oro y Golden Boy con candidatos automáticos.
            </p>
          </Link>
          )}


          {canCompetitions && (
          <Link
            href="/admin/fixture"
            className="group rounded-3xl border border-yellow-500/20 bg-[#11151c] p-6 transition hover:border-yellow-400 hover:shadow-[0_0_25px_rgba(250,204,21,.15)]"
          >
            <p className="text-yellow-300 text-xs uppercase tracking-[0.25em] font-black">
              Competición
            </p>

            <h3 className="text-3xl font-black mt-3">📅 Fixture Manager</h3>

            <p className="text-zinc-400 mt-3">
              Generá fixtures, programá horarios y gestioná partidos.
            </p>
          </Link>
          )}

          {canUploadTxt && (
          <Link
            href="/admin/subir-txt"
            className="group rounded-3xl border border-sky-500/20 bg-[#11151c] p-6 transition hover:border-sky-400 hover:shadow-[0_0_25px_rgba(56,189,248,.15)]"
          >
            <p className="text-sky-400 text-xs uppercase tracking-[0.25em] font-black">
              Estadísticas
            </p>

            <h3 className="text-3xl font-black mt-3">📄 Subir TXT</h3>

            <p className="text-zinc-400 mt-3">
              Cargá automáticamente los archivos de partidos.
            </p>
          </Link>
          )}

          {canLists && (
          <Link
            href="/admin/listas"
            className="group rounded-3xl border border-sky-500/20 bg-[#11151c] p-6 transition hover:border-sky-400 hover:shadow-[0_0_25px_rgba(56,189,248,.15)]"
          >
            <p className="text-sky-400 text-xs uppercase tracking-[0.25em] font-black">
              Administración
            </p>

            <h3 className="text-3xl font-black mt-3">📋 Listas</h3>

            <p className="text-zinc-400 mt-3">
              Gestioná registros y datos cargados.
            </p>
          </Link>
          )}

          {canTransfers && (
          <Link
            href="/admin/plantillas"
            className="group rounded-3xl border border-sky-500/20 bg-[#11151c] p-6 transition hover:border-sky-400 hover:shadow-[0_0_25px_rgba(56,189,248,.15)]"
          >
            <p className="text-sky-400 text-xs uppercase tracking-[0.25em] font-black">
              Equipos
            </p>

            <h3 className="text-3xl font-black mt-3">👥 Plantillas</h3>

            <p className="text-zinc-400 mt-3">
              Administrá jugadores y transferencias.
            </p>
          </Link>
          )}
          {canManualMatch && (
          <Link
            href="/admin/cargar-partido-manual"
            className="group rounded-3xl border border-yellow-500/20 bg-[#11151c] p-6 transition hover:border-yellow-400 hover:shadow-[0_0_25px_rgba(250,204,21,.15)]"
          >
            <p className="text-yellow-300 text-xs uppercase tracking-[0.25em] font-black">
              Históricos
            </p>

            <h3 className="text-3xl font-black mt-3">⚽ Partido Manual</h3>

            <p className="text-zinc-400 mt-3">
              Cargá partidos, goleadores, asistencias y MVP sin TXT.
            </p>
          </Link>
          )}



          {canNews && (
          <Link
            href="/admin/noticias"
            className="group rounded-3xl border border-sky-500/20 bg-[#11151c] p-6 transition hover:border-sky-400 hover:shadow-[0_0_25px_rgba(56,189,248,.15)]"
          >
            <p className="text-sky-400 text-xs uppercase tracking-[0.25em] font-black">
              Prensa
            </p>

            <h3 className="text-3xl font-black mt-3">📰 Noticias</h3>

            <p className="text-zinc-400 mt-3">
              Administrá publicaciones, comunicados y noticias oficiales.
            </p>
          </Link>
          )}

          {canUsers && (
          <Link
            href="/admin/verificaciones"
            className="group rounded-3xl border border-green-500/20 bg-[#11151c] p-6 transition hover:border-green-400 hover:shadow-[0_0_25px_rgba(74,222,128,.15)]"
          >
            <p className="text-green-300 text-xs uppercase tracking-[0.25em] font-black">
              Verificación
            </p>

            <h3 className="text-3xl font-black mt-3">✅ Player IDs</h3>

            <p className="text-zinc-400 mt-3">
              Revisá solicitudes de PlayerId, aprobaciones, rechazos y disputas.
            </p>
          </Link>
          )}

          {canUsers && (
          <Link
            href="/admin/usuarios"
            className="group rounded-3xl border border-purple-500/20 bg-[#11151c] p-6 transition hover:border-purple-400 hover:shadow-[0_0_25px_rgba(168,85,247,.15)]"
          >
            <p className="text-purple-300 text-xs uppercase tracking-[0.25em] font-black">
              Comunidad
            </p>

            <h3 className="text-3xl font-black mt-3">👥 Usuarios</h3>

            <p className="text-zinc-400 mt-3">
              Gestioná usuarios, roles, aprobaciones y suspensiones.
            </p>
          </Link>
          )}

          {canClubs && (
          <Link
            href="/admin/clubes"
            className="group rounded-3xl border border-cyan-500/20 bg-[#11151c] p-6 transition hover:border-cyan-400 hover:shadow-[0_0_25px_rgba(34,211,238,.15)]"
          >
            <p className="text-cyan-300 text-xs uppercase tracking-[0.25em] font-black">
              Clubes
            </p>

            <h3 className="text-3xl font-black mt-3">🏟️ Clubes</h3>

            <p className="text-zinc-400 mt-3">
              Administrá logos, banners, colores, descripciones y datos visuales de los clubes.
            </p>
          </Link>
          )}

        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {canClubs && (
          <section className="bg-[#11151c] border border-white/[0.06] rounded-3xl p-6">
            <h2 className="text-2xl font-black mb-5">Crear Club</h2>

            <div className="space-y-4">
              <input
                className="input"
                placeholder="Nombre del club"
                value={clubNombre}
                onChange={(e) => setClubNombre(e.target.value)}
              />

              <select
                className="input"
                value={clubTemporada}
                onChange={(e) => setClubTemporada(e.target.value)}
              >
                {temporadas.map((temp) => (
                  <option key={temp}>{temp}</option>
                ))}
              </select>

              <select
                className="input"
                value={clubDivision}
                onChange={(e) => setClubDivision(e.target.value)}
              >
                {divisiones.map((div) => (
                  <option key={div}>{div}</option>
                ))}
              </select>

              <button onClick={crearClub} className="btn">
                Guardar Club
              </button>
            </div>
          </section>
          )}

          {canCompetitions && (
          <section className="bg-[#11151c] border border-white/[0.06] rounded-3xl p-6">
            <h2 className="text-2xl font-black mb-5">Crear Temporada</h2>

            <div className="space-y-4">
              <input
                className="input"
                placeholder="Ej: Temporada 1"
                value={temporadaNombre}
                onChange={(e) => setTemporadaNombre(e.target.value)}
              />
              <input
                className="input"
                placeholder="Campeón"
                value={temporadaCampeon}
                onChange={(e) => setTemporadaCampeon(e.target.value)}
              />

              <button onClick={crearTemporada} className="btn">
                Guardar Temporada
              </button>
            </div>
          </section>
          )}

          {canManualMatch && (
          <section className="bg-[#11151c] border border-white/[0.06] rounded-3xl p-6">
            <h2 className="text-2xl font-black mb-5">Cargar Partido</h2>

            <div className="space-y-4">
              <input
                className="input"
                placeholder="Local"
                value={local}
                onChange={(e) => setLocal(e.target.value)}
              />
              <input
                className="input"
                placeholder="Visitante"
                value={visitante}
                onChange={(e) => setVisitante(e.target.value)}
              />
              <input
                className="input"
                placeholder="Resultado ej: 3-1"
                value={resultado}
                onChange={(e) => setResultado(e.target.value)}
              />
              <input
                className="input"
                placeholder="Fecha ej: 1"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
              />

              <select
                className="input"
                value={partidoTemporada}
                onChange={(e) => setPartidoTemporada(e.target.value)}
              >
                {temporadas.map((temp) => (
                  <option key={temp}>{temp}</option>
                ))}
              </select>

              <select
                className="input"
                value={partidoDivision}
                onChange={(e) => setPartidoDivision(e.target.value)}
              >
                {divisiones.map((div) => (
                  <option key={div}>{div}</option>
                ))}
              </select>

              <button onClick={crearPartido} className="btn">
                Guardar Partido
              </button>
            </div>
          </section>
          )}

          {canTransfers && (
          <section className="bg-[#11151c] border border-white/[0.06] rounded-3xl p-6">
            <h2 className="text-2xl font-black mb-5">Cargar Jugador</h2>

            <div className="space-y-4">
              <input
                className="input"
                placeholder="Jugador"
                value={jugadorNombre}
                onChange={(e) => setJugadorNombre(e.target.value)}
              />
              <input
                className="input"
                placeholder="Equipo"
                value={jugadorEquipo}
                onChange={(e) => setJugadorEquipo(e.target.value)}
              />
              <input
                className="input"
                placeholder="Goles"
                value={goles}
                onChange={(e) => setGoles(e.target.value)}
              />
              <input
                className="input"
                placeholder="Asistencias"
                value={asistencias}
                onChange={(e) => setAsistencias(e.target.value)}
              />
              <input
                className="input"
                placeholder="MVPs"
                value={mvps}
                onChange={(e) => setMvps(e.target.value)}
              />

              <select
                className="input"
                value={jugadorTemporada}
                onChange={(e) => setJugadorTemporada(e.target.value)}
              >
                {temporadas.map((temp) => (
                  <option key={temp}>{temp}</option>
                ))}
              </select>

              <select
                className="input"
                value={jugadorDivision}
                onChange={(e) => setJugadorDivision(e.target.value)}
              >
                {divisiones.map((div) => (
                  <option key={div}>{div}</option>
                ))}
              </select>

              <button onClick={crearJugador} className="btn">
                Guardar Jugador
              </button>
            </div>
          </section>
          )}

          {canTransfers && (
          <section className="bg-[#11151c] border border-white/[0.06] rounded-3xl p-6 xl:col-span-2">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-black">Plantillas y Mercado</h2>
                <p className="text-zinc-400 mt-2">
                  Cargá jugadores a plantillas y registrá transferencias.
                </p>
              </div>

              <Link
                href="/admin/plantillas"
                className="bg-sky-400 text-black px-6 py-3 rounded-2xl font-black text-center"
              >
                Abrir Panel
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-[#0b0f14] border border-white/[0.05] rounded-2xl p-5">
                <p className="text-zinc-500 text-sm uppercase font-bold">
                  Plantillas
                </p>
                <h3 className="text-3xl font-black mt-3">
                  Registrar jugadores
                </h3>
                <p className="text-zinc-400 mt-3">
                  Agregá jugadores a clubes por temporada, división y posición.
                </p>
              </div>

              <div className="bg-[#0b0f14] border border-white/[0.05] rounded-2xl p-5">
                <p className="text-zinc-500 text-sm uppercase font-bold">
                  Mercado
                </p>
                <h3 className="text-3xl font-black mt-3">Transferencias</h3>
                <p className="text-zinc-400 mt-3">
                  Registrá fichajes, salidas, libres y préstamos.
                </p>
              </div>
            </div>
          </section>
          )}

          {canNews && (
          <section className="bg-[#11151c] border border-white/[0.06] rounded-3xl p-6 xl:col-span-2">
            <h2 className="text-2xl font-black mb-5">Publicar Noticia</h2>

            <div className="space-y-4">
              <input
                className="input"
                placeholder="Título"
                value={noticiaTitulo}
                onChange={(e) => setNoticiaTitulo(e.target.value)}
              />

              <textarea
                className="input min-h-[120px]"
                placeholder="Descripción"
                value={noticiaDescripcion}
                onChange={(e) => setNoticiaDescripcion(e.target.value)}
              />

              <select
                className="input"
                value={noticiaTemporada}
                onChange={(e) => setNoticiaTemporada(e.target.value)}
              >
                {temporadas.map((temp) => (
                  <option key={temp}>{temp}</option>
                ))}
              </select>

              <button onClick={crearNoticia} className="btn">
                Publicar Noticia
              </button>
            </div>
          </section>
          )}
        </div>
      </div>
    </main>
  );
}
