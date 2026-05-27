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
  {
    nombre: "Admin",
    items: [
      { nombre: "Panel Admin", href: "/admin" },
      { nombre: "Subir TXT", href: "/admin/subir-txt" },
      { nombre: "Listas", href: "/admin/listas" },
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
    <nav className="sticky top-0 z-[9999] bg-[#070b12] border-b border-zinc-800 px-6 py-3">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className={`px-4 py-2 rounded-xl text-sm font-black transition ${
            pathname === "/"
              ? "bg-blue-600 text-white"
              : "text-zinc-300 hover:bg-zinc-800"
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
                className={`px-4 py-2 rounded-xl text-sm font-black transition ${
                  activo
                    ? "bg-blue-600 text-white"
                    : "text-zinc-300 hover:bg-zinc-800"
                }`}
              >
                {menu.nombre} ▾
              </button>

              {open === menu.nombre && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-zinc-950 border border-zinc-800 rounded-2xl p-2 shadow-2xl z-[99999]">
                  {menu.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(null)}
                      className={`block px-4 py-3 rounded-xl text-sm font-bold ${
                        pathname.startsWith(item.href)
                          ? "bg-blue-600 text-white"
                          : "text-zinc-300 hover:bg-zinc-800"
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
    </nav>
  );
}