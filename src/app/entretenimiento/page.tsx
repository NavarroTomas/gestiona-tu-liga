"use client";

import Link from "next/link";
import { useState } from "react";

type ExperienceId = "predicciones" | "dream-team" | "premios";

type Experience = {
  id: ExperienceId;
  title: string;
  kicker: string;
  description: string;
  href: string;
  meta: string[];
};

const EXPERIENCES: Experience[] = [
  {
    id: "predicciones",
    title: "Predicciones",
    kicker: "Pronosticá antes del partido",
    description:
      "Elegí tus resultados para los partidos oficiales y sumá puntos cuando se cargue el marcador definitivo.",
    href: "/entretenimiento/predicciones",
    meta: ["Ganador", "Marcador exacto", "Ranking"],
  },
  {
    id: "dream-team",
    title: "Dream Team",
    kicker: "Armá el equipo ideal de la fecha",
    description:
      "Seleccioná a los jugadores que más te convencen y construí tu formación ideal dentro del formato oficial de APA.",
    href: "/entretenimiento/dream-team",
    meta: ["8 jugadores", "Por fecha", "Votación"],
  },
  {
    id: "premios",
    title: "Premios APA",
    kicker: "Reconocimientos de cada jornada",
    description:
      "Consultá quiénes se destacaron y seguí los premios construidos a partir de las estadísticas oficiales de los partidos.",
    href: "/entretenimiento/premios",
    meta: ["MVP", "Goleador", "Arquero"],
  },
];

