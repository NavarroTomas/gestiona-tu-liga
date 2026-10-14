"use client";
import { displayLabel } from "@/lib/displayLabels";


import type { ClubSeasonAssignment } from "@/lib/adminClubs";
import { Field, Select, TournamentPanel, tournamentStyles as styles } from "@/components/admin/tournaments/TournamentUi";

const DIVISIONS = [
  { value: "primera", label: "Primera" },
  { value: "segunda", label: "Segunda" },
];

export default function ClubSeasonSection({
  assignment,
  seasons,
  onChange,
}: {
  assignment: ClubSeasonAssignment;
  seasons: string[];
  onChange: (patch: Partial<ClubSeasonAssignment>) => void;
}) {
  return (
    <TournamentPanel
      eyebrow="2 · Competencia"
      title="Torneo y división"
      description="Este bloque controla únicamente dónde participa el club y si está activo."
    >
      <div className={styles.grid3}>
        <Field label="Torneo">
          <Select value={assignment.temporada} onChange={(event) => onChange({ temporada: event.target.value })}>
            {seasons.map((season) => <option key={season} value={season}>{displayLabel(season)}</option>)}
          </Select>
        </Field>

        <Field label="División">
          <Select value={assignment.division} onChange={(event) => onChange({ division: event.target.value })}>
            {DIVISIONS.map((division) => <option key={division.value} value={division.value}>{displayLabel(division.label)}</option>)}
          </Select>
        </Field>

        <Field label="Estado">
          <Select value={assignment.activo ? "activo" : "inactivo"} onChange={(event) => onChange({ activo: event.target.value === "activo" })}>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </Select>
        </Field>
      </div>

      <div className={styles.notice} style={{ marginTop: 16 }}>
        {assignment.activo
          ? `El club participa en ${assignment.temporada} · ${DIVISIONS.find((division) => division.value === assignment.division)?.label || assignment.division}.`
          : `El club queda registrado en ${assignment.temporada}, pero no participa públicamente.`}
      </div>
    </TournamentPanel>
  );
}
