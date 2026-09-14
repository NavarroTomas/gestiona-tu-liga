"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getMyAdminPermissions, hasPermission } from "@/lib/adminPermissions";
import { supabase } from "@/lib/supabase";

type AdminCard = {
  href: string;
  group: "Gestión deportiva" | "Contenido e historia" | "Administración";
  eyebrow: string;
  title: string;
  description: string;
  permissions: string[];
  priority?: boolean;
};

const ADMIN_CARDS: AdminCard[] = [
  {
    href: "/admin/partidos",
    group: "Gestión deportiva",
    eyebrow: "Carga y correcciones",
    title: "Partidos y resultados",
    description: "Importá TXT, cargá partidos manuales y revisá registros existentes desde una sola área.",
    permissions: ["matches.upload_txt", "matches.upload_manual", "matches.edit"],
    priority: true,
  },
  {
    href: "/admin/torneos",
    group: "Gestión deportiva",
    eyebrow: "Liga y copas",
    title: "Competición",
    description: "Fixture, clasificación, copas, sanciones y playoffs agrupados bajo la misma responsabilidad.",
    permissions: ["competitions.manage", "fixtures.manage"],
    priority: true,
  },
  {
    href: "/admin/clubes",
    group: "Gestión deportiva",
    eyebrow: "Instituciones",
    title: "Clubes",
    description: "Datos, imágenes, colores e inscripción de clubes por temporada y división.",
    permissions: ["clubs.manage"],
  },
  {
    href: "/admin/plantillas",
    group: "Gestión deportiva",
    eyebrow: "Jugadores y transferencias",
    title: "Plantillas y mercado",
    description: "Gestioná planteles, jugadores y movimientos entre clubes.",
    permissions: ["transfers.manage"],
  },
  {
    href: "/admin/noticias",
    group: "Contenido e historia",
    eyebrow: "Publicaciones",
    title: "Noticias",
    description: "Administrá comunicados, novedades y contenido editorial de APA.",
    permissions: ["news.manage"],
  },
  {
    href: "/admin/historia",
    group: "Contenido e historia",
    eyebrow: "Palmarés y reconocimientos",
    title: "Historia y premios",
    description: "Campeones oficiales y premios individuales reunidos dentro de una sola área.",
    permissions: ["titles.manage"],
  },
  {
    href: "/admin/cuentas",
    group: "Administración",
    eyebrow: "Comunidad",
    title: "Usuarios",
    description: "Estados de cuenta, verificaciones de Player ID, Steam, Discord y disputas.",
    permissions: ["admin.users.manage"],
    priority: true,
  },
  {
    href: "/admin/permisos",
    group: "Administración",
    eyebrow: "Seguridad",
    title: "Permisos",
    description: "Controlá qué herramientas administrativas puede utilizar cada usuario de staff.",
    permissions: ["admin.permissions.manage"],
    priority: true,
  },
];

const GROUP_ORDER: AdminCard["group"][] = [
  "Gestión deportiva",
  "Contenido e historia",
  "Administración",
];

function canAccess(userPermissions: string[], required: string[]) {
  return required.some((permission) => hasPermission(userPermissions, permission));
}

export default function AdminPage() {
  const [permisos, setPermisos] = useState<string[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let active = true;

    async function cargarPermisos() {
      setCargando(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user || !active) return;
        const misPermisos = await getMyAdminPermissions(user.id);
        if (active) setPermisos(misPermisos);
      } catch (error) {
        console.error(error);
        if (active) setPermisos([]);
      } finally {
        if (active) setCargando(false);
      }
    }

    cargarPermisos();
    return () => {
      active = false;
    };
  }, []);

  const cardsVisibles = useMemo(
    () => ADMIN_CARDS.filter((card) => canAccess(permisos, card.permissions)),
    [permisos],
  );

  const gruposVisibles = useMemo(
    () =>
      GROUP_ORDER.map((group) => ({
        group,
        cards: cardsVisibles.filter((card) => card.group === group),
      })).filter((item) => item.cards.length > 0),
    [cardsVisibles],
  );

  if (cargando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f3f4f6] text-[#102f55]">
        <p className="text-xl font-black uppercase tracking-[0.16em]">Cargando panel...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f3f4f6] text-[#102f55]">
      <div className="mx-auto max-w-[1420px] px-4 py-8 md:px-8 md:py-10">
        <header className="mb-9 flex flex-col gap-5 border-b border-[#d7e0e8] pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[#245f8e]">Administración APA</p>
            <h1 className="mt-2 text-4xl font-black uppercase tracking-[-0.04em] md:text-6xl">Panel de control</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[#65798b] md:text-base">
              Ocho áreas, una responsabilidad clara por cada acceso. Las funciones relacionadas ahora viven dentro de la misma herramienta.
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
            <h2 className="text-2xl font-black uppercase text-[#9f3232]">Sin accesos administrativos</h2>
            <p className="mt-3 text-[#65798b]">Tu cuenta no tiene herramientas de administración asignadas.</p>
          </section>
        ) : (
          <div className="space-y-10">
            {gruposVisibles.map(({ group, cards }) => (
              <section key={group}>
                <div className="mb-4 flex items-center gap-4">
                  <h2 className="shrink-0 text-sm font-black uppercase tracking-[0.16em] text-[#102f55]">{group}</h2>
                  <div className="h-px flex-1 bg-[#d7e0e8]" />
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
      className={`group relative flex min-h-[220px] flex-col overflow-hidden rounded-[22px] border bg-white p-6 shadow-[0_8px_24px_rgba(16,47,85,.06)] transition duration-200 hover:-translate-y-1 hover:border-[#7fa4c1] hover:shadow-[0_16px_34px_rgba(16,47,85,.11)] ${
        card.priority ? "border-[#adc2d3]" : "border-[#d6e0e7]"
      }`}
    >
      {card.priority && <span className="absolute inset-x-0 top-0 h-1 bg-[#245f8e]" />}
      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#6c8498]">{card.eyebrow}</p>
      <h3 className="mt-4 text-2xl font-black tracking-[-0.03em] text-[#102f55]">{card.title}</h3>
      <p className="mt-3 flex-1 text-sm leading-6 text-[#687d8f]">{card.description}</p>
      <div className="mt-6 flex items-center justify-between border-t border-[#e3e9ee] pt-4">
        <span className="text-[11px] font-black uppercase tracking-[0.14em] text-[#245f8e]">Abrir área</span>
        <span className="text-xl font-bold text-[#245f8e] transition group-hover:translate-x-1">→</span>
      </div>
    </Link>
  );
}
