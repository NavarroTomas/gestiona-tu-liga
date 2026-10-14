"use client";

import { useEffect, useMemo, useState } from "react";
import PermissionGuard from "@/components/PermissionGuard";
import {
  ADMIN_PERMISSIONS,
  AdminPermissionDefinition,
  clearAdminPermissionsCache,
} from "@/lib/adminPermissions";
import { supabase } from "@/lib/supabase";

type AdminUserRow = {
  id: string;
  email: string | null;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  permission_codes: string[] | null;
};

type PermissionRow = {
  id: number;
  code: string;
  name: string;
  description: string | null;
};

function userLabel(user: AdminUserRow) {
  return (
    user.display_name ||
    user.username ||
    user.email ||
    user.id.slice(0, 8)
  );
}

function normalizeCodes(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export default function AdminPermisosPage() {
  const [usuarios, setUsuarios] = useState<AdminUserRow[]>([]);
  const [permisosDb, setPermisosDb] = useState<PermissionRow[]>([]);
  const [seleccionados, setSeleccionados] = useState<Record<string, string[]>>({});
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    setLoading(true);
    setMensaje("");

    const [usuariosRes, permisosRes] = await Promise.all([
      supabase.rpc("list_admin_permission_users"),
      supabase.rpc("list_admin_permissions"),
    ]);

    if (usuariosRes.error) {
      console.log(usuariosRes.error);
      setMensaje("Error cargando usuarios: " + usuariosRes.error.message);
      setLoading(false);
      return;
    }

    if (permisosRes.error) {
      console.log(permisosRes.error);
      setMensaje("Error cargando permisos: " + permisosRes.error.message);
      setLoading(false);
      return;
    }

    const usuariosData = (usuariosRes.data || []) as AdminUserRow[];
    const permisosData = (permisosRes.data || []) as PermissionRow[];

    const base: Record<string, string[]> = {};
    usuariosData.forEach((usuario) => {
      base[usuario.id] = normalizeCodes(usuario.permission_codes);
    });

    setUsuarios(usuariosData);
    setPermisosDb(permisosData);
    setSeleccionados(base);
    setLoading(false);
  }

  const permisosDisponibles = useMemo(() => {
    const dbMap = new Map(permisosDb.map((p) => [p.code, p]));

    return ADMIN_PERMISSIONS.map((permiso) => {
      const db = dbMap.get(permiso.code);

      return {
        ...permiso,
        name: db?.name || permiso.name,
        description: db?.description || permiso.description,
      };
    });
  }, [permisosDb]);

  const grupos = useMemo(() => {
    const agrupado: Record<string, AdminPermissionDefinition[]> = {};

    permisosDisponibles.forEach((permiso) => {
      if (!agrupado[permiso.group]) agrupado[permiso.group] = [];
      agrupado[permiso.group].push(permiso);
    });

    return Object.entries(agrupado);
  }, [permisosDisponibles]);

  const usuariosFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();

    return usuarios.filter((usuario) => {
      if (!q) return true;

      return (
        usuario.email?.toLowerCase().includes(q) ||
        usuario.display_name?.toLowerCase().includes(q) ||
        usuario.username?.toLowerCase().includes(q)
      );
    });
  }, [usuarios, busqueda]);

  function tienePermiso(userId: string, code: string) {
    return (seleccionados[userId] || []).includes(code);
  }

  function togglePermiso(userId: string, code: string) {
    setSeleccionados((prev) => {
      const actual = new Set(prev[userId] || []);

      if (actual.has(code)) {
        actual.delete(code);
      } else {
        actual.add(code);
      }

      return {
        ...prev,
        [userId]: Array.from(actual),
      };
    });
  }

  function seleccionarGrupo(userId: string, permisos: AdminPermissionDefinition[]) {
    setSeleccionados((prev) => {
      const actual = new Set(prev[userId] || []);
      permisos.forEach((permiso) => actual.add(permiso.code));

      return {
        ...prev,
        [userId]: Array.from(actual),
      };
    });
  }

  function limpiarUsuario(userId: string) {
    const confirmar = window.confirm(
      "Vas a quitar todos los permisos directos de este usuario. ¿Continuar?",
    );

    if (!confirmar) return;

    setSeleccionados((prev) => ({
      ...prev,
      [userId]: [],
    }));
  }

  async function guardarUsuario(usuario: AdminUserRow) {
    setGuardando(usuario.id);
    setMensaje("");

    const permissionCodes = seleccionados[usuario.id] || [];

    const { error } = await supabase.rpc("set_user_direct_permissions", {
      target_user_id: usuario.id,
      permission_codes: permissionCodes,
    });

    if (error) {
      console.log(error);
      setMensaje("Error guardando permisos: " + error.message);
      setGuardando(null);
      return;
    }

    clearAdminPermissionsCache();
    setMensaje(`Permisos actualizados para ${userLabel(usuario)}.`);
    setGuardando(null);
    await cargarDatos();
  }

  return (
    <PermissionGuard permission="admin.permissions.manage">
      <main className="min-h-screen bg-[#050914] text-white">
        <div className="mx-auto max-w-[1600px] space-y-8 px-4 py-10 md:px-8">
          <section className="relative overflow-hidden rounded-[34px] border border-cyan-500/25 bg-[#0b1020] p-7 shadow-[0_0_45px_rgba(34,211,238,.12)] md:p-9">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,.18),transparent_42%)]" />

            <div className="relative z-10">
              <p className="text-xs font-black uppercase tracking-[0.35em] text-cyan-300">
                Seguridad Liga
              </p>

              <h1 className="mt-3 text-4xl font-black uppercase md:text-6xl">
                Permisos Admin
              </h1>

              <p className="mt-4 max-w-4xl text-zinc-400">
                Marcá exactamente qué zonas administrativas puede usar cada usuario.
                La página pública sigue disponible para todos; esto solo controla
                el panel interno.
              </p>
            </div>
          </section>

          {mensaje && (
            <section className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 px-5 py-4 font-black text-yellow-300">
              {mensaje}
            </section>
          )}

          <section className="rounded-[28px] border border-sky-500/20 bg-[#020714] p-5">
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por email, usuario o nombre..."
              className="w-full rounded-2xl border border-sky-500/20 bg-black/45 px-5 py-4 font-black text-white outline-none transition placeholder:text-zinc-600 focus:border-sky-400"
            />
          </section>

          {loading ? (
            <section className="rounded-[30px] border border-sky-500/20 bg-[#020714] p-10 text-center font-black uppercase tracking-[0.25em] text-sky-300">
              Cargando permisos...
            </section>
          ) : (
            <section className="space-y-6">
              {usuariosFiltrados.map((usuario) => (
                <article
                  key={usuario.id}
                  className="rounded-[32px] border border-sky-500/20 bg-[#020714] p-5 shadow-[0_0_30px_rgba(0,120,255,.10)]"
                >
                  <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-sky-400/30 bg-sky-400/10 text-xl font-black text-sky-300">
                        {usuario.avatar_url ? (
                          <img
                            src={usuario.avatar_url}
                            alt={userLabel(usuario)}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          userLabel(usuario).slice(0, 1).toUpperCase()
                        )}
                      </div>

                      <div className="min-w-0">
                        <h2 className="truncate text-2xl font-black uppercase">
                          {userLabel(usuario)}
                        </h2>

                        <p className="truncate text-sm text-zinc-500">
                          {usuario.email || "Sin email"} · {usuario.id}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => limpiarUsuario(usuario.id)}
                        className="rounded-2xl border border-red-400/25 bg-red-400/10 px-5 py-3 text-xs font-black uppercase text-red-300 transition hover:bg-red-400 hover:text-black"
                      >
                        Limpiar
                      </button>

                      <button
                        type="button"
                        disabled={guardando === usuario.id}
                        onClick={() => guardarUsuario(usuario)}
                        className="rounded-2xl border border-emerald-400/25 bg-emerald-400 px-5 py-3 text-xs font-black uppercase text-black transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {guardando === usuario.id ? "Guardando..." : "Guardar permisos"}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    {grupos.map(([grupo, permisos]) => (
                      <section
                        key={`${usuario.id}-${grupo}`}
                        className="rounded-[24px] border border-white/10 bg-black/30 p-4"
                      >
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-sky-300">
                            {grupo}
                          </p>

                          <button
                            type="button"
                            onClick={() => seleccionarGrupo(usuario.id, permisos)}
                            className="rounded-xl border border-sky-400/20 bg-sky-400/10 px-3 py-2 text-[10px] font-black uppercase text-sky-300 transition hover:bg-sky-400 hover:text-black"
                          >
                            Marcar grupo
                          </button>
                        </div>

                        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                          {permisos.map((permiso) => {
                            const activo = tienePermiso(usuario.id, permiso.code);

                            return (
                              <button
                                key={`${usuario.id}-${permiso.code}`}
                                type="button"
                                onClick={() => togglePermiso(usuario.id, permiso.code)}
                                className={`rounded-2xl border p-4 text-left transition ${
                                  activo
                                    ? "border-emerald-300 bg-emerald-400/15 shadow-[0_0_18px_rgba(52,211,153,.12)]"
                                    : "border-white/10 bg-black/35 hover:border-sky-400/35"
                                }`}
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <p className="font-black uppercase text-white">
                                    {permiso.name}
                                  </p>

                                  <span
                                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-xs font-black ${
                                      activo
                                        ? "border-emerald-300 bg-emerald-400 text-black"
                                        : "border-zinc-600 bg-black text-zinc-600"
                                    }`}
                                  >
                                    {activo ? "✓" : ""}
                                  </span>
                                </div>

                                <p className="mt-2 text-xs leading-5 text-zinc-500">
                                  {permiso.description}
                                </p>

                                <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">
                                  {permiso.code}
                                </p>
                              </button>
                            );
                          })}
                        </div>
                      </section>
                    ))}
                  </div>
                </article>
              ))}
            </section>
          )}
        </div>
      </main>
    </PermissionGuard>
  );
}
