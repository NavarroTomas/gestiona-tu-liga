"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  COMPETITION_EDITOR_STORAGE_KEY,
  DEFAULT_COMPETITION_LAYOUT,
  normalizeCompetitionLayout,
  type CompetitionLayoutConfig,
} from "./competition-editor-config";

const competiciones = [
  {
    titulo: "Torneo de Liga",
    subtitulo: "Primera y Segunda",
    href: "/divisiones",
  },
  {
    titulo: "Clasificación a Copas",
    subtitulo: "Fase de grupos",
    href: "/competicion/copas",
  },
  {
    titulo: "Copa Argentina",
    subtitulo: "Cuartos de final",
    href: "/competicion/copa-argentina",
  },
  {
    titulo: "Copa APA",
    subtitulo: "En juego",
    href: "/competicion/copa-apa",
  },
  {
    titulo: "Playoffs de Ascenso",
    subtitulo: "Próximamente",
    href: "/competicion/playoffs",
  },
  {
    titulo: "Copa de Campeones",
    subtitulo: "Próximamente",
    href: "/competicion/copa-campeones",
  },
];

function SearchIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-7 w-7">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="2.2" />
      <path d="m16 16 4.4 4.4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function CompetitionHeader() {
  return (
    <header className="relative z-30 h-[122px] border-b border-[#c9e3f1] bg-[linear-gradient(100deg,#f3fafe_0%,#edf8fe_44%,#f8fcff_100%)] text-[#102f55] shadow-[0_4px_24px_rgba(16,47,85,.06)] max-lg:h-[96px]">
      <div className="mx-auto flex h-full max-w-[1600px] items-center px-[68px] max-xl:px-8 max-md:px-4">
        <Link href="/" className="flex shrink-0 items-center gap-4" aria-label="PSO Argentina - Inicio">
          <div className="relative h-[82px] w-[82px] overflow-hidden rounded-[4px] border border-[#102f55]/15 bg-white shadow-[0_4px_14px_rgba(16,47,85,.12)] max-lg:h-[64px] max-lg:w-[64px]">
            <Image src="/logo-apa.png" alt="APA PSO Argentina" fill priority sizes="82px" className="object-cover" />
          </div>
          <div className="leading-none max-sm:hidden">
            <div className="text-[41px] font-black tracking-[-0.05em] text-[#102f55] max-xl:text-[34px] max-lg:text-[28px]">PSO</div>
            <div className="mt-2 text-[12px] font-black uppercase tracking-[0.48em] text-[#102f55] max-lg:text-[9px]">Argentina</div>
          </div>
        </Link>

        <nav className="ml-auto hidden items-center gap-4 lg:flex xl:gap-6" aria-label="Navegación principal">
          <Link href="/competicion" className="rounded-[5px] border-2 border-[#56afe2] bg-[#ddf1fc] px-5 py-3 text-[16px] font-black text-[#102f55]">Competición</Link>
          <Link href="/clubes" className="px-3 py-3 text-[16px] font-black transition hover:text-[#56afe2]">Clubes</Link>
          <Link href="/noticias" className="px-3 py-3 text-[16px] font-black transition hover:text-[#56afe2]">Noticias</Link>
          <Link href="/guia" className="px-3 py-3 text-[16px] font-black transition hover:text-[#56afe2]">Guía</Link>
        </nav>

        <div className="ml-auto flex items-center gap-7 lg:ml-14 max-lg:gap-4">
          <button type="button" aria-label="Buscar" title="Buscar" className="grid h-12 w-12 place-items-center rounded-full text-[#102f55] transition hover:bg-[#ddf1fc] hover:text-[#56afe2]">
            <SearchIcon />
          </button>
          <span className="h-12 w-px bg-[#b7d3e3] max-md:hidden" />
          <Link href="/registro" className="flex min-w-[228px] items-center justify-center gap-5 rounded-full bg-[#56afe2] px-8 py-[18px] text-[16px] font-black text-white shadow-[0_8px_20px_rgba(86,175,226,.22)] transition hover:-translate-y-0.5 hover:bg-[#3c9ed7] max-xl:min-w-[190px] max-lg:min-w-0 max-lg:px-6 max-md:hidden">
            Unite a APA <span className="text-xl leading-none">→</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function CompeticionPage() {
  const [layout, setLayout] = useState<CompetitionLayoutConfig>(DEFAULT_COMPETITION_LAYOUT);

  useEffect(() => {
    const raw = window.localStorage.getItem(COMPETITION_EDITOR_STORAGE_KEY);
    if (!raw) return;
    try {
      setLayout(normalizeCompetitionLayout(JSON.parse(raw)));
    } catch {
      // Mantener layout por defecto si la configuración local no es válida.
    }
  }, []);

  return (
    <>
      <style>{`
        body:has(main.apa-competition-redesign) > nav { display: none !important; }
        body:has(main.apa-competition-redesign) { background: #102f55; }
      `}</style>

      <main className="apa-competition-redesign min-h-[100svh] overflow-hidden bg-[#102f55] text-white">
        <CompetitionHeader />

        <section className="relative h-[calc(100svh-122px)] min-h-[650px] overflow-hidden max-lg:h-[calc(100svh-96px)] max-lg:min-h-[620px]">
          <Image
            src="/images/competicion-hero.png"
            alt="Estadio de Pro Soccer Online"
            fill
            priority
            sizes="100vw"
            className="object-cover"
            style={{
              objectPosition: `${layout.background.x}% ${layout.background.y}%`,
              transform: `scale(${layout.background.scale})`,
              filter: `brightness(${layout.background.brightness})`,
            }}
          />

          <div className="absolute inset-0 bg-[#07172a]" style={{ opacity: layout.background.overlay }} />

          <p
            className="absolute z-10 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-black uppercase tracking-[0.62em] text-[#56afe2] drop-shadow-[0_3px_12px_rgba(0,0,0,.55)] max-md:tracking-[0.45em]"
            style={{ left: `${layout.season.x}%`, top: `${layout.season.y}%`, fontSize: `${layout.season.fontSize}px`, opacity: layout.season.opacity }}
          >
            Temporada 4
          </p>

          <h1
            className="absolute z-10 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap px-4 text-center font-black uppercase leading-none tracking-[-0.045em] text-white drop-shadow-[0_5px_18px_rgba(0,0,0,.55)] max-md:whitespace-normal max-md:text-[34px] max-sm:text-[29px]"
            style={{ left: `${layout.title.x}%`, top: `${layout.title.y}%`, fontSize: `${layout.title.fontSize}px`, opacity: layout.title.opacity }}
          >
            Competición Oficial
          </h1>

          <div
            className="absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#56afe2] shadow-[0_2px_8px_rgba(0,0,0,.20)]"
            style={{ left: `${layout.line.x}%`, top: `${layout.line.y}%`, width: `${layout.line.width}px`, height: `${layout.line.height}px`, opacity: layout.line.opacity }}
          />

          <div
            className="absolute z-20 -translate-x-1/2 -translate-y-1/2 max-lg:w-[96%]! max-md:w-[97%]!"
            style={{ left: `${layout.menu.x}%`, top: `${layout.menu.y}%`, width: `${layout.menu.width}%`, minHeight: `${layout.menu.minHeight}px`, opacity: layout.menu.opacity }}
          >
            <div
              className="grid grid-cols-6 overflow-hidden border border-white/75 bg-[#f6fbfe]/95 p-[10px] text-[#102f55] shadow-[0_10px_35px_rgba(2,20,40,.22)] backdrop-blur-md max-lg:grid-cols-3 max-lg:gap-y-1 max-md:grid-cols-2 max-md:p-2"
              style={{ borderRadius: `${layout.menu.radius}px` }}
            >
              {competiciones.map((competicion, index) => {
                const active = index === 0;
                return (
                  <Link
                    key={competicion.href}
                    href={competicion.href}
                    className={`group relative flex min-h-[96px] flex-col items-center justify-center px-5 text-center transition max-xl:px-3 max-lg:min-h-[78px] max-md:min-h-[72px] ${active ? "rounded-[14px] bg-[#d8effc]" : "hover:bg-[#eaf7fd]"}`}
                  >
                    {index > 0 && <span className="absolute left-0 top-1/2 h-[52px] w-px -translate-y-1/2 bg-[#bfd9e8] max-lg:hidden" />}
                    <span className="text-[17px] font-black leading-tight text-[#102f55] max-xl:text-[15px] max-md:text-[13px]">{competicion.titulo}</span>
                    <span className="mt-2 text-[14px] font-medium leading-none text-[#4f7196] max-xl:text-[12px] max-md:mt-1.5 max-md:text-[11px]">{competicion.subtitulo}</span>
                    {active && <span className="absolute bottom-[9px] h-[4px] w-[104px] rounded-full bg-[#56afe2] max-xl:w-20 max-md:bottom-1.5 max-md:h-[3px] max-md:w-16" />}
                  </Link>
                );
              })}
            </div>
          </div>

          <Link
            href="/competicion/editor"
            className="absolute right-4 top-4 z-40 rounded-full border border-white/70 bg-white/90 px-4 py-2 text-xs font-black text-[#102f55] shadow-lg backdrop-blur transition hover:bg-[#56afe2] hover:text-white"
          >
            ✎ Editar diseño
          </Link>
        </section>
      </main>
    </>
  );
}
