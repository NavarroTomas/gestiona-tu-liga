"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type PerfilNavbar = {
  id: string;
  display_name: string | null;
  username: string | null;
  visible_role: string | null;
  status: string | null;
};

const menus = [
  {
    nombre: "Competición",
    icon: "🏆",
    items: [
      {
        nombre: "Torneos",
        href: "/competicion",
        icon: "🏆",
        descripcion: "Liga, copas y eventos",
      },
      {
        nombre: "Fixture",
        href: "/fixture",
        icon: "📅",
        descripcion: "Calendario oficial",
      },
      {
        nombre: "Stats",
        href: "/estadisticas",
        icon: "📈",
        descripcion: "Estadísticas oficiales",
      },
      {
        nombre: "Historia",
        href: "/historia",
        icon: "🏛️",
        descripcion: "Leyendas y récords",
      },
    ],
  },
  {
    nombre: "Clubes",
    icon: "🛡️",
    items: [
      {
        nombre: "Clubes",
        href: "/clubes",
        icon: "🏟️",
        descripcion: "Identidad de equipos",
      },
      {
        nombre: "Plantillas",
        href: "/plantillas",
        icon: "👥",
        descripcion: "Jugadores por club",
      },
      {
        nombre: "Mercado",
        href: "/mercado",
        icon: "🔁",
        descripcion: "Fichajes y movimientos",
      },
      {
        nombre: "Jugadores",
        href: "/jugadores",
        icon: "⭐",
        descripcion: "Rankings y perfiles",
      },
    ],
  },
  {
    nombre: "Entretenimiento",
    icon: "🎮",
    items: [
      {
        nombre: "Inicio",
        href: "/entretenimiento",
        icon: "✨",
        descripcion: "Zona interactiva",
      },
      {
        nombre: "Predicciones",
        href: "/entretenimiento/predicciones",
        icon: "🔮",
        descripcion: "Adiviná resultados",
      },
      {
        nombre: "Dream Team",
        href: "/entretenimiento/dream-team",
        icon: "💫",
        descripcion: "Equipo ideal",
      },
      {
        nombre: "Premios de la Fecha",
        href: "/entretenimiento/premios",
        icon: "🏅",
        descripcion: "Mejores jugadores de cada jornada",
      },
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
    return (
      pathname.startsWith("/competicion") || pathname.startsWith("/divisiones")
    );
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

  useEffect(() => {
    function cerrar() {
      setOpen(null);
      setUserMenuOpen(false);
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
      cargarSesionNavbar();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function cargarSesionNavbar() {
    setCargandoUsuario(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setPerfil(null);
      setPuedeVerPanel(false);
      setCargandoUsuario(false);
      return;
    }

    const { data: perfilData, error: perfilError } = await supabase
      .from("profiles")
      .select("id, display_name, username, visible_role, status")
      .eq("id", user.id)
      .maybeSingle();

    if (perfilError) {
      console.log(perfilError);
      setPerfil(null);
    } else {
      setPerfil((perfilData || null) as PerfilNavbar | null);
    }

    const resultados = await Promise.all(
      permisosPanel.map((permission) =>
        supabase.rpc("has_permission", {
          requested_permission: permission,
        }),
      ),
    );

    const tieneAlgunPermiso = resultados.some((res) => {
      if (res.error) {
        console.log(res.error);
        return false;
      }

      return !!res.data;
    });

    setPuedeVerPanel(tieneAlgunPermiso);
    setCargandoUsuario(false);
  }

  async function cerrarSesion() {
    await supabase.auth.signOut();
    setPerfil(null);
    setPuedeVerPanel(false);
    setMobileOpen(false);
    router.push("/login");
  }

  const nombreVisible = perfil?.display_name || perfil?.username || "Usuario";
  const inicial = nombreVisible.slice(0, 1).toUpperCase();

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

  function UserButton({ compact = false }: { compact?: boolean }) {
    if (cargandoUsuario) {
      return (
        <div className="h-10 w-10 animate-pulse rounded-2xl border border-white/10 bg-white/[0.04]" />
      );
    }

    if (!perfil) {
      return (
        <div
          className={`${compact ? "grid grid-cols-2 gap-2" : "hidden items-center gap-2 md:flex"}`}
        >
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

          <span
            className={`text-[10px] text-sky-300 transition-transform ${userMenuOpen ? "rotate-180" : ""}`}
          >
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
                    {perfil.visible_role || "usuario"} ·{" "}
                    {perfil.status || "pending"}
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

        {menus.map((menu) => {
          const activo = menu.items.some((item) =>
            linkActivo(pathname, item.href),
          );

          return (
            <div
              key={menu.nombre}
              className="relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() =>
                  setOpen(open === menu.nombre ? null : menu.nombre)
                }
                className={`group relative flex items-center gap-2 rounded-2xl border px-5 py-2.5 text-[15px] font-black transition-all ${
                  activo
                    ? "border-sky-400/50 bg-sky-500/15 text-white shadow-[0_0_22px_rgba(56,189,248,.18)]"
                    : "border-transparent text-zinc-300 hover:border-sky-400/25 hover:bg-sky-500/10 hover:text-white"
                }`}
              >
                <span>{menu.icon}</span>
                <span>{menu.nombre}</span>

                <span
                  className={`text-[11px] text-sky-300 transition-transform duration-300 ${open === menu.nombre ? "rotate-180" : ""}`}
                >
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

      <MobileMenu />
    </>
  );
}
