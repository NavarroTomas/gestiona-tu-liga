"use client";
import { displayLabel } from "@/lib/displayLabels";


import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import PermissionGuard from "@/components/PermissionGuard";
import { fetchTournamentSeasons } from "@/lib/adminTournaments";
import {
  TITLE_COMPETITIONS,
  competitionLabel,
  createAdminTitle,
  deleteAdminTitle,
  fetchAdminTitles,
  fetchSeasonClubs,
  type AdminTitle,
  type CompetitionValue,
} from "@/lib/adminTitles";
import {
  Field,
  Input,
  Select,
  TournamentHero,
  TournamentPage,
  TournamentPanel,
  tournamentStyles as styles,
} from "@/components/admin/tournaments/TournamentUi";

const DIVISIONS = ["Primera", "Segunda"];
const GROUPS = ["Grupo A", "Grupo B", "Grupo C", "Grupo D"];

export default function TitlesManager() {
  const [titles, setTitles] = useState<AdminTitle[]>([]);
  const [seasons, setSeasons] = useState<string[]>(["Temporada 4"]);
  const [clubs, setClubs] = useState<Array<{ nombre: string; division: string | null }>>([]);
  const [season, setSeason] = useState("Temporada 4");
  const [competition, setCompetition] = useState<CompetitionValue>("liga");
  const [category, setCategory] = useState("Primera");
  const [club, setClub] = useState("");
  const [description, setDescription] = useState("");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const categoryOptions = useMemo(() => {
    if (competition === "liga") return DIVISIONS;
    if (competition === "copa_clasificatoria") return GROUPS;
    return [];
  }, [competition]);

  const visibleClubs = useMemo(() => {
    if (competition !== "liga") return clubs;
    const normalized = category.toLowerCase();
    return clubs.filter((item) => String(item.division || "").toLowerCase() === normalized);
  }, [clubs, competition, category]);

  const filteredTitles = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return titles;
    return titles.filter((item) => `${item.equipo} ${item.temporada} ${competitionLabel(item.competicion)} ${item.division || ""}`.toLowerCase().includes(q));
  }, [titles, search]);

  async function loadTitles() {
    try {
      setTitles(await fetchAdminTitles());
    } catch (error: any) {
      setMessage(error?.message || "No pude cargar el palmarés.");
    }
  }

  useEffect(() => {
    void loadTitles();
    fetchTournamentSeasons()
      .then((rows) => {
        if (!rows.length) return;
        setSeasons(rows);
        setSeason((current) => rows.includes(current) ? current : rows[0]);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    fetchSeasonClubs(season)
      .then((rows) => setClubs(rows))
      .catch(() => setClubs([]));
  }, [season]);

  useEffect(() => {
    if (competition === "liga") setCategory("Primera");
    else if (competition === "copa_clasificatoria") setCategory("Grupo A");
    else setCategory("");
    setClub("");
  }, [competition]);

  async function saveTitle() {
    if (!club || !season || !competition) {
      setMessage("Elegí campeón, competición y torneo.");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      await createAdminTitle({
        equipo: club,
        competicion: competition,
        temporada: season,
        division: categoryOptions.length ? category : null,
        descripcion: description.trim() || null,
      });
      setDescription("");
      setMessage("Título agregado al palmarés.");
      await loadTitles();
    } catch (error: any) {
      setMessage(error?.message || "No pude guardar el título.");
    } finally {
      setSaving(false);
    }
  }

  async function removeTitle(item: AdminTitle) {
    if (!window.confirm(`¿Eliminar ${competitionLabel(item.competicion)} de ${item.equipo}?`)) return;
    try {
      await deleteAdminTitle(item.id);
      setMessage("Título eliminado.");
      setTitles((current) => current.filter((row) => row.id !== item.id));
    } catch (error: any) {
      setMessage(error?.message || "No pude eliminar el título.");
    }
  }

  return (
    <PermissionGuard permission="titles.manage">
      <TournamentPage>
        <Link href="/admin/historia" className={styles.backLink}>← Volver a historia</Link>
        <TournamentHero
          eyebrow="Historia de clubes"
          title="Palmarés"
          description="Registrá campeones oficiales sin escribir clubes a mano. Elegí torneo, competición y ganador."
        >
          <div className={styles.kpis}>
            <div className={styles.kpi}><div className={styles.kpiLabel}>Títulos</div><div className={styles.kpiValue}>{titles.length}</div></div>
            <div className={styles.kpi}><div className={styles.kpiLabel}>Torneo</div><div className={styles.kpiValue} style={{ fontSize: 18 }}>{displayLabel(season)}</div></div>
            <div className={styles.kpi}><div className={styles.kpiLabel}>Competición</div><div className={styles.kpiValue} style={{ fontSize: 18 }}>{competitionLabel(competition)}</div></div>
          </div>
        </TournamentHero>

        {message && <div className={styles.notice}>{message}</div>}

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 420px) minmax(0, 1fr)", gap: 18, marginTop: 22 }}>
          <TournamentPanel eyebrow="Nuevo título" title="Agregar campeón" description="Solo aparecen opciones que corresponden al contexto elegido.">
            <div style={{ display: "grid", gap: 14 }}>
              <Field label="Torneo"><Select value={season} onChange={(e) => setSeason(e.target.value)}>{seasons.map((value) => <option key={value} value={value}>{displayLabel(value)}</option>)}</Select></Field>
              <Field label="Competición"><Select value={competition} onChange={(e) => setCompetition(e.target.value as CompetitionValue)}>{TITLE_COMPETITIONS.map((item) => <option key={item.value} value={item.value}>{displayLabel(item.label)}</option>)}</Select></Field>
              {categoryOptions.length > 0 && <Field label={competition === "liga" ? "División" : "Grupo"}><Select value={category} onChange={(e) => { setCategory(e.target.value); setClub(""); }}>{categoryOptions.map((value) => <option key={value} value={value}>{displayLabel(value)}</option>)}</Select></Field>}
              <Field label="Club campeón"><Select value={club} onChange={(e) => setClub(e.target.value)}><option value="">Elegir club</option>{visibleClubs.map((item) => <option key={item.nombre} value={item.nombre}>{displayLabel(item.nombre)}</option>)}</Select></Field>
              <Field label="Nota opcional"><Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ej: Campeón invicto" /></Field>
              <button type="button" className={styles.primary} disabled={saving || !club} onClick={saveTitle}>{saving ? "Guardando..." : "Guardar título"}</button>
            </div>
          </TournamentPanel>

          <TournamentPanel eyebrow="Archivo" title="Títulos cargados" description={`${filteredTitles.length} registro${filteredTitles.length === 1 ? "" : "s"}.`}>
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar club, competición o torneo..." />
            <div className={styles.list} style={{ marginTop: 14 }}>
              {filteredTitles.length === 0 ? <div className={styles.empty}>No hay títulos para este filtro.</div> : filteredTitles.map((item) => (
                <div key={item.id} className={styles.row}>
                  <div>
                    <div className={styles.rowTitle}>{item.equipo}</div>
                    <div className={styles.rowMeta}>{competitionLabel(item.competicion)}{item.division ? ` · ${item.division}` : ""} · {displayLabel(item.temporada)}</div>
                    {item.descripcion && <div className={styles.rowMeta}>{item.descripcion}</div>}
                  </div>
                  <button type="button" className={styles.danger} onClick={() => removeTitle(item)}>Eliminar</button>
                </div>
              ))}
            </div>
          </TournamentPanel>
        </div>
      </TournamentPage>
    </PermissionGuard>
  );
}
