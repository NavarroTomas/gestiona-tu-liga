"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  createUniversalDocument,
  getSiteEditorPage,
  normalizeUniversalDocument,
  type UniversalBreakpoint,
  type UniversalEditorDocument,
  type UniversalElementRule,
  type UniversalElementStyle,
} from "@/lib/siteUniversalEditor";

type ComponentCandidate = { selector: string; reusableSelector: string; componentPart: string; tagName: string; label: string };
type SelectedNode = { selector: string; tagName: string; label: string; text: string; href: string; src: string; reusableSelector?: string; componentName?: string; componentPart?: string; componentCandidates?: ComponentCandidate[] };
type VersionRow = { id: string; version_number: number; document: unknown; created_at: string };
type InspectorTab = "content" | "style" | "layout" | "advanced" | "history";
const VIEWPORT_WIDTH: Record<UniversalBreakpoint, number> = { desktop: 1440, tablet: 900, mobile: 390 };
const SHADOWS = [["", "Sin sombra"], ["0 8px 24px rgba(0,0,0,.10)", "Suave"], ["0 18px 50px rgba(11,39,71,.18)", "Editorial"], ["0 24px 70px rgba(0,0,0,.30)", "Profunda"]];
function emptyStyle(): UniversalElementStyle { return { opacity: 1, scale: 1, rotate: 0, translateX: 0, translateY: 0 }; }
function hasMeaningfulStyles(rule: UniversalElementRule) {
  return (["desktop", "tablet", "mobile"] as UniversalBreakpoint[]).some((breakpoint) =>
    Object.entries(rule.styles[breakpoint] || {}).some(([property, value]) => {
      if (value === undefined || value === "") return false;
      if (property === "opacity") return Number(value) !== 1;
      if (property === "scale") return Number(value) !== 1;
      if (property === "rotate" || property === "translateX" || property === "translateY") return Number(value) !== 0;
      return true;
    }),
  );
}

