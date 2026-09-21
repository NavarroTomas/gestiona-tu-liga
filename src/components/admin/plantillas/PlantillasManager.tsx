"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import PermissionGuard from "@/components/PermissionGuard";
import AddPlayerPanel from "./AddPlayerPanel";
import PlantillaPlayerList, { type PlantillaRow } from "./PlantillaPlayerList";
import TransferPanel from "./TransferPanel";
import TransferTextImporter, { type ImportedTransferDraft } from "./TransferTextImporter";
import { supabase } from "@/lib/supabase";
import { fetchSeasonRecords } from "@/lib/adminTournaments";
import {
  Field,
  Select,
  Tabs,
  TournamentHero,
  TournamentPage,
  tournamentStyles as styles,
} from "@/components/admin/tournaments/TournamentUi";

type View = "plantel" | "agregar" | "mercado";
type Team = { nombre: string; division?: string | null };
type Profile = { id: string; display_name: string | null; username: string | null; playerid: string | null; steam_id: string | null };
type StatPlayer = { nombre: string | null; playerId: string | null };

const PLANTILLAS_SELECT = "id,jugador,playerid,steam_id,profile_id,equipo,posicion,temporada,division,estado";
const DIVISIONS = ["Primera", "Segunda"];

function normalizeDivision(value: string) {
  const v = String(value || "").toLowerCase().trim();
  if (v === "primera" || v === "primera division" || v === "primera división") return "primera";
  if (v === "segunda" || v === "segunda division" || v === "segunda división") return "segunda";
  return v;
}

