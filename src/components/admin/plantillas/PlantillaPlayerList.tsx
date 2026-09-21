"use client";

import { Input, TournamentPanel, tournamentStyles as styles } from "@/components/admin/tournaments/TournamentUi";

export type PlantillaRow = {
  id: number;
  jugador: string | null;
  playerid: string | null;
  steam_id: string | null;
  profile_id: string | null;
  equipo: string | null;
  posicion: string | null;
  temporada: string | null;
  division: string | null;
  estado: string | null;
};

export default function PlantillaPlayerList({
  players,
  search,
  filter,
  team,
  onSearch,
  onFilter,
  onTransfer,
  onRelease,
  onReactivate,
}: {
  players: PlantillaRow[];
  search: string;
  filter: "activos" | "bajas" | "todos";
  team: string;
  onSearch: (value: string) => void;
  onFilter: (value: "activos" | "bajas" | "todos") => void;
  onTransfer: (player: PlantillaRow) => void;
  onRelease: (player: PlantillaRow) => void;
  onReactivate: (player: PlantillaRow) => void;
}) {
  return (
    <TournamentPanel
      eyebrow="Plantel"
      title={team || "Todos los equipos"}
      description={`${players.length} jugador${players.length === 1 ? "" : "es"} en este filtro.`}
    >
      <div style={{ display: "grid", gridTemplateColumns: "minmax(220px,1fr) auto", gap: 12, alignItems: "center" }}>
        <Input value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Buscar jugador o PSO ID..." />
        <div className={styles.actions}>
          {(["activos", "bajas", "todos"] as const).map((value) => (
            <button
              key={value}
              type="button"
              className={filter === value ? styles.primary : styles.secondary}
              onClick={() => onFilter(value)}
            >
              {value === "activos" ? "Activos" : value === "bajas" ? "Bajas" : "Todos"}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.list} style={{ marginTop: 16 }}>
        {players.length === 0 ? (
          <div className={styles.empty}>No hay jugadores para este filtro.</div>
        ) : (
          players.map((player) => (
            <div key={player.id} className={styles.row}>
              <div style={{ minWidth: 0 }}>
                <div className={styles.rowTitle}>{player.jugador || "Sin nombre"}</div>
                <div className={styles.rowMeta}>
                  {player.playerid || "Sin PSO ID"}
                  {player.steam_id ? ` · Steam ${player.steam_id}` : ""}
                  {player.estado === "baja" ? " · Baja" : ""}
                </div>
              </div>
              <div className={styles.actions}>
                {player.estado === "baja" ? (
                  <button type="button" className={styles.primary} onClick={() => onReactivate(player)}>
                    Reincorporar
                  </button>
                ) : (
                  <>
                    <button type="button" className={styles.secondary} onClick={() => onTransfer(player)}>
                      Transferir
                    </button>
                    <button type="button" className={styles.danger} onClick={() => onRelease(player)}>
                      Liberar
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </TournamentPanel>
  );
}
