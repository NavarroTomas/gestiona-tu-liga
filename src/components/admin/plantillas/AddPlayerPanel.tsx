"use client";
import { displayLabel } from "@/lib/displayLabels";


import { Field, Input, Select, TournamentPanel, tournamentStyles as styles } from "@/components/admin/tournaments/TournamentUi";

export default function AddPlayerPanel({
  playerid,
  player,
  steamId,
  team,
  teams,
  loading,
  searching,
  membershipWarning,
  onPlayerId,
  onPlayer,
  onSteamId,
  onTeam,
  onSearch,
  onSave,
}: {
  playerid: string;
  player: string;
  steamId: string;
  team: string;
  teams: string[];
  loading: boolean;
  searching: boolean;
  membershipWarning: string;
  onPlayerId: (value: string) => void;
  onPlayer: (value: string) => void;
  onSteamId: (value: string) => void;
  onTeam: (value: string) => void;
  onSearch: () => void;
  onSave: () => void;
}) {
  return (
    <TournamentPanel
      eyebrow="Alta manual"
      title="Agregar jugador"
      description="Usá PSO ID como identificador principal. Si existe en Liga, completamos los datos automáticamente."
    >
      {membershipWarning ? (
        <div
          style={{
            marginBottom: 14,
            border: "1px solid #e8b45c",
            background: "#fff8e8",
            color: "#7a4b00",
            borderRadius: 12,
            padding: "12px 14px",
            fontSize: 12,
            fontWeight: 800,
          }}
        >
          {membershipWarning}
        </div>
      ) : null}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14 }}>
        <Field label="PSO ID">
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }}>
            <Input value={playerid} onChange={(event) => onPlayerId(event.target.value)} placeholder="PSO ID" />
            <button type="button" className={styles.secondary} disabled={searching} onClick={onSearch}>
              {searching ? "Buscando..." : "Buscar"}
            </button>
          </div>
        </Field>

        <Field label="Jugador">
          <Input value={player} onChange={(event) => onPlayer(event.target.value)} placeholder="Nombre" />
        </Field>

        <Field label="Steam ID (opcional)">
          <Input value={steamId} onChange={(event) => onSteamId(event.target.value)} placeholder="Steam ID" />
        </Field>

        <Field label="Club">
          <Select value={team} onChange={(event) => onTeam(event.target.value)}>
            <option value="">Elegir club</option>
            {teams.map((name) => <option key={name} value={name}>{displayLabel(name)}</option>)}
          </Select>
        </Field>
      </div>

      <div className={styles.actions} style={{ marginTop: 16 }}>
        <button type="button" className={styles.primary} disabled={loading} onClick={onSave}>
          {loading ? "Guardando..." : "Agregar al plantel"}
        </button>
      </div>
    </TournamentPanel>
  );
}
