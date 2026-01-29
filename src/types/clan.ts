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
  clanChestPoints?: number;
  lastSeen: string | number;
}

export interface RiverRaceParticipant {
  tag: string;
  name: string;
  fame: number;
  repairPoints: number;
  boatAttacks: number;
  decksUsed: number;
  decksUsedToday: number;
}

export interface RiverRaceClan {
  tag: string;
  name: string;
  wins: number;
  battlesPlayed: number;
  clanScore: number;
  crowns: number;
  participants: RiverRaceParticipant[];
}

export interface RiverRaceDelta {
  tag: string;
  name: string;
  winsDelta: number;
  battlesPlayedDelta: number;
  clanScoreDelta: number;
  timestamp: number;
}

export interface UpdatesFile {
  updated: boolean;
  files: string[];
  timestamp: number;
}

export type SortDirection = 'asc' | 'desc' | null;

export interface SortConfig {
  key: keyof ClanMember | null;
  direction: SortDirection;
}

export interface RiverRaceSortConfig {
  key: keyof RiverRaceClan | null;
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

export interface RiverRaceFilterConfig {
  name: string;
  clanScore: string;
  wins: string;
  battlesPlayed: string;
  crowns: string;
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
