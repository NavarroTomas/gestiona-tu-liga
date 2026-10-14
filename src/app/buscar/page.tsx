"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const rutas = [
  { title: "Competición", desc: "Liga, copas y torneos oficiales.", href: "/competicion", tags: "torneos liga copa competencia" },
  { title: "Fixture", desc: "Calendario y partidos oficiales.", href: "/fixture", tags: "partidos calendario fecha resultados" },
  { title: "Historia", desc: "Campeones, récords y palmarés.", href: "/historia", tags: "historia campeones titulos palmares records" },
  { title: "Clubes", desc: "Instituciones, perfiles y escudos.", href: "/clubes", tags: "equipos clubes escudos" },
  { title: "Plantillas", desc: "Planteles oficiales por club.", href: "/plantillas", tags: "planteles jugadores clubes" },
  { title: "Jugadores", desc: "Perfiles, rankings y estadísticas.", href: "/jugadores", tags: "jugadores goles asistencias mvp ranking stats" },
  { title: "Guía", desc: "Cómo funciona la plataforma Liga.", href: "/guia", tags: "ayuda guia como funciona" },
  { title: "Entretenimiento", desc: "Predicciones y premios Liga.", href: "/entretenimiento", tags: "premios predicciones entretenimiento" },
  { title: "Premios Liga", desc: "Reconocimientos y destacados.", href: "/entretenimiento/premios", tags: "premios balon oro raiko golden boy bota" },
  { title: "Privacidad", desc: "Política de privacidad.", href: "/legal/privacidad", tags: "legal privacidad datos" },
  { title: "Términos", desc: "Términos de uso de la web.", href: "/legal/terminos", tags: "legal terminos uso" },
  { title: "Cookies", desc: "Política de cookies.", href: "/legal/cookies", tags: "legal cookies" },
];

function normalizar(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export default function BuscarPage() {
  const [query, setQuery] = useState("");

  const resultados = useMemo(() => {
    const q = normalizar(query);
    if (!q) return rutas;
    return rutas.filter((item) => normalizar(`${item.title} ${item.desc} ${item.tags}`).includes(q));
  }, [query]);

  return (
    <main className="min-h-screen bg-[#f5f6f8] px-4 py-10 text-[#0b2747] md:px-8 md:py-14">
      <section className="mx-auto max-w-5xl">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#245f8e]">Gestioná tu Liga</p>
        <h1 className="mt-2 text-4xl font-black uppercase tracking-[-0.04em] md:text-5xl">Buscar</h1>

        <div className="mt-7 rounded-2xl border border-[#0b2747]/10 bg-white p-3 shadow-[0_12px_35px_rgba(11,39,71,.06)]">
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar clubes, jugadores, fixture, premios..."
            aria-label="Buscar en Liga"
            className="w-full rounded-xl border border-[#0b2747]/10 bg-[#f5f6f8] px-4 py-4 text-base font-bold text-[#0b2747] outline-none transition focus:border-[#245f8e]"
          />
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {resultados.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-2xl border border-[#0b2747]/10 bg-white p-5 text-[#0b2747] shadow-[0_8px_24px_rgba(11,39,71,.04)] transition hover:border-[#245f8e]/40"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black uppercase">{item.title}</h2>
                  <p className="mt-1 text-sm font-medium text-[#245f8e]">{item.desc}</p>
                </div>
                <span className="text-lg font-black text-[#245f8e] transition group-hover:translate-x-1">→</span>
              </div>
            </Link>
          ))}
        </div>

        {resultados.length === 0 ? (
          <div className="mt-5 rounded-2xl bg-[#102f55] p-6 text-white">
            <p className="font-black uppercase">No encontramos resultados</p>
            <p className="mt-1 text-sm text-white/70">Probá con otro término.</p>
          </div>
        ) : null}
      </section>
    </main>
  );
}
