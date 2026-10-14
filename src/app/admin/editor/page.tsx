"use client";
import { displayLabel } from "@/lib/displayLabels";


import { useCallback, useEffect, useMemo, useState, useRef, type ReactNode } from "react";
import Link from "next/link";
import styles from "./editor.module.css";
import type {CustomHomeBlock} from "@/lib/siteEditor";
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
  hero: "Título de portada", news: "Noticias + tabla", awards: "Premios", competitions: "Competiciones",
  match: "Próximos partidos", stats: "Estadísticas", community: "Comunidad",
};
const VIEWPORT_WIDTH: Record<EditorBreakpoint, number> = { desktop: 1440, tablet: 900, mobile: 390 };
const FONT_OPTIONS = [["inherit", "Tema del sitio"], ["Arial, sans-serif", "Arial"], ["Inter, Arial, sans-serif", "Inter"], ["Georgia, serif", "Georgia"], ["'Arial Black', Arial, sans-serif", "Display pesada"]];
const SHADOW_OPTIONS = [["none", "Sin sombra"], ["0 8px 24px rgba(0,0,0,.10)", "Suave"], ["0 18px 50px rgba(11,39,71,.18)", "Editorial"], ["0 24px 70px rgba(0,0,0,.28)", "Profunda"]];

export default function SiteEditorPage() {
  const [document, setDocument] = useState<HomeEditorDocument>(() => structuredClone(DEFAULT_HOME_EDITOR_DOCUMENT));
  const [customId,setCustomId]=useState<string|null>(null);
  const [blockType,setBlockType]=useState<CustomHomeBlock["type"]>("text");
  const [selectedSection, setSelectedSection] = useState<HomeSectionId>("hero");
  const [selectedElement, setSelectedElement] = useState<HomeEditorElementId | null>("hero.title");
  const [editingGlobal, setEditingGlobal] = useState(false);
  const [viewport, setViewport] = useState<EditorBreakpoint>("desktop");
  const [zoom, setZoom] = useState(100);
  const [autoFit,setAutoFit]=useState(true);
  const [availableWidth,setAvailableWidth]=useState(600);
  const [leftOpen,setLeftOpen]=useState(false);
  const [rightOpen,setRightOpen]=useState(false);
  const canvasArea=useRef<HTMLElement>(null);
  const [previewHeight,setPreviewHeight]=useState(1000);
  const previewContent=useRef<HTMLDivElement>(null);
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
      if(!draftResult.data?.document && !publishedResult.data?.document){const {getActiveLocalLeague}=await import("@/lib/localLeagueClient");const league=getActiveLocalLeague();if(league){initial.hero.title=league.name;initial.hero.subtitle="Partidos, noticias y estadísticas de tu liga.";}}
      setDocument(initial); setUserId(user.id); setPublishedVersion(publishedResult.data?.version_number ?? null); setStatus("ready");
      void loadVersions();
      if (!draftResult.data) await supabase.from("site_editor_drafts").upsert({ page_key: "home", document: initial, updated_by: user.id, updated_at: new Date().toISOString() }, {onConflict: "page_key"});
    }
    void init(); return () => { active = false; };
  }, [loadVersions]);

  const saveDraft = useCallback(async (showMessage = true) => {
    if (!userId) return false;
    setSaving(true);
    const { error } = await supabase.from("site_editor_drafts").upsert({ page_key: "home", document, updated_by: userId, updated_at: new Date().toISOString() }, {onConflict: "page_key"});
    setSaving(false);
    if (error) { setMessage(`No se pudo guardar: ${error.message}`); return false; }
    const check=await supabase.from("site_editor_drafts").select("document").eq("page_key","home").single(); if(check.error || JSON.stringify(check.data?.document?.blocks)!==JSON.stringify(document.blocks)){setMessage("No pudimos verificar el borrador guardado. Volvé a guardar.");return false;} setDirty(false); setLastSaved(new Date()); if (showMessage) setMessage("Borrador guardado."); return true;
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
    setSaving(true);
    const { data, error } = await supabase.rpc("publish_site_page", { p_page_key: "home" });
    if (error) { setSaving(false); return setMessage(`No se pudo publicar: ${error.message}`); }

    const expectedVersion = Number(data);
    const [{ data: publishedCheck, error: publishedCheckError }, { data: versionCheck, error: versionCheckError }] = await Promise.all([
      supabase.from("site_public_pages").select("version_number,published_at").eq("page_key", "home").maybeSingle(),
      supabase.from("site_editor_versions").select("version_number").eq("page_key", "home").eq("version_number", expectedVersion).maybeSingle(),
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
      console.error("[Liga editor] La publicación de inicio no pudo verificarse", {
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

  function selectSection(id: HomeSectionId) { setCustomId(null); setRightOpen(true);setLeftOpen(false); setEditingGlobal(false); setSelectedSection(id); setSelectedElement(null); setTab("layout"); }
  function selectElement(id: HomeEditorElementId) { setCustomId(null);
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
      if (name === "clean") { draft.global.pageBackground = "#f5f6f8"; draft.global.sectionGap = { desktop: 24, tablet: 20, mobile: 16 }; }
      if (name === "glass") { draft.global.pageBackground = "#eef5f9"; draft.global.sectionGap = { desktop: 22, tablet: 18, mobile: 15 }; }
      if (name === "compact") { draft.global.sectionGap = { desktop: 14, tablet: 12, mobile: 10 }; draft.awards.padding = { desktop: 16, tablet: 14, mobile: 12 }; }
    });
  }

  const customBlock=document.blocks.find(b=>b.id===customId);
  function addBlock(){const id=crypto.randomUUID();commit(d=>{d.blocks.push({id,type:blockType,title:blockType==="divider"?"":"Nuevo bloque",body:"",image:"",alt:"",label:"Ver más",href:"/fixture",after:"news",visible:true,tone:"light",align:"left",padding:48});});setCustomId(id);setRightOpen(true);setLeftOpen(false);}
  function updateBlock(patch:Partial<CustomHomeBlock>){commit(d=>{const b=d.blocks.find(b=>b.id===customId);if(b)Object.assign(b,patch);});}
  function moveBlock(id:string,direction:number){commit(d=>{const i=d.blocks.findIndex(b=>b.id===id),j=i+direction;if(j>=0&&j<d.blocks.length)[d.blocks[i],d.blocks[j]]=[d.blocks[j],d.blocks[i]];});}
  const selectedStyle = selectedElement ? document.elements[selectedElement] : null;
  const selectedSectionStyle = document.sections[selectedSection];
  const targetName = customBlock ? customBlock.title||"Separador" : editingGlobal ? "Página" : selectedElement ? HOME_ELEMENT_LABELS[selectedElement] : SECTION_LABELS[selectedSection];
  const canvasWidth = VIEWPORT_WIDTH[viewport];
  const fitScale=Math.min(1,Math.max(.1,(availableWidth-32)/canvasWidth));
  const canvasScale=autoFit?fitScale:zoom/100;
  const displayedZoom=Math.round(canvasScale*100);
  useEffect(()=>{
    if(status!=="ready")return;
    const area=canvasArea.current,content=previewContent.current;if(!area||!content)return;
    const observer=new ResizeObserver(()=>{setAvailableWidth(area.clientWidth);setPreviewHeight(content.offsetHeight);});
    observer.observe(area);observer.observe(content);setAvailableWidth(area.clientWidth);setPreviewHeight(content.offsetHeight);
    return()=>observer.disconnect();
  },[status]);
  function changeZoom(delta:number){setZoom(Math.max(10,Math.min(150,displayedZoom+delta)));setAutoFit(false);}

  const contentEditor = useMemo(() => {
    if (!selectedElement) return null;
    switch (selectedElement) {
      case "hero.title": return { label: "Título de portada", value: document.hero.title, set: (value: string) => commit((d) => { d.hero.title = value; }) };
      case "competitions.heading": return { label: "Título de la sección", value: document.competitions.title, set: (value: string) => commit((d) => { d.competitions.title = value; }) };
      case "awards.heading": return { label: "Título de la sección", value: document.awards.title, set: (value: string) => commit((d) => { d.awards.title = value; }) };
      default: return null;
    }
  }, [document, selectedElement]);

  if (status === "loading") return <main className="flex min-h-screen items-center justify-center bg-[#171717] text-white"><p className="font-black uppercase tracking-[0.18em]">Abriendo editor visual…</p></main>;
  if (status === "denied") return <main className="flex min-h-screen items-center justify-center bg-[#171717] px-6 text-white"><div className="max-w-lg rounded-3xl border border-white/10 bg-white/[0.06] p-8 text-center"><p className="text-xs font-black uppercase tracking-[0.2em] text-[#bdbdbd]">Editor privado</p><h1 className="mt-3 text-3xl font-black uppercase">Acceso no autorizado</h1><p className="mt-3 text-sm leading-6 text-white/60">Esta herramienta está restringida al propietario del editor.</p><Link href="/admin" className="mt-6 inline-flex rounded-xl bg-white px-5 py-3 text-xs font-black uppercase text-[#242424]">Volver al panel</Link></div></main>;

  return <main className={styles.editor+" h-screen overflow-hidden bg-[#171717] text-white"}>
    <header className={styles.toolbar+" flex h-16 items-center justify-between border-b border-white/10 bg-[#222222] px-3 md:px-4"}>
      <div className="flex min-w-0 items-center gap-3"><Link href="/admin" className="rounded-lg border border-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-white/65">← Admin</Link><div className="hidden sm:block"><p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#bdbdbd]">Liga Visual Editor</p><h1 className="text-sm font-black uppercase">Inicio</h1></div><span className={`hidden rounded-full px-3 py-1 text-[10px] font-black uppercase lg:inline-flex ${dirty ? "bg-[#bdbdbd]/15 text-[#bdbdbd]" : "bg-[#bdbdbd]/15 text-[#bdbdbd]"}`}>{dirty ? "Cambios sin publicar" : "Borrador sincronizado"}</span></div>
      <div className="flex items-center gap-2"><button onClick={undo} disabled={!history.length} className="rounded-lg border border-white/10 px-3 py-2 disabled:opacity-30" aria-label="Deshacer">Deshacer</button><button onClick={redo} disabled={!future.length} className="rounded-lg border border-white/10 px-3 py-2 disabled:opacity-30" aria-label="Rehacer">Rehacer</button><button onClick={() => void saveDraft()} disabled={saving} className="hidden rounded-xl border border-white/15 px-4 py-2 text-[10px] font-black uppercase xl:block">Guardar</button><button onClick={() => void publish()} disabled={saving} className="rounded-xl bg-[#bdbdbd] px-4 py-2 text-[10px] font-black uppercase text-[#ffffff]">Publicar</button></div>
    </header>

    <div className={styles.workspace} data-left-open={leftOpen} data-right-open={rightOpen}>
      <aside className={styles.leftPanel+" overflow-y-auto border-r border-white/10 bg-[#222222] p-3"}>
        <button onClick={() => { setCustomId(null); setEditingGlobal(true); setSelectedElement(null); setTab("style"); }} className={`mb-3 flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-xs font-black ${editingGlobal ? "bg-[#bdbdbd]" : "bg-white/[0.04] text-white/70"}`}><span>Página</span><span className="text-white/35">Global</span></button>
        <section className={styles.blockLibrary}><h2>Agregar un bloque</h2><label>Tipo<select value={blockType} onChange={e=>setBlockType(e.target.value as CustomHomeBlock["type"])}><option value="text">Texto</option><option value="image">Imagen y texto</option><option value="banner">Llamada a la acción</option><option value="divider">Separador</option></select></label><button type="button" onClick={addBlock}>Agregar bloque</button></section>
        <div className={styles.customList}>{document.blocks.map((b,i)=><div key={b.id} data-selected={b.id===customId}><button type="button" onClick={()=>setCustomId(b.id)}>{b.title||"Separador"}</button><div><button type="button" disabled={i===0} onClick={()=>moveBlock(b.id,-1)} aria-label={"Subir "+(b.title||"bloque")}>Subir</button><button type="button" disabled={i===document.blocks.length-1} onClick={()=>moveBlock(b.id,1)} aria-label={"Bajar "+(b.title||"bloque")}>Bajar</button></div></div>)}</div>
        <div className="mb-2 flex items-center justify-between px-2"><p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/45">Capas</p><span className="text-[10px] text-white/30">arrastrables</span></div>
        <div className="space-y-2">{document.order.filter((id) => id !== "stats" && id !== "community").map((id) => <div key={id} draggable onDragStart={() => setDraggedSection(id)} onDragOver={(e) => e.preventDefault()} onDrop={() => { if (draggedSection) moveSection(draggedSection, id); setDraggedSection(null); }} className={`rounded-xl border ${selectedSection === id && !editingGlobal ? "border-[#bdbdbd]/50 bg-[#bdbdbd]/35" : "border-white/5 bg-white/[0.025]"}`}><button onClick={() => selectSection(id)} className="flex w-full items-center justify-between px-3 py-3 text-left text-xs font-bold"><span className="flex items-center gap-2"><span className="cursor-grab text-white/25">⋮⋮</span>{SECTION_LABELS[id]}</span><span className={document.sections[id].visible ? "text-[#bdbdbd]" : "text-white/25"}>{document.sections[id].visible ? "●" : "○"}</span></button><div className="border-t border-white/5 px-2 py-1.5">{HOME_SECTION_ELEMENTS[id].map((elementId) => <button key={elementId} onClick={() => selectElement(elementId)} className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[11px] ${selectedElement === elementId ? "bg-[#f0b83f]/15 text-[#bdbdbd]" : "text-white/45 hover:bg-white/5"}`}><span>{HOME_ELEMENT_LABELS[elementId]}</span><span>{document.elements[elementId].visible ? "◇" : "–"}</span></button>)}</div></div>)}</div>
        <div className="mt-5 border-t border-white/10 pt-4"><p className="px-2 text-[10px] font-black uppercase tracking-[0.16em] text-white/45">Presets</p><div className="mt-2 grid grid-cols-3 gap-1.5"><SmallButton onClick={() => applyPreset("clean")}>Claro</SmallButton><SmallButton onClick={() => applyPreset("glass")}>Suave</SmallButton><SmallButton onClick={() => applyPreset("compact")}>Compacto</SmallButton></div></div>
      </aside>

      <section ref={canvasArea} className={styles.canvasArea} aria-label="Vista previa de la página">
       <div className={styles.canvasToolbar}><div><button type="button" aria-expanded={leftOpen} onClick={()=>{setLeftOpen(!leftOpen);setRightOpen(false);}}>Bloques</button><button type="button" aria-expanded={rightOpen} onClick={()=>{setRightOpen(!rightOpen);setLeftOpen(false);}}>Inspector</button></div><div className={styles.viewportControls}>{(["desktop","tablet","mobile"] as EditorBreakpoint[]).map(item=><button key={item} type="button" aria-pressed={viewport===item} onClick={()=>{setViewport(item);setAutoFit(true);}}>{item==="desktop"?"Escritorio":item==="tablet"?"Tablet":"Celular"}</button>)}</div><div><button type="button" aria-label="Alejar vista previa" onClick={()=>changeZoom(-5)}>−</button><span>{displayedZoom}%</span><button type="button" aria-label="Acercar vista previa" onClick={()=>changeZoom(5)}>+</button><button type="button" aria-pressed={autoFit} onClick={()=>setAutoFit(true)}>Ajustar</button></div></div>
       <div className={styles.canvasScroll}><div style={{width:canvasWidth*canvasScale,height:previewHeight*canvasScale,marginInline:"auto",position:"relative",flexShrink:0}}><div ref={previewContent} className="origin-top-left overflow-hidden rounded-2xl bg-[#f5f6f8]" style={{width:canvasWidth,transform:"scale("+canvasScale+")",transformOrigin:"top left"}}><HomeLeaguePortal editorDocument={document} editorMode editorBreakpoint={viewport} selectedSection={selectedSection} selectedElement={selectedElement} onSelectSection={selectSection} onSelectElement={selectElement}/></div></div></div>
      </section>

      <aside className={styles.rightPanel+" overflow-y-auto border-l border-white/10 bg-[#222222]"}><div className="sticky top-0 z-20 border-b border-white/10 bg-[#222222] px-4 pt-4"><p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#bdbdbd]">Inspector</p><h2 className="mt-1 truncate text-lg font-black">{targetName}</h2><div className="mt-3 flex overflow-x-auto">{(["content", "style", "layout", "advanced", "history"] as InspectorTab[]).map((item) => <button key={item} onClick={() => setTab(item)} className={`border-b-2 px-2.5 py-2 text-[9px] font-black uppercase ${tab === item ? "border-[#bdbdbd] text-white" : "border-transparent text-white/35"}`}>{item}</button>)}</div></div>
        <div className="space-y-4 p-4">{message ? <div className="rounded-xl border border-[#bdbdbd]/20 bg-[#bdbdbd]/10 px-3 py-2 text-[11px] leading-5 text-[#bdbdbd]">{message}</div> : null}
          {customBlock?<InspectorSection title="Editar bloque"><SelectField label="Ubicación" value={customBlock.after} options={[["start","Antes de la portada"],["hero","Después de la portada"],["news","Después de noticias"],["match","Después de partidos"]]} onChange={v=>updateBlock({after:v as CustomHomeBlock["after"]})}/>{customBlock.type!=="divider"&&<><TextField label="Título del bloque" value={customBlock.title} onChange={title=>updateBlock({title})}/><TextArea label="Texto del bloque" value={customBlock.body} onChange={body=>updateBlock({body})}/></>}{customBlock.type==="image"&&<><TextField label="URL de imagen" value={customBlock.image} onChange={image=>updateBlock({image})}/><TextField label="Descripción de imagen" value={customBlock.alt} onChange={alt=>updateBlock({alt})}/></>}{customBlock.type==="banner"&&<><TextField label="Texto del botón" value={customBlock.label} onChange={label=>updateBlock({label})}/><TextField label="Enlace del botón" value={customBlock.href} onChange={href=>updateBlock({href})}/></>}<SelectField label="Fondo liso" value={customBlock.tone} options={[["light","Claro"],["gray","Gris"],["dark","Oscuro"]]} onChange={v=>updateBlock({tone:v as CustomHomeBlock["tone"]})}/><SelectField label="Alineación" value={customBlock.align} options={[["left","Izquierda"],["center","Centro"]]} onChange={v=>updateBlock({align:v as CustomHomeBlock["align"]})}/><NumberField label="Espaciado" value={customBlock.padding} min={0} max={160} onChange={padding=>updateBlock({padding})}/><Toggle label="Mostrar bloque" checked={customBlock.visible} onChange={visible=>updateBlock({visible})}/><SmallButton onClick={()=>{const id=crypto.randomUUID();commit(d=>{const i=d.blocks.findIndex(b=>b.id===customId);d.blocks.splice(i+1,0,{...structuredClone(customBlock),id,title:customBlock.title+" (copia)"});});setCustomId(id);}}>Duplicar bloque</SmallButton><SmallButton onClick={()=>{commit(d=>{d.blocks=d.blocks.filter(b=>b.id!==customId);});setCustomId(null);}}>Quitar bloque</SmallButton></InspectorSection>:null}
          {!customBlock&&<>
          {tab === "content" ? <>{editingGlobal ? <InspectorSection title="Página"><NumberField label="Ancho máximo" value={document.global.contentMaxWidth} min={900} max={2200} onChange={(v) => commit((d) => { d.global.contentMaxWidth = v; })} /><SelectField label="Tipografía global" value={document.global.fontFamily} options={FONT_OPTIONS} onChange={(v) => commit((d) => { d.global.fontFamily = v; })} /></InspectorSection> : contentEditor ? <InspectorSection title="Contenido"><TextArea label={contentEditor.label} value={contentEditor.value} onChange={contentEditor.set} /></InspectorSection> : <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs leading-5 text-white/45">Este bloque usa los datos de tu liga. Sus estilos y layout sí se pueden modificar.</div>}</> : null}

          {tab === "style" ? editingGlobal ? <InspectorSection title="Estilo global"><ColorField label="Fondo" value={document.global.pageBackground} onChange={(v) => commit((d) => { d.global.pageBackground = v; })} /><ColorField label="Acento" value={document.global.accentColor} onChange={(v) => commit((d) => { d.global.accentColor = v; })} /><Toggle label="Animaciones" checked={document.global.animationEnabled} onChange={(v) => commit((d) => { d.global.animationEnabled = v; })} /></InspectorSection> : selectedStyle ? <><InspectorSection title="Elemento"><Toggle label="Visible" checked={selectedStyle.visible} onChange={(v) => updateElement((s) => { s.visible = v; })} /><ColorField label="Fondo" value={selectedStyle.background} allowText onChange={(v) => updateElement((s) => { s.background = v; })} /><ColorField label="Texto" value={selectedStyle.color} allowText onChange={(v) => updateElement((s) => { s.color = v; })} /><NumberField label="Opacidad" value={selectedStyle.opacity} min={0} max={1} step={.05} onChange={(v) => updateElement((s) => { s.opacity = v; })} /><NumberField label="Borde" value={selectedStyle.borderWidth} min={0} max={12} onChange={(v) => updateElement((s) => { s.borderWidth = v; })} /><ColorField label="Color borde" value={selectedStyle.borderColor} allowText onChange={(v) => updateElement((s) => { s.borderColor = v; })} /><SelectField label="Sombra" value={selectedStyle.shadow} options={SHADOW_OPTIONS} onChange={(v) => updateElement((s) => { s.shadow = v; })} /></InspectorSection><InspectorSection title="Tipografía"><ResponsiveNumber label="Tamaño" value={selectedStyle.fontSize} breakpoint={viewport} min={0} max={160} onChange={(v) => updateElement((s) => { s.fontSize = setResponsiveValue(s.fontSize, viewport, v); })} /><NumberField label="Peso" value={selectedStyle.fontWeight} min={0} max={900} step={100} onChange={(v) => updateElement((s) => { s.fontWeight = v; })} /><NumberField label="Interlineado" value={selectedStyle.lineHeight} min={0} max={3} step={.05} onChange={(v) => updateElement((s) => { s.lineHeight = v; })} /><NumberField label="Tracking" value={selectedStyle.letterSpacing} min={-.2} max={.5} step={.01} onChange={(v) => updateElement((s) => { s.letterSpacing = v; })} /><SelectField label="Alineación" value={selectedStyle.textAlign} options={[["left", "Izquierda"], ["center", "Centro"], ["right", "Derecha"]]} onChange={(v) => updateElement((s) => { s.textAlign = v as ElementStyle["textAlign"]; })} /><SelectField label="Transformación" value={selectedStyle.textTransform} options={[["none", "Normal"], ["uppercase", "Mayúsculas"], ["lowercase", "Minúsculas"], ["capitalize", "Capitalizar"]]} onChange={(v) => updateElement((s) => { s.textTransform = v as ElementStyle["textTransform"]; })} /></InspectorSection></> : <InspectorSection title="Sección"><Toggle label="Visible" checked={selectedSectionStyle.visible} onChange={(v) => updateSection((s) => { s.visible = v; })} /><ColorField label="Fondo" value={selectedSectionStyle.background} allowText onChange={(v) => updateSection((s) => { s.background = v; })} /><ColorField label="Texto" value={selectedSectionStyle.textColor} allowText onChange={(v) => updateSection((s) => { s.textColor = v; })} /><NumberField label="Borde" value={selectedSectionStyle.borderWidth} min={0} max={12} onChange={(v) => updateSection((s) => { s.borderWidth = v; })} /><ColorField label="Color borde" value={selectedSectionStyle.borderColor} allowText onChange={(v) => updateSection((s) => { s.borderColor = v; })} /><SelectField label="Sombra" value={selectedSectionStyle.shadow} options={SHADOW_OPTIONS} onChange={(v) => updateSection((s) => { s.shadow = v; })} /></InspectorSection> : null}

          {tab === "layout" ? editingGlobal ? <InspectorSection title={`Responsive · ${viewport}`}><ResponsiveNumber label="Gap secciones" value={document.global.sectionGap} breakpoint={viewport} min={0} max={120} onChange={(v) => commit((d) => { d.global.sectionGap = setResponsiveValue(d.global.sectionGap, viewport, v); })} /><NumberField label="Ancho máximo" value={document.global.contentMaxWidth} min={900} max={2200} onChange={(v) => commit((d) => { d.global.contentMaxWidth = v; })} /></InspectorSection> : selectedStyle ? <InspectorSection title={`Responsive · ${viewport}`}><ResponsiveNumber label="Ancho %" value={selectedStyle.width} breakpoint={viewport} min={1} max={100} onChange={(v) => updateElement((s) => { s.width = setResponsiveValue(s.width, viewport, v); })} /><ResponsiveNumber label="Máximo px" value={selectedStyle.maxWidth} breakpoint={viewport} min={40} max={3000} onChange={(v) => updateElement((s) => { s.maxWidth = setResponsiveValue(s.maxWidth, viewport, v); })} /><ResponsiveNumber label="Padding X" value={selectedStyle.paddingX} breakpoint={viewport} min={0} max={200} onChange={(v) => updateElement((s) => { s.paddingX = setResponsiveValue(s.paddingX, viewport, v); })} /><ResponsiveNumber label="Padding Y" value={selectedStyle.paddingY} breakpoint={viewport} min={0} max={200} onChange={(v) => updateElement((s) => { s.paddingY = setResponsiveValue(s.paddingY, viewport, v); })} /><ResponsiveNumber label="Margen arriba" value={selectedStyle.marginTop} breakpoint={viewport} min={-200} max={300} onChange={(v) => updateElement((s) => { s.marginTop = setResponsiveValue(s.marginTop, viewport, v); })} /><ResponsiveNumber label="Margen abajo" value={selectedStyle.marginBottom} breakpoint={viewport} min={-200} max={300} onChange={(v) => updateElement((s) => { s.marginBottom = setResponsiveValue(s.marginBottom, viewport, v); })} /><ResponsiveNumber label="Radio" value={selectedStyle.radius} breakpoint={viewport} min={0} max={120} onChange={(v) => updateElement((s) => { s.radius = setResponsiveValue(s.radius, viewport, v); })} /></InspectorSection> : <InspectorSection title={`Sección · ${viewport}`}><ResponsiveNumber label="Padding X" value={selectedSectionStyle.paddingX} breakpoint={viewport} min={0} max={200} onChange={(v) => updateSection((s) => { s.paddingX = setResponsiveValue(s.paddingX, viewport, v); })} /><ResponsiveNumber label="Padding Y" value={selectedSectionStyle.paddingY} breakpoint={viewport} min={0} max={200} onChange={(v) => updateSection((s) => { s.paddingY = setResponsiveValue(s.paddingY, viewport, v); })} /><ResponsiveNumber label="Margen arriba" value={selectedSectionStyle.marginTop} breakpoint={viewport} min={-200} max={300} onChange={(v) => updateSection((s) => { s.marginTop = setResponsiveValue(s.marginTop, viewport, v); })} /><ResponsiveNumber label="Margen abajo" value={selectedSectionStyle.marginBottom} breakpoint={viewport} min={-200} max={300} onChange={(v) => updateSection((s) => { s.marginBottom = setResponsiveValue(s.marginBottom, viewport, v); })} /><ResponsiveNumber label="Radio" value={selectedSectionStyle.radius} breakpoint={viewport} min={0} max={120} onChange={(v) => updateSection((s) => { s.radius = setResponsiveValue(s.radius, viewport, v); })} /></InspectorSection> : null}

          {tab === "advanced" ? selectedStyle ? <><InspectorSection title={`Transformar · ${viewport}`}><ResponsiveNumber label="Mover X" value={selectedStyle.translateX} breakpoint={viewport} min={-500} max={500} onChange={(v) => updateElement((s) => { s.translateX = setResponsiveValue(s.translateX, viewport, v); })} /><ResponsiveNumber label="Mover Y" value={selectedStyle.translateY} breakpoint={viewport} min={-500} max={500} onChange={(v) => updateElement((s) => { s.translateY = setResponsiveValue(s.translateY, viewport, v); })} /><ResponsiveNumber label="Escala" value={selectedStyle.scale} breakpoint={viewport} min={.2} max={3} step={.05} onChange={(v) => updateElement((s) => { s.scale = setResponsiveValue(s.scale, viewport, v); })} /><ResponsiveNumber label="Rotación" value={selectedStyle.rotate} breakpoint={viewport} min={-180} max={180} onChange={(v) => updateElement((s) => { s.rotate = setResponsiveValue(s.rotate, viewport, v); })} /></InspectorSection><InspectorSection title="Herramientas"><div className="grid grid-cols-2 gap-2"><SmallButton onClick={() => setClipboard(structuredClone(selectedStyle))}>Copiar estilo</SmallButton><SmallButton disabled={!clipboard} onClick={() => clipboard && updateElement((s) => Object.assign(s, structuredClone(clipboard)))}>Pegar estilo</SmallButton><SmallButton onClick={() => selectedElement && updateElement((s) => Object.assign(s, structuredClone(DEFAULT_HOME_EDITOR_DOCUMENT.elements[selectedElement])))}>Reset</SmallButton><SmallButton onClick={() => updateElement((s) => { s.visible = !s.visible; })}>{selectedStyle.visible ? "Ocultar" : "Mostrar"}</SmallButton></div></InspectorSection></> : <InspectorSection title="Documento"><p className="text-[11px] leading-5 text-white/45">Ctrl/Cmd + S guarda · Ctrl/Cmd + Z deshace · Ctrl/Cmd + Y rehace. Los valores responsive son independientes.</p></InspectorSection> : null}

          {tab === "history" ? <InspectorSection title="Versiones publicadas"><div className="space-y-2">{versions.length ? versions.map((version) => <button key={version.id} onClick={() => restoreVersion(version)} className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 text-left"><div><p className="text-xs font-black">Versión {version.version_number}</p><p className="mt-1 text-[9px] text-white/35">{new Date(version.created_at).toLocaleString()}</p></div><span className="text-[10px] font-black text-[#bdbdbd]">Restaurar</span></button>) : <p className="text-xs text-white/40">Sin versiones todavía.</p>}</div></InspectorSection> : null}
          </>}
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
function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[][]; onChange: (value: string) => void }) { return <label className="block"><span className="mb-1 block text-[10px] font-bold text-white/50">{label}</span><select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg border border-white/10 bg-[#292929] px-3 py-2 text-xs text-white outline-none">{options.map(([v, l]) => <option key={v} value={v}>{displayLabel(l)}</option>)}</select></label>; }
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) { return <button type="button" onClick={() => onChange(!checked)} className="flex w-full items-center justify-between"><span className="text-[10px] font-bold text-white/50">{label}</span><span className={`relative h-5 w-9 rounded-full ${checked ? "bg-[#bdbdbd]" : "bg-white/15"}`}><span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white ${checked ? "left-[18px]" : "left-0.5"}`} /></span></button>; }
