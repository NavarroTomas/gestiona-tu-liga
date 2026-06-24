"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import PermissionGuard from "@/components/PermissionGuard";


type Tab = "usuarios" | "roles" | "permisos";

type Profile = {
  id: string;
  email: string | null;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  playerid: string | null;
  steam_id: string | null;
  status: "pending" | "active" | "rejected" | "suspended" | string;
  visible_role: string | null;
  created_at: string;
};

type Role = {
  id: number;
  code: string;
  name: string;
  description: string | null;
  created_at?: string;
};

type Permission = {
  id: number;
  code: string;
  name: string;
  description: string | null;
  created_at?: string;
};

type UserRole = {
  user_id: string;
  role_id: number;
};

type RolePermission = {
  role_id: number;
  permission_id: number;
};

const estadoStyles: Record<string, string> = {
  pending: "border-yellow-400/30 bg-yellow-400/10 text-yellow-300",
  active: "border-green-400/30 bg-green-400/10 text-green-300",
  suspended: "border-red-400/30 bg-red-400/10 text-red-300",
  rejected: "border-zinc-400/30 bg-zinc-400/10 text-zinc-300",
};

const rolStyles: Record<string, string> = {
  super_admin: "border-fuchsia-400/30 bg-fuchsia-400/10 text-fuchsia-300",
  admin: "border-sky-400/30 bg-sky-400/10 text-sky-300",
  staff: "border-yellow-400/30 bg-yellow-400/10 text-yellow-300",
  usuario: "border-zinc-400/30 bg-zinc-400/10 text-zinc-300",
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

function normalizeCode(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_.-]/g, "");
}

