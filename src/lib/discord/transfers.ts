import "server-only";

import {
  getDiscordChannelMessages,
  getDiscordGuildMember,
  getDiscordReactionUsers,
} from "./client";
import type {
  DiscordMessage,
  DiscordMovementType,
  DiscordTransferMovement,
  DiscordTransferPreview,
} from "./types";

const STEAM_URL_RE = /https?:\/\/(?:www\.)?steamcommunity\.com\/(?:id|profiles)\/[A-Za-z0-9_\-]+\/?/i;
const DISCORD_MENTION_RE = /<@!?(\d+)>/;

function detectMovementType(line: string): DiscordMovementType | null {
  const normalized = line.trim();

  if (/^(?:🔼|🔺|⬆️?|↑)/u.test(normalized)) return "transfer";
  if (/^(?:🔽|🔻|⬇️?|↓)/u.test(normalized)) return "release";

  return null;
}

function resolveMentionUsername(message: DiscordMessage, userId: string | null) {
  if (!userId) return null;
  const user = message.mentions?.find((mention) => mention.id === userId);
  return user?.global_name || user?.username || null;
}

export function parseTransferMessage(message: DiscordMessage): DiscordTransferMovement[] {
  return message.content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .flatMap((line) => {
      const type = detectMovementType(line);
      if (!type) return [];

      const mention = line.match(DISCORD_MENTION_RE);
      const discordUserId = mention?.[1] || null;
      const steamUrl = line.match(STEAM_URL_RE)?.[0] || null;

      return [
        {
          messageId: message.id,
          messageTimestamp: message.timestamp,
          type,
          discordUserId,
          discordUsername: resolveMentionUsername(message, discordUserId),
          steamUrl,
          rawLine: line,
          approved: false,
          approvedByStaffIds: [],
        } satisfies DiscordTransferMovement,
      ];
    });
}

function hasApprovalReaction(message: DiscordMessage) {
  return Boolean(message.reactions?.some((reaction) => reaction.emoji.name === "✅" && reaction.count > 0));
}

async function getStaffApprovers(
  guildId: string,
  channelId: string,
  messageId: string,
  staffRoleIds: Set<string>,
) {
  const users = await getDiscordReactionUsers(channelId, messageId, "✅");
  const approvedBy: string[] = [];

  for (const user of users) {
    if (user.bot) continue;

    try {
      const member = await getDiscordGuildMember(guildId, user.id);
      if (member.roles.some((roleId) => staffRoleIds.has(roleId))) {
        approvedBy.push(user.id);
      }
    } catch {
      // Un usuario pudo haber abandonado el servidor. Eso no debe romper toda la sincronización.
    }
  }

  return approvedBy;
}

export async function previewDiscordTransfers(options: {
  guildId: string;
  channelId: string;
  staffRoleIds: string[];
  limit?: number;
}): Promise<DiscordTransferPreview> {
  const messages = await getDiscordChannelMessages(options.channelId, options.limit ?? 50);
  const staffRoleIds = new Set(options.staffRoleIds.filter(Boolean));
  const movements: DiscordTransferMovement[] = [];
  let messagesWithMovements = 0;
  let approvedMessages = 0;

  for (const message of messages) {
    const parsed = parseTransferMessage(message);
    if (!parsed.length) continue;

    messagesWithMovements += 1;
    let approvedByStaffIds: string[] = [];

    if (hasApprovalReaction(message)) {
      approvedByStaffIds = await getStaffApprovers(
        options.guildId,
        options.channelId,
        message.id,
        staffRoleIds,
      );
    }

    const approved = approvedByStaffIds.length > 0;
    if (approved) approvedMessages += 1;

    movements.push(
      ...parsed.map((movement) => ({
        ...movement,
        approved,
        approvedByStaffIds,
      })),
    );
  }

  return {
    messagesScanned: messages.length,
    messagesWithMovements,
    approvedMessages,
    movements,
  };
}
