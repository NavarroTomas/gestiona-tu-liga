"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import HomeLeaguePortal from "@/components/home/HomeLeaguePortal";
import { supabase } from "@/lib/supabase";
import {
  DEFAULT_HOME_EDITOR_DOCUMENT,
  HOME_ELEMENT_LABELS,
  HOME_SECTION_ELEMENTS,
  normalizeHomeEditorDocument,
  setResponsiveValue,
  valueForBreakpoint,
  type EditorBreakpoint,
  type ElementStyle,
  type HomeEditorDocument,
  type HomeEditorElementId,
  type HomeSectionId,
  type SectionState,
} from "@/lib/siteEditor";

type InspectorTab = "content" | "style" | "layout" | "advanced" | "history";
type VersionRow = { id: string; version_number: number; document: unknown; created_at: string };

const SECTION_LABELS: Record<HomeSectionId, string> = {
  hero: "Hero", news: "Noticias + tabla", awards: "Premios", competitions: "Competiciones",
  match: "Partido destacado", stats: "Estadísticas", community: "Comunidad",
};
const VIEWPORT_WIDTH: Record<EditorBreakpoint, number> = { desktop: 1440, tablet: 900, mobile: 390 };
const FONT_OPTIONS = [["inherit", "Tema del sitio"], ["Arial, sans-serif", "Arial"], ["Inter, Arial, sans-serif", "Inter"], ["Georgia, serif", "Georgia"], ["'Arial Black', Arial, sans-serif", "Display pesada"]];
const SHADOW_OPTIONS = [["none", "Sin sombra"], ["0 8px 24px rgba(0,0,0,.10)", "Suave"], ["0 18px 50px rgba(11,39,71,.18)", "Editorial"], ["0 24px 70px rgba(0,0,0,.28)", "Profunda"]];

