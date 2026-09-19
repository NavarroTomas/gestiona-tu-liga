"use client";

import type { AdminClub } from "@/lib/adminClubs";
import { seasonClubSlug, slugifyClub } from "@/lib/adminClubs";
import { Field, Input, TournamentPanel, tournamentStyles as styles } from "@/components/admin/tournaments/TournamentUi";

export default function ClubGeneralSection({
  club,
  season,
  onChange,
}: {
  club: AdminClub;
  season: string;
  onChange: (patch: Partial<AdminClub>) => void;
}) {
  return (
    <TournamentPanel
      eyebrow="1 · Datos"
      title="Información del club"
      description="Acá editás solamente la identidad textual del club."
    >
      <div className={styles.list}>
        <div className={styles.grid2}>
          <Field label="Nombre">
            <Input
              value={club.nombre}
              onChange={(event) => {
                const nombre = event.target.value;
                onChange({ nombre, slug: club.id ? club.slug : seasonClubSlug(nombre, season) });
              }}
              placeholder="Club Atlético..."
            />
          </Field>
          <Field label="Slug">
            <Input
              value={club.slug}
              onChange={(event) => {
                const base = slugifyClub(event.target.value.replace(/-t\d+$/i, ""));
                onChange({ slug: club.id ? base : seasonClubSlug(base, season) });
              }}
              placeholder="club-atletico-t5"
            />
          </Field>
        </div>

        <Field label="Descripción">
          <textarea
            value={club.descripcion || ""}
            onChange={(event) => onChange({ descripcion: event.target.value })}
            placeholder="Descripción pública del club"
            className={styles.input}
            style={{ minHeight: 130, paddingTop: 13, resize: "vertical" }}
          />
        </Field>
      </div>
    </TournamentPanel>
  );
}
