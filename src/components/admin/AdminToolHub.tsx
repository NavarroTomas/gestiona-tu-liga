"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getMyAdminPermissions, hasPermission } from "@/lib/adminPermissions";
import { supabase } from "@/lib/supabase";

export type AdminHubTool = {
  href: string;
  title: string;
  description: string;
  eyebrow: string;
  permission: string;
  recommended?: boolean;
  legacy?: boolean;
};

type Props = {
  eyebrow: string;
  title: string;
  description: string;
  tools: AdminHubTool[];
};

export default function AdminToolHub({ eyebrow, title, description, tools }: Props) {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user || !active) return;
        const codes = await getMyAdminPermissions(user.id);
        if (active) setPermissions(codes);
      } catch (error) {
        console.error(error);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  const visibleTools = useMemo(
    () => tools.filter((tool) => hasPermission(permissions, tool.permission)),
    [permissions, tools],
  );

  return (
    <main className="min-h-screen bg-[#f3f4f6] text-[#102f55]">
      <div className="mx-auto max-w-[1320px] px-4 py-8 md:px-8 md:py-10">
        <header className="mb-8 border-b border-[#d7e0e8] pb-7">
          <Link
            href="/admin"
            className="text-[11px] font-black uppercase tracking-[0.16em] text-[#245f8e] hover:underline"
          >
            ← Volver al panel
          </Link>
          <p className="mt-6 text-xs font-black uppercase tracking-[0.26em] text-[#6d879b]">{eyebrow}</p>
          <h1 className="mt-2 text-4xl font-black tracking-[-0.04em] md:text-6xl">{title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[#65798b] md:text-base">{description}</p>
        </header>

        {loading ? (
          <div className="rounded-[22px] border border-[#d6e0e7] bg-white p-8 text-sm font-bold text-[#65798b]">
            Cargando herramientas...
          </div>
        ) : visibleTools.length === 0 ? (
          <div className="rounded-[22px] border border-[#e0c8c8] bg-white p-8 text-sm font-bold text-[#8e4b4b]">
            No tenés permisos para ninguna herramienta de esta sección.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleTools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className={`group relative flex min-h-[220px] flex-col overflow-hidden rounded-[22px] border bg-white p-6 shadow-[0_8px_24px_rgba(16,47,85,.06)] transition hover:-translate-y-1 hover:border-[#7fa4c1] hover:shadow-[0_16px_34px_rgba(16,47,85,.11)] ${
                  tool.recommended ? "border-[#adc2d3]" : "border-[#d6e0e7]"
                }`}
              >
                {tool.recommended && <span className="absolute inset-x-0 top-0 h-1 bg-[#245f8e]" />}
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#6c8498]">{tool.eyebrow}</p>
                  {tool.legacy && (
                    <span className="rounded-full bg-[#eef1f4] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-[#788895]">
                      Legado
                    </span>
                  )}
                </div>
                <h2 className="mt-4 text-2xl font-black tracking-[-0.03em] text-[#102f55]">{tool.title}</h2>
                <p className="mt-3 flex-1 text-sm leading-6 text-[#687d8f]">{tool.description}</p>
                <div className="mt-6 flex items-center justify-between border-t border-[#e3e9ee] pt-4">
                  <span className="text-[11px] font-black uppercase tracking-[0.14em] text-[#245f8e]">Abrir</span>
                  <span className="text-xl font-bold text-[#245f8e] transition group-hover:translate-x-1">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
