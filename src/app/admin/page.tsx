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
  eyebrow: string;
  title: string;
  description: string;
  icon: string;
  permission: string;
  color: string;
  priority?: boolean;
};

const ADMIN_CARDS: AdminCard[] = [
  {
    href: "/admin/permisos",
    eyebrow: "Seguridad",
    title: "Permisos",
    description: "Marcá y desmarcá qué zonas administrativas puede usar cada usuario.",
    icon: "🔐",
    permission: "admin.permissions.manage",
    color: "border-cyan-500/25 hover:border-cyan-300 hover:shadow-[0_0_25px_rgba(34,211,238,.15)]",
    priority: true,
  },
  {
    href: "/admin/competicion",
    eyebrow: "Competición",
    title: "Competición General",
    description: "Administrá clasificación, Copa de Campeones y Playoffs de Ascenso.",
    icon: "🏆",
    permission: "competitions.manage",
    color: "border-yellow-500/25 hover:border-yellow-300 hover:shadow-[0_0_25px_rgba(250,204,21,.15)]",
    priority: true,
  },
  {
    href: "/admin/fixture",
    eyebrow: "Liga",
    title: "Fixture Liga",
    description: "Generá y programá partidos de Primera y Segunda División.",
    icon: "📅",
    permission: "fixtures.manage",
    color: "border-sky-500/25 hover:border-sky-300 hover:shadow-[0_0_25px_rgba(56,189,248,.15)]",
    priority: true,
  },
  {
    href: "/admin/subir-txt",
    eyebrow: "Resultados",
    title: "Subir TXT",
    description: "Cargá estadísticas oficiales desde archivos MatchStats.",
    icon: "📄",
    permission: "matches.upload_txt",
    color: "border-sky-500/25 hover:border-sky-300 hover:shadow-[0_0_25px_rgba(56,189,248,.15)]",
    priority: true,
  },
  {
    href: "/admin/listas",
    eyebrow: "Registros",
    title: "Listas",
    description: "Editá partidos y datos ya cargados sin romper competición/fase.",
    icon: "📋",
    permission: "matches.edit",
    color: "border-blue-500/25 hover:border-blue-300 hover:shadow-[0_0_25px_rgba(59,130,246,.15)]",
  },
  {
    href: "/admin/cargar-partido-manual",
    eyebrow: "Históricos",
    title: "Partido Manual",
    description: "Cargá partidos, goleadores, asistencias y MVP sin TXT.",
    icon: "⚽",
    permission: "matches.upload_manual",
    color: "border-amber-500/25 hover:border-amber-300 hover:shadow-[0_0_25px_rgba(245,158,11,.15)]",
  },
  {
    href: "/admin/copas",
    eyebrow: "Auxiliar",
    title: "Copas viejo",
    description: "Panel auxiliar antiguo. Usalo solo si necesitás revisar datos viejos.",
    icon: "🏅",
    permission: "competitions.manage",
    color: "border-orange-500/25 hover:border-orange-300 hover:shadow-[0_0_25px_rgba(251,146,60,.15)]",
  },
  {
    href: "/admin/clubes",
    eyebrow: "Clubes",
    title: "Clubes",
    description: "Administrá logos, banners, colores y datos visuales.",
    icon: "🏟️",
    permission: "clubs.manage",
    color: "border-cyan-500/25 hover:border-cyan-300 hover:shadow-[0_0_25px_rgba(34,211,238,.15)]",
  },
  {
    href: "/admin/plantillas",
    eyebrow: "Mercado",
    title: "Plantillas y Mercado",
    description: "Administrá jugadores, plantillas y transferencias.",
    icon: "👥",
    permission: "transfers.manage",
    color: "border-emerald-500/25 hover:border-emerald-300 hover:shadow-[0_0_25px_rgba(52,211,153,.15)]",
  },
  {
    href: "/admin/noticias",
    eyebrow: "Prensa",
    title: "Noticias",
    description: "Administrá publicaciones, comunicados y novedades.",
    icon: "📰",
    permission: "news.manage",
    color: "border-sky-500/25 hover:border-sky-300 hover:shadow-[0_0_25px_rgba(56,189,248,.15)]",
  },
  {
    href: "/admin/titulos",
    eyebrow: "Historia",
    title: "Palmarés",
    description: "Cargá campeones oficiales por competición.",
    icon: "🏛️",
    permission: "titles.manage",
    color: "border-yellow-500/25 hover:border-yellow-300 hover:shadow-[0_0_25px_rgba(250,204,21,.15)]",
  },
  {
    href: "/admin/premios",
    eyebrow: "Premios",
    title: "Premios APA",
    description: "Asigná premios de temporada e historia APA.",
    icon: "🏆",
    permission: "titles.manage",
    color: "border-amber-500/25 hover:border-amber-300 hover:shadow-[0_0_25px_rgba(251,191,36,.15)]",
  },
  {
    href: "/admin/verificaciones",
    eyebrow: "Verificación",
    title: "Player IDs",
    description: "Revisá solicitudes, aprobaciones, rechazos y disputas.",
    icon: "✅",
    permission: "admin.users.manage",
    color: "border-green-500/25 hover:border-green-300 hover:shadow-[0_0_25px_rgba(74,222,128,.15)]",
  },
  {
    href: "/admin/usuarios",
    eyebrow: "Comunidad",
    title: "Usuarios",
    description: "Aprobá, suspendé y revisá usuarios. Los permisos se editan en /admin/permisos.",
    icon: "👤",
    permission: "admin.users.manage",
    color: "border-purple-500/25 hover:border-purple-300 hover:shadow-[0_0_25px_rgba(168,85,247,.15)]",
  },
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

  const cardsPrioritarias = cardsVisibles.filter((card) => card.priority);
  const cardsSecundarias = cardsVisibles.filter((card) => !card.priority);

  if (cargando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0b0f14] text-white">
        <p className="text-2xl font-black uppercase tracking-[0.18em] text-sky-300">
          Cargando permisos...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0b0f14] text-white">
      <div className="mx-auto max-w-[1500px] space-y-10 px-4 py-10 md:px-8">
        <section className="relative overflow-hidden rounded-[34px] border border-sky-500/25 bg-[#11151c] p-7 shadow-[0_0_45px_rgba(56,189,248,.10)] md:p-9">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,.14),transparent_42%)]" />
          <div className="relative z-10">
            <p className="text-xs font-black uppercase tracking-[0.35em] text-sky-400">
              Panel Administrativo
            </p>
            <h1 className="mt-3 text-4xl font-black uppercase md:text-6xl">
              Admin APA
            </h1>
            <p className="mt-4 max-w-3xl text-zinc-400">
              Dashboard limpio por permisos. Si una tarjeta no aparece, ese usuario no tiene permiso para esa sección.
            </p>
          </div>
        </section>

        {cardsVisibles.length === 0 ? (
          <section className="rounded-[30px] border border-red-500/25 bg-red-500/10 p-8 text-center">
            <h2 className="text-3xl font-black uppercase text-red-300">
              Sin permisos de admin
            </h2>
            <p className="mt-3 text-zinc-400">
              Tu usuario no tiene permisos asignados para administrar la página.
            </p>
          </section>
        ) : (
          <>
            {cardsPrioritarias.length > 0 && (
              <section>
                <p className="mb-4 text-xs font-black uppercase tracking-[0.35em] text-sky-300">
                  Accesos principales
                </p>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                  {cardsPrioritarias.map((card) => (
                    <AdminCard key={card.href} card={card} />
                  ))}
                </div>
              </section>
            )}

            {cardsSecundarias.length > 0 && (
              <section>
                <p className="mb-4 text-xs font-black uppercase tracking-[0.35em] text-zinc-500">
                  Herramientas
                </p>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-3 xl:grid-cols-5">
                  {cardsSecundarias.map((card) => (
                    <AdminCard key={card.href} card={card} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        <section className="rounded-[26px] border border-yellow-500/20 bg-yellow-500/10 p-5 text-sm leading-7 text-yellow-100">
          <b>Nota:</b> el panel viejo de roles/permisos en Usuarios queda obsoleto. Los permisos reales ahora se administran desde <b>/admin/permisos</b>.
        </section>
      </div>
    </main>
  );
}

function AdminCard({ card }: { card: AdminCard }) {
  return (
    <Link
      href={card.href}
      className={`group rounded-3xl border bg-[#11151c] p-6 transition hover:-translate-y-1 ${card.color}`}
    >
      <p className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500">
        {card.eyebrow}
      </p>
      <h3 className="mt-3 text-3xl font-black">
        {card.icon} {card.title}
      </h3>
      <p className="mt-3 text-sm leading-6 text-zinc-400">
        {card.description}
      </p>
      <div className="mt-5 flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
        <span className="text-xs font-black uppercase tracking-[0.2em] text-sky-300">
          Entrar
        </span>
        <span className="text-xl text-sky-300 transition group-hover:translate-x-1">→</span>
      </div>
    </Link>
  );
}
