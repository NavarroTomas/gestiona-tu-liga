"use client";

import { useEffect, useRef } from "react";
import "./club-profile-redesign.css";

/**
 * Layout visual para todas las fichas públicas de club.
 *
 * Además de aplicar el sistema visual común, elimina pictogramas emoji
 * heredados de la versión anterior. De esta forma la ficha mantiene un
 * lenguaje editorial/deportivo consistente, basado en tipografía, escudos
 * y color, sin iconografía emoji decorativa.
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
    </div>
  );
}
