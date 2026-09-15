"use client";

import { useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { DiscordTransferPreview } from "@/lib/discord/types";
import {
  TournamentPanel,
  tournamentStyles as styles,
} from "@/components/admin/tournaments/TournamentUi";

export default function DiscordTransferPreviewPanel() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<DiscordTransferPreview | null>(null);

  const approvedCount = useMemo(
    () => preview?.movements.filter((movement) => movement.approved).length ?? 0,
    [preview],
  );

  async function testDiscord() {
    setLoading(true);
    setError("");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("Tu sesión expiró. Volvé a iniciar sesión.");
      }

      const response = await fetch("/api/admin/discord/transfers/preview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ limit: 50 }),
      });

      const payload = await response.json();
      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.error || "No pude consultar Discord.");
      }

      setPreview(payload.result as DiscordTransferPreview);
    } catch (caught) {
      setPreview(null);
      setError(caught instanceof Error ? caught.message : "No pude consultar Discord.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <TournamentPanel
      eyebrow="Discord · prueba segura"
      title="Transferencias"
      description="Por ahora solo lee Discord y muestra qué detecta. No modifica jugadores, clubes ni plantillas."
      action={
        <button type="button" className={styles.primary} onClick={testDiscord} disabled={loading}>
          {loading ? "Consultando..." : "Probar conexión"}
        </button>
      }
    >
      {error && <div className={styles.notice}>{error}</div>}

      {!preview && !error && (
        <div className={styles.empty}>
          Configurá las variables de Discord en Vercel y usá “Probar conexión”.
        </div>
      )}

      {preview && (
        <div className={styles.list}>
          <div className={styles.row}>
            <div>
              <div className={styles.rowTitle}>Resultado de la lectura</div>
              <div className={styles.rowMeta}>
                {preview.messagesScanned} mensajes revisados · {preview.messagesWithMovements} con flechas · {approvedCount} movimientos aprobados
              </div>
            </div>
            <span className={styles.badge}>{preview.movements.length} detectados</span>
          </div>

          {preview.movements.length === 0 ? (
            <div className={styles.empty}>No encontré altas o bajas en los últimos mensajes revisados.</div>
          ) : (
            preview.movements.slice(0, 20).map((movement, index) => (
              <div className={styles.row} key={`${movement.messageId}-${index}`}>
                <div style={{ minWidth: 0 }}>
                  <div className={styles.rowTitle}>
                    {movement.type === "transfer" ? "↑ Fichaje" : "↓ Liberación"} · {movement.discordUsername || movement.discordUserId || "Usuario no detectado"}
                  </div>
                  <div className={styles.rowMeta} style={{ overflowWrap: "anywhere" }}>
                    {movement.steamUrl || "Steam no detectado"}
                  </div>
                </div>
                <span className={styles.badge}>
                  {movement.approved ? "✅ Staff" : "Pendiente"}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </TournamentPanel>
  );
}
