"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

let permissionsCacheUserId: string | undefined;
let permissionsCache: string[] | undefined;
let permissionsPromiseUserId: string | undefined;
let permissionsPromise: Promise<string[]> | undefined;

function normalizarPermisos(data: unknown): string[] {
  if (!Array.isArray(data)) return [];

  return data
    .map((item) => {
      if (!item || typeof item !== "object" || !("code" in item)) {
        return null;
      }

      const code = (item as { code?: unknown }).code;
      return typeof code === "string" ? code : null;
    })
    .filter((code): code is string => code !== null);
}

function limpiarPermisosCache() {
  permissionsCacheUserId = undefined;
  permissionsCache = undefined;
  permissionsPromiseUserId = undefined;
  permissionsPromise = undefined;
}

function cargarMisPermisos(userId: string): Promise<string[]> {
  if (permissionsCacheUserId === userId && permissionsCache) {
    return Promise.resolve(permissionsCache);
  }

  if (permissionsPromiseUserId === userId && permissionsPromise) {
    return permissionsPromise;
  }

  permissionsPromiseUserId = userId;
  permissionsPromise = (async () => {
    try {
      const { data, error } = await supabase.rpc("get_my_permissions");

      if (error) throw error;

      const permisos = normalizarPermisos(data);
      permissionsCacheUserId = userId;
      permissionsCache = permisos;
      return permisos;
    } finally {
      permissionsPromiseUserId = undefined;
      permissionsPromise = undefined;
    }
  })();

  return permissionsPromise;
}


type PerfilNavbar = {
  id: string;
  display_name: string | null;
  username: string | null;
  visible_role: string | null;
  status: string | null;
  verification_status: string | null;
  verification_note: string | null;
};

type ResultadoBusqueda = {
  tipo: "usuario" | "jugador" | "club";
  titulo: string;
  subtitulo: string;
  href: string;
  icono: string;
};

type NotificacionAPA = {
  id: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  href: string | null;
  leida: boolean | null;
  created_at: string | null;
};

const menus = [
  {
    nombre: "Competición",
    icon: "🏆",
    items: [
      { nombre: "Torneos", href: "/competicion", icon: "🏆", descripcion: "Liga, copas y eventos" },
      { nombre: "Fixture", href: "/fixture", icon: "📅", descripcion: "Calendario oficial" },
      { nombre: "Stats", href: "/estadisticas", icon: "📈", descripcion: "Estadísticas oficiales" },
      { nombre: "Historia", href: "/historia", icon: "🏛️", descripcion: "Leyendas y récords" },
    ],
  },
  {
    nombre: "Clubes",
    icon: "🛡️",
    items: [
      { nombre: "Clubes", href: "/clubes", icon: "🏟️", descripcion: "Identidad de equipos" },
      { nombre: "Plantillas", href: "/plantillas", icon: "👥", descripcion: "Jugadores por club" },
      { nombre: "Mercado", href: "/mercado", icon: "🔁", descripcion: "Fichajes y movimientos" },
      { nombre: "Jugadores", href: "/jugadores", icon: "⭐", descripcion: "Rankings y perfiles" },
    ],
  },
  {
    nombre: "Entretenimiento",
    icon: "🎮",
    items: [
      { nombre: "Inicio", href: "/entretenimiento", icon: "✨", descripcion: "Zona interactiva" },
      { nombre: "Predicciones", href: "/entretenimiento/predicciones", icon: "🔮", descripcion: "Adiviná resultados" },
      { nombre: "Dream Team", href: "/entretenimiento/dream-team", icon: "💫", descripcion: "Equipo ideal" },
      { nombre: "Premios de la Fecha", href: "/entretenimiento/premios", icon: "🏅", descripcion: "Mejores jugadores de cada jornada" },
    ],
  },
];

const permisosPanel = [
  "admin.users.manage",
  "clubs.manage",
  "fixtures.manage",
  "competitions.manage",
  "matches.upload_txt",
  "matches.upload_manual",
  "matches.edit",
  "transfers.manage",
  "titles.manage",
  "news.manage",
  "audit.view",
];

