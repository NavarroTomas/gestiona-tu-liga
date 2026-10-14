"use client";
import type { ReactNode } from "react";
export default function LandingSectionLink({target, children, className}: {target: string; children: ReactNode; className?: string}) {
  return <a href={"#" + target} className={className} onClick={event => {
    const element = document.getElementById(target);
    if (!element) return;
    event.preventDefault();
    let top = 0;
    if (element.tagName === "SECTION") {
      for (const sibling of element.parentElement?.children ?? []) {
        if (sibling === element) break;
        top += sibling.getBoundingClientRect().height;
      }
    }
    window.scrollTo({top, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth"});
    window.history.replaceState(null, "", "#" + target);
    element.setAttribute("tabindex", "-1");
    element.focus({preventScroll: true});
  }}>{children}</a>;
}
