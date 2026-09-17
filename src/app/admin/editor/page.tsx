"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import HomeLeaguePortal from "@/components/home/HomeLeaguePortal";
import { supabase } from "@/lib/supabase";
import {
  DEFAULT_HOME_EDITOR_DOCUMENT,
  normalizeHomeEditorDocument,
  setResponsiveValue,
  valueForBreakpoint,
  type EditorBreakpoint,
  type HomeEditorDocument,
  type HomeEditorElementId,
  type HomeSectionId,
  type SectionState,
  type TypographyStyle,
} from "@/lib/siteEditor";

type VersionRow = { version_number: number; created_at: string; document: unknown };
type PanelMode = "page" | "section" | "element";

const LABELS: Record<HomeSectionId, string> = {
  hero: "Hero",
  news: "Noticias + tabla",
  awards: "Premios",
  competitions: "Competiciones / copas",
  match: "Partido destacado",
  stats: "Estadísticas",
  community: "Comunidad",
};

const ELEMENT_LABELS: Partial<Record<HomeEditorElementId, string>> = {
  "hero.eyebrow": "Etiqueta del Hero",
  "hero.title": "Título del Hero",
  "hero.subtitle": "Subtítulo del Hero",
  "hero.primaryButton": "Botón principal",
  "hero.secondaryButton": "Botón secundario",
  "hero.cards": "Tarjetas del Hero",
  "awards.heading": "Bloque de Premios",
  "competitions.heading": "Bloque de Competiciones",
  "stats.cards": "Tarjetas estadísticas",
  "community.heading": "Texto de Comunidad",
  "community.button": "Botón de Comunidad",
};

const VIEWPORT_WIDTH: Record<EditorBreakpoint, string> = { desktop: "100%", tablet: "900px", mobile: "390px" };
const clone = <T,>(value: T): T => structuredClone(value);

