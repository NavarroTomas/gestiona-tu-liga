"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

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
        nombre: "Premios APA",
        href: "/entretenimiento/premios",
        icon: "🏅",
        descripcion: "Reconocimientos",
      },
    ],
  },
];

function linkActivo(pathname: string, href: string) {
  if (href === "/") return pathname === "/";

  if (href === "/competicion") {
    return (
      pathname.startsWith("/competicion") ||
      pathname.startsWith("/divisiones")
    );
  }

  return pathname.startsWith(href);
}

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    function cerrar() {
      setOpen(null);
    }

    window.addEventListener("click", cerrar);

    return () => {
      window.removeEventListener("click", cerrar);
    };
  }, []);

  useEffect(() => {
    setOpen(null);
  }, [pathname]);

  return (
    <nav className="sticky top-0 z-[9999] border-b border-white/10 bg-[#050914]/82 shadow-[0_14px_50px_rgba(0,0,0,0.42)] backdrop-blur-2xl">
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-sky-400 to-transparent shadow-[0_0_18px_rgba(56,189,248,.7)]" />

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-4 py-3 md:px-6">
        <Link
          href="/"
          className="group hidden min-w-fit items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-3 py-2 transition hover:border-sky-400/35 hover:bg-sky-500/10 hover:shadow-[0_0_22px_rgba(56,189,248,.13)] lg:flex"
        >
          <div className="relative h-9 w-9 overflow-hidden rounded-xl border border-sky-400/30 bg-black/40 shadow-[0_0_18px_rgba(56,189,248,.20)]">
            <img
              src="/logo-apa.png"
              alt="APA PSO"
              className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
            />
          </div>

          <div className="leading-none">
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-white">
              APA PSO
            </p>

            <p className="mt-1 text-[9px] font-black uppercase tracking-[0.32em] text-sky-300">
              Argentina
            </p>
          </div>
        </Link>

        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto pb-1 lg:justify-center lg:overflow-visible lg:pb-0">
          <Link
            href="/"
            className={`group relative overflow-hidden rounded-2xl border px-4 py-2 text-sm font-black transition-all ${
              pathname === "/"
                ? "border-sky-400/50 bg-sky-500/15 text-white shadow-[0_0_22px_rgba(56,189,248,.18)]"
                : "border-transparent text-zinc-300 hover:border-sky-400/25 hover:bg-sky-500/10 hover:text-white"
            }`}
          >
            <span className="relative z-10">Inicio</span>
            {pathname === "/" && (
              <span className="absolute inset-x-4 bottom-1 h-[2px] rounded-full bg-sky-400 shadow-[0_0_12px_rgba(56,189,248,.9)]" />
            )}
          </Link>

          <Link
            href="/guia"
            className={`group relative overflow-hidden rounded-2xl border px-4 py-2 text-sm font-black transition-all ${
              pathname.startsWith("/guia")
                ? "border-sky-400/50 bg-sky-500/15 text-white shadow-[0_0_22px_rgba(56,189,248,.18)]"
                : "border-transparent text-zinc-300 hover:border-sky-400/25 hover:bg-sky-500/10 hover:text-white"
            }`}
          >
            <span className="relative z-10">📖 Guía</span>
            {pathname.startsWith("/guia") && (
              <span className="absolute inset-x-4 bottom-1 h-[2px] rounded-full bg-sky-400 shadow-[0_0_12px_rgba(56,189,248,.9)]" />
            )}
          </Link>

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
                  className={`group relative flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-black transition-all ${
                    activo
                      ? "border-sky-400/50 bg-sky-500/15 text-white shadow-[0_0_22px_rgba(56,189,248,.18)]"
                      : "border-transparent text-zinc-300 hover:border-sky-400/25 hover:bg-sky-500/10 hover:text-white"
                  }`}
                >
                  <span className="hidden sm:inline">{menu.icon}</span>
                  <span>{menu.nombre}</span>

                  <span
                    className={`text-[10px] text-sky-300 transition-transform duration-300 ${
                      open === menu.nombre ? "rotate-180" : ""
                    }`}
                  >
                    ▾
                  </span>

                  {activo && (
                    <span className="absolute inset-x-4 bottom-1 h-[2px] rounded-full bg-sky-400 shadow-[0_0_12px_rgba(56,189,248,.9)]" />
                  )}
                </button>

                {open === menu.nombre && (
                  <div className="animate-apa-fade-up absolute left-0 top-full z-[99999] mt-3 w-[310px] overflow-hidden rounded-[24px] border border-sky-400/20 bg-[#050914]/96 p-2 shadow-[0_24px_70px_rgba(0,0,0,.62)] backdrop-blur-2xl">
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
                              className={`flex h-10 w-10 items-center justify-center rounded-2xl border text-lg transition ${
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

        <div className="flex min-w-fit items-center gap-3">
          <Link
            href="/admin"
            className={`relative overflow-hidden rounded-2xl border px-4 py-2 text-sm font-black transition-all md:px-5 ${
              pathname.startsWith("/admin")
                ? "border-sky-300 bg-sky-500 text-black shadow-[0_0_24px_rgba(56,189,248,.45)]"
                : "border-sky-500/35 bg-sky-500/10 text-sky-300 hover:border-sky-300 hover:bg-sky-500 hover:text-black hover:shadow-[0_0_24px_rgba(56,189,248,.32)]"
            }`}
          >
            <span className="hidden sm:inline">⚡ Admin</span>
            <span className="sm:hidden">⚡</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
