"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  getMyAdminPermissions,
  hasPermission,
} from "@/lib/adminPermissions";
import { supabase } from "@/lib/supabase";

type AdminCard = {
  href: string;
  group: "Partidos" | "Competición" | "Gestión" | "Usuarios";
  eyebrow: string;
  title: string;
  description: string;
  permission: string;
  priority?: boolean;
  legacy?: boolean;
};

const ADMIN_CARDS: AdminCard[] = [
  {
    href: "/admin/subir-txt",
    group: "Partidos",
    eyebrow: "Resultados oficiales",
    title: "Subir TXT",
    description: "Importá estadísticas oficiales desde archivos MatchStats.",
    permission: "matches.upload_txt",
    priority: true,
  },
  {
    href: "/admin/cargar-partido-manual",
    group: "Partidos",
    eyebrow: "Carga manual",
    title: "Partido manual",
    description: "Cargá partidos históricos, goleadores, asistencias y MVP sin TXT.",
    permission: "matches.upload_manual",
  },
  {
    href: "/admin/listas",
    group: "Partidos",
    eyebrow: "Registros",
    title: "Partidos cargados",
    description: "Revisá y editá partidos que ya fueron cargados.",
    permission: "matches.edit",
  },
  {
    href: "/admin/fixture",
    group: "Competición",
    eyebrow: "Liga",
    title: "Fixture",
    description: "Generá y programá fechas de Primera y Segunda División.",
    permission: "fixtures.manage",
    priority: true,
  },
  {
    href: "/admin/competicion",
    group: "Competición",
    eyebrow: "Torneos",
    title: "Competición general",
    description: "Administrá clasificación, playoffs y Copa de Campeones.",
    permission: "competitions.manage",
    priority: true,
  },
  {
    href: "/admin/copas",
    group: "Competición",
    eyebrow: "Herramienta heredada",
    title: "Copas antiguas",
    description: "Panel auxiliar para revisar o mantener datos históricos.",
    permission: "competitions.manage",
    legacy: true,
  },
  {
    href: "/admin/clubes",
    group: "Gestión",
    eyebrow: "Clubes",
    title: "Clubes",
    description: "Administrá datos, logos, banners e inscripción por temporada.",
    permission: "clubs.manage",
  },
  {
    href: "/admin/plantillas",
    group: "Gestión",
    eyebrow: "Mercado",
    title: "Plantillas y mercado",
    description: "Gestioná jugadores, planteles y transferencias.",
    permission: "transfers.manage",
  },
  {
    href: "/admin/noticias",
    group: "Gestión",
    eyebrow: "Contenido",
    title: "Noticias",
    description: "Publicá y administrá noticias, comunicados y novedades.",
    permission: "news.manage",
  },
  {
    href: "/admin/titulos",
    group: "Gestión",
    eyebrow: "Historia",
    title: "Palmarés",
    description: "Cargá campeones y títulos oficiales por competición.",
    permission: "titles.manage",
  },
  {
    href: "/admin/premios",
    group: "Gestión",
    eyebrow: "Premios",
    title: "Premios APA",
    description: "Asigná premios individuales por temporada e historia APA.",
    permission: "titles.manage",
  },
  {
    href: "/admin/usuarios",
    group: "Usuarios",
    eyebrow: "Comunidad",
    title: "Usuarios",
    description: "Aprobá, suspendé y revisá cuentas de la comunidad.",
    permission: "admin.users.manage",
    priority: true,
  },
  {
    href: "/admin/verificaciones",
    group: "Usuarios",
    eyebrow: "Identidad deportiva",
    title: "Verificaciones",
    description: "Revisá solicitudes, aprobaciones, rechazos y disputas de Player ID.",
    permission: "admin.users.manage",
  },
  {
    href: "/admin/permisos",
    group: "Usuarios",
    eyebrow: "Seguridad",
    title: "Permisos",
    description: "Definí exactamente qué herramientas puede usar cada usuario.",
    permission: "admin.permissions.manage",
    priority: true,
  },
];

const GROUP_ORDER: AdminCard["group"][] = [
  "Partidos",
  "Competición",
  "Gestión",
  "Usuarios",
];