export default function PlantillasManager() {
  const [seasons, setSeasons] = useState<string[]>(["Temporada 4"]);
  const [season, setSeason] = useState("Temporada 4");
  const [division, setDivision] = useState("Primera");
  const [team, setTeam] = useState("");
  const [teams, setTeams] = useState<string[]>([]);
  const [players, setPlayers] = useState<PlantillaRow[]>([]);
  const [view, setView] = useState<View>("plantel");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"activos" | "bajas" | "todos">("activos");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchingPlayer, setSearchingPlayer] = useState(false);
  const [playerMembershipWarning, setPlayerMembershipWarning] = useState("");

  const [playerName, setPlayerName] = useState("");
  const [playerId, setPlayerId] = useState("");
  const [steamId, setSteamId] = useState("");
  const [profileId, setProfileId] = useState<string | null>(null);

  const [transferPlayer, setTransferPlayer] = useState("");
  const [transferPlayerId, setTransferPlayerId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [transferType, setTransferType] = useState("Fichaje");
  const [transferDate, setTransferDate] = useState("");

  useEffect(() => {
    fetchSeasonRecords()
      .then((records) => {
        if (!records.length) return;
        const rows = records.map((row) => row.nombre);
        const active = records.find((row) => row.activa)?.nombre || rows[0];
        setSeasons(rows);
        setSeason(active);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    void loadContext();
  }, [season, division]);

  async function loadContext() {
    setMessage("");
    const [teamsRes, playersRes] = await Promise.all([
      supabase.from("v_clubes_temporada_public").select("nombre,division").eq("temporada", season).eq("activo", true).order("nombre", { ascending: true }),
      supabase.from("plantillas").select(PLANTILLAS_SELECT).eq("temporada", season).in("division", [division, division.toLowerCase()]).order("equipo", { ascending: true }).order("jugador", { ascending: true }),
    ]);

    if (teamsRes.error) console.error(teamsRes.error);
    if (playersRes.error) {
      console.error(playersRes.error);
      setMessage("No pude cargar las plantillas.");
    }

    const currentDivision = normalizeDivision(division);
    const names = ((teamsRes.data || []) as Team[])
      .filter((item) => normalizeDivision(item.division || "") === currentDivision)
      .map((item) => item.nombre)
      .sort((a, b) => a.localeCompare(b));

    setTeams(names);
    setTeam((current) => current && names.includes(current) ? current : (names[0] || ""));
    setPlayers((playersRes.data || []) as unknown as PlantillaRow[]);
  }

  async function reloadPlayers() {
    const { data, error } = await supabase
      .from("plantillas")
      .select(PLANTILLAS_SELECT)
      .eq("temporada", season)
      .in("division", [division, division.toLowerCase()])
      .order("equipo", { ascending: true })
      .order("jugador", { ascending: true });
    if (error) {
      console.error(error);
      setMessage("No pude actualizar el plantel.");
      return;
    }
    setPlayers((data || []) as unknown as PlantillaRow[]);
  }

  const filteredPlayers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return players.filter((player) => {
      const matchesTeam = !team || player.equipo === team;
      const matchesSearch = !q || `${player.jugador || ""} ${player.playerid || ""}`.toLowerCase().includes(q);
      const matchesState = filter === "todos" ? true : filter === "bajas" ? player.estado === "baja" : player.estado !== "baja";
      return matchesTeam && matchesSearch && matchesState;
    });
  }, [players, search, team, filter]);

  async function findActiveMembership(psoId: string, excludeId?: number | string) {
    const cleanId = psoId.trim();
    if (!cleanId) return null;

    const { data, error } = await supabase
      .from("plantillas")
      .select("id,jugador,playerid,equipo,temporada,division,estado")
      .eq("temporada", season)
      .ilike("playerid", cleanId)
      .neq("estado", "baja");

    if (error) {
      console.error("No pude verificar la pertenencia actual del jugador:", error);
      return null;
    }

    return ((data || []) as PlantillaRow[]).find(
      (row) => String(row.id) !== String(excludeId ?? ""),
    ) || null;
  }

  async function searchByPsoId() {
    const cleanId = playerId.trim();
    if (!cleanId) {
      setMessage("Escribí un PSO ID primero.");
      return;
    }

    setSearchingPlayer(true);
    setMessage("");
    setPlayerMembershipWarning("");
    try {
      const activeMembership = await findActiveMembership(cleanId);
      if (activeMembership) {
        setPlayerMembershipWarning(
          `Este PSO ID ya está activo en ${activeMembership.equipo || "otro club"} (${activeMembership.division || "sin división"}).`,
        );
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("id,display_name,username,playerid,steam_id")
        .ilike("playerid", cleanId)
        .maybeSingle();

      if (profile) {
        const found = profile as Profile;
        setPlayerName(found.display_name || found.username || "");
        setPlayerId(found.playerid || cleanId);
        setSteamId(found.steam_id || "");
        setProfileId(found.id);
        setMessage("Jugador encontrado en perfiles APA.");
        return;
      }

      const { data: stat } = await supabase
        .from("estadisticas_jugadores")
        .select("nombre,playerId")
        .ilike("playerId", cleanId)
        .order("temporada", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (stat) {
        const found = stat as StatPlayer;
        setPlayerName(found.nombre || "");
        setPlayerId(found.playerId || cleanId);
        setProfileId(null);
        setMessage("Jugador encontrado en estadísticas APA.");
      } else {
        setProfileId(null);
        setMessage("No encontré ese PSO ID. Podés cargarlo manualmente.");
      }
    } finally {
      setSearchingPlayer(false);
    }
  }

  async function addPlayer() {
    const cleanPlayer = playerName.trim();
    const cleanId = playerId.trim();
    const cleanTeam = team.trim();
    const cleanSteam = steamId.trim();

    if (!cleanId || !cleanPlayer || !cleanTeam) {
      setMessage("Completá PSO ID, jugador y club.");
      return;
    }

    const activeMembership = await findActiveMembership(cleanId);
    if (activeMembership) {
      const sameTeam =
        String(activeMembership.equipo || "").trim().toLowerCase() === cleanTeam.toLowerCase();
      setPlayerMembershipWarning(
        sameTeam
          ? `Este jugador ya está activo en ${activeMembership.equipo || cleanTeam}.`
          : `No se puede agregar: este PSO ID ya está activo en ${activeMembership.equipo || "otro club"}.`,
      );
      setMessage(
        sameTeam
          ? "El jugador ya pertenece a este plantel."
          : "El jugador ya pertenece a otro club. Usá Mercado para transferirlo.",
      );
      return;
    }

    setPlayerMembershipWarning("");
    setLoading(true);
    setMessage("");
    try {
      const { error } = await supabase.from("plantillas").upsert({
        jugador: cleanPlayer,
        playerid: cleanId,
        steam_id: cleanSteam || null,
        profile_id: profileId,
        equipo: cleanTeam,
        posicion: "N/D",
        temporada: season,
        division,
        estado: "activo",
      }, { onConflict: "temporada,division,equipo,playerid" });
      if (error) throw error;

      if (cleanSteam) {
        if (profileId) await supabase.from("profiles").update({ steam_id: cleanSteam }).eq("id", profileId);
        else await supabase.from("profiles").update({ steam_id: cleanSteam }).ilike("playerid", cleanId);
      }

      setPlayerName("");
      setPlayerId("");
      setSteamId("");
      setProfileId(null);
      setPlayerMembershipWarning("");
      setMessage("Jugador agregado al plantel.");
      setView("plantel");
      await reloadPlayers();
    } catch (error: any) {
      setMessage(error?.message || "No pude guardar el jugador.");
    } finally {
      setLoading(false);
    }
  }

  function prepareTransfer(player: PlantillaRow) {
    setTransferPlayer(player.jugador || "");
    setTransferPlayerId(player.playerid || "");
    setFrom(player.equipo || "");
    setTo("");
    setTransferType("Fichaje");
    setTransferDate("");
    setView("mercado");
    setMessage("");
  }

  function prepareImportedTransfer(draft: ImportedTransferDraft) {
    setTransferPlayer(draft.player);
    setTransferPlayerId(draft.playerid);
    setFrom(draft.from);
    setTo(draft.to);
    setTransferType(draft.type);
    setTransferDate("");
    setView("mercado");
    setMessage(draft.playerid ? "Movimiento detectado. Revisalo y aplicalo." : "Movimiento detectado. Completá el PSO ID antes de aplicar el fichaje.");
  }

  async function releasePlayer(player: PlantillaRow) {
    if (!window.confirm(`¿Liberar a ${player.jugador || "este jugador"} de ${player.equipo || "su club"}?`)) return;
    const { error } = await supabase.from("plantillas").update({ estado: "baja" }).eq("id", player.id);
    if (error) {
      setMessage("No pude liberar al jugador.");
      return;
    }
    await supabase.from("transferencias").insert({
      jugador: player.jugador || "",
      desde: player.equipo || null,
      hacia: null,
      temporada: player.temporada || season,
      division: player.division || division,
      tipo: "Libre",
      fecha: null,
    });
    setMessage("Jugador liberado.");
    await reloadPlayers();
  }

  async function reactivatePlayer(player: PlantillaRow) {
    if (!player.playerid) {
      setMessage("Este jugador no tiene PSO ID y no se puede validar su reincorporación.");
      return;
    }

    const activeMembership = await findActiveMembership(player.playerid, player.id);
    if (activeMembership) {
      setMessage(
        `No se puede reincorporar: el jugador ya está activo en ${activeMembership.equipo || "otro club"}.`,
      );
      return;
    }

    if (!window.confirm(`¿Reincorporar a ${player.jugador || "este jugador"} a ${player.equipo || "este club"}?`)) {
      return;
    }

    const { error } = await supabase
      .from("plantillas")
      .update({ estado: "activo" })
      .eq("id", player.id);

    if (error) {
      setMessage("No pude reincorporar al jugador: " + error.message);
      return;
    }

    setMessage("Jugador reincorporado al plantel.");
    await reloadPlayers();
  }

  async function applyTransfer() {
    const cleanPlayer = transferPlayer.trim();
    const cleanId = transferPlayerId.trim();
    const cleanFrom = from.trim();
    const cleanTo = to.trim();
    const needsDestination = transferType !== "Salida" && transferType !== "Libre";

    if (!cleanPlayer || (needsDestination && !cleanTo)) {
      setMessage("Completá jugador y destino cuando corresponda.");
      return;
    }
    if (needsDestination && !cleanId) {
      setMessage("El PSO ID es obligatorio para dar de alta al jugador en el club destino.");
      return;
    }
    if (cleanFrom && cleanTo && cleanFrom === cleanTo) {
      setMessage("Origen y destino no pueden ser el mismo club.");
      return;
    }

    const source = players.find((item) =>
      (!cleanFrom || item.equipo === cleanFrom) &&
      (cleanId ? item.playerid?.toLowerCase() === cleanId.toLowerCase() : item.jugador === cleanPlayer)
    ) || null;

    const { error: movementError } = await supabase.from("transferencias").insert({
      jugador: cleanPlayer,
      desde: cleanFrom || null,
      hacia: cleanTo || null,
      temporada: season,
      division,
      tipo: transferType,
      fecha: transferDate.trim() || null,
    });
    if (movementError) {
      setMessage("No pude registrar el movimiento: " + movementError.message);
      return;
    }

    if (source) {
      const { error } = await supabase.from("plantillas").update({ estado: "baja" }).eq("id", source.id);
      if (error) {
        setMessage("Registré el movimiento, pero no pude marcar la baja de origen.");
        return;
      }
    }

    if (needsDestination && cleanTo && cleanId) {
      const { error } = await supabase.from("plantillas").upsert({
        jugador: source?.jugador || cleanPlayer,
        playerid: cleanId,
        steam_id: source?.steam_id || null,
        profile_id: source?.profile_id || null,
        equipo: cleanTo,
        posicion: source?.posicion || "N/D",
        temporada: season,
        division,
        estado: "activo",
      }, { onConflict: "temporada,division,equipo,playerid" });
      if (error) {
        setMessage("Registré el movimiento y la baja, pero no pude crear el alta de destino.");
        return;
      }
    }

    setMessage(needsDestination ? "Transferencia aplicada." : "Liberación aplicada.");
    setTransferPlayer("");
    setTransferPlayerId("");
    setFrom("");
    setTo("");
    setTransferType("Fichaje");
    setTransferDate("");
    setView("plantel");
    await reloadPlayers();
  }

  return (
    <PermissionGuard permission="transfers.manage">
      <TournamentPage>
        <Link href="/admin" className={styles.backLink}>← Volver al panel</Link>
        <TournamentHero
          eyebrow="Plantillas"
          title="Planteles y mercado"
          description="Elegí el contexto y trabajá solo sobre una tarea: ver plantel, agregar jugador o registrar un movimiento."
        >
          <div className={styles.kpis}>
            <div className={styles.kpi}><div className={styles.kpiLabel}>Club</div><div className={styles.kpiValue} style={{ fontSize: 18 }}>{team || "—"}</div></div>
            <div className={styles.kpi}><div className={styles.kpiLabel}>Activos</div><div className={styles.kpiValue}>{players.filter((p) => (!team || p.equipo === team) && p.estado !== "baja").length}</div></div>
            <div className={styles.kpi}><div className={styles.kpiLabel}>Temporada</div><div className={styles.kpiValue} style={{ fontSize: 18 }}>{season}</div></div>
          </div>
        </TournamentHero>

        {message && <div className={styles.notice}>{message}</div>}

        <section className={styles.panel} style={{ marginTop: 22 }}>
          <div className={styles.panelBody}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14 }}>
              <Field label="Temporada">
                <Select value={season} onChange={(event) => setSeason(event.target.value)}>
                  {seasons.map((value) => <option key={value}>{value}</option>)}
                </Select>
              </Field>
              <Field label="División">
                <Select value={division} onChange={(event) => setDivision(event.target.value)}>
                  {DIVISIONS.map((value) => <option key={value}>{value}</option>)}
                </Select>
              </Field>
              <Field label="Club">
                <Select value={team} onChange={(event) => setTeam(event.target.value)}>
                  <option value="">Todos los clubes</option>
                  {teams.map((value) => <option key={value}>{value}</option>)}
                </Select>
              </Field>
            </div>
          </div>
        </section>

        <div style={{ marginTop: 18 }}>
          <Tabs<View>
            value={view}
            onChange={setView}
            items={[
              { value: "plantel", label: "Plantel" },
              { value: "agregar", label: "Agregar jugador" },
              { value: "mercado", label: "Mercado" },
            ]}
          />
        </div>

        <div style={{ marginTop: 16 }}>
          {view === "plantel" && (
            <PlantillaPlayerList
              players={filteredPlayers}
              search={search}
              filter={filter}
              team={team}
              onSearch={setSearch}
              onFilter={setFilter}
              onTransfer={prepareTransfer}
              onRelease={releasePlayer}
              onReactivate={reactivatePlayer}
            />
          )}

          {view === "agregar" && (
            <AddPlayerPanel
              playerid={playerId}
              player={playerName}
              steamId={steamId}
              team={team}
              teams={teams}
              loading={loading}
              searching={searchingPlayer}
              membershipWarning={playerMembershipWarning}
              onPlayerId={(value) => {
                setPlayerId(value);
                setPlayerMembershipWarning("");
              }}
              onPlayer={setPlayerName}
              onSteamId={setSteamId}
              onTeam={setTeam}
              onSearch={searchByPsoId}
              onSave={addPlayer}
            />
          )}

          {view === "mercado" && (
            <div style={{ display: "grid", gap: 14 }}>
              <TransferTextImporter
                players={players}
                teams={teams}
                selectedTeam={team}
                onUse={prepareImportedTransfer}
              />
              <TransferPanel
                player={transferPlayer}
                playerid={transferPlayerId}
                from={from}
                to={to}
                type={transferType}
                date={transferDate}
                teams={teams}
                onPlayer={setTransferPlayer}
                onPlayerId={setTransferPlayerId}
                onFrom={setFrom}
                onTo={setTo}
                onType={(value) => { setTransferType(value); if (value === "Salida" || value === "Libre") setTo(""); }}
                onDate={setTransferDate}
                onSave={applyTransfer}
              />
            </div>
          )}
        </div>
      </TournamentPage>
    </PermissionGuard>
  );
}
