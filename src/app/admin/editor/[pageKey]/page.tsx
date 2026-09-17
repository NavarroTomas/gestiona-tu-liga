"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
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

type SelectedNode = { selector: string; tagName: string; label: string; text: string; href: string; src: string };
type VersionRow = { id: string; version_number: number; document: unknown; created_at: string };
type InspectorTab = "content" | "style" | "layout" | "advanced" | "history";

const VIEWPORT_WIDTH: Record<UniversalBreakpoint, number> = { desktop: 1440, tablet: 900, mobile: 390 };
const SHADOWS = [["", "Sin sombra"], ["0 8px 24px rgba(0,0,0,.10)", "Suave"], ["0 18px 50px rgba(11,39,71,.18)", "Editorial"], ["0 24px 70px rgba(0,0,0,.30)", "Profunda"]];

function emptyStyle(): UniversalElementStyle { return { opacity: 1, scale: 1, rotate: 0, translateX: 0, translateY: 0 }; }

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
      const { data: auth } = await supabase.auth.getUser(); const user = auth.user;
      if (!user || !active) return setStatus("denied");
      const { data: owner } = await supabase.from("site_editor_owners").select("user_id").eq("user_id", user.id).maybeSingle();
      if (!owner || !active) return setStatus("denied");
      const [draftResult, publishedResult] = await Promise.all([
        supabase.from("site_editor_drafts").select("document,updated_at").eq("page_key", page.key).maybeSingle(),
        supabase.from("site_public_pages").select("document,version_number").eq("page_key", page.key).maybeSingle(),
      ]);
      if (!active) return;
      const initial = normalizeUniversalDocument(draftResult.data?.document ?? publishedResult.data?.document, page.key, page.route);
      setDocumentValue(initial); setUserId(user.id); setPublishedVersion(publishedResult.data?.version_number ?? null); setStatus("ready"); void loadVersions();
      if (!draftResult.data) await supabase.from("site_editor_drafts").upsert({ page_key: page.key, document: initial, updated_by: user.id, updated_at: new Date().toISOString() });
    }
    void init(); return () => { active = false; };
  }, [loadVersions, page, router]);

  const saveDraft = useCallback(async (notify = true) => {
    if (!page || !userId) return false;
    setSaving(true); const { error } = await supabase.from("site_editor_drafts").upsert({ page_key: page.key, document: documentValue, updated_by: userId, updated_at: new Date().toISOString() }); setSaving(false);
    if (error) { setMessage(`No se pudo guardar: ${error.message}`); return false; }
    setDirty(false); if (notify) setMessage("Borrador guardado. Todavía no está publicado."); return true;
  }, [documentValue, page, userId]);

  useEffect(() => { if (!dirty || status !== "ready" || !userId) return; const timer = window.setTimeout(() => void saveDraft(false), 1400); return () => window.clearTimeout(timer); }, [dirty, saveDraft, status, userId]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === "APA_EDITOR_READY") { setIframeReady(true); iframeRef.current?.contentWindow?.postMessage({ type: "APA_EDITOR_APPLY", document: documentValue, breakpoint: viewport }, window.location.origin); }
      if (event.data?.type === "APA_EDITOR_SELECT") {
        const next: SelectedNode = { selector: String(event.data.selector || ""), tagName: String(event.data.tagName || "elemento"), label: String(event.data.label || "Elemento"), text: String(event.data.text || ""), href: String(event.data.href || ""), src: String(event.data.src || "") };
        setSelected(next); setTab("style");
        setDocumentValue((current) => {
          if (current.rules[next.selector]) return current;
          const copy = structuredClone(current); copy.rules[next.selector] = { selector: next.selector, label: next.label || next.tagName, tagName: next.tagName, styles: { desktop: emptyStyle(), tablet: {}, mobile: {} } }; return copy;
        });
      }
    };
    window.addEventListener("message", onMessage); return () => window.removeEventListener("message", onMessage);
  }, [documentValue, viewport]);

  useEffect(() => { if (!iframeReady) return; iframeRef.current?.contentWindow?.postMessage({ type: "APA_EDITOR_APPLY", document: documentValue, breakpoint: viewport }, window.location.origin); }, [documentValue, iframeReady, viewport]);

  function commit(mutator: (draft: UniversalEditorDocument) => void) { setDocumentValue((current) => { const next = structuredClone(current); mutator(next); setHistory((items) => [...items.slice(-79), current]); setFuture([]); setDirty(true); return next; }); }
  function undo() { setHistory((items) => { const previous = items.at(-1); if (!previous) return items; setDocumentValue((current) => { setFuture((f) => [current, ...f.slice(0, 78)]); return previous; }); setDirty(true); return items.slice(0, -1); }); }
  function redo() { setFuture((items) => { const next = items[0]; if (!next) return items; setDocumentValue((current) => { setHistory((h) => [...h.slice(-79), current]); return next; }); setDirty(true); return items.slice(1); }); }

  useEffect(() => { const onKey = (event: KeyboardEvent) => { const modifier = event.ctrlKey || event.metaKey; if (modifier && event.key.toLowerCase() === "s") { event.preventDefault(); void saveDraft(); } if (modifier && !event.shiftKey && event.key.toLowerCase() === "z") { event.preventDefault(); undo(); } if (modifier && (event.key.toLowerCase() === "y" || (event.shiftKey && event.key.toLowerCase() === "z"))) { event.preventDefault(); redo(); } }; window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey); });

  async function publish() { if (!page) return; const saved = await saveDraft(false); if (!saved) return; setSaving(true); const { data, error } = await supabase.rpc("publish_site_page", { p_page_key: page.key }); setSaving(false); if (error) { setMessage(`No se pudo publicar: ${error.message}`); return; } setPublishedVersion(Number(data)); setMessage(`Publicado correctamente · versión ${Number(data)}`); await loadVersions(); }
  function updateRule(mutator: (rule: UniversalElementRule) => void) { if (!selected) return; commit((draft) => { let rule = draft.rules[selected.selector]; if (!rule) { rule = { selector: selected.selector, label: selected.label, tagName: selected.tagName, styles: { desktop: emptyStyle(), tablet: {}, mobile: {} } }; draft.rules[selected.selector] = rule; } mutator(rule); }); }
  function updateStyle(property: keyof UniversalElementStyle, value: string | number | undefined) { updateRule((rule) => { rule.styles[viewport] = { ...rule.styles[viewport], [property]: value }; }); }
  function restoreVersion(version: VersionRow) { if (!page) return; setHistory((items) => [...items.slice(-79), documentValue]); setFuture([]); setDocumentValue(normalizeUniversalDocument(version.document, page.key, page.route)); setDirty(true); setMessage(`Versión ${version.version_number} restaurada como borrador.`); }
  function resetSelected() { if (!selected) return; commit((draft) => { delete draft.rules[selected.selector]; }); setMessage("Override eliminado. El elemento vuelve a su diseño original."); }
  function removeSelected() { if (!selected) return; updateRule((rule) => { rule.removed = true; }); setMessage("Elemento eliminado de la página publicada. Podés restaurarlo desde la lista de eliminados o con Ctrl+Z."); }
  function restoreRemoved(selector: string) { commit((draft) => { const rule = draft.rules[selector]; if (rule) rule.removed = false; }); setMessage("Elemento restaurado."); }

  const rule = selected ? documentValue.rules[selected.selector] : null;
  const style = rule?.styles[viewport] || {};
  const removedRules = Object.values(documentValue.rules).filter((item) => item.removed);
  const canvasWidth = VIEWPORT_WIDTH[viewport], canvasScale = zoom / 100;
  const frameSrc = page ? `${page.route}${page.route.includes("?") ? "&" : "?"}siteEditor=1` : "/";

  if (!page) return <main className="flex min-h-screen items-center justify-center bg-[#071421] text-white"><Link href="/admin/editor">Página no registrada · volver</Link></main>;
  if (status === "loading") return <main className="flex min-h-screen items-center justify-center bg-[#071421] text-white">Abriendo {page.label}…</main>;
  if (status === "denied") return <main className="flex min-h-screen items-center justify-center bg-[#071421] text-white">Acceso no autorizado.</main>;

  return <main className="h-screen overflow-hidden bg-[#071421] text-white">
    <header className="flex h-16 items-center justify-between border-b border-white/10 bg-[#0b1b2b] px-3 pr-4"><div className="flex items-center gap-3"><Link href="/admin" className="rounded-lg border border-white/10 px-3 py-2 text-[10px] font-black uppercase text-white/60">← Admin</Link><div className="hidden xl:block"><p className="text-[9px] font-black uppercase tracking-[.18em] text-[#6dbef2]">APA Visual Editor</p><h1 className="text-sm font-black uppercase">{page.label}</h1></div></div><div className="flex items-center gap-2"><div className="hidden rounded-xl border border-white/10 bg-black/20 p-1 md:flex">{(["desktop", "tablet", "mobile"] as UniversalBreakpoint[]).map((item) => <button key={item} onClick={() => setViewport(item)} className={`rounded-lg px-3 py-2 text-[9px] font-black uppercase ${viewport === item ? "bg-white text-[#102f55]" : "text-white/45"}`}>{item}</button>)}</div><button onClick={undo} disabled={!history.length}>↶</button><button onClick={redo} disabled={!future.length}>↷</button><button onClick={() => void saveDraft()} disabled={saving} className="rounded-xl border border-white/15 px-4 py-2 text-[9px] font-black uppercase">Guardar</button><button onClick={() => void publish()} disabled={saving} className="rounded-xl bg-[#3ea6e8] px-4 py-2 text-[9px] font-black uppercase text-[#071522]">Publicar</button></div></header>
    <div className="grid h-[calc(100vh-64px)] grid-cols-[230px_minmax(0,1fr)_340px]">
      <aside className="overflow-y-auto border-r border-white/10 bg-[#0b1b2b] p-3"><div className="rounded-2xl border border-white/10 bg-white/[.03] p-3"><p className="text-[9px] font-black uppercase tracking-[.16em] text-[#6dbef2]">Página real</p><p className="mt-1 break-all text-xs font-bold">{page.route}</p></div><div className="mt-3 rounded-2xl border border-white/10 bg-white/[.03] p-3"><p className="text-[9px] font-black uppercase tracking-[.16em] text-white/35">Overrides</p><div className="mt-2 space-y-1.5">{Object.values(documentValue.rules).filter((item) => !item.removed).map((item) => <button key={item.selector} onClick={() => setSelected({ selector: item.selector, tagName: item.tagName, label: item.label, text: item.text || "", href: item.href || "", src: item.src || "" })} className="w-full truncate rounded-lg bg-white/[.025] px-2 py-2 text-left text-[10px] text-white/45">{item.label || item.tagName}</button>)}</div></div>{removedRules.length ? <div className="mt-3 rounded-2xl border border-red-400/15 bg-red-400/[.04] p-3"><p className="text-[9px] font-black uppercase tracking-[.16em] text-red-200/70">Eliminados ({removedRules.length})</p><div className="mt-2 space-y-1.5">{removedRules.map((item) => <div key={item.selector} className="flex items-center gap-2 rounded-lg bg-black/20 px-2 py-2"><span className="min-w-0 flex-1 truncate text-[10px] text-white/40">{item.label || item.tagName}</span><button onClick={() => restoreRemoved(item.selector)} className="text-[9px] font-black uppercase text-[#6dbef2]">Restaurar</button></div>)}</div></div> : null}</aside>
      <section className="relative overflow-auto bg-[#101c27]"><div className="sticky top-0 z-30 flex h-11 items-center justify-between border-b border-white/5 bg-[#101c27]/95 px-4"><p className="text-[9px] font-black uppercase tracking-[.16em] text-white/35">Canvas real · {canvasWidth}px</p><div className="flex items-center gap-2"><button onClick={() => setZoom((z) => Math.max(35, z - 5))}>−</button><span className="text-[9px]">{zoom}%</span><button onClick={() => setZoom((z) => Math.min(100, z + 5))}>+</button></div></div><div className="flex min-h-full justify-center p-7"><div style={{ width: canvasWidth * canvasScale, minWidth: canvasWidth * canvasScale }}><iframe ref={iframeRef} key={frameSrc} src={frameSrc} title={`Editor ${page.label}`} onLoad={() => setIframeReady(true)} className="origin-top-left rounded-2xl bg-white shadow-2xl" style={{ width: canvasWidth, height: Math.max(900, window.innerHeight / canvasScale), transform: `scale(${canvasScale})` }} /></div></div></section>
      <aside className="overflow-y-auto border-l border-white/10 bg-[#0b1b2b] p-4"><h2 className="text-base font-black">{selected?.label || "Página"}</h2><div className="mt-3 flex gap-2">{(["content", "style", "layout", "advanced", "history"] as InspectorTab[]).map((item) => <button key={item} onClick={() => setTab(item)} className={`text-[8px] font-black uppercase ${tab === item ? "text-white" : "text-white/30"}`}>{item}</button>)}</div>{message ? <div className="mt-4 rounded-xl bg-[#3ea6e8]/10 p-3 text-[10px] text-[#a9dcfb]">{message}</div> : null}
      <div className="mt-4 space-y-4">{selected && tab === "content" ? <Panel title="Contenido"><TextArea label="Texto" value={rule?.text ?? selected.text} onChange={(value) => updateRule((r) => { r.text = value; })} /><TextInput label="Enlace" value={rule?.href ?? selected.href} onChange={(value) => updateRule((r) => { r.href = value; })} /><TextInput label="Imagen / src" value={rule?.src ?? selected.src} onChange={(value) => updateRule((r) => { r.src = value; })} /></Panel> : null}
      {selected && tab === "style" ? <Panel title={`Visual · ${viewport}`}><TextInput label="Color" value={style.color || ""} onChange={(v) => updateStyle("color", v || undefined)} /><TextInput label="Fondo" value={style.background || ""} onChange={(v) => updateStyle("background", v || undefined)} /><Range label="Opacidad" value={style.opacity ?? 1} min={0} max={1} step={.05} onChange={(v) => updateStyle("opacity", v)} /><Range label="Tamaño fuente" value={style.fontSize ?? 16} min={7} max={160} onChange={(v) => updateStyle("fontSize", v)} /></Panel> : null}
      {selected && tab === "layout" ? <Panel title={`Layout · ${viewport}`}><Range label="Ancho %" value={style.width ?? 100} min={1} max={100} onChange={(v) => updateStyle("width", v)} /><Range label="Padding X" value={style.paddingX ?? 0} min={0} max={220} onChange={(v) => updateStyle("paddingX", v)} /><Range label="Padding Y" value={style.paddingY ?? 0} min={0} max={220} onChange={(v) => updateStyle("paddingY", v)} /><Range label="Margen arriba" value={style.marginTop ?? 0} min={-240} max={400} onChange={(v) => updateStyle("marginTop", v)} /></Panel> : null}
      {selected && tab === "advanced" ? <><Panel title={`Transformación · ${viewport}`}><Range label="Mover X" value={style.translateX ?? 0} min={-600} max={600} onChange={(v) => updateStyle("translateX", v)} /><Range label="Mover Y" value={style.translateY ?? 0} min={-600} max={600} onChange={(v) => updateStyle("translateY", v)} /><Range label="Escala" value={style.scale ?? 1} min={.2} max={3} step={.05} onChange={(v) => updateStyle("scale", v)} /></Panel><Panel title="Elemento"><div className="grid grid-cols-2 gap-2"><MiniButton onClick={() => updateStyle("display", style.display === "none" ? undefined : "none")}>{style.display === "none" ? "Mostrar" : "Ocultar"}</MiniButton><MiniButton onClick={resetSelected}>Reset override</MiniButton></div><button onClick={removeSelected} className="mt-3 w-full rounded-lg border border-red-400/25 bg-red-400/10 px-3 py-2 text-[9px] font-black uppercase text-red-200">Eliminar elemento</button><p className="mt-2 text-[9px] leading-4 text-white/30">Eliminar lo saca de la versión publicada y lo mueve a la papelera. Ocultar sólo lo deja temporalmente invisible.</p></Panel></> : null}
      {tab === "history" ? <Panel title="Versiones">{versions.map((version) => <button key={version.id} onClick={() => restoreVersion(version)} className="block w-full py-2 text-left text-[10px]">Versión {version.version_number}</button>)}</Panel> : null}<div className="text-[9px] text-white/30">Versión pública: {publishedVersion ?? "—"}</div></div></aside>
    </div>
  </main>;
}

