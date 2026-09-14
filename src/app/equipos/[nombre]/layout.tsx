"use client";

import { useEffect, useRef } from "react";
import ClubTextColorEditor from "@/components/club-profile/ClubTextColorEditor";
import "./club-profile-redesign.css";
import "./club-profile-contrast.css";
import "./club-profile-final-fixes.css";
import "./club-profile-global-theme.css";

/**
 * Layout visual para todas las fichas públicas de club.
 *
 * La hoja global-theme se carga al final para fijar la paleta aprobada como
 * estándar de todos los clubes. El editor visual puede seguir aplicando
 * overrides puntuales guardados por administradores.
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
