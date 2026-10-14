"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE_EDITOR_PAGES } from "@/lib/siteUniversalEditor";

export default function EditorPageNavigator() {
  const pathname = usePathname();
  const currentKey = pathname === "/admin/editor" ? "home" : pathname.split("/").at(-1) || "home";

  return (
    <div data-apa-editor-ignore className="fixed left-1/2 top-3 z-[99999] -translate-x-1/2 rounded-xl border border-white/10 bg-[#222222] p-1 shadow-2xl ">
      <select
        value={currentKey}
        onChange={(event) => { window.location.href = event.target.value === "home" ? "/admin/editor" : `/admin/editor/${event.target.value}`; }}
        className="min-w-[220px] rounded-lg border border-white/10 bg-[#303030] px-3 py-2 text-[10px] font-black uppercase tracking-[0.08em] text-white outline-none"
        aria-label="Página a editar"
      >
        {Array.from(new Set(SITE_EDITOR_PAGES.map((page) => page.group))).map((group) => (
          <optgroup key={group} label={group}>
            {SITE_EDITOR_PAGES.filter((page) => page.group === group).map((page) => (
              <option key={page.key} value={page.key}>{page.label} · {page.route}</option>
            ))}
          </optgroup>
        ))}
      </select>
      <Link href="/liga" className="sr-only">Ver sitio</Link>
    </div>
  );
}
