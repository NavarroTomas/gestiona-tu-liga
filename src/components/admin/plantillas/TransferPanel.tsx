"use client";

import { Field, Input, Select, TournamentPanel, tournamentStyles as styles } from "@/components/admin/tournaments/TournamentUi";

export default function TransferPanel({
  player,
  playerid,
  from,
  to,
  type,
  date,
  teams,
  onPlayer,
  onPlayerId,
  onFrom,
  onTo,
  onType,
  onDate,
  onSave,
}: {
  player: string;
  playerid: string;
  from: string;
  to: string;
  type: string;
  date: string;
  teams: string[];
  onPlayer: (value: string) => void;
  onPlayerId: (value: string) => void;
  onFrom: (value: string) => void;
  onTo: (value: string) => void;
  onType: (value: string) => void;
  onDate: (value: string) => void;
  onSave: () => void;
}) {
  const needsDestination = type !== "Salida" && type !== "Libre";

  return (
    <TournamentPanel
      eyebrow="Mercado"
      title="Registrar movimiento"
      description="Fichajes y liberaciones actualizan la plantilla y dejan registro del movimiento."
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14 }}>
        <Field label="Jugador">
          <Input value={player} onChange={(event) => onPlayer(event.target.value)} placeholder="Jugador" />
        </Field>

        <Field label="PSO ID">
          <Input value={playerid} onChange={(event) => onPlayerId(event.target.value)} placeholder="PSO ID" />
        </Field>

        <Field label="Origen">
          <Select value={from} onChange={(event) => onFrom(event.target.value)}>
            <option value="">Elegir club</option>
            {teams.map((name) => <option key={`from-${name}`} value={name}>{name}</option>)}
          </Select>
        </Field>

        <Field label="Destino">
          <Select value={to} disabled={!needsDestination} onChange={(event) => onTo(event.target.value)}>
            <option value="">{needsDestination ? "Elegir club" : "Queda libre"}</option>
            {teams.map((name) => <option key={`to-${name}`} value={name}>{name}</option>)}
          </Select>
        </Field>

        <Field label="Tipo">
          <Select value={type} onChange={(event) => onType(event.target.value)}>
            {["Fichaje", "Salida", "Libre", "Préstamo"].map((value) => <option key={value}>{value}</option>)}
          </Select>
        </Field>

        <Field label="Fecha / jornada (opcional)">
          <Input value={date} onChange={(event) => onDate(event.target.value)} placeholder="Fecha o jornada" />
        </Field>
      </div>

      <div className={styles.actions} style={{ marginTop: 16 }}>
        <button type="button" className={styles.primary} onClick={onSave}>Aplicar movimiento</button>
      </div>
    </TournamentPanel>
  );
}
