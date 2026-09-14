"use client";

import { useEffect, useRef } from "react";
import "./player-profile-redesign.css";

export default function PlayerProfileLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const emojiPattern = /[\p{Extended_Pictographic}\uFE0F]/gu;

    const cleanTextNodes = () => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let node = walker.nextNode();

      while (node) {
        const value = node.nodeValue || "";
        const cleaned = value.replace(emojiPattern, "").replace(/\s{2,}/g, " ");
        if (cleaned !== value) node.nodeValue = cleaned;
        node = walker.nextNode();
      }
    };

    cleanTextNodes();
    const observer = new MutationObserver(cleanTextNodes);
    observer.observe(root, { childList: true, subtree: true, characterData: true });

    return () => observer.disconnect();
  }, [children]);

  return (
    <div ref={rootRef} className="player-profile-redesign">
      {children}
    </div>
  );
}
