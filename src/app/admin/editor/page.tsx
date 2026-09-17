"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import HomeLeaguePortal from "@/components/home/HomeLeaguePortal";
import { supabase } from "@/lib/supabase";
import {
  DEFAULT_HOME_EDITOR_DOCUMENT,
  normalizeHomeEditorDocument,
  type HomeEditorDocument,
  type HomeSectionId,
} from "@/lib/siteEditor";

type Viewport = "desktop" | "tablet" | "mobile";

const LABELS: Record<HomeSectionId, string> = {
  hero: "Hero",
  news: "Noticias + tabla",
  awards: "Premios",
  competitions: "Competiciones / copas",
  match: "Partido destacado",
  stats: "Estadísticas",
  community: "Comunidad",
};

const VIEWPORT_WIDTH: Record<Viewport, string> = {
  desktop: "100%",
  tablet: "900px",
  mobile: "390px",
};

export default function SiteEditorPage() {
  const [document, setDocument] = useState<HomeEditorDocument>(structuredClone(DEFAULT_HOME_EDITOR_DOCUMENT));
  const [selected, setSelected] = useState<HomeSectionId>("hero");
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const [history, setHistory] = useState<HomeEditorDocument[]>([]);
  const [future, setFuture] = useState<HomeEditorDocument[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "denied">("loading");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [publishedVersion, setPublishedVersion] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function init() {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth.user;
      if (!user || !active) {
        setStatus("denied");
        return;
      }

      const { data: owner } = await supabase
        .from("site_editor_owners")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!owner || !active) {
        setStatus("denied");
        return;
      }

      const [draftResult, publishedResult] = await Promise.all([
        supabase.from("site_editor_drafts").select("document,updated_at").eq("page_key", "home").maybeSingle(),
        supabase.from("site_public_pages").select("document,version_number").eq("page_key", "home").maybeSingle(),
      ]);

      if (!active) return;
      const initial = normalizeHomeEditorDocument(
        draftResult.data?.document ?? publishedResult.data?.document ?? DEFAULT_HOME_EDITOR_DOCUMENT,
      );
      setDocument(initial);
      setUserId(user.id);
      setPublishedVersion(publishedResult.data?.version_number ?? null);
      setStatus("ready");

      if (!draftResult.data) {
        await supabase.from("site_editor_drafts").upsert({
          page_key: "home",
          document: initial,
          updated_by: user.id,
          updated_at: new Date().toISOString(),
        });
      }
    }

    void init();
    return () => {
      active = false;
    };
  }, []);

  async function saveDraft(showMessage = true) {
    if (!userId) return false;
    setSaving(true);
    const { error } = await supabase.from("site_editor_drafts").upsert({
      page_key: "home",
      document,
      updated_by: userId,
      updated_at: new Date().toISOString(),
    });
    setSaving(false);

    if (error) {
      setMessage(`No se pudo guardar: ${error.message}`);
      return false;
    }

    setDirty(false);
    setLastSaved(new Date());
    if (showMessage) setMessage("Borrador guardado.");
    return true;
  }

  useEffect(() => {
    if (status !== "ready" || !dirty || !userId) return;
    const timer = window.setTimeout(() => void saveDraft(false), 1400);
    return () => window.clearTimeout(timer);
  }, [document, dirty, status, userId]);

  function commit(mutator: (draft: HomeEditorDocument) => void) {
    setDocument((current) => {
      const next = structuredClone(current);
      mutator(next);
      setHistory((items) => [...items.slice(-79), current]);
      setFuture([]);
      setDirty(true);
      return next;
    });
  }

  function undo() {
    const previous = history.at(-1);
    if (!previous) return;
    setHistory((items) => items.slice(0, -1));
    setFuture((items) => [document, ...items.slice(0, 79)]);
    setDocument(previous);
    setDirty(true);
  }

  function redo() {
    const next = future[0];
    if (!next) return;
    setFuture((items) => items.slice(1));
    setHistory((items) => [...items.slice(-79), document]);
    setDocument(next);
    setDirty(true);
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
    if (error) {
      setMessage(`No se pudo publicar: ${error.message}`);
      return;
    }
    setPublishedVersion(Number(data));
    setMessage(`Publicado correctamente · versión ${Number(data)}`);
  }

  const selectedVisible = document.sections[selected].visible;
  const selectedIndex = document.order.indexOf(selected);
  const changesLabel = dirty ? "Cambios sin publicar" : "Borrador sincronizado";

  if (status === "loading") {
    return <main className="flex min-h-screen items-center justify-center bg-[#091727] text-white"><p className="font-black uppercase tracking-[0.18em]">Abriendo editor visual…</p></main>;
  }

  if (status === "denied") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#091727] px-6 text-white">
        <div className="max-w-lg rounded-3xl border border-white/10 bg-white/[0.06] p-8 text-center">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#6dbef2]">Editor privado</p>
          <h1 className="mt-3 text-3xl font-black uppercase">Acceso no autorizado</h1>
          <p className="mt-3 text-sm leading-6 text-white/60">Esta herramienta está restringida al propietario configurado del sitio.</p>
          <Link href="/admin" className="mt-6 inline-flex rounded-xl bg-white px-5 py-3 text-xs font-black uppercase text-[#102f55]">Volver al panel</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="h-screen overflow-hidden bg-[#08131f] text-white">
      <header className="flex h-16 items-center justify-between border-b border-white/10 bg-[#0b1b2b] px-4">
        <div className="flex min-w-0 items-center gap-4">
          <Link href="/admin" className="rounded-lg border border-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-white/65 hover:bg-white/5">← Admin</Link>
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#6dbef2]">APA Visual Editor</p>
            <h1 className="text-sm font-black uppercase">Inicio</h1>
          </div>
          <span className={`hidden rounded-full px-3 py-1 text-[10px] font-black uppercase md:inline-flex ${dirty ? "bg-[#f1b84b]/15 text-[#ffd986]" : "bg-[#57d49a]/15 text-[#83efba]"}`}>{changesLabel}</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden rounded-xl border border-white/10 bg-black/20 p-1 sm:flex">
            {(["desktop", "tablet", "mobile"] as Viewport[]).map((item) => (
              <button key={item} onClick={() => setViewport(item)} className={`rounded-lg px-3 py-2 text-[10px] font-black uppercase ${viewport === item ? "bg-white text-[#102f55]" : "text-white/55 hover:text-white"}`}>{item}</button>
            ))}
          </div>
          <button onClick={undo} disabled={!history.length} className="rounded-lg border border-white/10 px-3 py-2 text-sm disabled:opacity-30">↶</button>
          <button onClick={redo} disabled={!future.length} className="rounded-lg border border-white/10 px-3 py-2 text-sm disabled:opacity-30">↷</button>
          <button onClick={() => void saveDraft()} disabled={saving} className="hidden rounded-xl border border-white/15 px-4 py-2 text-[10px] font-black uppercase text-white/75 hover:bg-white/5 md:block">Guardar borrador</button>
          <button onClick={() => void publish()} disabled={saving} className="rounded-xl bg-[#3ea6e8] px-4 py-2 text-[10px] font-black uppercase text-[#071522] hover:bg-[#69bdf0] disabled:opacity-50">Publicar</button>
        </div>
      </header>

      <div className="grid h-[calc(100vh-64px)] grid-cols-[220px_minmax(0,1fr)_300px]">
        <aside className="overflow-y-auto border-r border-white/10 bg-[#0b1b2b] p-3">
          <div className="mb-3 flex items-center justify-between px-2">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/45">Capas</p>
            <span className="text-[10px] text-white/30">{document.order.length}</span>
          </div>
          <div className="space-y-1">
            {document.order.map((id) => (
              <button key={id} onClick={() => setSelected(id)} className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-xs font-bold ${selected === id ? "bg-[#245f8e] text-white" : "text-white/65 hover:bg-white/5"}`}>
                <span>{LABELS[id]}</span>
                <span className={document.sections[id].visible ? "text-[#83efba]" : "text-white/25"}>{document.sections[id].visible ? "●" : "○"}</span>
              </button>
            ))}
          </div>

          <div className="mt-5 border-t border-white/10 pt-4">
            <p className="px-2 text-[10px] font-black uppercase tracking-[0.16em] text-white/45">Documento</p>
            <div className="mt-3 space-y-2 px-2 text-[11px] text-white/50">
              <p>Versión pública: <strong className="text-white">{publishedVersion ?? "—"}</strong></p>
              <p>Undo: <strong className="text-white">{history.length}</strong></p>
              <p>{saving ? "Guardando…" : lastSaved ? `Guardado ${lastSaved.toLocaleTimeString()}` : "Autosave activo"}</p>
            </div>
          </div>
        </aside>

        <section className="overflow-auto bg-[#111d28] p-6">
          <div className="mx-auto min-h-full transition-[width] duration-200" style={{ width: VIEWPORT_WIDTH[viewport], maxWidth: "100%" }}>
            <div className="overflow-hidden rounded-2xl bg-[#f5f6f8] shadow-2xl">
              <HomeLeaguePortal editorDocument={document} editorMode selectedSection={selected} onSelectSection={setSelected} />
            </div>
          </div>
        </section>

        <aside className="overflow-y-auto border-l border-white/10 bg-[#0b1b2b] p-4">
          <div className="mb-5">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#6dbef2]">Propiedades</p>
            <h2 className="mt-1 text-xl font-black">{LABELS[selected]}</h2>
          </div>

          <InspectorSection title="Capa">
            <Toggle label="Visible" checked={selectedVisible} onChange={(checked) => commit((draft) => { draft.sections[selected].visible = checked; })} />
            <div className="grid grid-cols-2 gap-2">
              <SmallButton disabled={selectedIndex <= 0} onClick={() => moveSelected(-1)}>Subir</SmallButton>
              <SmallButton disabled={selectedIndex >= document.order.length - 1} onClick={() => moveSelected(1)}>Bajar</SmallButton>
            </div>
          </InspectorSection>

          {selected === "hero" ? (
            <InspectorSection title="Hero">
              <TextField label="Etiqueta" value={document.hero.eyebrow} onChange={(value) => commit((draft) => { draft.hero.eyebrow = value; })} />
              <TextArea label="Título" value={document.hero.title} onChange={(value) => commit((draft) => { draft.hero.title = value; })} />
              <TextArea label="Subtítulo" value={document.hero.subtitle} onChange={(value) => commit((draft) => { draft.hero.subtitle = value; })} />
              <TextField label="Botón principal" value={document.hero.primaryLabel} onChange={(value) => commit((draft) => { draft.hero.primaryLabel = value; })} />
              <TextField label="Botón secundario" value={document.hero.secondaryLabel} onChange={(value) => commit((draft) => { draft.hero.secondaryLabel = value; })} />
              <ColorField label="Fondo" value={document.hero.background} onChange={(value) => commit((draft) => { draft.hero.background = value; })} />
              <NumberField label="Radio" value={document.hero.radius.desktop} min={0} max={80} onChange={(value) => commit((draft) => { draft.hero.radius.desktop = value; })} />
              <NumberField label="Padding vertical" value={document.hero.paddingY.desktop} min={0} max={180} onChange={(value) => commit((draft) => { draft.hero.paddingY.desktop = value; })} />
              <NumberField label="Radio de tarjetas" value={document.hero.cardRadius} min={0} max={80} onChange={(value) => commit((draft) => { draft.hero.cardRadius = value; })} />
            </InspectorSection>
          ) : null}

          {selected === "awards" ? (
            <InspectorSection title="Premios">
              <TextField label="Etiqueta" value={document.awards.eyebrow} onChange={(value) => commit((draft) => { draft.awards.eyebrow = value; })} />
              <TextField label="Título" value={document.awards.title} onChange={(value) => commit((draft) => { draft.awards.title = value; })} />
              <ColorField label="Fondo" value={document.awards.background} onChange={(value) => commit((draft) => { draft.awards.background = value; })} />
              <NumberField label="Radio sección" value={document.awards.radius.desktop} min={0} max={80} onChange={(value) => commit((draft) => { draft.awards.radius.desktop = value; })} />
              <NumberField label="Padding tarjetas" value={document.awards.cardPadding} min={0} max={80} onChange={(value) => commit((draft) => { draft.awards.cardPadding = value; })} />
              <NumberField label="Alto mínimo tarjetas" value={document.awards.cardMinHeight} min={0} max={600} onChange={(value) => commit((draft) => { draft.awards.cardMinHeight = value; })} />
              <NumberField label="Radio tarjetas" value={document.awards.cardRadius} min={0} max={80} onChange={(value) => commit((draft) => { draft.awards.cardRadius = value; })} />
            </InspectorSection>
          ) : null}

          {selected === "competitions" ? (
            <InspectorSection title="Competiciones / copas">
              <TextField label="Etiqueta" value={document.competitions.eyebrow} onChange={(value) => commit((draft) => { draft.competitions.eyebrow = value; })} />
              <TextField label="Título" value={document.competitions.title} onChange={(value) => commit((draft) => { draft.competitions.title = value; })} />
              <ColorField label="Color principal" value={document.competitions.titleColor} onChange={(value) => commit((draft) => { draft.competitions.titleColor = value; })} />
              <ColorField label="Color acento" value={document.competitions.accentColor} onChange={(value) => commit((draft) => { draft.competitions.accentColor = value; })} />
              <ColorField label="Fondo tarjetas" value={document.competitions.cardBackground} onChange={(value) => commit((draft) => { draft.competitions.cardBackground = value; })} />
              <NumberField label="Padding tarjetas" value={document.competitions.cardPadding} min={0} max={80} onChange={(value) => commit((draft) => { draft.competitions.cardPadding = value; })} />
              <NumberField label="Alto mínimo tarjetas" value={document.competitions.cardMinHeight} min={0} max={600} onChange={(value) => commit((draft) => { draft.competitions.cardMinHeight = value; })} />
              <NumberField label="Radio tarjetas" value={document.competitions.cardRadius} min={0} max={80} onChange={(value) => commit((draft) => { draft.competitions.cardRadius = value; })} />
            </InspectorSection>
          ) : null}

          {selected === "stats" ? (
            <InspectorSection title="Estadísticas">
              <ColorField label="Fondo" value={document.stats.background} onChange={(value) => commit((draft) => { draft.stats.background = value; })} />
              <ColorField label="Texto" value={document.stats.textColor} onChange={(value) => commit((draft) => { draft.stats.textColor = value; })} />
              <NumberField label="Radio" value={document.stats.radius} min={0} max={80} onChange={(value) => commit((draft) => { draft.stats.radius = value; })} />
              <NumberField label="Padding" value={document.stats.cardPadding} min={0} max={80} onChange={(value) => commit((draft) => { draft.stats.cardPadding = value; })} />
            </InspectorSection>
          ) : null}

          {selected === "community" ? (
            <InspectorSection title="Comunidad">
              <TextField label="Etiqueta" value={document.community.eyebrow} onChange={(value) => commit((draft) => { draft.community.eyebrow = value; })} />
              <TextField label="Título" value={document.community.title} onChange={(value) => commit((draft) => { draft.community.title = value; })} />
              <TextField label="Botón" value={document.community.buttonLabel} onChange={(value) => commit((draft) => { draft.community.buttonLabel = value; })} />
              <ColorField label="Fondo" value={document.community.background} onChange={(value) => commit((draft) => { draft.community.background = value; })} />
              <NumberField label="Radio" value={document.community.radius} min={0} max={80} onChange={(value) => commit((draft) => { draft.community.radius = value; })} />
              <NumberField label="Padding" value={document.community.padding} min={0} max={100} onChange={(value) => commit((draft) => { draft.community.padding = value; })} />
            </InspectorSection>
          ) : null}

          {(selected === "news" || selected === "match") ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-xs leading-5 text-white/55">
              Esta sección ya puede ocultarse y reordenarse. Sus controles internos se incorporan al mismo inspector en la siguiente etapa sin tocar su lógica de datos.
            </div>
          ) : null}

          {message ? <div className="mt-4 rounded-xl border border-[#3ea6e8]/20 bg-[#3ea6e8]/10 p-3 text-xs text-[#a9dcfa]">{message}</div> : null}
        </aside>
      </div>
    </main>
  );
}

function InspectorSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-4 space-y-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <h3 className="text-[10px] font-black uppercase tracking-[0.16em] text-white/45">{title}</h3>
      {children}
    </section>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="block text-[11px] font-bold text-white/60"><span>{label}</span><input value={value} onChange={(e) => onChange(e.target.value)} className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-xs text-white outline-none focus:border-[#3ea6e8]" /></label>;
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="block text-[11px] font-bold text-white/60"><span>{label}</span><textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className="mt-1.5 w-full resize-y rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-xs text-white outline-none focus:border-[#3ea6e8]" /></label>;
}

function NumberField({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (value: number) => void }) {
  return <label className="block text-[11px] font-bold text-white/60"><span>{label}</span><div className="mt-1.5 flex items-center gap-2"><input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} className="min-w-0 flex-1" /><input type="number" min={min} max={max} value={value} onChange={(e) => onChange(Math.min(max, Math.max(min, Number(e.target.value))))} className="w-20 rounded-lg border border-white/10 bg-black/20 px-2 py-2 text-xs text-white outline-none" /></div></label>;
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const safe = /^#[0-9a-fA-F]{6}$/.test(value) ? value : "#000000";
  return <label className="block text-[11px] font-bold text-white/60"><span>{label}</span><div className="mt-1.5 flex items-center gap-2"><input type="color" value={safe} onChange={(e) => onChange(e.target.value)} className="h-9 w-10 cursor-pointer rounded-lg border-0 bg-transparent" /><input value={value} onChange={(e) => onChange(e.target.value)} className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-xs text-white outline-none" /></div></label>;
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return <label className="flex items-center justify-between text-xs font-bold text-white/70"><span>{label}</span><button type="button" onClick={() => onChange(!checked)} className={`relative h-6 w-11 rounded-full transition ${checked ? "bg-[#3ea6e8]" : "bg-white/15"}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${checked ? "left-6" : "left-1"}`} /></button></label>;
}

function SmallButton({ children, disabled, onClick }: { children: React.ReactNode; disabled?: boolean; onClick: () => void }) {
  return <button type="button" disabled={disabled} onClick={onClick} className="rounded-lg border border-white/10 px-3 py-2 text-[10px] font-black uppercase text-white/60 hover:bg-white/5 disabled:opacity-25">{children}</button>;
}
