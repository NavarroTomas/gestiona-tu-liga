export type DiscordUser = {
  id: string;
  username: string;
  global_name?: string | null;
  bot?: boolean;
};

export type DiscordMember = {
  user?: DiscordUser;
  roles: string[];
};

export type DiscordReaction = {
  count: number;
  emoji: {
    id?: string | null;
    name?: string | null;
  };
};

export type DiscordMessage = {
  id: string;
  channel_id: string;
  content: string;
  timestamp: string;
  author: DiscordUser;
  mentions?: DiscordUser[];
  reactions?: DiscordReaction[];
};

export type DiscordMovementType = "transfer" | "release";

export type DiscordTransferMovement = {
  messageId: string;
  messageTimestamp: string;
  type: DiscordMovementType;
  discordUserId: string | null;
  discordUsername: string | null;
  steamUrl: string | null;
  rawLine: string;
  approved: boolean;
  approvedByStaffIds: string[];
};

export type DiscordTransferPreview = {
  messagesScanned: number;
  messagesWithMovements: number;
  approvedMessages: number;
  movements: DiscordTransferMovement[];
};
