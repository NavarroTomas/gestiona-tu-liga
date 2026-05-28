"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const menus = [
  {
    nombre: "Competición",
    items: [
      { nombre: "Divisiones", href: "/divisiones" },
      { nombre: "Fixture", href: "/fixture" },
      { nombre: "Stats", href: "/estadisticas" },
      { nombre: "Historia", href: "/historia" },
    ],
  },
  {
    nombre: "Clubes",
    items: [
      { nombre: "Clubes", href: "/clubes" },
      { nombre: "Plantillas", href: "/plantillas" },
      { nombre: "Mercado", href: "/mercado" },
      { nombre: "Jugadores", href: "/jugadores" },
    ],
  },
];

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

  return (
    <nav className="sticky top-0 z-[9999] border-b border-white/10 bg-[#050914]/90 px-6 py-3 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6">
        {/* Lado izquierdo */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className={`group relative overflow-hidden rounded-2xl px-4 py-2 text-sm font-black transition ${
              pathname === "/"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                : "text-zinc-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            Inicio
          </Link>

          {menus.map((menu) => {
            const activo = menu.items.some((item) =>
              pathname.startsWith(item.href)
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
                  className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-black transition ${
                    activo
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                      : "text-zinc-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {menu.nombre}
                  <span
                    className={`text-xs transition-transform ${
                      open === menu.nombre ? "rotate-180" : ""
                    }`}
                  >
                    ▾
                  </span>
                </button>

                {open === menu.nombre && (
                  <div className="absolute left-0 top-full z-[99999] mt-3 w-64 overflow-hidden rounded-2xl border border-white/10 bg-[#070b12]/95 p-2 shadow-2xl shadow-black/50 backdrop-blur-xl">
                    <div className="mb-2 border-b border-white/10 px-3 py-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-blue-400">
                        {menu.nombre}
                      </p>
                    </div>

                    {menu.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(null)}
                        className={`block rounded-xl px-4 py-3 text-sm font-bold transition ${
                          pathname.startsWith(item.href)
                            ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                            : "text-zinc-300 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {item.nombre}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Lado derecho */}
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className={`rounded-2xl border px-5 py-2 text-sm font-black transition ${
              pathname.startsWith("/admin")
                ? "border-blue-400 bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                : "border-blue-500/40 bg-blue-500/10 text-blue-300 hover:border-blue-400 hover:bg-blue-500 hover:text-white hover:shadow-lg hover:shadow-blue-600/25"
            }`}
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    </nav>
  );
}