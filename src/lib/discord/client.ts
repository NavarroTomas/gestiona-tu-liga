import "server-only";

import type { DiscordMember, DiscordMessage, DiscordUser } from "./types";

const DISCORD_API = "https://discord.com/api/v10";

function getBotToken() {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) throw new Error("Falta DISCORD_BOT_TOKEN.");
  return token;
}

async function discordFetch<T>(path: string): Promise<T> {
  const response = await fetch(`${DISCORD_API}${path}`, {
    headers: {
      Authorization: `Bot ${getBotToken()}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Discord API ${response.status}: ${detail || response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export async function getDiscordChannelMessages(channelId: string, limit = 50) {
  const safeLimit = Math.min(Math.max(limit, 1), 100);
  return discordFetch<DiscordMessage[]>(`/channels/${channelId}/messages?limit=${safeLimit}`);
}

export async function getDiscordReactionUsers(channelId: string, messageId: string, emoji: string) {
  return discordFetch<DiscordUser[]>(
    `/channels/${channelId}/messages/${messageId}/reactions/${encodeURIComponent(emoji)}?limit=100`,
  );
}

export async function getDiscordGuildMember(guildId: string, userId: string) {
  return discordFetch<DiscordMember>(`/guilds/${guildId}/members/${userId}`);
}
