"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import PermissionGuard from "@/components/PermissionGuard";

type Profile = {
  id: string;
  email: string | null;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  playerid: string | null;
  steam_id: string | null;
  status: string;
  visible_role: string | null;
  created_at: string;
};

const estadoStyles: Record<string, string> = {
  pending: "border-yellow-400/30 bg-yellow-400/10 text-yellow-300",
  active: "border-green-400/30 bg-green-400/10 text-green-300",
  suspended: "border-red-400/30 bg-red-400/10 text-red-300",
  rejected: "border-zinc-400/30 bg-zinc-400/10 text-zinc-300",
};

function formatDate(value?: string | null) {
  if (!value) return "-";

  try {
    return new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function userLabel(profile: Profile) {
  return profile.display_name || profile.username || profile.email || profile.id.slice(0, 8);
}

export default function AdminUsuariosPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [accionando, setAccionando] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("todos");

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    setLoading(true);
    setMensaje("");

    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, display_name, username, playerid, steam_id, status, visible_role, avatar_url, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error);
      setMensaje("Error cargando perfiles: " + error.message);
      setLoading(false);
      return;
    }

    setProfiles((data || []) as Profile[]);
    setLoading(false);
  }

  const perfilesFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();

    return profiles.filter((profile) => {
      const coincideEstado = estadoFiltro === "todos" || profile.status === estadoFiltro;
      const texto = [
        profile.email,
        profile.display_name,
        profile.username,
        profile.playerid,
        profile.steam_id,
        profile.visible_role,
        profile.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return coincideEstado && (!q || texto.includes(q));
    });
  }, [profiles, busqueda, estadoFiltro]);

  async function actualizarEstado(profile: Profile, status: string) {
    setAccionando(profile.id);
    setMensaje("");

    const { error } = await supabase
      .from("profiles")
      .update({ status })
      .eq("id", profile.id);

    if (error) {
      console.log(error);
      setMensaje("Error actualizando usuario: " + error.message);
      setAccionando(null);
      return;
    }

    setMensaje(`Usuario ${userLabel(profile)} actualizado a ${status}.`);
    setAccionando(null);
    await cargarDatos();
  }

  return (
    <PermissionGuard permission="admin.users.manage">
      <main className="min-h-screen bg-[#050914] text-white">
        <section className="mx-auto max-w-[1600px] space-y-8 px-4 py-10 md:px-8">
          <section className="relative overflow-hidden rounded-[34px] border border-purple-500/25 bg-[#0b1020] p-7 shadow-[0_0_45px_rgba(168,85,247,.12)] md:p-9">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,.18),transparent_42%)]" />
            <div className="relative z-10">
              <p className="text-xs font-black uppercase tracking-[0.35em] text-purple-300">
                Comunidad Liga
              </p>
              <h1 className="mt-3 text-4xl font-black uppercase md:text-6xl">
                Usuarios
              </h1>
              <p className="mt-4 max-w-4xl text-zinc-400">
                Administrá estado de usuarios. Los permisos administrativos ahora se manejan desde el panel seguro de permisos.
              </p>

              <Link
                href="/admin/permisos"
                className="mt-5 inline-flex rounded-2xl border border-cyan-400/25 bg-cyan-400/10 px-5 py-3 text-xs font-black uppercase tracking-[0.2em] text-cyan-300 transition hover:bg-cyan-400 hover:text-black"
              >
                Ir a permisos →
              </Link>
            </div>
          </section>

          {mensaje && (
            <section className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-4 text-yellow-300">
              {mensaje}
            </section>
          )}

          <section className="rounded-[28px] border border-sky-500/20 bg-[#020714] p-5">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_220px]">
              <input
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por email, usuario, PlayerId o SteamID..."
                className="input"
              />

              <select
                value={estadoFiltro}
                onChange={(e) => setEstadoFiltro(e.target.value)}
                className="input"
              >
                <option value="todos">Todos</option>
                <option value="pending">Pendientes</option>
                <option value="active">Activos</option>
                <option value="suspended">Suspendidos</option>
                <option value="rejected">Rechazados</option>
              </select>
            </div>
          </section>

          {loading ? (
            <section className="rounded-[30px] border border-sky-500/20 bg-[#020714] p-10 text-center font-black uppercase tracking-[0.25em] text-sky-300">
              Cargando usuarios...
            </section>
          ) : (
            <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {perfilesFiltrados.map((profile) => (
                <article
                  key={profile.id}
                  className="rounded-[28px] border border-sky-500/20 bg-[#020714] p-5"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-sky-400/30 bg-sky-400/10 text-xl font-black text-sky-300">
                        {profile.avatar_url ? (
                          <img
                            src={profile.avatar_url}
                            alt={userLabel(profile)}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          userLabel(profile).slice(0, 1).toUpperCase()
                        )}
                      </div>

                      <div className="min-w-0">
                        <h2 className="truncate text-2xl font-black uppercase">
                          {userLabel(profile)}
                        </h2>
                        <p className="truncate text-sm text-zinc-500">
                          {profile.email || "Sin email"}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-black uppercase ${
                        estadoStyles[profile.status] || "border-zinc-500/30 bg-zinc-500/10 text-zinc-300"
                      }`}
                    >
                      {profile.status}
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                    <p className="rounded-2xl border border-white/10 bg-black/30 p-3 text-zinc-400">
                      <b className="text-zinc-200">PlayerId:</b> {profile.playerid || "-"}
                    </p>
                    <p className="rounded-2xl border border-white/10 bg-black/30 p-3 text-zinc-400">
                      <b className="text-zinc-200">SteamID:</b> {profile.steam_id || "-"}
                    </p>
                    <p className="rounded-2xl border border-white/10 bg-black/30 p-3 text-zinc-400">
                      <b className="text-zinc-200">Rol visible:</b> {profile.visible_role || "-"}
                    </p>
                    <p className="rounded-2xl border border-white/10 bg-black/30 p-3 text-zinc-400">
                      <b className="text-zinc-200">Registro:</b> {formatDate(profile.created_at)}
                    </p>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {["active", "pending", "suspended", "rejected"].map((status) => (
                      <button
                        key={status}
                        disabled={accionando === profile.id}
                        onClick={() => actualizarEstado(profile, status)}
                        className="rounded-xl border border-white/10 bg-black/35 px-4 py-2 text-xs font-black uppercase text-zinc-300 transition hover:border-sky-400/40 hover:text-sky-300 disabled:opacity-50"
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </article>
              ))}
            </section>
          )}
        </section>
      </main>
    </PermissionGuard>
  );
}