export default function SiteEditorPage() {
  const [document, setDocument] = useState<HomeEditorDocument>(() => clone(DEFAULT_HOME_EDITOR_DOCUMENT));
  const [selected, setSelected] = useState<HomeSectionId>("hero");
  const [selectedElement, setSelectedElement] = useState<HomeEditorElementId | null>(null);
  const [viewport, setViewport] = useState<EditorBreakpoint>("desktop");
  const [panelMode, setPanelMode] = useState<PanelMode>("section");
  const [history, setHistory] = useState<HomeEditorDocument[]>([]);
  const [future, setFuture] = useState<HomeEditorDocument[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "denied">("loading");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [publishedVersion, setPublishedVersion] = useState<number | null>(null);
  const [versions, setVersions] = useState<VersionRow[]>([]);
  const [message, setMessage] = useState("");
  const [copiedSectionStyle, setCopiedSectionStyle] = useState<SectionState | null>(null);

  const loadVersions = useCallback(async () => {
    const { data } = await supabase.from("site_editor_versions").select("version_number,created_at,document").eq("page_key", "home").order("version_number", { ascending: false }).limit(20);
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
        supabase.from("site_public_pages").select("document,version_number").eq("page_key", "home").maybeSingle(),
      ]);
      if (!active) return;
      const initial = normalizeHomeEditorDocument(draftResult.data?.document ?? publishedResult.data?.document ?? DEFAULT_HOME_EDITOR_DOCUMENT);
      setDocument(initial);
      setUserId(user.id);
      setPublishedVersion(publishedResult.data?.version_number ?? null);
      setStatus("ready");
      void loadVersions();
      if (!draftResult.data) {
        await supabase.from("site_editor_drafts").upsert({ page_key: "home", document: initial, updated_by: user.id, updated_at: new Date().toISOString() });
      }
    }
    void init();
    return () => { active = false; };
  }, [loadVersions]);

  const saveDraft = useCallback(async (showMessage = true, source = document) => {
    if (!userId) return false;
    setSaving(true);
    const { error } = await supabase.from("site_editor_drafts").upsert({ page_key: "home", document: source, updated_by: userId, updated_at: new Date().toISOString() });
    setSaving(false);
    if (error) {
      setMessage(`No se pudo guardar: ${error.message}`);
      return false;
    }
    setDirty(false);
    setLastSaved(new Date());
    if (showMessage) setMessage("Borrador guardado.");
    return true;
  }, [document, userId]);

  useEffect(() => {
    if (status !== "ready" || !dirty || !userId) return;
    const timer = window.setTimeout(() => void saveDraft(false), 1100);
    return () => window.clearTimeout(timer);
  }, [document, dirty, status, userId, saveDraft]);

  const commit = useCallback((mutator: (draft: HomeEditorDocument) => void) => {
    setDocument((current) => {
      const next = clone(current);
      mutator(next);
      setHistory((items) => [...items.slice(-99), clone(current)]);
      setFuture([]);
      setDirty(true);
      return next;
    });
  }, []);

  const undo = useCallback(() => {
    const previous = history.at(-1);
    if (!previous) return;
    setHistory((items) => items.slice(0, -1));
    setFuture((items) => [clone(document), ...items.slice(0, 99)]);
    setDocument(clone(previous));
    setDirty(true);
  }, [history, document]);

  const redo = useCallback(() => {
    const next = future[0];
    if (!next) return;
    setFuture((items) => items.slice(1));
    setHistory((items) => [...items.slice(-99), clone(document)]);
    setDocument(clone(next));
    setDirty(true);
  }, [future, document]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const mod = event.ctrlKey || event.metaKey;
      if (!mod) return;
      if (event.key.toLowerCase() === "s") { event.preventDefault(); void saveDraft(); }
      if (event.key.toLowerCase() === "z" && !event.shiftKey) { event.preventDefault(); undo(); }
      if ((event.key.toLowerCase() === "y") || (event.key.toLowerCase() === "z" && event.shiftKey)) { event.preventDefault(); redo(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [saveDraft, undo, redo]);

  function selectSection(id: HomeSectionId) {
    setSelected(id);
    setSelectedElement(null);
    setPanelMode("section");
  }

  function selectElement(id: HomeEditorElementId) {
    const section = id.split(".")[0] as HomeSectionId;
    setSelected(section);
    setSelectedElement(id);
    setPanelMode("element");
  }

  function moveSelected(direction: -1 | 1) {
    commit((draft) => {
      const index = draft.order.indexOf(selected);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= draft.order.length) return;
      [draft.order[index], draft.order[target]] = [draft.order[target], draft.order[index]];
    });
  }

  async function publish() {
    const saved = await saveDraft(false);
    if (!saved) return;
    setSaving(true);
    const { data, error } = await supabase.rpc("publish_site_page", { p_page_key: "home" });
    setSaving(false);
    if (error) return setMessage(`No se pudo publicar: ${error.message}`);
    setPublishedVersion(Number(data));
    setMessage(`Publicado correctamente · versión ${Number(data)}`);
    void loadVersions();
  }

  function restoreVersion(row: VersionRow) {
    const restored = normalizeHomeEditorDocument(row.document);
    setHistory((items) => [...items.slice(-99), clone(document)]);
    setFuture([]);
    setDocument(restored);
    setDirty(true);
    setMessage(`Versión ${row.version_number} cargada como borrador. Publicá para hacerla visible.`);
  }

  function resetSection() {
    commit((draft) => {
      draft.sections[selected] = clone(DEFAULT_HOME_EDITOR_DOCUMENT.sections[selected]);
      if (selected === "hero") draft.hero = clone(DEFAULT_HOME_EDITOR_DOCUMENT.hero);
      if (selected === "awards") draft.awards = clone(DEFAULT_HOME_EDITOR_DOCUMENT.awards);
      if (selected === "competitions") draft.competitions = clone(DEFAULT_HOME_EDITOR_DOCUMENT.competitions);
      if (selected === "stats") draft.stats = clone(DEFAULT_HOME_EDITOR_DOCUMENT.stats);
      if (selected === "community") draft.community = clone(DEFAULT_HOME_EDITOR_DOCUMENT.community);
    });
  }

  const selectedIndex = document.order.indexOf(selected);
  const selectedSection = document.sections[selected];
  const changesLabel = dirty ? "Cambios sin publicar" : "Borrador sincronizado";

  if (status === "loading") return <main className="flex min-h-screen items-center justify-center bg-[#091727] text-white"><p className="font-black uppercase tracking-[0.18em]">Abriendo editor visual…</p></main>;
  if (status === "denied") return <main className="flex min-h-screen items-center justify-center bg-[#091727] px-6 text-white"><div className="max-w-lg rounded-3xl border border-white/10 bg-white/[0.06] p-8 text-center"><p className="text-xs font-black uppercase tracking-[0.2em] text-[#6dbef2]">Editor privado</p><h1 className="mt-3 text-3xl font-black uppercase">Acceso no autorizado</h1><p className="mt-3 text-sm leading-6 text-white/60">Esta herramienta está restringida al propietario del editor.</p><Link href="/admin" className="mt-6 inline-flex rounded-xl bg-white px-5 py-3 text-xs font-black uppercase text-[#102f55]">Volver al panel</Link></div></main>;

  return (
    <main className="h-screen overflow-hidden bg-[#08131f] text-white">
      <header className="flex h-16 items-center justify-between border-b border-white/10 bg-[#0b1b2b] px-3 md:px-4">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/admin" className="rounded-lg border border-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-white/65 hover:bg-white/5">← Admin</Link>
          <div className="hidden sm:block"><p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#6dbef2]">APA Visual Editor v2</p><h1 className="text-sm font-black uppercase">Inicio</h1></div>
          <span className={`hidden rounded-full px-3 py-1 text-[10px] font-black uppercase lg:inline-flex ${dirty ? "bg-[#f1b84b]/15 text-[#ffd986]" : "bg-[#57d49a]/15 text-[#83efba]"}`}>{changesLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden rounded-xl border border-white/10 bg-black/20 p-1 md:flex">{(["desktop", "tablet", "mobile"] as EditorBreakpoint[]).map((item) => <button key={item} onClick={() => setViewport(item)} className={`rounded-lg px-3 py-2 text-[10px] font-black uppercase ${viewport === item ? "bg-white text-[#102f55]" : "text-white/55 hover:text-white"}`}>{item}</button>)}</div>
          <button title="Deshacer" onClick={undo} disabled={!history.length} className="rounded-lg border border-white/10 px-3 py-2 text-sm disabled:opacity-30">↶</button>
          <button title="Rehacer" onClick={redo} disabled={!future.length} className="rounded-lg border border-white/10 px-3 py-2 text-sm disabled:opacity-30">↷</button>
          <button onClick={() => void saveDraft()} disabled={saving} className="hidden rounded-xl border border-white/15 px-4 py-2 text-[10px] font-black uppercase text-white/75 hover:bg-white/5 lg:block">Guardar</button>
          <button onClick={() => void publish()} disabled={saving} className="rounded-xl bg-[#3ea6e8] px-4 py-2 text-[10px] font-black uppercase text-[#071522] hover:bg-[#69bdf0] disabled:opacity-50">Publicar</button>
        </div>
      </header>

      <div className="grid h-[calc(100vh-64px)] grid-cols-1 xl:grid-cols-[235px_minmax(0,1fr)_330px]">
        <aside className="hidden overflow-y-auto border-r border-white/10 bg-[#0b1b2b] p-3 xl:block">
          <div className="mb-3 flex items-center justify-between px-2"><p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/45">Capas</p><button onClick={() => setPanelMode("page")} className="text-[9px] font-black uppercase text-[#6dbef2]">Página</button></div>
          <div className="space-y-1">{document.order.map((id) => <button key={id} onClick={() => selectSection(id)} className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-xs font-bold ${selected === id && !selectedElement ? "bg-[#245f8e] text-white" : "text-white/65 hover:bg-white/5"}`}><span>{LABELS[id]}</span><span className={document.sections[id].visible ? "text-[#83efba]" : "text-white/25"}>{document.sections[id].visible ? "●" : "○"}</span></button>)}</div>
          <div className="mt-5 border-t border-white/10 pt-4"><p className="px-2 text-[10px] font-black uppercase tracking-[0.16em] text-white/45">Historial publicado</p><div className="mt-2 space-y-1">{versions.map((row) => <button key={row.version_number} onClick={() => restoreVersion(row)} className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-[10px] text-white/55 hover:bg-white/5"><span>Versión {row.version_number}{publishedVersion === row.version_number ? " · actual" : ""}</span><span>{new Date(row.created_at).toLocaleDateString()}</span></button>)}</div></div>
          <div className="mt-5 border-t border-white/10 px-2 pt-4 text-[10px] leading-5 text-white/40"><p>Ctrl/Cmd + S · guardar</p><p>Ctrl/Cmd + Z · deshacer</p><p>Ctrl/Cmd + Y · rehacer</p><p>{saving ? "Guardando…" : lastSaved ? `Guardado ${lastSaved.toLocaleTimeString()}` : "Autosave activo"}</p></div>
        </aside>

        <section className="overflow-auto bg-[#111d28] p-3 md:p-6">
          <div className="mx-auto min-h-full transition-[width] duration-200" style={{ width: VIEWPORT_WIDTH[viewport], maxWidth: "100%" }}>
            <div className="overflow-hidden rounded-2xl bg-[#f5f6f8] shadow-2xl">
              <HomeLeaguePortal editorDocument={document} editorMode editorBreakpoint={viewport} selectedSection={selected} selectedElement={selectedElement} onSelectSection={selectSection} onSelectElement={selectElement} />
            </div>
          </div>
        </section>

        <aside className="hidden overflow-y-auto border-l border-white/10 bg-[#0b1b2b] p-4 xl:block">
          <div className="mb-4 flex rounded-xl border border-white/10 bg-black/20 p-1">{(["page", "section", "element"] as PanelMode[]).map((mode) => <button key={mode} onClick={() => setPanelMode(mode)} disabled={mode === "element" && !selectedElement} className={`flex-1 rounded-lg px-2 py-2 text-[9px] font-black uppercase ${panelMode === mode ? "bg-white text-[#102f55]" : "text-white/45 disabled:opacity-25"}`}>{mode}</button>)}</div>
          <div className="mb-5"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#6dbef2]">Propiedades · {viewport}</p><h2 className="mt-1 text-xl font-black">{panelMode === "page" ? "Página Inicio" : panelMode === "element" && selectedElement ? ELEMENT_LABELS[selectedElement] : LABELS[selected]}</h2></div>

          {panelMode === "page" ? <PageInspector document={document} viewport={viewport} commit={commit} /> : null}
          {panelMode === "section" ? <>
            <InspectorSection title="Capa"><Toggle label="Visible" checked={selectedSection.visible} onChange={(checked) => commit((draft) => { draft.sections[selected].visible = checked; })} /><div className="grid grid-cols-2 gap-2"><SmallButton disabled={selectedIndex <= 0} onClick={() => moveSelected(-1)}>Subir</SmallButton><SmallButton disabled={selectedIndex >= document.order.length - 1} onClick={() => moveSelected(1)}>Bajar</SmallButton></div><div className="grid grid-cols-2 gap-2"><SmallButton onClick={() => { setCopiedSectionStyle(clone(selectedSection)); setMessage("Estilo de sección copiado."); }}>Copiar estilo</SmallButton><SmallButton disabled={!copiedSectionStyle} onClick={() => copiedSectionStyle && commit((draft) => { draft.sections[selected] = clone(copiedSectionStyle); })}>Pegar estilo</SmallButton></div><SmallButton onClick={resetSection}>Restaurar sección</SmallButton></InspectorSection>
            <SectionStyleInspector section={selectedSection} viewport={viewport} onChange={(mutator) => commit((draft) => mutator(draft.sections[selected]))} />
            <ContentInspector selected={selected} document={document} viewport={viewport} commit={commit} />
          </> : null}
          {panelMode === "element" && selectedElement ? <ElementInspector id={selectedElement} document={document} viewport={viewport} commit={commit} /> : null}
          {message ? <div className="mt-5 rounded-xl border border-[#3ea6e8]/20 bg-[#3ea6e8]/10 p-3 text-[11px] leading-5 text-[#a9ddfb]">{message}</div> : null}
        </aside>
      </div>
    </main>
  );
}

function PageInspector({ document, viewport, commit }: { document: HomeEditorDocument; viewport: EditorBreakpoint; commit: (fn: (draft: HomeEditorDocument) => void) => void }) {
  return <><InspectorSection title="Canvas"><ColorField label="Fondo de página" value={document.global.pageBackground} onChange={(v) => commit((d) => { d.global.pageBackground = v; })} /><NumberField label="Ancho máximo" value={document.global.contentMaxWidth} min={900} max={2200} step={10} onChange={(v) => commit((d) => { d.global.contentMaxWidth = v; })} /><ResponsiveNumber label="Separación entre secciones" value={document.global.sectionGap} viewport={viewport} min={0} max={100} onChange={(v) => commit((d) => { d.global.sectionGap = setResponsiveValue(d.global.sectionGap, viewport, v); })} /><ColorField label="Color de acento" value={document.global.accentColor} onChange={(v) => commit((d) => { d.global.accentColor = v; })} /><TextField label="Fuente CSS" value={document.global.fontFamily} onChange={(v) => commit((d) => { d.global.fontFamily = v; })} /><Toggle label="Animaciones" checked={document.global.animationEnabled} onChange={(v) => commit((d) => { d.global.animationEnabled = v; })} /></InspectorSection></>;
}

function SectionStyleInspector({ section, viewport, onChange }: { section: SectionState; viewport: EditorBreakpoint; onChange: (fn: (section: SectionState) => void) => void }) {
  return <><InspectorSection title="Caja"><ColorField label="Fondo" value={section.background} onChange={(v) => onChange((s) => { s.background = v; })} /><ColorField label="Texto" value={section.textColor} onChange={(v) => onChange((s) => { s.textColor = v; })} /><ResponsiveNumber label="Radio" value={section.radius} viewport={viewport} min={0} max={100} onChange={(v) => onChange((s) => { s.radius = setResponsiveValue(s.radius, viewport, v); })} /><ResponsiveNumber label="Padding vertical" value={section.paddingY} viewport={viewport} min={0} max={180} onChange={(v) => onChange((s) => { s.paddingY = setResponsiveValue(s.paddingY, viewport, v); })} /><ResponsiveNumber label="Padding horizontal" value={section.paddingX} viewport={viewport} min={0} max={180} onChange={(v) => onChange((s) => { s.paddingX = setResponsiveValue(s.paddingX, viewport, v); })} /><ResponsiveNumber label="Margen superior" value={section.marginTop} viewport={viewport} min={-100} max={200} onChange={(v) => onChange((s) => { s.marginTop = setResponsiveValue(s.marginTop, viewport, v); })} /><ResponsiveNumber label="Margen inferior" value={section.marginBottom} viewport={viewport} min={-100} max={200} onChange={(v) => onChange((s) => { s.marginBottom = setResponsiveValue(s.marginBottom, viewport, v); })} /></InspectorSection><InspectorSection title="Borde y sombra"><NumberField label="Grosor borde" value={section.borderWidth} min={0} max={12} onChange={(v) => onChange((s) => { s.borderWidth = v; })} /><ColorField label="Color borde" value={section.borderColor} onChange={(v) => onChange((s) => { s.borderColor = v; })} /><TextField label="Box shadow CSS" value={section.shadow} onChange={(v) => onChange((s) => { s.shadow = v; })} /></InspectorSection></>;
}

function ContentInspector({ selected, document, viewport, commit }: { selected: HomeSectionId; document: HomeEditorDocument; viewport: EditorBreakpoint; commit: (fn: (draft: HomeEditorDocument) => void) => void }) {
  if (selected === "hero") return <InspectorSection title="Hero"><TextField label="Etiqueta" value={document.hero.eyebrow} onChange={(v) => commit((d) => { d.hero.eyebrow = v; })} /><TextArea label="Título" value={document.hero.title} onChange={(v) => commit((d) => { d.hero.title = v; })} /><TextArea label="Subtítulo" value={document.hero.subtitle} onChange={(v) => commit((d) => { d.hero.subtitle = v; })} /><TextField label="Imagen de fondo URL" value={document.hero.backgroundImage} onChange={(v) => commit((d) => { d.hero.backgroundImage = v; })} /><TextField label="Posición de fondo" value={document.hero.backgroundPosition} onChange={(v) => commit((d) => { d.hero.backgroundPosition = v; })} /><NumberField label="Overlay" value={document.hero.overlayOpacity} min={0} max={1} step={0.05} onChange={(v) => commit((d) => { d.hero.overlayOpacity = v; })} /><ResponsiveNumber label="Padding vertical" value={document.hero.paddingY} viewport={viewport} min={0} max={200} onChange={(v) => commit((d) => { d.hero.paddingY = setResponsiveValue(d.hero.paddingY, viewport, v); })} /></InspectorSection>;
  if (selected === "awards") return <InspectorSection title="Premios"><TextField label="Etiqueta" value={document.awards.eyebrow} onChange={(v) => commit((d) => { d.awards.eyebrow = v; })} /><TextField label="Título" value={document.awards.title} onChange={(v) => commit((d) => { d.awards.title = v; })} /><ColorField label="Fondo" value={document.awards.background} onChange={(v) => commit((d) => { d.awards.background = v; })} /><NumberField label="Radio tarjetas" value={document.awards.cardRadius} min={0} max={80} onChange={(v) => commit((d) => { d.awards.cardRadius = v; })} /><NumberField label="Padding tarjetas" value={document.awards.cardPadding} min={0} max={80} onChange={(v) => commit((d) => { d.awards.cardPadding = v; })} /></InspectorSection>;
  if (selected === "competitions") return <InspectorSection title="Competiciones"><TextField label="Etiqueta" value={document.competitions.eyebrow} onChange={(v) => commit((d) => { d.competitions.eyebrow = v; })} /><TextField label="Título" value={document.competitions.title} onChange={(v) => commit((d) => { d.competitions.title = v; })} /><ColorField label="Acento" value={document.competitions.accentColor} onChange={(v) => commit((d) => { d.competitions.accentColor = v; })} /><ColorField label="Tarjetas" value={document.competitions.cardBackground} onChange={(v) => commit((d) => { d.competitions.cardBackground = v; })} /></InspectorSection>;
  if (selected === "stats") return <InspectorSection title="Estadísticas"><ColorField label="Fondo tarjeta" value={document.stats.background} onChange={(v) => commit((d) => { d.stats.background = v; })} /><ColorField label="Texto" value={document.stats.textColor} onChange={(v) => commit((d) => { d.stats.textColor = v; })} /><NumberField label="Radio" value={document.stats.radius} min={0} max={80} onChange={(v) => commit((d) => { d.stats.radius = v; })} /><NumberField label="Separación" value={document.stats.cardGap} min={0} max={60} onChange={(v) => commit((d) => { d.stats.cardGap = v; })} /></InspectorSection>;
  if (selected === "community") return <InspectorSection title="Comunidad"><TextField label="Etiqueta" value={document.community.eyebrow} onChange={(v) => commit((d) => { d.community.eyebrow = v; })} /><TextField label="Título" value={document.community.title} onChange={(v) => commit((d) => { d.community.title = v; })} /><TextField label="Texto botón" value={document.community.buttonLabel} onChange={(v) => commit((d) => { d.community.buttonLabel = v; })} /><TextField label="Enlace botón" value={document.community.buttonHref} onChange={(v) => commit((d) => { d.community.buttonHref = v; })} /><ColorField label="Fondo" value={document.community.background} onChange={(v) => commit((d) => { d.community.background = v; })} /></InspectorSection>;
  return <InspectorSection title="Contenido"><p className="text-[11px] leading-5 text-white/45">Esta sección conserva sus datos dinámicos de Supabase. Podés cambiar su caja, orden, visibilidad, márgenes, borde y sombra sin romper la lógica.</p></InspectorSection>;
}

function ElementInspector({ id, document, viewport, commit }: { id: HomeEditorElementId; document: HomeEditorDocument; viewport: EditorBreakpoint; commit: (fn: (draft: HomeEditorDocument) => void) => void }) {
  if (id === "hero.title") return <TypographyInspector title="Tipografía del título" style={document.hero.titleStyle} viewport={viewport} text={document.hero.title} onText={(v) => commit((d) => { d.hero.title = v; })} onStyle={(fn) => commit((d) => fn(d.hero.titleStyle))} />;
  if (id === "hero.subtitle") return <TypographyInspector title="Tipografía del subtítulo" style={document.hero.subtitleStyle} viewport={viewport} text={document.hero.subtitle} onText={(v) => commit((d) => { d.hero.subtitle = v; })} onStyle={(fn) => commit((d) => fn(d.hero.subtitleStyle))} />;
  if (id === "hero.eyebrow") return <TypographyInspector title="Tipografía de etiqueta" style={document.hero.eyebrowStyle} viewport={viewport} text={document.hero.eyebrow} onText={(v) => commit((d) => { d.hero.eyebrow = v; })} onStyle={(fn) => commit((d) => fn(d.hero.eyebrowStyle))} />;
  if (id === "hero.primaryButton" || id === "hero.secondaryButton") {
    const primary = id === "hero.primaryButton";
    return <InspectorSection title={primary ? "Botón principal" : "Botón secundario"}><TextField label="Texto" value={primary ? document.hero.primaryLabel : document.hero.secondaryLabel} onChange={(v) => commit((d) => { if (primary) d.hero.primaryLabel = v; else d.hero.secondaryLabel = v; })} /><TextField label="Enlace" value={primary ? document.hero.primaryHref : document.hero.secondaryHref} onChange={(v) => commit((d) => { if (primary) d.hero.primaryHref = v; else d.hero.secondaryHref = v; })} /><NumberField label="Radio" value={document.hero.buttonRadius} min={0} max={999} onChange={(v) => commit((d) => { d.hero.buttonRadius = v; })} /></InspectorSection>;
  }
  if (id === "hero.cards") return <InspectorSection title="Tarjetas Hero"><ColorField label="Fondo" value={document.hero.cardBackground} onChange={(v) => commit((d) => { d.hero.cardBackground = v; })} /><ColorField label="Borde" value={document.hero.cardBorderColor} onChange={(v) => commit((d) => { d.hero.cardBorderColor = v; })} /><NumberField label="Radio" value={document.hero.cardRadius} min={0} max={80} onChange={(v) => commit((d) => { d.hero.cardRadius = v; })} /><ResponsiveNumber label="Separación" value={document.hero.cardGap} viewport={viewport} min={0} max={60} onChange={(v) => commit((d) => { d.hero.cardGap = setResponsiveValue(d.hero.cardGap, viewport, v); })} /><ResponsiveNumber label="Columnas del Hero" value={document.hero.contentColumns} viewport={viewport} min={1} max={2} onChange={(v) => commit((d) => { d.hero.contentColumns = setResponsiveValue(d.hero.contentColumns, viewport, v); })} /></InspectorSection>;
  return <ContentInspector selected={id.split(".")[0] as HomeSectionId} document={document} viewport={viewport} commit={commit} />;
}

function TypographyInspector({ title, style, viewport, text, onText, onStyle }: { title: string; style: TypographyStyle; viewport: EditorBreakpoint; text: string; onText: (value: string) => void; onStyle: (fn: (style: TypographyStyle) => void) => void }) {
  return <InspectorSection title={title}><TextArea label="Texto" value={text} onChange={onText} /><ResponsiveNumber label="Tamaño" value={style.fontSize} viewport={viewport} min={8} max={160} onChange={(v) => onStyle((s) => { s.fontSize = setResponsiveValue(s.fontSize, viewport, v); })} /><NumberField label="Peso" value={style.fontWeight} min={100} max={1000} step={100} onChange={(v) => onStyle((s) => { s.fontWeight = v; })} /><NumberField label="Line height" value={style.lineHeight} min={0.6} max={2.5} step={0.05} onChange={(v) => onStyle((s) => { s.lineHeight = v; })} /><NumberField label="Letter spacing em" value={style.letterSpacing} min={-0.2} max={0.8} step={0.01} onChange={(v) => onStyle((s) => { s.letterSpacing = v; })} /><ColorField label="Color" value={style.color} onChange={(v) => onStyle((s) => { s.color = v; })} /><ResponsiveNumber label="Ancho máximo" value={style.maxWidth} viewport={viewport} min={120} max={1600} step={10} onChange={(v) => onStyle((s) => { s.maxWidth = setResponsiveValue(s.maxWidth, viewport, v); })} /><SelectField label="Alineación" value={style.align} options={["left", "center", "right"]} onChange={(v) => onStyle((s) => { s.align = v as TypographyStyle["align"]; })} /><SelectField label="Transformación" value={style.textTransform} options={["none", "uppercase", "lowercase", "capitalize"]} onChange={(v) => onStyle((s) => { s.textTransform = v as TypographyStyle["textTransform"]; })} /></InspectorSection>;
}

function InspectorSection({ title, children }: { title: string; children: React.ReactNode }) { return <section className="mb-4 space-y-3 rounded-2xl border border-white/10 bg-white/[0.035] p-3"><p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/40">{title}</p>{children}</section>; }
function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <label className="block text-[10px] font-bold text-white/55">{label}<input value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-xs text-white outline-none focus:border-[#3ea6e8]" /></label>; }
function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <label className="block text-[10px] font-bold text-white/55">{label}<textarea value={value} rows={3} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full resize-y rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-xs text-white outline-none focus:border-[#3ea6e8]" /></label>; }
function NumberField({ label, value, onChange, min, max, step = 1 }: { label: string; value: number; onChange: (value: number) => void; min?: number; max?: number; step?: number }) { return <label className="block text-[10px] font-bold text-white/55">{label}<div className="mt-1 flex items-center gap-2"><input type="range" value={value} min={min} max={max} step={step} onChange={(e) => onChange(Number(e.target.value))} className="min-w-0 flex-1" /><input type="number" value={value} min={min} max={max} step={step} onChange={(e) => onChange(Number(e.target.value))} className="w-20 rounded-lg border border-white/10 bg-black/20 px-2 py-2 text-xs text-white" /></div></label>; }
function ResponsiveNumber({ label, value, viewport, onChange, min, max, step = 1 }: { label: string; value: { desktop: number; tablet?: number; mobile?: number }; viewport: EditorBreakpoint; onChange: (value: number) => void; min?: number; max?: number; step?: number }) { return <NumberField label={`${label} · ${viewport}`} value={valueForBreakpoint(value, viewport)} min={min} max={max} step={step} onChange={onChange} />; }
function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { const hex = /^#[0-9a-f]{6}$/i.test(value); return <label className="block text-[10px] font-bold text-white/55">{label}<div className="mt-1 flex gap-2">{hex ? <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-9 w-11 rounded border-0 bg-transparent" /> : null}<input value={value} onChange={(e) => onChange(e.target.value)} className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-xs text-white" /></div></label>; }
function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) { return <label className="block text-[10px] font-bold text-white/55">{label}<select value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-[#0d2032] px-3 py-2 text-xs text-white">{options.map((option) => <option key={option}>{option}</option>)}</select></label>; }
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) { return <button onClick={() => onChange(!checked)} className="flex w-full items-center justify-between rounded-lg border border-white/10 px-3 py-2 text-xs text-white/70"><span>{label}</span><span className={`h-5 w-9 rounded-full p-0.5 transition ${checked ? "bg-[#3ea6e8]" : "bg-white/15"}`}><span className={`block h-4 w-4 rounded-full bg-white transition ${checked ? "translate-x-4" : ""}`} /></span></button>; }
function SmallButton({ children, onClick, disabled = false }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) { return <button disabled={disabled} onClick={onClick} className="rounded-lg border border-white/10 px-3 py-2 text-[10px] font-black uppercase text-white/60 hover:bg-white/5 disabled:opacity-25">{children}</button>; }
