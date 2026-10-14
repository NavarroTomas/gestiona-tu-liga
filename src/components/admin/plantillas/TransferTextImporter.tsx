"use client";
import { displayLabel } from "@/lib/displayLabels";


import { useMemo, useState } from "react";
import type { PlantillaRow } from "./PlantillaPlayerList";
import { Select, tournamentStyles as styles } from "@/components/admin/tournaments/TournamentUi";

export type ImportedTransferDraft = {
  player: string;
  playerid: string;
  from: string;
  to: string;
  type: "Fichaje" | "Libre";
  steam: string;
};

type ParsedMovement = ImportedTransferDraft & {
  key: string;
  direction: "up" | "down";
  tag: string;
  matched: boolean;
};

const UP = /(?:🔼|🔺|⬆️?|↑)/u;
const DOWN = /(?:🔽|🔻|⬇️?|↓)/u;
const STEAM = /https?:\/\/(?:www\.)?steamcommunity\.com\/(?:id|profiles)\/[^\s<>()]+/i;

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function normalizeSteam(value: string | null | undefined) {
  const clean = String(value || "").trim().replace(/\/$/, "");
  if (!clean) return "";
  const match = clean.match(/steamcommunity\.com\/(?:id|profiles)\/([^/?#]+)/i);
  return (match?.[1] || clean).toLowerCase();
}

function teamAcronym(team: string) {
  const words = team
    .replace(/[^A-Za-zÀ-ÿ0-9 ]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .filter((word) => !["fc", "cf", "club", "de", "del", "la", "el"].includes(word.toLowerCase()));
  return words.map((word) => word[0]).join("").toUpperCase();
}

function inferTeam(tag: string, teams: string[]) {
  if (!tag) return "";
  const wanted = normalize(tag);
  return teams.find((team) => {
    const normalizedTeam = normalize(team);
    return normalizedTeam === wanted || normalizedTeam.includes(wanted) || normalize(teamAcronym(team)) === wanted;
  }) || "";
}

function cleanPlayerName(raw: string) {
  return raw
    .replace(/<@!?\d+>/g, "")
    .replace(/^@+\s*/, "")
    .replace(/^\[[^\]]+\]\s*/, "")
    .replace(/[|•·-]+$/g, "")
    .trim();
}

function parseMovements(text: string, players: PlantillaRow[], teams: string[], selectedTeam: string): ParsedMovement[] {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const results: ParsedMovement[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const direction = UP.test(line) ? "up" : DOWN.test(line) ? "down" : null;
    if (!direction) continue;

    const nextLine = lines[index + 1] || "";
    const steamMatch = line.match(STEAM) || nextLine.match(STEAM);
    const steam = steamMatch?.[0]?.replace(/[),.;]+$/, "") || "";
    const tag = line.match(/\[([^\]]{2,12})\]/)?.[1]?.trim() || "";

    const withoutArrow = line.replace(UP, "").replace(DOWN, "");
    const beforeSteam = withoutArrow.replace(STEAM, "").trim();
    const player = cleanPlayerName(beforeSteam) || `Movimiento ${results.length + 1}`;

    const steamKey = normalizeSteam(steam);
    const nameKey = normalize(player);
    const existing = players.find((item) => steamKey && normalizeSteam(item.steam_id) === steamKey)
      || players.find((item) => normalize(item.jugador || "") === nameKey)
      || null;

    const inferred = inferTeam(tag, teams);
    const type = direction === "up" ? "Fichaje" : "Libre";
    const from = existing?.equipo || (direction === "down" ? inferred || selectedTeam : "") || "";
    const to = direction === "up" ? inferred || selectedTeam || "" : "";

    results.push({
      key: `${index}-${player}-${direction}`,
      direction,
      player: existing?.jugador || player,
      playerid: existing?.playerid || "",
      from,
      to,
      type,
      steam,
      tag,
      matched: Boolean(existing),
    });
  }

  return results;
}

export default function TransferTextImporter({
  players,
  teams,
  selectedTeam,
  onUse,
}: {
  players: PlantillaRow[];
  teams: string[];
  selectedTeam: string;
  onUse: (draft: ImportedTransferDraft) => void;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [overrides, setOverrides] = useState<Record<string, { from?: string; to?: string }>>({});

  const movements = useMemo(
    () => parseMovements(text, players, teams, selectedTeam),
    [text, players, teams, selectedTeam],
  );

  function movementWithOverrides(item: ParsedMovement): ImportedTransferDraft {
    const override = overrides[item.key] || {};
    return {
      player: item.player,
      playerid: item.playerid,
      from: override.from ?? item.from,
      to: item.type === "Libre" ? "" : (override.to ?? item.to),
      type: item.type,
      steam: item.steam,
    };
  }

  return (
    <section style={{ border: "1px solid #d8e2ec", borderRadius: 18, background: "#fff", overflow: "hidden" }}>
      <div style={{ display: "flex", gap: 14, alignItems: "center", justifyContent: "space-between", padding: "16px 18px", flexWrap: "wrap" }}>
        <div>
          <strong style={{ color: "#0b2747", display: "block" }}>Pegar movimientos de Discord</strong>
          <span style={{ color: "#245f8e", fontSize: 13 }}>Pegá el mensaje: 🔼 ficha y 🔽 libera. Después revisás cada movimiento antes de aplicarlo.</span>
        </div>
        <button type="button" className={styles.primary} onClick={() => setOpen((value) => !value)}>
          {open ? "Cerrar" : "Pegar mensaje"}
        </button>
      </div>

      {open && (
        <div style={{ borderTop: "1px solid #d8e2ec", padding: 18 }}>
          <textarea
            value={text}
            onChange={(event) => { setText(event.target.value); setOverrides({}); }}
            placeholder={"Pegá el mensaje de #transferencias acá.\n🔼 @[FTC] Jugador https://steamcommunity.com/id/...\n🔽 @[BAR] OtroJugador https://steamcommunity.com/profiles/..."}
            style={{ width: "100%", minHeight: 150, resize: "vertical", border: "1px solid #245f8e", borderRadius: 12, background: "#123f69", color: "#fff", padding: 14, font: "inherit", lineHeight: 1.5, outline: "none" }}
          />

          {text.trim() && movements.length === 0 && (
            <div className={styles.notice} style={{ marginTop: 12 }}>No encontré líneas con 🔼 o 🔽.</div>
          )}

          {movements.length > 0 && (
            <div className={styles.list} style={{ marginTop: 14 }}>
              {movements.map((item) => {
                const current = movementWithOverrides(item);
                return (
                  <div key={item.key} className={styles.row} style={{ alignItems: "stretch", gap: 14 }}>
                    <div style={{ minWidth: 180, flex: "1 1 220px" }}>
                      <div className={styles.rowTitle}>{item.direction === "up" ? "↑" : "↓"} {item.player}</div>
                      <div className={styles.rowMeta}>
                        {item.type === "Fichaje" ? "Fichaje" : "Liberación"}
                        {item.tag ? ` · ${item.tag}` : ""}
                        {item.matched ? " · jugador encontrado" : " · sin coincidencia exacta"}
                      </div>
                      {item.steam && <div className={styles.rowMeta} style={{ marginTop: 3 }}>Steam detectado</div>}
                      {!item.playerid && <div className={styles.rowMeta} style={{ marginTop: 3 }}>PSO ID pendiente: se completa antes de aplicar si hace falta.</div>}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(150px,1fr))", gap: 8, flex: "2 1 360px" }}>
                      <Select
                        value={current.from}
                        onChange={(event) => setOverrides((old) => ({ ...old, [item.key]: { ...old[item.key], from: event.target.value } }))}
                      >
                        <option value="">Origen</option>
                        {teams.map((team) => <option key={`${item.key}-from-${team}`} value={team}>{displayLabel(team)}</option>)}
                      </Select>
                      <Select
                        value={current.to}
                        disabled={item.type === "Libre"}
                        onChange={(event) => setOverrides((old) => ({ ...old, [item.key]: { ...old[item.key], to: event.target.value } }))}
                      >
                        <option value="">{displayLabel(item.type === "Libre" ? "Queda libre" : "Destino")}</option>
                        {teams.map((team) => <option key={`${item.key}-to-${team}`} value={team}>{displayLabel(team)}</option>)}
                      </Select>
                    </div>

                    <button type="button" className={styles.primary} onClick={() => onUse(current)}>
                      Usar
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
