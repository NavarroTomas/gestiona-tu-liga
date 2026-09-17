"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  normalizeUniversalDocument,
  pageKeyForPathname,
  styleForBreakpoint,
  styleToCss,
  type UniversalBreakpoint,
  type UniversalEditorDocument,
} from "@/lib/siteUniversalEditor";

const EDITOR_ATTR = "data-apa-editor-selected";
const HOVER_ATTR = "data-apa-editor-hover";

function getBreakpoint(): UniversalBreakpoint {
  if (window.innerWidth <= 640) return "mobile";
  if (window.innerWidth <= 1024) return "tablet";
  return "desktop";
}

function elementSelector(element: Element): string {
  const parts: string[] = [];
  let current: Element | null = element;
  while (current && current !== document.body) {
    const parent = current.parentElement;
    if (!parent) break;
    const tag = current.tagName.toLowerCase();
    const siblings = Array.from(parent.children).filter((child) => child.tagName === current!.tagName);
    const index = siblings.indexOf(current) + 1;
    parts.unshift(`${tag}:nth-of-type(${index})`);
    current = parent;
  }
  return `body > ${parts.join(" > ")}`;
}

function applyDocument(documentValue: UniversalEditorDocument, breakpoint: UniversalBreakpoint) {
  for (const rule of Object.values(documentValue.rules)) {
    const element = document.querySelector(rule.selector) as HTMLElement | null;
    if (!element) continue;
    const css = styleToCss(styleForBreakpoint(rule, breakpoint));
    Object.assign(element.style, css);
    if (rule.text !== undefined && !["INPUT", "TEXTAREA", "SELECT", "IMG"].includes(element.tagName)) element.textContent = rule.text;
    if (rule.href !== undefined && element instanceof HTMLAnchorElement) element.href = rule.href;
    if (rule.src !== undefined && element instanceof HTMLImageElement) element.src = rule.src;
  }
  if (documentValue.page.background) document.body.style.background = documentValue.page.background;
  if (documentValue.page.fontFamily) document.body.style.fontFamily = documentValue.page.fontFamily;
}

export default function SiteEditorRuntime() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const editorMode = searchParams.get("siteEditor") === "1";
  const currentDocument = useRef<UniversalEditorDocument | null>(null);

  useEffect(() => {
    const style = document.createElement("style");
    style.dataset.apaEditorRuntime = "true";
    style.textContent = `
      [${EDITOR_ATTR}="true"] { outline: 3px solid #3ea6e8 !important; outline-offset: 3px !important; }
      [${HOVER_ATTR}="true"] { outline: 2px dashed rgba(62,166,232,.85) !important; outline-offset: 2px !important; cursor: crosshair !important; }
    `;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  useEffect(() => {
    const pageKey = pageKeyForPathname(pathname);
    if (!pageKey || pageKey === "home" || editorMode) return;
    let active = true;
    async function loadPublished() {
      const { data } = await supabase.from("site_public_pages").select("document").eq("page_key", pageKey).maybeSingle();
      if (!active || !data?.document) return;
      const normalized = normalizeUniversalDocument(data.document, pageKey!, pathname);
      currentDocument.current = normalized;
      applyDocument(normalized, getBreakpoint());
    }
    void loadPublished();
    const onResize = () => currentDocument.current && applyDocument(currentDocument.current, getBreakpoint());
    window.addEventListener("resize", onResize);
    return () => { active = false; window.removeEventListener("resize", onResize); };
  }, [editorMode, pathname]);

  useEffect(() => {
    if (!editorMode) return;

    const selectable = (target: EventTarget | null) => {
      const element = target instanceof Element ? target : null;
      if (!element) return null;
      if (element.closest("[data-apa-editor-ignore]")) return null;
      if (["HTML", "BODY", "SCRIPT", "STYLE", "LINK", "META"].includes(element.tagName)) return null;
      return element;
    };

    const onMouseOver = (event: MouseEvent) => {
      const element = selectable(event.target);
      if (!element) return;
      document.querySelectorAll(`[${HOVER_ATTR}="true"]`).forEach((node) => node.removeAttribute(HOVER_ATTR));
      element.setAttribute(HOVER_ATTR, "true");
    };

    const onClick = (event: MouseEvent) => {
      const element = selectable(event.target);
      if (!element) return;
      event.preventDefault();
      event.stopPropagation();
      document.querySelectorAll(`[${EDITOR_ATTR}="true"]`).forEach((node) => node.removeAttribute(EDITOR_ATTR));
      element.setAttribute(EDITOR_ATTR, "true");
      element.removeAttribute(HOVER_ATTR);
      const selector = elementSelector(element);
      const anchor = element instanceof HTMLAnchorElement ? element : element.closest("a");
      const image = element instanceof HTMLImageElement ? element : element.querySelector("img");
      window.parent.postMessage({
        type: "APA_EDITOR_SELECT",
        selector,
        tagName: element.tagName.toLowerCase(),
        label: (element.textContent || element.getAttribute("aria-label") || element.tagName).trim().slice(0, 90),
        text: (element.textContent || "").trim().slice(0, 500),
        href: anchor instanceof HTMLAnchorElement ? anchor.getAttribute("href") || "" : "",
        src: image instanceof HTMLImageElement ? image.getAttribute("src") || "" : "",
      }, window.location.origin);
    };

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === "APA_EDITOR_APPLY" && event.data.document) {
        const pageKey = pageKeyForPathname(pathname) || "unknown";
        const normalized = normalizeUniversalDocument(event.data.document, pageKey, pathname);
        currentDocument.current = normalized;
        applyDocument(normalized, event.data.breakpoint || getBreakpoint());
      }
      if (event.data?.type === "APA_EDITOR_CLEAR_SELECTION") {
        document.querySelectorAll(`[${EDITOR_ATTR}="true"]`).forEach((node) => node.removeAttribute(EDITOR_ATTR));
      }
    };

    document.addEventListener("mouseover", onMouseOver, true);
    document.addEventListener("click", onClick, true);
    window.addEventListener("message", onMessage);
    window.parent.postMessage({ type: "APA_EDITOR_READY", pathname }, window.location.origin);
    return () => {
      document.removeEventListener("mouseover", onMouseOver, true);
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("message", onMessage);
      document.querySelectorAll(`[${EDITOR_ATTR}="true"], [${HOVER_ATTR}="true"]`).forEach((node) => {
        node.removeAttribute(EDITOR_ATTR); node.removeAttribute(HOVER_ATTR);
      });
    };
  }, [editorMode, pathname]);

  return null;
}
