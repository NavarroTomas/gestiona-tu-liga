"use client";

import type { AdminClub } from "@/lib/adminClubs";
import { Input, TournamentPanel, tournamentStyles as styles } from "@/components/admin/tournaments/TournamentUi";

export default function ClubList({
  clubs,
  search,
  selectedId,
  loading,
  onSearch,
  onSelect,
  onNew,
}: {
  clubs: AdminClub[];
  search: string;
  selectedId?: string;
  loading: boolean;
  onSearch: (value: string) => void;
  onSelect: (club: AdminClub) => void;
  onNew: () => void;
}) {
  return (
    <TournamentPanel
      eyebrow="Directorio"
      title="Clubes"
      description="Buscá un club existente o creá uno nuevo."
      action={<button type="button" className={styles.primary} onClick={onNew}>Nuevo club</button>}
    >
      <div className={styles.list}>
        <Input value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Buscar club..." />

        {loading ? (
          <div className={styles.empty}>Cargando clubes...</div>
        ) : clubs.length === 0 ? (
          <div className={styles.empty}>No hay clubes que coincidan con la búsqueda.</div>
        ) : (
          clubs.map((club) => (
            <button
              key={club.id || club.slug}
              type="button"
              onClick={() => onSelect(club)}
              className={selectedId === club.id ? styles.primary : styles.secondary}
              style={{ width: "100%", minHeight: 58, display: "flex", alignItems: "center", gap: 12, justifyContent: "flex-start", textAlign: "left", textTransform: "none", letterSpacing: 0 }}
            >
              <span style={{ width: 38, height: 38, display: "grid", placeItems: "center", flex: "0 0 auto" }}>
                {club.logo_url ? (
                  <img src={club.logo_url} alt={club.nombre} style={{ width: 34, height: 34, objectFit: "contain" }} />
                ) : (
                  <strong>{club.nombre.slice(0, 2).toUpperCase()}</strong>
                )}
              </span>
              <span style={{ minWidth: 0 }}>
                <strong style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{club.nombre}</strong>
                <span className={styles.rowMeta}>/{club.slug}</span>
              </span>
            </button>
          ))
        )}
      </div>
    </TournamentPanel>
  );
}
