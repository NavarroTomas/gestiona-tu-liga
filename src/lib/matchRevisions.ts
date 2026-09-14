import { supabase } from "@/lib/supabase";

export async function restoreMatchRevision(revisionId: string, reason: string) {
  const cleanReason = reason.trim();
  if (!cleanReason) throw new Error("El motivo de restauración es obligatorio.");

  const { data, error } = await supabase.rpc("restore_match_revision", {
    p_revision_id: revisionId,
    p_reason: cleanReason,
  });

  if (error) throw error;
  return data as {
    ok: boolean;
    partido_row_id: number;
    partido_id: string | null;
    revision: number;
  };
}
