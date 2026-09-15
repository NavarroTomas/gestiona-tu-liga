import { NextResponse } from "next/server";
import { previewDiscordTransfers } from "@/lib/discord/transfers";
import { requireAdminPermission } from "@/lib/server/adminApiAuth";

function getConfig() {
  const guildId = process.env.DISCORD_GUILD_ID;
  const channelId = process.env.DISCORD_TRANSFERS_CHANNEL_ID;
  const staffRoleIds = (process.env.DISCORD_STAFF_ROLE_IDS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (!process.env.DISCORD_BOT_TOKEN) throw new Error("Falta DISCORD_BOT_TOKEN.");
  if (!guildId) throw new Error("Falta DISCORD_GUILD_ID.");
  if (!channelId) throw new Error("Falta DISCORD_TRANSFERS_CHANNEL_ID.");
  if (!staffRoleIds.length) throw new Error("Falta DISCORD_STAFF_ROLE_IDS.");

  return { guildId, channelId, staffRoleIds };
}

export async function POST(request: Request) {
  try {
    await requireAdminPermission(request, "transfers.manage");

    const body = await request.json().catch(() => ({}));
    const requestedLimit = Number((body as { limit?: unknown }).limit ?? 50);
    const limit = Number.isFinite(requestedLimit)
      ? Math.min(Math.max(Math.trunc(requestedLimit), 1), 100)
      : 50;

    const result = await previewDiscordTransfers({
      ...getConfig(),
      limit,
    });

    return NextResponse.json({ ok: true, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error inesperado.";

    if (message === "UNAUTHORIZED") {
      return NextResponse.json({ ok: false, error: "No autenticado." }, { status: 401 });
    }

    if (message === "FORBIDDEN") {
      return NextResponse.json({ ok: false, error: "No tenés permiso para revisar transferencias." }, { status: 403 });
    }

    console.error("Discord transfer preview error:", error);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