function PredictionPreview() {
  return (
    <div className="grid h-full min-h-[260px] place-items-center px-4 py-8 sm:px-8">
      <div className="w-full max-w-[560px] border-y border-[#c9e3f1] py-7">
        <div className="flex items-center justify-between gap-5 text-[#102f55]">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.14em] text-[#5c829e]">Partido</p>
            <p className="mt-2 text-[18px] font-black uppercase sm:text-[22px]">Local</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-[.14em] text-[#5c829e]">Elegí</p>
            <div className="mt-3 flex gap-2">
              {['1', 'X', '2'].map((value) => (
                <span
                  key={value}
                  className="grid h-11 w-11 place-items-center rounded-[7px] border border-[#9fcfe9] bg-white text-[15px] font-black text-[#176fa8]"
                >
                  {value}
                </span>
              ))}
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-[.14em] text-[#5c829e]">Partido</p>
            <p className="mt-2 text-[18px] font-black uppercase sm:text-[22px]">Visitante</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DreamTeamPreview() {
  return (
    <div className="grid h-full min-h-[260px] place-items-center px-4 py-8 sm:px-8">
      <div className="relative aspect-[1.65/1] w-full max-w-[540px] overflow-hidden rounded-[12px] border border-[#9fcfe9] bg-[#eef8fd]">
        <div className="absolute inset-x-[8%] top-1/2 h-px bg-[#b7d9e9]" />
        <div className="absolute left-1/2 top-0 h-full w-px bg-[#b7d9e9]" />
        <div className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#b7d9e9]" />
        <div className="absolute inset-0 grid place-items-center">
          <div className="grid w-[74%] grid-cols-4 gap-x-5 gap-y-8 text-center text-[10px] font-black uppercase text-[#176fa8] sm:text-[11px]">
            {['LST', 'RST', 'LCM', 'RCM', 'LB', 'CB', 'RB', 'GK'].map((pos) => (
              <span key={pos} className="rounded-[6px] border border-[#a8d5ec] bg-white/95 px-2 py-2 shadow-sm">
                {pos}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AwardsPreview() {
  const awards = [
    ["MVP", "Jugador destacado"],
    ["Goleador", "Más goles"],
    ["Arquero", "Mejor rendimiento"],
  ];

  return (
    <div className="grid h-full min-h-[260px] place-items-center px-4 py-8 sm:px-8">
      <div className="w-full max-w-[560px] divide-y divide-[#cfe4f0] border-y border-[#cfe4f0]">
        {awards.map(([label, value], index) => (
          <div key={label} className="grid grid-cols-[54px_1fr_auto] items-center gap-4 py-5">
            <span className="text-[28px] font-black leading-none text-[#c4e1f1]">0{index + 1}</span>
            <div>
              <p className="text-[15px] font-black uppercase text-[#102f55] sm:text-[17px]">{label}</p>
              <p className="mt-1 text-[11px] font-semibold text-[#69869a] sm:text-[12px]">{value}</p>
            </div>
            <span className="h-2 w-16 rounded-full bg-[#56afe2] sm:w-24" aria-hidden="true" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ExperiencePreview({ id }: { id: ExperienceId }) {
  if (id === "dream-team") return <DreamTeamPreview />;
  if (id === "premios") return <AwardsPreview />;
  return <PredictionPreview />;
}

export default function EntretenimientoPage() {
  const [activeId, setActiveId] = useState<ExperienceId>("predicciones");
  const active = EXPERIENCES.find((item) => item.id === activeId) ?? EXPERIENCES[0];

  return (
    <main className="min-h-screen bg-[#f3fafe] text-[#102f55]">
      <section className="border-b border-[#c9e3f1] bg-white">
        <div className="mx-auto max-w-[1680px] px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[.16em] text-[#2d98d4]">Comunidad APA</p>
              <h1 className="mt-3 max-w-[1050px] text-[clamp(3.3rem,8vw,7.6rem)] font-black uppercase leading-[.82] tracking-[-.06em] text-[#102f55]">
                Entretenimiento
              </h1>
            </div>
            <p className="max-w-xl border-t border-[#cfe4f0] pt-5 text-[14px] font-semibold leading-7 text-[#5d788e] lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0 sm:text-[15px]">
              Elegí cómo querés participar. Cada experiencia tiene su propia lógica, pero comparte el mismo ecosistema de partidos, jugadores y datos de APA.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-[#c9e3f1] bg-[#f3fafe]">
        <div className="mx-auto max-w-[1680px] px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
          <div className="overflow-hidden rounded-[14px] border border-[#c7dfec] bg-white lg:grid lg:grid-cols-[460px_minmax(0,1fr)]">
            <div className="border-b border-[#cfe4f0] bg-[#0f355a] text-white lg:border-b-0 lg:border-r lg:border-[#2a5d84]">
              <div className="px-5 pb-4 pt-6 sm:px-7 lg:px-8 lg:pb-6 lg:pt-8">
                <p className="text-[10px] font-black uppercase tracking-[.16em] text-[#79c8ef]">Elegí una experiencia</p>
              </div>

              <div className="divide-y divide-[#28587f]">
                {EXPERIENCES.map((item) => {
                  const selected = item.id === activeId;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveId(item.id)}
                      className={`group relative w-full px-5 py-6 text-left transition sm:px-7 lg:px-8 lg:py-8 ${
                        selected ? "bg-[#174b77]" : "bg-transparent hover:bg-[#123f68]"
                      }`}
                      aria-pressed={selected}
                    >
                      {selected ? <span className="absolute inset-y-0 left-0 w-1 bg-[#56afe2]" aria-hidden="true" /> : null}
                      <p className="text-[10px] font-black uppercase tracking-[.13em] text-[#79c8ef]">{item.kicker}</p>
                      <div className="mt-2 flex items-end justify-between gap-4">
                        <h2 className="text-[clamp(1.8rem,3vw,3.1rem)] font-black uppercase leading-[.92] tracking-[-.04em]">
                          {item.title}
                        </h2>
                        <span className={`h-[2px] transition-all ${selected ? "w-16 bg-[#79c8ef]" : "w-8 bg-[#3f7399] group-hover:w-12"}`} aria-hidden="true" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex min-h-[560px] flex-col bg-white">
              <div className="grid flex-1 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.9fr)]">
                <div className="flex flex-col justify-between px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[.14em] text-[#2d98d4]">Experiencia seleccionada</p>
                    <h2 className="mt-3 text-[clamp(2.8rem,6vw,6rem)] font-black uppercase leading-[.86] tracking-[-.055em] text-[#102f55]">
                      {active.title}
                    </h2>
                    <p className="mt-6 max-w-2xl text-[14px] font-semibold leading-7 text-[#5c788e] sm:text-[15px]">
                      {active.description}
                    </p>

                    <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-y border-[#d7e8f2] py-4">
                      {active.meta.map((item) => (
                        <span key={item} className="text-[11px] font-black uppercase tracking-[.08em] text-[#315f89]">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Link
                    href={active.href}
                    className="mt-10 inline-flex min-h-12 w-fit items-center justify-center rounded-[7px] bg-[#56afe2] px-6 text-[12px] font-black uppercase tracking-[.06em] text-white transition hover:bg-[#3d9fd8]"
                  >
                    Abrir {active.title}
                  </Link>
                </div>

                <div className="border-t border-[#d7e8f2] bg-[#eef8fd] lg:border-l lg:border-t-0">
                  <ExperiencePreview id={active.id} />
                </div>
              </div>

              <div className="grid border-t border-[#d7e8f2] bg-[#f9fcfe] sm:grid-cols-3">
                {EXPERIENCES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveId(item.id)}
                    className={`min-h-14 border-[#d7e8f2] px-4 text-left text-[10px] font-black uppercase tracking-[.08em] transition sm:text-center sm:[&:not(:first-child)]:border-l ${
                      item.id === activeId ? "bg-[#ddf1fc] text-[#176fa8]" : "text-[#68859a] hover:bg-[#eef8fd]"
                    }`}
                  >
                    {item.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#0f355a] text-white">
        <div className="mx-auto flex max-w-[1680px] flex-col justify-between gap-5 px-5 py-8 sm:px-8 md:flex-row md:items-center lg:px-10">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.15em] text-[#79c8ef]">APA Comunidad</p>
            <p className="mt-2 text-[18px] font-black uppercase sm:text-[21px]">Participá sin salir del ecosistema competitivo</p>
          </div>
          <p className="max-w-xl text-[12px] font-semibold leading-6 text-[#c6deec] sm:text-[13px]">
            Resultados, jugadores y estadísticas oficiales alimentan estas experiencias para que todo permanezca conectado con la temporada.
          </p>
        </div>
      </section>
    </main>
  );
}
