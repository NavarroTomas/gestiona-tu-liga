"use client";
import { displayLabel } from "@/lib/displayLabels";


import type { AdminClub, ClubSeasonAssignment } from "@/lib/adminClubs";
import { Field, Input, TournamentPanel, tournamentStyles as styles } from "@/components/admin/tournaments/TournamentUi";

export default function ClubVisualSection({
  club,
  assignment,
  uploading,
  onChange,
  onUpload,
}: {
  club: AdminClub;
  assignment: ClubSeasonAssignment;
  uploading: "logo" | "banner" | null;
  onChange: (patch: Partial<AdminClub>) => void;
  onUpload: (file: File, kind: "logo" | "banner") => void;
}) {
  return (
    <TournamentPanel
      eyebrow="3 · Identidad visual"
      title="Logo, banner y color"
      description="La parte visual está separada para que no se mezcle con datos deportivos."
    >
      <div className={styles.list}>
        <div
          style={{
            minHeight: 240,
            borderRadius: 20,
            overflow: "hidden",
            position: "relative",
            border: "1px solid #d8e2ec",
            background: club.banner_url
              ? `linear-gradient(to top, rgba(11,39,71,.96), rgba(11,39,71,.24)), url(${club.banner_url}) center/cover`
              : "linear-gradient(120deg,#0b2747,#123f69 72%,#1f4f85)",
          }}
        >
          <div style={{ position: "absolute", left: 24, bottom: 24, display: "flex", alignItems: "center", gap: 16, color: "white" }}>
            <div style={{ width: 82, height: 82, borderRadius: 18, background: "white", display: "grid", placeItems: "center", padding: 10 }}>
              {club.logo_url ? (
                <img src={club.logo_url} alt={club.nombre || "Logo"} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              ) : (
                <strong style={{ color: "#102f55", fontSize: 24 }}>{(club.nombre || "CL").slice(0, 2).toUpperCase()}</strong>
              )}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 28, fontWeight: 900 }}>{club.nombre || "Nombre del club"}</h3>
              <p style={{ margin: "5px 0 0", color: "#f3f4f6", fontSize: 13 }}>/{club.slug || "slug"}</p>
              <p style={{ margin: "6px 0 0", color: "#f3f4f6", fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: ".08em" }}>
                {displayLabel(assignment.temporada)} · {assignment.division}
              </p>
            </div>
          </div>
        </div>

        <div className={styles.grid3}>
          <Field label="Color principal">
            <div style={{ display: "grid", gridTemplateColumns: "64px 1fr", gap: 10 }}>
              <input
                type="color"
                value={club.color_principal || "#245f8e"}
                onChange={(event) => onChange({ color_principal: event.target.value })}
                style={{ width: 64, minHeight: 46, border: "1px solid #245f8e", borderRadius: 12, background: "white", padding: 4 }}
              />
              <Input value={club.color_principal || ""} onChange={(event) => onChange({ color_principal: event.target.value })} />
            </div>
          </Field>

          <Field label="Logo">
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              disabled={uploading !== null}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) onUpload(file, "logo");
                event.currentTarget.value = "";
              }}
            />
            {uploading === "logo" && <span className={styles.muted}>Subiendo logo...</span>}
          </Field>

          <Field label="Banner">
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              disabled={uploading !== null}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) onUpload(file, "banner");
                event.currentTarget.value = "";
              }}
            />
            {uploading === "banner" && <span className={styles.muted}>Subiendo banner...</span>}
          </Field>
        </div>
      </div>
    </TournamentPanel>
  );
}
