export const Role = {
  Member: 0,
  Admin: 1,
} as const;

export type Role = typeof Role[keyof typeof Role];

