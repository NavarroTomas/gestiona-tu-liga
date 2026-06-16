"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type VerificationStatus = "pending" | "approved" | "rejected" | "disputed" | "all";

type PerfilVerificacion = {
  id: string;
  email: string | null;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  playerid: string | null;
  requested_playerid: string | null;
  playerid_verified: boolean | null;
  verification_status: string | null;
  verification_note: string | null;
  verified_at: string | null;
  verified_by: string | null;
  steam_id: string | null;
  discord_id: string | null;
  status: string | null;
  visible_role: string | null;
  created_at: string | null;
  updated_at: string | null;
};


const notasRapidas = [
  "SteamID incorrecto. Corregí tu SteamID64 desde Mi Perfil y guardá los cambios.",
  "Discord ID incorrecto. Corregí tu Discord User ID desde Mi Perfil y guardá los cambios.",
  "PlayerID incorrecto. Corregí tu PlayerId solicitado desde Mi Perfil.",
  "Los datos no coinciden con Discord. Revisá PlayerId, SteamID64 y Discord ID.",
  "Falta evidencia para confirmar que el PlayerId pertenece al usuario.",
];

const filtros: { id: VerificationStatus; label: string; icono: string }[] = [
  { id: "pending", label: "Pendientes", icono: "⏳" },
  { id: "disputed", label: "Disputas", icono: "⚠️" },
  { id: "approved", label: "Aprobados", icono: "✅" },
  { id: "rejected", label: "Rechazados", icono: "❌" },
  { id: "all", label: "Todos", icono: "📋" },
];

function estadoClase(status?: string | null) {
  if (status === "approved") {
    return "border-green-400/25 bg-green-400/10 text-green-300";
  }

  if (status === "rejected") {
    return "border-red-400/25 bg-red-400/10 text-red-300";
  }

  if (status === "disputed") {
    return "border-orange-400/25 bg-orange-400/10 text-orange-300";
  }

  return "border-yellow-400/25 bg-yellow-400/10 text-yellow-300";
}

function estadoTexto(status?: string | null) {
  if (status === "approved") return "Aprobado";
  if (status === "rejected") return "Rechazado";
  if (status === "disputed") return "Disputa";
  return "Pendiente";
}

function inicial(nombre?: string | null) {
  return String(nombre || "A").slice(0, 1).toUpperCase();
}

