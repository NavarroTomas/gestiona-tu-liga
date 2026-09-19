"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import PermissionGuard from "@/components/PermissionGuard";
import ClubGeneralSection from "./ClubGeneralSection";
import ClubList from "./ClubList";
import ClubSeasonSection from "./ClubSeasonSection";
import ClubTextImporter from "./ClubTextImporter";
import ClubVisualSection from "./ClubVisualSection";
import {
  DEFAULT_ASSIGNMENT,
  DEFAULT_CLUB,
  deleteClub,
  fetchAdminClubs,
  fetchClubAssignment,
  saveClub,
  saveClubAssignment,
  seasonClubSlug,
  slugifyClub,
  uploadClubImage,
  type AdminClub,
  type ClubSeasonAssignment,
} from "@/lib/adminClubs";
import { fetchSeasonRecords } from "@/lib/adminTournaments";
import {
  Tabs,
  TournamentHero,
  TournamentPage,
  tournamentStyles as styles,
} from "@/components/admin/tournaments/TournamentUi";

type View = "datos" | "competencia" | "visual";

export default function ClubsManager() {
  const [clubs, setClubs] = useState<AdminClub[]>([]);
  const [seasons, setSeasons] = useState<string[]>([DEFAULT_ASSIGNMENT.temporada]);
  const [seasonFilter, setSeasonFilter] = useState(DEFAULT_ASSIGNMENT.temporada);
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

  async function loadClubs(season = seasonFilter) {
    if (!season) return;
    setLoading(true);
    try {
      const rows = await fetchAdminClubs(season);
      setClubs(rows);
    } catch (error: any) {
      setMessage(error?.message || "No pude cargar los clubes.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSeasonRecords()
      .then((records) => {
        const names = records.map((row) => row.nombre);
        const newest = records[0]?.nombre || records.find((row) => row.activa)?.nombre || DEFAULT_ASSIGNMENT.temporada;
        setSeasons(names.length ? names : [DEFAULT_ASSIGNMENT.temporada]);
        setSeasonFilter(newest);
        setAssignment((current) => ({ ...current, temporada: newest }));
      })
      .catch(() => {
        setSeasons([DEFAULT_ASSIGNMENT.temporada]);
        setSeasonFilter(DEFAULT_ASSIGNMENT.temporada);
      });
  }, []);

  useEffect(() => {
    if (!seasonFilter) return;
    setClub({ ...DEFAULT_CLUB });
    setAssignment({ ...DEFAULT_ASSIGNMENT, temporada: seasonFilter });
    setSearch("");
    void loadClubs(seasonFilter);
  }, [seasonFilter]);

  function patchClub(patch: Partial<AdminClub>) {
    setClub((current) => ({ ...current, ...patch }));
  }

  function patchAssignment(patch: Partial<ClubSeasonAssignment>) {
    setAssignment((current) => ({ ...current, ...patch }));
  }

  function startNewClub() {
    setClub({ ...DEFAULT_CLUB });
    setAssignment({ ...DEFAULT_ASSIGNMENT, temporada: seasonFilter || DEFAULT_ASSIGNMENT.temporada });
    setMessage("");
    setView("datos");
  }

  function importClubData(patch: Partial<AdminClub>) {
    setClub({ ...DEFAULT_CLUB, ...patch });
    setAssignment({ ...DEFAULT_ASSIGNMENT, temporada: seasonFilter || DEFAULT_ASSIGNMENT.temporada });
    setMessage("Datos detectados. Revisalos y guardá el club cuando esté listo.");
    setView("datos");
  }

  async function selectClub(selected: AdminClub) {
    setClub({ ...selected });
    setView("datos");
    setMessage("");
    const season = seasonFilter || DEFAULT_ASSIGNMENT.temporada;
    try {
      const currentAssignment = await fetchClubAssignment(String(selected.id), season);
      setAssignment(currentAssignment || { ...DEFAULT_ASSIGNMENT, temporada: season });
    } catch (error: any) {
      setAssignment({ ...DEFAULT_ASSIGNMENT, temporada: season });
      setMessage(error?.message || "El club cargó, pero no pude leer su inscripción.");
    }
  }

  async function handleUpload(file: File, kind: "logo" | "banner") {
    const slug = club.id
      ? (club.slug || slugifyClub(club.nombre))
      : seasonClubSlug(club.nombre, assignment.temporada || seasonFilter);
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
    let createdClubId: string | null = null;
    try {
      const saved = await saveClub(club, assignment.temporada);
      if (!saved.id) throw new Error("No se pudo obtener el ID del club guardado.");
      if (!club.id) createdClubId = saved.id;

      try {
        await saveClubAssignment(saved.id, assignment);
      } catch (assignmentError) {
        if (createdClubId) {
          await deleteClub(createdClubId).catch(() => undefined);
        }
        throw assignmentError;
      }

      setMessage(club.id ? "Club actualizado." : "Club creado.");
      await loadClubs(seasonFilter);
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
      await loadClubs(seasonFilter);
    } catch (error: any) {
      setMessage(error?.message || "No pude eliminar el club.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <PermissionGuard permission="clubs.manage">
      <TournamentPage>
        <Link href="/admin" className={styles.backLink}>← Volver al panel</Link>
        <TournamentHero
          eyebrow="Clubes por temporada"
          title="Administrar clubes"
          description="Cada temporada tiene sus propias identidades competitivas. Un mismo nombre puede existir en varias temporadas sin compartir historia."
        >
          <div className={styles.toolbar}>
            <label className={styles.field}>
              <span className={styles.label}>Temporada de trabajo</span>
              <select
                className={styles.select}
                value={seasonFilter}
                onChange={(event) => setSeasonFilter(event.target.value)}
              >
                {seasons.map((season) => <option key={season} value={season}>{season}</option>)}
              </select>
            </label>
          </div>
        </TournamentHero>

        {message && <div className={styles.notice}>{message}</div>}

        <ClubTextImporter onImport={importClubData} />

        <div style={{ marginTop: 18 }}>
          <ClubList
            clubs={filteredClubs}
            search={search}
            selectedId={club.id}
            loading={loading}
            onSearch={setSearch}
            onSelect={selectClub}
            onNew={startNewClub}
          />
        </div>

        <div style={{ marginTop: 18 }}>
          <Tabs<View>
            value={view}
            onChange={setView}
            items={[
              { value: "datos", label: "Datos" },
              { value: "competencia", label: "Temporada" },
              { value: "visual", label: "Visual" },
            ]}
          />

          {view === "datos" && <ClubGeneralSection club={club} onChange={patchClub} />}
          {view === "competencia" && <ClubSeasonSection assignment={assignment} seasons={[seasonFilter]} onChange={patchAssignment} />}
          {view === "visual" && (
            <ClubVisualSection
              club={club}
              assignment={assignment}
              uploading={uploading}
              onChange={patchClub}
              onUpload={handleUpload}
            />
          )}

          <div className={styles.actions} style={{ marginTop: 16 }}>
            <button type="button" className={styles.primary} disabled={saving || uploading !== null} onClick={handleSave}>
              {saving ? "Guardando..." : club.id ? "Guardar cambios" : "Crear club"}
            </button>
            <button type="button" className={styles.secondary} disabled={saving} onClick={startNewClub}>Cancelar</button>
          </div>
        </div>

        <section className={styles.advancedBar}>
          <div>
            <strong>Más opciones</strong>
            <p>Acciones poco frecuentes quedan fuera del flujo normal.</p>
          </div>
          <div className={styles.actions}>
            {club.slug && (
              <Link href={`/equipos/${encodeURIComponent(club.slug)}?temporada=${encodeURIComponent(assignment.temporada)}&preview=1`} className={styles.secondary} style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
                Ver ficha pública
              </Link>
            )}
            {club.id && (
              <button type="button" className={styles.danger} disabled={saving} onClick={handleDelete}>
                Eliminar club
              </button>
            )}
          </div>
        </section>
      </TournamentPage>
    </PermissionGuard>
  );
}