export default function AdminPage() {
  const [permisos, setPermisos] = useState<string[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarPermisos();
  }, []);

  async function cargarPermisos() {
    setCargando(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setPermisos([]);
        return;
      }

      const misPermisos = await getMyAdminPermissions(user.id);
      setPermisos(misPermisos);
    } catch (error) {
      console.log(error);
      setPermisos([]);
    } finally {
      setCargando(false);
    }
  }

  const cardsVisibles = useMemo(() => {
    return ADMIN_CARDS.filter((card) => hasPermission(permisos, card.permission));
  }, [permisos]);

  const gruposVisibles = useMemo(() => {
    return GROUP_ORDER.map((group) => ({
      group,
      cards: cardsVisibles.filter((card) => card.group === group),
    })).filter((item) => item.cards.length > 0);
  }, [cardsVisibles]);

  if (cargando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f3f4f6] text-[#102f55]">
        <p className="text-xl font-black uppercase tracking-[0.16em]">
          Cargando panel...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f3f4f6] text-[#102f55]">
      <div className="mx-auto max-w-[1500px] px-4 py-8 md:px-8 md:py-10">
        <header className="mb-9 flex flex-col gap-5 border-b border-[#d7e0e8] pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[#245f8e]">
              Administración APA
            </p>
            <h1 className="mt-2 text-4xl font-black uppercase tracking-[-0.04em] md:text-6xl">
              Panel de control
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#65798b] md:text-base">
              Elegí una herramienta para administrar la competición. Solo aparecen los accesos habilitados para tu cuenta.
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex min-h-11 w-fit items-center justify-center rounded-xl border border-[#cbd7e1] bg-white px-5 text-xs font-black uppercase tracking-[0.12em] text-[#102f55] transition hover:border-[#245f8e] hover:bg-[#edf3f7]"
          >
            Volver al sitio
          </Link>
        </header>

        {cardsVisibles.length === 0 ? (
          <section className="rounded-[24px] border border-[#efc7c7] bg-white p-8 text-center shadow-sm">
            <h2 className="text-2xl font-black uppercase text-[#9f3232]">
              Sin accesos administrativos
            </h2>
            <p className="mt-3 text-[#65798b]">
              Tu cuenta no tiene herramientas de administración asignadas.
            </p>
          </section>
        ) : (
          <div className="space-y-10">
            {gruposVisibles.map(({ group, cards }) => (
              <section key={group}>
                <div className="mb-4 flex items-center gap-4">
                  <h2 className="shrink-0 text-sm font-black uppercase tracking-[0.16em] text-[#102f55]">
                    {group}
                  </h2>
                  <div className="h-px flex-1 bg-[#d7e0e8]" />
                  <span className="text-xs font-bold text-[#8798a7]">
                    {cards.length} {cards.length === 1 ? "herramienta" : "herramientas"}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {cards.map((card) => (
                    <AdminCard key={card.href} card={card} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function AdminCard({ card }: { card: AdminCard }) {
  return (
    <Link
      href={card.href}
      className={`group relative flex min-h-[210px] flex-col overflow-hidden rounded-[22px] border bg-white p-6 shadow-[0_8px_24px_rgba(16,47,85,.06)] transition duration-200 hover:-translate-y-1 hover:border-[#7fa4c1] hover:shadow-[0_16px_34px_rgba(16,47,85,.11)] ${
        card.priority ? "border-[#adc2d3]" : "border-[#d6e0e7]"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#6c8498]">
          {card.eyebrow}
        </p>
        {card.legacy && (
          <span className="rounded-full bg-[#eef1f4] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-[#788895]">
            Heredado
          </span>
        )}
      </div>

      <h3 className="mt-4 text-2xl font-black tracking-[-0.03em] text-[#102f55]">
        {card.title}
      </h3>
      <p className="mt-3 flex-1 text-sm leading-6 text-[#687d8f]">
        {card.description}
      </p>

      <div className="mt-6 flex items-center justify-between border-t border-[#e3e9ee] pt-4">
        <span className="text-[11px] font-black uppercase tracking-[0.14em] text-[#245f8e]">
          Abrir herramienta
        </span>
        <span className="text-xl font-bold text-[#245f8e] transition group-hover:translate-x-1">
          →
        </span>
      </div>

      {card.priority && (
        <span className="absolute inset-x-0 top-0 h-1 bg-[#245f8e]" />
      )}
    </Link>
  );
}
