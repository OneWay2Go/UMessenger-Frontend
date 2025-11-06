export const ChatType = {
  Private: 0,
  PrivateGroup: 1,
  PrivateChannel: 2,
  PublicGroup: 3,
  PublicChannel: 4,
} as const;

export type ChatType = typeof ChatType[keyof typeof ChatType];

export const MessageStatus = {
  Delivered: 1,
  Failed: 2,
  Read: 3,
} as const;

export type MessageStatus = typeof MessageStatus[keyof typeof MessageStatus];

export const ChatRole = {
  Member: 0,
  Admin: 1,
  Owner: 2,
} as const;

export type ChatRole = typeof ChatRole[keyof typeof ChatRole];

