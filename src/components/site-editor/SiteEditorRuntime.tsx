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
const REMOVED_ATTR = "data-apa-editor-removed";
const AUTO_COMPONENT_ATTR = "data-apa-auto-component";
const AUTO_PART_ATTR = "data-apa-auto-part";

function getBreakpoint(): UniversalBreakpoint {
  if (window.innerWidth <= 640) return "mobile";
  if (window.innerWidth <= 1024) return "tablet";
  return "desktop";
}

function elementSelector(element: Element): string {
  const parts: string[] = [];
  let current: Element | null = element;
  while (current && current !== document.body) {
    const parent: Element | null = current.parentElement;
    if (!parent) break;
    const tag = current.tagName.toLowerCase();
    const siblings = Array.from(parent.children).filter((child) => child.tagName === current!.tagName);
    const index = siblings.indexOf(current) + 1;
    parts.unshift(`${tag}:nth-of-type(${index})`);
    current = parent;
  }
  return `body > ${parts.join(" > ")}`;
}

function stableClassName(element: Element) {
  return Array.from(element.classList)
    .filter((name) => !name.startsWith("data-") && !name.includes("apa-editor"))
    .sort()
    .join(".");
}

function structuralSignature(element: Element) {
  const childShape = Array.from(element.children)
    .slice(0, 8)
    .map((child) => `${child.tagName.toLowerCase()}.${stableClassName(child)}`)
    .join("|");
  return `${element.tagName.toLowerCase()}::${stableClassName(element)}::${childShape}`;
}

function shortHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function relativePartKey(element: Element, root: Element) {
  const parts: string[] = [];
  let current: Element | null = element;

  while (current && current !== root) {
    const parent: Element | null = current.parentElement;
    if (!parent) break;
    const signature = `${current.tagName.toLowerCase()}.${stableClassName(current)}`;
    const siblings = Array.from(parent.children).filter(
      (child) => `${child.tagName.toLowerCase()}.${stableClassName(child)}` === signature,
    );
    parts.unshift(`${current.tagName.toLowerCase()}-${siblings.indexOf(current) + 1}`);
    current = parent;
  }

  return parts.join("__");
}

function annotateAutomaticComponents(pageKey: string) {
  document.querySelectorAll(`[${AUTO_COMPONENT_ATTR}], [${AUTO_PART_ATTR}]`).forEach((node) => {
    node.removeAttribute(AUTO_COMPONENT_ATTR);
    node.removeAttribute(AUTO_PART_ATTR);
  });

  const rootTags = new Set(["ARTICLE", "LI", "TR", "SECTION", "DIV", "A"]);
  const parents = Array.from(document.body.querySelectorAll("*")).filter(
    (node) => node instanceof HTMLElement && node.children.length >= 2,
  );

  for (const parent of parents) {
    const groups = new Map<string, Element[]>();

    for (const child of Array.from(parent.children)) {
      if (!rootTags.has(child.tagName)) continue;
      if (child.hasAttribute("data-editor-component")) continue;
      if (child.closest("[data-editor-component]")) continue;
      if (child.children.length === 0 && child.textContent?.trim().length === 0) continue;

      const signature = structuralSignature(child);
      const items = groups.get(signature) || [];
      items.push(child);
      groups.set(signature, items);
    }

    for (const [signature, items] of groups) {
      if (items.length < 2) continue;

      const parentContext = `${parent.tagName.toLowerCase()}::${stableClassName(parent)}`;
      const componentName = `auto-${shortHash(`${pageKey}::${parentContext}::${signature}`)}`;

      for (const item of items) {
        item.setAttribute(AUTO_COMPONENT_ATTR, componentName);
        const descendants = Array.from(item.querySelectorAll("*")).filter(
          (node) => !node.closest("[data-editor-component]") && !node.hasAttribute(AUTO_COMPONENT_ATTR),
        );

        for (const descendant of descendants) {
          const partKey = relativePartKey(descendant, item);
          if (partKey) descendant.setAttribute(AUTO_PART_ATTR, partKey);
        }
      }
    }
  }
}

function applyCss(element: HTMLElement, css: Record<string, string>) {
  for (const [property, value] of Object.entries(css)) {
    if (property === "color") {
      const current = element.style.getPropertyValue("color");
      const priority = element.style.getPropertyPriority("color");
      if (current !== value || priority !== "important") {
        element.style.setProperty("color", value, "important");
      }
      continue;
    }

    const key = property as keyof CSSStyleDeclaration;
    if (element.style[key] !== value) {
      Object.assign(element.style, { [property]: value });
    }
  }
}

