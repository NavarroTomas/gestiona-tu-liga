"use client";

import { useMemo, useState } from "react";
import type { AdminClub } from "@/lib/adminClubs";
import { slugifyClub } from "@/lib/adminClubs";
import { tournamentStyles as styles } from "@/components/admin/tournaments/TournamentUi";

type ParsedClub = {
  nombre: string;
  tag: string;
  ubicacion: string;
  estadio: string;
};

function cleanLine(value: string) {
  return value
    .replace(/^[-•·*\s]+/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function readField(text: string, labels: string[]) {
  const lines = text.split(/\r?\n/).map(cleanLine).filter(Boolean);

  for (const line of lines) {
    for (const label of labels) {
      const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const match = line.match(new RegExp(`^${escaped}\\s*:?\\s*(.+)$`, "i"));
      if (match?.[1]) return match[1].trim();
    }
  }

  return "";
}

function parseClubText(text: string): ParsedClub {
  return {
    nombre: readField(text, ["Nombre del equipo", "Nombre del club", "Equipo", "Club"]),
    tag: readField(text, ["Tag (siglas del equipo)", "Tag", "Siglas"]),
    ubicacion: readField(text, ["Ubicación", "Ubicacion", "Provincia", "Ciudad"]),
    estadio: readField(text, ["Estadio"]),
  };
}

export default function ClubTextImporter({
  onImport,
}: {
  onImport: (club: Partial<AdminClub>) => void;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const parsed = useMemo(() => parseClubText(text), [text]);

  function handleImport() {
    if (!parsed.nombre) {
      setError("No encontré el nombre del equipo. Pegá el mensaje completo de Discord.");
      return;
    }

    const details = [
      parsed.tag ? `Tag: ${parsed.tag}` : "",
      parsed.ubicacion ? `Ubicación: ${parsed.ubicacion}` : "",
      parsed.estadio ? `Estadio: ${parsed.estadio}` : "",
    ].filter(Boolean);

    onImport({
      nombre: parsed.nombre,
      slug: slugifyClub(parsed.nombre),
      descripcion: details.join(" · ") || null,
    });

    setError("");
    setOpen(false);
    setText("");
  }

  return (
    <section
      style={{
        marginTop: 22,
        border: "1px solid #d8e2ec",
        borderRadius: 18,
        background: "#fff",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "center",
          justifyContent: "space-between",
          padding: "18px 20px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <strong style={{ color: "#0b2747", display: "block", fontSize: 16 }}>Crear club rápido</strong>
          <span style={{ color: "#245f8e", fontSize: 13 }}>
            Copiá el mensaje del hilo de Discord, pegalo acá y completamos los datos principales.
          </span>
        </div>
        <button type="button" className={styles.primary} onClick={() => setOpen((value) => !value)}>
          {open ? "Cerrar" : "Pegar desde Discord"}
        </button>
      </div>

      {open && (
        <div style={{ borderTop: "1px solid #d8e2ec", padding: 20 }}>
          <textarea
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              setError("");
            }}
            placeholder={"Pegá el mensaje completo. Ejemplo:\n• Nombre del equipo: Bodo Arg\n• Tag (siglas del equipo): FKBA\n• Ubicación: Entre Ríos\n• Estadio: UNO"}
            style={{
              width: "100%",
              minHeight: 180,
              resize: "vertical",
              border: "1px solid #245f8e",
              borderRadius: 12,
              background: "#123f69",
              color: "#fff",
              padding: 14,
              font: "inherit",
              lineHeight: 1.5,
              outline: "none",
            }}
          />

          {text.trim() && (
            <div
              style={{
                marginTop: 14,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: 10,
              }}
            >
              <Preview label="Nombre" value={parsed.nombre} />
              <Preview label="Tag" value={parsed.tag} />
              <Preview label="Ubicación" value={parsed.ubicacion} />
              <Preview label="Estadio" value={parsed.estadio} />
            </div>
          )}

          {error && <div className={styles.notice} style={{ marginTop: 12 }}>{error}</div>}

          <div className={styles.actions} style={{ marginTop: 16 }}>
            <button type="button" className={styles.primary} onClick={handleImport} disabled={!text.trim()}>
              Usar estos datos
            </button>
            <button type="button" className={styles.secondary} onClick={() => { setText(""); setError(""); }}>
              Limpiar
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function Preview({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ border: "1px solid #d8e2ec", borderRadius: 12, padding: "10px 12px", background: "#f5f6f8" }}>
      <div style={{ color: "#245f8e", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".08em" }}>{label}</div>
      <div style={{ color: "#0b2747", marginTop: 3, fontWeight: 800 }}>{value || "—"}</div>
    </div>
  );
}