export default function SiteEditorPage() {
  const [document, setDocument] = useState<HomeEditorDocument>(() => structuredClone(DEFAULT_HOME_EDITOR_DOCUMENT));
  const [selectedSection, setSelectedSection] = useState<HomeSectionId>("hero");
  const [selectedElement, setSelectedElement] = useState<HomeEditorElementId | null>("hero.title");
  const [editingGlobal, setEditingGlobal] = useState(false);
  const [viewport, setViewport] = useState<EditorBreakpoint>("desktop");
  const [zoom, setZoom] = useState(78);
  const [tab, setTab] = useState<InspectorTab>("content");
  const [history, setHistory] = useState<HomeEditorDocument[]>([]);
  const [future, setFuture] = useState<HomeEditorDocument[]>([]);
  const [versions, setVersions] = useState<VersionRow[]>([]);
  const [clipboard, setClipboard] = useState<ElementStyle | null>(null);
  const [draggedSection, setDraggedSection] = useState<HomeSectionId | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "denied">("loading");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [publishedVersion, setPublishedVersion] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  const loadVersions = useCallback(async () => {
    const { data } = await supabase.from("site_editor_versions").select("id,version_number,document,created_at").eq("page_key", "home").order("version_number", { ascending: false }).limit(20);
    setVersions((data || []) as VersionRow[]);
  }, []);

  useEffect(() => {
    let active = true;
    async function init() {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth.user;
      if (!user || !active) return setStatus("denied");
      const { data: owner } = await supabase.from("site_editor_owners").select("user_id").eq("user_id", user.id).maybeSingle();
      if (!owner || !active) return setStatus("denied");
      const [draftResult, publishedResult] = await Promise.all([
        supabase.from("site_editor_drafts").select("document,updated_at").eq("page_key", "home").maybeSingle(),
        supabase.from("site_public_pages").select("document,version_number,published_at").eq("page_key", "home").maybeSingle(),
      ]);
      if (!active) return;
      const draftUpdatedAt = draftResult.data?.updated_at ? new Date(draftResult.data.updated_at).getTime() : 0;
      const publishedAt = publishedResult.data?.published_at ? new Date(publishedResult.data.published_at).getTime() : 0;
      const hasNewerDraft = Boolean(draftResult.data?.document) && (!publishedResult.data?.document || draftUpdatedAt > publishedAt);
      const initialSource = hasNewerDraft ? draftResult.data?.document : publishedResult.data?.document ?? draftResult.data?.document ?? DEFAULT_HOME_EDITOR_DOCUMENT;
      const initial = normalizeHomeEditorDocument(initialSource);
      setDocument(initial); setUserId(user.id); setPublishedVersion(publishedResult.data?.version_number ?? null); setStatus("ready");
      void loadVersions();
      if (!draftResult.data) await supabase.from("site_editor_drafts").upsert({ page_key: "home", document: initial, updated_by: user.id, updated_at: new Date().toISOString() });
    }
    void init(); return () => { active = false; };
  }, [loadVersions]);

  const saveDraft = useCallback(async (showMessage = true) => {
    if (!userId) return false;
    setSaving(true);
    const { error } = await supabase.from("site_editor_drafts").upsert({ page_key: "home", document, updated_by: userId, updated_at: new Date().toISOString() });
    setSaving(false);
    if (error) { setMessage(`No se pudo guardar: ${error.message}`); return false; }
    setDirty(false); setLastSaved(new Date()); if (showMessage) setMessage("Borrador guardado."); return true;
  }, [document, userId]);

  useEffect(() => {
    if (status !== "ready" || !dirty || !userId) return;
    const timer = window.setTimeout(() => void saveDraft(false), 1200);
    return () => window.clearTimeout(timer);
  }, [dirty, saveDraft, status, userId]);

  function commit(mutator: (draft: HomeEditorDocument) => void) {
    setDocument((current) => {
      const next = structuredClone(current); mutator(next);
      setHistory((items) => [...items.slice(-99), current]); setFuture([]); setDirty(true); return next;
    });
  }

  const undo = useCallback(() => {
    setHistory((items) => {
      const previous = items.at(-1); if (!previous) return items;
      setDocument((current) => { setFuture((f) => [current, ...f.slice(0, 98)]); return previous; }); setDirty(true); return items.slice(0, -1);
    });
  }, []);
  const redo = useCallback(() => {
    setFuture((items) => {
      const next = items[0]; if (!next) return items;
      setDocument((current) => { setHistory((h) => [...h.slice(-99), current]); return next; }); setDirty(true); return items.slice(1);
    });
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const modifier = event.ctrlKey || event.metaKey;
      if (modifier && event.key.toLowerCase() === "s") { event.preventDefault(); void saveDraft(); }
      if (modifier && !event.shiftKey && event.key.toLowerCase() === "z") { event.preventDefault(); undo(); }
      if (modifier && (event.key.toLowerCase() === "y" || (event.shiftKey && event.key.toLowerCase() === "z"))) { event.preventDefault(); redo(); }
    }
    window.addEventListener("keydown", onKeyDown); return () => window.removeEventListener("keydown", onKeyDown);
  }, [redo, saveDraft, undo]);

  async function publish() {
    const saved = await saveDraft(false); if (!saved) return;
    setSaving(true); const { data, error } = await supabase.rpc("publish_site_page", { p_page_key: "home" }); setSaving(false);
    if (error) return setMessage(`No se pudo publicar: ${error.message}`);
    setPublishedVersion(Number(data)); setMessage(`Publicado correctamente · versión ${Number(data)}`); await loadVersions();
  }

  function selectSection(id: HomeSectionId) { setEditingGlobal(false); setSelectedSection(id); setSelectedElement(null); setTab("layout"); }
  function selectElement(id: HomeEditorElementId) {
    const section = (Object.keys(HOME_SECTION_ELEMENTS) as HomeSectionId[]).find((key) => HOME_SECTION_ELEMENTS[key].includes(id));
    if (section) setSelectedSection(section); setEditingGlobal(false); setSelectedElement(id); setTab("content");
  }
  function moveSection(from: HomeSectionId, to: HomeSectionId) {
    if (from === to) return;
    commit((draft) => { const next = draft.order.filter((id) => id !== from); next.splice(next.indexOf(to), 0, from); draft.order = next; });
  }
  function updateElement(mutator: (style: ElementStyle) => void) { if (selectedElement) commit((draft) => mutator(draft.elements[selectedElement])); }
  function updateSection(mutator: (style: SectionState) => void) { commit((draft) => mutator(draft.sections[selectedSection])); }
  function restoreVersion(version: VersionRow) {
    setHistory((items) => [...items.slice(-99), document]); setFuture([]); setDocument(normalizeHomeEditorDocument(version.document)); setDirty(true);
    setMessage(`Versión ${version.version_number} cargada como borrador. Publicá para hacerla visible.`);
  }
  function applyPreset(name: "clean" | "glass" | "compact") {
    commit((draft) => {
      if (name === "clean") { draft.global.pageBackground = "#f5f6f8"; draft.global.sectionGap = { desktop: 24, tablet: 20, mobile: 16 }; draft.hero.background = "#0b2747"; draft.hero.overlayOpacity = .16; draft.sections.hero.shadow = "none"; }
      if (name === "glass") { draft.global.pageBackground = "#eaf1f6"; draft.hero.background = "#102f55"; draft.hero.overlayOpacity = .28; draft.hero.cardBackground = "rgba(255,255,255,.10)"; draft.hero.cardBorderColor = "rgba(255,255,255,.20)"; draft.sections.hero.shadow = "0 24px 70px rgba(0,0,0,.18)"; }
      if (name === "compact") { draft.global.sectionGap = { desktop: 14, tablet: 12, mobile: 10 }; draft.hero.paddingY = { desktop: 40, tablet: 34, mobile: 28 }; draft.awards.padding = { desktop: 16, tablet: 14, mobile: 12 }; draft.community.padding = 16; }
    });
  }

  const selectedStyle = selectedElement ? document.elements[selectedElement] : null;
  const selectedSectionStyle = document.sections[selectedSection];
  const targetName = editingGlobal ? "Página" : selectedElement ? HOME_ELEMENT_LABELS[selectedElement] : SECTION_LABELS[selectedSection];
  const canvasWidth = VIEWPORT_WIDTH[viewport], canvasScale = zoom / 100;

  const contentEditor = useMemo(() => {
    if (!selectedElement) return null;
    switch (selectedElement) {
      case "hero.eyebrow": return { label: "Texto", value: document.hero.eyebrow, set: (value: string) => commit((d) => { d.hero.eyebrow = value; }) };
      case "hero.title": return { label: "Título", value: document.hero.title, set: (value: string) => commit((d) => { d.hero.title = value; }) };
      case "hero.subtitle": return { label: "Subtítulo", value: document.hero.subtitle, set: (value: string) => commit((d) => { d.hero.subtitle = value; }) };
      case "hero.primaryButton": return { label: "Texto del botón", value: document.hero.primaryLabel, set: (value: string) => commit((d) => { d.hero.primaryLabel = value; }) };
      case "hero.secondaryButton": return { label: "Texto del botón", value: document.hero.secondaryLabel, set: (value: string) => commit((d) => { d.hero.secondaryLabel = value; }) };
      case "community.heading": return { label: "Título", value: document.community.title, set: (value: string) => commit((d) => { d.community.title = value; }) };
      case "community.button": return { label: "Texto del botón", value: document.community.buttonLabel, set: (value: string) => commit((d) => { d.community.buttonLabel = value; }) };
      default: return null;
    }
  }, [document, selectedElement]);

  if (status === "loading") return <main className="flex min-h-screen items-center justify-center bg-[#071421] text-white"><p className="font-black uppercase tracking-[0.18em]">Abriendo editor visual…</p></main>;
  if (status === "denied") return <main className="flex min-h-screen items-center justify-center bg-[#071421] px-6 text-white"><div className="max-w-lg rounded-3xl border border-white/10 bg-white/[0.06] p-8 text-center"><p className="text-xs font-black uppercase tracking-[0.2em] text-[#6dbef2]">Editor privado</p><h1 className="mt-3 text-3xl font-black uppercase">Acceso no autorizado</h1><p className="mt-3 text-sm leading-6 text-white/60">Esta herramienta está restringida al propietario del editor.</p><Link href="/admin" className="mt-6 inline-flex rounded-xl bg-white px-5 py-3 text-xs font-black uppercase text-[#102f55]">Volver al panel</Link></div></main>;

  return <main className="h-screen overflow-hidden bg-[#071421] text-white">
    <header className="flex h-16 items-center justify-between border-b border-white/10 bg-[#0b1b2b] px-3 md:px-4">
      <div className="flex min-w-0 items-center gap-3"><Link href="/admin" className="rounded-lg border border-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-white/65">← Admin</Link><div className="hidden sm:block"><p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#6dbef2]">APA Visual Editor</p><h1 className="text-sm font-black uppercase">Inicio</h1></div><span className={`hidden rounded-full px-3 py-1 text-[10px] font-black uppercase lg:inline-flex ${dirty ? "bg-[#f1b84b]/15 text-[#ffd986]" : "bg-[#57d49a]/15 text-[#83efba]"}`}>{dirty ? "Cambios sin publicar" : "Borrador sincronizado"}</span></div>
      <div className="flex items-center gap-2"><div className="hidden rounded-xl border border-white/10 bg-black/20 p-1 md:flex">{(["desktop", "tablet", "mobile"] as EditorBreakpoint[]).map((item) => <button key={item} onClick={() => setViewport(item)} className={`rounded-lg px-3 py-2 text-[10px] font-black uppercase ${viewport === item ? "bg-white text-[#102f55]" : "text-white/55"}`}>{item}</button>)}</div><button onClick={undo} disabled={!history.length} className="rounded-lg border border-white/10 px-3 py-2 disabled:opacity-30">↶</button><button onClick={redo} disabled={!future.length} className="rounded-lg border border-white/10 px-3 py-2 disabled:opacity-30">↷</button><button onClick={() => void saveDraft()} disabled={saving} className="hidden rounded-xl border border-white/15 px-4 py-2 text-[10px] font-black uppercase xl:block">Guardar</button><button onClick={() => void publish()} disabled={saving} className="rounded-xl bg-[#3ea6e8] px-4 py-2 text-[10px] font-black uppercase text-[#071522]">Publicar</button></div>
    </header>

    <div className="grid h-[calc(100vh-64px)] grid-cols-[250px_minmax(0,1fr)_330px]">
      <aside className="overflow-y-auto border-r border-white/10 bg-[#0b1b2b] p-3">
        <button onClick={() => { setEditingGlobal(true); setSelectedElement(null); setTab("style"); }} className={`mb-3 flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-xs font-black ${editingGlobal ? "bg-[#245f8e]" : "bg-white/[0.04] text-white/70"}`}><span>◫ Página</span><span className="text-white/35">Global</span></button>
        <div className="mb-2 flex items-center justify-between px-2"><p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/45">Capas</p><span className="text-[10px] text-white/30">arrastrables</span></div>
        <div className="space-y-2">{document.order.map((id) => <div key={id} draggable onDragStart={() => setDraggedSection(id)} onDragOver={(e) => e.preventDefault()} onDrop={() => { if (draggedSection) moveSection(draggedSection, id); setDraggedSection(null); }} className={`rounded-xl border ${selectedSection === id && !editingGlobal ? "border-[#3ea6e8]/50 bg-[#245f8e]/35" : "border-white/5 bg-white/[0.025]"}`}><button onClick={() => selectSection(id)} className="flex w-full items-center justify-between px-3 py-3 text-left text-xs font-bold"><span className="flex items-center gap-2"><span className="cursor-grab text-white/25">⋮⋮</span>{SECTION_LABELS[id]}</span><span className={document.sections[id].visible ? "text-[#83efba]" : "text-white/25"}>{document.sections[id].visible ? "●" : "○"}</span></button><div className="border-t border-white/5 px-2 py-1.5">{HOME_SECTION_ELEMENTS[id].map((elementId) => <button key={elementId} onClick={() => selectElement(elementId)} className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[11px] ${selectedElement === elementId ? "bg-[#f0b83f]/15 text-[#ffd986]" : "text-white/45 hover:bg-white/5"}`}><span>{HOME_ELEMENT_LABELS[elementId]}</span><span>{document.elements[elementId].visible ? "◇" : "–"}</span></button>)}</div></div>)}</div>
        <div className="mt-5 border-t border-white/10 pt-4"><p className="px-2 text-[10px] font-black uppercase tracking-[0.16em] text-white/45">Presets</p><div className="mt-2 grid grid-cols-3 gap-1.5"><SmallButton onClick={() => applyPreset("clean")}>Clean</SmallButton><SmallButton onClick={() => applyPreset("glass")}>Glass</SmallButton><SmallButton onClick={() => applyPreset("compact")}>Compact</SmallButton></div></div>
      </aside>

      <section className="relative overflow-auto bg-[#101c27]"><div className="sticky top-0 z-30 flex h-11 items-center justify-between border-b border-white/5 bg-[#101c27]/95 px-4"><p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/35">Canvas · {canvasWidth}px</p><div className="flex items-center gap-2 text-[10px] font-bold text-white/50"><button onClick={() => setZoom((z) => Math.max(40, z - 5))} className="rounded border border-white/10 px-2 py-1">−</button><span>{zoom}%</span><button onClick={() => setZoom((z) => Math.min(100, z + 5))} className="rounded border border-white/10 px-2 py-1">+</button><button onClick={() => setZoom(78)} className="rounded border border-white/10 px-2 py-1">Fit</button></div></div><div className="flex min-h-full justify-center p-8"><div style={{ width: canvasWidth * canvasScale, minWidth: canvasWidth * canvasScale }}><div className="origin-top-left overflow-hidden rounded-2xl bg-[#f5f6f8] shadow-2xl" style={{ width: canvasWidth, transform: `scale(${canvasScale})` }}><HomeLeaguePortal editorDocument={document} editorMode editorBreakpoint={viewport} selectedSection={selectedSection} selectedElement={selectedElement} onSelectSection={selectSection} onSelectElement={selectElement} /></div></div></div></section>

      <aside className="overflow-y-auto border-l border-white/10 bg-[#0b1b2b]"><div className="sticky top-0 z-20 border-b border-white/10 bg-[#0b1b2b] px-4 pt-4"><p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#6dbef2]">Inspector</p><h2 className="mt-1 truncate text-lg font-black">{targetName}</h2><div className="mt-3 flex overflow-x-auto">{(["content", "style", "layout", "advanced", "history"] as InspectorTab[]).map((item) => <button key={item} onClick={() => setTab(item)} className={`border-b-2 px-2.5 py-2 text-[9px] font-black uppercase ${tab === item ? "border-[#3ea6e8] text-white" : "border-transparent text-white/35"}`}>{item}</button>)}</div></div>
        <div className="space-y-4 p-4">{message ? <div className="rounded-xl border border-[#3ea6e8]/20 bg-[#3ea6e8]/10 px-3 py-2 text-[11px] leading-5 text-[#a9dcfb]">{message}</div> : null}
          {tab === "content" ? <>{editingGlobal ? <InspectorSection title="Página"><NumberField label="Ancho máximo" value={document.global.contentMaxWidth} min={900} max={2200} onChange={(v) => commit((d) => { d.global.contentMaxWidth = v; })} /><SelectField label="Tipografía global" value={document.global.fontFamily} options={FONT_OPTIONS} onChange={(v) => commit((d) => { d.global.fontFamily = v; })} /></InspectorSection> : contentEditor ? <InspectorSection title="Contenido"><TextArea label={contentEditor.label} value={contentEditor.value} onChange={contentEditor.set} />{selectedElement === "hero.primaryButton" ? <TextField label="Enlace" value={document.hero.primaryHref} onChange={(v) => commit((d) => { d.hero.primaryHref = v; })} /> : null}{selectedElement === "hero.secondaryButton" ? <TextField label="Enlace" value={document.hero.secondaryHref} onChange={(v) => commit((d) => { d.hero.secondaryHref = v; })} /> : null}{selectedElement === "community.button" ? <TextField label="Enlace" value={document.community.buttonHref} onChange={(v) => commit((d) => { d.community.buttonHref = v; })} /> : null}</InspectorSection> : <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs leading-5 text-white/45">Este bloque usa contenido dinámico de Supabase. Sus estilos y layout sí se pueden modificar.</div>}{!editingGlobal && selectedSection === "hero" && !selectedElement ? <InspectorSection title="Fondo del Hero"><TextField label="URL de imagen" value={document.hero.backgroundImage} onChange={(v) => commit((d) => { d.hero.backgroundImage = v; })} /><SelectField label="Ajuste" value={document.hero.backgroundSize} options={[["cover", "Cubrir"], ["contain", "Contener"], ["auto", "Natural"]]} onChange={(v) => commit((d) => { d.hero.backgroundSize = v as HomeEditorDocument["hero"]["backgroundSize"]; })} /><TextField label="Posición" value={document.hero.backgroundPosition} onChange={(v) => commit((d) => { d.hero.backgroundPosition = v; })} /><NumberField label="Oscurecimiento" value={document.hero.overlayOpacity} min={0} max={1} step={.05} onChange={(v) => commit((d) => { d.hero.overlayOpacity = v; })} /></InspectorSection> : null}</> : null}

          {tab === "style" ? editingGlobal ? <InspectorSection title="Estilo global"><ColorField label="Fondo" value={document.global.pageBackground} onChange={(v) => commit((d) => { d.global.pageBackground = v; })} /><ColorField label="Acento" value={document.global.accentColor} onChange={(v) => commit((d) => { d.global.accentColor = v; })} /><Toggle label="Animaciones" checked={document.global.animationEnabled} onChange={(v) => commit((d) => { d.global.animationEnabled = v; })} /></InspectorSection> : selectedStyle ? <><InspectorSection title="Elemento"><Toggle label="Visible" checked={selectedStyle.visible} onChange={(v) => updateElement((s) => { s.visible = v; })} /><ColorField label="Fondo" value={selectedStyle.background} allowText onChange={(v) => updateElement((s) => { s.background = v; })} /><ColorField label="Texto" value={selectedStyle.color} allowText onChange={(v) => updateElement((s) => { s.color = v; })} /><NumberField label="Opacidad" value={selectedStyle.opacity} min={0} max={1} step={.05} onChange={(v) => updateElement((s) => { s.opacity = v; })} /><NumberField label="Borde" value={selectedStyle.borderWidth} min={0} max={12} onChange={(v) => updateElement((s) => { s.borderWidth = v; })} /><ColorField label="Color borde" value={selectedStyle.borderColor} allowText onChange={(v) => updateElement((s) => { s.borderColor = v; })} /><SelectField label="Sombra" value={selectedStyle.shadow} options={SHADOW_OPTIONS} onChange={(v) => updateElement((s) => { s.shadow = v; })} /></InspectorSection><InspectorSection title="Tipografía"><ResponsiveNumber label="Tamaño" value={selectedStyle.fontSize} breakpoint={viewport} min={0} max={160} onChange={(v) => updateElement((s) => { s.fontSize = setResponsiveValue(s.fontSize, viewport, v); })} /><NumberField label="Peso" value={selectedStyle.fontWeight} min={0} max={900} step={100} onChange={(v) => updateElement((s) => { s.fontWeight = v; })} /><NumberField label="Interlineado" value={selectedStyle.lineHeight} min={0} max={3} step={.05} onChange={(v) => updateElement((s) => { s.lineHeight = v; })} /><NumberField label="Tracking" value={selectedStyle.letterSpacing} min={-.2} max={.5} step={.01} onChange={(v) => updateElement((s) => { s.letterSpacing = v; })} /><SelectField label="Alineación" value={selectedStyle.textAlign} options={[["left", "Izquierda"], ["center", "Centro"], ["right", "Derecha"]]} onChange={(v) => updateElement((s) => { s.textAlign = v as ElementStyle["textAlign"]; })} /><SelectField label="Transformación" value={selectedStyle.textTransform} options={[["none", "Normal"], ["uppercase", "Mayúsculas"], ["lowercase", "Minúsculas"], ["capitalize", "Capitalizar"]]} onChange={(v) => updateElement((s) => { s.textTransform = v as ElementStyle["textTransform"]; })} /></InspectorSection></> : <InspectorSection title="Sección"><Toggle label="Visible" checked={selectedSectionStyle.visible} onChange={(v) => updateSection((s) => { s.visible = v; })} /><ColorField label="Fondo" value={selectedSectionStyle.background} allowText onChange={(v) => updateSection((s) => { s.background = v; })} /><ColorField label="Texto" value={selectedSectionStyle.textColor} allowText onChange={(v) => updateSection((s) => { s.textColor = v; })} /><NumberField label="Borde" value={selectedSectionStyle.borderWidth} min={0} max={12} onChange={(v) => updateSection((s) => { s.borderWidth = v; })} /><ColorField label="Color borde" value={selectedSectionStyle.borderColor} allowText onChange={(v) => updateSection((s) => { s.borderColor = v; })} /><SelectField label="Sombra" value={selectedSectionStyle.shadow} options={SHADOW_OPTIONS} onChange={(v) => updateSection((s) => { s.shadow = v; })} /></InspectorSection> : null}

          {tab === "layout" ? editingGlobal ? <InspectorSection title={`Responsive · ${viewport}`}><ResponsiveNumber label="Gap secciones" value={document.global.sectionGap} breakpoint={viewport} min={0} max={120} onChange={(v) => commit((d) => { d.global.sectionGap = setResponsiveValue(d.global.sectionGap, viewport, v); })} /><NumberField label="Ancho máximo" value={document.global.contentMaxWidth} min={900} max={2200} onChange={(v) => commit((d) => { d.global.contentMaxWidth = v; })} /></InspectorSection> : selectedStyle ? <InspectorSection title={`Responsive · ${viewport}`}><ResponsiveNumber label="Ancho %" value={selectedStyle.width} breakpoint={viewport} min={1} max={100} onChange={(v) => updateElement((s) => { s.width = setResponsiveValue(s.width, viewport, v); })} /><ResponsiveNumber label="Máximo px" value={selectedStyle.maxWidth} breakpoint={viewport} min={40} max={3000} onChange={(v) => updateElement((s) => { s.maxWidth = setResponsiveValue(s.maxWidth, viewport, v); })} /><ResponsiveNumber label="Padding X" value={selectedStyle.paddingX} breakpoint={viewport} min={0} max={200} onChange={(v) => updateElement((s) => { s.paddingX = setResponsiveValue(s.paddingX, viewport, v); })} /><ResponsiveNumber label="Padding Y" value={selectedStyle.paddingY} breakpoint={viewport} min={0} max={200} onChange={(v) => updateElement((s) => { s.paddingY = setResponsiveValue(s.paddingY, viewport, v); })} /><ResponsiveNumber label="Margen arriba" value={selectedStyle.marginTop} breakpoint={viewport} min={-200} max={300} onChange={(v) => updateElement((s) => { s.marginTop = setResponsiveValue(s.marginTop, viewport, v); })} /><ResponsiveNumber label="Margen abajo" value={selectedStyle.marginBottom} breakpoint={viewport} min={-200} max={300} onChange={(v) => updateElement((s) => { s.marginBottom = setResponsiveValue(s.marginBottom, viewport, v); })} /><ResponsiveNumber label="Radio" value={selectedStyle.radius} breakpoint={viewport} min={0} max={120} onChange={(v) => updateElement((s) => { s.radius = setResponsiveValue(s.radius, viewport, v); })} /></InspectorSection> : <InspectorSection title={`Sección · ${viewport}`}><ResponsiveNumber label="Padding X" value={selectedSectionStyle.paddingX} breakpoint={viewport} min={0} max={200} onChange={(v) => updateSection((s) => { s.paddingX = setResponsiveValue(s.paddingX, viewport, v); })} /><ResponsiveNumber label="Padding Y" value={selectedSectionStyle.paddingY} breakpoint={viewport} min={0} max={200} onChange={(v) => updateSection((s) => { s.paddingY = setResponsiveValue(s.paddingY, viewport, v); })} /><ResponsiveNumber label="Margen arriba" value={selectedSectionStyle.marginTop} breakpoint={viewport} min={-200} max={300} onChange={(v) => updateSection((s) => { s.marginTop = setResponsiveValue(s.marginTop, viewport, v); })} /><ResponsiveNumber label="Margen abajo" value={selectedSectionStyle.marginBottom} breakpoint={viewport} min={-200} max={300} onChange={(v) => updateSection((s) => { s.marginBottom = setResponsiveValue(s.marginBottom, viewport, v); })} /><ResponsiveNumber label="Radio" value={selectedSectionStyle.radius} breakpoint={viewport} min={0} max={120} onChange={(v) => updateSection((s) => { s.radius = setResponsiveValue(s.radius, viewport, v); })} /></InspectorSection> : null}

          {tab === "advanced" ? selectedStyle ? <><InspectorSection title={`Transformar · ${viewport}`}><ResponsiveNumber label="Mover X" value={selectedStyle.translateX} breakpoint={viewport} min={-500} max={500} onChange={(v) => updateElement((s) => { s.translateX = setResponsiveValue(s.translateX, viewport, v); })} /><ResponsiveNumber label="Mover Y" value={selectedStyle.translateY} breakpoint={viewport} min={-500} max={500} onChange={(v) => updateElement((s) => { s.translateY = setResponsiveValue(s.translateY, viewport, v); })} /><ResponsiveNumber label="Escala" value={selectedStyle.scale} breakpoint={viewport} min={.2} max={3} step={.05} onChange={(v) => updateElement((s) => { s.scale = setResponsiveValue(s.scale, viewport, v); })} /><ResponsiveNumber label="Rotación" value={selectedStyle.rotate} breakpoint={viewport} min={-180} max={180} onChange={(v) => updateElement((s) => { s.rotate = setResponsiveValue(s.rotate, viewport, v); })} /></InspectorSection><InspectorSection title="Herramientas"><div className="grid grid-cols-2 gap-2"><SmallButton onClick={() => setClipboard(structuredClone(selectedStyle))}>Copiar estilo</SmallButton><SmallButton disabled={!clipboard} onClick={() => clipboard && updateElement((s) => Object.assign(s, structuredClone(clipboard)))}>Pegar estilo</SmallButton><SmallButton onClick={() => selectedElement && updateElement((s) => Object.assign(s, structuredClone(DEFAULT_HOME_EDITOR_DOCUMENT.elements[selectedElement])))}>Reset</SmallButton><SmallButton onClick={() => updateElement((s) => { s.visible = !s.visible; })}>{selectedStyle.visible ? "Ocultar" : "Mostrar"}</SmallButton></div></InspectorSection></> : <InspectorSection title="Documento"><p className="text-[11px] leading-5 text-white/45">Ctrl/Cmd + S guarda · Ctrl/Cmd + Z deshace · Ctrl/Cmd + Y rehace. Los valores responsive son independientes.</p></InspectorSection> : null}

          {tab === "history" ? <InspectorSection title="Versiones publicadas"><div className="space-y-2">{versions.length ? versions.map((version) => <button key={version.id} onClick={() => restoreVersion(version)} className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 text-left"><div><p className="text-xs font-black">Versión {version.version_number}</p><p className="mt-1 text-[9px] text-white/35">{new Date(version.created_at).toLocaleString()}</p></div><span className="text-[10px] font-black text-[#6dbef2]">Restaurar</span></button>) : <p className="text-xs text-white/40">Sin versiones todavía.</p>}</div></InspectorSection> : null}
          <div className="border-t border-white/10 pt-3 text-[10px] leading-5 text-white/35"><p>Versión pública: <strong className="text-white/70">{publishedVersion ?? "—"}</strong></p><p>{saving ? "Guardando…" : lastSaved ? `Guardado ${lastSaved.toLocaleTimeString()}` : "Autosave activo"}</p></div>
        </div>
      </aside>
    </div>
  </main>;
}

function InspectorSection({ title, children }: { title: string; children: ReactNode }) { return <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-3"><p className="mb-3 text-[9px] font-black uppercase tracking-[0.16em] text-white/35">{title}</p><div className="space-y-3">{children}</div></section>; }
function SmallButton({ children, onClick, disabled = false }: { children: ReactNode; onClick: () => void; disabled?: boolean }) { return <button type="button" onClick={onClick} disabled={disabled} className="rounded-lg border border-white/10 bg-white/[0.03] px-2 py-2 text-[9px] font-black uppercase text-white/60 disabled:opacity-30">{children}</button>; }
function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <label className="block"><span className="mb-1 block text-[10px] font-bold text-white/50">{label}</span><input value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-xs text-white outline-none" /></label>; }
function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <label className="block"><span className="mb-1 block text-[10px] font-bold text-white/50">{label}</span><textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className="w-full resize-y rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-xs leading-5 text-white outline-none" /></label>; }
function NumberField({ label, value, min, max, step = 1, onChange }: { label: string; value: number; min: number; max: number; step?: number; onChange: (value: number) => void }) { return <label className="block"><span className="mb-1 flex items-center justify-between text-[10px] font-bold text-white/50"><span>{label}</span><span className="text-white/30">{value}</span></span><input type="range" value={value} min={min} max={max} step={step} onChange={(e) => onChange(Number(e.target.value))} className="w-full" /></label>; }
function ResponsiveNumber({ label, value, breakpoint, min, max, step = 1, onChange }: { label: string; value: { desktop: number; tablet?: number; mobile?: number }; breakpoint: EditorBreakpoint; min: number; max: number; step?: number; onChange: (value: number) => void }) { return <NumberField label={`${label} · ${breakpoint}`} value={valueForBreakpoint(value, breakpoint)} min={min} max={max} step={step} onChange={onChange} />; }
function ColorField({ label, value, onChange, allowText = false }: { label: string; value: string; onChange: (value: string) => void; allowText?: boolean }) { const hex = /^#[0-9a-fA-F]{6}$/.test(value) ? value : "#ffffff"; return <label className="block"><span className="mb-1 block text-[10px] font-bold text-white/50">{label}</span><div className="flex gap-2"><input type="color" value={hex} onChange={(e) => onChange(e.target.value)} className="h-9 w-10 rounded border border-white/10 bg-transparent" />{allowText ? <input value={value} onChange={(e) => onChange(e.target.value)} className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/20 px-2 text-[10px] text-white" /> : <span className="flex flex-1 items-center rounded-lg border border-white/10 bg-black/20 px-2 text-[10px] text-white/60">{value}</span>}</div></label>; }
function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[][]; onChange: (value: string) => void }) { return <label className="block"><span className="mb-1 block text-[10px] font-bold text-white/50">{label}</span><select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg border border-white/10 bg-[#102131] px-3 py-2 text-xs text-white outline-none">{options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>; }
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) { return <button type="button" onClick={() => onChange(!checked)} className="flex w-full items-center justify-between"><span className="text-[10px] font-bold text-white/50">{label}</span><span className={`relative h-5 w-9 rounded-full ${checked ? "bg-[#3ea6e8]" : "bg-white/15"}`}><span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white ${checked ? "left-[18px]" : "left-0.5"}`} /></span></button>; }
