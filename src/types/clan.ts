export interface ClanMember {
  tag: string;
  name: string;
  role: 'leader' | 'coLeader' | 'elder' | 'member';
  expLevel: number;
  trophies: number;
  clanRank: number;
  previousClanRank: number;
  donations: number;
  donationsReceived: number;
  clanChestPoints: number;
  lastSeen: string | number;
}

export interface WarLogEntry {
  seasonId: number;
  createdDate: string;
  participants: WarParticipant[];
  standings: WarStanding[];
}

export interface WarParticipant {
  tag: string;
  name: string;
  cardsEarned: number;
  battlesPlayed: number;
  wins: number;
  collectionDayBattlesPlayed: number;
  numberOfBattles: number;
}

export interface WarStanding {
  tag: string;
  name: string;
  badgeId: number;
  clanScore: number;
  participants: number;
  battlesPlayed: number;
  wins: number;
  crowns: number;
  trophyChange: number;
}

export type SortDirection = 'asc' | 'desc' | null;

export interface SortConfig {
  key: keyof ClanMember | null;
  direction: SortDirection;
}

export interface FilterConfig {
  name: string;
  role: string;
  trophies: string;
  donations: string;
  donationsReceived: string;
  clanChestPoints: string;
  lastSeen: string;
}

export const ROLE_HIERARCHY: Record<string, number> = {
  leader: 4,
  coLeader: 3,
  elder: 2,
  member: 1,
};

export const ROLE_DISPLAY: Record<string, string> = {
  leader: 'Leader',
  coLeader: 'Co-Leader',
  elder: 'Elder',
  member: 'Member',
};