function linkActivo(pathname: string, href: string) {
  if (href === "/") return pathname === "/";

  if (href === "/competicion") {
    return pathname.startsWith("/competicion") || pathname.startsWith("/divisiones");
  }

  return pathname.startsWith(href);
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [open, setOpen] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [puedeVerPanel, setPuedeVerPanel] = useState(false);
  const [perfil, setPerfil] = useState<PerfilNavbar | null>(null);
  const [cargandoUsuario, setCargandoUsuario] = useState(true);
  const [mostrarAlertaDisputa, setMostrarAlertaDisputa] = useState(true);
  const [buscadorAbierto, setBuscadorAbierto] = useState(false);
  const [queryBusqueda, setQueryBusqueda] = useState("");
  const [resultadosBusqueda, setResultadosBusqueda] = useState<ResultadoBusqueda[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [notificaciones, setNotificaciones] = useState<NotificacionAPA[]>([]);
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);

  useEffect(() => {
    function cerrar() {
      setOpen(null);
      setUserMenuOpen(false);
      setNotificacionesAbiertas(false);
    }

    window.addEventListener("click", cerrar);

    return () => {
      window.removeEventListener("click", cerrar);
    };
  }, []);

  useEffect(() => {
    setOpen(null);
    setUserMenuOpen(false);
    setMobileOpen(false);
    setBuscadorAbierto(false);
    setQueryBusqueda("");
    setResultadosBusqueda([]);
    setNotificacionesAbiertas(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;

    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [mobileOpen]);

  useEffect(() => {
    cargarSesionNavbar();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      limpiarPermisosCache();
      cargarSesionNavbar();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);


  useEffect(() => {
    const q = queryBusqueda.trim();

    if (!buscadorAbierto || q.length < 2) {
      setResultadosBusqueda([]);
      setBuscando(false);
      return;
    }

    const timer = window.setTimeout(() => {
      buscarEnAPA(q);
    }, 250);

    return () => window.clearTimeout(timer);
  }, [queryBusqueda, buscadorAbierto]);

  async function buscarEnAPA(q: string) {
    setBuscando(true);

    try {
      const patron = `%${q}%`;

      const [usuariosRes, jugadoresRes, clubesRes] = await Promise.all([
        supabase
          .from("public_profiles")
          .select("display_name, username, playerid, avatar_url")
          .or(`display_name.ilike.${patron},username.ilike.${patron},playerid.ilike.${patron}`)
          .not("username", "is", null)
          .limit(5),

        supabase
          .from("jugadores")
          .select("nombre, jugador, playerId, player_id, equipo")
          .or(`nombre.ilike.${patron},jugador.ilike.${patron},playerId.ilike.${patron},player_id.ilike.${patron}`)
          .limit(5),

        supabase
          .from("equipos")
          .select("nombre, temporada, division")
          .ilike("nombre", patron)
          .limit(5),
      ]);

      const usuarios: ResultadoBusqueda[] = (usuariosRes.data || [])
        .filter((u: any) => u.username)
        .map((u: any) => ({
          tipo: "usuario",
          titulo: u.display_name || u.username || "Usuario APA",
          subtitulo: `@${u.username}${u.playerid ? ` · PlayerID ${u.playerid}` : ""}`,
          href: `/u/${encodeURIComponent(u.username)}`,
          icono: "👤",
        }));

      const jugadoresUnicos = new Map<string, ResultadoBusqueda>();

      (jugadoresRes.data || []).forEach((j: any) => {
        const playerId = String(j.playerId || j.player_id || "").trim();
        const nombre = String(j.nombre || j.jugador || "Jugador APA").trim();

        if (!playerId) return;

        if (!jugadoresUnicos.has(playerId)) {
          jugadoresUnicos.set(playerId, {
            tipo: "jugador",
            titulo: nombre,
            subtitulo: `${j.equipo || "Sin club"} · PlayerID ${playerId}`,
            href: `/jugadores/${encodeURIComponent(playerId)}`,
            icono: "⭐",
          });
        }
      });

      const clubesUnicos = new Map<string, ResultadoBusqueda>();

      (clubesRes.data || []).forEach((c: any) => {
        const nombre = String(c.nombre || "").trim();
        if (!nombre) return;

        const key = nombre.toLowerCase();

        if (!clubesUnicos.has(key)) {
          clubesUnicos.set(key, {
            tipo: "club",
            titulo: nombre,
            subtitulo: `${c.temporada || "Temporada"} · ${c.division || "División"}`,
            href: `/equipos/${encodeURIComponent(nombre)}`,
            icono: "🏟️",
          });
        }
      });

      setResultadosBusqueda([
        ...usuarios,
        ...Array.from(jugadoresUnicos.values()).slice(0, 5),
        ...Array.from(clubesUnicos.values()).slice(0, 5),
      ].slice(0, 12));
    } catch (error) {
      console.log(error);
      setResultadosBusqueda([]);
    }

    setBuscando(false);
  }

  function abrirPrimerResultado() {
    const primero = resultadosBusqueda[0];

    if (!primero) return;

    setBuscadorAbierto(false);
    router.push(primero.href);
  }


  async function cargarNotificaciones(userId: string) {
    const { data, error } = await supabase
      .from("notificaciones")
      .select("id,tipo,titulo,mensaje,href,leida,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(12);

    if (error) {
      console.log(error);
      setNotificaciones([]);
      return;
    }

    setNotificaciones((data || []) as unknown as NotificacionAPA[]);
  }

  async function marcarNotificacionLeida(notificacion: NotificacionAPA) {
    if (!notificacion.leida) {
      await supabase
        .from("notificaciones")
        .update({ leida: true })
        .eq("id", notificacion.id);

      setNotificaciones((prev) =>
        prev.map((n) =>
          n.id === notificacion.id ? { ...n, leida: true } : n,
        ),
      );
    }

    setNotificacionesAbiertas(false);

    if (notificacion.href) {
      router.push(notificacion.href);
    }
  }

  async function marcarTodasLeidas() {
    const ids = notificaciones.filter((n) => !n.leida).map((n) => n.id);

    if (ids.length === 0) return;

    await supabase
      .from("notificaciones")
      .update({ leida: true })
      .in("id", ids);

    setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
  }

  function iconoNotificacion(tipo: string) {
    if (tipo === "approved") return "✅";
    if (tipo === "disputed") return "⚠️";
    if (tipo === "rejected") return "❌";
    if (tipo === "pending") return "⏳";
    if (tipo === "news") return "📰";
    if (tipo === "award") return "🏆";
    if (tipo === "achievement") return "⭐";
    return "🔔";
  }

  async function cargarSesionNavbar() {
    setCargandoUsuario(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setPerfil(null);
      setPuedeVerPanel(false);
      setNotificaciones([]);
      setCargandoUsuario(false);
      return;
    }

    await cargarNotificaciones(user.id);

    const { data: perfilData, error: perfilError } = await supabase
      .from("profiles")
      .select("id, display_name, username, visible_role, status, verification_status, verification_note")
      .eq("id", user.id)
      .maybeSingle();

    if (perfilError) {
      console.log(perfilError);
      setPerfil(null);
    } else {
      setPerfil((perfilData || null) as PerfilNavbar | null);
    }

    try {
      const permisos = await cargarMisPermisos(user.id);
      const tieneAlgunPermiso = permisosPanel.some((permission) =>
        permisos.includes(permission),
      );

      setPuedeVerPanel(tieneAlgunPermiso);
    } catch (error) {
      console.error("Error cargando permisos del navbar:", error);
      setPuedeVerPanel(false);
    }

    setCargandoUsuario(false);
  }

  async function cerrarSesion() {
    limpiarPermisosCache();
    await supabase.auth.signOut();
    setPerfil(null);
    setPuedeVerPanel(false);
    setMobileOpen(false);
    router.push("/login");
  }

  const nombreVisible = perfil?.display_name || perfil?.username || "Usuario";
  const inicial = nombreVisible.slice(0, 1).toUpperCase();
  const notificacionesNoLeidas = notificaciones.filter((n) => !n.leida).length;

  const baseLinks = [
    { nombre: "Inicio", href: "/", icon: "🏠" },
    { nombre: "Guía", href: "/guia", icon: "📖" },
  ];

  function Brand() {
    return (
      <Link
        href="/"
        className="group flex min-w-0 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-2.5 transition hover:border-sky-400/35 hover:bg-sky-500/10 hover:shadow-[0_0_22px_rgba(56,189,248,.13)]"
      >
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-sky-400/30 bg-black/40 shadow-[0_0_18px_rgba(56,189,248,.20)]">
          <img
            src="/logo-apa.png"
            alt="APA PSO"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
          />
        </div>

        <div className="min-w-0 leading-none">
          <p className="truncate text-xs font-black uppercase tracking-[0.24em] text-white">
            APA PSO
          </p>

          <p className="mt-1 truncate text-[10px] font-black uppercase tracking-[0.32em] text-sky-300">
            Argentina
          </p>
        </div>
      </Link>
    );
  }


  function NotificationBell() {
    if (!perfil) return null;

    return (
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={() => setNotificacionesAbiertas(!notificacionesAbiertas)}
          className="relative rounded-2xl border border-yellow-400/25 bg-yellow-400/10 px-4 py-2.5 text-sm font-black uppercase text-yellow-300 transition hover:bg-yellow-400 hover:text-black"
          title="Notificaciones APA"
        >
          🔔
          {notificacionesNoLeidas > 0 && (
            <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full border border-black bg-red-500 px-1 text-[10px] font-black text-white">
              {notificacionesNoLeidas}
            </span>
          )}
        </button>

        {notificacionesAbiertas && (
          <div className="absolute right-0 top-full z-[99999] mt-3 w-[min(380px,calc(100vw-1rem))] overflow-hidden rounded-[26px] border border-yellow-400/20 bg-[#050914]/96 p-3 shadow-[0_24px_70px_rgba(0,0,0,.65)] backdrop-blur-2xl">
            <div className="mb-3 flex items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-yellow-300">
                  Notificaciones
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  {notificacionesNoLeidas} sin leer
                </p>
              </div>

              <button
                type="button"
                onClick={marcarTodasLeidas}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-[10px] font-black uppercase text-zinc-300 hover:border-yellow-400/30 hover:text-yellow-300"
              >
                Leer todo
              </button>
            </div>

            <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
              {notificaciones.length === 0 ? (
                <p className="rounded-2xl border border-white/10 bg-black/35 p-4 text-sm text-zinc-500">
                  No tenés notificaciones todavía.
                </p>
              ) : (
                notificaciones.map((noti) => (
                  <button
                    key={noti.id}
                    type="button"
                    onClick={() => marcarNotificacionLeida(noti)}
                    className={`w-full rounded-2xl border p-4 text-left transition hover:border-yellow-400/35 hover:bg-yellow-400/10 ${
                      noti.leida
                        ? "border-white/10 bg-black/25"
                        : "border-yellow-400/25 bg-yellow-400/10"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl">{iconoNotificacion(noti.tipo)}</span>

                      <div className="min-w-0 flex-1">
                        <p className="font-black uppercase text-white">
                          {noti.titulo}
                        </p>
                        <p className="mt-1 text-sm leading-5 text-zinc-400">
                          {noti.mensaje}
                        </p>
                        <p className="mt-2 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-600">
                          {noti.leida ? "Leída" : "Nueva"}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  function UserButton({ compact = false }: { compact?: boolean }) {
    if (cargandoUsuario) {
      return (
        <div className="h-10 w-10 animate-pulse rounded-2xl border border-white/10 bg-white/[0.04]" />
      );
    }

    if (!perfil) {
      return (
        <div className={`${compact ? "grid grid-cols-2 gap-2" : "hidden items-center gap-2 md:flex"}`}>
          <Link
            href="/login"
            className="rounded-2xl border border-sky-400/25 bg-sky-400/10 px-4 py-2 text-center text-sm font-black uppercase text-sky-300 transition hover:bg-sky-400 hover:text-black"
          >
            Login
          </Link>

          <Link
            href="/registro"
            className="rounded-2xl border border-yellow-400/25 bg-yellow-400/10 px-4 py-2 text-center text-sm font-black uppercase text-yellow-300 transition hover:bg-yellow-400 hover:text-black"
          >
            Registro
          </Link>
        </div>
      );
    }

    return (
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          className="flex max-w-[220px] items-center gap-3 rounded-2xl border border-sky-400/25 bg-sky-400/10 px-4 py-2.5 transition hover:border-sky-300 hover:bg-sky-400/15"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-sky-400/35 bg-black/35 text-sm font-black text-sky-300">
            {inicial}
          </div>

          <div className="hidden min-w-0 text-left md:block">
            <p className="max-w-[140px] truncate text-[13px] font-black uppercase text-white">
              {nombreVisible}
            </p>
            <p className="mt-0.5 max-w-[140px] truncate text-[10px] font-black uppercase tracking-[0.18em] text-yellow-300">
              {perfil.visible_role || "usuario"}
            </p>
          </div>

          <span className={`text-[10px] text-sky-300 transition-transform ${userMenuOpen ? "rotate-180" : ""}`}>
            ▾
          </span>
        </button>

        {userMenuOpen && (
          <div className="absolute right-0 top-full z-[99999] mt-3 w-[min(280px,calc(100vw-1.5rem))] overflow-hidden rounded-[24px] border border-sky-400/20 bg-[#050914]/96 p-2 shadow-[0_24px_70px_rgba(0,0,0,.62)] backdrop-blur-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,.16),transparent_36%)]" />

            <div className="relative z-10 border-b border-white/10 px-3 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-sky-400/35 bg-sky-400/10 text-lg font-black text-sky-300">
                  {inicial}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-black uppercase text-white">
                    {nombreVisible}
                  </p>
                  <p className="truncate text-xs font-bold text-zinc-500">
                    @{perfil.username || "usuario"}
                  </p>
                  <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-yellow-300">
                    {perfil.visible_role || "usuario"} · {perfil.status || "pending"}
                  </p>
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-2 space-y-1">
              <Link
                href="/perfil"
                onClick={() => setUserMenuOpen(false)}
                className="block rounded-2xl border border-transparent px-4 py-3 text-sm font-black uppercase text-zinc-300 transition hover:border-sky-400/25 hover:bg-sky-400/10 hover:text-white"
              >
                👤 Mi perfil
              </Link>

              {perfil.username && (
                <Link
                  href={`/u/${perfil.username}`}
                  onClick={() => setUserMenuOpen(false)}
                  className="block rounded-2xl border border-transparent px-4 py-3 text-sm font-black uppercase text-zinc-300 transition hover:border-yellow-400/25 hover:bg-yellow-400/10 hover:text-white"
                >
                  🌐 Perfil público
                </Link>
              )}

              {puedeVerPanel && (
                <Link
                  href="/admin"
                  onClick={() => setUserMenuOpen(false)}
                  className="block rounded-2xl border border-transparent px-4 py-3 text-sm font-black uppercase text-sky-300 transition hover:border-sky-400/25 hover:bg-sky-400/10 hover:text-white"
                >
                  ⚡ Panel admin
                </Link>
              )}

              <button
                type="button"
                onClick={cerrarSesion}
                className="w-full rounded-2xl border border-transparent px-4 py-3 text-left text-sm font-black uppercase text-red-300 transition hover:border-red-400/25 hover:bg-red-400/10 hover:text-white"
              >
                🚪 Cerrar sesión
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  function DesktopMenu() {
    return (
      <div className="hidden min-w-0 flex-1 items-center justify-center gap-2 xl:flex">
        {baseLinks.map((item) => {
          const activo = linkActivo(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative overflow-hidden rounded-2xl border px-5 py-2.5 text-[15px] font-black transition-all ${
                activo
                  ? "border-sky-400/50 bg-sky-500/15 text-white shadow-[0_0_22px_rgba(56,189,248,.18)]"
                  : "border-transparent text-zinc-300 hover:border-sky-400/25 hover:bg-sky-500/10 hover:text-white"
              }`}
            >
              <span className="relative z-10">
                {item.icon} {item.nombre}
              </span>
              {activo && (
                <span className="absolute inset-x-4 bottom-1 h-[2px] rounded-full bg-sky-400 shadow-[0_0_12px_rgba(56,189,248,.9)]" />
              )}
            </Link>
          );
        })}

        <button
          type="button"
          onClick={() => setBuscadorAbierto(true)}
          className="group relative overflow-hidden rounded-2xl border border-transparent px-5 py-2.5 text-[15px] font-black text-zinc-300 transition-all hover:border-sky-400/25 hover:bg-sky-500/10 hover:text-white"
        >
          <span className="relative z-10">🔍 Buscar</span>
        </button>

        {menus.map((menu) => {
          const activo = menu.items.some((item) => linkActivo(pathname, item.href));

          return (
            <div key={menu.nombre} className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => setOpen(open === menu.nombre ? null : menu.nombre)}
                className={`group relative flex items-center gap-2 rounded-2xl border px-5 py-2.5 text-[15px] font-black transition-all ${
                  activo
                    ? "border-sky-400/50 bg-sky-500/15 text-white shadow-[0_0_22px_rgba(56,189,248,.18)]"
                    : "border-transparent text-zinc-300 hover:border-sky-400/25 hover:bg-sky-500/10 hover:text-white"
                }`}
              >
                <span>{menu.icon}</span>
                <span>{menu.nombre}</span>

                <span className={`text-[11px] text-sky-300 transition-transform duration-300 ${open === menu.nombre ? "rotate-180" : ""}`}>
                  ▾
                </span>

                {activo && (
                  <span className="absolute inset-x-4 bottom-1 h-[2px] rounded-full bg-sky-400 shadow-[0_0_12px_rgba(56,189,248,.9)]" />
                )}
              </button>

              {open === menu.nombre && (
                <div className="animate-apa-fade-up absolute left-1/2 top-full z-[99999] mt-3 w-[310px] -translate-x-1/2 overflow-hidden rounded-[24px] border border-sky-400/20 bg-[#050914]/96 p-2 shadow-[0_24px_70px_rgba(0,0,0,.62)] backdrop-blur-2xl">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,.16),transparent_36%)]" />

                  <div className="relative z-10 mb-2 border-b border-white/10 px-3 py-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.28em] text-sky-300">
                      {menu.nombre}
                    </p>

                    <p className="mt-1 text-xs font-bold text-zinc-500">
                      Accesos rápidos APA
                    </p>
                  </div>

                  <div className="relative z-10 space-y-1">
                    {menu.items.map((item) => {
                      const itemActivo = linkActivo(pathname, item.href);

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setOpen(null)}
                          className={`group/item flex items-center gap-3 rounded-2xl border px-3 py-3 transition-all ${
                            itemActivo
                              ? "border-sky-400/35 bg-sky-500/15 text-white shadow-[0_0_18px_rgba(56,189,248,.13)]"
                              : "border-transparent text-zinc-300 hover:border-sky-400/25 hover:bg-white/[0.055] hover:text-white"
                          }`}
                        >
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border text-lg transition ${
                              itemActivo
                                ? "border-sky-400/35 bg-sky-400/15"
                                : "border-white/10 bg-white/[0.04] group-hover/item:border-sky-400/25 group-hover/item:bg-sky-500/10"
                            }`}
                          >
                            {item.icon}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-black uppercase">
                              {item.nombre}
                            </p>

                            <p className="mt-0.5 truncate text-[11px] font-bold text-zinc-500">
                              {item.descripcion}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  function MobileMenu() {
    if (!mobileOpen) return null;

    return (
      <div className="fixed inset-0 z-[9998] xl:hidden">
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={() => setMobileOpen(false)}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        />

        <aside className="absolute right-0 top-0 flex h-full w-[min(420px,92vw)] flex-col overflow-hidden border-l border-sky-400/20 bg-[#050914] shadow-[0_0_70px_rgba(0,0,0,.75)]">
          <div className="border-b border-white/10 p-4">
            <div className="flex items-center justify-between gap-3">
              <Brand />

              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-xl font-black text-zinc-300"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="flex-1 space-y-5 overflow-y-auto px-4 py-5">
            <section>
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.28em] text-sky-300">
                Principal
              </p>

              <div className="grid grid-cols-2 gap-2">
                {baseLinks.map((item) => {
                  const activo = linkActivo(pathname, item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`rounded-2xl border px-4 py-4 text-sm font-black uppercase ${
                        activo
                          ? "border-sky-400/40 bg-sky-400/15 text-white"
                          : "border-white/10 bg-white/[0.04] text-zinc-300"
                      }`}
                    >
                      {item.icon} {item.nombre}
                    </Link>
                  );
                })}
              </div>
            </section>

            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                setBuscadorAbierto(true);
              }}
              className="flex w-full items-center justify-between rounded-2xl border border-sky-400/25 bg-sky-400/10 px-5 py-4 text-sm font-black uppercase text-sky-300 transition hover:bg-sky-400 hover:text-black"
            >
              🔍 Buscar en APA <span>→</span>
            </button>

            {menus.map((menu) => (
              <section key={menu.nombre}>
                <p className="mb-3 text-[10px] font-black uppercase tracking-[0.28em] text-sky-300">
                  {menu.icon} {menu.nombre}
                </p>

                <div className="space-y-2">
                  {menu.items.map((item) => {
                    const activo = linkActivo(pathname, item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition ${
                          activo
                            ? "border-sky-400/35 bg-sky-500/15 text-white"
                            : "border-white/10 bg-white/[0.035] text-zinc-300 hover:border-sky-400/25 hover:bg-sky-500/10"
                        }`}
                      >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-lg">
                          {item.icon}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-black uppercase">
                            {item.nombre}
                          </p>
                          <p className="mt-0.5 line-clamp-1 text-[11px] font-bold text-zinc-500">
                            {item.descripcion}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            ))}

            {puedeVerPanel && (
              <Link
                href="/admin"
                className="flex items-center justify-between rounded-2xl border border-sky-400/30 bg-sky-400 px-5 py-4 text-sm font-black uppercase text-black"
              >
                ⚡ Panel admin <span>→</span>
              </Link>
            )}

            {!perfil && !cargandoUsuario && <UserButton compact />}
          </div>

          {perfil && (
            <div className="border-t border-white/10 p-4">
              <div className="rounded-[24px] border border-sky-400/20 bg-sky-400/10 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-sky-400/35 bg-black/35 text-lg font-black text-sky-300">
                    {inicial}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-black uppercase text-white">
                      {nombreVisible}
                    </p>
                    <p className="truncate text-xs font-bold text-zinc-500">
                      @{perfil.username || "usuario"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Link
                    href="/perfil"
                    className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-center text-xs font-black uppercase text-zinc-200"
                  >
                    Mi perfil
                  </Link>

                  <button
                    type="button"
                    onClick={cerrarSesion}
                    className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-xs font-black uppercase text-red-300"
                  >
                    Salir
                  </button>
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>
    );
  }

  return (
    <>
      <nav className="sticky top-0 z-[9999] border-b border-white/10 bg-[#050914]/88 shadow-[0_14px_50px_rgba(0,0,0,0.42)] backdrop-blur-2xl">
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-sky-400 to-transparent shadow-[0_0_18px_rgba(56,189,248,.7)]" />

        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3 px-3 py-3.5 sm:px-4 md:px-6">
          <div className="min-w-0 shrink">
            <Brand />
          </div>

          <DesktopMenu />

          <div className="flex min-w-fit items-center gap-2">
            <button
              type="button"
              onClick={() => setBuscadorAbierto(true)}
              className="hidden rounded-2xl border border-sky-400/25 bg-sky-400/10 px-4 py-2.5 text-sm font-black uppercase text-sky-300 transition hover:bg-sky-400 hover:text-black md:inline-flex xl:hidden"
              title="Buscar en APA"
            >
              🔍
            </button>

            <NotificationBell />

            {perfil?.verification_status === "disputed" && (
              <Link
                href="/perfil"
                className="hidden rounded-2xl border border-orange-400/35 bg-orange-400/10 px-4 py-2.5 text-sm font-black uppercase text-orange-300 transition hover:bg-orange-400 hover:text-black md:inline-flex"
                title="Tenés una disputa pendiente"
              >
                🔔 Disputa
              </Link>
            )}

            {puedeVerPanel && (
              <Link
                href="/admin"
                className={`hidden overflow-hidden rounded-2xl border px-5 py-2.5 text-[15px] font-black transition-all sm:block ${
                  pathname.startsWith("/admin")
                    ? "border-sky-300 bg-sky-500 text-black shadow-[0_0_24px_rgba(56,189,248,.45)]"
                    : "border-sky-500/35 bg-sky-500/10 text-sky-300 hover:border-sky-300 hover:bg-sky-500 hover:text-black hover:shadow-[0_0_24px_rgba(56,189,248,.32)]"
                }`}
              >
                <span className="hidden md:inline">⚡ Panel</span>
                <span className="md:hidden">⚡</span>
              </Link>
            )}

            <div className="hidden md:block">
              <UserButton />
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMobileOpen(true);
              }}
              className="flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-400/25 bg-sky-400/10 text-xl font-black text-sky-300 transition hover:bg-sky-400 hover:text-black xl:hidden"
              aria-label="Abrir menú"
            >
              ☰
            </button>
          </div>
        </div>
      </nav>

      {buscadorAbierto && (
        <div
          className="fixed inset-0 z-[10000] flex items-start justify-center bg-black/75 px-4 pt-24 backdrop-blur-sm md:pt-28"
          onClick={() => setBuscadorAbierto(false)}
        >
          <div
            className="relative w-full max-w-3xl overflow-hidden rounded-[34px] border border-sky-400/25 bg-[#050914] p-5 shadow-[0_0_70px_rgba(56,189,248,.22)] md:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,.18),transparent_42%)]" />

            <div className="relative z-10">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.32em] text-sky-300">
                    Buscador global
                  </p>
                  <h2 className="mt-2 text-3xl font-black uppercase text-white">
                    Buscar en APA
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setBuscadorAbierto(false)}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-xl font-black text-zinc-300 transition hover:border-red-400/35 hover:text-red-300"
                >
                  ✕
                </button>
              </div>

              <div className="relative">
                <input
                  autoFocus
                  value={queryBusqueda}
                  onChange={(e) => setQueryBusqueda(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setBuscadorAbierto(false);
                    }

                    if (e.key === "Enter") {
                      abrirPrimerResultado();
                    }
                  }}
                  placeholder="Buscar usuario, jugador o club..."
                  className="w-full rounded-2xl border border-sky-400/25 bg-black/45 px-5 py-5 pr-14 text-base font-bold text-white outline-none placeholder:text-zinc-600 focus:border-sky-300"
                />

                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xl">
                  🔍
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-xl border border-sky-400/20 bg-sky-400/10 px-3 py-2 text-[10px] font-black uppercase text-sky-300">
                  👤 Usuarios
                </span>
                <span className="rounded-xl border border-yellow-400/20 bg-yellow-400/10 px-3 py-2 text-[10px] font-black uppercase text-yellow-300">
                  ⭐ Jugadores
                </span>
                <span className="rounded-xl border border-green-400/20 bg-green-400/10 px-3 py-2 text-[10px] font-black uppercase text-green-300">
                  🏟️ Clubes
                </span>
              </div>

              <div className="mt-5 max-h-[460px] space-y-2 overflow-y-auto pr-1">
                {queryBusqueda.trim().length < 2 ? (
                  <div className="rounded-2xl border border-white/10 bg-black/35 p-5 text-sm text-zinc-500">
                    Escribí al menos 2 caracteres para buscar en APA.
                  </div>
                ) : buscando ? (
                  <div className="rounded-2xl border border-sky-400/20 bg-sky-400/10 p-5 text-sm font-black uppercase tracking-[0.2em] text-sky-300">
                    Buscando...
                  </div>
                ) : resultadosBusqueda.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-black/35 p-5 text-sm text-zinc-500">
                    No encontré resultados para esa búsqueda.
                  </div>
                ) : (
                  resultadosBusqueda.map((resultado) => (
                    <Link
                      key={`${resultado.tipo}-${resultado.href}-${resultado.titulo}`}
                      href={resultado.href}
                      onClick={() => setBuscadorAbierto(false)}
                      className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-black/35 p-4 transition hover:border-sky-400/35 hover:bg-sky-400/10"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-400/10 text-2xl">
                        {resultado.icono}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-base font-black uppercase text-white group-hover:text-sky-300">
                          {resultado.titulo}
                        </p>
                        <p className="mt-1 truncate text-sm font-bold text-zinc-500">
                          {resultado.subtitulo}
                        </p>
                      </div>

                      <span className="text-2xl text-sky-300 transition group-hover:translate-x-1">
                        →
                      </span>
                    </Link>
                  ))
                )}
              </div>

              <p className="mt-5 text-center text-[10px] font-black uppercase tracking-[0.22em] text-zinc-600">
                Enter abre el primer resultado · Esc cierra el buscador
              </p>
            </div>
          </div>
        </div>
      )}

      {perfil?.verification_status === "disputed" && mostrarAlertaDisputa && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm">
          <div className="relative w-full max-w-xl overflow-hidden rounded-[34px] border border-orange-400/35 bg-[#050914] p-6 shadow-[0_0_70px_rgba(251,146,60,.22)] md:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,146,60,.18),transparent_42%)]" />

            <div className="relative z-10">
              <p className="text-xs font-black uppercase tracking-[0.32em] text-orange-300">
                ⚠ Atención
              </p>

              <h2 className="mt-3 text-3xl font-black uppercase text-white md:text-4xl">
                Tu cuenta está en disputa
              </h2>

              <p className="mt-4 text-sm leading-7 text-zinc-300">
                Un administrador detectó un problema con tus datos de verificación. Revisá la nota, corregí tu información y guardá el perfil para volver a revisión.
              </p>

              {perfil?.verification_note && (
                <div className="mt-5 rounded-2xl border border-orange-400/25 bg-orange-400/10 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-orange-300">
                    Motivo
                  </p>
                  <p className="mt-2 text-sm font-bold leading-6 text-zinc-200">
                    {perfil.verification_note}
                  </p>
                </div>
              )}

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Link
                  href="/perfil"
                  onClick={() => setMostrarAlertaDisputa(false)}
                  className="rounded-2xl border border-orange-400/35 bg-orange-400 px-5 py-4 text-center text-sm font-black uppercase text-black transition hover:bg-white"
                >
                  Ir a mi perfil
                </Link>

                <button
                  type="button"
                  onClick={() => setMostrarAlertaDisputa(false)}
                  className="rounded-2xl border border-white/10 bg-black/35 px-5 py-4 text-sm font-black uppercase text-zinc-300 transition hover:border-orange-400/35 hover:text-white"
                >
                  Ver después
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <MobileMenu />
    </>
  );
}