export default function AdminUsuariosPage() {
  const [tab, setTab] = useState<Tab>("usuarios");

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);

  const [loading, setLoading] = useState(true);
  const [accionando, setAccionando] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState("");

  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("todos");
  const [rolSeleccionado, setRolSeleccionado] = useState<Record<string, string>>({});

  const [nuevoRolCode, setNuevoRolCode] = useState("");
  const [nuevoRolName, setNuevoRolName] = useState("");
  const [nuevoRolDescription, setNuevoRolDescription] = useState("");

  const [nuevoPermisoCode, setNuevoPermisoCode] = useState("");
  const [nuevoPermisoName, setNuevoPermisoName] = useState("");
  const [nuevoPermisoDescription, setNuevoPermisoDescription] = useState("");

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    setLoading(true);
    setMensaje("");

    const [profilesRes, rolesRes, permissionsRes, userRolesRes, rolePermissionsRes] =
      await Promise.all([
        supabase
          .from("profiles")
          .select("id, email, display_name, username, playerid, steam_id, status, visible_role, avatar_url, created_at")
          .order("created_at", { ascending: false }),
        supabase
          .from("roles")
          .select("id, code, name, description, created_at")
          .order("id", { ascending: true }),
        supabase
          .from("permissions")
          .select("id, code, name, description, created_at")
          .order("code", { ascending: true }),
        supabase
          .from("user_roles")
          .select("user_id, role_id"),
        supabase
          .from("role_permissions")
          .select("role_id, permission_id"),
      ]);

    if (profilesRes.error) {
      console.log(profilesRes.error);
      setMensaje("Error cargando perfiles: " + profilesRes.error.message);
      setLoading(false);
      return;
    }

    if (rolesRes.error) {
      console.log(rolesRes.error);
      setMensaje("Error cargando roles: " + rolesRes.error.message);
      setLoading(false);
      return;
    }

    if (permissionsRes.error) {
      console.log(permissionsRes.error);
      setMensaje("Error cargando permisos: " + permissionsRes.error.message);
      setLoading(false);
      return;
    }

    if (userRolesRes.error) {
      console.log(userRolesRes.error);
      setMensaje("Error cargando roles de usuarios: " + userRolesRes.error.message);
      setLoading(false);
      return;
    }

    if (rolePermissionsRes.error) {
      console.log(rolePermissionsRes.error);
      setMensaje("Error cargando permisos por rol: " + rolePermissionsRes.error.message);
      setLoading(false);
      return;
    }

    setProfiles((profilesRes.data || []) as unknown as Profile[]);
    setRoles((rolesRes.data || []) as unknown as Role[]);
    setPermissions((permissionsRes.data || []) as unknown as Permission[]);
    setUserRoles((userRolesRes.data || []) as unknown as UserRole[]);
    setRolePermissions((rolePermissionsRes.data || []) as unknown as RolePermission[]);
    setLoading(false);
  }

  const roleById = useMemo(() => {
    const map: Record<number, Role> = {};
    roles.forEach((rol) => {
      map[rol.id] = rol;
    });
    return map;
  }, [roles]);

  function rolesDelUsuario(userId: string) {
    return userRoles
      .filter((ur) => ur.user_id === userId)
      .map((ur) => roleById[ur.role_id])
      .filter(Boolean);
  }

  function roleHasPermission(roleId: number, permissionId: number) {
    return rolePermissions.some(
      (rp) => rp.role_id === roleId && rp.permission_id === permissionId,
    );
  }

  const perfilesFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();

    return profiles.filter((profile) => {
      const coincideTexto =
        !q ||
        profile.email?.toLowerCase().includes(q) ||
        profile.display_name?.toLowerCase().includes(q) ||
        profile.username?.toLowerCase().includes(q) ||
        profile.playerid?.toLowerCase().includes(q);

      const coincideEstado =
        estadoFiltro === "todos" || profile.status === estadoFiltro;

      return coincideTexto && coincideEstado;
    });
  }, [profiles, busqueda, estadoFiltro]);

  async function aprobarUsuario(profile: Profile) {
    setAccionando(profile.id);
    setMensaje("");

    const { error } = await supabase.rpc("approve_user", {
      target_user_id: profile.id,
    });

    if (error) {
      console.log(error);
      setMensaje("Error aprobando usuario: " + error.message);
      setAccionando(null);
      return;
    }

    setMensaje(`Usuario aprobado: ${profile.email || profile.display_name || profile.id}`);
    setAccionando(null);
    await cargarDatos();
  }

  async function suspenderUsuario(profile: Profile) {
    const confirmar = window.confirm(
      `¿Seguro que querés suspender a ${profile.email || profile.display_name || profile.id}?`,
    );

    if (!confirmar) return;

    setAccionando(profile.id);
    setMensaje("");

    const { error } = await supabase.rpc("suspend_user", {
      target_user_id: profile.id,
    });

    if (error) {
      console.log(error);
      setMensaje("Error suspendiendo usuario: " + error.message);
      setAccionando(null);
      return;
    }

    setMensaje(`Usuario suspendido: ${profile.email || profile.display_name || profile.id}`);
    setAccionando(null);
    await cargarDatos();
  }

  async function asignarRol(profile: Profile) {
    const roleCode = rolSeleccionado[profile.id];

    if (!roleCode) {
      setMensaje("Seleccioná un rol antes de asignar.");
      return;
    }

    setAccionando(profile.id);
    setMensaje("");

    const { error } = await supabase.rpc("assign_role_to_user", {
      target_user_id: profile.id,
      role_code: roleCode,
    });

    if (error) {
      console.log(error);
      setMensaje("Error asignando rol: " + error.message);
      setAccionando(null);
      return;
    }

    setMensaje(`Rol asignado: ${roleCode}`);
    setAccionando(null);
    await cargarDatos();
  }

  async function quitarRol(profile: Profile, roleCode: string) {
    const confirmar = window.confirm(
      `¿Seguro que querés quitar el rol ${roleCode} a ${profile.email || profile.display_name || profile.id}?`,
    );

    if (!confirmar) return;

    setAccionando(profile.id);
    setMensaje("");

    const { error } = await supabase.rpc("remove_role_from_user", {
      target_user_id: profile.id,
      role_code: roleCode,
    });

    if (error) {
      console.log(error);
      setMensaje("Error quitando rol: " + error.message);
      setAccionando(null);
      return;
    }

    setMensaje(`Rol quitado: ${roleCode}`);
    setAccionando(null);
    await cargarDatos();
  }

  async function crearRol() {
    const code = normalizeCode(nuevoRolCode || nuevoRolName);

    if (!code || !nuevoRolName.trim()) {
      setMensaje("Completá código y nombre del rol.");
      return;
    }

    setAccionando("crear-rol");
    setMensaje("");

    const { error } = await supabase.from("roles").insert({
      code,
      name: nuevoRolName.trim(),
      description: nuevoRolDescription.trim() || null,
    });

    if (error) {
      console.log(error);
      setMensaje("Error creando rol: " + error.message);
      setAccionando(null);
      return;
    }

    setNuevoRolCode("");
    setNuevoRolName("");
    setNuevoRolDescription("");
    setMensaje(`Rol creado: ${code}`);
    setAccionando(null);
    await cargarDatos();
  }

  async function eliminarRol(role: Role) {
    if (["super_admin", "admin", "staff", "usuario"].includes(role.code)) {
      setMensaje("No conviene eliminar roles base del sistema.");
      return;
    }

    const confirmar = window.confirm(`¿Seguro que querés eliminar el rol ${role.name}?`);
    if (!confirmar) return;

    setAccionando(`rol-${role.id}`);
    setMensaje("");

    const { error } = await supabase.from("roles").delete().eq("id", role.id);

    if (error) {
      console.log(error);
      setMensaje("Error eliminando rol: " + error.message);
      setAccionando(null);
      return;
    }

    setMensaje(`Rol eliminado: ${role.code}`);
    setAccionando(null);
    await cargarDatos();
  }

  async function crearPermiso() {
    const code = normalizeCode(nuevoPermisoCode || nuevoPermisoName);

    if (!code || !nuevoPermisoName.trim()) {
      setMensaje("Completá código y nombre del permiso.");
      return;
    }

    setAccionando("crear-permiso");
    setMensaje("");

    const { error } = await supabase.from("permissions").insert({
      code,
      name: nuevoPermisoName.trim(),
      description: nuevoPermisoDescription.trim() || null,
    });

    if (error) {
      console.log(error);
      setMensaje("Error creando permiso: " + error.message);
      setAccionando(null);
      return;
    }

    setNuevoPermisoCode("");
    setNuevoPermisoName("");
    setNuevoPermisoDescription("");
    setMensaje(`Permiso creado: ${code}`);
    setAccionando(null);
    await cargarDatos();
  }

  async function toggleRolePermission(role: Role, permission: Permission) {
    const existe = roleHasPermission(role.id, permission.id);

    setAccionando(`perm-${role.id}-${permission.id}`);
    setMensaje("");

    if (existe) {
      const { error } = await supabase
        .from("role_permissions")
        .delete()
        .eq("role_id", role.id)
        .eq("permission_id", permission.id);

      if (error) {
        console.log(error);
        setMensaje("Error quitando permiso: " + error.message);
        setAccionando(null);
        return;
      }

      setMensaje(`Permiso quitado: ${permission.code} → ${role.code}`);
    } else {
      const { error } = await supabase.from("role_permissions").insert({
        role_id: role.id,
        permission_id: permission.id,
      });

      if (error) {
        console.log(error);
        setMensaje("Error asignando permiso: " + error.message);
        setAccionando(null);
        return;
      }

      setMensaje(`Permiso asignado: ${permission.code} → ${role.code}`);
    }

    setAccionando(null);
    await cargarDatos();
  }

  return (
    <PermissionGuard permission="admin.users.manage">
      <main className="min-h-screen bg-[#050914] text-white">
      <div className="mx-auto max-w-[1500px] space-y-8 px-4 py-10 md:px-8">
        <section className="relative overflow-hidden rounded-[34px] border border-purple-500/25 bg-[#0b1020] p-7 shadow-[0_0_45px_rgba(168,85,247,.12)] md:p-9">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,.18),transparent_42%)]" />

          <div className="relative z-10">
            <p className="text-xs font-black uppercase tracking-[0.35em] text-purple-300">
              Panel Administrativo
            </p>

            <h1 className="mt-3 text-4xl font-black uppercase md:text-6xl">
              👥 Usuarios y Roles
            </h1>

            <p className="mt-4 max-w-3xl text-zinc-400">
              Gestioná usuarios, aprobaciones, rangos y permisos granulares del
              sistema APA sin tocar SQL.
            </p>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {[
            { id: "usuarios", label: "👥 Usuarios" },
            { id: "roles", label: "🎖️ Roles" },
            { id: "permisos", label: "🔑 Permisos" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id as Tab)}
              className={`rounded-2xl border px-5 py-4 font-black uppercase transition ${
                tab === item.id
                  ? "border-purple-300 bg-purple-400 text-black shadow-[0_0_25px_rgba(168,85,247,.28)]"
                  : "border-white/10 bg-black/35 text-zinc-300 hover:border-purple-400/40 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </section>

        {mensaje && (
          <section className="rounded-3xl border border-sky-400/20 bg-sky-400/10 p-5 text-center font-black text-sky-300">
            {mensaje}
          </section>
        )}

        {loading ? (
          <section className="rounded-[34px] border border-white/10 bg-[#0b1020] p-12 text-center text-xl font-black uppercase tracking-[0.2em] text-purple-300">
            Cargando sistema...
          </section>
        ) : (
          <>
            {tab === "usuarios" && (
              <section className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_220px_auto]">
                  <input
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar por email, nombre, usuario o playerId..."
                    className="rounded-2xl border border-white/10 bg-black/35 px-5 py-4 text-white outline-none transition focus:border-purple-400/60"
                  />

                  <select
                    value={estadoFiltro}
                    onChange={(e) => setEstadoFiltro(e.target.value)}
                    className="rounded-2xl border border-white/10 bg-black/35 px-5 py-4 text-white outline-none transition focus:border-purple-400/60"
                  >
                    <option value="todos">Todos</option>
                    <option value="pending">Pendientes</option>
                    <option value="active">Activos</option>
                    <option value="suspended">Suspendidos</option>
                    <option value="rejected">Rechazados</option>
                  </select>

                  <button
                    type="button"
                    onClick={cargarDatos}
                    className="rounded-2xl border border-purple-400/30 bg-purple-400/10 px-6 py-4 font-black uppercase text-purple-300 transition hover:bg-purple-400 hover:text-black"
                  >
                    Recargar
                  </button>
                </div>

                <section className="rounded-[34px] border border-white/10 bg-[#0b1020] p-4 md:p-6">
                  {perfilesFiltrados.length === 0 ? (
                    <div className="p-12 text-center text-zinc-500">
                      No hay usuarios para mostrar.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {perfilesFiltrados.map((profile) => {
                        const rolesUsuario = rolesDelUsuario(profile.id);
                        const ocupado = accionando === profile.id;

                        return (
                          <article
                            key={profile.id}
                            className="rounded-[28px] border border-white/10 bg-black/30 p-5 transition hover:border-purple-400/25"
                          >
                            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_320px_320px]">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-3">
                                  <h2 className="truncate text-2xl font-black">
                                    {profile.display_name ||
                                      profile.username ||
                                      profile.email ||
                                      "Usuario sin nombre"}
                                  </h2>

                                  <span
                                    className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${
                                      estadoStyles[profile.status] ||
                                      "border-zinc-400/30 bg-zinc-400/10 text-zinc-300"
                                    }`}
                                  >
                                    {profile.status}
                                  </span>

                                  <span
                                    className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${
                                      rolStyles[profile.visible_role || "usuario"] ||
                                      "border-zinc-400/30 bg-zinc-400/10 text-zinc-300"
                                    }`}
                                  >
                                    {profile.visible_role || "usuario"}
                                  </span>
                                </div>

                                <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-zinc-400 md:grid-cols-2">
                                  <p>
                                    <span className="font-black text-zinc-200">Email:</span>{" "}
                                    {profile.email || "-"}
                                  </p>
                                  <p>
                                    <span className="font-black text-zinc-200">Username:</span>{" "}
                                    {profile.username || "-"}
                                  </p>
                                  <p>
                                    <span className="font-black text-zinc-200">PlayerId:</span>{" "}
                                    {profile.playerid || "-"}
                                  </p>
                                  <p>
                                    <span className="font-black text-zinc-200">Creado:</span>{" "}
                                    {formatDate(profile.created_at)}
                                  </p>
                                </div>

                                <div className="mt-4 flex flex-wrap gap-2">
                                  {rolesUsuario.length === 0 ? (
                                    <span className="rounded-full border border-zinc-500/20 bg-zinc-500/10 px-3 py-1 text-xs font-black uppercase text-zinc-400">
                                      Sin roles asignados
                                    </span>
                                  ) : (
                                    rolesUsuario.map((rol) => (
                                      <span
                                        key={rol.code}
                                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-black uppercase ${
                                          rolStyles[rol.code] ||
                                          "border-zinc-400/30 bg-zinc-400/10 text-zinc-300"
                                        }`}
                                      >
                                        {rol.name}
                                        <button
                                          type="button"
                                          disabled={ocupado}
                                          onClick={() => quitarRol(profile, rol.code)}
                                          className="text-white/70 transition hover:text-red-300 disabled:opacity-40"
                                          title="Quitar rol"
                                        >
                                          ✕
                                        </button>
                                      </span>
                                    ))
                                  )}
                                </div>
                              </div>

                              <div className="space-y-3 rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                                <p className="text-xs font-black uppercase tracking-[0.25em] text-purple-300">
                                  Acciones
                                </p>

                                <div className="grid grid-cols-1 gap-3">
                                  <button
                                    type="button"
                                    disabled={ocupado || profile.status === "active"}
                                    onClick={() => aprobarUsuario(profile)}
                                    className="rounded-2xl border border-green-400/25 bg-green-400/10 px-4 py-3 font-black uppercase text-green-300 transition hover:bg-green-400 hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
                                  >
                                    Aprobar
                                  </button>

                                  <button
                                    type="button"
                                    disabled={ocupado || profile.status === "suspended"}
                                    onClick={() => suspenderUsuario(profile)}
                                    className="rounded-2xl border border-red-400/25 bg-red-400/10 px-4 py-3 font-black uppercase text-red-300 transition hover:bg-red-400 hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
                                  >
                                    Suspender
                                  </button>
                                </div>
                              </div>

                              <div className="space-y-3 rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                                <p className="text-xs font-black uppercase tracking-[0.25em] text-sky-300">
                                  Asignar rol
                                </p>

                                <select
                                  value={rolSeleccionado[profile.id] || ""}
                                  onChange={(e) =>
                                    setRolSeleccionado((prev) => ({
                                      ...prev,
                                      [profile.id]: e.target.value,
                                    }))
                                  }
                                  className="w-full rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-white outline-none focus:border-sky-400/60"
                                >
                                  <option value="">Seleccionar rol</option>
                                  {roles.map((rol) => (
                                    <option key={rol.code} value={rol.code}>
                                      {rol.name} ({rol.code})
                                    </option>
                                  ))}
                                </select>

                                <button
                                  type="button"
                                  disabled={ocupado || !rolSeleccionado[profile.id]}
                                  onClick={() => asignarRol(profile)}
                                  className="w-full rounded-2xl border border-sky-400/25 bg-sky-400/10 px-4 py-3 font-black uppercase text-sky-300 transition hover:bg-sky-400 hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                  Asignar rol
                                </button>
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </section>
              </section>
            )}

            {tab === "roles" && (
              <section className="grid grid-cols-1 gap-6 xl:grid-cols-[420px_1fr]">
                <div className="rounded-[34px] border border-white/10 bg-[#0b1020] p-6">
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-purple-300">
                    Nuevo rol
                  </p>

                  <div className="mt-5 space-y-4">
                    <input
                      value={nuevoRolName}
                      onChange={(e) => {
                        setNuevoRolName(e.target.value);
                        if (!nuevoRolCode) setNuevoRolCode(normalizeCode(e.target.value));
                      }}
                      placeholder="Nombre visible, ej: Staff Mercado"
                      className="w-full rounded-2xl border border-white/10 bg-black/35 px-5 py-4 text-white outline-none focus:border-purple-400/60"
                    />

                    <input
                      value={nuevoRolCode}
                      onChange={(e) => setNuevoRolCode(normalizeCode(e.target.value))}
                      placeholder="Código, ej: mercado_staff"
                      className="w-full rounded-2xl border border-white/10 bg-black/35 px-5 py-4 text-white outline-none focus:border-purple-400/60"
                    />

                    <textarea
                      value={nuevoRolDescription}
                      onChange={(e) => setNuevoRolDescription(e.target.value)}
                      placeholder="Descripción"
                      className="min-h-[120px] w-full rounded-2xl border border-white/10 bg-black/35 px-5 py-4 text-white outline-none focus:border-purple-400/60"
                    />

                    <button
                      type="button"
                      disabled={accionando === "crear-rol"}
                      onClick={crearRol}
                      className="w-full rounded-2xl border border-purple-400/25 bg-purple-400/10 px-4 py-4 font-black uppercase text-purple-300 transition hover:bg-purple-400 hover:text-black disabled:opacity-40"
                    >
                      Crear rol
                    </button>
                  </div>
                </div>

                <div className="rounded-[34px] border border-white/10 bg-[#0b1020] p-6">
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-sky-300">
                    Roles existentes
                  </p>

                  <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                    {roles.map((role) => (
                      <article
                        key={role.id}
                        className="rounded-3xl border border-white/10 bg-black/30 p-5"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-2xl font-black">{role.name}</h3>
                            <p className="mt-1 text-sm font-black text-purple-300">
                              {role.code}
                            </p>
                          </div>

                          <button
                            type="button"
                            disabled={accionando === `rol-${role.id}`}
                            onClick={() => eliminarRol(role)}
                            className="rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-2 text-xs font-black uppercase text-red-300 transition hover:bg-red-400 hover:text-black disabled:opacity-40"
                          >
                            Eliminar
                          </button>
                        </div>

                        <p className="mt-4 text-sm text-zinc-400">
                          {role.description || "Sin descripción."}
                        </p>

                        <p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
                          Permisos:{" "}
                          {
                            rolePermissions.filter((rp) => rp.role_id === role.id)
                              .length
                          }
                        </p>
                      </article>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {tab === "permisos" && (
              <section className="space-y-6">
                <div className="rounded-[34px] border border-white/10 bg-[#0b1020] p-6">
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-purple-300">
                    Nuevo permiso
                  </p>

                  <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1fr_1.4fr_auto]">
                    <input
                      value={nuevoPermisoName}
                      onChange={(e) => {
                        setNuevoPermisoName(e.target.value);
                        if (!nuevoPermisoCode) setNuevoPermisoCode(normalizeCode(e.target.value));
                      }}
                      placeholder="Nombre, ej: Gestionar Dream Team"
                      className="rounded-2xl border border-white/10 bg-black/35 px-5 py-4 text-white outline-none focus:border-purple-400/60"
                    />

                    <input
                      value={nuevoPermisoCode}
                      onChange={(e) => setNuevoPermisoCode(normalizeCode(e.target.value))}
                      placeholder="Código, ej: dreamteam.manage"
                      className="rounded-2xl border border-white/10 bg-black/35 px-5 py-4 text-white outline-none focus:border-purple-400/60"
                    />

                    <input
                      value={nuevoPermisoDescription}
                      onChange={(e) => setNuevoPermisoDescription(e.target.value)}
                      placeholder="Descripción"
                      className="rounded-2xl border border-white/10 bg-black/35 px-5 py-4 text-white outline-none focus:border-purple-400/60"
                    />

                    <button
                      type="button"
                      disabled={accionando === "crear-permiso"}
                      onClick={crearPermiso}
                      className="rounded-2xl border border-purple-400/25 bg-purple-400/10 px-6 py-4 font-black uppercase text-purple-300 transition hover:bg-purple-400 hover:text-black disabled:opacity-40"
                    >
                      Crear
                    </button>
                  </div>
                </div>

                <div className="rounded-[34px] border border-white/10 bg-[#0b1020] p-4 md:p-6">
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-sky-300">
                    Permisos por rol
                  </p>

                  <div className="mt-5 overflow-x-auto">
                    <table className="w-full min-w-[980px] border-separate border-spacing-y-3 text-left">
                      <thead>
                        <tr className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                          <th className="px-4 py-3">Rol</th>
                          {permissions.map((permission) => (
                            <th key={permission.id} className="px-4 py-3">
                              <span title={permission.name}>{permission.code}</span>
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody>
                        {roles.map((role) => (
                          <tr key={role.id} className="bg-black/30">
                            <td className="rounded-l-2xl border-y border-l border-white/10 px-4 py-4">
                              <p className="font-black">{role.name}</p>
                              <p className="text-xs text-purple-300">{role.code}</p>
                            </td>

                            {permissions.map((permission, index) => {
                              const activo = roleHasPermission(role.id, permission.id);
                              const key = `perm-${role.id}-${permission.id}`;

                              return (
                                <td
                                  key={permission.id}
                                  className={`border-y border-white/10 px-4 py-4 ${
                                    index === permissions.length - 1
                                      ? "rounded-r-2xl border-r"
                                      : ""
                                  }`}
                                >
                                  <button
                                    type="button"
                                    disabled={accionando === key}
                                    onClick={() => toggleRolePermission(role, permission)}
                                    className={`h-9 w-9 rounded-xl border text-lg font-black transition disabled:opacity-40 ${
                                      activo
                                        ? "border-green-300 bg-green-400 text-black"
                                        : "border-zinc-600 bg-zinc-900 text-zinc-500 hover:border-green-400/50 hover:text-green-300"
                                    }`}
                                    title={`${role.code} → ${permission.code}`}
                                  >
                                    {activo ? "✓" : "—"}
                                  </button>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            )}
          </>
        )}
      </div>
      </main>
    </PermissionGuard>
  );
}
