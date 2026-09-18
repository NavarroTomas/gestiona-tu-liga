"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { pageKeyForPathname, normalizeUniversalDocument, styleForBreakpoint, styleToCss, type UniversalBreakpoint, type UniversalEditorDocument } from "@/lib/siteUniversalEditor";

function breakpointForWidth(width: number): UniversalBreakpoint {
  if (width <= 640) return "mobile";
  if (width <= 1024) return "tablet";
  return "desktop";
}

function selectorForElement(element: Element): string {
  const parts: string[] = [];
  let current: Element | null = element;
  while (current && current !== document.body && parts.length < 7) {
    let part = current.tagName.toLowerCase();
    if (current.id) {
      part += `#${CSS.escape(current.id)}`;
      parts.unshift(part);
      break;
    }
    const parent: Element | null = current.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter((child: Element) => child.tagName === current!.tagName);
      if (siblings.length > 1) part += `:nth-of-type(${siblings.indexOf(current) + 1})`;
    }
    parts.unshift(part);
    current = parent;
  }
  return parts.join(" > ");
}

function applyDocument(doc: UniversalEditorDocument, breakpoint: UniversalBreakpoint) {
  if (doc.page.background) document.body.style.background = doc.page.background;
  if (doc.page.fontFamily) document.body.style.fontFamily = doc.page.fontFamily;

  for (const rule of Object.values(doc.rules)) {
    let nodes: NodeListOf<HTMLElement>;
    try {
      nodes = document.querySelectorAll<HTMLElement>(rule.selector);
    } catch {
      continue;
    }

    nodes.forEach((node) => {
      if (rule.removed) {
        node.setAttribute("data-apa-editor-removed", "true");
        node.setAttribute("aria-hidden", "true");
        node.replaceChildren();
        node.style.display = "none";
        return;
      }

      node.removeAttribute("data-apa-editor-removed");
      node.removeAttribute("aria-hidden");
      Object.assign(node.style, styleToCss(styleForBreakpoint(rule, breakpoint)));

      if (rule.text !== undefined && !node.querySelector("*") && node.textContent !== rule.text) node.textContent = rule.text;
      if (rule.href !== undefined && node instanceof HTMLAnchorElement) node.href = rule.href;
      if (rule.src !== undefined && (node instanceof HTMLImageElement || node instanceof HTMLIFrameElement)) node.src = rule.src;
    });
  }
}

export default function UniversalSiteEditorRuntime() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const editing = searchParams.get("siteEditor") === "1";

  useEffect(() => {
    const pageKey = pageKeyForPathname(pathname);
    if (!pageKey || pageKey === "home") return;

    let cancelled = false;
    let currentDoc: UniversalEditorDocument | null = null;
    let currentBreakpoint = breakpointForWidth(window.innerWidth);

    const load = async () => {
      const { data } = await supabase.from("site_public_pages").select("document").eq("page_key", pageKey).maybeSingle();
      if (cancelled || !data?.document) return;
      currentDoc = normalizeUniversalDocument(data.document, pageKey, pathname);
      applyDocument(currentDoc, currentBreakpoint);
    };
    void load();

    const onResize = () => {
      const next = breakpointForWidth(window.innerWidth);
      if (next === currentBreakpoint) return;
      currentBreakpoint = next;
      if (currentDoc) applyDocument(currentDoc, currentBreakpoint);
    };
    window.addEventListener("resize", onResize);

    if (!editing) {
      return () => {
        cancelled = true;
        window.removeEventListener("resize", onResize);
      };
    }

    const onClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      if (!target || target.getAttribute("data-apa-editor-removed") === "true") return;
      event.preventDefault();
      event.stopPropagation();
      const selector = selectorForElement(target);
      const html = target as HTMLElement;
      window.parent.postMessage({
        type: "APA_EDITOR_SELECT",
        selector,
        tagName: target.tagName.toLowerCase(),
        label: (html.getAttribute("aria-label") || html.textContent || target.tagName).trim().slice(0, 80),
        text: html.children.length ? "" : (html.textContent || ""),
        href: target instanceof HTMLAnchorElement ? target.getAttribute("href") || "" : "",
        src: target instanceof HTMLImageElement ? target.getAttribute("src") || "" : "",
      }, window.location.origin);
    };

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.data?.type !== "APA_EDITOR_APPLY") return;
      currentDoc = normalizeUniversalDocument(event.data.document, pageKey, pathname);
      currentBreakpoint = event.data.breakpoint || currentBreakpoint;
      applyDocument(currentDoc, currentBreakpoint);
    };

    document.addEventListener("click", onClick, true);
    window.addEventListener("message", onMessage);
    window.parent.postMessage({ type: "APA_EDITOR_READY" }, window.location.origin);

    return () => {
      cancelled = true;
      window.removeEventListener("resize", onResize);
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("message", onMessage);
    };
  }, [editing, pathname]);

  return null;
}