export default function AdminVerificacionesPage() {
  const [perfiles, setPerfiles] = useState<PerfilVerificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [accionandoId, setAccionandoId] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<VerificationStatus>("pending");
  const [busqueda, setBusqueda] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [notas, setNotas] = useState<Record<string, string>>({});

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  async function cargarSolicitudes() {
    setLoading(true);
    setMensaje("");

    const { data, error } = await supabase
      .from("profiles")
      .select(
        "id,email,display_name,username,avatar_url,playerid,requested_playerid,playerid_verified,verification_status,verification_note,verified_at,verified_by,steam_id,discord_id,status,visible_role,created_at,updated_at",
      )
      .order("updated_at", { ascending: false });

    setLoading(false);

    if (error) {
      console.log(error);
      setMensaje("No pude cargar las verificaciones: " + error.message);
      return;
    }

    setPerfiles((data || []) as PerfilVerificacion[]);
  }

  const perfilesFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();

    return perfiles.filter((p) => {
      const status = p.verification_status || "pending";
      const coincideFiltro = filtro === "all" || status === filtro;

      const texto = [
        p.display_name,
        p.username,
        p.email,
        p.steam_id,
        p.discord_id,
        p.requested_playerid,
        p.playerid,
        p.status,
        p.visible_role,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const coincideBusqueda = !q || texto.includes(q);

      return coincideFiltro && coincideBusqueda;
    });
  }, [perfiles, filtro, busqueda]);

  const resumen = useMemo(() => {
    return {
      pending: perfiles.filter((p) => (p.verification_status || "pending") === "pending").length,
      disputed: perfiles.filter((p) => p.verification_status === "disputed").length,
      approved: perfiles.filter((p) => p.verification_status === "approved").length,
      rejected: perfiles.filter((p) => p.verification_status === "rejected").length,
      all: perfiles.length,
    };
  }, [perfiles]);


  const duplicadosPorPerfil = useMemo(() => {
    const mapa: Record<string, string[]> = {};

    perfiles.forEach((perfil) => {
      const alertas: string[] = [];

      if (
        perfil.steam_id &&
        perfiles.some((otro) => otro.id !== perfil.id && otro.steam_id === perfil.steam_id)
      ) {
        alertas.push("SteamID usado por otra cuenta");
      }

      if (
        perfil.discord_id &&
        perfiles.some((otro) => otro.id !== perfil.id && otro.discord_id === perfil.discord_id)
      ) {
        alertas.push("Discord ID usado por otra cuenta");
      }

      const playerSolicitado = String(perfil.requested_playerid || "").trim();

      if (
        playerSolicitado &&
        perfiles.some(
          (otro) =>
            otro.id !== perfil.id &&
            (otro.requested_playerid === playerSolicitado || otro.playerid === playerSolicitado),
        )
      ) {
        alertas.push("PlayerId solicitado usado por otra cuenta");
      }

      const playerVerificado = String(perfil.playerid || "").trim();

      if (
        playerVerificado &&
        perfiles.some(
          (otro) =>
            otro.id !== perfil.id &&
            (otro.playerid === playerVerificado || otro.requested_playerid === playerVerificado),
        )
      ) {
        alertas.push("PlayerId verificado usado por otra cuenta");
      }

      mapa[perfil.id] = alertas;
    });

    return mapa;
  }, [perfiles]);

  function notaPerfil(perfil: PerfilVerificacion, fallback: string) {
    return notas[perfil.id] ?? perfil.verification_note ?? fallback;
  }


  async function crearNotificacion({
    userId,
    tipo,
    titulo,
    mensaje,
    href = "/perfil",
  }: {
    userId: string;
    tipo: string;
    titulo: string;
    mensaje: string;
    href?: string;
  }) {
    const { error } = await supabase.from("notificaciones").insert({
      user_id: userId,
      tipo,
      titulo,
      mensaje,
      href,
      leida: false,
    });

    if (error) {
      console.log("No pude crear la notificación:", error);
    }
  }



  async function aprobar(perfil: PerfilVerificacion) {
    setMensaje("");

    const solicitado = String(perfil.requested_playerid || "").trim();

    if (!solicitado) {
      setMensaje("No se puede aprobar: el usuario no tiene PlayerId solicitado.");
      return;
    }

    const alertasDuplicado = duplicadosPorPerfil[perfil.id] || [];

    if (alertasDuplicado.length > 0) {
      setMensaje(
        `No se recomienda aprobar: ${alertasDuplicado.join(", ")}. Revisá el caso o marcá disputa.`,
      );
      return;
    }

    const confirmar = window.confirm(
      `¿Aprobar PlayerId "${solicitado}" para ${perfil.display_name || perfil.username || perfil.email || "este usuario"}?`,
    );

    if (!confirmar) return;

    setAccionandoId(perfil.id);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("profiles")
      .update({
        playerid: solicitado,
        playerid_verified: true,
        verification_status: "approved",
        verification_note: notaPerfil(perfil, "PlayerId aprobado por administración APA."),
        verified_at: new Date().toISOString(),
        verified_by: user?.id || null,
        status: perfil.status === "pending" ? "active" : perfil.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", perfil.id);

    setAccionandoId(null);

    if (error) {
      console.log(error);

      if (error.message.toLowerCase().includes("duplicate") || error.code === "23505") {
        setMensaje(
          "No se pudo aprobar: ese PlayerId ya está usado por otro perfil. Marcá este caso como disputa.",
        );
      } else {
        setMensaje("Error aprobando PlayerId: " + error.message);
      }

      return;
    }

    await crearNotificacion({
      userId: perfil.id,
      tipo: "approved",
      titulo: "Verificación aprobada",
      mensaje: `Tu PlayerId ${solicitado} fue aprobado por el staff APA.`,
      href: "/perfil",
    });

    setMensaje("PlayerId aprobado correctamente.");
    await cargarSolicitudes();
  }

  async function rechazar(perfil: PerfilVerificacion) {
    setMensaje("");

    const confirmar = window.confirm(
      `¿Rechazar la solicitud de ${perfil.display_name || perfil.username || perfil.email || "este usuario"}?`,
    );

    if (!confirmar) return;

    setAccionandoId(perfil.id);

    const { error } = await supabase
      .from("profiles")
      .update({
        playerid_verified: false,
        verification_status: "rejected",
        verification_note: notaPerfil(
          perfil,
          "Solicitud rechazada. No se pudo comprobar que el PlayerId pertenezca al usuario.",
        ),
        verified_at: null,
        verified_by: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", perfil.id);

    setAccionandoId(null);

    if (error) {
      console.log(error);
      setMensaje("Error rechazando solicitud: " + error.message);
      return;
    }

    await crearNotificacion({
      userId: perfil.id,
      tipo: "rejected",
      titulo: "Verificación rechazada",
      mensaje: notaPerfil(perfil, "Tu solicitud fue rechazada. Revisá tus datos en Mi Perfil."),
      href: "/perfil",
    });

    setMensaje("Solicitud rechazada.");
    await cargarSolicitudes();
  }

  async function disputar(perfil: PerfilVerificacion) {
    setMensaje("");

    setAccionandoId(perfil.id);

    const { error } = await supabase
      .from("profiles")
      .update({
        playerid_verified: false,
        verification_status: "disputed",
        verification_note: notaPerfil(
          perfil,
          "Solicitud marcada como disputa. Hay conflicto o falta prueba de identidad.",
        ),
        verified_at: null,
        verified_by: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", perfil.id);

    setAccionandoId(null);

    if (error) {
      console.log(error);
      setMensaje("Error marcando disputa: " + error.message);
      return;
    }

    await crearNotificacion({
      userId: perfil.id,
      tipo: "disputed",
      titulo: "Tu cuenta está en disputa",
      mensaje: notaPerfil(perfil, "El staff detectó un problema con tus datos. Corregilos desde Mi Perfil."),
      href: "/perfil",
    });

    setMensaje("Solicitud marcada como disputa.");
    await cargarSolicitudes();
  }

  async function volverAPendiente(perfil: PerfilVerificacion) {
    setMensaje("");

    setAccionandoId(perfil.id);

    const { error } = await supabase
      .from("profiles")
      .update({
        playerid_verified: false,
        verification_status: "pending",
        verification_note: notaPerfil(perfil, "Solicitud devuelta a revisión pendiente."),
        verified_at: null,
        verified_by: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", perfil.id);

    setAccionandoId(null);

    if (error) {
      console.log(error);
      setMensaje("Error devolviendo a pendiente: " + error.message);
      return;
    }

    await crearNotificacion({
      userId: perfil.id,
      tipo: "pending",
      titulo: "Verificación pendiente",
      mensaje: notaPerfil(perfil, "Tu solicitud volvió a revisión pendiente."),
      href: "/perfil",
    });

    setMensaje("Solicitud devuelta a pendiente.");
    await cargarSolicitudes();
  }

  async function desvincular(perfil: PerfilVerificacion) {
    setMensaje("");

    const confirmar = window.confirm(
      `¿Desvincular el PlayerId verificado de ${perfil.display_name || perfil.username || perfil.email || "este usuario"}?`,
    );

    if (!confirmar) return;

    setAccionandoId(perfil.id);

    const { error } = await supabase
      .from("profiles")
      .update({
        playerid: null,
        playerid_verified: false,
        verification_status: "pending",
        verification_note: notaPerfil(perfil, "PlayerId desvinculado por administración APA."),
        verified_at: null,
        verified_by: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", perfil.id);

    setAccionandoId(null);

    if (error) {
      console.log(error);
      setMensaje("Error desvinculando PlayerId: " + error.message);
      return;
    }

    await crearNotificacion({
      userId: perfil.id,
      tipo: "pending",
      titulo: "PlayerId desvinculado",
      mensaje: notaPerfil(perfil, "Tu PlayerId fue desvinculado y vuelve a revisión pendiente."),
      href: "/perfil",
    });

    setMensaje("PlayerId desvinculado. El perfil vuelve a pendiente.");
    await cargarSolicitudes();
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top,#123a7a_0%,#081427_24%,#020714_55%,#000_100%)] text-white">
      <section className="mx-auto max-w-[1500px] space-y-6 px-3 py-5 sm:px-4 md:space-y-8 md:px-8 md:py-8">
        <section className="relative overflow-hidden rounded-[28px] border border-yellow-500/30 bg-[#020714] p-5 shadow-[0_0_55px_rgba(250,204,21,.12)] sm:rounded-[38px] md:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,.16),transparent_42%)]" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/82 to-black/25" />

          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-yellow-300 sm:text-xs sm:tracking-[0.45em]">
                Panel administrativo
              </p>

              <h1 className="mt-4 text-[clamp(2.3rem,8vw,5rem)] font-black uppercase italic leading-none">
                Verificaciones
              </h1>

              <p className="mt-5 max-w-3xl text-sm leading-7 text-zinc-400 sm:text-base md:text-lg">
                Revisá solicitudes de PlayerId, Steam ID y perfiles. Solo los PlayerId aprobados quedan vinculados oficialmente a estadísticas y perfiles.
              </p>
            </div>

            <button
              type="button"
              onClick={cargarSolicitudes}
              disabled={loading}
              className="rounded-2xl border border-yellow-400/30 bg-yellow-400 px-5 py-4 text-sm font-black uppercase text-black transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Cargando..." : "Actualizar"}
            </button>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {[
            ["⏳ Pendientes", resumen.pending, "text-yellow-300", "border-yellow-400/25 bg-yellow-400/10"],
            ["⚠ Disputas", resumen.disputed, "text-orange-300", "border-orange-400/25 bg-orange-400/10"],
            ["✅ Aprobados", resumen.approved, "text-green-300", "border-green-400/25 bg-green-400/10"],
            ["❌ Rechazados", resumen.rejected, "text-red-300", "border-red-400/25 bg-red-400/10"],
            ["📋 Total", resumen.all, "text-sky-300", "border-sky-400/25 bg-sky-400/10"],
          ].map(([label, value, color, clase]) => (
            <div
              key={String(label)}
              className={`rounded-2xl border p-4 ${clase}`}
            >
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                {label}
              </p>
              <p className={`mt-2 text-3xl font-black ${color}`}>
                {value}
              </p>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {filtros.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFiltro(f.id)}
              className={`rounded-2xl border px-3 py-3 text-xs font-black uppercase transition sm:px-4 sm:py-4 sm:text-sm ${
                filtro === f.id
                  ? "border-yellow-300 bg-yellow-400 text-black shadow-[0_0_22px_rgba(250,204,21,.28)]"
                  : "border-white/10 bg-[#020714] text-zinc-400 hover:border-yellow-400/50 hover:text-white"
              }`}
            >
              {f.icono} {f.label}
              <span className="ml-2 opacity-70">
                {resumen[f.id as keyof typeof resumen]}
              </span>
            </button>
          ))}
        </section>

        <section className="rounded-[28px] border border-sky-500/20 bg-[#020714] p-5 sm:rounded-[34px] md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-sky-300">
                Búsqueda
              </p>
              <h2 className="mt-2 text-2xl font-black uppercase sm:text-3xl">
                Solicitudes de identidad
              </h2>
            </div>

            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar usuario, Discord ID, Steam ID o PlayerId..."
              className="w-full rounded-2xl border border-sky-500/20 bg-black/35 px-5 py-4 text-sm text-white outline-none placeholder:text-zinc-700 focus:border-sky-400/60 md:max-w-md"
            />
          </div>

          {mensaje && (
            <p className="mt-5 rounded-2xl border border-yellow-400/25 bg-yellow-400/10 p-4 text-sm font-black text-yellow-300">
              {mensaje}
            </p>
          )}
        </section>

        {loading ? (
          <section className="rounded-[34px] border border-sky-500/20 bg-[#020714] p-10 text-center font-black uppercase tracking-[0.25em] text-sky-300">
            Cargando verificaciones...
          </section>
        ) : perfilesFiltrados.length === 0 ? (
          <section className="rounded-[34px] border border-white/10 bg-[#020714] p-10 text-center text-zinc-500">
            No hay perfiles para este filtro.
          </section>
        ) : (
          <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            {perfilesFiltrados.map((perfil) => {
              const solicitado = perfil.requested_playerid || "";
              const status = perfil.verification_status || "pending";
              const accionando = accionandoId === perfil.id;

              return (
                <article
                  key={perfil.id}
                  className="relative overflow-hidden rounded-[30px] border border-sky-500/20 bg-[#020714] p-5 shadow-[0_0_30px_rgba(0,120,255,.08)] sm:p-6"
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,.10),transparent_40%)]" />

                  <div className="relative z-10">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-sky-400/30 bg-sky-400/10 text-2xl font-black text-sky-300">
                          {perfil.avatar_url ? (
                            <img
                              src={perfil.avatar_url}
                              alt={perfil.display_name || perfil.username || "Avatar"}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            inicial(perfil.display_name || perfil.username || perfil.email)
                          )}
                        </div>

                        <div className="min-w-0">
                          <h3 className="break-words text-2xl font-black uppercase text-white">
                            {perfil.display_name || "Sin nombre"}
                          </h3>

                          <p className="mt-1 truncate text-sm font-bold text-sky-300">
                            @{perfil.username || "sin_usuario"}
                          </p>

                          <p className="mt-1 truncate text-xs text-zinc-600">
                            {perfil.email || "email privado"}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`w-fit rounded-2xl border px-4 py-2 text-xs font-black uppercase tracking-[0.18em] ${estadoClase(status)}`}
                      >
                        {estadoTexto(status)}
                      </span>
                    </div>

                    {(duplicadosPorPerfil[perfil.id] || []).length > 0 && (
                      <div className="mt-5 rounded-2xl border border-red-400/25 bg-red-400/10 p-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-red-300">
                          ⚠ Posibles duplicados
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {duplicadosPorPerfil[perfil.id].map((alerta) => (
                            <span
                              key={alerta}
                              className="rounded-xl border border-red-400/25 bg-black/35 px-3 py-2 text-[10px] font-black uppercase text-red-200"
                            >
                              {alerta}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">
                          PlayerId solicitado
                        </p>
                        <p className="mt-2 break-words text-xl font-black text-yellow-300">
                          {solicitado || "Sin solicitud"}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">
                          PlayerId verificado
                        </p>
                        <p className={`mt-2 break-words text-xl font-black ${perfil.playerid_verified ? "text-green-300" : "text-zinc-500"}`}>
                          {perfil.playerid_verified ? perfil.playerid || "Verificado" : "Sin verificar"}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">
                          Steam ID
                        </p>
                        <p className="mt-2 break-words text-sm font-black text-zinc-300">
                          {perfil.steam_id || "Sin Steam ID"}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">
                          Discord ID
                        </p>
                        <p className="mt-2 break-words text-sm font-black text-indigo-300">
                          {perfil.discord_id || "Sin Discord ID"}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">
                          Cuenta
                        </p>
                        <p className="mt-2 text-sm font-black text-zinc-300">
                          Estado: <span className="text-yellow-300">{perfil.status || "pending"}</span>
                        </p>
                        <p className="mt-1 text-sm font-black text-zinc-300">
                          Rol: <span className="text-sky-300">{perfil.visible_role || "usuario"}</span>
                        </p>
                      </div>
                    </div>

                    <div className="mt-5">
                      <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">
                        Nota de verificación
                      </label>
                      
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => navigator.clipboard.writeText(perfil.steam_id || "")}
                          className="rounded-xl border border-cyan-400/25 bg-cyan-400/10 px-3 py-2 text-[10px] font-black uppercase text-cyan-300"
                        >
                          Copiar SteamID
                        </button>

                        <button
                          type="button"
                          onClick={() => navigator.clipboard.writeText(perfil.discord_id || "")}
                          className="rounded-xl border border-indigo-400/25 bg-indigo-400/10 px-3 py-2 text-[10px] font-black uppercase text-indigo-300"
                        >
                          Copiar Discord ID
                        </button>
                      </div>
<div className="mb-3 flex flex-wrap gap-2">
                        {notasRapidas.map((nota) => (
                          <button
                            key={nota}
                            type="button"
                            onClick={() =>
                              setNotas((prev) => ({
                                ...prev,
                                [perfil.id]: nota,
                              }))
                            }
                            className="rounded-xl border border-orange-400/20 bg-orange-400/10 px-3 py-2 text-[10px] font-black uppercase text-orange-300 transition hover:bg-orange-400 hover:text-black"
                          >
                            {nota.split(".")[0]}
                          </button>
                        ))}
                      </div>

                      <textarea
                        value={notas[perfil.id] ?? perfil.verification_note ?? ""}
                        onChange={(e) =>
                          setNotas((prev) => ({
                            ...prev,
                            [perfil.id]: e.target.value,
                          }))
                        }
                        placeholder="Ej: confirmado por capitán / no coincide / falta prueba..."
                        className="min-h-[92px] w-full rounded-2xl border border-sky-500/20 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-700 focus:border-sky-400/60"
                      />
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      <button
                        type="button"
                        onClick={() => aprobar(perfil)}
                        disabled={accionando || !solicitado}
                        className="rounded-2xl border border-green-400/30 bg-green-400/10 px-4 py-3 text-xs font-black uppercase text-green-300 transition hover:bg-green-400 hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        ✅ Aprobar
                      </button>

                      <button
                        type="button"
                        onClick={() => rechazar(perfil)}
                        disabled={accionando}
                        className="rounded-2xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-xs font-black uppercase text-red-300 transition hover:bg-red-400 hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        ❌ Rechazar
                      </button>

                      <button
                        type="button"
                        onClick={() => disputar(perfil)}
                        disabled={accionando}
                        className="rounded-2xl border border-orange-400/30 bg-orange-400/10 px-4 py-3 text-xs font-black uppercase text-orange-300 transition hover:bg-orange-400 hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        ⚠️ Disputa
                      </button>

                      {perfil.playerid_verified ? (
                        <button
                          type="button"
                          onClick={() => desvincular(perfil)}
                          disabled={accionando}
                          className="rounded-2xl border border-zinc-400/30 bg-zinc-400/10 px-4 py-3 text-xs font-black uppercase text-zinc-300 transition hover:bg-zinc-300 hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          🔓 Desvincular
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => volverAPendiente(perfil)}
                          disabled={accionando}
                          className="rounded-2xl border border-sky-400/30 bg-sky-400/10 px-4 py-3 text-xs font-black uppercase text-sky-300 transition hover:bg-sky-400 hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          🔄 Pendiente
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </section>
    </main>
  );
}
