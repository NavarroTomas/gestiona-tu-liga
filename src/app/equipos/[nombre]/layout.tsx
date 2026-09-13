"use client";

import { useEffect, useRef } from "react";
import ClubTextColorEditor from "@/components/club-profile/ClubTextColorEditor";
import "./club-profile-redesign.css";
import "./club-profile-contrast.css";
import "./club-profile-final-fixes.css";

/**
 * Layout visual para todas las fichas públicas de club.
 *
 * Además de aplicar el sistema visual común, elimina pictogramas emoji
 * heredados de la versión anterior. La capa de contraste se carga después
 * del rediseño base y los ajustes finales se cargan últimos para que las
 * correcciones aprobadas por sección no vuelvan a ser pisadas por reglas
 * genéricas.
 *
 * El editor visual de colores aparece únicamente para usuarios presentes
 * en public.admins. Los colores guardados se cargan para todos los visitantes.
 */
export default function ClubProfileLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const emojiPattern = /[\p{Extended_Pictographic}\uFE0F]/gu;

    function cleanTextNodes() {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let node = walker.nextNode();

      while (node) {
        const value = node.nodeValue || "";
        const cleaned = value.replace(emojiPattern, "").replace(/\s{2,}/g, " ");
        if (cleaned !== value) node.nodeValue = cleaned;
        node = walker.nextNode();
      }
    }

    cleanTextNodes();

    const observer = new MutationObserver(() => cleanTextNodes());
    observer.observe(root, { childList: true, subtree: true, characterData: true });

    return () => observer.disconnect();
  }, [children]);

  return (
    <div ref={rootRef} className="club-profile-redesign">
      {children}
      <ClubTextColorEditor />
    </div>
  );
}
