"use client";

import { useState } from "react";
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
  const [expanded, setExpanded] = useState(false);
  const selected = clubs.find((club) => club.id === selectedId);
  const showResults = expanded || Boolean(search.trim());

  function choose(club: AdminClub) {
    onSelect(club);
    onSearch("");
    setExpanded(false);
  }

  return (
    <TournamentPanel
      eyebrow="Clubes"
      title={selected ? selected.nombre : "Elegí un club"}
      description={selected ? `/${selected.slug}` : "Seleccioná uno existente o creá uno nuevo."}
      action={
        <div className={styles.actions}>
          <button type="button" className={styles.secondary} onClick={() => setExpanded((value) => !value)}>
            {showResults ? "Cerrar lista" : "Cambiar club"}
          </button>
          <button type="button" className={styles.primary} onClick={() => { onNew(); onSearch(""); setExpanded(false); }}>
            Nuevo club
          </button>
        </div>
      }
    >
      {showResults ? (
        <div className={styles.list}>
          <Input
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Buscar por nombre o slug..."
            autoFocus
          />

          {loading ? (
            <div className={styles.empty}>Cargando clubes...</div>
          ) : clubs.length === 0 ? (
            <div className={styles.empty}>No hay clubes que coincidan con la búsqueda.</div>
          ) : (
            <div className={styles.grid3}>
              {clubs.slice(0, 12).map((club) => (
                <button
                  key={club.id || club.slug}
                  type="button"
                  onClick={() => choose(club)}
                  className={selectedId === club.id ? styles.primary : styles.secondary}
                  style={{
                    minHeight: 58,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    justifyContent: "flex-start",
                    textAlign: "left",
                    textTransform: "none",
                    letterSpacing: 0,
                    overflow: "hidden",
                  }}
                >
                  <span style={{ width: 34, height: 34, display: "grid", placeItems: "center", flex: "0 0 auto" }}>
                    {club.logo_url ? (
                      <img src={club.logo_url} alt={club.nombre} style={{ width: 30, height: 30, objectFit: "contain" }} />
                    ) : (
                      <strong>{club.nombre.slice(0, 2).toUpperCase()}</strong>
                    )}
                  </span>
                  <span style={{ minWidth: 0 }}>
                    <strong style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{club.nombre}</strong>
                    <span className={styles.rowMeta}>/{club.slug}</span>
                  </span>
                </button>
              ))}
            </div>
          )}

          {clubs.length > 12 && <div className={styles.muted}>Mostrando 12 resultados. Usá la búsqueda para encontrar otro club.</div>}
        </div>
      ) : (
        <div className={styles.row}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
            <span style={{ width: 42, height: 42, display: "grid", placeItems: "center", flex: "0 0 auto" }}>
              {selected?.logo_url ? (
                <img src={selected.logo_url} alt={selected.nombre} style={{ width: 38, height: 38, objectFit: "contain" }} />
              ) : (
                <strong>{selected?.nombre ? selected.nombre.slice(0, 2).toUpperCase() : "—"}</strong>
              )}
            </span>
            <div style={{ minWidth: 0 }}>
              <div className={styles.rowTitle}>{selected?.nombre || "Nuevo club"}</div>
              <div className={styles.rowMeta}>{selected ? `/${selected.slug}` : "Completá los datos y guardalo cuando termines."}</div>
            </div>
          </div>
          <button type="button" className={styles.secondary} onClick={() => setExpanded(true)}>Buscar otro</button>
        </div>
      )}
    </TournamentPanel>
  );
}