function Panel({ title, children }: { title: string; children: ReactNode }) { return <section className="rounded-2xl border border-white/10 bg-white/[.025] p-3"><p className="mb-3 text-[9px] font-black uppercase tracking-[.16em] text-white/35">{title}</p><div className="space-y-3">{children}</div></section>; }
function TextInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <label className="block"><span className="mb-1 block text-[9px] text-white/45">{label}</span><input value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-[10px]" /></label>; }
function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <label className="block"><span className="mb-1 block text-[9px] text-white/45">{label}</span><textarea value={value} rows={4} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-[10px]" /></label>; }
function Range({ label, value, min, max, step = 1, onChange }: { label: string; value: number; min: number; max: number; step?: number; onChange: (value: number) => void }) { return <label className="block"><span className="mb-1 flex justify-between text-[9px] text-white/45"><span>{label}</span><span>{value}</span></span><input type="range" value={value} min={min} max={max} step={step} onChange={(e) => onChange(Number(e.target.value))} className="w-full" /></label>; }
function MiniButton({ children, onClick }: { children: ReactNode; onClick: () => void }) { return <button type="button" onClick={onClick} className="rounded-lg border border-white/10 bg-white/[.03] px-2 py-2 text-[9px] font-black uppercase text-white/55">{children}</button>; }