export default function UniversalSiteEditorPage() {
  const params = useParams<{ pageKey: string }>();
  const router = useRouter();
  const pageKey = String(params.pageKey || "");
  const page = getSiteEditorPage(pageKey);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [documentValue, setDocumentValue] = useState<UniversalEditorDocument>(() => createUniversalDocument(pageKey, page?.route || "/"));
  const [selected, setSelected] = useState<SelectedNode | null>(null);
  const [viewport, setViewport] = useState<UniversalBreakpoint>("desktop");
  const [zoom, setZoom] = useState(72);
  const [tab, setTab] = useState<InspectorTab>("style");
  const [status, setStatus] = useState<"loading" | "ready" | "denied">("loading");
  const [userId, setUserId] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [versions, setVersions] = useState<VersionRow[]>([]);
  const [publishedVersion, setPublishedVersion] = useState<number | null>(null);
  const [history, setHistory] = useState<UniversalEditorDocument[]>([]);
  const [future, setFuture] = useState<UniversalEditorDocument[]>([]);
  const [iframeReady, setIframeReady] = useState(false);

  const loadVersions = useCallback(async () => {
    if (!page) return;
    const { data } = await supabase.from("site_editor_versions").select("id,version_number,document,created_at").eq("page_key", page.key).order("version_number", { ascending: false }).limit(30);
    setVersions((data || []) as VersionRow[]);
  }, [page]);

  useEffect(() => {
    if (!page) return;
    if (page.specialized) { router.replace("/admin/editor"); return; }
    let active = true;
    async function init() {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth.user;
      if (!user || !active) return setStatus("denied");
      const { data: owner } = await supabase.from("site_editor_owners").select("user_id").eq("user_id", user.id).maybeSingle();
      if (!owner || !active) return setStatus("denied");
      const [draftResult, publishedResult] = await Promise.all([
        supabase.from("site_editor_drafts").select("document,updated_at").eq("page_key", page.key).maybeSingle(),
        supabase.from("site_public_pages").select("document,version_number,published_at").eq("page_key", page.key).maybeSingle(),
      ]);
      if (!active) return;
      const draftUpdatedAt = draftResult.data?.updated_at ? new Date(draftResult.data.updated_at).getTime() : 0;
      const publishedAt = publishedResult.data?.published_at ? new Date(publishedResult.data.published_at).getTime() : 0;
      const hasNewerDraft = Boolean(draftResult.data?.document) && (!publishedResult.data?.document || draftUpdatedAt > publishedAt);
      const initialSource = hasNewerDraft ? draftResult.data?.document : publishedResult.data?.document ?? draftResult.data?.document;
      const initial = normalizeUniversalDocument(initialSource, page.key, page.route);
      setDocumentValue(initial);
      setUserId(user.id);
      setPublishedVersion(publishedResult.data?.version_number ?? null);
      setStatus("ready");
      void loadVersions();
      if (!draftResult.data) await supabase.from("site_editor_drafts").upsert({ page_key: page.key, document: initial, updated_by: user.id, updated_at: new Date().toISOString() });
    }
    void init();
    return () => { active = false; };
  }, [loadVersions, page, router]);

  const saveDraft = useCallback(async (notify = true) => {
    if (!page || !userId) return false;
    setSaving(true);
    const { error } = await supabase.from("site_editor_drafts").upsert({ page_key: page.key, document: documentValue, updated_by: userId, updated_at: new Date().toISOString() });
    setSaving(false);
    if (error) { setMessage(`No se pudo guardar: ${error.message}`); return false; }
    setDirty(false);
    if (notify) setMessage("Borrador guardado. Todavía no está publicado.");
    return true;
  }, [documentValue, page, userId]);

  useEffect(() => {
    if (!dirty || status !== "ready" || !userId) return;
    const timer = window.setTimeout(() => void saveDraft(false), 1400);
    return () => window.clearTimeout(timer);
  }, [dirty, saveDraft, status, userId]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === "APA_EDITOR_READY") {
        setIframeReady(true);
        iframeRef.current?.contentWindow?.postMessage({ type: "APA_EDITOR_APPLY", document: documentValue, breakpoint: viewport }, window.location.origin);
      }
      if (event.data?.type === "APA_EDITOR_SELECT") {
        const individualSelector = String(event.data.selector || "");
        const reusableSelector = String(event.data.reusableSelector || "");
        const existingTemplate = reusableSelector ? documentValue.rules[reusableSelector] : undefined;
        const selector = existingTemplate?.scope === "component" ? reusableSelector : individualSelector;
        const next: SelectedNode = {
          selector,
          reusableSelector,
          componentName: String(event.data.componentName || ""),
          componentPart: String(event.data.componentPart || ""),
          componentCandidates: Array.isArray(event.data.componentCandidates)
            ? event.data.componentCandidates.map((candidate: Record<string, unknown>) => ({
                selector: String(candidate.selector || ""),
                reusableSelector: String(candidate.reusableSelector || ""),
                componentPart: String(candidate.componentPart || ""),
                tagName: String(candidate.tagName || "elemento"),
                label: String(candidate.label || "Elemento"),
              })).filter((candidate: ComponentCandidate) => candidate.selector && candidate.reusableSelector)
            : [],
          tagName: String(event.data.tagName || "elemento"),
          label: existingTemplate?.scope === "component"
            ? `Plantilla · ${String(event.data.componentPart || event.data.componentName || "componente")}`
            : String(event.data.label || "Elemento"),
          text: String(event.data.text || ""),
          href: String(event.data.href || ""),
          src: String(event.data.src || ""),
        };
        setSelected(next);
        setTab("style");
        setDocumentValue((current) => {
          if (current.rules[next.selector]) return current;
          const copy = structuredClone(current);
          copy.rules[next.selector] = { selector: next.selector, label: next.label || next.tagName, tagName: next.tagName, styles: { desktop: emptyStyle(), tablet: {}, mobile: {} } };
          return copy;
        });
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [documentValue, viewport]);

  useEffect(() => {
    if (!iframeReady) return;
    iframeRef.current?.contentWindow?.postMessage({ type: "APA_EDITOR_APPLY", document: documentValue, breakpoint: viewport }, window.location.origin);
  }, [documentValue, iframeReady, viewport]);

  function commit(mutator: (draft: UniversalEditorDocument) => void) {
    setDocumentValue((current) => {
      const next = structuredClone(current);
      mutator(next);
      setHistory((items) => [...items.slice(-79), current]);
      setFuture([]);
      setDirty(true);
      return next;
    });
  }

  const undo = useCallback(() => {
    setHistory((items) => {
      const previous = items.at(-1);
      if (!previous) return items;
      setDocumentValue((current) => { setFuture((f) => [current, ...f.slice(0, 78)]); return previous; });
      setDirty(true);
      return items.slice(0, -1);
    });
  }, []);

  const redo = useCallback(() => {
    setFuture((items) => {
      const next = items[0];
      if (!next) return items;
      setDocumentValue((current) => { setHistory((h) => [...h.slice(-79), current]); return next; });
      setDirty(true);
      return items.slice(1);
    });
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const modifier = event.ctrlKey || event.metaKey;
      if (modifier && event.key.toLowerCase() === "s") { event.preventDefault(); void saveDraft(); }
      if (modifier && !event.shiftKey && event.key.toLowerCase() === "z") { event.preventDefault(); undo(); }
      if (modifier && (event.key.toLowerCase() === "y" || (event.shiftKey && event.key.toLowerCase() === "z"))) { event.preventDefault(); redo(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [redo, saveDraft, undo]);

  async function publish() {
    if (!page) return;
    const saved = await saveDraft(false);
    if (!saved) return;
    setSaving(true);
    const { data, error } = await supabase.rpc("publish_site_page", { p_page_key: page.key });
    if (error) {
      setSaving(false);
      return setMessage(`No se pudo publicar: ${error.message}`);
    }

    const expectedVersion = Number(data);
    const [{ data: publishedCheck, error: publishedCheckError }, { data: versionCheck, error: versionCheckError }] = await Promise.all([
      supabase.from("site_public_pages").select("version_number,published_at").eq("page_key", page.key).maybeSingle(),
      supabase.from("site_editor_versions").select("version_number").eq("page_key", page.key).eq("version_number", expectedVersion).maybeSingle(),
    ]);

    setSaving(false);

    if (
      !Number.isFinite(expectedVersion) ||
      expectedVersion <= 0 ||
      publishedCheckError ||
      versionCheckError ||
      !publishedCheck ||
      Number(publishedCheck.version_number) !== expectedVersion ||
      !versionCheck
    ) {
      console.error("[APA editor] La publicación no pudo verificarse", {
        pageKey: page.key,
        expectedVersion,
        publishedCheck,
        publishedCheckError,
        versionCheck,
        versionCheckError,
      });
      return setMessage("La publicación no pudo verificarse en la base. No se marcó como publicada.");
    }

    setPublishedVersion(expectedVersion);
    setMessage(`Publicado y verificado · versión ${expectedVersion}`);
    await loadVersions();
  }

  function updateRule(mutator: (rule: UniversalElementRule) => void) {
    if (!selected) return;
    commit((draft) => {
      let rule = draft.rules[selected.selector];
      if (!rule) {
        rule = { selector: selected.selector, label: selected.label, tagName: selected.tagName, styles: { desktop: emptyStyle(), tablet: {}, mobile: {} } };
        draft.rules[selected.selector] = rule;
      }
      mutator(rule);
    });
  }

  function updateStyle(property: keyof UniversalElementStyle, value: string | number | undefined) {
    updateRule((rule) => { rule.styles[viewport] = { ...rule.styles[viewport], [property]: value }; });
  }

  function promoteSelectedToComponent() {
    if (!selected?.reusableSelector) return;
    const reusableSelector = selected.reusableSelector;
    const componentName = selected.componentName || "componente";
    const componentPart = selected.componentPart || "";
    const templateLabel = `Plantilla · ${componentPart || componentName}`;

    commit((draft) => {
      const source = draft.rules[selected.selector];
      const existing = draft.rules[reusableSelector];
      draft.rules[reusableSelector] = {
        selector: reusableSelector,
        label: templateLabel,
        tagName: selected.tagName,
        scope: "component",
        componentName,
        styles: structuredClone(source?.styles ?? existing?.styles ?? { desktop: emptyStyle(), tablet: {}, mobile: {} }),
      };
      if (selected.selector !== reusableSelector) delete draft.rules[selected.selector];
    });

    setSelected((current) => current ? { ...current, selector: reusableSelector, label: templateLabel } : current);
    setMessage("Plantilla reutilizable creada. Los elementos nuevos de este tipo heredarán este diseño.");
  }

  function promoteModifiedComponentChildren() {
    if (!selected?.componentName || !selected.componentCandidates?.length) {
      setMessage("No se encontraron partes internas reutilizables en este componente.");
      return;
    }

    const usedTemplates = new Set<string>();
    const candidatesToConvert = selected.componentCandidates.filter((candidate) => {
      if (usedTemplates.has(candidate.reusableSelector)) return false;
      usedTemplates.add(candidate.reusableSelector);

      const source = documentValue.rules[candidate.selector];
      const existingTemplate = documentValue.rules[candidate.reusableSelector];
      return Boolean(source && !source.removed && hasMeaningfulStyles(source) && existingTemplate?.scope !== "component");
    });

    if (!candidatesToConvert.length) {
      setMessage("No encontré overrides internos modificados para convertir en esta tarjeta.");
      return;
    }

    commit((draft) => {
      for (const candidate of candidatesToConvert) {
        const source = draft.rules[candidate.selector];
        if (!source) continue;

        draft.rules[candidate.reusableSelector] = {
          selector: candidate.reusableSelector,
          label: `Plantilla · ${candidate.componentPart || candidate.label || candidate.tagName}`,
          tagName: candidate.tagName,
          scope: "component",
          componentName: selected.componentName,
          styles: structuredClone(source.styles),
        };

        if (candidate.selector !== candidate.reusableSelector) delete draft.rules[candidate.selector];
      }
    });

    setMessage(`${candidatesToConvert.length} estilos internos modificados se convirtieron en plantillas reutilizables.`);
  }

  function restoreVersion(version: VersionRow) {
    if (!page) return;
    setHistory((items) => [...items.slice(-79), documentValue]);
    setFuture([]);
    setDocumentValue(normalizeUniversalDocument(version.document, page.key, page.route));
    setDirty(true);
    setMessage(`Versión ${version.version_number} restaurada como borrador.`);
  }

  function resetSelected() {
    if (!selected) return;
    commit((draft) => { delete draft.rules[selected.selector]; });
    setMessage("Override eliminado. El elemento vuelve a su diseño original.");
  }

  function removeSelected() {
    if (!selected) return;
    updateRule((rule) => { rule.removed = true; });
    setMessage("Elemento eliminado y enviado a la papelera. Publicá para aplicarlo.");
  }

  function restoreRemoved(selector: string) {
    commit((draft) => { if (draft.rules[selector]) draft.rules[selector].removed = false; });
    setMessage("Elemento restaurado.");
  }

  const rule = selected ? documentValue.rules[selected.selector] : null;
  const style = rule?.styles[viewport] || {};
  const removedRules = Object.values(documentValue.rules).filter((item) => item.removed);
  const canvasWidth = VIEWPORT_WIDTH[viewport];
  const canvasScale = zoom / 100;
  const frameSrc = page ? `${page.route}${page.route.includes("?") ? "&" : "?"}siteEditor=1` : "/";
  const currentLabel = useMemo(() => selected?.label || "Página", [selected]);

  if (!page) return <main className="flex min-h-screen items-center justify-center bg-[#071421] text-white">Página no registrada</main>;
  if (status === "loading") return <main className="flex min-h-screen items-center justify-center bg-[#071421] text-white">Abriendo {page.label}…</main>;
  if (status === "denied") return <main className="flex min-h-screen items-center justify-center bg-[#071421] text-white">Acceso no autorizado.</main>;

  return <main className="h-screen overflow-hidden bg-[#071421] text-white"><header className="flex h-16 items-center justify-between border-b border-white/10 bg-[#0b1b2b] px-3 pr-4"><div className="flex items-center gap-3"><Link href="/admin" className="rounded-lg border border-white/10 px-3 py-2 text-[10px] font-black uppercase text-white/60">← Admin</Link><div className="hidden xl:block"><p className="text-[9px] font-black uppercase tracking-[.18em] text-[#6dbef2]">APA Visual Editor</p><h1 className="text-sm font-black uppercase">{page.label}</h1></div><span className={`hidden rounded-full px-3 py-1 text-[9px] font-black uppercase 2xl:inline-flex ${dirty ? "bg-amber-400/10 text-amber-200" : "bg-emerald-400/10 text-emerald-200"}`}>{dirty ? "Cambios sin publicar" : "Borrador sincronizado"}</span></div><div className="flex items-center gap-2"><div className="hidden rounded-xl border border-white/10 bg-black/20 p-1 md:flex">{(["desktop","tablet","mobile"] as UniversalBreakpoint[]).map((item)=><button key={item} onClick={()=>setViewport(item)} className={`rounded-lg px-3 py-2 text-[9px] font-black uppercase ${viewport===item?"bg-white text-[#102f55]":"text-white/45"}`}>{item}</button>)}</div><button onClick={undo} disabled={!history.length} className="rounded-lg border border-white/10 px-3 py-2 disabled:opacity-25">↶</button><button onClick={redo} disabled={!future.length} className="rounded-lg border border-white/10 px-3 py-2 disabled:opacity-25">↷</button><button onClick={()=>void saveDraft()} disabled={saving} className="rounded-xl border border-white/15 px-4 py-2 text-[9px] font-black uppercase">Guardar</button><button onClick={()=>void publish()} disabled={saving} className="rounded-xl bg-[#3ea6e8] px-4 py-2 text-[9px] font-black uppercase text-[#071522]">Publicar</button></div></header><div className="grid h-[calc(100vh-64px)] grid-cols-[230px_minmax(0,1fr)_340px]"><aside className="overflow-y-auto border-r border-white/10 bg-[#0b1b2b] p-3"><Panel title="Página real"><p className="break-all text-xs font-bold">{page.route}</p><p className="mt-2 text-[10px] leading-5 text-white/40">Hacé clic sobre cualquier elemento del canvas.</p></Panel><Panel title={`Overrides / plantillas (${Object.keys(documentValue.rules).length})`}>{Object.values(documentValue.rules).filter((x)=>!x.removed).map((item)=><button key={item.selector} onClick={()=>setSelected({selector:item.selector,reusableSelector:item.scope==="component"?item.selector:"",componentName:item.componentName||"",componentPart:"",tagName:item.tagName,label:item.label,text:item.text||"",href:item.href||"",src:item.src||""})} className={`block w-full truncate rounded-lg px-2 py-2 text-left text-[10px] ${selected?.selector===item.selector?"bg-[#3ea6e8]/20 text-[#9bddff]":"text-white/45"}`}>{item.label||item.tagName}</button>)}</Panel>{removedRules.length?<Panel title={`Eliminados (${removedRules.length})`}>{removedRules.map((item)=><div key={item.selector} className="flex items-center gap-2 rounded-lg bg-red-400/[.05] px-2 py-2"><span className="min-w-0 flex-1 truncate text-[10px] text-white/40">{item.label||item.tagName}</span><button onClick={()=>restoreRemoved(item.selector)} className="text-[9px] font-black uppercase text-[#6dbef2]">Restaurar</button></div>)}</Panel>:null}</aside><section className="relative overflow-auto bg-[#101c27]"><div className="sticky top-0 z-30 flex h-11 items-center justify-between border-b border-white/5 bg-[#101c27]/95 px-4"><p className="text-[9px] font-black uppercase tracking-[.16em] text-white/35">Canvas real · {canvasWidth}px</p><div className="flex items-center gap-2 text-[9px]"><button onClick={()=>setZoom((z)=>Math.max(35,z-5))}>−</button><span>{zoom}%</span><button onClick={()=>setZoom((z)=>Math.min(100,z+5))}>+</button></div></div><div className="flex min-h-full justify-center p-7"><div style={{width:canvasWidth*canvasScale,minWidth:canvasWidth*canvasScale}}><iframe ref={iframeRef} key={frameSrc} src={frameSrc} title={`Editor ${page.label}`} onLoad={()=>setIframeReady(true)} className="origin-top-left rounded-2xl bg-white shadow-2xl" style={{width:canvasWidth,height:Math.max(900,window.innerHeight/canvasScale),transform:`scale(${canvasScale})`}}/></div></div></section><aside className="overflow-y-auto border-l border-white/10 bg-[#0b1b2b]"><div className="sticky top-0 z-20 border-b border-white/10 bg-[#0b1b2b] px-4 pt-4"><p className="text-[9px] font-black uppercase tracking-[.18em] text-[#6dbef2]">Inspector</p><h2 className="mt-1 truncate text-base font-black">{currentLabel}</h2><div className="mt-3 flex overflow-x-auto">{(["content","style","layout","advanced","history"] as InspectorTab[]).map((item)=><button key={item} onClick={()=>setTab(item)} className={`border-b-2 px-2.5 py-2 text-[8px] font-black uppercase ${tab===item?"border-[#3ea6e8] text-white":"border-transparent text-white/30"}`}>{item}</button>)}</div></div><div className="space-y-4 p-4">{message?<div className="rounded-xl border border-[#3ea6e8]/20 bg-[#3ea6e8]/10 px-3 py-2 text-[10px] text-[#a9dcfb]">{message}</div>:null}{selected&&tab==="content"?(rule?.scope==="component"?<Panel title="Plantilla reutilizable"><p className="text-[10px] leading-5 text-white/45">Esta plantilla modifica solo el diseño. El contenido sigue siendo dinámico para que cada fecha, partido o temporada conserve sus propios datos.</p></Panel>:<Panel title="Contenido"><TextArea label="Texto" value={rule?.text??selected.text} onChange={(v)=>updateRule((r)=>{r.text=v})}/><TextInput label="Enlace" value={rule?.href??selected.href} onChange={(v)=>updateRule((r)=>{r.href=v})}/><TextInput label="Imagen / src" value={rule?.src??selected.src} onChange={(v)=>updateRule((r)=>{r.src=v})}/></Panel>):null}{selected&&tab==="style"?<>{selected.reusableSelector&&rule?.scope!=="component"?<Panel title="Componente reutilizable"><p className="text-[10px] leading-5 text-white/45">Este elemento pertenece a <b>{selected.componentName}</b>. Podés usar el diseño actual como base para todos los elementos iguales, incluso los que aparezcan en temporadas futuras.</p><button onClick={promoteSelectedToComponent} className="w-full rounded-lg bg-[#3ea6e8] px-3 py-2 text-[9px] font-black uppercase text-[#071522]">Usar como plantilla</button></Panel>:rule?.scope==="component"?<Panel title="Plantilla activa"><p className="text-[10px] leading-5 text-emerald-200/70">Este estilo se aplica automáticamente a todos los elementos de este tipo, actuales y futuros.</p>{selected.componentCandidates?.length?<><button onClick={promoteModifiedComponentChildren} className="w-full rounded-lg border border-[#3ea6e8]/30 bg-[#3ea6e8]/10 px-3 py-2 text-[9px] font-black uppercase text-[#9bddff]">Convertir estilos internos modificados</button><p className="text-[9px] leading-4 text-white/35">Toma los cambios que ya hiciste dentro de esta tarjeta y los vuelve plantillas para fechas y temporadas futuras.</p></>:null}</Panel>:null}<Panel title={`Visual · ${viewport}`}><TextInput label="Color de texto" value={style.color||""} onChange={(v)=>updateStyle("color",v||undefined)}/><TextInput label="Fondo" value={style.background||""} onChange={(v)=>updateStyle("background",v||undefined)}/><Range label="Opacidad" value={style.opacity??1} min={0} max={1} step={.05} onChange={(v)=>updateStyle("opacity",v)}/><Range label="Borde" value={style.borderWidth??0} min={0} max={12} onChange={(v)=>updateStyle("borderWidth",v)}/><TextInput label="Color borde" value={style.borderColor||""} onChange={(v)=>updateStyle("borderColor",v||undefined)}/><Select label="Sombra" value={style.shadow||""} options={SHADOWS} onChange={(v)=>updateStyle("shadow",v||undefined)}/></Panel><Panel title="Tipografía"><Range label="Tamaño px" value={style.fontSize??16} min={7} max={160} onChange={(v)=>updateStyle("fontSize",v)}/><Range label="Peso" value={style.fontWeight??400} min={100} max={900} step={100} onChange={(v)=>updateStyle("fontWeight",v)}/><Range label="Interlineado" value={style.lineHeight??1.2} min={.7} max={3} step={.05} onChange={(v)=>updateStyle("lineHeight",v)}/></Panel></>:null}{selected&&tab==="layout"?<Panel title={`Layout · ${viewport}`}><Range label="Ancho %" value={style.width??100} min={1} max={100} onChange={(v)=>updateStyle("width",v)}/><Range label="Máximo px" value={style.maxWidth??1600} min={40} max={2600} onChange={(v)=>updateStyle("maxWidth",v)}/><Range label="Altura mínima" value={style.minHeight??0} min={0} max={1200} onChange={(v)=>updateStyle("minHeight",v)}/><Range label="Padding X" value={style.paddingX??0} min={0} max={220} onChange={(v)=>updateStyle("paddingX",v)}/><Range label="Padding Y" value={style.paddingY??0} min={0} max={220} onChange={(v)=>updateStyle("paddingY",v)}/><Range label="Margen arriba" value={style.marginTop??0} min={-240} max={400} onChange={(v)=>updateStyle("marginTop",v)}/><Range label="Margen abajo" value={style.marginBottom??0} min={-240} max={400} onChange={(v)=>updateStyle("marginBottom",v)}/><Range label="Radio" value={style.radius??0} min={0} max={160} onChange={(v)=>updateStyle("radius",v)}/></Panel>:null}{selected&&tab==="advanced"?<><Panel title={`Transformación · ${viewport}`}><Range label="Mover X" value={style.translateX??0} min={-600} max={600} onChange={(v)=>updateStyle("translateX",v)}/><Range label="Mover Y" value={style.translateY??0} min={-600} max={600} onChange={(v)=>updateStyle("translateY",v)}/><Range label="Escala" value={style.scale??1} min={.2} max={3} step={.05} onChange={(v)=>updateStyle("scale",v)}/><Range label="Rotación" value={style.rotate??0} min={-180} max={180} onChange={(v)=>updateStyle("rotate",v)}/></Panel><Panel title="Elemento"><div className="grid grid-cols-2 gap-2"><MiniButton onClick={()=>updateStyle("display",style.display==="none"?undefined:"none")}>{style.display==="none"?"Mostrar":"Ocultar"}</MiniButton><MiniButton onClick={resetSelected}>Reset override</MiniButton></div><button onClick={removeSelected} className="mt-3 w-full rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2 text-[9px] font-black uppercase text-red-200">Eliminar elemento</button><p className="mt-2 text-[9px] leading-4 text-white/35">Ocultar conserva el nodo. Eliminar lo mueve a la papelera y lo vacía del DOM publicado.</p></Panel></>:null}{tab==="history"?<Panel title="Versiones publicadas">{versions.map((version)=><button key={version.id} onClick={()=>restoreVersion(version)} className="block w-full rounded py-2 text-left text-[10px]">Versión {version.version_number}</button>)}</Panel>:null}<div className="border-t border-white/10 pt-3 text-[9px] text-white/30">Versión pública: {publishedVersion??"—"} · {saving?"Guardando…":"Autosave activo"}</div></div></aside></div></main>;
}

function Panel({title,children}:{title:string;children:ReactNode}){return <section className="rounded-2xl border border-white/10 bg-white/[.025] p-3"><p className="mb-3 text-[9px] font-black uppercase tracking-[.16em] text-white/35">{title}</p><div className="space-y-3">{children}</div></section>}
function TextInput({label,value,onChange}:{label:string;value:string;onChange:(v:string)=>void}){return <label className="block"><span className="mb-1 block text-[9px] font-bold text-white/45">{label}</span><input value={value} onChange={(e)=>onChange(e.target.value)} className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-[10px] text-white"/></label>}
function TextArea({label,value,onChange}:{label:string;value:string;onChange:(v:string)=>void}){return <label className="block"><span className="mb-1 block text-[9px] font-bold text-white/45">{label}</span><textarea value={value} rows={4} onChange={(e)=>onChange(e.target.value)} className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-[10px] text-white"/></label>}
function Range({label,value,min,max,step=1,onChange}:{label:string;value:number;min:number;max:number;step?:number;onChange:(v:number)=>void}){return <label className="block"><span className="mb-1 flex justify-between text-[9px] font-bold text-white/45"><span>{label}</span><span>{value}</span></span><input type="range" value={value} min={min} max={max} step={step} onChange={(e)=>onChange(Number(e.target.value))} className="w-full"/></label>}
function Select({label,value,options,onChange}:{label:string;value:string;options:string[][];onChange:(v:string)=>void}){return <label className="block"><span className="mb-1 block text-[9px] text-white/45">{label}</span><select value={value} onChange={(e)=>onChange(e.target.value)} className="w-full rounded-lg border border-white/10 bg-[#102131] px-3 py-2 text-[10px]">{options.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>}
function MiniButton({children,onClick}:{children:ReactNode;onClick:()=>void}){return <button onClick={onClick} className="rounded-lg border border-white/10 bg-white/[.03] px-2 py-2 text-[9px] font-black uppercase text-white/55">{children}</button>}