function enforceClubDynamicStyles() {
  const statuses = document.querySelectorAll<HTMLElement>("[data-result-status]");
  statuses.forEach((element) => {
    const status = element.dataset.resultStatus;
    const palette =
      status === "win"
        ? { background: "#126a48", border: "#35c786", color: "#ffffff" }
        : status === "draw"
          ? { background: "#f4c542", border: "#ffd86a", color: "#102f55" }
          : status === "loss"
            ? { background: "#8b2635", border: "#ef7180", color: "#ffffff" }
            : { background: "#e8eef3", border: "#c7d4de", color: "#45657f" };

    element.style.setProperty("background", palette.background, "important");
    element.style.setProperty("background-color", palette.background, "important");
    element.style.setProperty("border-color", palette.border, "important");
    element.style.setProperty("color", palette.color, "important");
    element.querySelectorAll<HTMLElement>("*").forEach((child) => {
      child.style.setProperty("color", palette.color, "important");
    });
  });

  document.querySelectorAll<HTMLElement>('[data-history-score="true"]').forEach((element) => {
    element.style.setProperty("background", "#ffffff", "important");
    element.style.setProperty("background-color", "#ffffff", "important");
    element.style.setProperty("border-color", "#d1d5db", "important");
    element.style.setProperty("color", "#102f55", "important");
    element.style.setProperty("opacity", "1", "important");
  });


  document.querySelectorAll<HTMLElement>('[data-history-competition="true"]').forEach((element) => {
    element.style.setProperty("background", "#dff2fb", "important");
    element.style.setProperty("background-color", "#dff2fb", "important");
    element.style.setProperty("border-color", "#b9d9ea", "important");
    element.style.setProperty("color", "#0f3b62", "important");
    element.style.setProperty("opacity", "1", "important");

    element.querySelectorAll<HTMLElement>("*").forEach((child) => {
      child.style.setProperty("color", "#0f3b62", "important");
      child.style.setProperty("opacity", "1", "important");
    });
  });

  document.querySelectorAll<HTMLElement>('[data-editor-component="club-squad-row"]').forEach((row) => {
    const colors: Record<string, string> = {
      position: "#111827",
      player: "#111827",
      goals: "#245f8e",
      assists: "#111827",
      mvp: "#111827",
      profile: "#111827",
    };

    row.querySelectorAll<HTMLElement>("[data-editor-part]").forEach((part) => {
      const key = part.dataset.editorPart || "";
      const color = colors[key];
      if (!color) return;
      part.style.setProperty("color", color, "important");
      part.style.setProperty("opacity", "1", "important");
      part.querySelectorAll<HTMLElement>("*").forEach((child) => {
        child.style.setProperty("color", color, "important");
        child.style.setProperty("opacity", "1", "important");
      });
    });
  });
}

