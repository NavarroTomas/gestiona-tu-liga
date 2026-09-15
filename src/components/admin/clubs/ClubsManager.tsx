"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import PermissionGuard from "@/components/PermissionGuard";
import ClubGeneralSection from "./ClubGeneralSection";
import ClubList from "./ClubList";
import ClubSeasonSection from "./ClubSeasonSection";
import ClubVisualSection from "./ClubVisualSection";
import {
  DEFAULT_ASSIGNMENT,
  DEFAULT_CLUB,
  deleteClub,
  fetchAdminClubs,
  fetchClubAssignment,
  saveClub,
  saveClubAssignment,
  slugifyClub,
  uploadClubImage,
  type AdminClub,
  type ClubSeasonAssignment,
} from "@/lib/adminClubs";
import { fetchTournamentSeasons } from "@/lib/adminTournaments";
import {
  Tabs,
  TournamentBackLink,
  TournamentHero,
  TournamentPage,
  TournamentPanel,
  tournamentStyles as styles,
} from "@/components/admin/tournaments/TournamentUi";

type View = "datos" | "competencia" | "visual" | "opciones";

export default function ClubsManager() {
  const [clubs, setClubs] = useState<AdminClub[]>([]);
  const [seasons, setSeasons] = useState<string[]>([DEFAULT_ASSIGNMENT.temporada]);
  const [search, setSearch] = useState("");
  const [club, setClub] = useState<AdminClub>({ ...DEFAULT_CLUB });
  const [assignment, setAssignment] = useState<ClubSeasonAssignment>({ ...DEFAULT_ASSIGNMENT });
  const [view, setView] = useState<View>("datos");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<"logo" | "banner" | null>(null);
  const [message, setMessage] = useState("");

  const filteredClubs = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return clubs;
    return clubs.filter((item) => `${item.nombre} ${item.slug}`.toLowerCase().includes(query));
  }, [clubs, search]);

  async function loadClubs() {
    setLoading(true);
    try {
      const rows = await fetchAdminClubs();
      setClubs(rows);
    } catch (error: any) {
      setMessage(error?.message || "No pude cargar los clubes.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    Promise.all([loadClubs(), fetchTournamentSeasons()])
      .then(([, seasonRows]) => setSeasons(seasonRows.length ? seasonRows : [DEFAULT_ASSIGNMENT.temporada]))
      .catch(() => setSeasons([DEFAULT_ASSIGNMENT.temporada]));
  }, []);

  function patchClub(patch: Partial<AdminClub>) {
    setClub((current) => ({ ...current, ...patch }));
  }

  function patchAssignment(patch: Partial<ClubSeasonAssignment>) {
    setAssignment((current) => ({ ...current, ...patch }));
  }

  function startNewClub() {
    setClub({ ...DEFAULT_CLUB });
    setAssignment({ ...DEFAULT_ASSIGNMENT, temporada: seasons[0] || DEFAULT_ASSIGNMENT.temporada });
    setMessage("");
    setView("datos");
  }

  async function selectClub(selected: AdminClub) {
    setClub({ ...selected });
    setView("datos");
    setMessage("");
    const season = seasons[0] || DEFAULT_ASSIGNMENT.temporada;
    try {
      const currentAssignment = await fetchClubAssignment(String(selected.id), season);
      setAssignment(currentAssignment || { ...DEFAULT_ASSIGNMENT, temporada: season });
    } catch (error: any) {
      setAssignment({ ...DEFAULT_ASSIGNMENT, temporada: season });
      setMessage(error?.message || "El club cargó, pero no pude leer su inscripción.");
    }
  }

  async function handleUpload(file: File, kind: "logo" | "banner") {
    const slug = club.slug || slugifyClub(club.nombre);
    if (!slug) {
      setMessage("Primero escribí el nombre del club.");
      return;
    }

    setUploading(kind);
    setMessage("");
    try {
      const publicUrl = await uploadClubImage(file, kind, slug);
      patchClub({ slug, [kind === "logo" ? "logo_url" : "banner_url"]: publicUrl });
      setMessage(`${kind === "logo" ? "Logo" : "Banner"} subido correctamente.`);
    } catch (error: any) {
      setMessage(error?.message || "No pude subir la imagen.");
    } finally {
      setUploading(null);
    }
  }

  async function handleSave() {
    if (!club.nombre.trim()) {
      setMessage("El nombre del club es obligatorio.");
      setView("datos");
      return;
    }
    if (!assignment.temporada || !assignment.division) {
      setMessage("Seleccioná temporada y división.");
      setView("competencia");
      return;
    }

    setSaving(true);
    setMessage("");
    try {
      const saved = await saveClub(club);
      if (!saved.id) throw new Error("No se pudo obtener el ID del club guardado.");
      await saveClubAssignment(saved.id, assignment);
      setMessage(club.id ? "Club actualizado." : "Club creado.");
      await loadClubs();
      setClub(saved);
    } catch (error: any) {
      setMessage(error?.message || "No pude guardar el club.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!club.id) return;
    if (!window.confirm("¿Seguro que querés eliminar este club? También se eliminará su inscripción por temporada.")) return;

    setSaving(true);
    try {
      await deleteClub(club.id);
      setMessage("Club eliminado.");
      startNewClub();
      await loadClubs();
    } catch (error: any) {
      setMessage(error?.message || "No pude eliminar el club.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <PermissionGuard permission="clubs.manage">
      <TournamentPage>
        <TournamentBackLink />
        <TournamentHero
          eyebrow="Clubes"
          title="Administrar clubes"
          description="Cada sección modifica una sola parte del club. Datos, competencia e identidad visual están separados para que sea claro qué estás tocando."
        >
          <div className={styles.kpis}>
            <div className={styles.kpi}><div className={styles.kpiLabel}>Clubes</div><div className={styles.kpiValue}>{clubs.length}</div></div>
            <div className={styles.kpi}><div className={styles.kpiLabel}>Seleccionado</div><div className={styles.kpiValue}>{club.id ? "1" : "—"}</div></div>
            <div className={styles.kpi}><div className={styles.kpiLabel}>Temporada</div><div className={styles.kpiValue} style={{ fontSize: 18 }}>{assignment.temporada}</div></div>
            <div className={styles.kpi}><div className={styles.kpiLabel}>Estado</div><div className={styles.kpiValue} style={{ fontSize: 18 }}>{assignment.activo ? "Activo" : "Inactivo"}</div></div>
          </div>
        </TournamentHero>

        {message && <div className={styles.notice}>{message}</div>}

        <div className={styles.split} style={{ marginTop: 22 }}>
          <ClubList
            clubs={filteredClubs}
            search={search}
            selectedId={club.id}
            loading={loading}
            onSearch={setSearch}
            onSelect={selectClub}
            onNew={startNewClub}
          />

          <div>
            <Tabs<View>
              value={view}
              onChange={setView}
              items={[
                { value: "datos", label: "Datos del club" },
                { value: "competencia", label: "Temporada y división" },
                { value: "visual", label: "Identidad visual" },
                { value: "opciones", label: "Más opciones" },
              ]}
            />

            {view === "datos" && <ClubGeneralSection club={club} onChange={patchClub} />}
            {view === "competencia" && <ClubSeasonSection assignment={assignment} seasons={seasons} onChange={patchAssignment} />}
            {view === "visual" && (
              <ClubVisualSection
                club={club}
                assignment={assignment}
                uploading={uploading}
                onChange={patchClub}
                onUpload={handleUpload}
              />
            )}
            {view === "opciones" && (
              <TournamentPanel
                eyebrow="4 · Excepciones"
                title="Más opciones"
                description="Las acciones poco frecuentes o destructivas quedan separadas del flujo normal."
              >
                <div className={styles.list}>
                  <div className={styles.row}>
                    <div><div className={styles.rowTitle}>Ver ficha pública</div><div className={styles.rowMeta}>Abrí cómo se ve el club fuera del admin.</div></div>
                    {club.slug ? <Link href={`/clubes/${club.slug}`} className={styles.secondary} style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>Abrir</Link> : <span className={styles.badge}>Sin slug</span>}
                  </div>

                  {club.id ? (
                    <div className={styles.row}>
                      <div><div className={styles.rowTitle}>Eliminar club</div><div className={styles.rowMeta}>Acción destructiva. No forma parte de la edición normal.</div></div>
                      <button type="button" className={styles.danger} disabled={saving} onClick={handleDelete}>Eliminar</button>
                    </div>
                  ) : (
                    <div className={styles.empty}>Primero creá el club para habilitar opciones adicionales.</div>
                  )}
                </div>
              </TournamentPanel>
            )}

            <div className={styles.actions} style={{ marginTop: 16 }}>
              <button type="button" className={styles.primary} disabled={saving || uploading !== null} onClick={handleSave}>
                {saving ? "Guardando..." : club.id ? "Guardar cambios" : "Crear club"}
              </button>
              <button type="button" className={styles.secondary} disabled={saving} onClick={startNewClub}>Cancelar</button>
            </div>
          </div>
        </div>
      </TournamentPage>
    </PermissionGuard>
  );
}