function applyDocument(documentValue: UniversalEditorDocument, breakpoint: UniversalBreakpoint) {
  annotateAutomaticComponents(documentValue.pageKey);
  for (const rule of Object.values(documentValue.rules)) {
    const elements = Array.from(document.querySelectorAll(rule.selector)).filter(
      (node): node is HTMLElement => node instanceof HTMLElement,
    );
    if (!elements.length) continue;

    for (const element of elements) {
      const positionalRule = rule.selector.startsWith("body >");
      const protectedDynamicNode =
        element.closest('[data-editor-component="club-squad-row"]') ||
        element.closest("[data-result-status]") ||
        element.closest('[data-history-score="true"]') ||
        element.closest('[data-history-competition="true"]');

      // No aplicar snapshots posicionales viejos a contenido dinámico.
      // Un nth-of-type guardado cuando había N jugadores o determinados
      // resultados no debe definir el aspecto de filas nuevas ni de estados
      // Victoria/Empate/Derrota que cambian según el club.
      if (positionalRule && protectedDynamicNode) continue;

      if (rule.removed) {
        element.setAttribute(REMOVED_ATTR, "true");
        if (element.style.display !== "none") element.style.display = "none";
        continue;
      }

      if (element.getAttribute(REMOVED_ATTR) === "true") {
        element.removeAttribute(REMOVED_ATTR);
        element.style.removeProperty("display");
      }

      const css = styleToCss(styleForBreakpoint(rule, breakpoint));
      applyCss(element, css);

      if (
        rule.text !== undefined &&
        rule.scope !== "component" &&
        !["INPUT", "TEXTAREA", "SELECT", "IMG"].includes(element.tagName) &&
        element.textContent !== rule.text
      ) {
        element.textContent = rule.text;
      }

      if (rule.href !== undefined && rule.scope !== "component" && element instanceof HTMLAnchorElement) {
        const currentHref = element.getAttribute("href") || "";
        if (currentHref !== rule.href) element.setAttribute("href", rule.href);
      }

      if (rule.src !== undefined && rule.scope !== "component" && element instanceof HTMLImageElement) {
        const currentSrc = element.getAttribute("src") || "";
        if (currentSrc !== rule.src) element.setAttribute("src", rule.src);
      }
    }
  }

  enforceClubDynamicStyles();

  if (documentValue.page.background && document.body.style.background !== documentValue.page.background) {
    document.body.style.background = documentValue.page.background;
  }
  if (documentValue.page.fontFamily && document.body.style.fontFamily !== documentValue.page.fontFamily) {
    document.body.style.fontFamily = documentValue.page.fontFamily;
  }
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
    const resolvedPageKey: string = pageKey;

    let active = true;
    let frame = 0;

    const reapply = () => {
      if (!active || !currentDocument.current || frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        if (!active || !currentDocument.current) return;
        applyDocument(currentDocument.current, getBreakpoint());
      });
    };

    const observer = new MutationObserver((mutations) => {
      const needsReapply = mutations.some((mutation) =>
        mutation.type === "childList" || mutation.type === "characterData"
      );
      if (needsReapply) reapply();
    });

    async function loadPublished() {
      const { data, error } = await supabase
        .from("site_public_pages")
        .select("document")
        .eq("page_key", resolvedPageKey)
        .maybeSingle();

      if (!active) return;
      if (error) {
        console.error(`[APA editor] No se pudo cargar la versión publicada de ${resolvedPageKey}:`, error);
        return;
      }
      if (!data?.document) return;

      const normalized = normalizeUniversalDocument(data.document, resolvedPageKey, pathname);
      currentDocument.current = normalized;
      applyDocument(normalized, getBreakpoint());

      observer.observe(document.body, {
        subtree: true,
        childList: true,
        characterData: true,
      });

      window.setTimeout(reapply, 0);
      window.setTimeout(reapply, 100);
      window.setTimeout(reapply, 350);
      window.setTimeout(reapply, 900);
    }

    void loadPublished();

    const onResize = () => reapply();
    window.addEventListener("resize", onResize);

    return () => {
      active = false;
      observer.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      currentDocument.current = null;
    };
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
      annotateAutomaticComponents(pageKeyForPathname(pathname) || "unknown");
      const explicitComponent = element.closest("[data-editor-component]");
      const autoComponent = element.closest(`[${AUTO_COMPONENT_ATTR}]`);
      const component = explicitComponent || autoComponent;
      const explicitComponentName = explicitComponent?.getAttribute("data-editor-component") || "";
      const autoComponentName = autoComponent?.getAttribute(AUTO_COMPONENT_ATTR) || "";
      const componentName = explicitComponentName || autoComponentName;

      const explicitPart = element.closest("[data-editor-part]");
      const autoPart = element.closest(`[${AUTO_PART_ATTR}]`);
      const part = explicitComponent ? explicitPart : autoPart;
      const partName = part && component?.contains(part)
        ? explicitComponent
          ? part.getAttribute("data-editor-part") || ""
          : part.getAttribute(AUTO_PART_ATTR) || ""
        : "";

      const componentAttribute = explicitComponent ? "data-editor-component" : AUTO_COMPONENT_ATTR;
      const partAttribute = explicitComponent ? "data-editor-part" : AUTO_PART_ATTR;
      const reusableSelector = componentName
        ? partName
          ? `[${componentAttribute}="${CSS.escape(componentName)}"] [${partAttribute}="${CSS.escape(partName)}"]`
          : element === component
            ? `[${componentAttribute}="${CSS.escape(componentName)}"]`
            : ""
        : "";

      const componentCandidates = component && componentName
        ? Array.from(component.querySelectorAll(explicitComponent ? "[data-editor-part]" : `[${AUTO_PART_ATTR}]`))
            .filter((node) => {
              const owner = explicitComponent
                ? node.closest("[data-editor-component]")
                : node.closest(`[${AUTO_COMPONENT_ATTR}]`);
              return owner === component;
            })
            .map((node) => {
              const candidatePart = explicitComponent
                ? node.getAttribute("data-editor-part") || ""
                : node.getAttribute(AUTO_PART_ATTR) || "";
              return {
                selector: elementSelector(node),
                reusableSelector: `[${componentAttribute}="${CSS.escape(componentName)}"] [${partAttribute}="${CSS.escape(candidatePart)}"]`,
                componentPart: candidatePart,
                tagName: node.tagName.toLowerCase(),
                label: (node.textContent || node.getAttribute("aria-label") || node.tagName).trim().slice(0, 90),
              };
            })
        : [];
      const componentRootSelector = component ? elementSelector(component) : "";
      const componentRootReusableSelector = componentName
        ? `[${componentAttribute}="${CSS.escape(componentName)}"]`
        : "";
      const componentRootLabel = component
        ? (component.textContent || component.getAttribute("aria-label") || component.tagName).trim().slice(0, 90)
        : "";

      window.parent.postMessage({
        type: "APA_EDITOR_SELECT",
        selector,
        reusableSelector,
        componentName,
        componentPart: partName,
        componentCandidates,
        componentRootSelector,
        componentRootReusableSelector,
        componentRootLabel,
        componentRootTagName: component?.tagName.toLowerCase() || "",
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
        node.removeAttribute(EDITOR_ATTR);
        node.removeAttribute(HOVER_ATTR);
      });
    };
  }, [editorMode, pathname]);

  return null;
}
